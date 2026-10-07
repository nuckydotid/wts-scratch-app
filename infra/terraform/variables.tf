variable "project_id" {
  description = "Google Cloud project of this app (the same id as gcp.projectId in project.config.json). One project holds every environment."
  type        = string
}

variable "region" {
  description = "Region for Cloud Run, Cloud SQL, Artifact Registry, Firestore and the buckets."
  type        = string
  default     = "us-central1"
}

variable "slug" {
  description = "Project slug (slug in project.config.json). Names the services, buckets and the design site."
  type        = string
}

variable "github_repo" {
  description = "owner/name of the GitHub repository. Its workflows deploy from protected branches (Workload Identity Federation) and its collaborators are the team."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repo))
    error_message = "github_repo must look like owner/name."
  }
}

variable "image" {
  description = "Placeholder image for the API services on first apply; CI (or scripts/ship/deploy-service.sh) replaces it."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "team_image" {
  description = "Placeholder image for the team server on first apply."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "onesignal_app_id" {
  description = "OneSignal app id (public). The REST API keys go into the `onesignal-api-key-<env>` secrets after the first apply."
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Browser origins allowed to call the APIs (a web build of the app). Native apps need none."
  type        = list(string)
  default     = []
}

variable "db_tier" {
  description = "Cloud SQL machine tier. One instance serves the `staging` and `prod` databases."
  type        = string
  default     = "db-f1-micro"
}

variable "min_instances" {
  description = "Cloud cost knob: minimum instances of the PRODUCTION API (staging always scales to zero). 0 scales to zero; chat sockets reconnect after a cold start."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum instances of the production API (staging is capped at 2). Chat fan-out across instances uses Postgres LISTEN/NOTIFY."
  type        = number
  default     = 5
}

variable "team_min_instances" {
  description = "Minimum instances of the team server. It keeps the office and design rooms in memory and holds WebSockets, so 1 keeps it warm (a small always-on cost); 0 drops everyone's sockets whenever it scales to zero."
  type        = number
  default     = 1
}

variable "chat_retention_days" {
  description = "Delete API chat messages older than this many days (0 keeps everything)."
  type        = number
  default     = 0
}

variable "deletion_protection" {
  description = "Protect Cloud SQL and the buckets from `terraform destroy`. Set false only for a scratch project you intend to tear down."
  type        = bool
  default     = true
}
