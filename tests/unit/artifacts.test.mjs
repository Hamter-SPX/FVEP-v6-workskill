import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { artifactKey, artifactPaths, safeSegment } from '../../lib/artifacts.mjs';

test('safeSegment and artifactKey are stable and filesystem safe', () => {
  assert.equal(safeSegment('Pricing / EU – Dark'), 'pricing-eu-dark');
  assert.equal(artifactKey({ routeName: 'Home', viewportName: 'Mobile', stateName: 'Menu Open' }), 'home__mobile__menu-open');
});

test('artifactPaths cannot escape output directory', () => {
  const root = path.resolve('/tmp/vision-output');
  const paths = artifactPaths(root, { routeName: '../../home', viewportName: 'desktop', stateName: 'default' });
  for (const file of Object.values(paths)) {
    assert.equal(path.resolve(file).startsWith(`${root}${path.sep}`), true);
  }
});
