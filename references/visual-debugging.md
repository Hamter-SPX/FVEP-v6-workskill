# Visual Debugging

## Diagnose Before Patching

For each major delta ask:

- Is the wrong value local, inherited, token-driven, or content-driven?
- Is the element constrained by the wrong parent?
- Is font metric mismatch being mistaken for spacing?
- Is an asset cropped, stretched, low-resolution, or using the wrong aspect ratio?
- Is a fixed size used where content or container constraints are needed?
- Is a browser default leaking through?
- Is the responsive rule based on a device label rather than content pressure?
- Is a missing component variant causing page-specific overrides?
- Is capture state nondeterministic?

## Common Failure Patterns

### Horizontal Overflow

Do not begin with global `overflow-x: hidden`. Inspect offenders. Typical causes include `100vw`, fixed/min widths, transforms, negative margins, long strings, absolutely positioned decoration, and tables without a narrow-width strategy.

### Wrong Vertical Rhythm

Check font loading, line height, margin collapse, default heading/paragraph margins, grid row sizing, image intrinsic ratio, and container padding before editing many individual gaps.

### Typography Does Not Match

Verify font actually loaded, exact weight exists, fallback metrics, letter spacing, line height, text width, wrapping, antialiasing, and device scale factor.

### Cards or Controls Feel Wrong

Compare outer geometry, internal padding, text baseline, icon optical size, border contrast, radius family, and state behavior. Shadow is rarely the first cause.

### Mobile Looks Like Stacked Desktop

Revisit task priority, order, navigation model, secondary disclosure, density, table/chart strategy, and sticky behavior.

### Pixel Diff Is Noisy

Stabilize time, randomness, fixtures, fonts, images, animation, caret, scroll, locale, and DPR. Use narrow masks only after stabilization.

## Regression Surface

Before patching, list shared tokens, components, routes, viewports, and states likely to change. Re-run those cases after the fix.
