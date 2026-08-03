const ACTION_RULES = Object.freeze({
  click: { selector: true },
  dblclick: { selector: true },
  fill: { selector: true, value: 'string' },
  press: { selector: true, key: 'string' },
  hover: { selector: true },
  focus: { selector: true },
  check: { selector: true },
  uncheck: { selector: true },
  select: { selector: true, value: 'defined' },
  waitFor: { selector: true, state: 'optional-string' },
  wait: { ms: 'non-negative-number' },
  scrollIntoView: { selector: true },
  scrollTo: { x: 'number', y: 'number' },
  evaluate: { source: 'string' },
  screenshotPause: { ms: 'non-negative-number' }
});

export function supportedActionTypes() {
  return Object.keys(ACTION_RULES);
}

export function actionNeedsSelector(type) {
  return Boolean(ACTION_RULES[type]?.selector);
}

function assertField(action, field, rule) {
  const value = action[field];
  switch (rule) {
    case 'string':
      if (typeof value !== 'string' || value.length === 0) throw new TypeError(`Action ${action.type} requires string ${field}.`);
      break;
    case 'optional-string':
      if (value !== undefined && typeof value !== 'string') throw new TypeError(`Action ${action.type} ${field} must be a string when provided.`);
      break;
    case 'defined':
      if (value === undefined || value === null) throw new TypeError(`Action ${action.type} requires ${field}.`);
      break;
    case 'number':
      if (!Number.isFinite(Number(value))) throw new TypeError(`Action ${action.type} requires numeric ${field}.`);
      break;
    case 'non-negative-number':
      if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 120000) {
        throw new TypeError(`Action ${action.type} requires non-negative numeric ${field} no greater than 120000.`);
      }
      break;
    default:
      break;
  }
}

export function validateAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) throw new TypeError('Action must be an object.');
  const type = String(action.type ?? '');
  const rules = ACTION_RULES[type];
  if (!rules) throw new TypeError(`Unsupported action type: ${type || '(empty)'}.`);
  if (rules.selector && (typeof action.selector !== 'string' || action.selector.trim() === '')) {
    throw new TypeError(`Action ${type} requires a non-empty selector.`);
  }
  for (const [field, rule] of Object.entries(rules)) {
    if (field !== 'selector') assertField(action, field, rule);
  }
  if (type === 'waitFor' && action.state !== undefined && !['attached', 'detached', 'visible', 'hidden'].includes(action.state)) {
    throw new TypeError('Action waitFor state must be attached, detached, visible, or hidden.');
  }
  return action;
}

export function validateActions(actions = []) {
  if (!Array.isArray(actions)) throw new TypeError('Actions must be an array.');
  actions.forEach(validateAction);
  return actions;
}

export async function executeActions(page, actions = []) {
  validateActions(actions);
  for (const action of actions) {
    const locator = action.selector ? page.locator(action.selector).first() : null;
    const options = action.timeoutMs ? { timeout: Number(action.timeoutMs) } : {};
    switch (action.type) {
      case 'click': await locator.click({ ...options, force: Boolean(action.force) }); break;
      case 'dblclick': await locator.dblclick({ ...options, force: Boolean(action.force) }); break;
      case 'fill': await locator.fill(action.value, options); break;
      case 'press': await locator.press(action.key, options); break;
      case 'hover': await locator.hover(options); break;
      case 'focus': await locator.focus(options); break;
      case 'check': await locator.check(options); break;
      case 'uncheck': await locator.uncheck(options); break;
      case 'select': await locator.selectOption(action.value, options); break;
      case 'waitFor': await locator.waitFor({ ...options, state: action.state ?? 'visible' }); break;
      case 'wait':
      case 'screenshotPause': await page.waitForTimeout(Number(action.ms)); break;
      case 'scrollIntoView': await locator.scrollIntoViewIfNeeded(options); break;
      case 'scrollTo': await page.evaluate(({ x, y }) => window.scrollTo({ left: x, top: y, behavior: 'instant' }), { x: Number(action.x), y: Number(action.y) }); break;
      case 'evaluate': await page.evaluate((source) => globalThis.eval(source), action.source); break;
      default: throw new TypeError(`Unsupported action type: ${action.type}.`);
    }
  }
}
