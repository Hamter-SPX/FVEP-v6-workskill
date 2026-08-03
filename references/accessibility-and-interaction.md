# Accessibility and Interaction

## Structural Gate

Verify:

- Semantic landmarks and heading order
- Native elements before custom roles
- Programmatic names for controls and meaningful images
- Labels, descriptions, and error associations
- Logical DOM and focus order
- Non-color indicators for state
- Useful alternative text and decorative-image handling

## Keyboard Gate

Review the primary task without a pointer:

- All interactive elements are reachable
- Tab order follows reading and task order
- Focus is visible and not clipped or obscured
- Enter and Space behavior matches control semantics
- Escape dismisses overlays where expected
- Focus moves into overlays and returns to the trigger
- No keyboard trap exists except intentional modal containment
- Composite widgets implement their expected keyboard model

The bundled keyboard probe records a sequence; it does not replace manual interaction review.

## Forms

- Persistent labels exist
- Required fields are communicated programmatically
- Errors identify the problem and recovery action
- Errors are associated with the field and summarized when appropriate
- Invalid submission moves or guides focus predictably
- Password, autocomplete, input mode, and formatting behavior fit the field
- Disabled controls are not used where read-only or explanatory behavior is required

## Pointer and Touch

- Targets are comfortably usable
- Hover is never the only path to information
- Drag has a keyboard or non-drag alternative when required
- Destructive actions have proportional confirmation or undo
- Hit areas do not overlap
- Touch scrolling and sticky regions do not fight

## Asynchronous Changes

Meaningful progress, completion, errors, and content changes are announced when users would otherwise miss them. Avoid excessive live-region noise.

## Motion and Sensory Safety

- Reduced-motion behavior exists
- Repeated or large motion is restrained
- Motion does not block task completion
- Flashing and rapid contrast changes are avoided
- Color is not the only signal

## Automated Audit Limits

Automated rules can find many markup and contrast issues. They cannot prove task clarity, correct labels, sensible focus order, accurate alternative text, or usable interaction. Treat automated results as one evidence layer.
