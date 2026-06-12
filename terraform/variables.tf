variable "project_id" {
  description = "ID del proyecto en Google Cloud"
  type        = string
}

variable "region" {
  description = "Region de despliegue"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Nombre del servicio Cloud Run"
  type        = string
  default     = "api-backend-solid"
}

variable "artifact_registry_name" {
  description = "Nombre del repositorio Artifact Registry"
  type        = string
  default     = "api-backend-repo"
}

variable "db_instance_name" {
  description = "Nombre de la instancia Cloud SQL PostgreSQL"
  type        = string
  default     = "api-backend-db"
}

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL"
  type        = string
  default     = "api_backend_solid"
}

variable "db_user" {
  description = "Usuario de PostgreSQL"
  type        = string
  default     = "api_user"
}

variable "db_password" {
  description = "Password de PostgreSQL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secreto JWT"
  type        = string
  sensitive   = true
}

variable "image_url" {
  description = "URL de la imagen Docker en Artifact Registry"
  type        = string
}