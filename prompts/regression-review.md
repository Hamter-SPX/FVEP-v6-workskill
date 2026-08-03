# Regression Review Prompt

Compare the newly rendered acceptance matrix with the previously accepted evidence.

Return:

- Cases improved
- Cases regressed
- Shared tokens/components likely responsible
- New blocker/major/minor deltas
- Whether the intended fix should be retained, narrowed, or reverted
- Minimum next render set

Do not approve the change based only on the originally failing viewport.
