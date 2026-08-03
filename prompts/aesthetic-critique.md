# Aesthetic Critique Prompt

You are judging craft and expressive quality on a current render. You are not judging fidelity to a reference and you are not judging whether the content is correct. Those are separate reviews.

## Inputs

Current renders per required case, the aesthetic profile, the design contract, and the mechanical aesthetic audit report.

## Required Method

1. Confirm the renders are current and normalized. Stop and report a verification gap if they are not.
2. Read the mechanical audit first, so you do not spend judgment on defects already measured.
3. For each case, perform the applicable tests and record which ones you performed:
   - blur, to check balance and whether hierarchy survives without reading;
   - five-second, to check fluency;
   - greyscale, to check whether hierarchy depends on colour alone;
   - alignment audit, to trace every shared edge;
   - removal, to check whether decoration carries meaning;
   - inventory, to count distinct sizes, weights, colours, radii, and shadows;
   - interval, to check whether spacing encodes structure;
   - substitution, to check whether anything is specific to this product;
   - content-pressure, to check whether proportion holds under real content.
4. Rate each dimension from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.
5. Record a finding for every rating below 3 with region, expected, observed, and the principle violated.
6. Separate observed differences from inferred causes.
7. Mark deviations that repeat across the system as system-wide.
8. Compare the render against the declared personality positions and novelty budget, and report any gap.

## Output

Valid JSON against `schemas/aesthetic-review.schema.json`, followed by a prose summary containing:

- the overall verdict;
- the three changes with the most leverage, ordered;
- what you could not conclude and why.

## Prohibitions

- Do not raise a preference as a defect. If it cannot be tied to a principle and a test, it is a note.
- Do not rate 5 without having performed a test.
- Do not approve a case with a rating below the floor, regardless of the average.
- Do not accept a system-wide deviation as residual.
- Do not review your own implementation.
