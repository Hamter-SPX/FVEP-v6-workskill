import test from 'node:test';
import assert from 'node:assert/strict';
import { detectBreakpointCandidates, stableLayoutSignature } from '../../lib/breakpoint-engine.mjs';

test('stableLayoutSignature ignores object key ordering', () => {
  assert.equal(stableLayoutSignature({ b: 2, a: 1 }), stableLayoutSignature({ a: 1, b: 2 }));
});

test('breakpoint detector finds layout transitions and overflow boundaries', () => {
  const samples = [
    { width: 320, horizontalOverflow: true, layout: { nav: 'compact', columns: 1 } },
    { width: 360, horizontalOverflow: false, layout: { nav: 'compact', columns: 1 } },
    { width: 600, horizontalOverflow: false, layout: { nav: 'compact', columns: 1 } },
    { width: 768, horizontalOverflow: false, layout: { nav: 'expanded', columns: 2 } },
    { width: 1024, horizontalOverflow: false, layout: { nav: 'expanded', columns: 3 } }
  ];
  const result = detectBreakpointCandidates(samples);
  assert.deepEqual(result.map((item) => item.kind), ['overflow-resolved', 'layout-change', 'layout-change']);
  assert.deepEqual(result.map((item) => item.range), [[320, 360], [600, 768], [768, 1024]]);
});
