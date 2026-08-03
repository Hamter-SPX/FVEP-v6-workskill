# การสำรวจทิศทางภาพด้วย ImageGen (สรุปภาษาไทย)

ฉบับเต็ม: `references/visual-direction-exploration.md` · เทมเพลต: `templates/visual-direction-spec.md`

## เจตนา

เมื่อผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign Agent ต้อง **Gen ตัวอย่าง 2–3 แบบให้เลือก** แล้ว **เขียน spec .md ว่าชอบอะไร** และ **รอ confirm อีกรอบ** ก่อนลงแผน/โค้ด

## ถ้าส่งรูปไม่ได้ / แชทโชว์รูปไม่ได้

ยังต้องให้เห็นเป็น **รูป 3 แบบ** — ไม่ถอยไปเป็นข้อความอย่างเดียว:

1. รัน `npm run direction:runtime` เพื่อรู้ว่าอยู่ Cursor / Codex / CLI  
2. Gen รูป option 1/2/3 ลงไฟล์ (ถ้า ImageGen มี) หรือใช้โหมด `prose-with-gap` ถ้าไม่มี — **ห้ามแกล้งว่ามีรูป**  
3. ถ้ารูปมีแต่แชทโชว์ไม่ได้ → รัน `npm run direction:gallery`  
4. เปิดหน้า `design/direction-options/index.html` ใน browser ให้เทียบข้างกัน  
5. วางลิงก์ `file://` ในแชท แล้วรอเลือกเลข

ตรวจ runtime:

```bash
npm run direction:runtime -- --image-gen true    # มี GenerateImage / imagegen
npm run direction:runtime -- --image-gen false   # ไม่มี ImageGen
```

Prompt แยก IDE/CLI: `prompts/visual-direction-prompt-pack.md`  
ตัวอย่างครบ: `examples/direction-camera/`  
ติด rule+hook ในโปรเจกต์:

```bash
npm run direction:cursor-install -- --dir /path/to/app
```

## ลำดับ

```text
อ่านรูปอ้างอิง (หรือบันทึกว่าส่งรูปไม่ได้) → Gen ภาพ 1 / 2 / 3
→ โชว์ในแชท และ/หรือ เปิด gallery ใน browser
→ หยุดรอเลือกเลข
→ เขียน design/visual-direction-spec.md
→ หยุดรอ confirm: เริ่มเขียน | ปรับต่อ | เลือกใหม่
→ ถ้า「เริ่มเขียน」→ profile + contract (หรือ `npm run direction:sync`) → แผน / implement
```

Scaffold ล่วงหน้าได้ด้วย:

```bash
npm run direction:init -- --product "..."
npm run direction:sync -- --check
```

รอบ「ปรับต่อ」บันทึก diff ไว้ใน spec:

```bash
npm run direction:iterate -- --from 2 --to 2b \
  --image design/direction-options/direction-option-2b.png \
  --keep 'Layout จาก option 2' \
  --change 'แก้แค่ icon' \
  --note 'เหลือ layout แก้แค่ icon'
```

ก่อน merge UI ใน CI (ไม่ต้องเปิด browser):

```bash
npm run direction:gate -- --check-sync
```

## ข้อความถาม confirm (ใช้หลังเขียน spec)

```text
สรุปทิศทางตามที่เลือกไว้ใน spec แล้วครับ
ตอบว่า:
- 「เริ่มเขียน」ถ้าโอเค ให้ทำแผนแล้วลงมือ
- 「ปรับต่อ」พร้อมจุดที่อยากแก้
- 「เลือกใหม่」ถ้าอยากดูตัวเลือกอีกครั้ง
```
