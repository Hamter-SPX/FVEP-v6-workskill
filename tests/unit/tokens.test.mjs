import test from 'node:test';
import assert from 'node:assert/strict';
import { compareTokenProfiles, normalizeCssValue } from '../../lib/token-engine.mjs';

test('normalizeCssValue normalizes whitespace and case without inventing semantics', () => {
  assert.equal(normalizeCssValue('  RGB(255, 0, 0)  '), 'rgb(255, 0, 0)');
});

test('token comparison reports changed, missing, and extra variables with drift score', () => {
  const reference = { cssVariables: { '--color-primary': '#f00', '--radius-md': '8px' }, primitives: { fontFamilies: { Inter: 10 }, radii: { '8px': 8 } } };
  const current = { cssVariables: { '--color-primary': '#00f', '--space-4': '16px' }, primitives: { fontFamilies: { Arial: 10 }, radii: { '4px': 8 } } };
  const result = compareTokenProfiles(reference, current);
  assert.deepEqual(result.variables.changed.map((item) => item.name), ['--color-primary']);
  assert.deepEqual(result.variables.missing, ['--radius-md']);
  assert.deepEqual(result.variables.extra, ['--space-4']);
  assert.ok(result.driftScore > 0);
  assert.ok(result.similarityScore < 100);
});

test('stored token profiles can be loaded for approved reference comparison', async () => {
  const { normalizeConfig } = await import('../../lib/config.mjs');
  const { artifactPaths } = await import('../../lib/artifacts.mjs');
  const { loadStoredTokenProfiles } = await import('../../lib/token-engine.mjs');
  const fs = await import('node:fs/promises'); const os = await import('node:os'); const path = await import('node:path');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-tokens-'));
  const config = normalizeConfig({ outputDir: 'artifacts', routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }], states: [{ name: 'default' }] }] }, path.join(root, 'config.json'));
  const identity = { routeName: 'home', viewportName: 'desktop', stateName: 'default' };
  const paths = artifactPaths(config.outputDir, identity); await fs.mkdir(path.dirname(paths.referenceTokensJson), { recursive: true });
  await fs.writeFile(paths.referenceTokensJson, JSON.stringify({ profile: { cssVariables: { '--color': '#fff' }, primitives: {} } }));
  const results = await loadStoredTokenProfiles(config, { mode: 'reference' });
  assert.equal(results.length, 1); assert.equal(results[0].stored, true); assert.equal(results[0].profile.cssVariables['--color'], '#fff');
});
