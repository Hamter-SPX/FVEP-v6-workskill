export function createRuntimeCollector(page) {
  const events = { console: [], pageErrors: [], requestFailures: [], errorResponses: [] };
  page.on('console', (message) => events.console.push({ type: message.type(), text: message.text(), location: message.location() }));
  page.on('pageerror', (error) => events.pageErrors.push({ name: error.name, message: error.message, stack: error.stack ?? null }));
  page.on('requestfailed', (request) => events.requestFailures.push({ method: request.method(), url: request.url(), resourceType: request.resourceType(), failure: request.failure()?.errorText ?? 'unknown' }));
  page.on('response', (response) => {
    if (response.status() >= 400) events.errorResponses.push({ status: response.status(), statusText: response.statusText(), url: response.url(), method: response.request().method(), resourceType: response.request().resourceType() });
  });
  return events;
}

function compilePatterns(sources = [], label = 'pattern') {
  return sources.map((source) => {
    try { return new RegExp(source); }
    catch (error) { throw new TypeError(`Invalid ${label} entry ${source}: ${error.message}`); }
  });
}

function allowed(value, patterns) { return patterns.some((pattern) => pattern.test(value)); }

export function summarizeRuntime(events, runtimePolicy = {}) {
  const consolePatterns = compilePatterns(runtimePolicy.allowedConsolePatterns ?? [], 'allowedConsolePatterns');
  const requestPatterns = compilePatterns(runtimePolicy.allowedRequestPatterns ?? [], 'allowedRequestPatterns');
  const responsePatterns = compilePatterns(runtimePolicy.allowedResponsePatterns ?? [], 'allowedResponsePatterns');
  const consoleErrors = (events.console ?? []).filter((entry) => ['error', 'assert'].includes(entry.type) && !allowed(entry.text, consolePatterns));
  const consoleWarnings = (events.console ?? []).filter((entry) => entry.type === 'warning');
  const pageErrors = events.pageErrors ?? [];
  const requestFailures = (events.requestFailures ?? []).filter((entry) => !allowed(entry.url ?? '', requestPatterns));
  const errorResponses = (events.errorResponses ?? []).filter((entry) => !allowed(entry.url ?? '', responsePatterns));
  const blockingReasons = [];
  if (runtimePolicy.failOnConsoleError && consoleErrors.length) blockingReasons.push('console-error');
  if (runtimePolicy.failOnPageError && pageErrors.length) blockingReasons.push('page-error');
  if (runtimePolicy.failOnRequestFailure && requestFailures.length) blockingReasons.push('request-failure');
  if (runtimePolicy.failOnHttpError && errorResponses.length) blockingReasons.push('http-error-response');
  return {
    consoleErrors,
    consoleWarnings,
    pageErrors,
    requestFailures,
    errorResponses,
    blockingReasons,
    status: blockingReasons.length ? 'fail' : 'pass'
  };
}
