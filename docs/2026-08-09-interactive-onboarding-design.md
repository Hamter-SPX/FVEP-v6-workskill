# Interactive Onboarding (npm run tutorial) — Design

**Date:** 2026-08-09
**Status:** Approved (design)

## Goal

พา dev ใหม่เข้าสู่ GOLDEN_PATH 8 gates แบบ "learn by doing" ผ่าน `npm run tutorial` — stdout walkthrough จริงบน toy repo (`examples/golden-path/`) 3 โหมด: interactive (รอ Enter), auto (ไหล), off (static replay จาก outputs เดิมของ toy)

## Components

1. **`lib/tutorial-engine.mjs`**
   - `TUTORIAL_STEPS`: 8 items `{slug, title th+en, why, command? (npm script ABSOLUTE real), learn (1-line learning point), gate? (expected exit/std marker)}` ตามลำดับ: route, direction(optional — note), design-contract, plan, isolation, implement-tdd, quality-gate, verify-claims (+ integrate documented-only)
   - `runStep(step, {toyDir, exec})` — spawnSync command `(command's shell-word split safe array)` cwd=toyDir, timeout 30s, capture stdout/stderr/exit
   - `renderStep(step, result, {mode})` → formatted block with RUN transcript (≤ 30 lines, tail-first)
   - `TUTORIAL_STEP_SCHEMA` assert steps—each `command` strictly uses existing package.json scripts (lint-minded)
   - OFF mode: `replayStep(step, toyDir)` — อ่าน committed outputs จาก `examples/golden-path/README.md`/artifacts แทนการรัน

2. **`scripts/tutorial.mjs`**
   - `--interactive` (default on TTY), `--auto`, `--off`, `--from <n>`, `--json`, `-h`
   - exit 0 เมื่อจบครบ; interactive ใช้ readline pauses ระหว่าง steps; non-TTY → auto behavior
   - run ใน tmp copy ของ toy (fs.cpSync → /tmp/fvep-tutorial-<ts>) — ไม่มือสกปรกตัวอย่าง (clean up ด้วย)

3. **Tests**
   - step data: ทุก command อยู่ใน package.json scripts (ยืม pattern lint)
   - engine: runner mock exec captures exit + output; render ครบ fields; off-mode replay reads artifact
   - CLI: `--off --auto` exits 0 prints 8 steps; `--from` resumes

4. **Docs**: README/TH + CHANGELOG + bundle regen

## Mode logic (สำคัญ)
- interactive: readline `press Enter…` per step (skip if !TTY)
- auto: no pauses
- off: ไม่ spawn คำสั่งจริง — replay static (แสดงเป็น OFF badge ชัดเจน)

## Non-goals
- ไม่สร้างแอปให้ผู้เรียน; ไม่มี TUI frameworks; ไม่แก้ toy repo จริง; ไม่มีภาษา zh (เก็บ th+en ตามโครง package)
