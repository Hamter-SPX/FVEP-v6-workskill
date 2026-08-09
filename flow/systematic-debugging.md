# Systematic Debugging

## Why this exists

Most broken fixes are written in the first five minutes: read the error,
pattern-match to a bug seen once before, change code, watch one test go
green, move on. The symptom quiets down, the defect relocates, and the team
inherits a patch that encodes a guess nobody wrote down. Six weeks later the
next person is debugging the fix, not the bug — and the original defect is
still alive underneath both. Debugging by intuition is how one defect becomes
two.

This flow replaces intuition with a governed experiment. A debug session is a
record — stabilized reproduction, boundary evidence, one falsifiable
hypothesis, one-variable experiments, a verified fix — and
`lib/debug-session-engine.mjs`, under the rules in
`references/scientific-debugging-protocol.md`, audits that record the way a
reviewer audits code. It blocks sessions with unstabilized reproduction
(`REPRODUCTION_NOT_STABILIZED`), sessions testing more than one hypothesis at
once (`MULTIPLE_ACTIVE_HYPOTHESES`), experiments that change several
variables (`EXPERIMENT_NOT_MINIMAL`), and fixes with no confirmed hypothesis
(`FIX_WITHOUT_CONFIRMED_HYPOTHESIS`). Intuition may choose which hypothesis
to test first; it does not get to skip the experiment.

## When to use

- On any failure report: "มันพัง", "error", "ไม่ทำงาน", unexpected output,
  or a regression after a change — and always before changing code "to see
  if it helps".
- When `flow/flow-map.json` names this doc for the resolved mode (debug).
- When a fix attempt has already failed once: repeating it is not debugging,
  it is hoping with extra steps.

## The flow

1. Stabilize the reproduction before forming any theory. Record expected
   behavior, observed behavior, exact steps, environment hash, and build id.
   If the failure is intermittent, record the sampling strategy (default
   minimum three samples) plus monitoring evidence instead of pretending the
   failure is stable. Missing context fails the record on
   `REPRODUCTION_CONTEXT_MISSING`; no story of recurrence fails it on
   `REPRODUCTION_NOT_STABILIZED`. Reproduction is a deliverable, not a
   warm-up.

2. Write the failing test or probe first — RED before the guess. Capture the
   broken behavior as an executable assertion and watch it fail. Any later
   fix attempt without `regressionRedVerified: true` is rejected
   (`REGRESSION_RED_MISSING`): a fix that never saw the bug fail cannot
   prove the bug is gone.

3. When an incident arrives with several candidate causes, rank them before
   committing to one:

   ```bash
   npm run debug:triage -- --input <incident-evidence.json>
   ```

   This executes the incident-hypothesis ranking
   (`lib/debug-triage-engine.mjs`) and returns the candidates ordered from
   the recorded signals. Triage orders the queue; it does not close the
   case — the session discipline below still applies to whichever candidate
   goes first.

4. Localize the failing boundary. Order the component boundaries from caller
   to terminal dependency, instrument each one, and attach evidence ids. The
   engine derives `lastConfirmedGood` and `firstConfirmedBad`; until both
   exist, `FAILING_BOUNDARY_NOT_LOCALIZED` blocks the session. The search
   region is exactly between those two boundaries — nowhere else earns
   experiments. The record's shape is `examples/process/debug-session.json`
   (schema: `schemas/debug-session.schema.json`).

5. Hold one hypothesis at a time, and make it falsifiable: a statement, the
   observation it predicts, and the test that would kill it
   (`HYPOTHESIS_NOT_FALSIFIABLE`). Park the other candidates rather than
   deleting them — the step-3 ranking decides who is next — but a second
   active hypothesis trips `MULTIPLE_ACTIVE_HYPOTHESES`. Contradicting
   evidence is recorded, never explained away.

6. Experiment by changing exactly one variable per run
   (`EXPERIMENT_NOT_MINIMAL` is a blocker), targeting a declared hypothesis
   (`EXPERIMENT_HYPOTHESIS_UNKNOWN` otherwise) and recording a result. An
   experiment whose outcome cannot change your mind is a ritual, not an
   experiment.

7. Fix only what the evidence confirmed, at the evidence's address. The fix
   requires a confirmed hypothesis with supporting evidence
   (`CONFIRMED_HYPOTHESIS_UNSUPPORTED` otherwise), a change identity
   (`FIX_CHANGE_ID_MISSING`), and the root-cause boundary set to the first
   confirmed-bad boundary — fixing anywhere else raises
   `FIX_NOT_AT_FIRST_FAILING_BOUNDARY`, because a patch upstream of the
   defect relocates the defect.

8. Verify the fix on three fronts — the targeted regression goes green, the
   original reproduction now passes, and the affected regressions pass. All
   three, or the record fails with `FIX_VERIFICATION_INCOMPLETE`; telemetry
   that would distinguish a recurrence is a medium severity
   (`RECURRENCE_TELEMETRY_MISSING`):

   ```bash
   npm test
   ```

9. Audit the session record through the governed process audit, which
   executes `lib/debug-session-engine.mjs` as its `debugging` section. The
   engine has no standalone CLI — `npm run debug:triage` covers incident
   ranking only, and the session record runs through the config's `debug`
   contract:

   ```bash
   npm run process:audit -- --config process.config.json
   ```

   A non-zero exit names the exact blocker; the report's `nextAction` tells
   you the honest next step (`form-single-hypothesis`,
   `run-minimal-experiment`, `complete-verification`, or
   `investigate-blockers`).

10. Cap speculation. After three failed fix attempts (policy
    `debugging.maxFixAttempts`), another speculative patch is forbidden:
    record an architecture escalation with an explicit decision and approver
    (`ARCHITECTURE_ESCALATION_REQUIRED`). Once a fix verifies, close through
    `flow/verification-before-completion.md` — a `bug-fixed` claim requires
    the regression test plus the verified original reproduction, bound to
    the current artifact.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Reproduction stabilized | session record `reproduction` | stable with exact steps, or an intermittent strategy with at least 3 samples and monitoring evidence; expected/observed/environmentHash/buildId all present |
| RED before theory | session `fixAttempts[].regressionRedVerified` | failing regression test or probe observed before any code change (`REGRESSION_RED_MISSING` blocks) |
| Boundary localized | `lib/debug-session-engine.mjs` | `lastConfirmedGood` and `firstConfirmedBad` both identified from ordered, evidence-bound boundaries |
| Single falsifiable hypothesis | `lib/debug-session-engine.mjs` | at most one active hypothesis; each carries statement, predicted observation, falsification test |
| Minimal experiments | session record `experiments` | `variablesChanged` is exactly 1, experiment targets a declared hypothesis, result recorded |
| Fix at root cause | session record `fixAttempts` | confirmed hypothesis, change id, `rootCauseBoundary` equals `firstConfirmedBad` |
| Fix verified | `npm run process:audit -- --config process.config.json` | debugging section clean: targeted green, original reproduction passes, affected regressions pass |
| Regression retained | `npm test` | the regression that proved the bug stays green in the full suite after the fix |

## Anti-patterns

- Do not patch straight from a stack trace or a hunch — the first artifact of
  the session is a reproduction, and "cannot reproduce" means instrument,
  not guess.
- Do not test two hypotheses at once "to save time"; entangled evidence is
  worse than no evidence, because it keeps both theories alive at once.
- Do not change several variables per experiment and credit whichever edit
  felt right; the engine cannot attribute the result, and neither can you.
- Do not fix at a convenient upstream boundary when the first confirmed
  failure is elsewhere — a fix upstream of the defect only moves the defect.
- Do not call a bug fixed because the targeted test passes; the original
  reproduction and the affected regressions are part of the definition of
  fixed.
- Do not invent a direct engine invocation: sessions are audited through
  `npm run process:audit` and incidents ranked through `npm run debug:triage`;
  the session engine itself has no script entry point. Commands that do not
  exist help no one.
- Do not throw a fourth speculative patch at a bug: the third failure means
  your model of the system is wrong, and that is an architecture
  conversation, not another diff.
