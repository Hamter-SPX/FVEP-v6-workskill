# โปรโตคอลทิศทาง Aesthetic (สรุปภาษาไทย)

เอกสารฉบับเต็มภาษาอังกฤษอยู่ที่ `references/aesthetic-direction-protocol.md` และคู่มือรันจริงอยู่ที่ `AESTHETIC_WALKTHROUGH.md`

เมื่อผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign ให้ทำ `references/visual-direction-exploration.md` ก่อน: Gen ตัวอย่าง 1/2/3 → เขียน `visual-direction-spec.md` → รอ confirm「เริ่มเขียน / ปรับต่อ / เลือกใหม่」แล้วค่อยเขียน profile

## บทบาท

Aesthetic direction เป็นส่วนของงานออกแบบ ไม่ใช่เฟสแยก ตั้งทิศก่อนลงมือทำ และตรวจพร้อม vision loop

```text
สำรวจบริบท → ตั้ง aesthetic profile → อนุมัติ design contract
→ implement (โครงสร้างก่อนผิว, static ก่อน motion)
→ audit เชิงกล + aesthetic review อิสระ → aesthetic gate
```

## Profile ที่ใช้ได้จริง

ทุกตำแหน่งบนแกนบุคลิกต้องตรวจกับเรนเดอร์ได้ ถ้าผู้ตรวจบอกไม่ได้ว่าตรงหรือไม่ ต้องเขียนใหม่ เก็บตาม `schemas/aesthetic-profile.schema.json` และอ้างจาก design contract ไม่ต้องคัดลอกซ้ำ

## คำสั่งหลัก

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run aesthetics:review -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json
```

เมื่อ `aesthetics.enabled` เป็น true วิชั่นลูปจะโหลด profile / measurements / review เข้า run summary หากหลักฐานที่บังคับขาด Gate จะ fail ไม่ใช่ skip เงียบ ๆ

## กติกาตัดสิน

- เฉลี่ยถ่วงน้ำหนักชดเชยมิติที่ต่ำกว่า floor ไม่ได้
- คะแนนต่ำกว่า 3 ต้องมี finding
- คะแนน 5 ต้องมีผลการทดสอบที่ทำจริง
- ผู้ตรวจ aesthetic ต้องไม่ใช่ผู้ implement
- คะแนนเปรียบเทียบภาพ (fidelity) สูงไม่ได้ชดเชย craft ที่แย่

## อ้างอิง

- `references/aesthetic-principles.md` — หลักการ + การทดสอบ 9 แบบ
- `references/aesthetic-scoring-anchors.md` — หลักยึดคะแนน 0–5
- `references/aesthetic-principles_TH.md` — สรุปหลักการภาษาไทย
