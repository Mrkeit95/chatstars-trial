#!/bin/bash
# Double-click this file (or run it) to push the ChatStars apps to GitHub.
cd "$(dirname "$0")" || exit 1
echo "Pushing ChatStars (trial + recruitment) to GitHub..."
git add -A
git commit -m "Add Chat Trial Hub + sync latest Chat Trial"
git push origin main
echo ""
echo "Done. You can close this window."
