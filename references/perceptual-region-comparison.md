# Perceptual and Region Comparison

## Why Multiple Comparison Layers Exist

Pixel diff is sensitive to every changed pixel. Perceptual comparison summarizes structural and color distribution. Region comparison attaches importance and geometry to product areas. None is sufficient alone.

## Layers

### Pixel Layer

Measures mismatch at identical dimensions. Useful for deterministic regression and fine alignment. Sensitive to anti-aliasing, rasterization, dynamic media, and font differences.

### Perceptual Layer

Creates a deterministic signature from luminance, color, contrast, edge density, and a spatial grid. It helps distinguish broad structural or visual-language change from small pixel noise.

### Region Layer

A region has:

- Name
- CSS selector or fixed rectangle
- Weight
- Required status
- Optional mismatch and perceptual thresholds

Required regions that cannot be resolved block acceptance. Geometry is compared before local pixels because a displaced or resized region changes composition even when its internal image is similar.

## Severity Order

1. Missing required evidence or region
2. Dimension mismatch
3. Blocker perceptual similarity
4. Major geometry or mismatch
5. Minor local difference
6. Accepted

The overall case severity is the worst applicable layer.

## Comparison Discipline

- Normalize viewport, DPR, state, content, fonts, images, time, randomness, theme, locale, scroll, and animation.
- Compare at identical scale.
- Use region crops for diagnosis, not to ignore the page context.
- Keep masks narrow and justified.
- Re-run the same case after each coherent fix.
- Review content and hierarchy even when all numeric thresholds pass.

## Region Contract Example

```json
{
  "name": "hero",
  "selector": "main > section:first-of-type",
  "weight": 2,
  "required": true,
  "maxMismatchRatio": 0.008,
  "minPerceptualSimilarity": 0.96
}
```
