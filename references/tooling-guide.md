# Tooling Guide

## Installation

```bash
npm install
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
```

Run commands from the suite directory, or install the package scripts into the target repository.

## Reference Sources

### Live reference

Set `referenceBaseUrl` or pass `--base-url`:

```bash
npm run capture -- --config vision-loop.config.json --mode reference --base-url http://127.0.0.1:4000
```

### Image reference

Place images in the configured output directory:

```text
artifacts/vision-loop/reference/<route>__<viewport>__<state>.png
```

Names are normalized to lowercase ASCII with hyphens.

## Current Evidence

```bash
npm run capture -- --config vision-loop.config.json --mode current
npm run inspect -- --config vision-loop.config.json
npm run audit:a11y -- --config vision-loop.config.json
npm run compare -- --config vision-loop.config.json
npm run engineering -- --config vision-loop.config.json
```

Or run:

```bash
npm run vision-loop -- --config vision-loop.config.json
```

## Filters

Capture or inspect a subset:

```bash
npm run vision-loop -- --config vision-loop.config.json --route dashboard --viewport mobile --state error
```

Use `--case dashboard__mobile__error` for one exact case.

## State Setup

A state can define:

- Query parameters
- Local and session storage
- Cookies
- Action sequence
- Ready selector or ready expression
- Settle delay
- Selector masks
- Rectangular diff masks
- Additional inspection selectors

Configuration is trusted local input. The `evaluate` action and ready expressions execute code in the page; do not run untrusted configuration.

## Mask Policy

1. Stabilize fixtures, time, randomness, fonts, images, and animation.
2. Use selector masks for elements that remain irreducibly dynamic.
3. Use rectangular diff masks only when a stable selector is impossible.
4. Keep masks narrow.
5. Document why every mask exists.
6. Never mask primary content or broad mismatch regions to force a pass.

## Reports

The default output contains:

```text
reference/       baseline PNGs
current/         current PNGs
diff/            diagnostic PNGs
metadata/        capture context
runtime/         console/page/network evidence
inspection/      DOM, style, token, heading, overflow evidence
accessibility/   axe and keyboard probe evidence
reports/         HTML comparison and run summaries
```

## Exit Codes

Commands return nonzero when their automated gate fails. A zero exit code still requires semantic visual review.
