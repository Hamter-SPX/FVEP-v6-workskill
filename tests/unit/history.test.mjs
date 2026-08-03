import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRunHistory } from '../../lib/history-engine.mjs';

test('history analysis detects improvement, regression, and stagnation', () => {
  const improved = analyzeRunHistory([{ score: 70, blockers: 3 }, { score: 82, blockers: 1 }]);
  assert.equal(improved.trend, 'improving');
  const regressed = analyzeRunHistory([{ score: 90, blockers: 0 }, { score: 84, blockers: 1 }]);
  assert.equal(regressed.trend, 'regressing');
  const stagnant = analyzeRunHistory([{ score: 80, blockers: 1 }, { score: 80.1, blockers: 1 }, { score: 80.2, blockers: 1 }], { stagnationWindow: 3, minMeaningfulDelta: 0.5 });
  assert.equal(stagnant.stagnant, true);
});
