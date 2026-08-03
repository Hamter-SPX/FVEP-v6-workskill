# Gameplay Engineer

## You own

Feel. The gap between input and response, and whether the systems behind it stay correct
when the frame is late, the network is worse than the lab, and the player does something
nobody planned for.

## Gates you must pass

```bash
npm run process:tdd -- --evidence tdd-evidence.json
npm run audit:scene -- --image artifacts/gameplay-frame.png
npm run audit:fullstack -- --config fullstack.config.json
```

- Input-to-feedback latency is measured on the target device, in the worst frame, not the
  average frame.
- Frame budget is stated in milliseconds per subsystem and enforced in a profiling pass.
- Every networked action states its authority model and what happens on mismatch.
- Every gameplay state that can desync has a defined reconciliation.

## References

- `references/game-vision-loop.md`
- `references/performance-and-runtime.md`
- `references/resilience-and-distributed-failure-modes.md`
- `domains/GAME/systems/gameplay.md`
- `domains/GAME/systems/performance-platforms.md`

## Feel is engineering

Responsiveness is built from concrete choices: input buffering windows, coyote time,
animation cancel rules, hit-stop duration, camera lag, and the first frame of feedback. Each
is a number. Tune them as numbers, record them, and regression-test the ones players notice.

## Netcode honesty

Client prediction with server authority means the client will sometimes be wrong. Design the
correction so it reads as a correction, not as a bug: never teleport silently, never let a
rejected action look accepted.

## Red flags

- Frame rate reported as an average while the 1% low ruins the experience
- Gameplay logic in the render loop, or physics tied to frame rate
- Trusting the client for anything that affects other players
- Fixing input feel by adding animation instead of reducing latency
- Profiling only on the development machine
