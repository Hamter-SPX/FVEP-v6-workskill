import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerceptualSignature, comparePerceptualSignatures } from '../../lib/perceptual-diff.mjs';

function image(width, height, pixel) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    data[offset] = pixel(i)[0]; data[offset + 1] = pixel(i)[1]; data[offset + 2] = pixel(i)[2]; data[offset + 3] = 255;
  }
  return { width, height, data };
}

test('perceptual signatures are deterministic and identical images score one', () => {
  const source = image(16, 16, (index) => index % 2 ? [255, 255, 255] : [0, 0, 0]);
  const left = createPerceptualSignature(source, { gridSize: 8 });
  const right = createPerceptualSignature(source, { gridSize: 8 });
  assert.deepEqual(left, right);
  assert.equal(comparePerceptualSignatures(left, right).similarity, 1);
});

test('perceptual comparison detects structural and color changes', () => {
  const black = createPerceptualSignature(image(16, 16, () => [0, 0, 0]));
  const white = createPerceptualSignature(image(16, 16, () => [255, 255, 255]));
  const result = comparePerceptualSignatures(black, white);
  assert.ok(result.similarity < 0.4);
  assert.ok(result.luminanceDelta > 0.9);
});
