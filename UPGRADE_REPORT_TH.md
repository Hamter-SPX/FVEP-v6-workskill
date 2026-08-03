# รายงานการอัปเกรด Full-Stack Vision Engineering Pro v4.0.0

## เป้าหมายของรุ่น v4

รุ่น v4 ยกระดับแพ็กเกจ v3 จากชุดตรวจ Frontend/Full-Stack ให้เป็น **Engineering Process Kernel** ที่ตรวจได้เชิงโครงสร้าง ไม่พึ่งเพียงคำสั่งใน Prompt และไม่ถือว่าการ Build ผ่านเท่ากับงานพร้อม Release

แนวทางถูกพัฒนาจากการวิเคราะห์หลักการของ Superpowers ทุกสกิลที่ติดตั้ง แล้วดัดแปลงใหม่ให้เหมาะกับงาน Product Design, Frontend, Backend, API, Database, Security, Reliability, Debugging และ Release Governance โดยไม่คัดลอกเนื้อหาเดิมมาเรียงรวมกัน

## สิ่งที่เพิ่มเหนือ v3

### 1. Process Routing และ Precedence

ระบบจำแนกงาน Feature, Bug, Incident, Refactor, Skill Authoring, Review และ Integration แล้วเลือกกระบวนการที่ต้องใช้ตามลำดับ พร้อมเคารพ User/Repository Instructions ก่อน Process Defaults

### 2. Design Before Implementation

งานสร้างสรรค์หรืองานสถาปัตยกรรมต้องมี Context Exploration, ทางเลือกอย่างน้อยสองแนวทาง, Trade-offs, Recommendation, Architecture, Data Flow, Error Handling, Testing และ Approval ก่อนเริ่ม Implementation

### 3. Executable Planning

Plan ถูกตรวจเรื่อง Task IDs, Dependency Graph, File Ownership, Producer/Consumer Interfaces, RED/GREEN Commands, Expected Results, Placeholders, Cycles และ Parallel Conflict ก่อนอนุญาตให้ลงมือ

### 4. Workspace Isolation และ Recovery Ledger

ระบบแยก Normal Checkout, Linked Worktree, Submodule, Detached HEAD และ Non-Git Copy พร้อมบล็อก Protected Branch โดยไม่มี Authorization ใช้ Ledger แบบ hash-linked เพื่อให้กู้สถานะหลัง Context Loss ได้โดยไม่เชื่อความจำของ Agent

### 5. TDD Evidence ที่พิสูจน์ลำดับเวลา

ไม่ได้ตรวจเพียงว่ามี Test แต่ตรวจว่า:

- RED เกิดก่อน Production Change
- RED ล้มด้วยเหตุผลที่ตรงกับ Behavior ที่ต้องเพิ่มหรือ Bug ที่ต้องแก้
- GREEN ผูกกับ Code/Test Hash ชุดปัจจุบัน
- High-risk behavior มี Negative Control, Mutation หรือ Revert Proof
- Refactor มี Fresh Passing Verification

ระหว่างการพัฒนา Task 1–9 มี milestone ที่ Full Suite ผ่าน **169/169** tests ก่อนเพิ่มระบบ Release Packaging และหลังเพิ่ม Release/Documentation Engines ชุด Source Suite ผ่าน **179/179** tests ก่อนตรวจซ้ำจาก ZIP ที่แตกใหม่

### 6. Scientific Debugging

Debug Session ต้องมี Reproduction, Last Confirmed-good Boundary, First Confirmed-bad Boundary, Supporting/Contradicting Evidence, Hypothesis เดียวต่อ Experiment, Falsification Test และ Regression RED ก่อน Fix หากลองแก้ล้มเหลวหลายครั้ง ระบบจะบังคับ Architecture Escalation แทนการเดาต่อ

### 7. Independent Review และ Feedback Governance

Implementer ไม่สามารถอนุมัติงานตนเอง Review ต้องมีทั้ง Spec Verdict และ Quality Verdict ผูกกับ Brief และ Diff Range เดียวกัน Findings ระดับ Critical/Important ต้องถูกแก้และ Re-review หรือได้รับ Technical Ruling ตาม Circuit Breaker ที่กำหนด ห้ามหายจากรายงานแบบเงียบ ๆ

### 8. Claim Verification

คำกล่าวอ้าง เช่น Finished, Fixed, Pixel-perfect, Secure หรือ Production-ready ต้องผูกกับ Evidence Type, Artifact Hash, Scope, Timestamp และ Freshness ที่ถูกต้อง คะแนนด้านอื่นไม่สามารถเฉลี่ยกลบ Evidence ที่หายหรือ Hard Failure ได้

### 9. Human-owned Integration

Merge, Push, Pull Request, Keep-as-is, Cleanup และ Discard เป็นการตัดสินใจของผู้ใช้ ระบบเตรียมหลักฐานและตรวจเงื่อนไขได้ แต่ไม่เลือกแทน Discard ต้องใช้ Confirmation Token ที่ตรงตาม Contract และระบุรายการที่จะลบครบ

### 10. Full-Stack Process Hard Gate

`process-report.json` เป็น Required Hard Gate ของ `fullstack.config.json` โดยค่าเริ่มต้น ดังนั้น Frontend, Backend, Security หรือ Reliability ที่ได้คะแนนสูงไม่สามารถกลบ TDD, Review หรือ Verification Evidence ที่ไม่ครบได้

### 11. Skill Self-Conformance

เพิ่มการตรวจ SKILL frontmatter, Trigger Description, Required References, Pressure Categories, Superpowers Adaptation Coverage, RED/GREEN Deployment Evidence, Package Identity และ Process CLI Surface จากไฟล์จริง

### 12. Deterministic ZIP และ Supply-chain-safe Packaging

Release Builder รุ่น v4:

- ไม่ติดตาม Symbolic Link
- ไม่รวม `.git`, `.superpowers`, `.worktrees`, `node_modules`, `artifacts`, coverage และ build output
- ปฏิเสธ absolute paths, drive paths, backslash และ `..` traversal
- สร้าง `MANIFEST.json` และ `CHECKSUMS.sha256`
- สร้าง **Deterministic ZIP** ที่ input เดิมให้ byte-identical archive
- ตรวจ Central Directory, Local Headers, CRC, compressed/uncompressed sizes, duplicate members และ single-root prefix
- รักษา executable mode ของ `setup.sh` และ CLI scripts ใน Release Directory/ZIP
- สร้าง SHA-256 sidecar สำหรับ ZIP

## ระบบเดิมที่รักษาไว้

- Frontend Vision-in-the-loop, Screenshot/Perceptual/Region Diff
- Responsive, UI State, Accessibility, Interaction และ Performance Gates
- Baseline Governance และ Semantic Visual Review
- API Compatibility, Architecture, Data Migration, Security, Resilience และ Observability
- Dependency Lock Integrity, Incident Triage และ Risk Register

## ข้อจำกัดที่ไม่กล่าวอ้างเกินจริง

แพ็กเกจไม่สามารถสร้าง Browser, Subagent Runtime, Git Remote, Production Database, Telemetry หรือ Deployment Environment ที่ Host ไม่มีให้ได้ Static Scanner ไม่ใช่ Security Certification และ Deterministic Engine Tests ไม่เท่ากับการรัน Pressure Scenario ด้วย Agent อิสระหลายบริบท

Live Browser, Database Lock, Production Authorization, Telemetry, Alert Delivery และ Rollback ต้องยืนยันกับ Target System จริงก่อนใช้คำว่า Production-ready
