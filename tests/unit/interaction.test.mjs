import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateInteractionInventory } from '../../lib/interaction-engine.mjs';

test('interaction inventory identifies unnamed, undersized, nested, and duplicate controls', () => {
  const result = evaluateInteractionInventory([
    { id: 'save', visible: true, disabled: false, interactive: true, accessibleName: 'Save', width: 48, height: 32, nestedInteractive: false },
    { id: 'icon', visible: true, disabled: false, interactive: true, accessibleName: '', width: 20, height: 20, nestedInteractive: true },
    { id: 'save', visible: true, disabled: false, interactive: true, accessibleName: 'Duplicate', width: 40, height: 40, nestedInteractive: false }
  ], { minTargetWidth: 24, minTargetHeight: 24, failOnMissingAccessibleName: true, failOnNestedInteractive: true, failOnDuplicateIds: true, maxTargetSizeViolations: 0 });
  assert.equal(result.missingNameCount, 1);
  assert.equal(result.targetSizeViolationCount, 1);
  assert.equal(result.nestedInteractiveCount, 1);
  assert.deepEqual(result.duplicateIds, ['save']);
  assert.equal(result.passed, false);
});
