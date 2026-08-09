const FALLBACK = 'untitled';
const DEFAULT_MAX_LENGTH = 80;
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase();
}

export function slugify(value, options = {}) {
  const maxLength = Number.isInteger(options.maxLength) && options.maxLength > 0 ? options.maxLength : DEFAULT_MAX_LENGTH;
  const slug = normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
  return slug.length > 0 ? slug : FALLBACK;
}
