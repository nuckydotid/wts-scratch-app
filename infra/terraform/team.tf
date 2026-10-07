/* ───────────── Team server: office, chat, design room, (later) Kanban/docs. One instance, Firestore-backed ───────────── */

# Firestore in native mode holds the team server's state. The `(default)` database is created once per project.
resource "google_firestore_database" "default" {
  name                    = "(default)"
  location_id             = var.region
  type                    = "FIRESTORE_NATIVE"
  deletion_policy         = var.deletion_protection ? "ABANDON" : "DELETE"
  delete_protection_state = var.deletion_protection ? "DELETE_PROTECTION_ENABLED" : "DELETE_PROTECTION_DISABLED"
  depends_on              = [google_project_service.enabled]
}

resource "google_service_account" "team" {
  account_id   = "team-runtime"
  display_name = "${var.slug} team server runtime"
  depends_on   = [google_project_service.enabled]
}

resource "google_project_iam_member" "team_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/logging.logWriter",
    "roles/errorreporting.writer",
    "roles/monitoring.metricWriter",
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.team.email}"
}

# HMAC secret of the repository's `pull_request` webhook (Settings → Webhooks → <team url>/hooks/github, content type JSON).
resource "random_password" "team_webhook" {
  length  = 40
  special = false
}

resource "google_secret_manager_secret" "team_webhook" {
  secret_id = "team-webhook-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "team_webhook" {
  secret      = google_secret_manager_secret.team_webhook.id
  secret_data = random_password.team_webhook.result
}

resource "google_secret_manager_secret_iam_member" "team_reads" {
  secret_id = google_secret_manager_secret.team_webhook.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.team.email}"
}

resource "google_cloud_run_v2_service" "team" {
  name                = local.team_name
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = false

  template {
    service_account                  = google_service_account.team.email
    timeout                          = "3600s" # sockets are cut after this; clients reconnect
    max_instance_request_concurrency = 250

    scaling {
      min_instance_count = var.team_min_instances
      max_instance_count = 1 # rooms live in memory, so there is exactly one instance
    }

    containers {
      image = var.team_image

      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = false # the tick loop and open sockets must keep running between requests
        startup_cpu_boost = true
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "PROJECT_REPO"
        value = var.github_repo
      }
      env {
        name  = "DESIGN_URL"
        value = local.design_url
      }
      env {
        name  = "PUBLIC_URL"
        value = local.team_url
      }
      env {
        name  = "OIDC_AUDIENCE"
        value = local.team_url # the audience scripts/ci announce steps request for their GitHub OIDC token
      }
      env {
        name = "GITHUB_WEBHOOK_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.team_webhook.secret_id
            version = "latest"
          }
        }
      }

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
    ignore_changes = [template[0].containers[0].image, client, client_version]
  }

  depends_on = [
    google_project_iam_member.team_roles,
    google_secret_manager_secret_iam_member.team_reads,
    google_secret_manager_secret_version.team_webhook,
    google_firestore_database.default,
  ]
}

# Public endpoint: every socket must present a valid Firebase ID token *and* a GitHub token with write access to the repo.
resource "google_cloud_run_v2_service_iam_member" "team_public" {
  name     = google_cloud_run_v2_service.team.name
  location = google_cloud_run_v2_service.team.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
