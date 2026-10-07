data "google_project" "this" {}

locals {
  # Two API environments in one project: separate Cloud Run services, runtime identities, secrets and buckets,
  # one Cloud SQL instance with a database and a user per environment (keeps the owner's bill low).
  envs = {
    staging = { min = 0, max = 2 }
    prod    = { min = var.min_instances, max = var.max_instances }
  }

  api_name = { for k, _ in local.envs : k => "${var.slug}-api-${k}" }
  # Deterministic Cloud Run URLs: they are the OIDC audience of the Scheduler jobs and `SERVICE_URL` of the services, and
  # referencing a service's own `uri` from its env would be circular.
  api_url     = { for k, n in local.api_name : k => "https://${n}-${data.google_project.this.number}.${var.region}.run.app" }
  team_name   = "${var.slug}-team"
  team_url    = "https://${local.team_name}-${data.google_project.this.number}.${var.region}.run.app"
  design_site = "${var.slug}-design"
  design_url  = "https://${local.design_site}.web.app"

  services = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com", # scripts/ship/deploy-service.sh builds there by default (CI builds on its own runner)
    "cloudscheduler.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "clouderrorreporting.googleapis.com",
  ]
}

resource "google_project_service" "enabled" {
  for_each           = toset(local.services)
  service            = each.value
  disable_on_destroy = false
}

/* ───────────── Images ───────────── */

resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "images"
  format        = "DOCKER"
  description   = "API and team-server images"
  depends_on    = [google_project_service.enabled]
}

/* ───────────── Cloud SQL (Postgres): one instance, a database + user per environment ───────────── */

resource "google_sql_database_instance" "main" {
  name                = "${var.slug}-pg"
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = var.deletion_protection

  settings {
    tier    = var.db_tier
    edition = "ENTERPRISE"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }
    ip_configuration {
      ipv4_enabled = true # reached only through the Cloud SQL connector (IAM + TLS); no authorized networks
    }
    insights_config {
      query_insights_enabled = true
    }
  }
  depends_on = [google_project_service.enabled]
}

resource "random_password" "db" {
  for_each = local.envs
  length   = 32
  special  = false
}

resource "google_sql_database" "env" {
  for_each = local.envs
  name     = each.key
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "env" {
  for_each = local.envs
  name     = "app_${each.key}"
  instance = google_sql_database_instance.main.name
  password = random_password.db[each.key].result
}

/* ───────────── Per-environment storage and secrets ───────────── */

# Uploads, OTA bundles and remote assets. Reads go through signed URLs.
resource "google_storage_bucket" "files" {
  for_each                    = local.envs
  name                        = "${var.project_id}-${var.slug}-ota-${each.key}"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = !var.deletion_protection
  depends_on                  = [google_project_service.enabled]
}

resource "google_secret_manager_secret" "database_url" {
  for_each  = local.envs
  secret_id = "database-url-${each.key}"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "database_url" {
  for_each = local.envs
  secret   = google_secret_manager_secret.database_url[each.key].id
  # The Cloud Run Cloud SQL volume exposes a unix socket at /cloudsql/<connection name>; `pg` reads `host` from the query.
  secret_data = "postgres://app_${each.key}:${random_password.db[each.key].result}@/${each.key}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}

resource "random_password" "ota_token" {
  for_each = local.envs
  length   = 40
  special  = false
}

resource "google_secret_manager_secret" "ota_script_token" {
  for_each  = local.envs
  secret_id = "ota-script-token-${each.key}"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "ota_script_token" {
  for_each    = local.envs
  secret      = google_secret_manager_secret.ota_script_token[each.key].id
  secret_data = random_password.ota_token[each.key].result
}

# The OneSignal REST API key is a vendor secret: add the first version yourself
#   printf '%s' "$KEY" | gcloud secrets versions add onesignal-api-key-prod --data-file=-
resource "google_secret_manager_secret" "onesignal_api_key" {
  for_each  = local.envs
  secret_id = "onesignal-api-key-${each.key}"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

/* ───────────── Runtime identities (least privilege, one per environment) ───────────── */

resource "google_service_account" "api" {
  for_each     = local.envs
  account_id   = "api-runtime-${each.key}"
  display_name = "${var.slug} API runtime (${each.key})"
  depends_on   = [google_project_service.enabled]
}

resource "google_project_iam_member" "api_roles" {
  for_each = {
    for p in setproduct(keys(local.envs), [
      "roles/cloudsql.client",
      "roles/logging.logWriter",
      "roles/errorreporting.writer",
      "roles/monitoring.metricWriter",
    ]) : "${p[0]}/${p[1]}" => { env = p[0], role = p[1] }
  }
  project = var.project_id
  role    = each.value.role
  member  = "serviceAccount:${google_service_account.api[each.value.env].email}"
}

resource "google_storage_bucket_iam_member" "api_files" {
  for_each = local.envs
  bucket   = google_storage_bucket.files[each.key].name
  role     = "roles/storage.objectAdmin"
  member   = "serviceAccount:${google_service_account.api[each.key].email}"
}

# V4 signed URLs from Cloud Run (no key file): the service signs through IAM as itself.
resource "google_service_account_iam_member" "api_signs_as_itself" {
  for_each           = local.envs
  service_account_id = google_service_account.api[each.key].name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.api[each.key].email}"
}

# An environment reads only its own secrets: a compromised staging service cannot read production credentials.
resource "google_secret_manager_secret_iam_member" "api_reads" {
  for_each = {
    for p in setproduct(keys(local.envs), ["database_url", "ota_script_token", "onesignal_api_key"]) : "${p[0]}/${p[1]}" => {
      env    = p[0]
      secret = p[1] == "database_url" ? google_secret_manager_secret.database_url[p[0]].id : p[1] == "ota_script_token" ? google_secret_manager_secret.ota_script_token[p[0]].id : google_secret_manager_secret.onesignal_api_key[p[0]].id
    }
  }
  secret_id = each.value.secret
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.api[each.value.env].email}"
}

/* ───────────── Cloud Run: the API, staging and prod (REST + WebSocket chat) ───────────── */

resource "google_cloud_run_v2_service" "api" {
  for_each            = local.envs
  name                = local.api_name[each.key]
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = false

  template {
    service_account                  = google_service_account.api[each.key].email
    timeout                          = "3600s" # WebSockets are cut after this; the client reconnects
    session_affinity                 = true
    max_instance_request_concurrency = 250

    scaling {
      min_instance_count = each.value.min
      max_instance_count = each.value.max
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }

    containers {
      image = var.image

      ports {
        container_port = 8080
      }
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = false # sockets and the LISTEN connection stay alive between requests
        startup_cpu_boost = true
      }

      env {
        name  = "APP_ENV"
        value = each.key
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "OTA_BUCKET"
        value = google_storage_bucket.files[each.key].name
      }
      env {
        name  = "SERVICE_URL"
        value = local.api_url[each.key]
      }
      env {
        name  = "SCHEDULER_SA_EMAIL"
        value = google_service_account.scheduler.email
      }
      env {
        name  = "ONESIGNAL_APP_ID"
        value = var.onesignal_app_id
      }
      env {
        name  = "CORS_ORIGINS"
        value = join(",", var.cors_origins)
      }
      env {
        name  = "CHAT_RETENTION_DAYS"
        value = tostring(var.chat_retention_days)
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url[each.key].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "OTA_SCRIPT_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.ota_script_token[each.key].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "ONESIGNAL_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.onesignal_api_key[each.key].secret_id
            version = "latest"
          }
        }
      }

      # TCP, not /healthz: the placeholder image of the first apply has no such route. The API itself answers /healthz.
      startup_probe {
        tcp_socket {
          port = 8080
        }
        period_seconds    = 3
        failure_threshold = 20
      }
    }
  }

  lifecycle {
    # CI rolls new images; Terraform owns everything else.
    ignore_changes = [template[0].containers[0].image, client, client_version]
  }

  depends_on = [
    google_project_iam_member.api_roles,
    google_secret_manager_secret_iam_member.api_reads,
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_version.ota_script_token,
    google_sql_user.env,
    google_sql_database.env,
  ]
}

# Public endpoint: every REST call and WebSocket must still present a valid Firebase ID token.
resource "google_cloud_run_v2_service_iam_member" "api_public" {
  for_each = local.envs
  name     = google_cloud_run_v2_service.api[each.key].name
  location = google_cloud_run_v2_service.api[each.key].location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

/* ───────────── Cloud Scheduler → /internal/cron/* ───────────── */

resource "google_service_account" "scheduler" {
  account_id   = "scheduler"
  display_name = "${var.slug} Cloud Scheduler"
  depends_on   = [google_project_service.enabled]
}

resource "google_cloud_scheduler_job" "chat_retention" {
  for_each  = local.envs
  name      = "${var.slug}-chat-retention-${each.key}"
  region    = var.region
  schedule  = "17 3 * * *"
  time_zone = "Etc/UTC"

  http_target {
    http_method = "POST"
    uri         = "${local.api_url[each.key]}/internal/cron/chat-retention"
    oidc_token {
      service_account_email = google_service_account.scheduler.email
      audience              = local.api_url[each.key]
    }
  }
  depends_on = [google_project_service.enabled]
}
