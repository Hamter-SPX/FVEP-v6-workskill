# Semantic Visual Review

## Purpose

Automated image metrics detect rendered change. They do not determine whether the interface communicates the right task, hierarchy, content, and interaction. Semantic review is the explicit acceptance layer above pixel, perceptual, DOM, accessibility, and performance evidence.

## Review Preconditions

Do not review until:

- The current capture was generated from the same configuration hash being reviewed.
- Fonts and images settled and the required route, viewport, state, theme, locale, and data were recorded.
- Automated blocker evidence is available.
- Reference and current captures are displayed at identical scale when a reference exists.
- The reviewer can inspect every case in the acceptance matrix.

## Eight Dimensions

Rate each dimension from 0 to 5.

| Dimension | 5 means | Blocker examples |
|---|---|---|
| Hierarchy | The primary task is immediately clear; emphasis matches product priority | Competing primary actions, critical information visually buried |
| Composition | Regions, alignment, rhythm, density, and reading order feel intentional | Wrong region order, unstable grid, unusable density |
| Typography | Roles, scale, measure, line height, wrapping, and numeric treatment are coherent | Critical text unreadable, major wrapping changes hierarchy |
| Color and surface | Semantic roles, contrast, borders, elevation, and backgrounds form one system | Status depends on color alone, accent hierarchy is reversed |
| Content fidelity | Labels, data, units, order, and messaging communicate the required meaning | Missing primary content, wrong values, misleading action copy |
| Asset fidelity | Images, icons, crops, proportions, and treatments are correct | Wrong product imagery, broken media, materially wrong crop |
| Responsive composition | The task hierarchy survives the viewport and content pressure | Desktop merely stacked, navigation unusable, core action displaced |
| Interaction clarity | Affordances, states, feedback, focus, disabled, and recovery are understandable | Invisible focus, ambiguous control, unrecoverable error state |

## Case Coverage

Every required `route × viewport × state` key must appear exactly once. The validator rejects:

- Missing cases
- Duplicate cases
- Stale review timestamps
- Configuration-hash mismatch
- A top-level decision other than `approved`
- Case decisions that still require changes
- Unresolved blockers
- A weighted score below policy

Unexpected case keys are reported because they often indicate a stale or incorrectly selected acceptance matrix.

## Review Procedure

1. Confirm capture identity and normalization.
2. Inspect full-frame hierarchy before local details.
3. Check content and assets against the contract.
4. Check responsive composition, not only dimensions.
5. Walk the primary task using keyboard and pointer evidence.
6. Inspect required non-default states.
7. Rate all dimensions independently.
8. Record blockers separately from minor residual deviations.
9. Approve only when blockers are empty and residual deviations do not change meaning, hierarchy, or task completion.

## Residual Deviations

A minor deviation may be accepted only when it includes:

- Exact region
- Observable difference
- User impact
- Reason acceptance is safe
- Whether it is repeated system-wide

A repeated “minor” token or component defect is usually major because its system impact is broad.

## Evidence File

Generate the complete case skeleton:

```bash
npm run review:create -- --config vision-loop.config.json --reviewer "Design Lead"
```

After reviewing and editing the JSON:

```bash
npm run review:validate -- --config vision-loop.config.json
```

The review is evidence, not a ceremonial checkbox. A reviewer should be able to explain the acceptance decision from the recorded cases without relying on memory.
