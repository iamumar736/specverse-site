#!/usr/bin/env bash
# Safely publish verified data updates from a scheduled GitHub Actions job.
# Shared workflow concurrency prevents most races; a rebase handles unrelated
# commits without force-pushing, and conflicts fail rather than losing records.
set -euo pipefail
if [[ $# -lt 2 ]]; then
  echo "Usage: bash scripts/publish-data.sh 'Commit message' path ..." >&2
  exit 2
fi
message="$1"; shift
git config user.name "specverse-data-bot[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A -- "$@"
if git diff --cached --quiet; then
  echo "No verified data changes to publish"
  exit 0
fi
git commit -m "$message"
for attempt in 1 2 3 4 5; do
  git fetch origin main
  if ! git rebase origin/main; then
    git rebase --abort || true
    echo "::error::Concurrent data changes could not be reconciled safely; preserving upstream records and stopping" >&2
    exit 1
  fi
  if git push origin HEAD:main; then
    echo "Published data updates to main"
    exit 0
  fi
  sleep "$((attempt * 3))"
done
echo "::error::Failed to publish data after five safe retries" >&2
exit 1
