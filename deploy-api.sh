#!/usr/bin/env bash
# Push latest API code, then redeploy Render (required for Worksheet2 in production).
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Pushing to GitHub (sign in as kukadiyahiren if asked)…"
git -c credential.helper= push origin main

echo
echo "→ Next: redeploy the API on Render"
echo "  1. Open https://dashboard.render.com"
echo "  2. Open service: alpha25-learning-lab-1"
echo "  3. Manual Deploy → Clear build cache & deploy"
echo
echo "→ When deploy finishes, verify:"
echo "  curl -s https://alpha25-learning-lab-1.onrender.com/api/health"
echo "  curl -s https://alpha25-learning-lab-1.onrender.com/api/worksheet2/meta | head"
echo
echo "Both should succeed. Then hard-refresh https://alpha25-admin.herrytestnew.workers.dev/worksheets"
