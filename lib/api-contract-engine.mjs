import { finalizeAudit, makeFinding, nonEmpty, percentage } from './audit-utils.mjs';

const METHODS = Object.freeze(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
const MUTATIONS = new Set(['post', 'put', 'patch', 'delete']);

function operations(document = {}) {
  const result = [];
  for (const [route, pathItem] of Object.entries(document.paths ?? {})) {
    for (const method of METHODS) {
      if (pathItem?.[method]) result.push({ route, method, operation: pathItem[method] });
    }
  }
  return result;
}

function hasSchema(response) {
  const content = response?.content;
  return Boolean(content && Object.values(content).some((media) => media?.schema));
}

function hasIdempotency(operation, method) {
  if (operation?.['x-idempotent'] === true) return true;
  if (['put', 'delete'].includes(method) && operation?.['x-idempotent'] !== false) return true;
  return (operation?.parameters ?? []).some((parameter) => String(parameter?.in).toLowerCase() === 'header' && String(parameter?.name).toLowerCase() === 'idempotency-key');
}

function requestSchema(operation) {
  const content = operation?.requestBody?.content ?? {};
  return Object.values(content).find((media) => media?.schema)?.schema ?? null;
}

export function auditApiContract(document = {}, policy = {}) {
  const findings = [];
  const list = operations(document);
  let checks = 0;
  let passed = 0;
  if (!/^3\./.test(String(document.openapi ?? ''))) findings.push(makeFinding('api-openapi-version-invalid', 'high', 'API document must declare OpenAPI 3.x.'));

  for (const { route, method, operation } of list) {
    const opPath = `${method.toUpperCase()} ${route}`;
    checks += 1;
    if (nonEmpty(operation.operationId)) passed += 1;
    else findings.push(makeFinding('api-operation-id-missing', 'high', `${opPath} has no stable operationId.`, { path: opPath }));

    const security = operation.security ?? document.security;
    if (policy.requireSecurity !== false && operation.security !== []) {
      checks += 1;
      if (Array.isArray(security) && security.length > 0) passed += 1;
      else findings.push(makeFinding('api-security-missing', 'blocker', `${opPath} does not declare a security requirement.`, { path: opPath }));
    }

    const responses = operation.responses ?? {};
    const statusCodes = Object.keys(responses);
    checks += 1;
    if (statusCodes.some((code) => /^2\d\d$/.test(code))) passed += 1;
    else findings.push(makeFinding('api-success-response-missing', 'blocker', `${opPath} has no explicit 2xx response.`, { path: opPath }));

    const errorCodes = statusCodes.filter((code) => /^[45]\d\d$/.test(code));
    checks += 1;
    if (errorCodes.length) passed += 1;
    else findings.push(makeFinding('api-error-response-missing', 'high', `${opPath} has no explicit 4xx or 5xx response contract.`, { path: opPath }));
    for (const code of errorCodes) {
      checks += 1;
      if (hasSchema(responses[code])) passed += 1;
      else findings.push(makeFinding('api-error-schema-missing', 'high', `${opPath} response ${code} has no machine-readable error schema.`, { path: opPath, detail: code }));
    }

    if (policy.requireMutationIdempotency !== false && MUTATIONS.has(method)) {
      checks += 1;
      if (hasIdempotency(operation, method)) passed += 1;
      else findings.push(makeFinding('api-idempotency-missing', method === 'post' || method === 'patch' ? 'blocker' : 'high', `${opPath} lacks declared idempotency semantics.`, { path: opPath }));
    }
  }

  if (!list.length) findings.push(makeFinding('api-surface-empty', policy.required === false ? 'low' : 'blocker', 'API contract contains no operations.'));
  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: list.length, evidenceConfidence: confidence });
  return { ...report, operationCount: list.length, coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence } };
}

function operationMap(document) {
  return new Map(operations(document).map((entry) => [`${entry.method.toUpperCase()} ${entry.route}`, entry.operation]));
}

export function compareApiContracts(baseline = {}, current = {}) {
  const before = operationMap(baseline);
  const after = operationMap(current);
  const breakingChanges = [];

  for (const [key, previous] of before.entries()) {
    const next = after.get(key);
    if (!next) {
      breakingChanges.push(makeFinding('api-operation-removed', 'blocker', `API operation ${key} was removed.`, { path: key }));
      continue;
    }
    const previousResponses = Object.keys(previous.responses ?? {});
    const nextResponses = new Set(Object.keys(next.responses ?? {}));
    for (const code of previousResponses) if (!nextResponses.has(code)) breakingChanges.push(makeFinding('api-response-removed', /^2/.test(code) ? 'blocker' : 'high', `${key} removed response ${code}.`, { path: key, detail: code }));

    const previousSchema = requestSchema(previous);
    const nextSchema = requestSchema(next);
    const previousRequired = new Set(previousSchema?.required ?? []);
    for (const field of nextSchema?.required ?? []) {
      if (!previousRequired.has(field)) breakingChanges.push(makeFinding('api-request-required-field-added', 'blocker', `${key} added newly required request field ${field}.`, { path: key, detail: field }));
    }
    for (const [field, schema] of Object.entries(previousSchema?.properties ?? {})) {
      const nextType = nextSchema?.properties?.[field]?.type;
      if (nextType && schema?.type && nextType !== schema.type) breakingChanges.push(makeFinding('api-request-field-type-changed', 'blocker', `${key} changed request field ${field} from ${schema.type} to ${nextType}.`, { path: key, detail: field }));
    }
  }

  const compatible = !breakingChanges.some((change) => change.severity === 'blocker');
  return {
    schemaVersion: 3,
    compatible,
    status: compatible ? (breakingChanges.length ? 'warning' : 'pass') : 'fail',
    breakingChanges,
    baselineOperations: before.size,
    currentOperations: after.size
  };
}
