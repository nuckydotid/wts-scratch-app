#!/usr/bin/env bash
# Protect `main` and `staging` so nothing reaches an environment without the project owner's review, and create
# `.github/CODEOWNERS` (owner reviews everything). Needs `gh auth login` as a repository ADMIN.
#
#   bash scripts/ship/protect-branches.sh <owner/repo> [owner-handle]
#
# The owner (admin) can still merge their own pull requests (enforce_admins is off, since nobody else can approve them);
# collaborators with write access cannot push to either branch, and need an approving review from the code owner.
# Branch protection on PRIVATE repositories requires GitHub Pro/Team/Enterprise; on a free plan GitHub answers 403 and
# this script says so (use a public repository, or upgrade).
set -euo pipefail
REPO="${1:?usage: $0 <owner/repo> [owner-handle]}"
OWNER_HANDLE="${2:-${REPO%%/*}}"
CHECKS="${REQUIRED_CHECKS:-checks}"   # job names of .github/workflows/quality-gates.yml

default_branch="$(gh api "repos/$REPO" --jq .default_branch)"
[ "$default_branch" = main ] || { echo "default branch is '$default_branch', expected main" >&2; exit 1; }

# staging branches off main when it does not exist yet (the API staging environment deploys from it).
if ! gh api "repos/$REPO/branches/staging" >/dev/null 2>&1; then
  sha="$(gh api "repos/$REPO/git/ref/heads/main" --jq .object.sha)"
  gh api -X POST "repos/$REPO/git/refs" -f ref=refs/heads/staging -f sha="$sha" >/dev/null
  echo "created branch staging from main"
fi

# CODEOWNERS must exist before the code-owner rule is switched on.
if ! gh api "repos/$REPO/contents/.github/CODEOWNERS" >/dev/null 2>&1; then
  body="$(printf '# Everything needs the project owner'"'"'s review.\n* @%s\n' "$OWNER_HANDLE" | base64 | tr -d '\n')"
  gh api -X PUT "repos/$REPO/contents/.github/CODEOWNERS" -f message="chore: add CODEOWNERS" -f content="$body" -f branch=main >/dev/null
  echo "added .github/CODEOWNERS (* @$OWNER_HANDLE)"
fi

contexts="$(printf '%s' "$CHECKS" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.stringify(s.split(',').map(x=>x.trim()).filter(Boolean))))")"
for branch in main staging; do
  if ! out="$(gh api -X PUT "repos/$REPO/branches/$branch/protection" --input - 2>&1 <<JSON
{
  "required_status_checks": { "strict": true, "contexts": $contexts },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "require_code_owner_reviews": true, "dismiss_stale_reviews": true },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  )"; then
    case "$out" in
      *"Upgrade to GitHub Pro"*|*"private repositories"*|*"HTTP 403"*) echo "GitHub refused: branch protection on private repositories needs a paid plan. Make the repository public or upgrade." >&2 ;;
      *) echo "$out" >&2 ;;
    esac
    exit 1
  fi
  echo "protected $branch"
done
