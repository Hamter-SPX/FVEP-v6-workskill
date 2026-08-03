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
