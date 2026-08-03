# รายงานการอัปเกรด v4 → v5 (ภาษาไทย)

## สรุปผู้บริหาร

v5 เพิ่ม **Aesthetic Direction Layer** เข้าไปในชุดเดิมทั้งหมด โดยไม่แตะพื้นผิวคำสั่ง สัญญา หรือ Gate ของ v4 เลย

โจทย์ที่ v5 แก้คือช่องว่างเชิงโครงสร้าง: รุ่นก่อนหน้าเก่งเรื่อง "ไม่ห่วย" แต่ไม่มีโมเดลว่า "อะไรคือดี" เอกสาร `references/design-director.md` ระบุชัดว่าห้ามใช้ Style Label เป็น Thesis, `agents/accessibility-interaction-reviewer.md` ระบุว่าห้ามเอา Aesthetic Preference มาแทน Task Impact และ `prompts/design-review.md` ระบุให้ตรวจเทียบ Brief แทน Generic Taste กฎเหล่านี้ถูกต้องและยังคงอยู่ แต่ผลข้างเคียงคือไม่มีเกณฑ์เชิงบวกเหลืออยู่เลย และคำว่า "Emotional and brand character" ปรากฏเพียงบรรทัดเดียวโดยไม่มีคำอธิบายต่อ

## แนวทางที่เลือก

เน้น **หลักความงามสากล** คืออธิบายกลไกการรับรู้และการจัดระเบียบทางสายตาที่คงที่ข้ามผลิตภัณฑ์ ข้ามกลุ่มผู้ใช้ และข้ามยุค จึงไม่ต้องพึ่งข้อมูลเทรนด์หรือการวิจัยผู้ใช้เพื่อให้ยังใช้ได้

กลไกหลักสามข้อที่อธิบายปฏิกิริยาที่คนเรียกว่า "รสนิยม" ได้เกือบทั้งหมด:

1. **Processing fluency** — คนตีความ "ความง่ายในการถอดรหัสภาพ" ว่าเป็นคุณสมบัติของภาพนั้น อินเทอร์เฟซที่คลี่เป็นโครงสร้างได้เร็วจึงรู้สึกสงบ มีฝีมือ และน่าเชื่อถือ
2. **Perceptual organization** — สายตาจัดกลุ่มก่อนอ่าน เมื่อการจัดกลุ่มที่เกิดจากระยะห่างและการจัดแนวตรงกับโครงสร้างเชิงตรรกะของเนื้อหา งานจะรู้สึกเป็นระเบียบ
3. **Typicality with controlled novelty** — ความชอบสูงสุดอยู่ที่จุดที่แปลกใหม่ที่สุดเท่าที่ยังจำได้ว่าคืออะไร ทางออกคือคงโครงสร้างไว้ตามขนบ แล้วใช้ความแปลกใหม่ในตำแหน่งที่จงใจไม่กี่จุด

## สิ่งที่เพิ่มเข้ามา

### เอกสารอ้างอิง 12+ ไฟล์

| ไฟล์ | เนื้อหา |
|---|---|
| `references/aesthetic-direction-protocol.md` | จุดที่ทิศทางด้านความงามเชื่อมเข้ากับกระบวนการและ Gate |
| `references/aesthetic-principles.md` | หลักการ 7 ข้อ งบความแปลกใหม่ และการทดสอบ 9 แบบ |
| `references/aesthetic-scoring-anchors.md` | Anchor ครบทุกระดับ 0–5 น้ำหนักรายมิติ และกฎการตัดสิน |
| `references/visual-craft-standards.md` | Optical Alignment, Radius ซ้อน, ฟิสิกส์ของเงา, เส้นขอบ, Gradient, Micro-typography |
| `references/color-system-and-perception.md` | พื้นที่สีเชิงการรับรู้ การสร้าง Palette Contrast และปรากฏการณ์ทางสายตา |
| `references/typographic-system-quality.md` | Scale, Role, Line Height, Measure, การตัดบรรทัด และการจับคู่ฟอนต์ |
| `references/spatial-composition-and-rhythm.md` | Spacing Scale, Proximity, Grid, Density, Vertical Rhythm |
| `references/motion-quality-standards.md` | จุดประสงค์ Duration Easing Choreography Interruption Reduced Motion |
| `references/brand-personality-and-tone.md` | แกนบุคลิก 5 แกน พร้อมตารางแปลงเป็นการตัดสินใจด้านดีไซน์ และน้ำเสียงรายสถานะ |
| `references/visual-style-lexicon.md` | Archetype 9 แบบ นิยามด้วยลายเซ็นที่วัดได้ |
| `references/copy-voice-and-microcopy.md` | แกนน้ำเสียง รูปแบบ Microcopy ความสมจริงของเนื้อหา |
| `references/visual-direction-exploration.md` | เมื่อ redesign จากภาพหน้าจอ ให้ Gen ตัวอย่างด้วย ImageGen เป็นตัวเลือก 1/2/3 แล้วรอให้ผู้ใช้เลือกก่อนเขียน Profile |

### Engine 9 ตัว (โค้ดรันได้จริง)

| Engine | สิ่งที่ตรวจ |
|---|---|
| `lib/color-harmony-engine.mjs` | แปลง sRGB → OKLCH, ความสม่ำเสมอของ Ramp, Contrast แบบ WCAG, การจำแนก Harmony, Status ที่พึ่งสีอย่างเดียว, Dark Theme แบบกลับด้าน |
| `lib/typography-scale-engine.mjs` | ขั้นที่แยกไม่ออก จำนวนขนาด Role Line Height ตามเส้นโค้ง Measure น้ำหนักที่ต่างกันน้อยเกิน Tabular Figures |
| `lib/spacing-rhythm-engine.mjs` | ค่านอก Scale สัดส่วนการจัดกลุ่ม การซ้อนกลับด้าน การบีบ Macro Spacing จำนวนแนวขอบ |
| `lib/craft-precision-engine.mjs` | Radius ที่ไม่ซ้อนกัน แหล่งกำเนิดแสงที่ขัดกัน เงาชั้นเดียวที่ Elevation สูง เส้นขอบต่ำกว่า 1px ตระกูลไอคอนปนกัน |
| `lib/motion-quality-engine.mjs` | ตระกูล Duration, Linear บนการเคลื่อนที่, การ Animate Layout Property, การขัดจังหวะ, Stagger ที่ไม่จำกัด, Reduced Motion |
| `lib/style-signature-engine.mjs` | คำนวณลายเซ็น 8 มิติ จำแนก Archetype และตรวจการเบี่ยงเบนจากที่ประกาศไว้ |
| `lib/aesthetic-profile-engine.mjs` | ความจำเพาะของ Profile ภาษาที่ไม่ผูกมัด ความขัดแย้งระหว่างแกนกับระบบ |
| `lib/aesthetic-review-engine.mjs` | คะแนนขั้นต่ำรายมิติ Finding ที่ต้องมี ความเป็นอิสระของผู้ตรวจ ความสดใหม่ และการผูกกับ Artifact |
| `lib/aesthetic-audit-engine.mjs` | รวมทุกส่วนเป็นรายงานเดียวและแปลงเป็น Gate |

### พื้นผิวใหม่

- คำสั่ง `npm run audit:aesthetics` และ `npm run aesthetics:review`
- Schema `aesthetic-profile` และ `aesthetic-review` พร้อมส่วนขยายของ `design-contract`
- Gate ที่แปดชื่อ `aesthetic` ใน Quality Model
- Agent `aesthetic-critic`, Prompt รวม `visual-direction-exploration`, Template 2 ตัว, Example 3 ไฟล์
- Pressure Scenario 18 ข้อใน `tests/aesthetic-pressure-scenarios-v5.md`
- โปรโตคอล ImageGen: ส่งรูป redesign → Gen ตัวเลือก 1/2/3 → เขียน `visual-direction-spec.md` → confirm เริ่มเขียน/ปรับต่อ/เลือกใหม่ → ค่อยผูก aesthetic profile

## กฎที่บังคับใช้จริง ไม่ใช่คำแนะนำ

สามข้อนี้ทำให้ Review ที่เดิม "ผ่าน" ด้วยค่าเฉลี่ย กลายเป็นไม่ผ่าน:

1. **มิติที่ต่ำกว่าขั้นต่ำทำให้ตกทันที** ไม่ว่าค่าเฉลี่ยถ่วงน้ำหนักจะสูงแค่ไหน — เพราะการเฉลี่ยคือวิธีที่ข้อบกพร่องร้ายแรงหนึ่งข้อหายไปในตัวเลขที่ดูดี
2. **ให้คะแนนต่ำกว่า 3 โดยไม่มี Finding ถือเป็นความเห็น ไม่ใช่การรีวิว** และถูกปฏิเสธ
3. **ข้อบกพร่องที่เกิดทั้งระบบพักเป็น Residual ไม่ได้** ต้องยกระดับความรุนแรง

เมื่อเปิด `requireTestEvidence` การให้ 5 ต้องมีการทดสอบที่บันทึกไว้อย่างน้อยหนึ่งอย่าง เพราะ 5 คือการยืนยันว่าได้ทดสอบแล้ว ไม่ใช่ว่าบังเอิญไม่เห็นข้อบกพร่อง

## ความเข้ากันได้

- คำสั่ง Schema Contract และรูปแบบรายงานของ v4 ไม่เปลี่ยนแปลง
- `DEFAULT_GATE_WEIGHTS` เพิ่ม `aesthetic: 10` โดยน้ำหนักเดิมคงที่ และการให้คะแนนหารด้วย Applicable Weight ผลจึงไม่ขยับจนกว่าจะเปิดใช้
- ถ้าไม่ตั้งค่า `aesthetics.enabled` Gate จะรายงาน not-applicable ซึ่งไม่กระทบทั้งคะแนนและ Confidence
- `references/design-director.md` ยังคงห้ามใช้ Style Label เป็น Thesis Style Lexicon ไม่ได้ยกเลิกกฎนั้น แต่ให้ชุดพารามิเตอร์ที่วัดได้สำหรับอธิบายและตรวจจับสไตล์

## หลักฐานการทดสอบ

Baseline ก่อนเริ่มงานไม่ผ่าน มี Test เดิมตกหนึ่งตัวใน `tests/unit/manual-review.test.mjs` เพราะ Fixture ตรึงวันที่ไว้ ขณะที่ Engine ตรวจความสดใหม่แบบเลื่อน 24 ชั่วโมง จึงเริ่มตกเมื่อวันที่ผ่านไป ข้อนี้เป็นข้อบกพร่องที่ติดมาแต่เดิม ไม่ได้เกิดจากงาน v5 และถูกแก้ก่อนเพื่อให้มี Baseline ที่สะอาด

รายละเอียด RED/GREEN รายงานไว้ใน `tests/TDD_EVIDENCE_V5.md` ส่วนผลการตรวจชุดเต็มอยู่ใน `VALIDATION_REPORT.json`

## ข้อจำกัดที่ยังคงอยู่

- Aesthetic Review ต้องใช้ Render ปัจจุบัน หากรันไทม์เปิดเบราว์เซอร์ไม่ได้ จะถือเป็น Verification Gap ไม่ใช่ผ่าน
- การวัดที่ได้จากซอร์สแทนที่จะได้จาก Render ต้องระบุว่าเป็นค่าอนุมาน
- หากไม่มีผู้ตรวจที่เป็นอิสระจาก Implementer การรีวิวจะถูกบันทึกว่าไม่มีการกำกับ และ Gate จะไม่ผ่านด้วยหลักฐานนั้น
- การเทียบหน้าตาจากความทรงจำแทนการ Render ปัจจุบันยังคงเป็นสิ่งต้องห้าม
