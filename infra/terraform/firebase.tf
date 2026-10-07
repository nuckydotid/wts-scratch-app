/* ───────────── Firebase: sign-in (Google), Hosting for the design site, the app's web config ───────────── */

resource "google_firebase_project" "this" {
  provider   = google-beta
  project    = var.project_id
  depends_on = [google_project_service.enabled]
}

resource "google_firebase_web_app" "app" {
  provider     = google-beta
  project      = var.project_id
  display_name = var.slug
  depends_on   = [google_firebase_project.this]
}

data "google_firebase_web_app_config" "app" {
  provider   = google-beta
  project    = var.project_id
  web_app_id = google_firebase_web_app.app.app_id
}

# The design site. `scripts/ship/deploy-design.sh` also creates it when missing, so either order works.
resource "google_firebase_hosting_site" "design" {
  provider   = google-beta
  project    = var.project_id
  site_id    = local.design_site
  depends_on = [google_firebase_project.this]
}

# Not managed here, on purpose (needs an OAuth consent screen and client that only the owner can create):
#   Firebase console → Authentication → Sign-in method → Google → Enable.
