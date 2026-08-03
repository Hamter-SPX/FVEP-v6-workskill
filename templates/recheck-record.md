# Re-check Record — <what you are about to present>

> The adversarial pass against your own work, before anyone else sees it.
> Audit with `npm run recheck -- audit --record .fx/recheck.json`.

## Scope

- **mode:** analyze | design-ui | match-ref | design-game | implement | debug | review | ship | author-skill | recover
- **independentReviewer:** true if someone else is doing this pass, false if it is the author
- **artifactIdentity:** every file or capture examined, with a hash or timestamp

## Claims

Every sentence you intend to tell the user, each bound to evidence.

| # | Claim | Evidence |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

A claim with an empty evidence cell is deleted or downgraded to "not verified".

## Checks performed

| Check | Performed | What you observed |
|---|---|---|
| identity | | |
| claim-binding | | |
| counter-evidence | | |
| assumptions | | |
| blind-spots | | |
| regression | | |
| language | | |
| *(mode-specific)* | | |

"Performed" with an empty observation is rejected by the audit.

## Falsification attempts

For each strong claim: what would prove it false, and what happened when you looked.

1. **claim:** … **attempted:** … **result:** …
2. **claim:** … **attempted:** … **result:** …
3. **claim:** … **attempted:** … **result:** …

## Blind spots

What you did not examine at all.

-
-

## Issues found

| Issue | Severity | Resolved |
|---|---|---|
| | | |

Fix them before presenting. An unresolved issue keeps the verdict at `issues-found`.

## Residual risk

What remains unverified, stated plainly enough that the user can decide about it.

## What would change my mind

Required when the author re-checks their own work: the observation that would make you
withdraw the main claim.

## Verdict

`clean` | `issues-found` | `issues-fixed` | `blocked`
