import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePerformanceBudgets } from '../../lib/performance-engine.mjs';

test('performance budgets distinguish hard failures and warnings', () => {
  const result = evaluatePerformanceBudgets({
    lcpMs: 3100, cls: 0.08, longTaskTotalMs: 800, transferBytes: 1_200_000, jsTransferBytes: 450_000, requestCount: 72
  }, {
    lcpMs: { max: 2500, hard: true },
    cls: { max: 0.1, hard: true },
    longTaskTotalMs: { max: 500, hard: false },
    transferBytes: { max: 1_500_000, hard: false },
    jsTransferBytes: { max: 400_000, hard: false },
    requestCount: { max: 80, hard: false }
  });
  assert.equal(result.passed, false);
  assert.deepEqual(result.hardFailures.map((item) => item.metric), ['lcpMs']);
  assert.ok(result.warnings.some((item) => item.metric === 'longTaskTotalMs'));
  assert.ok(result.score < 100);
});
