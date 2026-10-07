/* ───────────── CI: GitHub Actions deploys without any key, and only from protected branches ───────────── */

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"
  depends_on                = [google_project_service.enabled]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
    "attribute.ref"              = "assertion.ref"
  }
  # Only this repository may exchange its OIDC token.
  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

locals {
  repo_principal = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
  ref_principal  = { for b in ["staging", "main"] : b => "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.ref/refs/heads/${b}" }
}

/* Design site: any workflow of the repo (pull request previews need it). Hosting only. */

resource "google_service_account" "deployer" {
  account_id   = "ci-deployer"
  display_name = "${var.slug} CI deployer (design site)"
  depends_on   = [google_project_service.enabled]
}

resource "google_project_iam_member" "deployer_roles" {
  for_each = toset([
    "roles/firebasehosting.admin",             # preview channels and live deploys
    "roles/serviceusage.serviceUsageConsumer", # the Firebase CLI calls APIs on the project's behalf
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_iam_member" "github_impersonates_deployer" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.repo_principal
}

/* Services: one deployer per target, each bound to the branch it may deploy from.
 *   deploy-staging  ← refs/heads/staging   → api-staging
 *   deploy-prod     ← refs/heads/main      → api-prod and the team server
 * Combined with branch protection on both branches, nothing reaches an environment without the owner's review. */

locals {
  deployers = {
    staging = { branch = "staging", services = { api_staging = google_cloud_run_v2_service.api["staging"] }, runtime = [google_service_account.api["staging"]] }
    prod    = { branch = "main", services = { api_prod = google_cloud_run_v2_service.api["prod"], team = google_cloud_run_v2_service.team }, runtime = [google_service_account.api["prod"], google_service_account.team] }
  }
}

resource "google_service_account" "deploy" {
  for_each     = local.deployers
  account_id   = "deploy-${each.key}"
  display_name = "${var.slug} CI deployer (${each.key})"
  depends_on   = [google_project_service.enabled]
}

resource "google_service_account_iam_member" "github_impersonates_deploy" {
  for_each           = local.deployers
  service_account_id = google_service_account.deploy[each.key].name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.ref_principal[each.value.branch]
}

resource "google_project_iam_member" "deploy_usage" {
  for_each = local.deployers
  project  = var.project_id
  role     = "roles/serviceusage.serviceUsageConsumer"
  member   = "serviceAccount:${google_service_account.deploy[each.key].email}"
}

resource "google_artifact_registry_repository_iam_member" "deploy_push" {
  for_each   = local.deployers
  location   = google_artifact_registry_repository.images.location
  repository = google_artifact_registry_repository.images.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deploy[each.key].email}"
}

# May update only its own services (not every service of the project).
resource "google_cloud_run_v2_service_iam_member" "deploy_run" {
  for_each = merge([for env, d in local.deployers : { for k, svc in d.services : "${env}/${k}" => { env = env, svc = svc } }]...)
  name     = each.value.svc.name
  location = each.value.svc.location
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.deploy[each.value.env].email}"
}

# Deploying a revision means acting as the service's runtime identity.
resource "google_service_account_iam_member" "deploy_act_as" {
  for_each           = merge([for env, d in local.deployers : { for sa in d.runtime : "${env}/${sa.account_id}" => { env = env, sa = sa } }]...)
  service_account_id = each.value.sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deploy[each.value.env].email}"
}
