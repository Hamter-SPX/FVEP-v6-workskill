# Brief — task-1: slugify helper

Requirement: add one pure helper `slugify(value, { maxLength })` that turns
arbitrary headings into URL-safe slugs. Lowercase, NFKD-normalized accents,
`-` separators, fallback `untitled`, length cap without a trailing dash.
Pure function, no I/O, no dependencies. Behavior pinned by `test/slug.test.mjs`.
