import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRemediationPlan, remediateFindings } from '../../lib/remediation.mjs';
import { FALLBACK_RULE } from '../../lib/remediation-rules.mjs';

test('remediateFindings maps judge findings to full remediation items', () => {
  const items = remediateFindings(
    [
      { rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null },
      { rule: 'maxEmptyCells', severity: 'warn', expected: 6, observed: 8 }
    ],
    { caseKey: 'list' }
  );
  assert.equal(items.length, 2);
  for (const entry of items) {
    for (const field of ['severity', 'category', 'case', 'finding', 'likelyCause', 'action', 'verify']) {
      assert.ok(field in entry, `item missing ${field}`);
    }
    assert.equal(entry.case, 'list');
    assert.match(entry.finding, /\w+/);
  }
  // Judge fail blocks the run gate; warn is advisory.
  assert.equal(items[0].severity, 'blocker');
  assert.equal(items[0].category, 'mobile-capture');
  assert.equal(items[1].severity, 'warning');
  // Curated rule text is surfaced as the likely cause.
  assert.notEqual(items[1].likelyCause, FALLBACK_RULE.why);
});

test('remediateFindings describes expected vs observed and uses fallback for unknown rules', () => {
  const [breach] = remediateFindings([{ rule: 'maxEmptyCells', severity: 'fail', expected: 6, observed: 8 }]);
  assert.match(breach.finding, /maxEmptyCells/);
  assert.match(breach.finding, /6/);
  assert.match(breach.finding, /8/);

  const [unknown] = remediateFindings([{ rule: 'madeUpRule', severity: 'fail', expected: 1, observed: 2 }]);
  assert.equal(unknown.likelyCause, FALLBACK_RULE.why);
  assert.equal(unknown.action, FALLBACK_RULE.action);
  assert.equal(unknown.verify, FALLBACK_RULE.verify);
  assert.equal(unknown.category, FALLBACK_RULE.category);

  assert.deepEqual(remediateFindings(undefined), []);
  assert.deepEqual(remediateFindings([]), []);
});

test('buildRemediationPlan consumes mobileChecks findings without disturbing web sections', () => {
  const plan = buildRemediationPlan({
    mobileChecks: [
      { key: 'chat', label: 'Chat', verdict: 'warn', findings: [{ rule: 'maxEmptyCells', severity: 'warn', expected: 6, observed: 8 }], metricsPath: null, judgmentPath: 'metadata/chat.mobile.judgment.json' },
      { key: 'list', label: 'List', verdict: 'fail', findings: [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }], metricsPath: null, judgmentPath: null }
    ]
  });
  assert.equal(plan.total, 2);
  const listItem = plan.items.find((entry) => entry.case === 'list');
  const chatItem = plan.items.find((entry) => entry.case === 'chat');
  assert.ok(listItem);
  assert.ok(chatItem);
  assert.equal(listItem.severity, 'blocker');
  assert.equal(chatItem.severity, 'warning');
  // Blocker sorts before warning.
  assert.equal(plan.items[0], listItem);
  assert.equal(plan.blockers, 1);
  assert.ok(plan.items.every((entry) => entry.action && entry.verify && entry.id));
});

test('buildRemediationPlan keeps web behavior and merges mobile items by severity', () => {
  const plan = buildRemediationPlan({
    comparison: { comparisons: [{ key: 'home__mobile__default', severity: 'blocker', reason: 'missing-reference' }] },
    mobileChecks: [
      { key: 'list', label: 'List', verdict: 'fail', findings: [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }], metricsPath: null, judgmentPath: null }
    ]
  });
  const comparisonItem = plan.items.find((entry) => entry.category === 'visual');
  assert.ok(comparisonItem, 'web comparison item preserved');
  assert.equal(comparisonItem.finding, 'Required visual evidence is missing (missing-reference).');
  assert.ok(plan.items.some((entry) => entry.category === 'mobile-capture'));
  assert.equal(plan.blockers, 2);

  const empty = buildRemediationPlan({});
  assert.equal(empty.total, 0);
});
