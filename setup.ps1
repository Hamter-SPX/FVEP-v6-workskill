$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$major = [int](node -p "process.versions.node.split('.')[0]")
if ($major -lt 20) {
    throw 'Node.js 20 or newer is required.'
}

if (Test-Path 'package-lock.json') {
    npm ci --ignore-scripts --no-audit --no-fund
} else {
    npm install --ignore-scripts --no-audit --no-fund
}

npx playwright install chromium

if (-not (Test-Path 'vision-loop.config.json')) {
    Copy-Item 'vision-loop.config.example.json' 'vision-loop.config.json'
}
if (-not (Test-Path 'process.config.json')) {
    Copy-Item 'examples/process/process.config.json' 'process.config.json'
}
if (-not (Test-Path 'fullstack.config.json')) {
    Copy-Item 'fullstack.config.example.json' 'fullstack.config.json'
}

npm run validate
Write-Host 'Full-Stack Vision Engineering Pro v4 is installed and statically validated.'
Write-Host 'Edit process.config.json, vision-loop.config.json, and fullstack.config.json; then run process:audit, vision-loop, and audit:fullstack.'
