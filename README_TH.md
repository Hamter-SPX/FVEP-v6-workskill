# Full-Stack Vision Engineering Pro v6.0.0

ชุด **Agent Skill + Engineering Toolkit** ระดับ Production ที่รวมสี่ระบบไว้ในวงจรเดียว:

1. **Frontend Vision Engineering** — เปิดหน้าเว็บจริง จับภาพ เปรียบเทียบ Responsive, Accessibility, Interaction และ Performance
2. **Aesthetic Direction** — โมเดลความงามเชิงบวกที่อิงหลักการรับรู้ของมนุษย์ พร้อมการวัด Colour, Typography, Spacing, Craft, Motion, Style และ Review เชิงวิจารณญาณที่เป็นอิสระ
3. **Full-Stack Risk Engineering** — ตรวจ API, Architecture, Data, Security, Resilience, Observability, Dependency, Incident และ Release
4. **Deterministic Process Kernel** — บังคับ Design ก่อน Code, Plan ที่รันได้, Workspace Isolation, TDD Evidence, Scientific Debugging, Independent Review, Recovery Ledger, Claim Verification และการตัดสินใจ Integration โดยผู้ใช้

Process Kernel เป็นการดัดแปลงเชิงต้นฉบับจากหลักการที่แข็งแรงของ Superpowers ทุกสกิลที่ติดตั้ง โดยไม่ได้เอาเนื้อหามารวมเป็น Prompt ยาวก้อนเดียว แต่เปลี่ยนเป็น Engine, Contract, CLI, Schema, Example, Pressure Scenario และ Hard Gate ที่ตรวจได้จริงสำหรับงาน Frontend/Full-Stack

## จุดที่เพิ่มขึ้นใน v5

รุ่นก่อนหน้าบอกได้แค่ว่า "อะไรที่ต้องปฏิเสธ" — Card Grid, Glow, Glass, Hero ตัวใหญ่ไร้สาระ, Motion ที่ไม่มีเหตุผล ซึ่งกันงานแย่ได้ แต่ไม่ได้ทำให้เกิดงานที่คนรู้สึกว่าสวย และปล่อยให้คำว่า "Emotional and brand character" ลอยอยู่โดยไม่มีนิยาม

v5 เติมโมเดลเชิงบวกเข้าไป โดยจงใจให้เป็นหลักสากล คืออธิบายกลไกการรับรู้ที่คงที่ข้ามผลิตภัณฑ์และข้ามยุค ไม่ใช่เทรนด์:

- **หลักการที่มีวิธีทดสอบ** — Fluency, Grouping, Balance, Proportion, Contrast, Rhythm, Unity โดยแต่ละข้อมีการทดสอบที่สังเกตได้จริง (เบลอภาพ, ห้าวินาที, ขาวดำ, ไล่แนวขอบ, ลบองค์ประกอบ, นับคลัง, วัดช่องไฟ, สลับโลโก้, อัดเนื้อหาจริง) ทำให้ Finding เป็นหลักฐาน ไม่ใช่ความรู้สึก
- **Anchor ครบทุกระดับ** — เดิมสเกล 0–5 นิยามแค่ว่า 5 คืออะไร ตอนนี้ทุกระดับมีนิยาม มีคะแนนขั้นต่ำรายมิติ และมีกฎว่าค่าเฉลี่ยถ่วงน้ำหนักไม่สามารถกลบมิติที่ต่ำกว่าขั้นต่ำได้
- **ทิศทางที่ตรวจสอบได้** — Aesthetic Profile บันทึกตำแหน่งบนแกนบุคลิก 5 แกน พร้อมเหตุผลและผลที่ยอมรับ, งบความแปลกใหม่ที่จำกัด, เจตนาของระบบ และน้ำเสียง คำที่ไม่ผูกมัดอย่าง modern, clean, premium จะถูก Profile Audit ปฏิเสธ
- **วัดในส่วนที่วัดได้** — Ramp สีเชิงการรับรู้ด้วย OKLCH, ขั้นต่ำ Contrast, ความต่างที่แยกออกของ Type Scale, ความยาวบรรทัดเป็นตัวอักษร, ความสอดคล้องของ Spacing และสัดส่วนการจัดกลุ่ม, Radius ซ้อน, ทิศแหล่งกำเนิดแสงของเงา, ตระกูล Duration และ Easing ของ Motion และการเบี่ยงเบนของ Style Signature จาก Archetype ที่ประกาศไว้
- **วิจารณญาณที่มีการกำกับ** — ให้คะแนนต่ำกว่า 3 ต้องมี Finding, ให้ 5 ต้องมีการทดสอบที่บันทึกไว้, Implementer อนุมัติงานตัวเองไม่ได้ และข้อบกพร่องที่เกิดทั้งระบบจะถูกพักไว้เป็น Residual ไม่ได้

## จุดที่แข็งขึ้นจาก v3

ต่อให้ Build, Frontend และ Backend ได้คะแนนสูง Release ยังถูกบล็อกได้เมื่อ:

- งานสร้างสรรค์ยังไม่มี Design Approval
- Plan มี Dependency cycle หรือ Interface ไม่ครบ
- เขียน Production Code ก่อนเห็น Test แดงจริง
- Debug ด้วยการเดาโดยยังไม่รู้ First Failing Boundary
- Implementer ตรวจและอนุมัติงานตัวเอง
- Review ไม่มีทั้ง Spec Verdict และ Quality Verdict
- Finding ระดับ Critical/Important ยังเปิดอยู่
- หลักฐานเก่า คนละ Artifact Hash หรือครอบคลุมไม่ครบ
- ระบบเลือก Merge, Push, Cleanup หรือ Discard แทนผู้ใช้

ระบบแยก:

```text
Quality Score       = คุณภาพที่หลักฐานซึ่งตรวจแล้วรองรับ
Evidence Confidence = ความครบถ้วน ความสดใหม่ ขอบเขต ความเป็นอิสระ และการผูกกับ Artifact ปัจจุบัน
```

## One Framework — Flow Layer (v6)

v6 รวมทุก discipline ไว้ใต้ร่มเดียว (One Framework): ทุก pattern ที่ process kernel บังคับ มีเอกสาร flow ที่อ่านตามได้ระดับบทสนทนาด้วย — 14 ฉบับที่ FVEP เขียนเองใต้ `flow/` โครงเดียวกันทุกฉบับ (Why → When → Steps → Evidence gates → Anti-patterns) และทุกฉบับผูกกับ engine ที่ตัดสินหลักฐานของมันจริง ทั้งสิบโหมด resolve ไปหา flow ที่คุ้มงานผ่าน `flow/flow-map.json` และ `npm run mode -- resolve` / `show` จะบอกชื่อ flow doc ของงานตรงหน้าเสมอ — เฟรมเวิร์กเดียวกันคุมทั้งบทสนทนา artifact และ gate

เริ่มที่ `flow/README.md` สำหรับแผนที่ทั้งสิบสี่ flow แล้วเดิน `GOLDEN_PATH.md` สำหรับเส้นทางตรงครบทุก gate — route, design, plan, isolate, TDD, review, quality gate, verify, integrate — พร้อม command log ที่รันจริงบน toy repo ใน `examples/golden-path/`

## ข้อกำหนด

- Node.js 20 ขึ้นไป
- Repository หรือสำเนาที่แยกจากงานหลัก
- JSON Contracts สำหรับ Gate ที่เปิดใช้
- เว็บที่รันได้และ Playwright เมื่อจะยืนยันผลด้านภาพ
- Database, Telemetry, Deployment และ Security Tool จริงเมื่อจะกล่าวอ้างด้านนั้น

แพ็กเกจนี้ไม่สามารถสร้าง subagent, browser, git remote, production environment, database หรือ telemetry ที่ runtime ไม่มีให้ได้ ตัวระบบจะสร้างและตรวจ Artifact Contract ได้ แต่จะไม่แต่งหลักฐานที่ไม่มีอยู่จริง

## ติดตั้ง

```bash
unzip fullstack-vision-engineering-pro-v6.0.0.zip
cd fullstack-vision-engineering-pro-v5
./setup.sh
```

Windows PowerShell:

```powershell
Expand-Archive .\fullstack-vision-engineering-pro-v6.0.0.zip -DestinationPath .
Set-Location .\fullstack-vision-engineering-pro-v5
.\setup.ps1
```

ติดตั้งด้วยตนเอง:

```bash
npm install --ignore-scripts --no-audit --no-fund
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
cp examples/process/process.config.json process.config.json
cp fullstack.config.example.json fullstack.config.json
npm run validate
```

## เริ่มใช้งาน Process Kernel

```bash
npm run process:route -- --input examples/process/request.feature.json
npm run process:plan -- --input examples/process/implementation-plan.json
npm run process:tdd -- --input examples/process/tdd-cycles.json
npm run process:review -- --input examples/process/review-chain.json
npm run process:audit -- --config examples/process/process.config.json
```

ผลลัพธ์:

```text
examples/process/artifacts/process-report.json
examples/process/artifacts/process-report.md
```

รายงานจะแสดง Required Sections, Quality Score, Evidence Confidence แบบ weakest-link, Blockers, Recovery State และ Next Actions ที่อนุญาต

## Frontend และ Full-Stack

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run audit:fullstack -- --config fullstack.config.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

`fullstack.config.json` รองรับ Process Hard Gate:

```json
{
  "version": 4,
  "contracts": {
    "processReport": "artifacts/process/process-report.json",
    "frontendSummary": "artifacts/vision-loop/reports/run-summary.json"
  },
  "gates": {
    "process": { "required": true, "hard": true }
  },
  "quality": {
    "weights": { "process": 15 },
    "minScore": 90,
    "minConfidence": 90
  }
}
```

## คำสั่ง Process

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run process:route` | เลือก discipline ที่จำเป็นตามชนิดและระยะของงาน |
| `npm run process:workspace` | ตรวจ Worktree, Submodule, Protected Branch และสิทธิ์ Cleanup |
| `npm run process:plan` | ตรวจ Dependency, File Scope, Interface และขั้น RED/GREEN |
| `npm run process:tdd` | พิสูจน์ว่า RED เกิดก่อน Code และ GREEN ผูกกับ Code/Test เดิม |
| `npm run process:review` | ตรวจ Reviewer Independence, Dual Verdict, Finding และ Fix Loop |
| `npm run process:integration` | ตรวจการตัดสินใจ Merge/PR/Keep/Discard โดยไม่ execute อัตโนมัติ |
| `npm run process:audit` | รวมทุกส่วนเป็น Process Report และ Hard Gate |

## คำสั่งด้าน Aesthetic

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run audit:aesthetics` | วัด Colour, Typography, Spacing, Craft, Motion และ Style Signature เทียบกับ Profile ที่ประกาศไว้ |
| `npm run aesthetics:review` | ตรวจ Aesthetic Review ว่าผ่านคะแนนขั้นต่ำรายมิติ มี Finding รองรับ ผู้ตรวจเป็นอิสระ และผูกกับ Artifact ปัจจุบัน |
| `npm run vision-loop` | รวม capture/inspect/compare + โหลด semantic และ aesthetic evidence แล้วเขียน run summary |

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run vision-loop -- --config vision-loop.config.json
```

คู่มือทีละขั้น: `AESTHETIC_WALKTHROUGH.md` · สรุปภาษาไทย: `references/aesthetic-direction-protocol_TH.md`, `references/aesthetic-principles_TH.md`, `references/visual-direction-exploration_TH.md`

ถ้าผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign ให้ Gen ตัวอย่าง **1 / 2 / 3** ก่อน (`references/visual-direction-exploration.md`) แล้วค่อยเขียน profile

รัน Audit เชิงกลไกก่อนเสมอ เพราะผลลัพธ์คือข้อเท็จจริงที่ไม่ต้องถกเถียง แล้วค่อยให้ผู้ตรวจใช้วิจารณญาณกับสิ่งที่วัดไม่ได้ เปิดใช้ Gate ใน `vision-loop.config.json`:

```json
{
  "aesthetics": {
    "enabled": true,
    "profilePath": "design/aesthetic-profile.json",
    "reviewPath": "design/aesthetic-review.json",
    "minScore": 80,
    "dimensionFloor": 3,
    "requireTestEvidence": true
  }
}
```

ตราบใดที่ยังไม่เปิด Gate `aesthetic` จะรายงานเป็น not-applicable และไม่กระทบคะแนนคุณภาพ ดังนั้น Pipeline v4 ที่อัปเป็น v5 จะได้ผล Gate เท่าเดิม

## โหมดการทำงาน และ Re-check

งานทุกชิ้นอยู่ในหนึ่งใน **สิบโหมด** และไม่มีโหมดไหนปิดได้ถ้ายังไม่ได้ตรวจงานตัวเองแบบไม่เข้าข้าง

```bash
npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"   # analyze design-ui match-ref design-game implement
npm run mode -- show design-ui                          # debug review ship author-skill recover
npm run mode -- check --mode design-ui --state .fx/mode-state.json

npm run recheck -- plan --mode design-ui
npm run recheck -- audit --record .fx/recheck.json
```

โหมดบอกว่า “ช่วงนี้ทำอะไรได้ ยังห้ามทำอะไร ต้องรันเกตอะไร และต้องจริงข้อไหนถึงจะปิด” คำสั่ง `resolve` จะ exit ไม่เป็นศูนย์เมื่อโจทย์กำกวม เพื่อให้ **ถามยืนยันโหมด** แทนการเดา

ส่วน re-check บังคับให้ตอบสี่คำถามเป็นลายลักษณ์อักษร: กำลังเคลมอะไร, อะไรพิสูจน์, ถ้าผิดจะรู้ได้ยังไง, และมีอะไรที่ไม่ได้ดูเลย ตัว audit จะปฏิเสธข้อเคลมที่ไม่มีหลักฐาน คำเด็ดขาดบนหลักฐานบาง ๆ ข้อที่ติ๊กว่าตรวจแล้วแต่ไม่มีสิ่งที่เห็น และ verdict ว่า clean ที่ไม่มีความพยายามหักล้างรองรับ

เอกสาร: `references/operating-modes_TH.md`, `references/recheck-protocol_TH.md`

## คำสั่ง Vision-in-the-loop

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run vision:triage` | เทียบ ref กับ cur แล้วจัดลำดับความต่างตามลำดับการรับรู้ พร้อมบอก “สิ่งที่ต้องแก้ต่อไปหนึ่งอย่าง” |
| `npm run layout-structure` | จำโครงเลย์เอาต์ของภาพต้นฉบับ แล้วตรวจตำแหน่ง/ขนาดของ region ในภาพปัจจุบัน |
| `npm run ascii-map` | แปลงพื้นที่ของภาพเป็นแผนที่ ASCII/ตัวเลข ให้ Agent ใช้คิดต่อได้ |
| `npm run audit:scene` | วัดเฟรมทีละโซน: มุมภาพว่าง โซนตาย ไม่มีจุดนำสายตา ค่าน้ำหนักแบน และการก็อปวาง |
| `npm run audit:game-assets` | ตรวจชุด Asset เกม: เงา (silhouette) สเกลจริงพร้อมตัวเทียบ สไตล์ที่ผูกไว้ งบโพลี และหลักฐานในฉากจริง |

```bash
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png --history .fx/triage-history.json
npm run audit:scene -- --image artifacts/frame.png --brief examples/scene-brief.example.json --grid 8x5
npm run audit:game-assets -- --assets examples/game-assets.example.json --frame-triangle-budget 250000
```

ลำดับการแก้คือ `structure → proportion → value → colour → density → polish` แก้ครั้งละหนึ่งอย่างแล้ว capture ใหม่ทุกรอบ คำสั่งจะ exit ไม่เป็นศูนย์ตราบใดที่ยังไม่ตรง และถ้าสามรอบติดกันไม่ขยับเข้าใกล้เลย จะรายงานว่า stall — ให้หยุดเดา แล้วกลับไปอ่าน ref ทีละส่วน

เอกสาร: `references/visual-delta-triage.md`, `references/scene-completeness.md`, `references/game-vision-loop.md`, `references/game-asset-direction.md`, `references/world-building-and-level-blockout.md` · แพ็กตามบทบาท (frontend/backend/security/design/game/tech-art) อยู่ใน `domains/ROLES/`

`audit:game-assets` ครอบคลุม **VFX / SFX / Animation** ด้วย เพราะสามอย่างนี้พังคนละแบบกับ prop: VFX ต้องระบุ timing เป็นมิลลิวินาที, ความอ่านออกตอนซ้อนกันหลายตัว และเป็นเอฟเฟกต์ที่ “ให้ข้อมูลเกมเพลย์” หรือแค่ตกแต่ง · เสียงต้องระบุ layer (attack/body/tail), mix bus พร้อมกฎ ducking, แผนกันเสียงซ้ำจนล้า และ cue ทางภาพที่ให้ข้อมูลเดียวกันสำหรับคนที่ปิดเสียงหรือหูหนวก · แอนิเมชันต้องระบุ timing, ช่วงที่ยกเลิกได้ (cancel window) และท่าที่อ่านออกก่อนโดน (telegraph)

เอกสาร: `references/vfx-and-sfx-direction.md`, `references/game-feel-and-juice.md`

### Mobile Vision Loop (iOS + Android)

ลูปมือถือต่อสายครบแล้ว: ตั้ง `capture.type` เป็น `ios-sim` หรือ `android` ใน
`vision-loop.config.json` แล้วประกาศ `mobile.cases` — `vision-loop` จะ capture
ทุกเคสจาก simulator/emulator ที่ boot อยู่ คำนวณ metrics แบบ deterministic ต่อเคส
และเขียน verdict ของ judge (`metadata/<label>__mobile__<key>.mobile.judgment.json`) ส่วนที่เป็น
web-only จะ log ว่า `skipped (web-only section)` และเกตของรันคือชุด verdict ของ
mobileChecks — เคสไหน fail รันจะ exit 1 เนื่องจากเกตเว็บไม่เกี่ยวกับรันมือถือ
summary จึงยกพื้นคะแนนเว็บ (`minScore`/`minConfidence`) ออก แทนที่จะ fail รันที่
สะอาดด้วยคะแนนที่ไม่ได้ใช้งาน

การ compare ภาพวิ่งบนเมทริกซ์เคสเดียวกันนี้: รันครั้งแรกด้วย `--refresh-reference`
เพื่อ capture ภาพ reference ใหม่จากอุปกรณ์ที่ boot อยู่ แล้วทุกรันถัดไปจะ diff
ภาพ current เทียบกับ reference ที่เก็บไว้ด้วยเกต pixel + perceptual มาตรฐาน —
diff ระดับ blocker หรือ major จะ fail รันทันที `masks` ต่อเคสคือสี่เหลี่ยมในพิกัด
PNG (`{"x":0,"y":0,"width":100,"height":44}` หรือ shorthand `w`/`h`) สำหรับปิดบัง
จุดที่เปลี่ยนตลอด เช่น นาฬิกา ไอคอนแบตเตอรี ก่อน diff

```json
{
  "capture": { "type": "ios-sim" },
  "mobile": {
    "udid": "booted",
    "cases": [ { "key": "home", "label": "home", "settleMs": 1500 } ],
    "judge": { "thresholds": { "maxEmptyCells": 3 } }
  }
}
```

```bash
node scripts/vision-loop.mjs --config vision-loop.config.json --refresh-reference  # ปลูก/รีเฟรช baseline
node scripts/vision-loop.mjs --config vision-loop.config.json                      # capture + compare เทียบ baseline
```

สำหรับ Android ใช้ `capture.type: "android"` กับ `mobile.serial` (ดีฟอลต์
`emulator-5554`; `mobile.adbPath` ชี้ไปที่ adb binary เฉพาะได้) และแต่ละเคสใช้
`udid`/`serial` ทับค่าระดับอุปกรณ์ได้ (เฉพาะ config ที่ไม่มี device matrix)

#### Device matrix

ประกาศ `mobile.devices` เพื่อ fan-out ทุกเคสไปหลาย simulator/emulator/เครื่องจริง
ในรันเดียว — capture, compare และ checks นับเคสผ่านกฎ identity เดียวกันเสมอ
จึงไม่มีทางเบี่ยงกัน:

```json
{
  "capture": { "type": "ios-sim" },
  "mobile": {
    "devices": [
      { "key": "iphone16", "platform": "ios-sim", "udid": "<udid-simulator-ของคุณ>" },
      { "key": "pixel6", "platform": "android", "serial": "emulator-5554" }
    ],
    "cases": [
      { "key": "home", "label": "home", "settleMs": 1500 },
      { "key": "chat", "label": "chat", "devices": ["iphone16"], "openUrl": "myapp://chat" }
    ]
  }
}
```

ความหมายของ fan-out:

- ทุกเคสรันครั้งหนึ่ง **ต่ออุปกรณ์** — `devices: ["iphone16"]` บนเคสจำกัดให้รัน
  เฉพาะ subset นั้น (ถ้าไม่ใส่หรือเป็น `null` แปลว่ารันทุกเครื่องที่ประกาศไว้
  และ key ที่ไม่รู้จักจะถูก reject ตอน validate)
- artifact ทั้งหมดลงดิสก์ภายใต้ identity ต่ออุปกรณ์
  `<label>__<deviceKey>__<key>` — PNG ของ reference/current, diff, metadata
  ของ capture, verdict ของ judge, แถว compare และการ์ด visual evidence ทุกอย่าง
  ผูกกับ identity เดียวกัน `--refresh-reference` เขียน reference **ชุดละอุปกรณ์**
  และรันถัดไป diff แต่ละเครื่องเทียบกับ reference ของเครื่องตัวเอง
- แต่ละแถว device มี endpoint ของตัวเอง (`udid` สำหรับ iOS, `serial` สำหรับ
  Android) และ `platform` ของตัวเอง — รันเดียวผสม iPhone กับ Pixel ได้ เมื่อใช้
  matrix, `udid`/`serial` ระดับเคสจะ **ถูก reject ตอน validate** เพราะ identity
  ของ artifact เป็นแบบต่ออุปกรณ์ — endpoint ระดับเคสจะทำหลักฐานสลับเครื่อง
  จำกัดเคสให้รันเฉพาะ subset ได้ แต่ใส่ endpoint บนเคสไม่ได้
- backward compatibility แน่นหนา: config ที่ไม่มี `mobile.devices` ทำงานเหมือน
  เดิมทุกประการ — identity แบบ `__mobile__` ออกมาเหมือนเดิม byte-for-byte
  reference และ baseline เดิมจึง join ได้ต่อเนื่อง

ตัวอย่างที่เอาไปใช้ต่อได้พร้อมคำอธิบายทุกฟิลด์อยู่ที่
`examples/mobile-matrix.config.json` (เปลี่ยน UDID/serial ที่เป็น placeholder
ให้เป็นของเครื่องตัวเองก่อนรัน)

คำสั่งเดี่ยวสำหรับ capture ครั้งเดียวและการตัดสินแบบไม่ต้องเห็นภาพยังใช้ได้เหมือนเดิม:

```bash
npm run capture:mobile -- --out .fx/cur.png --label chat --launch <bundleId> --settle 2
npm run capture:mobile -- --platform android --serial emulator-5554 --out .fx/home.png --label home --settle 2
npm run vision:metrics -- --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
npm run vision:judge -- --judge metrics --metrics .fx/metrics.json --thresholds '{"maxEmptyCells":3}' --out .fx/verdict.json
```

การ capture บน Android ใช้ `adb screencap` (โหมด `exec-out` พร้อม fallback แบบ
`pull` ผ่าน /sdcard) ทุก PNG ที่ capture จากมือถือบันทึก sha256 ไว้ใน metadata และ
metrics บันทึก hash ของภาพต้นทาง — ส่ง `--verify-source` (คู่กับ `--capture`) ให้
`vision:judge` เพื่อ fail เมื่อ metrics ไม่ได้คำนวณจาก capture ที่กำลังตัดสินอยู่พอดี:

```bash
npm run vision:judge -- --judge metrics --metrics .fx/metrics.json --capture .fx/cur.png --verify-source --out .fx/verdict.json
```

### Visual Evidence Report

ไฟล์ HTML ไฟล์เดียวต่อหนึ่งรัน — thumbnail ของ reference/current/diff ทุกเคส, metrics แบบ deterministic, verdict และ findings, hash sha256 สำหรับตรวจยืนยันหลักฐาน, ภาพรวมเกตทั้งบันได และ provenance ของรัน — reviewer อ่านครบทั้งรันแบบออฟไลน์ได้โดยไม่ต้องรื้อ artifact tree เอง inline CSS, รูปเป็น base64, ไม่มี JavaScript, ไม่อ้างอิงไฟล์ภายนอก: เปิด `reports/visual-evidence.html` ในเบราว์เซอร์ได้เลย (ดับเบิลคลิกได้ ไม่ต้อง serve)

เปิด flag บน `vision-loop` ได้ทั้งเว็บและมือถือ หรือสร้างย้อนหลังจาก output directory ของรันเก่า:

```bash
node scripts/vision-loop.mjs --config vision-loop.config.json --evidence-visual   # สร้างหลัง run summary
npm run evidence:visual -- --output-dir artifacts/vision-loop                      # ชี้ output dir ของรันไหนก็ได้
```

## วงจรการทำงาน

```text
Request
→ Skill Routing
→ Context Exploration
→ เปรียบเทียบแนวทาง
→ Design Approval
→ Executable Plan
→ Safe Workspace
→ Hash-linked Recovery Ledger
→ RED–GREEN–REFACTOR / Scientific Debugging
→ Vertical Slice
→ Frontend + Full-Stack Gates
→ Independent Task Review
→ Bounded Fix Loop + Scoped Re-review
→ Final Whole-change Review
→ Claims ที่ผูกกับหลักฐานสดใหม่
→ Process Hard Gate
→ Full-Stack Hard Gate
→ ผู้ใช้เลือก Integration
```

### งานขนาน

ระบบอนุญาต Parallel Analysis เมื่อปัญหาเป็นอิสระ แต่ Parallel Implementation จะผ่านได้ต่อเมื่อ Task ที่พร้อมทำงานไม่แตะไฟล์เดียวกัน ไม่ใช้ Exclusive Resource ร่วมกัน และไม่มี Mutable State ร่วมกัน Task-graph engine จะสร้าง execution waves ที่ปลอดภัย

### การกู้สถานะเมื่อ Context หาย

Process Ledger เป็น Hash Chain แบบ append-only บันทึก Plan ID, Lifecycle State, Task State, Fix Round, Finding และ Last Hash Controller ใหม่จึงกู้ตำแหน่งงานจาก Artifact ได้ ไม่ต้องเชื่อความจำจากบทสนทนา

### Review Governance

Review ทุก Task ต้องผูกกับ Brief และ Diff ที่แน่นอน พร้อมทั้ง Spec Verdict และ Quality Verdict Implementer ห้ามอนุมัติงานตัวเอง Finding สำคัญต้องถูกแก้และ Re-review วงรอบแก้ถูกจำกัดไม่เกินห้ารอบ และ Finding ที่เป็นโครงสร้างสำคัญห้ามถูกพักเพื่อให้ระบบดูผ่าน

### Claim Governance

คำกล่าวอ้าง เช่น tests-pass, bug-fixed, visual-match, security-gates-pass และ production-ready ต้องมี Evidence Type ที่ตรงกัน สดใหม่ ผ่านจริง ครอบคลุมขอบเขต และใช้ Artifact Hash เดียวกัน ระบบไม่รองรับคำกล่าวอ้างแบบสัมบูรณ์ว่า “secure”

## Self-conformance และ Deterministic Release

ตรวจตัว Skill ว่า Frontmatter, References, Pressure Scenarios, Superpowers Coverage, TDD Deployment Evidence และ CLI Surface ครบตาม Contract:

```bash
npm run skill:conformance -- --root .
```

สร้างเอกสารรวมจากไฟล์ Modular ต้นทางแบบ Deterministic:

```bash
npm run docs:all-in-one
```

สร้าง Release Directory, ZIP, Manifest, Checksums และไฟล์ SHA-256 ของ ZIP:

```bash
npm run release:build -- \
  --source . \
  --output ../fullstack-vision-engineering-pro-v5 \
  --archive ../fullstack-vision-engineering-pro-v6.0.0.zip
```

Release Builder จะข้าม Symlink และ Development State, ปฏิเสธ Path ที่ไม่ปลอดภัย, บังคับ Single-root ZIP และตรวจ Local Headers, Central Directory, CRC, ขนาดไฟล์, Duplicate Members, Checksum และ Deterministic Ordering ก่อนรายงานว่าผ่าน

## เอกสารสำคัญ

- `SKILL.md`
- `PLAYBOOKS.md` — ขั้นตอนพร้อมใช้สำหรับรีดีไซน์ เทียบต้นฉบับ ฉาก แมพ ชุด asset เอฟเฟกต์และเสียง และการส่งงาน
- `flow/README.md` — เอกสาร flow ทั้งสิบสี่ฉบับ discipline ละฉบับ (ตัวจริงของ flow layer)
- `GOLDEN_PATH.md` — เส้นทางตรงสำหรับ solo dev ทีละ gate พร้อม walkthrough จริงใน `examples/golden-path/`
- `references/operating-modes_TH.md` — สิบโหมด สัญญาของแต่ละโหมด และวิธีข้ามโหมด
- `references/recheck-protocol_TH.md` — การตรวจงานตัวเองก่อนเสนอ
- `SUPERPOWERS_ADAPTATION_MATRIX.md`
- `MIGRATION_V3_TO_V4.md` และ `MIGRATION_V4_TO_V5.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `references/aesthetic-direction-protocol.md` — จุดที่ทิศทางด้านความงามเชื่อมเข้ากับกระบวนการ
- `references/aesthetic-principles.md` และ `references/aesthetic-scoring-anchors.md` — ตัวโมเดล วิธีทดสอบ และ Anchor ของคะแนน
- `references/`
- `schemas/`
- `examples/process/`
- `templates/`
- `agents/` และ `prompts/`
- `tests/process-pressure-scenarios-v4.md`

## ข้อจำกัดที่ต้องรายงานตรงไปตรงมา

การตรวจ Offline ยืนยัน Syntax, Unit Tests, Config, Engine, CLI, Checksum และ ZIP ได้ แต่ไม่สามารถยืนยันสิ่งต่อไปนี้โดยไม่มีระบบจริง:

- ภาพ UI จาก Browser ของโปรเจกต์เป้าหมาย
- Authorization และ Secret Configuration ใน Production
- Lock/Load ของ Database และ Rollback จริง
- Vulnerability ปัจจุบันจากฐานข้อมูลภายนอก
- Distributed Trace, Alert และ SLO Delivery
- Deployment จริง
- พฤติกรรมหลาย Agent อย่างเป็นอิสระ เมื่อ Host ไม่มี subagent capability

สิ่งที่ยังตรวจไม่ได้จะถูกแสดงเป็น Verification Gap ไม่ถูกนับเป็น Pass
