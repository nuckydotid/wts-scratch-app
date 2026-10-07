output "api_staging_url" {
  description = "Cloud Run URL of the staging API."
  value       = local.api_url["staging"]
}

output "api_prod_url" {
  description = "Cloud Run URL of the production API: set api.url in project.config.json."
  value       = local.api_url["prod"]
}

output "team_url" {
  description = "Cloud Run URL of the team server: set designRoom.studioUrl in project.config.json and the STUDIO_URL repository variable."
  value       = local.team_url
}

output "design_url" {
  description = "The design site (Firebase Hosting)."
  value       = local.design_url
}

output "buckets" {
  description = "Per-environment bucket for uploads, OTA bundles and remote assets (assets/ prefix)."
  value       = { for k, b in google_storage_bucket.files : k => b.name }
}

output "db_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "ota_script_token_secrets" {
  description = "Per-environment secret holding the token scripts/ota/publish.ts sends as OTA_SCRIPT_TOKEN."
  value       = { for k, s in google_secret_manager_secret.ota_script_token : k => s.secret_id }
}

output "team_webhook_secret" {
  description = "Secret Manager id of the HMAC secret to paste into the repository webhook (payload URL <team_url>/hooks/github)."
  value       = google_secret_manager_secret.team_webhook.secret_id
}

# Firebase web config (public values): firebase.apiKey / firebase.appId in project.config.json.
output "firebase_web_config" {
  value = {
    apiKey     = data.google_firebase_web_app_config.app.api_key
    appId      = google_firebase_web_app.app.app_id
    authDomain = data.google_firebase_web_app_config.app.auth_domain
    projectId  = var.project_id
  }
}

# Repository variables for .github/workflows (Worktrees Studio sets these for you):
output "GCP_WIF_PROVIDER" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "GCP_DEPLOY_SA" {
  description = "Design site (Firebase Hosting) deployer."
  value       = google_service_account.deployer.email
}

output "GCP_DEPLOY_SA_STAGING" {
  description = "Deploys api-staging; only workflows running on refs/heads/staging may use it."
  value       = google_service_account.deploy["staging"].email
}

output "GCP_DEPLOY_SA_PROD" {
  description = "Deploys api-prod and the team server; only workflows running on refs/heads/main may use it."
  value       = google_service_account.deploy["prod"].email
}
