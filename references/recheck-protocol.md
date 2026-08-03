# Re-check Protocol

Most weak output does not come from a model that cannot do the work. It comes from a model
that stopped one step early: it did the work, formed an impression that the result was fine,
and reported the impression.

The re-check replaces that impression with a short hostile examination of your own output.

```bash
npm run recheck -- plan --mode design-ui        # get the checks
# perform them, write the record
npm run recheck -- audit --record .fx/recheck.json
```

The audit exits non-zero while the re-check is insufficient, so unfinished self-review cannot
be presented as finished work.

## The four questions

Every re-check answers these in writing, not in your head:

1. **What exactly am I claiming?** Write each claim as a separate sentence. A claim you
   cannot write down is a claim you cannot support.
2. **What proves each claim?** Bind every sentence to a command output, a file, or a capture.
   Anything left unbound is deleted or downgraded to "not verified".
3. **How would I know if I were wrong?** Take your two strongest claims, state the
   observation that would falsify each, and go look for that observation.
4. **What did I never look at?** Name the states, paths, seeds, breakpoints, and regions you
   did not examine. Silence about a region is not evidence about it.

## Why falsification is required

Not noticing a problem is not the same as looking for one. A "clean" verdict with no
falsification attempt behind it is an impression wearing a verdict's clothes, and the audit
rejects it.

When you re-check your **own** work the bar is higher: three falsification attempts instead of
two, plus a written answer to "what would change my mind". Self-review without a disconfirming
condition is just re-reading.

## What the audit blocks

| Code | Why it exists |
| --- | --- |
| `RECHECK_CLAIM_UNBOUND` | A sentence in the report with nothing behind it |
| `RECHECK_CLAIM_OVERSTATED` | Absolute words — pixel-perfect, production-ready — on thin evidence |
| `RECHECK_CLAIM_IMPRESSION` | "Looks fine", "should work": feelings reported as findings |
| `RECHECK_CHECK_WITHOUT_OBSERVATION` | A check ticked off with nothing observed |
| `RECHECK_TOO_SHALLOW` | Fewer than four checks actually performed |
| `RECHECK_NO_ADVERSARIAL_PASS` | No attempt was made to prove yourself wrong |
| `RECHECK_CLEAN_WITHOUT_SEARCH` | A clean verdict with no search behind it |
| `RECHECK_CLEAN_WITH_OPEN_ISSUES` | The verdict contradicts the findings |
| `RECHECK_BLIND_SPOTS_MISSING` | Every piece of work has unexamined areas; name them |
| `RECHECK_ARTIFACT_IDENTITY_MISSING` | Judging artifacts you cannot prove are current |

## The stop rule

If a check finds an issue, **fix it before presenting**. Do not present the work and mention
the issue as a footnote. A footnote transfers your unfinished work to the reader.

The exception is an issue you genuinely cannot fix in scope: state it as an open issue with
severity, set the verdict to `issues-found`, and say plainly what is unverified.

## Depth

| Depth | Use for |
| --- | --- |
| `quick` | Small, low-risk, reversible changes: identity, claim binding, language |
| `standard` | Default: all eight universal checks plus the mode's own and a fresh re-run of its gates |
| `deep` | Irreversible, security-relevant, or user-visible design work |

Depth reduces the number of checks. It never reduces honesty: the claim binding and language
checks are in every depth.

## Where it plugs in

- No mode closes without it — see `references/operating-modes.md`.
- It feeds the completion report: residual risks and verification gaps come straight from the
  blind spots and open issues.
- It does not replace independent review. A re-check is the author being honest; a review is
  someone else being independent. See `references/review-and-feedback-governance.md`.

Templates: `templates/recheck-record.md` · Schema: `schemas/recheck-record.schema.json` ·
Prompt: `prompts/recheck-pass.md` · Example: `examples/recheck.example.json`
