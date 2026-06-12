output "cloud_run_url" {
  description = "URL del servicio Cloud Run"
  value       = google_cloud_run_v2_service.api.uri
}

output "api_gateway_url" {
  description = "URL generada por API Gateway"
  value       = google_api_gateway_gateway.gateway.default_hostname
}

output "artifact_registry_repository" {
  description = "Repositorio de Artifact Registry"
  value       = google_artifact_registry_repository.repo.name
}

output "cloud_sql_connection_name" {
  description = "Connection name de Cloud SQL"
  value       = google_sql_database_instance.postgres.connection_name
}

output "uploads_bucket" {
  description = "Bucket opcional para archivos"
  value       = google_storage_bucket.uploads_bucket.name
}