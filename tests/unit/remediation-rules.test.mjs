import test from 'node:test';
import assert from 'node:assert/strict';
import { JUDGE_RULES, FALLBACK_RULE, lookupRemediationRule } from '../../lib/remediation-rules.mjs';

const REQUIRED_RULES = [
  'missingCapture', 'maxEmptyCells', 'minAlignment', 'suspectBackground', 'sourceMismatch',
  'maxDarkShare', 'minDarkShare', 'maxLightShare', 'minLightShare'
];

test('rule library covers every judge/mobile rule with complete guidance', () => {
  for (const name of REQUIRED_RULES) {
    const rule = lookupRemediationRule(name);
    assert.notEqual(rule, FALLBACK_RULE, `no curated rule for ${name}`);
    assert.ok(rule.category, `${name} needs a category`);
    assert.ok(rule.why, `${name} needs a why`);
    assert.ok(rule.action, `${name} needs an action`);
    assert.ok(rule.verify, `${name} needs a verify`);
  }
});

test('every library entry is reachable by exact lookup and carries full fields', () => {
  assert.ok(Array.isArray(JUDGE_RULES));
  assert.ok(JUDGE_RULES.length >= REQUIRED_RULES.length);
  for (const entry of JUDGE_RULES) {
    assert.ok(entry.matches instanceof RegExp || typeof entry.matches === 'string');
    for (const field of ['category', 'why', 'action', 'verify']) {
      assert.equal(typeof entry[field], 'string', `${String(entry.matches)} missing ${field}`);
      assert.ok(entry[field].trim().length > 0, `${String(entry.matches)} empty ${field}`);
    }
    if (typeof entry.matches === 'string') {
      assert.equal(lookupRemediationRule(entry.matches), entry, `lookup did not return the entry for ${entry.matches}`);
    }
  }
});

test('lookup is case-insensitive but never partial-matches', () => {
  assert.equal(lookupRemediationRule('maxemptycells').category, lookupRemediationRule('maxEmptyCells').category);
  assert.equal(lookupRemediationRule('dark'), FALLBACK_RULE);
  assert.equal(lookupRemediationRule('darkShare'), FALLBACK_RULE);
  assert.equal(lookupRemediationRule('alignment'), FALLBACK_RULE);
});

test('unknown, empty, and non-string rules fall back', () => {
  assert.equal(lookupRemediationRule('totallyUnknownRule'), FALLBACK_RULE);
  assert.equal(lookupRemediationRule(''), FALLBACK_RULE);
  assert.equal(lookupRemediationRule('   '), FALLBACK_RULE);
  assert.equal(lookupRemediationRule(null), FALLBACK_RULE);
  assert.equal(lookupRemediationRule(undefined), FALLBACK_RULE);
  assert.equal(lookupRemediationRule(42), FALLBACK_RULE);
});

test('fallback rule itself is complete guidance', () => {
  for (const field of ['category', 'why', 'action', 'verify']) {
    assert.equal(typeof FALLBACK_RULE[field], 'string');
    assert.ok(FALLBACK_RULE[field].trim().length > 0);
  }
});
