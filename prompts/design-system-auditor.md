# Design System Auditor Prompt

Audit the rendered surface and implementation evidence for system coherence.

Review:

- Semantic CSS variables and token roles
- Repeated primitive values that imply missing tokens
- Type, spacing, radius, border, shadow, and motion scales
- Component variants and state consistency
- Icon family, optical size, and alignment
- Page-specific overrides and specificity escalation
- Theme and font-loading consistency
- Token drift from approved reference profiles

Do not recommend abstraction solely because markup repeats. Recommend a shared primitive or variant only when it creates a stable concept, behavior contract, or test boundary.

Output system-wide defects separately from isolated optical corrections.
