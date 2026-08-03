# GitHub Actions — Full-Stack Evidence Gate

The template at `.github/workflows/fullstack-evidence-gate.yml` separates three concerns:

1. **Suite integrity** — syntax, schemas, unit tests, CLI surface, and packaged examples.
2. **Contract evidence** — experience, API compatibility, architecture, migrations, security, resilience, observability, dependency integrity, and risk register.
3. **Browser evidence** — optional Playwright-based frontend vision and accessibility checks against a running application.

## Required repository adaptation

- Set `SUITE_DIR` to the directory containing this package.
- Place the project contract at `fullstack.config.json` and the browser matrix at `vision-loop.config.json`, or update the workflow paths.
- Ensure the application install/start commands match the repository.
- Set repository variable `RUN_FRONTEND_VISION=true` only when the workflow can start the target application deterministically.
- Commit the project lockfile. The dependency gate verifies npm lockfile consistency when `package-lock.json` or `npm-shrinkwrap.json` is used.
- Store secrets in the CI secret store. Do not place secret values in contract files or uploaded artifacts.

## Release policy

The contract gate and browser gate are intentionally independent. A high visual score cannot override a breaking API change, unsafe migration, missing authorization evidence, or an unverified lockfile. Conversely, a secure backend cannot compensate for a broken primary user flow.

For protected releases, require the `validate-suite` and `fullstack-contract-gate` jobs. Require `frontend-browser-evidence` when the change affects a rendered surface and a deterministic target can be launched.

## Direction confirm gate (no browser)

When a pull request changes UI surfaces, require a confirmed visual direction before merge:

```yaml
  direction-confirm-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install suite dependencies
        working-directory: ${{ env.SUITE_DIR }}
        run: npm install --ignore-scripts --no-audit --no-fund
      - name: Require confirmed visual-direction-spec
        working-directory: ${{ env.SUITE_DIR }}
        run: npm run direction:gate -- --dir .. --check-sync
```

`direction:gate` fails when `design/visual-direction-spec.md` is missing, still marked ปรับต่อ/เลือกใหม่, or (with `--check-sync`) drifted from `aesthetic-profile.json`. It does not launch a browser.
