#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

node_major="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$node_major" -lt 20 ]; then
  echo "Node.js 20 or newer is required." >&2
  exit 1
fi

if [ -f package-lock.json ]; then
  npm ci --ignore-scripts --no-audit --no-fund
else
  npm install --ignore-scripts --no-audit --no-fund
fi

npx playwright install chromium

if [ ! -f vision-loop.config.json ]; then
  cp vision-loop.config.example.json vision-loop.config.json
fi
if [ ! -f process.config.json ]; then
  cp examples/process/process.config.json process.config.json
fi
if [ ! -f fullstack.config.json ]; then
  cp fullstack.config.example.json fullstack.config.json
fi

npm run validate
cat <<'MESSAGE'
Full-Stack Vision Engineering Pro v4 is installed and statically validated.
Next steps:
  1. Edit process.config.json and replace example process contracts with current evidence.
  2. Edit vision-loop.config.json for rendered frontend evidence.
  3. Edit fullstack.config.json and replace example domain paths with project artifacts.
  4. Run: npm run process:audit -- --config process.config.json
  5. Start the target application when browser evidence is required.
  6. Run: npm run vision-loop -- --config vision-loop.config.json
  7. Run: npm run audit:fullstack -- --config fullstack.config.json
MESSAGE
