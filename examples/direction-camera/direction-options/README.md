# Direction options (camera example)

Place ImageGen outputs here when exploring:

- `reference-stock-camera.png` — user reference (optional)
- `direction-option-1.png` — dense utilitarian
- `direction-option-2.png` — spacious editorial (first pick)
- `direction-option-2b.png` — same layout, system icons (หลังปรับต่อ)
- `direction-option-3.png` — expressive accent (rejected)

This example ships **without binary PNGs** so the package stays small. CLI/CI checks use the Markdown/JSON artifacts only. For a visible gallery locally, generate the three files then:

```bash
npm run direction:gallery -- \
  --option '1|Dense utilitarian|examples/direction-camera/direction-options/direction-option-1.png' \
  --option '2|Spacious chrome|examples/direction-camera/direction-options/direction-option-2.png' \
  --option '3|Expressive accent|examples/direction-camera/direction-options/direction-option-3.png'
```
