# Breakpoint Discovery

## Principle

Breakpoints should respond to content pressure and composition changes, not device labels alone.

## Discovery Scan

The scanner samples widths between configured minimum and maximum values. At each width it records:

- Horizontal overflow
- Visibility
- Display and positioning
- Flex direction and wrapping
- Grid-column count
- Order of declared layout regions

A candidate is recorded when:

- Overflow appears or resolves
- A tracked layout signature changes

Candidates are ranges, not automatically correct CSS values. Inspect the widths around each range and choose the smallest rule that preserves hierarchy and usability.

## Use Cases

- Navigation switches from inline to compact
- Sidebar becomes drawer or moves below content
- Grid reduces columns
- Dense table reaches its minimum usable width
- Primary and secondary actions reorder
- Text, controls, or media create overflow

## Review Around a Candidate

Capture at:

- Just below the suspected boundary
- At the selected boundary
- Just above it
- At representative narrow and wide regression widths

Do not fix overflow by globally hiding it. Identify the first parent/child constraint that creates the pressure.

## Cost Control

Width scans launch many cases. Keep them disabled during ordinary local iteration and enable them for responsive diagnosis, milestone review, and release verification.
