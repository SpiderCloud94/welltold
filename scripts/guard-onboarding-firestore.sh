#!/usr/bin/env bash
set -e
BAD=$(git diff --cached --name-only | grep -E '^app/\(public\)/onboarding/.*\.(ts|tsx)$' | xargs -I {} grep -HnE 'from ["'\''](firebase\/firestore|@react-native-firebase\/firestore)["'\'']' {} || true)
[ -n "$BAD" ] && { echo "❌ Firestore import found in onboarding files:"; echo "$BAD"; exit 1; }
