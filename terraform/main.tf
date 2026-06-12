resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "apigateway.googleapis.com",
    "servicecontrol.googleapis.com",
    "servicemanagement.googleapis.com",
    "logging.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ])

  project = var.project_id
  service = each.key

  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "repo" {
  depends_on = [google_project_service.services]

  location      = var.region
  repository_id = var.artifact_registry_name
  description   = "Repositorio Docker para la API backend"
  format        = "DOCKER"
}

resource "google_sql_database_instance" "postgres" {
  depends_on = [google_project_service.services]

  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled = true
    }

    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-api-sa"
  display_name = "Cloud Run API Service Account"
}

resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_project_iam_member" "cloud_run_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret" "database_url" {
  depends_on = [google_project_service.services]

  secret_id = "DATABASE_URL"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url_version" {
  secret = google_secret_manager_secret.database_url.id

  secret_data = "postgresql://${var.db_user}:${var.db_password}@/${var.db_name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}

resource "google_secret_manager_secret" "jwt_secret" {
  depends_on = [google_project_service.services]

  secret_id = "JWT_SECRET"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

resource "google_storage_bucket" "uploads_bucket" {
  depends_on = [google_project_service.services]

  name                        = "${var.project_id}-api-uploads"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

resource "google_cloud_run_v2_service" "api" {
  depends_on = [
    google_project_service.services,
    google_artifact_registry_repository.repo,
    google_sql_database_instance.postgres,
    google_secret_manager_secret_version.database_url_version,
    google_secret_manager_secret_version.jwt_secret_version
  ]

  name     = var.service_name
  location = var.region

  template {
    service_account = google_service_account.cloud_run_sa.email

    containers {
      image = var.image_url

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name = "DATABASE_URL"

        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_SECRET"

        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
    }

    volumes {
      name = "cloudsql"

      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.api.location
  service  = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

locals {
  openapi_spec = <<-EOT
swagger: '2.0'
info:
  title: API Backend Solid Gateway
  description: API Gateway para Cloud Run
  version: 1.0.0
schemes:
  - https
produces:
  - application/json
paths:
  /:
    get:
      operationId: root
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/auth/register:
    post:
      operationId: register
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/auth/login:
    post:
      operationId: login
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/usuarios:
    get:
      operationId: getUsuarios
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
    post:
      operationId: createUsuario
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/usuarios/{id}:
    get:
      operationId: getUsuarioById
      parameters:
        - name: id
          in: path
          required: true
          type: string
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
    put:
      operationId: updateUsuario
      parameters:
        - name: id
          in: path
          required: true
          type: string
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
    delete:
      operationId: deleteUsuario
      parameters:
        - name: id
          in: path
          required: true
          type: string
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/usuarios/{id}/archivo:
    patch:
      operationId: updateUsuarioArchivo
      parameters:
        - name: id
          in: path
          required: true
          type: string
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/upload:
    post:
      operationId: uploadFile
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
  /api/upload/{filename}:
    delete:
      operationId: deleteFile
      parameters:
        - name: filename
          in: path
          required: true
          type: string
      x-google-backend:
        address: ${google_cloud_run_v2_service.api.uri}
      responses:
        '200':
          description: OK
EOT
}

resource "google_api_gateway_api" "api_gateway" {
  provider = google-beta

  api_id       = "api-backend-solid-gateway-api"
  display_name = "API Backend Solid Gateway"
}

resource "google_api_gateway_api_config" "api_config" {
  provider = google-beta

  api      = google_api_gateway_api.api_gateway.api_id
  api_config_id_prefix = "api-backend-solid-config-"
  display_name         = "API Backend Solid Gateway Config"

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = base64encode(local.openapi_spec)
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "gateway" {
  provider = google-beta

  gateway_id   = "api-backend-solid-gateway"
  api_config   = google_api_gateway_api_config.api_config.id
  display_name = "API Backend Solid Gateway"
  region       = var.region

  depends_on = [google_api_gateway_api_config.api_config]
}