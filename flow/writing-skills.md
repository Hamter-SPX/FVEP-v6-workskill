# Writing Skills

## Why this exists

A skill is advice an agent will meet under pressure — time pressure, an
authority pushing back, sunk cost on a wrong path, a fresh context with no
memory of why the rule exists. Advice that cannot survive those conditions is
not guidance; it is decoration. The standard failure modes of skill authoring
are rules written for the author's calm afternoon rather than the reader's
storm, and metadata that summarizes the workflow instead of naming when the
skill should trigger — so a router loads the skill for the wrong task, or
never loads it at all.

So a skill in this package is a contract, not an essay. The frontmatter is a
routing surface, the body is enforced process, and the proof is behavioral:
pressure scenarios run before shipping, in fresh contexts, with and without
the guidance. `lib/skill-conformance-engine.mjs`, under
`references/skill-authoring-conformance.md`, then mechanically audits what
prose cannot guarantee — metadata shape, trigger wording, referenced files
that actually exist, pressure coverage, TDD deployment evidence. A skill that
has never watched an agent fail without it is a hypothesis, not a skill.

## When to use

- When authoring a new skill or editing an existing one: metadata, sections,
  gates, references, scenarios.
- When `flow/flow-map.json` names this doc for the resolved mode
  (author-skill).
- Before shipping any skill change: pressure scenarios come before the
  release, not after the incident.

## The flow

1. RED — prove the failure exists first. Write the pressure scenario and run
   it in a fresh context *without* the skill; record the actual baseline
   behavior, not the behavior you assume. The format lives in
   `tests/pressure-scenarios.md`: a quoted scenario, the required behaviors,
   the hard failures that disqualify any pass, and a scorecard. Guidance
   authored against an imagined failure guards nothing.

2. Author the frontmatter contract:

   ```yaml
   ---
   name: my-skill-name
   description: Use when <trigger conditions, phrased in the user's words>...
   ---
   ```

   The engine enforces the contract: `name` is lowercase letters, digits,
   and hyphens only (`SKILL_NAME_INVALID`); `description` begins with
   "Use when" (`SKILL_DESCRIPTION_TRIGGER_INVALID`), stays within 500
   characters (`SKILL_DESCRIPTION_TOO_LONG`) inside a 1024-character
   frontmatter block (`SKILL_FRONTMATTER_TOO_LONG`), and carries trigger
   conditions and keywords — never a summary of the steps. A description
   that narrates the workflow fails as `DESCRIPTION_SUMMARIZES_WORKFLOW`:
   routing needs to know *when*, the body carries *how*.

3. Write the smallest body that defeats the recorded baseline failure, and
   prefer enforcement over exhortation: an engine, schema, or test holds
   under pressure; a bolded sentence does not. Every file you reference must
   exist on disk and be named on the skill surface
   (`REQUIRED_PROCESS_REFERENCE_MISSING`,
   `REQUIRED_AESTHETIC_REFERENCE_MISSING`), placeholder language is blocked
   (`SKILL_PLACEHOLDER_LANGUAGE`), and the governed entry point must be
   documented in the text (`PROCESS_ENTRY_POINT_UNDOCUMENTED` — the audit
   looks for `process:audit`).

4. Extend the pressure scenarios before shipping. The audit requires all six
   discipline-failure categories — time pressure, authority pressure,
   sunk-cost, context-loss, review-collusion, false-completion — and reports
   the absent ones as `PRESSURE_SCENARIO_COVERAGE_INCOMPLETE`. Each new or
   edited rule needs at least one scenario that would expose its abandonment.

5. GREEN — re-run the same scenarios in fresh contexts *with* the skill
   loaded. Where the agent still fails, close the loophole with the smallest
   change to guidance or enforcement and re-run. Where the agent passes,
   verify the pass is behavior rather than politeness: every listed required
   behavior observed, zero hard failures, per the scorecard format in
   `tests/pressure-scenarios.md`.

6. Run the mechanical audit:

   ```bash
   npm run skill:conformance -- --root <skill-directory>
   ```

   The CLI (`scripts/validate-skill-conformance.mjs`) reads the SKILL
   surface, the process pressure scenarios, the TDD evidence record, the
   adaptation matrix, and the package identity from that root, walks every
   referenced path, and exits non-zero on any blocker. The report's
   `coverage` percentages and `missing` lists name exactly what is absent.

7. Record the deployment evidence. The TDD record must show an observed RED
   baseline and a passing GREEN (`TDD_RED_EVIDENCE_MISSING`,
   `TDD_GREEN_EVIDENCE_MISSING`); the adaptation matrix must cover every
   installed Superpowers skill (`SUPERPOWERS_ADAPTATION_INCOMPLETE`); the
   package identity and its required CLI scripts must check out
   (`PACKAGE_IDENTITY_INVALID`, `PROCESS_CLI_SURFACE_INCOMPLETE`).

8. Ship on behavior, not on lint. `references/skill-authoring-conformance.md`
   is explicit: static conformance does not substitute for repeated
   independent-agent pressure runs. Both gates green, or not shipped.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Baseline RED recorded | pressure scenario + fresh-context run without the skill | the actual failure behavior is captured before any guidance is written |
| Frontmatter contract | `lib/skill-conformance-engine.mjs` | valid `name`; description starts with "Use when", within 500 characters, trigger conditions only — no workflow summary |
| References real | `npm run skill:conformance -- --root <skill-directory>` | every referenced path exists on disk and is named on the skill surface |
| Pressure coverage | scenarios in the `tests/pressure-scenarios.md` format | all six categories present: time, authority, sunk-cost, context-loss, review-collusion, false-completion |
| GREEN re-runs | fresh-context runs with the skill loaded | every required behavior observed, zero hard failures, loopholes closed and re-tested |
| Conformance clean | `npm run skill:conformance -- --root <skill-directory>` | exit 0 — no `SKILL_*`, `REQUIRED_*`, `PRESSURE_*`, or `TDD_*` findings; coverage sections at 100 |
| Deployment evidence | TDD record (`tests/TDD_EVIDENCE_V4.md`, read by the CLI) | RED baseline and GREEN result both present; adaptation matrix complete; package identity valid |

## Anti-patterns

- Do not author a skill from taste and then hunt for a scenario that flatters
  it — scenario first, guidance second, or the skill decorates a failure
  nobody ever verified.
- Do not summarize the workflow in the description; a router reading steps
  learns nothing about when to load the skill, and the engine blocks the
  attempt.
- Do not stack bold prose where a check belongs: if a rule matters, an
  engine, schema, or test enforces it — otherwise what you wrote is a wish.
- Do not reference files that do not exist, or rename reference docs without
  updating the skill surface; the audit walks every path and counts.
- Do not declare GREEN on one friendly run — fresh contexts, repeated
  independent runs, all six pressure categories. A skill that passes only in
  its author's session is self-review, and self-review is forbidden here.
- Do not retro-fit TDD evidence after shipping; the RED baseline comes from
  the run before the guidance existed — a baseline written afterwards is a
  story, not evidence.
