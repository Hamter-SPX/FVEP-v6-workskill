import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRemediationPlan } from '../../lib/remediation.mjs';

test('remediation plan prioritizes blockers, deduplicates causes, and stays actionable', () => {
  const plan = buildRemediationPlan({
    comparison: { comparisons: [{ key: 'home__mobile__default', severity: 'blocker', reason: 'missing-reference' }] },
    inspection: [{ key: 'home__mobile__default', horizontalOverflow: true, overflowOffenderCount: 2 }],
    accessibility: [{ key: 'home__mobile__default', blockingViolationCount: 1 }],
    performance: [{ key: 'home__mobile__default', budget: { hardFailures: [{ metric: 'lcpMs', actual: 3200, max: 2500 }] } }],
    interaction: [{ key: 'home__mobile__default', targetSizeViolationCount: 3 }]
  });
  assert.equal(plan.items[0].severity, 'blocker');
  assert.ok(plan.items.some((item) => item.category === 'responsive'));
  assert.ok(plan.items.some((item) => item.category === 'accessibility'));
  assert.ok(plan.items.every((item) => item.action && item.verify));
});

test('remediation surfaces missing aesthetic profile and failed aesthetic audits', () => {
  const missing = buildRemediationPlan({
    aesthetics: { passed: false, score: 0, paths: { missing: ['profile'] } }
  });
  assert.ok(missing.items.some((item) => item.category === 'aesthetics' && /profile/i.test(item.finding)));

  const failed = buildRemediationPlan({
    aesthetics: { passed: false, score: 62, evidenceConfidence: 55, paths: { missing: [] }, hardFailures: [{ code: 'X' }] }
  });
  const aesthetic = failed.items.find((item) => item.category === 'aesthetics');
  assert.ok(aesthetic);
  assert.equal(aesthetic.severity, 'blocker');
  assert.match(aesthetic.finding, /62/);
});
