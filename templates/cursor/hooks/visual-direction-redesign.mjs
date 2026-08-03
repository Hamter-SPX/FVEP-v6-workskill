#!/usr/bin/env node
/**
 * beforeSubmitPrompt hook — detects screenshot redesign intent.
 *
 * Cursor only allows { continue, user_message } on this event (no context injection).
 * When a redesign trigger matches, we still continue, and print a short user_message
 * so the human sees the protocol reminder. Agent enforcement lives in the Cursor rule
 * templates/cursor/rules/visual-direction-redesign.mdc (alwaysApply).
 *
 * stdin: { prompt, attachments? }
 * stdout: { continue: true, user_message? }
 */
import fs from 'node:fs';
import path from 'node:path';

const REDESIGN = /redesign|restyle|re-?skin|visual\s*direction|moodboard|make\s+it\s+look|ปรับ\s*ui|เปลี่ยน\s*ดีไซน์|รีดีไซน์|ปรับหน้าตา|ทำใหม่.*หน้า|สวยขึ้น/i;
const IMAGE_NAME = /\.(png|jpe?g|webp|gif|heic)$/i;

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function hasImageAttachment(attachments = []) {
  return attachments.some((item) => {
    const filePath = String(item?.file_path ?? item?.path ?? item?.name ?? '');
    const type = String(item?.type ?? '');
    return type === 'image' || IMAGE_NAME.test(filePath) || /screenshot|image/i.test(filePath);
  });
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

const raw = readStdin();
let input = {};
try {
  input = raw ? JSON.parse(raw) : {};
} catch {
  emit({ continue: true });
  process.exit(0);
}

const prompt = String(input.prompt ?? input.text ?? '');
const attachments = Array.isArray(input.attachments) ? input.attachments : [];
const triggered = REDESIGN.test(prompt) || hasImageAttachment(attachments);

if (triggered) {
  try {
    const markerDir = path.resolve(process.cwd(), 'design');
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, '.direction-trigger.json'),
      `${JSON.stringify({
        schemaVersion: 1,
        triggeredAt: new Date().toISOString(),
        reason: REDESIGN.test(prompt) ? 'redesign-language' : 'image-attachment',
        protocol: 'references/visual-direction-exploration.md',
        prompts: {
          ide: 'prompts/visual-direction-exploration-ide.md',
          cli: 'prompts/visual-direction-exploration-cli.md'
        }
      }, null, 2)}\n`
    );
  } catch {
    // Marker is best-effort; never block the prompt on filesystem issues.
  }

  emit({
    continue: true,
    user_message: 'Visual direction protocol: show options 1/2/3 (or prose-with-gap), write design/visual-direction-spec.md, then wait for เริ่มเขียน | ปรับต่อ | เลือกใหม่ before UI code.'
  });
} else {
  emit({ continue: true });
}
