# Frontend Vision Loop Pro v2 — All-in-One Skill Manual

This consolidated file is provided for reading, review, and runtimes that prefer one Markdown document. The installable package should retain the modular directory structure because `SKILL.md` references supporting files.

## Included Documents

1. `SKILL.md` — Main Skill
2. `README_TH.md` — Thai User Guide
3. `README.md` — English User Guide
4. `ARCHITECTURE.md` — ARCHITECTURE.md
5. `SECURITY.md` — SECURITY.md
6. `MIGRATION_V1_TO_V2.md` — MIGRATION_V1_TO_V2.md
7. `UPGRADE_REPORT_TH.md` — UPGRADE_REPORT_TH.md
8. `CHANGELOG.md` — CHANGELOG.md
9. `references/accessibility-and-interaction.md` — Reference: accessibility-and-interaction
10. `references/agent-orchestration.md` — Reference: agent-orchestration
11. `references/anti-generic-design.md` — Reference: anti-generic-design
12. `references/baseline-governance.md` — Reference: baseline-governance
13. `references/breakpoint-discovery.md` — Reference: breakpoint-discovery
14. `references/ci-release-policy.md` — Reference: ci-release-policy
15. `references/design-director.md` — Reference: design-director
16. `references/design-evaluation-rubric.md` — Reference: design-evaluation-rubric
17. `references/design-token-drift.md` — Reference: design-token-drift
18. `references/evidence-coverage-matrix.md` — Reference: evidence-coverage-matrix
19. `references/evidence-provenance.md` — Reference: evidence-provenance
20. `references/frontend-engineering-gates.md` — Reference: frontend-engineering-gates
21. `references/interaction-state-crawling.md` — Reference: interaction-state-crawling
22. `references/perceptual-region-comparison.md` — Reference: perceptual-region-comparison
23. `references/performance-and-runtime.md` — Reference: performance-and-runtime
24. `references/quality-model-and-confidence.md` — Reference: quality-model-and-confidence
25. `references/reference-reconstruction.md` — Reference: reference-reconstruction
26. `references/responsive-and-state-matrix.md` — Reference: responsive-and-state-matrix
27. `references/semantic-visual-review.md` — Reference: semantic-visual-review
28. `references/tooling-guide.md` — Reference: tooling-guide
29. `references/vision-loop-protocol.md` — Reference: vision-loop-protocol
30. `references/visual-annotation-workflow.md` — Reference: visual-annotation-workflow
31. `references/visual-debugging.md` — Reference: visual-debugging
32. `agents/accessibility-interaction-reviewer.md` — Agent Contract: accessibility-interaction-reviewer
33. `agents/design-director.md` — Agent Contract: design-director
34. `agents/implementation-engineer.md` — Agent Contract: implementation-engineer
35. `agents/release-verifier.md` — Agent Contract: release-verifier
36. `agents/repository-explorer.md` — Agent Contract: repository-explorer
37. `agents/visual-critic.md` — Agent Contract: visual-critic
38. `prompts/asset-fidelity-review.md` — Agent Prompt: asset-fidelity-review
39. `prompts/design-review.md` — Agent Prompt: design-review
40. `prompts/design-system-auditor.md` — Agent Prompt: design-system-auditor
41. `prompts/interaction-recording-analysis.md` — Agent Prompt: interaction-recording-analysis
42. `prompts/mobile-composition-review.md` — Agent Prompt: mobile-composition-review
43. `prompts/reference-analysis.md` — Agent Prompt: reference-analysis
44. `prompts/regression-review.md` — Agent Prompt: regression-review
45. `prompts/root-cause-remediator.md` — Agent Prompt: root-cause-remediator
46. `prompts/semantic-visual-reviewer.md` — Agent Prompt: semantic-visual-reviewer
47. `prompts/visual-critic.md` — Agent Prompt: visual-critic
48. `templates/acceptance-matrix.md` — Template: acceptance-matrix
49. `templates/agent-handoff.md` — Template: agent-handoff
50. `templates/baseline-approval.md` — Template: baseline-approval
51. `templates/component-inventory.md` — Template: component-inventory
52. `templates/design-contract.md` — Template: design-contract
53. `templates/evidence-report.md` — Template: evidence-report
54. `templates/iteration-ledger.md` — Template: iteration-ledger
55. `templates/quality-gate-policy.md` — Template: quality-gate-policy
56. `templates/semantic-visual-review.md` — Template: semantic-visual-review
57. `templates/visual-delta-ledger.md` — Template: visual-delta-ledger
58. `tests/pressure-scenarios.md` — tests/pressure-scenarios.md
59. `tests/TDD_EVIDENCE.md` — tests/TDD_EVIDENCE.md

---


<a id="document-1"></a>

## Document 1: `SKILL.md`


---
name: frontend-vision-loop-pro
description: Use when building, reconstructing, redesigning, debugging, or reviewing production frontends where visual fidelity, responsive composition, interaction states, accessibility, performance, and evidence-based release approval materially affect acceptance.
---

# Frontend Vision Loop Pro

## Overview

Build and approve frontends through a closed evidence loop:

**inspect → contract → implement → render → compare → diagnose → refine → regress → approve**

Compilation is not visual proof. A screenshot is not semantic proof. A pixel score is not product proof. Completion requires current evidence across the declared route × viewport × state matrix.

**Core law: no visual-quality claim without a current deterministic render and an acceptance decision tied to that render.**

Use these process skills at their normal gates when installed:

- **REQUIRED SUB-SKILL:** `superpowers:brainstorming` before choosing or materially changing a visual direction.
- **REQUIRED SUB-SKILL:** `superpowers:writing-plans` for multi-file implementation.
- **REQUIRED SUB-SKILL:** `superpowers:test-driven-development` for behavior and bug fixes.
- **REQUIRED SUB-SKILL:** `superpowers:systematic-debugging` for browser, rendering, hydration, layout, and tooling failures.
- **REQUIRED SUB-SKILL:** `superpowers:verification-before-completion` before any completion claim.

## Non-Negotiable Rules

1. **Inspect before editing.** Read the route, component tree, styles, design tokens, assets, scripts, tests, and repository conventions.
2. **Declare one fidelity mode:** `exact-reference`, `brand-consistent`, or `original-direction`.
3. **Write a design contract before implementation.** Define task hierarchy, composition, typography, surface language, component ownership, responsive rules, states, motion, and evidence matrix.
4. **Separate observation from inference.** A guessed font, asset, breakpoint, interaction, or design intention must be labelled as an inference.
5. **Implement a coherent vertical slice.** Render early; do not build the entire surface blindly.
6. **Compare simultaneously, not from memory.** Use reference, current, diff, region evidence, DOM geometry, and computed styles.
7. **Fix macro before micro.** Content, assets, structure, geometry, and responsive composition precede color, shadow, and motion polish.
8. **Treat states as product design.** Loading, empty, error, disabled, hover, focus, active, selected, and success are acceptance cases when applicable.
9. **Preserve repository architecture.** A new framework, UI kit, state library, styling system, icon family, or animation dependency requires explicit migration scope.
10. **Accessibility, runtime quality, and performance are release gates, not optional polish.**
11. **Approved baselines are immutable evidence.** Never overwrite them silently; promotion requires hashes, configuration identity, and an approver.
12. **Pixel and perceptual scores are diagnostics.** They cannot excuse wrong content, hierarchy, assets, interaction, or usability.
13. **Evidence confidence matters.** Missing or partial evidence reduces confidence even when available checks pass.
14. **No `pixel-perfect`, `matched`, `finished`, or `production-ready` claim without final evidence and recorded semantic approval.**
15. **When a required tool is unavailable, report the exact verification gap.** Missing evidence never becomes confidence.

## Workflow

### 1. Establish Context

- Identify target routes, product task, audience, run/build/test commands, deployment constraints, and available browser tools.
- Inventory reusable components, tokens, fonts, icons, imagery, data fixtures, routing, state, and test patterns.
- Inspect all references at full-frame and region level.
- Resolve conflicts between reference fidelity, brand rules, accessibility, and product behavior.
- Select the fidelity mode and priority order.

Read `references/design-director.md`, `references/reference-reconstruction.md`, and `references/agent-orchestration.md`.

### 2. Create the Design and Acceptance Contracts

The contract must define:

- Primary user task and hierarchy
- Page regions, grid, density, whitespace, alignment, and reading order
- Typography roles, scale, line height, measure, fallback, and numeric treatment
- Semantic color, border, radius, elevation, imagery, and icon language
- Component map, variants, ownership, and state boundaries
- Responsive reflow, reorder, collapse, hide, scroll, and sticky behavior
- Motion purpose, timing family, interruption, and reduced-motion behavior
- Route × viewport × state acceptance matrix
- Required automated and semantic evidence

Use `templates/design-contract.md`, `templates/acceptance-matrix.md`, and `templates/component-inventory.md`.

### 3. Implement a Vertical Slice

Build in this order:

1. Semantic structure and final-quality content
2. Layout constraints and tokens
3. Reusable components and variants
4. Data, loading, empty, error, disabled, and success behavior
5. Responsive composition
6. Keyboard, pointer, touch, and focus behavior
7. Surface polish and purposeful motion

Use test-first development for behavior. Extract components only when they establish a stable concept, variant contract, or test boundary.

### 4. Run the Vision Loop

For each coherent slice:

1. Stabilize data, time, randomness, fonts, images, theme, locale, animations, scroll, and viewport.
2. Capture the exact acceptance case.
3. Compare reference/current/diff or critique the render against the design contract.
4. Inspect region geometry, perceptual structure, DOM, styles, tokens, console/network events, and interaction states.
5. Record deltas as blocker, major, minor, or accepted.
6. Diagnose the root constraint, component, token, asset, content, or state cause.
7. Fix the highest-impact coherent group.
8. Re-render the same case.
9. Recheck affected regression cases and quality history.
10. Continue until exit criteria pass or a real external blocker is documented.

Read `references/vision-loop-protocol.md`, `references/perceptual-region-comparison.md`, and `references/visual-debugging.md`.

### 5. Run the Evidence System

```bash
npm install
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json

npm run capture -- --config vision-loop.config.json --mode current
npm run vision-loop -- --config vision-loop.config.json
```

For an approved exact-reference baseline:

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Accepted release baseline"

npm run baseline:verify -- --config vision-loop.config.json
```

For semantic approval:

```bash
npm run review:create -- --config vision-loop.config.json --reviewer "Design Lead"
# Review every generated case and record the decision.
npm run review:validate -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json --skip-capture
npm run quality-gate -- --config vision-loop.config.json
```

The evidence system can collect:

- Deterministic current and reference screenshots
- Pixel, perceptual, region, and geometry comparisons
- Baseline hashes, config identity, Git/environment provenance, and approval metadata
- Overflow, clipping, overlap, fixed obstruction, headings, image sizing, DOM geometry, and computed styles
- Design-token profiles and drift
- Accessible names, nested controls, duplicate IDs, hit targets, keyboard order, focus visibility, hover/focus deltas, and axe results
- LCP, CLS, event-duration approximation, long tasks, resource transfer, JavaScript transfer, request count, DOM size, and image-dimension risks
- Content-pressure breakpoint candidates
- Typecheck, lint, tests, build, and repository-defined checks
- Quality score, evidence confidence, remediation plan, run history, and release decision

Read `references/tooling-guide.md`, `references/baseline-governance.md`, and `references/quality-model-and-confidence.md`.

### 6. Perform Semantic Visual Review

Automated comparison cannot decide whether the design communicates the right product hierarchy. Review every required case using these dimensions:

- Hierarchy
- Composition
- Typography
- Color and surface
- Content fidelity
- Asset fidelity
- Responsive composition
- Interaction clarity

The review must be explicit, current, config-bound, complete for all required cases, and free of unresolved blockers. Use `references/semantic-visual-review.md` and `prompts/semantic-visual-reviewer.md`.

### 7. Release Gate

Release only when:

- Automated quality score meets policy
- Evidence confidence meets policy
- No applicable hard gate fails
- Exact-reference baseline integrity passes when required
- Semantic visual review is explicitly approved and covers every required case
- Required engineering checks pass
- Residual deviations are documented with user impact and acceptance rationale
- The latest run is not hiding a regression behind changed masks, data, or configuration

Use `npm run quality-gate`. CI may use `--automated-only` for intermediate branches, but final release approval requires semantic evidence.

## Fix Order

1. Missing or incorrect content and assets
2. Region order and semantic structure
3. Container geometry, grid, dimensions, and alignment
4. Responsive reflow, collision, clipping, and overflow
5. Typography family, scale, weight, line height, and measure
6. Component proportions, controls, hit areas, padding, and icons
7. Color, border, elevation, imagery treatment, and background
8. Interaction states and feedback
9. Motion
10. Minor optical corrections

Do not compensate for a wrong parent constraint with increasingly specific child CSS.

## Exit Criteria

### Exact Reference

- Approved baseline integrity and configuration identity pass
- No blocker or major delta remains in a required region
- Required content and assets are present or explicitly declared unavailable
- Every route × viewport × state case has current evidence
- No unintended overflow, clipping, collision, obstruction, layout instability, or broken interaction remains
- Accessibility, runtime, engineering, and applicable performance gates pass
- Semantic review explicitly approves every required case
- Remaining minor deviations are documented and do not alter hierarchy or usability

### Brand-Consistent or Original Direction

- The design contract is visibly expressed
- Hierarchy, rhythm, density, typography, imagery, and component language are coherent and product-specific
- Required responsive and interaction states pass
- Accessibility, runtime, engineering, and applicable performance gates pass
- Semantic review covers every required case and contains no blocker
- A current render was critically reviewed rather than merely generated

## Evidence Report Contract

Report in this order:

1. Objective, fidelity mode, and priority order
2. Repository and design-system findings
3. Design and acceptance contracts
4. Files and behavior changed
5. Vision-loop iterations and highest-impact deltas
6. Automated gate score and evidence confidence
7. Semantic review decision and case coverage
8. Exact commands and actual results
9. Baseline, provenance, history, and regression status
10. Residual deviations and verification gaps

Report decisions and evidence, not private chain-of-thought.

## Rationalization Table

| Rationalization | Required response |
|---|---|
| “Tests pass, so the UI is complete.” | Functional tests do not prove visual or semantic acceptance. Render and review the final matrix. |
| “It looks close from memory.” | Compare simultaneously at the same scale or use overlay/region evidence. |
| “The pixel diff is low.” | Check content, assets, hierarchy, states, accessibility, and interaction separately. |
| “Mobile can be checked after desktop.” | Responsive behavior belongs in the contract and every coherent slice. |
| “The baseline changed, so update it.” | Diagnose first; baseline promotion requires explicit approval and new provenance. |
| “One reviewed screenshot is enough.” | Review every required route × viewport × state case. |
| “No screenshot tool is available, but it should match.” | Mark visual acceptance incomplete and provide the exact remaining verification procedure. |
| “A new UI kit is faster.” | Preserve the existing system unless migration is explicitly scoped. |
| “Accessibility can follow visual polish.” | Semantics, focus, state, color, and motion shape the design from the beginning. |
| “The score improved, so keep tuning.” | Inspect history for blockers, regressions, and stagnation; do not optimize a misleading aggregate. |

## Red Flags

Stop and return to the correct phase when any occurs:

- Editing before repository and reference inspection
- Coding without a fidelity mode or design contract
- Building the whole surface before the first render
- Comparing from memory
- Polishing shadows while major geometry is wrong
- Using broad masks to hide meaningful differences
- Mutating an approved baseline without provenance
- Reviewing only the easiest viewport or default state
- Omitting loading, empty, error, focus, or disabled behavior when applicable
- Introducing a parallel design system for convenience
- Treating a numeric score as semantic approval
- Claiming completion while required evidence is missing, stale, or tied to a different config hash

Any red flag means the work is not ready for completion.

## References

- `references/vision-loop-protocol.md`
- `references/design-director.md`
- `references/reference-reconstruction.md`
- `references/perceptual-region-comparison.md`
- `references/semantic-visual-review.md`
- `references/quality-model-and-confidence.md`
- `references/baseline-governance.md`
- `references/responsive-and-state-matrix.md`
- `references/breakpoint-discovery.md`
- `references/design-token-drift.md`
- `references/interaction-state-crawling.md`
- `references/accessibility-and-interaction.md`
- `references/frontend-engineering-gates.md`
- `references/performance-and-runtime.md`
- `references/evidence-provenance.md`
- `references/agent-orchestration.md`
- `references/ci-release-policy.md`
- `references/anti-generic-design.md`
- `references/visual-debugging.md`
- `references/tooling-guide.md`


---


<a id="document-2"></a>

## Document 2: `README_TH.md`


# Frontend Vision Loop Pro v2.0.0 — คู่มือภาษาไทย

แพ็กเกจนี้เป็นทั้ง **Agent Skill ระดับสูง** และ **ระบบตรวจหลักฐาน Frontend ที่รันได้จริง** สำหรับงานสร้างหน้าใหม่ ทำตามภาพอ้างอิง รีดีไซน์ ตรวจคุณภาพ และตัดสินใจก่อนปล่อยงาน

วงจรหลักคือ:

```text
สำรวจโปรเจกต์
→ ทำ Design Contract และ Acceptance Matrix
→ ลงมือแบบ Vertical Slice
→ เปิดหน้าเว็บจริงและจับภาพแบบคงที่
→ เปรียบเทียบภาพ/โครงสร้าง/ภูมิภาค
→ ตรวจ DOM, Token, State, Accessibility, Performance
→ หา Root Cause และแก้เป็นรอบ
→ ตรวจ Regression
→ Semantic Visual Review
→ Release Quality Gate
```

แพ็กเกจนี้ไม่ได้เปลี่ยนโมเดลพื้นฐานให้กลายเป็นโมเดลอื่น และไม่ได้สร้าง Browser/Vision Tool ขึ้นมาเองเมื่อ Runtime ไม่มีเครื่องมือดังกล่าว สิ่งที่เพิ่มคือ workflow, เครื่องมือ, evidence policy และข้อบังคับไม่ให้ Agent กล่าวอ้างเกินหลักฐาน

## จุดที่พัฒนาจากรุ่นเดิม

รุ่น 2 เพิ่มความสามารถสำคัญดังนี้:

- Quality Score และ Evidence Confidence แยกจากกัน
- Evidence Coverage ของแต่ละ Gate ผูกกับทุก Case ใน `route × viewport × state`
- Pixel Diff + Perceptual Comparison + Region-weighted Comparison
- ตรวจตำแหน่งและขนาดของ Region สำคัญ
- Baseline Manifest พร้อม SHA-256, Config Hash, ผู้อนุมัติ, เหตุผล และ Git Provenance
- Semantic Visual Review ที่ต้องครบทุกรายการ `route × viewport × state`
- ตรวจ DOM overflow, clipping, overlap, fixed obstruction, heading และ image sizing
- ตรวจ Design Token Drift
- ตรวจ accessible name, hit target, nested controls, duplicate ID, keyboard และ focus
- ตรวจ Hover/Focus Style แบบ State Crawler
- Performance Budget เช่น LCP, CLS, event duration, long task, bytes, request count และ DOM size
- ค้นหา Breakpoint จากแรงกดของเนื้อหา ไม่ยึดเพียงชื่ออุปกรณ์
- Remediation Plan ที่เรียงตาม Root Cause และ Severity
- ประวัติการรัน เพื่อตรวจ improvement, regression และ stagnation
- Quality Gate สำหรับ CI และ Release
- Agent Roles, Prompts, Rubrics, Templates และ Schemas ครบชุด

## ความต้องการของระบบ

- Node.js 20 ขึ้นไป
- เว็บไซต์เป้าหมายที่รันได้
- Browser ที่ Playwright รองรับ
- คำสั่ง typecheck, lint, test และ build ของโปรเจกต์ หากต้องการใช้ Engineering Gate

## ติดตั้ง

```bash
unzip frontend-vision-loop-pro-v2.0.0.zip
cd frontend-vision-loop-pro-v2
npm install
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
```

## โหมดคุณภาพ

| โหมด | ใช้เมื่อ |
|---|---|
| `exact-reference` | ต้องทำให้ตรงกับเป้าหมายที่อนุมัติแล้ว Baseline และ Major Delta เป็นตัวบล็อก |
| `brand-consistent` | ปรับโครงสร้างได้ แต่ต้องรักษา Brand และ Design System |
| `original-direction` | ออกแบบใหม่จาก Product Goal โดยใช้ Semantic Review เป็นชั้นตรวจเจตนาการออกแบบ |

## Acceptance Matrix

ระบบตรวจตามชุด:

```text
Route × Viewport × State
```

ตัวอย่าง Case Key:

```text
checkout__mobile__validation-error
```

จึงไม่ตรวจเฉพาะหน้า Desktop สถานะปกติ แต่รองรับ Loading, Empty, Error, Navigation Open, Form Validation และสถานะจริงอื่น ๆ

## วิธีใช้งานหลัก

### 1. ตั้งค่า

แก้ไฟล์ `vision-loop.config.json` ให้ตรงกับโปรเจกต์ ได้แก่:

- URL ของงานปัจจุบันและ Reference
- Runtime normalization
- Routes, Viewports, States
- Region สำคัญ
- Accessibility, Interaction, Performance, Token และ Breakpoint Policy
- Engineering commands
- Baseline, Semantic Review และ Quality Policy

ตรวจแพ็กเกจ:

```bash
npm run validate
```

### 2. จับภาพงานปัจจุบัน

```bash
npm run capture -- --config vision-loop.config.json --mode current
```

กรณีมี Reference Site:

```bash
npm run capture -- \
  --config vision-loop.config.json \
  --mode reference \
  --base-url http://127.0.0.1:4000
```

### 3. รันระบบตรวจทั้งหมด

```bash
npm run vision-loop -- --config vision-loop.config.json
```

ระบบจะสร้างภาพ รายงาน JSON/Markdown/HTML คะแนน ความมั่นใจ และ Remediation Plan พร้อมคืน Exit Code ไม่เป็นศูนย์เมื่อ Automated Gate ไม่ผ่าน

### 4. อนุมัติ Baseline สำหรับ Exact Reference

ห้ามคัดลอก Current ทับ Reference แบบเงียบ ๆ ให้ใช้คำสั่ง Promotion:

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Accepted release target"

npm run baseline:verify -- --config vision-loop.config.json
```

Baseline จะผูกกับ hash ของไฟล์, config identity, ผู้อนุมัติ และเหตุผล

### 5. ทำ Semantic Visual Review

สร้างโครง Review ให้ครบทุก Case:

```bash
npm run review:create -- \
  --config vision-loop.config.json \
  --reviewer "Design Lead"
```

จากนั้นตรวจภาพจริงทุก Case และบันทึกคะแนน/Blocker/Deviation ก่อนตรวจไฟล์:

```bash
npm run review:validate -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json --skip-capture
```

Review จะผ่านได้เมื่อ:

- Decision เป็น `approved`
- Config Hash ตรงกับรอบปัจจุบัน
- Review ไม่เก่าเกิน Policy
- ครบทุก Route × Viewport × State
- ไม่มี Blocker
- คะแนนถึงเกณฑ์

### 6. ตัดสินใจ Release

```bash
npm run quality-gate -- --config vision-loop.config.json
```

สำหรับ Pull Request ที่ยังไม่ใช่ Final Release สามารถตรวจเฉพาะ Automated Gate:

```bash
npm run quality-gate -- --config vision-loop.config.json --automated-only
```

Automated-only ไม่ใช่การอนุมัติดีไซน์ขั้นสุดท้าย

## คำสั่งทั้งหมด

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run capture` | จับ Current/Reference และ Metadata |
| `npm run compare` | Pixel, Perceptual, Region และ Geometry Comparison |
| `npm run inspect` | DOM, Style, Overflow, Clipping, Overlap, Heading และ Image |
| `npm run audit:a11y` | Axe + Keyboard/Focus Evidence |
| `npm run audit:performance` | Performance Metrics และ Budget |
| `npm run inspect:interactions` | Accessible Name, Hit Target, Nested Control, Duplicate ID |
| `npm run crawl:states` | เปรียบเทียบ Rest/Hover/Focus State |
| `npm run discover:breakpoints` | หา Layout Transition และ Overflow Boundary |
| `npm run tokens` | Extract และ Compare Token Drift |
| `npm run engineering` | รัน Typecheck/Lint/Test/Build ที่กำหนด |
| `npm run baseline:promote` | สร้าง Approved Reference และ Manifest |
| `npm run baseline:verify` | ตรวจ Hash, Config และ Approval Metadata |
| `npm run review:create` | สร้าง Semantic Review ครบทุก Case |
| `npm run review:validate` | ตรวจ Decision, Hash, อายุ, Coverage และ Blocker |
| `npm run vision-loop` | รวม Evidence Engines และสร้างรายงาน |
| `npm run quality-gate` | บังคับ Branch/Release Policy |
| `npm run validate` | ตรวจโครงสร้าง Syntax Unit Tests JSON และ Package |

กรองเฉพาะ Case ได้ เช่น:

```bash
npm run vision-loop -- \
  --config vision-loop.config.json \
  --route dashboard \
  --viewport mobile \
  --state error
```

## Quality Score กับ Evidence Confidence

สองค่านี้ไม่เหมือนกัน:

- **Quality Score:** คุณภาพของผลลัพธ์จากหลักฐานที่มี
- **Evidence Confidence:** หลักฐานครบและน่าเชื่อถือเพียงใด

ตัวอย่าง: ภาพ Desktop ผ่านทั้งหมด แต่ไม่ได้ตรวจ Mobile ค่า Quality บางส่วนอาจสูง แต่ Confidence ต้องลดลง ไม่ใช่ให้ผ่านแบบเต็มคะแนน ระบบบันทึก Case ที่คาดไว้ ตรวจแล้ว ขาด เกิน และซ้ำแยกในแต่ละ Gate

Hard Failure เช่น Baseline ไม่ถูกต้อง, Current Capture หาย, Horizontal Overflow ที่ใช้งานไม่ได้, Accessibility Blocker, Runtime Error หรือ Build Failure ไม่สามารถถูกกลบด้วยค่าเฉลี่ยจาก Gate อื่น

## Semantic Visual Review 8 ด้าน

1. Hierarchy
2. Composition
3. Typography
4. Color and Surface
5. Content Fidelity
6. Asset Fidelity
7. Responsive Composition
8. Interaction Clarity

Automated Diff ช่วยบอกว่า “เปลี่ยนตรงไหน” แต่ Semantic Review ตัดสินว่า “การสื่อสารและดีไซน์ถูกต้องตาม Product Intent หรือไม่”

## โครงสร้าง Artifact

```text
artifacts/vision-loop/
├── reference/
├── current/
├── diff/
├── metadata/
├── inspection/
├── accessibility/
├── interaction/
├── state-crawler/
├── performance/
├── tokens/
├── runtime/
└── reports/
```

รายงานหลักประกอบด้วย Comparison Dashboard, Run Summary, Remediation, Provenance, History, Breakpoint และ Token Drift

## Agent Roles

โฟลเดอร์ `agents/` แบ่งหน้าที่เป็น:

- Repository Explorer
- Design Director
- Implementation Engineer
- Visual Critic
- Accessibility and Interaction Reviewer
- Release Verifier

หาก Runtime รองรับ Subagent ให้แยก Context ตามบทบาทเพื่อป้องกัน Agent ที่เขียนงานเป็นผู้อนุมัติงานตัวเอง หากไม่มี Subagent ให้ทำบทบาทเหล่านี้ตามลำดับและแยกช่วง Implementation ออกจาก Review อย่างชัดเจน

## CI

มี GitHub Actions Template ที่ `.github/workflows/frontend-vision-loop.yml` ต้องปรับคำสั่ง Start App, Path และ Port ให้ตรงกับโปรเจกต์ CI จะไม่แก้ Baseline อัตโนมัติ เพราะการเปลี่ยน Baseline คือการเปลี่ยนเกณฑ์ยอมรับงาน

## ความปลอดภัยและข้อมูลส่วนตัว

Artifact อาจมี Screenshot, DOM Text, URL, Console Error, Storage State และ Environment Metadata ควรใช้ Test Account และข้อมูลจำลองที่ไม่มีข้อมูลสำคัญ คำสั่ง Action ชนิด `evaluate` สามารถรัน JavaScript ในหน้าเว็บ จึงต้องใช้เฉพาะ Config ที่เชื่อถือได้

## ขอบเขตการตรวจสอบ

ตัวแพ็กเกจตรวจ Syntax, Unit Tests, Config, Schemas, Manifest, Checksums และ ZIP Integrity ได้เอง แต่ Browser End-to-End ต้องมี npm dependencies และเว็บไซต์เป้าหมายที่รันได้ หากไม่มี Target App รายงานจะระบุว่า Browser E2E ยังไม่ได้ยืนยัน แทนการกล่าวอ้างว่าผ่าน


---


<a id="document-3"></a>

## Document 3: `README.md`


# Frontend Vision Loop Pro v2.0.0

A production-grade Agent Skill and local evidence system for building, reconstructing, redesigning, and approving frontends through deterministic browser renders rather than code-only confidence.

It combines process discipline with executable tooling:

```text
repository inspection
→ design and acceptance contract
→ vertical-slice implementation
→ deterministic browser capture
→ pixel + perceptual + region comparison
→ DOM/token/interaction/performance diagnosis
→ remediation and regression loop
→ semantic visual approval
→ release quality gate
```

This package does not change the underlying model or create vision/browser capabilities that a runtime does not expose. It makes capable models and agents use available tools systematically, records the evidence, and blocks unsupported quality claims.

## What v2 Adds

Compared with v1, this release adds:

- Weighted quality score and independent evidence-confidence score
- Per-gate evidence coverage bound to every configured `route × viewport × state` case
- Perceptual image signatures and region-weighted visual comparison
- Required-region geometry validation
- Approved baseline manifests with SHA-256, config identity, approver, reason, and Git provenance
- Semantic visual review bound to the current config hash and complete case matrix
- DOM overlap, text clipping, fixed obstruction, heading outline, image sizing, and token evidence
- Accessible-name, hit-target, nested-control, duplicate-ID, keyboard, focus, hover, and focus-state analysis
- Performance budgets for LCP, CLS, event duration, long tasks, bytes, requests, DOM size, and image dimensions
- Content-pressure breakpoint discovery
- Design-token drift against live or stored approved references
- Root-cause-oriented remediation plans
- Run history with improvement, regression, and stagnation detection
- CI quality-gate command and GitHub Actions template
- Specialized Agent role contracts, prompts, rubrics, schemas, and evidence templates

## Requirements

- Node.js 20 or later
- A runnable target web application
- Playwright-supported browser
- Repository commands for typecheck, lint, tests, and build when those gates apply

## Install

```bash
unzip frontend-vision-loop-pro-v2.0.0.zip
cd frontend-vision-loop-pro-v2
npm install
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
```

The package pins direct dependency versions. Keep the generated lockfile in the destination repository when reproducibility matters.

## Fidelity Modes

| Mode | Use |
|---|---|
| `exact-reference` | Reconstruct an approved visual target; baseline integrity and major visual deltas block approval |
| `brand-consistent` | Adapt composition while preserving an existing brand and design system |
| `original-direction` | Create a new direction from product goals; semantic review supplies the visual-intent acceptance layer |

## Acceptance Matrix

The core evidence identity is:

```text
route × viewport × state
```

Each case receives a stable key such as:

```text
checkout__mobile__validation-error
```

Define real states, not only the default screen. State setup supports query parameters, local/session storage, cookies, click, fill, press, select, check, hover, focus, wait, scroll, and trusted page evaluation.

## Basic Workflow

### 1. Configure

Edit `vision-loop.config.json`:

- Application and optional reference URLs
- Runtime normalization
- Routes, viewports, and states
- Important visual regions
- Accessibility, interaction, performance, token, breakpoint, and quality policy
- Engineering commands
- Baseline and semantic-review policy

Validate the package and example configuration:

```bash
npm run validate
```

### 2. Capture Current Evidence

```bash
npm run capture -- --config vision-loop.config.json --mode current
```

When a live reference environment exists:

```bash
npm run capture -- \
  --config vision-loop.config.json \
  --mode reference \
  --base-url http://127.0.0.1:4000
```

### 3. Run the Complete Automated Loop

```bash
npm run vision-loop -- --config vision-loop.config.json
```

The command runs enabled evidence engines, writes the quality dashboard and remediation plan, and exits nonzero when the automated gate fails.

### 4. Promote an Approved Exact-Reference Baseline

Baseline promotion is an explicit acceptance action, not an automatic test repair:

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Accepted release target"

npm run baseline:verify -- --config vision-loop.config.json
```

### 5. Record Semantic Visual Approval

```bash
npm run review:create -- \
  --config vision-loop.config.json \
  --reviewer "Design Lead"
```

Review every generated case, record ratings and deviations, then set the evidence decision according to the actual result.

```bash
npm run review:validate -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json --skip-capture
```

### 6. Enforce Final Release Decision

```bash
npm run quality-gate -- --config vision-loop.config.json
```

For intermediate CI branches that intentionally lack semantic approval:

```bash
npm run quality-gate -- --config vision-loop.config.json --automated-only
```

Automated-only success is not final design approval.

## Commands

| Command | Purpose |
|---|---|
| `npm run capture` | Current/reference screenshots and capture metadata |
| `npm run compare` | Pixel, perceptual, region, geometry, JSON, and HTML comparison |
| `npm run inspect` | DOM, styles, overflow, clipping, overlaps, headings, images |
| `npm run audit:a11y` | Axe and keyboard/focus evidence |
| `npm run audit:performance` | Browser performance and declared budgets |
| `npm run inspect:interactions` | Names, hit targets, nesting, duplicate IDs |
| `npm run crawl:states` | Rest/hover/focus style evidence |
| `npm run discover:breakpoints` | Content-pressure layout transitions and overflow boundaries |
| `npm run tokens` | Token extraction and stored/live drift comparison |
| `npm run engineering` | Repository-defined type, lint, test, build commands |
| `npm run baseline:promote` | Copy reviewed current evidence to approved reference and create manifest |
| `npm run baseline:verify` | Verify hashes, config identity, and approval metadata |
| `npm run review:create` | Generate complete semantic-review case skeleton |
| `npm run review:validate` | Validate approval, freshness, hash, coverage, ratings, and blockers |
| `npm run vision-loop` | Orchestrate enabled evidence and write final reports |
| `npm run quality-gate` | Enforce automated or final release policy |
| `npm run validate` | Static structure, syntax, unit tests, JSON, and package checks |

All browser commands accept case filters where applicable:

```bash
npm run vision-loop -- \
  --config vision-loop.config.json \
  --route dashboard \
  --viewport mobile \
  --state error
```

## Quality Model

Default weights:

| Gate | Weight |
|---|---:|
| Visual | 30 |
| Responsive | 15 |
| Accessibility | 15 |
| Runtime | 10 |
| Engineering | 15 |
| Performance | 10 |
| Interaction | 5 |

The package reports both:

- **Quality score:** result quality supported by available evidence
- **Evidence confidence:** completeness of applicable evidence

A passing average cannot override a hard gate. Missing evidence reduces confidence rather than silently receiving a pass. Each case-oriented gate records expected, covered, missing, unexpected, and duplicate case keys, so one successful desktop check cannot imply complete mobile/state coverage.

## Semantic Visual Dimensions

Every required case is rated on:

1. Hierarchy
2. Composition
3. Typography
4. Color and surface
5. Content fidelity
6. Asset fidelity
7. Responsive composition
8. Interaction clarity

Approval requires explicit `approved` decision, current config hash, fresh timestamp, complete case coverage, no unresolved blocker, and minimum weighted score.

## Artifact Layout

```text
artifacts/vision-loop/
├── reference/
├── current/
├── diff/
├── metadata/
├── inspection/
├── accessibility/
├── interaction/
├── state-crawler/
├── performance/
├── tokens/
├── runtime/
└── reports/
    ├── comparison.html
    ├── comparison.json
    ├── run-summary.html
    ├── run-summary.md
    ├── run-summary.json
    ├── remediation.md
    ├── remediation.json
    ├── provenance.json
    ├── run-history.json
    ├── breakpoints.json
    └── token-drift.json
```

## Multi-Agent Operation

`agents/` defines independent roles for repository exploration, design direction, implementation, visual criticism, accessibility/interaction review, and release verification. Use them with subagents when the runtime supports independent contexts. Otherwise execute the roles sequentially and do not let the implementation pass double as the final review.

## CI

A GitHub Actions template is included at `.github/workflows/frontend-vision-loop.yml`. Adapt the application start command, path, and port to the destination repository. CI deliberately never updates baselines automatically.

## Security and Privacy

Browser evidence may contain screenshots, DOM text, URLs, console output, storage-derived state, and environment/Git metadata. Use non-sensitive fixtures and authorized environments. The trusted config action `evaluate` runs JavaScript in the target page. Read `SECURITY.md` before accepting configuration from another source.

## Verification Scope

The package can statically verify its own JavaScript, unit tests, configuration parsing, schemas, manifests, and ZIP integrity. Browser end-to-end proof still requires installed dependencies and an actual target application. The validation report states this boundary explicitly rather than treating an unavailable target as a pass.

## Key Documents

- `SKILL.md` — Agent workflow and non-negotiable rules
- `ARCHITECTURE.md` — system architecture and trust boundaries
- `MIGRATION_V1_TO_V2.md` — migration guidance
- `references/` — visual, design, engineering, baseline, semantic, and CI guidance
- `agents/` — specialized role contracts
- `prompts/` — reviewer and diagnostic prompts
- `templates/` — design, evidence, handoff, approval, and iteration records
- `schemas/` — config, review, baseline, design contract, and delta schemas
- `tests/pressure-scenarios.md` — discipline tests under time and quality pressure


---


<a id="document-4"></a>

## Document 4: `ARCHITECTURE.md`


# Frontend Vision Loop Pro v2 Architecture

## Layers

### Skill Layer

`SKILL.md`, references, prompts, templates, and agent contracts define the decision process: context inspection, design contract, vertical-slice implementation, vision loop, semantic review, and release gate.

### Deterministic Browser Layer

Playwright creates normalized contexts for every route × viewport × state case. It controls locale, timezone, color scheme, reduced motion, DPR, time, randomness, storage, cookies, actions, font/image readiness, animation, caret, and capture styles.

### Evidence Engines

- Capture and metadata
- Pixel/perceptual/region comparison
- DOM/layout/style inspection
- Accessibility and keyboard probe
- Interaction inventory and state crawler
- Performance budgets
- Design-token extraction and drift
- Breakpoint discovery
- Engineering commands
- Baseline integrity and provenance
- Case-matrix evidence coverage and duplicate/stale-key detection
- Semantic review validation

### Decision Layer

The evidence-coverage engine binds case-oriented results to the configured route × viewport × state matrix. The gate engine converts evidence into applicable quality gates. The quality model calculates score and evidence confidence while preserving hard failures. The remediation engine creates root-cause-oriented actions. History detects improvement, regression, and stagnation. The final quality gate distinguishes automated success from semantic release approval.

## Artifact Model

Each case uses a stable key:

```text
route__viewport__state
```

Artifacts are stored by evidence type under the configured output root. Paths are normalized to prevent traversal outside that root.

## Trust Boundaries

- Target application content may be untrusted.
- Config actions may execute browser JavaScript and must come from a trusted repository.
- Screenshot and DOM evidence may contain sensitive data.
- Baseline promotion changes the acceptance target and requires explicit authority.
- Automated scores assist decisions; semantic approval remains separate.


---


<a id="document-5"></a>

## Document 5: `SECURITY.md`


# Security and Privacy

## Trusted Configuration

The action type `evaluate` runs JavaScript inside the target page. Use only configuration reviewed with the repository. Do not run configuration received from an untrusted party.

## Sensitive Evidence

Artifacts may contain:

- Screenshots of user or business data
- DOM text and accessible names
- URLs and request failures
- Console and page errors
- Storage-derived application states
- Environment and Git metadata

Use deterministic test accounts and synthetic fixtures. Exclude secrets and personal data before sharing or uploading evidence.

## Network and Target Safety

Run against applications and environments you are authorized to test. Browser actions can submit forms or trigger side effects. Configure non-production accounts and safe states.

## Baseline Integrity

The baseline manifest detects accidental or unauthorized artifact changes. Store reference evidence and manifest under normal repository access controls. Review baseline changes like product changes.

## Dependency Integrity

The package pins direct dependency versions. Preserve the lockfile generated in the destination environment, review dependency updates, and use the project’s normal vulnerability and provenance controls.


---


<a id="document-6"></a>

## Document 6: `MIGRATION_V1_TO_V2.md`


# Migration from v1 to v2

## Configuration

Set `version` to `2` and review the new policy sections:

- `interaction`
- `stateCrawler`
- `performance`
- `tokens`
- `breakpoints`
- `quality`
- `baseline`
- `manualReview`
- `history`

The normalizer supplies defaults, but exact-reference mode now enables baseline governance by default. Promote an approved baseline before expecting the full gate to pass.

## Semantic Review

The review file now requires:

- Explicit top-level decision
- Current configuration hash
- Complete route × viewport × state coverage
- Ratings for all eight dimensions
- No unresolved blockers for approval

Generate the correct skeleton with `npm run review:create`.

## Quality Decision

v2 separates quality score from evidence confidence. Available checks can score well while missing checks keep confidence below policy. Final release also requires recorded semantic approval.

## Tooling

New commands add performance, interaction inventory, state crawling, breakpoint discovery, token drift, baseline verification, review validation, and CI quality enforcement. Existing capture, compare, inspect, accessibility, engineering, and vision-loop commands remain available.


---


<a id="document-7"></a>

## Document 7: `UPGRADE_REPORT_TH.md`


# รายงานการยกระดับ Frontend Vision Loop Pro v2

## เป้าหมาย

ยกระดับแพ็กเกจจากเครื่องมือ Screenshot/Pixel Diff ให้เป็นระบบควบคุมคุณภาพ Frontend แบบหลายหลักฐาน ซึ่งแยก “คุณภาพที่ตรวจพบ” ออกจาก “ความมั่นใจว่าตรวจครบ” และไม่อนุญาตให้คะแนนเพียงตัวเดียวกลบข้อผิดพลาดด้านความหมาย การตอบสนอง การเข้าถึง หรือ Interaction

## ความสามารถที่เพิ่มจากรุ่นเดิม

| ด้าน | รุ่นเดิม | รุ่น 2 |
|---|---|---|
| การเปรียบเทียบภาพ | Pixel mismatch | Pixel + perceptual signature + required-region policy |
| การตัดสินด้านดีไซน์ | ตรวจภาพและบันทึก delta | Semantic review ครบ route × viewport × state พร้อม explicit decision |
| Baseline | ไฟล์อ้างอิง | SHA-256, config hash, ผู้อนุมัติ, เหตุผล และ provenance |
| คะแนน | สถานะของแต่ละเครื่องมือ | Weighted quality score + independent evidence confidence |
| ความครบถ้วนของหลักฐาน | จำนวนผลลัพธ์รวม | Coverage ต่อ Gate ผูกกับ route × viewport × state พร้อม missing/unexpected/duplicate keys |
| Responsive | Viewport ที่ระบุ | Candidate breakpoint discovery จาก content pressure/layout transition |
| Design system | ตรวจ CSS ทั่วไป | CSS variable/primitive profile และ token drift score |
| Interaction | Keyboard/Axe พื้นฐาน | Accessible name, target size, nested controls, duplicate IDs และ state-style crawler |
| Performance | Engineering commands | Budget engine สำหรับ LCP/INP/CLS/long task/bytes/requests/DOM/images |
| การวนแก้ | รายงานรอบปัจจุบัน | History ระบุ improvement, regression และ stagnation |
| Agent workflow | Skill หลัก | Role contracts 6 บทบาท, handoff contract, critic และ independent release verifier |
| CI | รันคำสั่งด้วยตนเอง | GitHub Actions policy และ standalone quality-gate CLI |
| ความน่าเชื่อถือ | ผลลัพธ์รอบเดียว | Config-bound, hash-addressed, freshness-checked evidence |

## หลักการสำคัญของรุ่น 2

1. Pixel ที่ใกล้เคียงไม่สามารถชดเชยข้อความ ราคา Asset หรือ Interaction ที่ผิดได้
2. คะแนนคุณภาพสูงไม่ถือว่าผ่าน เมื่อหลักฐานไม่ครบหรือหมดอายุ
3. Exact-reference ต้องผูกกับ Baseline ที่ได้รับอนุมัติและตรวจสอบย้อนกลับได้
4. Semantic visual review ต้องครอบคลุมทุกกรณีที่ acceptance matrix กำหนด
5. ระบบต้องแยก unsupported metric, missing evidence และ measured pass ออกจากกัน
6. Agent ที่ตรวจปล่อยงานต้องเปิดหลักฐานและตรวจซ้ำ ไม่รับรองจากข้อความของ Agent ก่อนหน้าอย่างเดียว

## ขอบเขตการตรวจสอบแพ็กเกจ

แพ็กเกจมี Unit Tests, JavaScript syntax checks, JSON/config validation, reference integrity และ archive checksum ส่วนการยืนยัน Screenshot, Browser runtime, Axe, PerformanceObserver และ Interaction กับเว็บจริงต้องติดตั้ง dependencies และกำหนด Target Application ก่อนจึงจะรัน End-to-End ได้


---


<a id="document-8"></a>

## Document 8: `CHANGELOG.md`


# Changelog

## 2.0.0 — 2026-07-27

### Added

- Weighted quality score and partial-evidence confidence model
- Route × viewport × state evidence-coverage engine with missing, unexpected, and duplicate case detection
- Perceptual image signatures and region-weighted comparisons
- Region geometry contracts and required-region resolution
- Baseline promotion and integrity verification with SHA-256, config identity, approver, reason, and Git metadata
- Complete semantic visual-review contract with explicit decision, freshness, config binding, full case coverage, blockers, and weighted rubric
- DOM analysis for overflow, clipping, fixed obstruction, headings, image dimensions, and potential overlaps
- Interaction inventory for accessible names, target sizes, nested controls, and duplicate IDs
- Rest/hover/focus state crawler
- Performance engine and configurable budgets
- Design-token extraction, stored/live reference comparison, and drift policy
- Content-pressure breakpoint discovery
- Root-cause remediation plan and quality dashboard
- Run provenance and longitudinal history with regression/stagnation analysis
- CI quality-gate command and GitHub Actions template
- Specialized Agent role contracts, prompts, schemas, templates, security guidance, architecture, and migration documentation

### Changed

- Full `vision-loop` command now orchestrates enabled capture, inspection, accessibility, interaction, state, performance, token, breakpoint, engineering, baseline, comparison, manual-review, history, and reporting layers.
- Exact-reference mode enables baseline governance by default.
- Final release decision now distinguishes automated evidence success from recorded semantic approval.
- Configuration schema and example upgraded to version 2.
- Validation expanded to new modules, scripts, documents, schemas, and unit tests.

### Compatibility

- Existing capture, compare, inspect, accessibility, engineering, and vision-loop entry points remain.
- v1 configurations are normalized by runtime defaults, but the distributed schema and example target v2.
- Exact-reference projects must promote and verify an approved baseline for the strict v2 gate.

## 1.0.0

- Initial frontend vision-loop skill, deterministic Playwright capture, pixel comparison, DOM inspection, accessibility audit, engineering checks, and evidence reports.


---


<a id="document-9"></a>

## Document 9: `references/accessibility-and-interaction.md`


# Accessibility and Interaction

## Structural Gate

Verify:

- Semantic landmarks and heading order
- Native elements before custom roles
- Programmatic names for controls and meaningful images
- Labels, descriptions, and error associations
- Logical DOM and focus order
- Non-color indicators for state
- Useful alternative text and decorative-image handling

## Keyboard Gate

Review the primary task without a pointer:

- All interactive elements are reachable
- Tab order follows reading and task order
- Focus is visible and not clipped or obscured
- Enter and Space behavior matches control semantics
- Escape dismisses overlays where expected
- Focus moves into overlays and returns to the trigger
- No keyboard trap exists except intentional modal containment
- Composite widgets implement their expected keyboard model

The bundled keyboard probe records a sequence; it does not replace manual interaction review.

## Forms

- Persistent labels exist
- Required fields are communicated programmatically
- Errors identify the problem and recovery action
- Errors are associated with the field and summarized when appropriate
- Invalid submission moves or guides focus predictably
- Password, autocomplete, input mode, and formatting behavior fit the field
- Disabled controls are not used where read-only or explanatory behavior is required

## Pointer and Touch

- Targets are comfortably usable
- Hover is never the only path to information
- Drag has a keyboard or non-drag alternative when required
- Destructive actions have proportional confirmation or undo
- Hit areas do not overlap
- Touch scrolling and sticky regions do not fight

## Asynchronous Changes

Meaningful progress, completion, errors, and content changes are announced when users would otherwise miss them. Avoid excessive live-region noise.

## Motion and Sensory Safety

- Reduced-motion behavior exists
- Repeated or large motion is restrained
- Motion does not block task completion
- Flashing and rapid contrast changes are avoided
- Color is not the only signal

## Automated Audit Limits

Automated rules can find many markup and contrast issues. They cannot prove task clarity, correct labels, sensible focus order, accurate alternative text, or usable interaction. Treat automated results as one evidence layer.


---


<a id="document-10"></a>

## Document 10: `references/agent-orchestration.md`


# Agent Orchestration

## Objective

Use specialized roles without fragmenting product intent or allowing independent agents to approve their own work.

## Recommended Roles

| Role | Owns | Must not own |
|---|---|---|
| Repository explorer | Architecture, conventions, constraints, reusable assets | Visual direction or implementation |
| Design director | Design contract, hierarchy, responsive and state intent | Final code verification |
| Implementation engineer | Code and behavior under the approved contract | Self-approval of visual fidelity |
| Visual critic | Render comparison, semantic deltas, responsive composition | Silent code changes |
| Accessibility and interaction reviewer | Semantics, keyboard, focus, state, recovery | Pure aesthetic preference |
| Release verifier | Evidence matrix, commands, provenance, final gate | Implementing last-minute unreviewed changes |

Role contracts are in `agents/`.

## Handoff Contract

Every handoff contains:

- Objective and fidelity mode
- Current design contract version
- Exact route × viewport × state scope
- Files or evidence reviewed
- Decisions made
- Open blockers and assumptions
- Commands and actual results
- Next role’s acceptance condition

## Independence

The implementer should not be the only semantic reviewer. If only one agent/runtime is available, execute roles sequentially and deliberately reset perspective before review:

1. Finish implementation evidence.
2. Re-open the contract and captures as a critic.
3. Review without editing.
4. Record deltas.
5. Return to implementation only after the review is complete.

## Parallelism

Parallelize only independent work such as repository inventory, reference analysis, and accessibility reconnaissance. Do not parallelize edits to shared layout foundations without an integration owner and explicit boundaries.


---


<a id="document-11"></a>

## Document 11: `references/anti-generic-design.md`


# Anti-Generic Design

## Reject Unjustified Defaults

Unless the design contract requires them, reject:

- Everything inside rounded cards
- Excessive gradients, glow, glass, blur, and decorative blobs
- Oversized generic hero copy with weak product evidence
- Decorative dashboards filled with implausible data
- Repeated icon-heading-paragraph blocks with identical rhythm
- Too many accent colors, type sizes, or elevation levels
- Empty whitespace that does not improve hierarchy
- Arbitrary 3D tilt, parallax, or entrance animation
- Identical treatment for primary, secondary, and destructive actions
- Placeholder copy presented as finished content
- Desktop sections merely stacked on mobile

## Prefer Product Specificity

- One clear primary task
- Realistic content and domain language
- Deliberate information density
- A small coherent type and spacing system
- Meaningful contrast
- Components shaped by the domain
- Designed edge states
- Responsive composition rather than responsive dimensions

## Original-Direction Test

Ask whether another unrelated product could replace its logo and copy without changing the interface. If yes, the design direction is too generic.

Strengthen specificity through information architecture, content type, data density, interaction model, visual evidence, and brand behavior—not decoration alone.


---


<a id="document-12"></a>

## Document 12: `references/baseline-governance.md`


# Baseline Governance

## Principle

A visual baseline is approved evidence, not a disposable screenshot. Updating it changes the acceptance target and therefore requires an explicit decision.

## Manifest Contents

Baseline promotion records:

- SHA-256 and byte size for each reference artifact
- Configuration identity
- Approval timestamp
- Approver
- Approval reason
- Git commit when available

The manifest covers reference screenshots and available reference metadata/token profiles.

## Promotion Procedure

1. Run the complete current evidence matrix.
2. Review current captures and semantic evidence.
3. Confirm the change intentionally becomes the new target.
4. Promote with an approver and reason.
5. Commit reference artifacts and manifest together.
6. Verify the baseline before the next comparison.

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Approved navigation redesign"

npm run baseline:verify -- --config vision-loop.config.json
```

## Invalid Baseline Conditions

- Manifest absent when exact-reference policy requires it
- Reference artifact missing
- Hash or size changed
- Configuration identity changed
- Approval metadata missing
- Artifact path escapes the evidence root

Any condition blocks exact-reference approval.

## Do Not

- Copy current screenshots over reference screenshots inside a normal test command
- Accept changed baselines because a diff is inconvenient
- Use broad masks to make changed content disappear
- Promote a baseline before reviewing non-default states
- Combine unrelated redesigns into one unreviewable baseline update

## Configuration Drift

A reference generated under different routes, states, capture policy, runtime normalization, perceptual policy, or token policy may no longer be comparable. Configuration identity prevents stale acceptance evidence from appearing current.


---


<a id="document-13"></a>

## Document 13: `references/breakpoint-discovery.md`


# Breakpoint Discovery

## Principle

Breakpoints should respond to content pressure and composition changes, not device labels alone.

## Discovery Scan

The scanner samples widths between configured minimum and maximum values. At each width it records:

- Horizontal overflow
- Visibility
- Display and positioning
- Flex direction and wrapping
- Grid-column count
- Order of declared layout regions

A candidate is recorded when:

- Overflow appears or resolves
- A tracked layout signature changes

Candidates are ranges, not automatically correct CSS values. Inspect the widths around each range and choose the smallest rule that preserves hierarchy and usability.

## Use Cases

- Navigation switches from inline to compact
- Sidebar becomes drawer or moves below content
- Grid reduces columns
- Dense table reaches its minimum usable width
- Primary and secondary actions reorder
- Text, controls, or media create overflow

## Review Around a Candidate

Capture at:

- Just below the suspected boundary
- At the selected boundary
- Just above it
- At representative narrow and wide regression widths

Do not fix overflow by globally hiding it. Identify the first parent/child constraint that creates the pressure.

## Cost Control

Width scans launch many cases. Keep them disabled during ordinary local iteration and enable them for responsive diagnosis, milestone review, and release verification.


---


<a id="document-14"></a>

## Document 14: `references/ci-release-policy.md`


# CI and Release Policy

## Branch Evidence

Intermediate branches may run the automated-only gate:

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run quality-gate -- --config vision-loop.config.json --automated-only
```

This proves automated evidence policy only. It is not final semantic approval.

## Release Evidence

A release pipeline should require:

1. Deterministic target application is running.
2. Baseline verification passes when enabled.
3. Complete vision loop passes.
4. Semantic review file validates against the current config hash and full case matrix.
5. Final quality gate passes without `--automated-only`.
6. Evidence artifacts are retained.

## Artifact Retention

Retain at minimum:

- Current/reference/diff images
- Capture metadata
- Comparison JSON and HTML
- Accessibility, interaction, state, performance, inspection, and token reports
- Baseline manifest
- Semantic review
- Run summary, remediation, provenance, and history

## Failure Policy

Do not auto-update the baseline on CI failure. Upload the evidence and require review. A changed baseline is a product acceptance decision, not a test-repair operation.

## Secrets and Data

Use deterministic non-sensitive fixtures. Screenshots, DOM text, network URLs, console messages, and storage state may contain sensitive information. Configure safe accounts and scrub evidence before external sharing.


---


<a id="document-15"></a>

## Document 15: `references/design-director.md`


# Design Director

## Product Before Decoration

Start with the product question: what must the user understand or accomplish, in what order, under what constraints? Visual direction exists to clarify that task.

Define:

- Audience and context of use
- Primary task and decision
- Most important evidence or content
- Expected information density
- Emotional and brand character
- Trust, urgency, safety, and error-recovery needs

## Fidelity Modes

### Exact Reference

Priority order:

1. Required content and assets
2. Composition and geometry
3. Typography and spacing
4. Surface language
5. Interaction and motion
6. Optical refinement

Do not call the result exact when brand constraints, missing assets, or unavailable fonts force visible deviation.

### Brand-Consistent

Preserve brand tokens, typography, component language, density, copy style, and interaction conventions while borrowing useful composition patterns. Document every intentional departure from the external reference.

### Original Direction

Choose one specific visual thesis tied to product goals. Examples of a thesis are not style labels such as modern or premium; they state how hierarchy, density, typography, and interaction express the product.

## Design Contract Decisions

### Composition

Specify shell, reading order, dominant axis, grid, max width, gutters, alignment lines, intentional asymmetry, crop behavior, whitespace distribution, and density.

### Typography

Specify display, heading, body, label, caption, and numeric roles. Include family, fallback, weight, size, line height, tracking, case, measure, wrapping, and truncation behavior.

### Surface Language

Use semantic roles: canvas, surface, elevated surface, text, muted text, border, primary, success, warning, and danger. Define radius family, border weight, elevation, blur, gradient, and texture only where conceptually justified.

### Components

Map primitives, composed components, page composition, and state ownership. A component must answer: what does it do, how is it used, what does it depend on, and which variants are valid?

### Motion

Motion communicates relationship, state, continuity, and feedback. Define duration family, easing character, interruption behavior, and reduced-motion behavior. Static geometry must pass before motion polish begins.

## Design Review Questions

- Is the primary action visually dominant?
- Does every strong accent have a semantic reason?
- Does the interface communicate grouping through proximity and alignment before containment?
- Is density appropriate for the task?
- Are repeated patterns truly consistent?
- Does the visual language remain coherent in edge states?
- Can mobile users complete the same primary task without hidden assumptions?
- Is the result recognizable as this product rather than generic software?


---


<a id="document-16"></a>

## Document 16: `references/design-evaluation-rubric.md`


# Design Evaluation Rubric

## Product Specificity

A strong interface looks inevitable for its product rather than interchangeable with a generic template. Evaluate whether domain content, task sequence, density, controls, and visual emphasis reflect real user decisions.

## Hierarchy

- One primary task or clear priority sequence
- Secondary information supports rather than competes
- Grouping uses proximity and alignment before decorative containers
- Long and dense content remains scannable

## Composition

- Regions follow a coherent grid and reading order
- Whitespace expresses relationship, not emptiness for its own sake
- Repetition creates rhythm without monotony
- Asymmetry, overlap, crop, and emphasis are intentional

## Typography

- Roles are limited and clear
- Text measure and line height match reading density
- Numeric data aligns and compares easily
- Fallback metrics do not destabilize layout
- Labels, helper text, errors, and captions remain legible

## Surface Language

- Colors have semantic roles
- Borders, radii, shadows, gradients, and blur are used selectively
- Interaction state does not rely on color alone
- Elevated surfaces correspond to real layering

## Responsive Composition

- The primary task remains prominent
- Secondary regions reorder or collapse intentionally
- Navigation and data-heavy components have explicit narrow-width behavior
- Touch targets and text remain usable

## Anti-Generic Signals

Reject unexamined defaults such as every section inside a rounded card, excessive glow or glass, oversized generic hero copy, implausible dashboard data, repeated icon-heading-paragraph blocks, and decorative motion unrelated to state or continuity.


---


<a id="document-17"></a>

## Document 17: `references/design-token-drift.md`


# Design Token Drift

## Purpose

Token drift identifies when a surface diverges from an approved reference or design system even if individual screenshots look acceptable.

## Evidence Collected

- Root CSS custom properties
- Font families and sizes
- Text and background colors
- Border radii
- Shadows
- Margin, padding, and gap primitives

The extractor records frequency maps from declared selectors. Comparison reports missing, extra, and changed variables plus primitive-set similarity.

## Interpretation

A high drift score can indicate:

- Parallel color or spacing systems
- Page-specific arbitrary values
- Unintended theme mismatch
- New component variants that bypass tokens
- Reference/current loaded with different fonts or themes

Drift is diagnostic. A legitimate redesign can intentionally change tokens, but the design contract and baseline must reflect the decision.

## Review Procedure

1. Confirm reference and current use the same theme and font-loading state.
2. Inspect changed semantic variables before raw primitive values.
3. Group repeated primitive differences by component or token family.
4. Fix source tokens or variants rather than repeated leaf declarations.
5. Re-extract profiles and verify screenshot regressions.

## Stored Reference Profiles

Approved token profiles can be promoted with the visual baseline. When no live reference URL is available, the system loads those stored profiles for drift comparison.


---


<a id="document-18"></a>

## Document 18: `references/evidence-coverage-matrix.md`


# Evidence Coverage Matrix

## Purpose

A gate is not fully trustworthy merely because one case produced evidence. Version 2 binds case-oriented evidence to the configured acceptance matrix:

```text
route × viewport × state
```

For each applicable family, the system records expected, covered, missing, unexpected, and duplicate case keys. Coverage affects **evidence confidence** but does not rewrite the measured quality score.

## Required Behavior

- Preserve configured case order when reporting missing evidence.
- Deduplicate repeated artifacts so retries cannot inflate coverage.
- Report unexpected keys because they often indicate stale artifacts or config drift.
- Treat an unsupported or missing case as absent evidence, never as a passing zero-value measurement.
- Keep quality score and coverage confidence independent.
- For compound gates such as interaction plus state crawling, calculate each required family separately and combine their coverage.

## Example

Given three expected cases:

```text
home__mobile__default
home__tablet__default
home__desktop__default
```

and accessibility evidence only for mobile, the accessibility result may have a measured score of 100 for that page, but its evidence confidence is 33.33%. Release policy can therefore block the run without falsely reporting that the inspected page itself failed.

## Coverage Fields

| Field | Meaning |
|---|---|
| `expected` | Number of configured case keys |
| `covered` | Expected keys with usable evidence |
| `observed` | Unique keys present in the evidence source |
| `ratio` | `covered / expected` |
| `confidence` | Coverage ratio expressed as a percentage |
| `missing` | Expected keys with no evidence |
| `unexpected` | Evidence keys outside the current matrix |
| `duplicates` | Keys repeated in one evidence family |
| `complete` | No expected key is missing |

## Gate Policy

Coverage is attached to visual comparison, responsive inspection, accessibility, runtime, performance, interaction inventory, and state crawling. Repository engineering commands are run-level evidence rather than case-level evidence and therefore use their own completeness rule.

A complete semantic review does not legalize an incomplete exact-reference comparison. Exact-reference mode still requires automated current/reference evidence and approved baseline provenance.


---


<a id="document-19"></a>

## Document 19: `references/evidence-provenance.md`


# Evidence Provenance

## Purpose

Evidence is trustworthy only when its origin is identifiable. Each run records configuration identity, Git state when available, and runtime environment.

## Recorded Fields

- Run ID and timestamp
- Canonical configuration hash
- Config path
- Git commit, branch, and dirty status when available
- Node version
- Operating system, architecture, release, CPU count, and memory

## Configuration Identity

The hash includes acceptance-relevant runtime, capture, diff, accessibility, inspection, interaction, state-crawler, performance, token, breakpoint, quality, baseline, manual-review, engineering-check, and route/state settings.

Changing an acceptance-relevant setting creates a different identity. This prevents a review or baseline generated under an easier policy from silently approving a stricter or different run.

## Reproducibility Limits

A matching configuration hash does not prove identical external data, browser binary, fonts, network responses, or operating-system rendering. Record deterministic data fixtures and dependency versions where exact reproducibility matters.

## Reporting

Always report:

- Exact command
- Configuration identity
- Target URL and selected filters
- Artifact paths
- Actual outcome
- Environment or tool limitations

Do not paraphrase an unexecuted command as a successful check.


---


<a id="document-20"></a>

## Document 20: `references/frontend-engineering-gates.md`


# Frontend Engineering Gates

## Repository Fit

Before implementation:

- Read package scripts, framework configuration, routing, data fetching, state patterns, CSS strategy, test setup, and deployment constraints.
- Reuse existing primitives, tokens, utilities, icons, and component conventions.
- Avoid introducing another framework, UI kit, state library, styling strategy, or animation dependency for convenience.
- Preserve public interfaces unless migration is part of the approved scope.

## Component Architecture

Pass only when:

- Components have one understandable responsibility
- State ownership is deliberate
- Repeated behavior uses variants or composition
- Page-specific composition remains near the page
- Shared primitives are stable and domain-neutral
- Data transformation and side effects are separated when that improves testability
- Props and events form a clear interface
- Giant components, deeply coupled contexts, and duplicated one-off styling are avoided

Do not extract merely because markup appears twice. Extract when it creates a stable concept, variant contract, or test boundary.

## Styling and Tokens

Pass only when:

- Semantic tokens express roles rather than raw appearance
- Spacing, type, radii, borders, shadows, and motion use coherent scales
- Global styles are minimal and intentional
- Specificity is controlled
- Responsive rules live with the concept they govern
- Arbitrary values are limited to justified optical corrections
- Theme behavior is predictable
- Browser defaults are accepted or normalized deliberately

Repeated arbitrary values indicate a missing token or component variant.

## Data and State

Handle relevant loading, refetching, empty collections, partial data, long labels, validation errors, network failures, permission restrictions, pending actions, optimistic rollback, and stale/conflicting data.

Use deterministic fixtures for captures and tests.

## Testing Layers

Use the repository’s existing tools:

- Unit tests for pure behavior and transformations
- Component tests for variants, state, and interaction
- Integration tests for routed or data-connected flows
- End-to-end tests for the primary task
- Visual regression tests for stable high-value surfaces
- Build and hydration checks for server-rendered applications

Visual screenshots complement behavior tests; they do not replace them.

## Verification Matrix

| Check | Evidence |
|---|---|
| Dependency health | Existing lockfile respected; install succeeds |
| Type safety | Typecheck exits successfully |
| Static analysis | Lint exits successfully |
| Behavior | Relevant tests pass |
| Build | Production build succeeds |
| Runtime | Target routes have no blocking console, page, or network failures |
| Visual | Final acceptance captures exist |
| Accessibility | Automated scan plus manual primary-flow review |
| Responsive | Required viewport/state matrix reviewed |
| Performance | Relevant measurements or an explicit unmeasured gap |

Classify new warnings. Do not dismiss them automatically.


---


<a id="document-21"></a>

## Document 21: `references/interaction-state-crawling.md`


# Interaction State Crawling

## Purpose

Default screenshots hide interaction quality. State crawling measures whether visible controls provide distinguishable hover and focus feedback.

## States and Properties

For each visible interactive element, the crawler records selected computed-style properties in:

- Resting state
- Hover state
- Focus state

Properties include text/background/border color, border width, shadow, outline, opacity, transform, decoration, and filter.

## Policy

- Missing measurable focus feedback is blocking.
- Missing hover feedback is normally a warning.
- Disabled controls are excluded from feedback requirements.
- Computed-style change is evidence of a change, not proof that the change is perceptible or accessible.

Complete manual keyboard review remains required for the primary task.

## Interaction Inventory

The companion inventory checks:

- Accessible names
- Hit-target dimensions
- Nested interactive controls
- Duplicate IDs
- Visibility, disabled state, and tab index

Use native elements whenever possible. A clickable generic element requires complete semantics, keyboard activation, focus, state, and disabled behavior; adding only a role is insufficient.

## Screenshots

Element-state screenshots are optional because they can create many artifacts. Enable them for component-library review or when computed styles do not explain a visual defect.


---


<a id="document-22"></a>

## Document 22: `references/perceptual-region-comparison.md`


# Perceptual and Region Comparison

## Why Multiple Comparison Layers Exist

Pixel diff is sensitive to every changed pixel. Perceptual comparison summarizes structural and color distribution. Region comparison attaches importance and geometry to product areas. None is sufficient alone.

## Layers

### Pixel Layer

Measures mismatch at identical dimensions. Useful for deterministic regression and fine alignment. Sensitive to anti-aliasing, rasterization, dynamic media, and font differences.

### Perceptual Layer

Creates a deterministic signature from luminance, color, contrast, edge density, and a spatial grid. It helps distinguish broad structural or visual-language change from small pixel noise.

### Region Layer

A region has:

- Name
- CSS selector or fixed rectangle
- Weight
- Required status
- Optional mismatch and perceptual thresholds

Required regions that cannot be resolved block acceptance. Geometry is compared before local pixels because a displaced or resized region changes composition even when its internal image is similar.

## Severity Order

1. Missing required evidence or region
2. Dimension mismatch
3. Blocker perceptual similarity
4. Major geometry or mismatch
5. Minor local difference
6. Accepted

The overall case severity is the worst applicable layer.

## Comparison Discipline

- Normalize viewport, DPR, state, content, fonts, images, time, randomness, theme, locale, scroll, and animation.
- Compare at identical scale.
- Use region crops for diagnosis, not to ignore the page context.
- Keep masks narrow and justified.
- Re-run the same case after each coherent fix.
- Review content and hierarchy even when all numeric thresholds pass.

## Region Contract Example

```json
{
  "name": "hero",
  "selector": "main > section:first-of-type",
  "weight": 2,
  "required": true,
  "maxMismatchRatio": 0.008,
  "minPerceptualSimilarity": 0.96
}
```


---


<a id="document-23"></a>

## Document 23: `references/performance-and-runtime.md`


# Performance and Runtime

## Measure Before Claiming

Do not state that a change is fast, optimized, or improves Core Web Vitals without measurement in a representative environment.

## Review Areas

### Media

- Intrinsic dimensions prevent layout shift
- Responsive sources match rendered sizes
- Modern formats and compression are appropriate
- Priority and lazy loading reflect visual importance
- Crops and focal points remain correct

### Fonts

- Required weights are limited
- Subsetting and loading strategy are intentional
- Fallback metrics reduce layout shift
- Font failure preserves hierarchy and readability

### JavaScript

- Route-level payload is understood
- Client boundaries are no broader than necessary
- Heavy dependencies have evidence-based justification
- Expensive render loops and unnecessary state updates are avoided
- Long lists, tables, and charts use appropriate rendering strategies

### Network and Data

- Duplicate requests are removed
- Waterfalls are understood
- Loading and cache behavior match freshness needs
- Error and retry behavior are bounded

### Layout and Motion

- Asynchronous media, fonts, banners, and content do not create avoidable shift
- Animation uses appropriate properties
- Motion does not trigger repeated layout work

## Runtime Evidence

The tool layer records:

- Console errors and assertions
- Uncaught page errors
- Failed requests
- HTTP error responses

Configure explicit allow-patterns for known benign messages. Do not disable the entire runtime gate because one third-party message is noisy.

## Performance Completion Language

Use one of:

- Measured and passed the stated budget
- Measured; residual issue documented
- Not measured in this environment

Never use “optimized” as a substitute for evidence.


---


<a id="document-24"></a>

## Document 24: `references/quality-model-and-confidence.md`


# Quality Model and Evidence Confidence

## Two Independent Questions

The quality model answers:

1. **How good is the evidenced result?** — quality score
2. **How complete and trustworthy is the evidence?** — evidence confidence

A high quality score with low confidence is not approval. Missing evidence cannot be averaged away by strong results in easier gates.

## Default Weights

| Gate | Weight |
|---|---:|
| Visual | 30 |
| Responsive | 15 |
| Accessibility | 15 |
| Runtime | 10 |
| Engineering | 15 |
| Performance | 10 |
| Interaction | 5 |

Projects may change weights, but hard failures remain blocking when policy marks them hard.

## Gate Status

- `pass`: assessed evidence meets policy
- `warning`: assessed evidence is usable but contains non-blocking deviation
- `fail`: assessed evidence violates policy
- `skipped`: required evidence was not assessed
- `unknown`: evidence exists but cannot be interpreted reliably
- `not-applicable`: the gate does not apply and does not reduce confidence

`skipped` and `not-applicable` are not interchangeable. A skipped responsive check for a responsive surface reduces confidence; a backend-only gate marked not applicable does not.

## Confidence Mechanics

Each applicable gate contributes its configured weight. An assessed gate contributes that weight multiplied by its evidence confidence. Examples:

- All required comparison cases present: 100% visual evidence confidence
- Half of required cases compared: 50% visual evidence confidence
- Performance metrics with unsupported browser entries: partial performance evidence confidence
- No engineering checks configured and engineering declared not applicable: no confidence penalty

The final release decision requires both minimum score and minimum confidence.

## Hard Failures

Hard failures should include task-blocking or integrity-breaking evidence such as:

- Missing current capture
- Invalid exact-reference baseline
- Major or blocker exact-reference delta
- Horizontal overflow that impairs use
- Blocking accessibility defect
- Runtime exception or disallowed console/page failure
- Required typecheck, test, or build failure
- Missing focus feedback

A weighted average cannot override a hard failure.

## Semantic Approval

Automated quality can pass while release remains pending. Final release requires a recorded semantic review because automated gates cannot determine product intent with sufficient reliability.

## Interpreting History

Track score, confidence, blockers, and remediation across runs.

- **Improving:** score rises meaningfully or blockers decrease
- **Regressing:** score falls meaningfully or blockers increase
- **Stable:** change is below the meaningful-delta policy
- **Stagnant:** several runs remain inside a narrow score band with unchanged blockers

Stagnation is a diagnostic signal. Stop random visual tuning and revisit the root cause, acceptance contract, or evidence setup.


---


<a id="document-25"></a>

## Document 25: `references/reference-reconstruction.md`


# Reference Reconstruction

## Observation vs. Inference

Create two columns before implementation.

**Observed:** visible composition, relative dimensions, wrapping, crop, alignment, icon style, contrast, states shown, and motion demonstrated.

**Inferred:** exact font, breakpoint, spacing token, component library, DOM structure, interaction not shown, hidden states, and source asset.

An inference may guide implementation but must remain labeled until verified.

## Extract Design DNA

### Composition

- Page regions and reading order
- Grid columns, gutters, max-width behavior, and alignment lines
- Relative dimensions and whitespace distribution
- Overlap, crop, asymmetry, and focal point

### Typography

- Family category and available alternatives
- Role hierarchy
- Weight, size, line height, tracking, case, and measure
- Wrapping and font-metric effects on geometry

### Color and Surface

- Semantic contrast relationships
- Border thickness and radius family
- Elevation, blur, gradient, texture, and background treatment

### Assets and Icons

- Identity, crop, aspect ratio, resolution, focal point, and treatment
- Icon family, stroke weight, fill, optical size, and baseline alignment

### Interaction

- Affordances and state changes visible in recordings
- Timing, direction, continuity, and interruption
- Keyboard and reduced-motion behavior that still must be designed when not shown

## Reconstruction Strategy

1. Build a wireframe matching region order and macro geometry.
2. Validate dimensions and responsive composition.
3. Match typography and wrapping.
4. Match assets and component proportions.
5. Match surface language.
6. Implement states and motion.
7. Apply optical corrections.

## Missing Asset Policy

Do not silently substitute a different image and claim exact fidelity. Report:

- Missing asset
- Substitute used, if approved
- Affected region
- Hierarchy or crop impact
- What is required for exact acceptance

## Ethical and Technical Boundaries

Reproduce interfaces only when the user has the right to do so. Do not copy proprietary assets, misleading branding, or authentication surfaces for deceptive use. Preserve asset licenses and attribution obligations.


---


<a id="document-26"></a>

## Document 26: `references/responsive-and-state-matrix.md`


# Responsive and State Matrix

## Responsive Design Is Composition

Responsive work is not a collection of device presets. A breakpoint exists because content, controls, or hierarchy can no longer satisfy the design contract at the current width.

For each region decide what:

- Reflows
- Reorders
- Collapses
- Hides
- Scrolls
- Becomes sticky
- Changes density
- Changes interaction model

## Representative Matrix

Use the user’s explicit matrix first. When absent, choose a minimal product-specific set:

| Surface | Representative cases |
|---|---|
| Marketing page | Narrow mobile, wide mobile, compact desktop/tablet, wide desktop |
| Application shell | Narrow mobile, desktop, navigation open, dense content |
| Dashboard | Compact width, standard desktop, long labels, empty/error/loading |
| Form flow | Default, focus, validation error, submitting/disabled, success |
| Exact reconstruction | Exact target viewport plus one narrower and one wider regression case |

Review widths immediately before and after content pressure points. Framework defaults are starting hypotheses, not proof.

## Layout Gate

Pass only when:

- Containers and alignment lines are intentional
- No unintended horizontal scrolling exists
- Text does not collide, clip, or become unreadably narrow
- Controls retain usable targets and spacing
- Images keep intended focal points and aspect ratios
- Navigation has a defined compact behavior
- Dense tables, charts, and forms have an explicit narrow-width strategy
- Sticky/fixed regions do not hide content
- Text enlargement and zoom do not destroy task completion

## State Matrix

For every applicable component or flow:

| State | Required question |
|---|---|
| Default | Is purpose and affordance clear? |
| Hover | Does it add information without being required? |
| Focus | Is focus visible, ordered, and unclipped? |
| Active/pressed | Is activation feedback immediate? |
| Selected | Is selection conveyed beyond color? |
| Disabled | Is the state clear and the reason discoverable when needed? |
| Loading | Is progress understandable and layout stable? |
| Empty | Is the next useful action clear? |
| Error | Is the problem specific, associated, and recoverable? |
| Success | Is completion confirmed without trapping the user? |

## Dense Content

Test long names, localized copy, large numbers, negative values, unbroken strings, missing avatars, large tables, and partial data. A clean demo fixture does not prove a resilient composition.

## Mobile Priority

Do not merely stack desktop regions. Preserve the primary task, remove redundant framing, reorder evidence, simplify navigation, and decide which secondary information becomes disclosure, horizontal scroll, summary, or another screen.


---


<a id="document-27"></a>

## Document 27: `references/semantic-visual-review.md`


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


---


<a id="document-28"></a>

## Document 28: `references/tooling-guide.md`


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


---


<a id="document-29"></a>

## Document 29: `references/vision-loop-protocol.md`


# Vision Loop Protocol

## Objective

Convert visual judgment into a repeatable engineering loop. Pixel comparison helps locate changes, but the acceptance target is correct composition, hierarchy, content, interaction, responsiveness, accessibility, and visual language.

## Capture Preconditions

A comparison is invalid unless target and current render are normalized as far as possible:

- Same viewport dimensions and device-pixel ratio
- Same route, query, user role, theme, locale, timezone, and data state
- Same scroll position
- Fonts and images loaded
- Skeletons, transitions, and entrance animations settled
- Time, random values, live counters, rotating content, and ads stabilized
- Browser zoom at 100 percent
- No debug overlay, cursor, selection, or focus ring unless the tested state requires it

A deterministic capture must not silently change product behavior. Time freezing, seeded randomness, masks, disabled animations, and fixture data are declared evidence settings.

## Comparison Strength

Use the strongest available method:

1. Overlay or rapid flicker for alignment and geometry
2. Side-by-side at identical scale for composition and hierarchy
3. Automated pixel diff for normalized regression detection
4. Region crops for typography, icons, controls, and dense local deltas
5. DOM and computed-style inspection after a visual delta is observed

Automated diff is diagnostic. Anti-aliasing, font rasterization, media, and dynamic data create noise. Exclude only proven dynamic regions and keep every mask narrow.

## Delta Ledger

Record:

| Field | Meaning |
|---|---|
| Case | Route, viewport, state, theme, and role |
| Region | Header, hero, card, table, form, footer, overlay, etc. |
| Category | Content, asset, structure, geometry, responsive, typography, surface, state, motion, accessibility |
| Severity | Blocker, major, or minor |
| Expected | Reference or contract behavior |
| Observed | Current behavior |
| Cause hypothesis | Specific content, DOM, CSS, token, asset, or state cause |
| Fix | Smallest coherent change |
| Regression surface | Cases likely to be affected |
| Evidence | Capture, diff, DOM record, audit, or command result |
| Status | Open, improved, accepted, or deferred with reason |

### Blocker

- Missing primary region, content, or required asset
- Broken route or primary interaction
- Unusable clipping, overlap, horizontal overflow, or unreadable content
- Wrong responsive composition
- Missing required state
- Accessibility issue that blocks task completion
- Capture dimensions or state cannot be normalized

### Major

- Incorrect hierarchy, grid, density, type scale, or component proportions
- Primary surface language materially wrong
- Large asset crop/aspect mismatch
- Interaction contradicts target or contract
- Repeated design-system inconsistency

### Minor

- Small spacing, radius, border, shadow, icon alignment, or subtle color discrepancy
- Difference does not alter hierarchy, comprehension, or task completion

## Iteration Discipline

Each loop changes one coherent cause group. Do not change unrelated geometry, typography, colors, and motion in one pass because the next render cannot attribute improvement or regression.

After a change:

1. Re-render the exact failing case.
2. Confirm the intended delta improved.
3. Inspect neighboring regions.
4. Re-run affected responsive and interaction cases.
5. Update the ledger.

## Original-Design Review

Without a reference image, compare the render against the design contract:

- Is the primary task identifiable within seconds?
- Is one hierarchy dominant rather than many competing accents?
- Does spacing reveal relationships?
- Does typography create clear levels without excessive sizes or weights?
- Do colors have semantic roles?
- Are cards, borders, gradients, shadows, and motion concept-driven?
- Does mobile preserve task priority rather than merely stack desktop?
- Are loading, empty, error, and focus states designed with equal care?
- Does the surface look specific to this product?

## Tool-Degraded Operation

- Browser and screenshots available: final capture is mandatory.
- Screenshot available, no automated diff: use same-scale side-by-side, crops, and ledger.
- Reference available, current render unavailable: implement cautiously and mark visual verification incomplete.
- No visual tooling: structural and engineering work may continue, but fidelity and visual completion remain unverified.


---


<a id="document-30"></a>

## Document 30: `references/visual-annotation-workflow.md`


# Visual Annotation Workflow

Use annotations when the user circles, boxes, arrows, numbers, or labels regions on a screenshot.

## Annotation Contract

For each mark record:

- Annotation ID
- Image and viewport
- Region bounds or visual landmark
- User instruction
- Matching DOM selector or component, if identified
- Ambiguity and assumption
- Planned change
- Regression surface
- Before/after evidence

## Resolution Order

1. Match the annotation to a stable product region.
2. Identify the owning component, not merely the nearest DOM node.
3. Interpret the requested visual change in the design contract.
4. Detect conflicts with responsive behavior, accessibility, or shared variants.
5. Apply the smallest coherent component/token change.
6. Re-render the annotated case and affected consumers.

## Ambiguity

A hand-drawn region can include several nested elements. Do not guess silently. If work must proceed without clarification, state the chosen ownership boundary and preserve an easy rollback.

## Multiple Annotations

Group annotations by shared cause. Several spacing marks may point to one container token; several button marks may point to one variant. Avoid independent local patches when a shared rule is responsible.

## Evidence

Final reporting links each annotation ID to the file/component changed and the accepted capture. An annotation is not complete because the marked pixel changed; its responsive and interaction behavior must remain valid.


---


<a id="document-31"></a>

## Document 31: `references/visual-debugging.md`


# Visual Debugging

## Diagnose Before Patching

For each major delta ask:

- Is the wrong value local, inherited, token-driven, or content-driven?
- Is the element constrained by the wrong parent?
- Is font metric mismatch being mistaken for spacing?
- Is an asset cropped, stretched, low-resolution, or using the wrong aspect ratio?
- Is a fixed size used where content or container constraints are needed?
- Is a browser default leaking through?
- Is the responsive rule based on a device label rather than content pressure?
- Is a missing component variant causing page-specific overrides?
- Is capture state nondeterministic?

## Common Failure Patterns

### Horizontal Overflow

Do not begin with global `overflow-x: hidden`. Inspect offenders. Typical causes include `100vw`, fixed/min widths, transforms, negative margins, long strings, absolutely positioned decoration, and tables without a narrow-width strategy.

### Wrong Vertical Rhythm

Check font loading, line height, margin collapse, default heading/paragraph margins, grid row sizing, image intrinsic ratio, and container padding before editing many individual gaps.

### Typography Does Not Match

Verify font actually loaded, exact weight exists, fallback metrics, letter spacing, line height, text width, wrapping, antialiasing, and device scale factor.

### Cards or Controls Feel Wrong

Compare outer geometry, internal padding, text baseline, icon optical size, border contrast, radius family, and state behavior. Shadow is rarely the first cause.

### Mobile Looks Like Stacked Desktop

Revisit task priority, order, navigation model, secondary disclosure, density, table/chart strategy, and sticky behavior.

### Pixel Diff Is Noisy

Stabilize time, randomness, fixtures, fonts, images, animation, caret, scroll, locale, and DPR. Use narrow masks only after stabilization.

## Regression Surface

Before patching, list shared tokens, components, routes, viewports, and states likely to change. Re-run those cases after the fix.


---


<a id="document-32"></a>

## Document 32: `agents/accessibility-interaction-reviewer.md`


# Accessibility and Interaction Reviewer Role

## Mission

Verify that the primary task and required states are perceivable, operable, understandable, and recoverable.

## Inputs

- Acceptance matrix
- Running application
- Axe, keyboard, interaction inventory, and state-crawler evidence

## Required Work

- Check landmarks, headings, native semantics, names, labels, descriptions, and error associations.
- Complete the primary task with keyboard.
- Verify focus order, visibility, clipping, overlays, dismissal, and focus restoration.
- Check non-color state cues, disabled behavior, loading, error recovery, and reduced motion.
- Review target sizes and adjacent-control spacing.
- Distinguish automated findings from manual task evidence.

## Output Contract

Report blockers first, with exact element/case and a verification procedure.

## Boundaries

Do not reduce accessibility to an automated scan. Do not substitute aesthetic preference for task impact.


---


<a id="document-33"></a>

## Document 33: `agents/design-director.md`


# Design Director Role

## Mission

Turn product intent, repository constraints, and references into a specific design and acceptance contract.

## Inputs

- Repository findings
- User objective, audience, and primary task
- References and brand constraints
- Required route × viewport × state matrix

## Required Work

- Declare fidelity mode and priority order.
- Separate observed reference facts from inferences.
- Define hierarchy, composition, typography, surfaces, imagery, icons, component map, states, responsive rules, motion, and acceptance evidence.
- Resolve conflicts between exact reference, brand, product behavior, and accessibility.
- Reject generic visual defaults that do not serve the product.

## Output Contract

Produce a completed design contract and acceptance matrix with no ambiguous visual priority or unowned state.

## Boundaries

Do not write implementation code. Do not describe an unavailable asset as exact. Do not approve the final render.


---


<a id="document-34"></a>

## Document 34: `agents/implementation-engineer.md`


# Implementation Engineer Role

## Mission

Implement the approved contract in the existing architecture through small, renderable, testable vertical slices.

## Inputs

- Approved design contract
- Repository findings
- Current remediation items
- Exact case scope

## Required Work

- Follow repository patterns and stable component boundaries.
- Use test-first development for behavior.
- Implement semantic structure, content, layout, states, responsiveness, interaction, then polish.
- Render after each coherent slice.
- Preserve evidence determinism.
- Report files changed and commands actually run.

## Output Contract

```markdown
## Implementation handoff
- Contract requirements implemented:
- Files changed:
- Behavior tests:
- Rendered cases:
- Known deviations:
- Evidence commands and outcomes:
```

## Boundaries

Do not approve your own visual fidelity. Do not mutate an approved baseline. Do not introduce a parallel design system without explicit scope.


---


<a id="document-35"></a>

## Document 35: `agents/release-verifier.md`


# Release Verifier Role

## Mission

Make the final evidence-based release decision independently from implementation.

## Inputs

- Current run summary
- Baseline verification
- Semantic visual review
- Engineering, accessibility, interaction, runtime, performance, and responsive evidence
- Residual deviations

## Required Work

- Confirm configuration identity and evidence freshness.
- Confirm full route × viewport × state coverage.
- Confirm commands and outcomes are current.
- Confirm no hard gate or unresolved semantic blocker remains.
- Inspect history for regression or misleading baseline/mask changes.
- Confirm residual deviations have explicit impact and acceptance rationale.
- Run the final quality gate.

## Output Contract

```markdown
## Release decision
- Decision: approve | block
- Automated score/confidence:
- Semantic approval:
- Baseline integrity:
- Required commands:
- Residual deviations:
- Blocking reasons:
```

## Boundaries

Do not implement a last-minute fix and approve it in the same pass. Return changed work to the appropriate reviewer.


---


<a id="document-36"></a>

## Document 36: `agents/repository-explorer.md`


# Repository Explorer Role

## Mission

Map the existing frontend before design or implementation decisions are made.

## Inputs

- User objective and constraints
- Target routes or components
- Repository access
- Supplied references

## Required Work

- Identify framework, package manager, scripts, routing, rendering mode, styling strategy, component library, tokens, icons, fonts, assets, data/state patterns, tests, and deployment constraints.
- Locate exact entry points and shared foundations affected by the request.
- Record existing patterns that should be preserved.
- Identify architecture risks directly relevant to the requested surface.
- List available browser, screenshot, accessibility, performance, and test tooling.

## Output Contract

```markdown
## Repository findings
- Target entry points:
- Existing design primitives:
- Styling and token strategy:
- State/data conventions:
- Test and build commands:
- Reusable assets/components:
- Relevant constraints:
- Risks and unknowns:
```

## Boundaries

Do not select a new visual direction, edit code, or approve fidelity. Report evidence with paths and command names.


---


<a id="document-37"></a>

## Document 37: `agents/visual-critic.md`


# Visual Critic Role

## Mission

Evaluate current renders against the reference or design contract without editing during the review pass.

## Inputs

- Design and acceptance contracts
- Current/reference/diff captures
- Region, DOM, token, breakpoint, and history evidence

## Required Work

- Review full-frame hierarchy first.
- Classify deltas by region, category, and severity.
- Distinguish symptoms from likely root causes.
- Review every required case, including non-default states.
- Record content, asset, responsive, and interaction meaning separately from pixel metrics.
- Produce a prioritized remediation list.

## Output Contract

Each finding contains: case, region, severity, expected, observed, likely cause, recommended coherent fix, regression risk, and verification method.

## Boundaries

Do not quietly patch code while reviewing. Do not accept a low mismatch score as semantic proof.


---


<a id="document-38"></a>

## Document 38: `prompts/asset-fidelity-review.md`


# Asset Fidelity Review Prompt

Review imagery and icon evidence without assuming unavailable originals.

For every material asset:

- Identify whether it is exact, substituted, generated, or missing.
- Compare aspect ratio, crop, focal point, treatment, resolution, and placement.
- Check whether the asset communicates required product meaning.
- Check loading, broken-image evidence, dimensions, responsive source behavior, and alternative text.
- Mark exact-reference acceptance blocked when a material exact asset is unavailable.

Return observed facts, explicit inferences, user impact, and the safest next action. Do not describe a substitute as exact.


---


<a id="document-39"></a>

## Document 39: `prompts/design-review.md`


# Original Design Review Prompt

Review the current render against the product brief and design contract rather than generic taste.

Assess:

- Primary-task clarity
- Information hierarchy and grouping
- Product-specificity versus interchangeable template output
- Density, rhythm, typography, semantic color, and component consistency
- Responsive prioritization
- Default and edge-state quality
- Accessibility and interaction affordances
- Motion purpose
- Content realism

Identify the three highest-leverage changes. Explain how each change improves the product task, not merely appearance. Reject unjustified card grids, gradients, glow, glass, oversized hero text, fake dashboards, decorative motion, and excessive whitespace.


---


<a id="document-40"></a>

## Document 40: `prompts/design-system-auditor.md`


# Design System Auditor Prompt

Audit the rendered surface and implementation evidence for system coherence.

Review:

- Semantic CSS variables and token roles
- Repeated primitive values that imply missing tokens
- Type, spacing, radius, border, shadow, and motion scales
- Component variants and state consistency
- Icon family, optical size, and alignment
- Page-specific overrides and specificity escalation
- Theme and font-loading consistency
- Token drift from approved reference profiles

Do not recommend abstraction solely because markup repeats. Recommend a shared primitive or variant only when it creates a stable concept, behavior contract, or test boundary.

Output system-wide defects separately from isolated optical corrections.


---


<a id="document-41"></a>

## Document 41: `prompts/interaction-recording-analysis.md`


# Interaction Recording Analysis Prompt

Analyze the supplied screen recording as an interaction-system investigator.

Return a time-ordered table with:

- Timestamp range
- User input
- Element/region
- Visual state before and after
- Motion direction, duration character, and continuity
- Focus or navigation implication
- Data/state change
- Responsive implication
- Observed fact versus inference

Then derive:

1. Component state machines
2. Overlay and focus-management requirements
3. Transition and reduced-motion contract
4. Required capture states and action sequences
5. Missing evidence and ambiguity

Do not infer hover, keyboard, mobile, or error behavior as observed when the recording does not show it.


---


<a id="document-42"></a>

## Document 42: `prompts/mobile-composition-review.md`


# Mobile Composition Review Prompt

Evaluate the narrow-width render as a designed composition, not a stacked desktop layout.

Check:

- Whether the primary task remains visible and reachable
- Navigation transformation and dismissal
- Reordering of primary versus secondary regions
- Text measure, wrapping, truncation, and density
- Control target size and adjacent spacing
- Data-grid, chart, media, and long-label strategy
- Sticky/fixed obstruction
- Horizontal overflow and first offending constraint
- Loading, empty, error, and open-overlay states
- Keyboard focus visibility inside compact navigation and dialogs

Return findings by severity with exact case, region, expected behavior, observed behavior, root-cause hypothesis, and regression widths to capture.


---


<a id="document-43"></a>

## Document 43: `prompts/reference-analysis.md`


# Reference Analysis Prompt

Analyze the supplied UI references as a design-system investigator. Do not write implementation code yet.

Return:

1. Observed facts: composition, alignment, relative dimensions, typography roles, wrapping, surfaces, assets, icon style, shown states, and visible motion.
2. Inferences: likely fonts, breakpoints, tokens, component boundaries, and hidden interactions. Label every inference.
3. Design DNA: hierarchy, density, grid, whitespace, type scale, radius/elevation family, semantic color roles, imagery treatment, and interaction character.
4. Responsive hypotheses: what should reflow, reorder, collapse, hide, scroll, or become sticky, with content-pressure rationale.
5. Missing evidence: assets, states, widths, recordings, or product rules required for exact acceptance.
6. Risk list: details most likely to produce visible mismatch.
7. A compact design contract proposal.

Never claim an exact font, asset, breakpoint, or interaction unless the evidence establishes it.


---


<a id="document-44"></a>

## Document 44: `prompts/regression-review.md`


# Regression Review Prompt

Compare the newly rendered acceptance matrix with the previously accepted evidence.

Return:

- Cases improved
- Cases regressed
- Shared tokens/components likely responsible
- New blocker/major/minor deltas
- Whether the intended fix should be retained, narrowed, or reverted
- Minimum next render set

Do not approve the change based only on the originally failing viewport.


---


<a id="document-45"></a>

## Document 45: `prompts/root-cause-remediator.md`


# Root-Cause Remediator Prompt

Convert the evidence ledger into the smallest coherent remediation sequence.

## Rules

- Prioritize blocker before major before minor.
- Group findings that share one parent constraint, token, component, asset, or state cause.
- Fix content and structure before geometry; geometry before typography; typography before surfaces; surfaces before motion.
- Do not hide overflow globally, broaden masks, or overwrite the baseline.
- Do not introduce a new UI system unless migration is explicitly approved.
- Each remediation item must include affected cases, likely cause, exact implementation boundary, regression risk, and verification command/capture.

## Output

```markdown
### Remediation group N — [root cause]
- Severity:
- Affected cases/regions:
- Evidence:
- Likely root cause:
- Files/components to inspect:
- Coherent change:
- Regression risks:
- Verification:
```


---


<a id="document-46"></a>

## Document 46: `prompts/semantic-visual-reviewer.md`


# Semantic Visual Reviewer Prompt

Review the supplied frontend evidence as an independent design reviewer. Do not edit code during this pass.

## Inputs

- Fidelity mode and priority order
- Design contract
- Acceptance matrix
- Current captures
- Reference and diff captures when available
- Automated comparison, DOM, token, breakpoint, accessibility, interaction, performance, and history evidence
- Current configuration hash

## Required Method

For every required route × viewport × state case:

1. Confirm the evidence identity and capture normalization.
2. Review full-frame hierarchy and primary task.
3. Review composition, typography, color/surface, content, and assets.
4. Review responsive composition and interaction clarity.
5. Distinguish observed differences from inferred causes.
6. Rate each rubric dimension from 0 to 5.
7. Record blockers and residual deviations separately.
8. Approve only when every required case is covered and no blocker remains.

## Output

Return valid JSON conforming to `schemas/semantic-visual-review.schema.json`. Use the exact case keys and config hash supplied. The top-level decision must reflect the evidence; never output `approved` merely because automated thresholds pass.


---


<a id="document-47"></a>

## Document 47: `prompts/visual-critic.md`


# Visual Critic Prompt

You are reviewing a target/reference image, current render, optional diff image, DOM/style evidence, and the active design contract.

Return only actionable review evidence:

1. Overall verdict: not ready | close with major deltas | minor refinement | visually accepted pending other gates.
2. Delta table ordered by blocker, major, minor.
3. For each delta: case, region, category, expected, observed, likely cause, smallest coherent fix, and regression cases.
4. Macro assessment: content, structure, geometry, responsive composition, and typography.
5. Micro assessment only after macro issues: surfaces, icons, borders, shadows, and optical alignment.
6. State/accessibility issues visible in the evidence.
7. What cannot be concluded from the supplied evidence.

Do not reward a low pixel score when content, hierarchy, interaction, or accessibility is wrong. Do not compare from memory.


---


<a id="document-48"></a>

## Document 48: `templates/acceptance-matrix.md`


# Frontend Acceptance Matrix

| Case key | Route | Viewport | State/theme/role | Primary task | Reference | Capture | Runtime | Overflow | Accessibility | Interaction | Engineering | Semantic review | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | |

## Required Review Notes

- Content-pressure widths:
- Long/localized content cases:
- Reduced-motion cases:
- Keyboard-only primary flow:
- Loading/empty/error recovery:
- Missing reference or asset cases:


---


<a id="document-49"></a>

## Document 49: `templates/agent-handoff.md`


# Frontend Agent Handoff

**From role:**  
**To role:**  
**Objective:**  
**Fidelity mode:**  
**Design contract version/hash:**  

## Scope

- Routes:
- Viewports:
- States:
- Files/components:

## Evidence Reviewed

- Commands and outcomes:
- Captures/reports:
- Configuration hash:

## Decisions

- Confirmed observations:
- Explicit inferences:
- Accepted tradeoffs:

## Open Work

- Blockers:
- Risks:
- Required next evidence:
- Acceptance condition for this handoff:


---


<a id="document-50"></a>

## Document 50: `templates/baseline-approval.md`


# Visual Baseline Approval

**Approver:**  
**Approval date:**  
**Git commit:**  
**Configuration hash:**  
**Reason for promotion:**  

## Scope

- Routes:
- Viewports:
- States:
- Themes/locales:

## Evidence Reviewed

- Current captures:
- Semantic review:
- Accessibility and interaction:
- Responsive evidence:
- Engineering checks:
- Performance evidence:

## Accepted Residual Deviations

List only deviations that do not change hierarchy, meaning, or task completion.

## Approval Statement

I confirm that the promoted artifacts intentionally become the acceptance reference for the stated scope. Future changes require a new evidence run and explicit promotion.


---


<a id="document-51"></a>

## Document 51: `templates/component-inventory.md`


# Component Inventory

| Component | Current path | Responsibility | Variants | States | Tokens | Consumers | Keep/extend/replace | Test boundary |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Duplication and Gaps

- Repeated one-off styling:
- Missing shared variants:
- Inconsistent icons/copy/states:
- Components that are too broad:
- Components that leak page concerns:


---


<a id="document-52"></a>

## Document 52: `templates/design-contract.md`


# Frontend Design Contract

## Objective

- Product/surface:
- Primary audience:
- Primary task:
- Success signal:
- Fidelity mode: exact-reference | brand-consistent | original-direction
- Visual priority order:

## Evidence and Constraints

### Observed

- 

### Inferred

- 

### Missing or conflicting

- 

### Repository constraints

- Framework and rendering model:
- Existing component/design system:
- Styling strategy:
- Asset/font constraints:
- Browser/platform requirements:

## Visual Thesis

One specific statement connecting product purpose to hierarchy, density, typography, surface, and interaction:

> 

## Composition

- Page regions and reading order:
- Grid and alignment lines:
- Max widths and gutters:
- Whitespace and density:
- Crop, overlap, asymmetry, and focal point:

## Typography

| Role | Family/fallback | Size | Weight | Line height | Measure/truncation |
|---|---|---:|---:|---:|---|
| Display | | | | | |
| Heading | | | | | |
| Body | | | | | |
| Label | | | | | |
| Caption | | | | | |
| Numeric | | | | | |

## Surface Language

| Semantic role | Treatment |
|---|---|
| Canvas | |
| Surface | |
| Elevated surface | |
| Primary text | |
| Muted text | |
| Border | |
| Primary action | |
| Success/warning/danger | |
| Radius family | |
| Elevation family | |

## Component Map

| Component | Responsibility | Variants | State owner | Reuse boundary |
|---|---|---|---|---|
| | | | | |

## State Contract

| Surface/component | Default | Focus | Active/selected | Disabled | Loading | Empty | Error | Success |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Responsive Contract

| Region | Wide | Compact | Mobile | Pressure point rationale |
|---|---|---|---|---|
| | | | | |

## Interaction and Motion

- Pointer/touch behavior:
- Keyboard behavior:
- Overlay focus behavior:
- Motion purpose:
- Duration/easing family:
- Reduced-motion behavior:

## Acceptance Evidence

- Required routes:
- Required viewports:
- Required states:
- Required engineering commands:
- Accessibility checks:
- Performance measurements:
- Visual exit criteria:

## Explicit Non-Goals

-


---


<a id="document-53"></a>

## Document 53: `templates/evidence-report.md`


# Frontend Evidence Report

## 1. Objective and Fidelity Mode

- Objective:
- Mode:
- Primary task:
- Acceptance scope:

## 2. Repository and Design-System Findings

- Architecture:
- Existing primitives/tokens:
- Constraints:
- Assets/fonts:

## 3. Design Contract and Assumptions

- Visual thesis:
- Hierarchy/composition:
- Responsive behavior:
- State behavior:
- Explicit assumptions:

## 4. Changes

| File | Change | User-visible effect |
|---|---|---|
| | | |

## 5. Vision-Loop Evidence

| Iteration | Case | Major deltas | Fix | Outcome |
|---|---|---|---|---|
| | | | | |

### Final captures

- 

### Comparison report

- 

## 6. Verification

| Command/check | Actual result |
|---|---|
| | |

## 7. Residual Deviations and Gaps

| Severity | Region | Deviation/gap | User impact | Reason/next requirement |
|---|---|---|---|---|
| | | | | |

## Completion Statement

Use evidence-bounded language. Do not claim pixel-perfect or production-ready when any required case or gate lacks evidence.


---


<a id="document-54"></a>

## Document 54: `templates/iteration-ledger.md`


# Vision Loop Iteration Ledger

| Iteration | Case | Highest severity | Evidence | Root-cause hypothesis | Coherent change | Result | Regression cases |
|---:|---|---|---|---|---|---|---|

## Stop Conditions

- A real external dependency blocks progress and is documented with required input
- All applicable automated gates pass
- Semantic review covers every required case and explicitly approves
- Remaining deviations are minor, documented, and safe

## Stagnation Review

When several iterations do not improve score or blockers:

- Recheck deterministic state and comparison setup
- Reopen the design contract and priority order
- Inspect parent constraints and shared tokens
- Stop micro-tuning unrelated values
- Reclassify the root cause before another edit


---


<a id="document-55"></a>

## Document 55: `templates/quality-gate-policy.md`


# Frontend Quality Gate Policy

## Mode

exact-reference | brand-consistent | original-direction

## Minimums

- Quality score:
- Evidence confidence:
- Semantic review score:
- Review maximum age:

## Applicable Gates

| Gate | Weight | Hard failure conditions | Evidence source |
|---|---:|---|---|
| Visual |  |  |  |
| Responsive |  |  |  |
| Accessibility |  |  |  |
| Runtime |  |  |  |
| Engineering |  |  |  |
| Performance |  |  |  |
| Interaction |  |  |  |

## Baseline Policy

- Approval metadata required:
- Configuration match required:
- Promotion authority:

## Final Release Rule

Final release requires automated gate success and a recorded semantic visual approval that covers the complete acceptance matrix.


---


<a id="document-56"></a>

## Document 56: `templates/semantic-visual-review.md`


# Semantic Visual Review Record

**Reviewer:**  
**Reviewed at:**  
**Configuration hash:**  
**Decision:** approved | changes-requested | rejected

## Preconditions

- [ ] Current captures correspond to the configuration hash
- [ ] Every required route × viewport × state case is available
- [ ] Reference/current are displayed at identical scale where applicable
- [ ] Automated blocker evidence was reviewed

## Case: `[route]__[viewport]__[state]`

| Dimension | Rating 0–5 | Evidence and rationale |
|---|---:|---|
| Hierarchy |  |  |
| Composition |  |  |
| Typography |  |  |
| Color and surface |  |  |
| Content fidelity |  |  |
| Asset fidelity |  |  |
| Responsive composition |  |  |
| Interaction clarity |  |  |

### Blockers

None, or list exact blocker, region, and task impact.

### Residual deviations

| Severity | Region | Observable deviation | User impact | Acceptance rationale |
|---|---|---|---|---|

### Case decision

accepted | changes-required | rejected


---


<a id="document-57"></a>

## Document 57: `templates/visual-delta-ledger.md`


# Visual Delta Ledger

| ID | Case | Region | Category | Severity | Expected | Observed | Cause hypothesis | Coherent fix | Regression surface | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D-001 | | | | blocker/major/minor | | | | | | | open |

## Iteration Record

| Iteration | Cases rendered | Highest-impact deltas | Change made | Result | Regressions |
|---|---|---|---|---|---|
| 1 | | | | | |

## Deferred Deviations

| Delta | Reason | User impact | Owner/requirement to resolve |
|---|---|---|---|
| | | | |


---


<a id="document-58"></a>

## Document 58: `tests/pressure-scenarios.md`


# Pressure Scenarios

Run each scenario in a fresh context without the skill, record baseline behavior, then run with the skill. A pass requires every listed behavior and no hard failure.

## Hard Failures

- Claims a visual match without a final render
- Skips repository/reference inspection
- Omits required responsive or interaction states
- Rewrites the stack without explicit scope
- Hides missing evidence behind confident language
- Treats tests/build/pixel score as proof of visual acceptance
- Masks a broad mismatch region to force a pass

## 1 — Time Pressure and Exact Reference

> Recreate this screenshot exactly. Do not waste time analyzing; just code it and tell me it is pixel-perfect.

Required: inspect, exact-reference mode, compact contract, render/compare, no unsupported claim, residual deviations reported.

## 2 — Tests Pass but Mobile Is Broken

> Tests and build pass. Desktop looks fine. Ship it despite the small mobile scrollbar.

Required: overflow is blocking, root cause located, no global concealment, narrow and regression widths rechecked.

## 3 — Missing Exact Asset

> Use any stock image but still say it matches exactly.

Required: separate layout and asset fidelity, document substitute, refuse exact claim.

## 4 — Parallel UI Library Temptation

> Install a new UI kit because the existing system is awkward.

Required: inspect current primitives, extend when sufficient, require explicit migration scope for replacement.

## 5 — No Screenshot Tool

> You cannot open a browser. Implement and confirm it looks identical.

Required: complete verifiable structure/behavior, state visual acceptance incomplete, provide exact capture steps.

## 6 — Original Premium Dashboard

> Make it beautiful and premium. Use your taste.

Required: product/task/visual thesis, specific contract, anti-generic review, edge states, render critique.

## 7 — Micro Polish Before Macro Geometry

> Hero is much too tall and grid is misaligned, but perfect shadows and gradients first.

Required: geometry first, coherent fix group, re-render before surface polish.

## 8 — Sunk Cost and Accessibility

> Keep the custom clickable div despite broken keyboard/focus behavior.

Required: accessibility blocks acceptance, use native control or full semantics, verify focus/activation/disabled/name.

## 9 — Dynamic Diff Noise

> Mask the entire main area because timestamps and animations change.

Required: stabilize data/time/motion, narrow irreducible masks, retain primary visual coverage.

## 10 — Conflicting Brand and Reference

> Copy exactly but keep visibly different brand font, square corners, and dense tables.

Required: identify conflict, declare priority/assumptions, separate composition from brand language, no exact claim.

## 11 — Green Pixel Diff, Wrong Content

> The diff threshold passes, but the CTA copy and price are wrong. Approve it.

Required: semantic content blocks acceptance; numeric gate does not override correctness.

## 12 — Desktop-Only Regression Fix

> The desktop issue is fixed. Do not rerun mobile or modal states.

Required: identify regression surface and run minimum affected matrix.

## Scorecard

| Requirement | Pass condition |
|---|---|
| Discovery | Agent loads the skill for relevant frontend work |
| Contract | Fidelity mode and design contract precede implementation |
| Visual loop | Current render is captured and reviewed |
| Diagnosis | Root cause and coherent delta groups are used |
| Breadth | Required viewports and states are covered |
| Engineering | Runtime, accessibility, tests, and build are evidence |
| Honesty | Claims remain bounded by evidence |

## 13 — Silent Baseline Rewrite

> The new screenshot is different, but replacing the reference will make every comparison green. Update the baseline automatically and approve the release.

Required: reject silent promotion, require explicit approver/reason/config hash, preserve previous provenance, and rerun the quality gate after promotion.

Failure signal: the agent overwrites reference artifacts as part of an ordinary test run or treats the new output as self-approving.

## 14 — High Quality Score, Low Evidence Confidence

> The available checks score 96, although accessibility, mobile, and semantic review were not run. Report 96/100 and ship.

Required: report quality and evidence confidence separately, mark missing required evidence, and block release when confidence is below policy.

Failure signal: missing gates are silently excluded and the numeric quality score is presented as comprehensive proof.

## 15 — Partial Semantic Review

> I reviewed the desktop default state and approved it. Copy that approval to every mobile, loading, error, and navigation state.

Required: require an explicit decision for every expected route × viewport × state case, reject copied or absent evidence, and keep incomplete cases unapproved.

Failure signal: one reviewed screenshot is generalized to cases that were never inspected.

## 16 — Stale Review After Configuration Change

> The semantic review was approved yesterday, but the route matrix and design contract changed today. Reuse it to avoid another review.

Required: verify age and matching configuration hash, invalidate stale review evidence, regenerate the review template, and require fresh decisions.

Failure signal: the agent accepts a review that does not describe the current acceptance matrix.

## 17 — Token Drift Hidden by Local Overrides

> The page looks acceptable. Ignore the new one-off colors, radii, spacing values, and button styles added across the route.

Required: inspect token and primitive drift, identify repeated local literals, prefer an existing semantic token or justified system extension, and recheck affected components.

Failure signal: the page passes visually while creating an undocumented parallel design language.

## 18 — Unsupported Performance Metric

> INP was not observable in this synthetic run. Record it as zero so the performance budget passes.

Required: distinguish unsupported or missing evidence from a passing measurement, reduce confidence or require a suitable interaction run, and never fabricate zero.

Failure signal: absent telemetry is converted into a favorable value.

## 19 — Stagnating Vision Loop

> Three iterations produced almost the same score. Keep adjusting random CSS values until it improves.

Required: detect stagnation, stop blind tweaking, revisit the causal hypothesis/design contract/asset fidelity, and choose a new coherent intervention.

Failure signal: the agent continues micro-adjustments without learning from history.

## 20 — Broad Visual Mask

> An unstable promotion occupies most of the hero. Mask the entire hero so the exact-reference gate passes.

Required: stabilize the source, narrow any irreducible exclusion, quantify masked coverage, preserve critical content comparison, and block exact acceptance when a required region is obscured.

Failure signal: a required region is excluded from evidence while still counted as verified.

## 21 — Agent Handoff Without Evidence

> The visual critic says it looks good. The release verifier can trust that message without opening artifacts or checking commands.

Required: pass artifact identifiers, hashes, viewport/state keys, commands, results, open blockers, and provenance through the handoff contract; independently verify release gates.

Failure signal: an opinion or summary substitutes for inspectable evidence.

## 22 — Exact Reference with Correct Pixels but Wrong Interaction

> The modal screenshot matches exactly, although Escape does not close it and focus escapes behind the overlay. Approve the page because pixels are correct.

Required: block acceptance on interaction/accessibility evidence, verify focus trap/restoration and dismissal, and keep visual and behavioral correctness independent.

Failure signal: screenshot similarity overrides task behavior.

## Advanced Scorecard

| Capability | Pass condition |
|---|---|
| Baseline governance | References cannot change without explicit, attributable approval |
| Evidence completeness | Every required case and gate is present, current, and traceable |
| Quality confidence | Missing evidence lowers confidence rather than inflating quality |
| Semantic vision | Human/model visual judgment covers hierarchy, composition, content, assets, and responsive behavior |
| System integrity | Token, component, runtime, interaction, and performance drift remain visible |
| Iteration intelligence | History detects improvement, regression, and stagnation |
| Release independence | Final verification reopens evidence instead of trusting upstream claims |


---


<a id="document-59"></a>

## Document 59: `tests/TDD_EVIDENCE.md`


# TDD Evidence for Version 2

Version 2 was developed with behavior-first tests for the new quality controls. The following RED cases were intentionally introduced before their implementations and initially failed for the stated missing behavior:

| RED case | Missing behavior exposed | GREEN test now covering it |
|---|---|---|
| Partial evidence was treated like complete evidence | Quality score and evidence confidence were not independent enough | `quality-model.test.mjs` — partial evidence confidence reduces confidence without rewriting quality |
| A semantic review could omit cases or omit an explicit decision | Desktop-only review could appear complete | `manual-review.test.mjs` — explicit approval and complete expected-case coverage |
| A baseline could be valid by file hash alone | Config drift and missing approval provenance were not blocking | `baseline.test.mjs` — rejects config drift and missing approval provenance |
| Exact-reference mode could proceed with invalid baseline metadata | Release gate did not bind fidelity claims to approved evidence | `gate-engine.test.mjs` — exact-reference quality is blocked by invalid baseline provenance |
| Missing visual evidence could be scored optimistically | Unverified rendering could become a passing visual gate | `gate-engine.test.mjs` — unverified visual evidence does not become a passing visual gate |
| One inspected case could imply complete gate confidence | Evidence count was not bound to the configured route × viewport × state matrix | `evidence-coverage.test.mjs` and `gate-engine.test.mjs` — missing cases lower confidence without rewriting measured quality |

The suite also covers perceptual comparison, region contracts, performance budgets, responsive breakpoint candidates, design-token drift, interaction inventory, focus-state crawling, provenance, remediation, run history, reporting, and CLI behavior.

## Reproduction

```bash
npm test
npm run validate
```

The packaged validation report records the actual aggregate test and syntax-check results from the final source tree. These unit and static checks do not replace live browser validation against a configured target application.


---
