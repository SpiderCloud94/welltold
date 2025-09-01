#!/usr/bin/env bash
set -e
BAD=$(git diff --cached --name-only | grep -E '(\.tsx|\.ts)$' | grep -v '^lib/theme.ts$' | xargs -I {} grep -HnE '#[0-9A-Fa-f]{3,6}\b' {} || true)
[ -n "$BAD" ] && { echo "❌ Raw hex found outside lib/theme.ts:"; echo "$BAD"; exit 1; }
