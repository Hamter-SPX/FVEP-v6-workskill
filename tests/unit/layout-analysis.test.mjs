import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHeadingOutline, detectPotentialOverlaps, intersectionArea } from '../../lib/layout-analysis.mjs';

test('heading analysis reports skipped levels and missing h1', () => {
  const result = analyzeHeadingOutline([{ level: 2, text: 'Intro' }, { level: 4, text: 'Deep' }]);
  assert.equal(result.hasH1, false);
  assert.equal(result.skippedLevels.length, 1);
});

test('overlap analysis ignores containment and catches competing interactive targets', () => {
  assert.equal(intersectionArea({ left: 0, top: 0, right: 10, bottom: 10 }, { left: 5, top: 5, right: 15, bottom: 15 }), 25);
  const result = detectPotentialOverlaps([
    { domPath: 'body>div:nth-of-type(1)', visible: true, interactive: true, rect: { left: 0, top: 0, right: 40, bottom: 40, width: 40, height: 40 } },
    { domPath: 'body>div:nth-of-type(2)', visible: true, interactive: true, rect: { left: 10, top: 10, right: 50, bottom: 50, width: 40, height: 40 } },
    { domPath: 'body>div:nth-of-type(1)>span:nth-of-type(1)', visible: true, interactive: false, rect: { left: 0, top: 0, right: 20, bottom: 20, width: 20, height: 20 } }
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].blocking, true);
});
