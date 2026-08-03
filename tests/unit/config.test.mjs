import test from 'node:test';
import assert from 'node:assert/strict';
import { enumerateCases, normalizeConfig, validateConfig } from '../../lib/config.mjs';

test('normalizeConfig accepts string state names as shorthand', () => {
  const result = normalizeConfig({
    routes: [{ name: 'breaks', path: '/breaks', viewports: [{ name: 'desktop', width: 1440, height: 900 }], states: ['default', 'empty'] }]
  }, '/tmp/config.json');
  assert.deepEqual(result.routes[0].states.map((state) => state.name), ['default', 'empty']);
  assert.deepEqual(enumerateCases(result).map((item) => item.key), ['breaks__desktop__default', 'breaks__desktop__empty']);
});

test('normalizeConfig applies production defaults without mutating input', () => {
  const input = { baseUrl: 'http://127.0.0.1:3000', routes: [{ name: 'home', path: '/' }] };
  const copy = structuredClone(input);
  const result = normalizeConfig(input, '/tmp/project/vision-loop.config.json');
  assert.deepEqual(input, copy);
  assert.equal(result.runtime.browser, 'chromium');
  assert.equal(result.runtime.deviceScaleFactor, 1);
  assert.equal(result.capture.waitUntil, 'domcontentloaded');
  assert.equal(result.diff.threshold, 0.1);
  assert.equal(result.outputDir, '/tmp/project/artifacts/vision-loop');
  assert.deepEqual(result.routes[0].viewports.map((item) => item.name), ['desktop', 'mobile']);
  assert.equal(result.routes[0].states[0].name, 'default');
});

test('normalizeConfig preserves synchronization, state setup, masking, inspection, and reference settings', () => {
  const result = normalizeConfig({
    referenceBaseUrl: 'http://127.0.0.1:4000',
    routes: [{
      name: 'home',
      path: '/',
      referencePath: '/golden',
      readySelector: '[data-ready]',
      readyScript: 'document.body.dataset.ready === "yes"',
      maskSelectors: ['.clock'],
      inspectSelectors: ['header', 'main'],
      masks: [{ x: 1, y: 2, width: 3, height: 4 }],
      states: [{
        name: 'menu',
        query: { demo: 'menu' },
        localStorage: { theme: 'dark' },
        sessionStorage: { onboarding: 'done' },
        cookies: [{ name: 'mode', value: 'demo' }],
        actions: [{ type: 'click', selector: '#menu' }],
        readySelector: '#menu-panel',
        maskSelectors: ['.ad']
      }]
    }]
  }, '/tmp/project/config.json');

  assert.equal(result.referenceBaseUrl, 'http://127.0.0.1:4000');
  assert.equal(result.routes[0].referencePath, '/golden');
  assert.equal(result.routes[0].readySelector, '[data-ready]');
  assert.deepEqual(result.routes[0].maskSelectors, ['.clock']);
  assert.deepEqual(result.routes[0].states[0].localStorage, { theme: 'dark' });
  assert.deepEqual(result.routes[0].states[0].maskSelectors, ['.ad']);
});

test('validateConfig rejects duplicate route names and incomplete actions', () => {
  const duplicate = normalizeConfig({ routes: [{ name: 'home', path: '/' }, { name: 'home', path: '/other' }] }, '/tmp/config.json');
  assert.throws(() => validateConfig(duplicate), /duplicate route name/i);

  const incomplete = normalizeConfig({ routes: [{ name: 'home', path: '/', states: [{ name: 'open', actions: [{ type: 'click' }] }] }] }, '/tmp/config.json');
  assert.throws(() => validateConfig(incomplete), /selector/i);
});

test('enumerateCases expands matrix, creates current/reference URLs, and supports filters', () => {
  const config = normalizeConfig({
    baseUrl: 'http://127.0.0.1:3000',
    referenceBaseUrl: 'http://127.0.0.1:4000',
    routes: [{
      name: 'dashboard', path: '/dashboard', referencePath: '/golden',
      viewports: [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }],
      states: [{ name: 'default' }, { name: 'loading', query: { demo: 'loading' } }]
    }]
  }, '/tmp/config.json');
  validateConfig(config);
  assert.equal(enumerateCases(config).length, 4);
  assert.equal(enumerateCases(config, { viewport: 'mobile' }).length, 2);
  assert.equal(enumerateCases(config, { state: 'loading' }).length, 2);
  const reference = enumerateCases(config, { case: 'dashboard__desktop__loading', mode: 'reference' })[0];
  assert.equal(reference.url, 'http://127.0.0.1:4000/golden?demo=loading');
});

test('normalizeConfig v2 enables advanced evidence policies and region contracts', () => {
  const result = normalizeConfig({
    routes: [{ name: 'home', path: '/', regions: [{ name: 'hero', selector: 'main > section', weight: 2 }] }]
  }, '/tmp/project/config.json');
  assert.equal(result.version, 2);
  assert.equal(result.quality.minScore, 85);
  assert.equal(result.performance.enabled, true);
  assert.equal(result.interaction.enabled, true);
  assert.equal(result.tokens.enabled, true);
  assert.equal(result.breakpoints.enabled, false);
  assert.equal(result.diff.perceptual.enabled, true);
  assert.equal(result.routes[0].regions[0].name, 'hero');
  assert.equal(result.routes[0].regions[0].required, true);
});

test('validateConfig rejects invalid advanced policies and duplicate regions', () => {
  const badQuality = normalizeConfig({ quality: { minScore: 120 }, routes: [{ name: 'home', path: '/' }] }, '/tmp/config.json');
  assert.throws(() => validateConfig(badQuality), /quality\.minScore/i);
  const duplicateRegion = normalizeConfig({ routes: [{ name: 'home', path: '/', regions: [{ name: 'hero', selector: 'main' }, { name: 'hero', selector: 'section' }] }] }, '/tmp/config.json');
  assert.throws(() => validateConfig(duplicateRegion), /duplicate region/i);
});
