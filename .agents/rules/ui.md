---
trigger: glob
globs: "frontend/src/tools/**/*.tsx"
description: "Shared UI and UX rules for XeooTools tools."
---

# Tool UI Rules

## Styling

New tools must visually match existing XeooTools tools.

Before creating a new tool, inspect one or more existing tools and follow their:

- spacing
- card structure
- form styling
- button styling
- typography
- icon sizing
- borders
- radius
- status colors
- responsive behavior

Do not invent a separate application-wide visual style.

## Theme

Use the existing XeooTools theme tokens.

Prefer:

- `bg-xeoo-bg`
- `bg-xeoo-surface`
- `bg-xeoo-surface-soft`
- `text-xeoo-text`
- `text-xeoo-text-soft`
- `text-xeoo-muted`
- `border-xeoo-border`
- `border-xeoo-border-dark`

Use semantic XeooTools colors for:

- primary
- success
- warning
- danger
- info

Do not create a separate dark-mode system.

Avoid unnecessary `dark:` classes.

## Responsive

Every tool must work on:

- 320px
- 375px
- 414px
- 640px
- 768px
- 1024px
- 1280px+

Requirements:

- no horizontal overflow
- usable mobile layout
- touch-friendly controls
- readable text
- appropriate stacking
- responsive grids

## Forms

Inputs should have:

- clear labels
- validation
- disabled states where needed
- useful error states

Buttons must have:

- clear purpose
- hover state
- focus state
- disabled state

## Accessibility

Use semantic HTML.

Prefer:

`<button>`
`<input>`
`<label>`
`<select>`
`<textarea>`

Do not use clickable `<div>` elements when a button is appropriate.

Use ARIA attributes when needed.

## Animation

Use subtle transitions for:

- hover
- focus
- state changes
- tabs
- expanding/collapsing
- result transitions

Do not add animation everywhere.

Avoid long or distracting animations.

## Compact Layout

XeooTools tools should use space efficiently.

The UI must not feel unnecessarily large or spacious.

Prefer compact utility-oriented layouts over large dashboard or landing-page layouts.

Avoid:

- oversized buttons
- excessive button padding
- oversized inputs
- large gaps between related controls
- excessive card padding
- unnecessary empty space
- oversized icons
- oversized headings
- repeated labels that can be grouped
- excessive vertical stacking
- redundant containers

## Desktop Viewport Goal

For ordinary tools, the primary workflow should ideally fit within approximately one desktop viewport.

Target:

100vh or less where reasonably possible.

A small amount of natural scrolling is acceptable when the actual content requires it.

Do NOT artificially force content into 100vh if doing so causes:

- clipped content
- inaccessible controls
- overlapping elements
- unreadable text
- broken responsive behavior

The goal is efficient layout, not a hard fixed-height page.

## Information Density

Group related controls together.

Prefer:

Label
Input
Helper text

as one compact control group.

Related controls should share a logical row when there is enough space.

Example:

Age | Height | Weight

rather than:

Age

large gap

Height

large gap

Weight

Use responsive stacking on narrow screens.

## Buttons

Buttons should be appropriately sized for their action.

Avoid unnecessarily large buttons.

Prefer compact utility buttons unless the action is the primary CTA.

Avoid excessive horizontal and vertical padding.

Buttons should still remain touch-friendly on mobile.

## Cards

Cards should use enough padding for clarity without wasting space.

Avoid overly large card padding.

Avoid nesting many cards inside cards unless the hierarchy genuinely requires it.

Prefer one clear container for a logical group of controls.

## Form Layout

Forms should prioritize density and clarity.

Group related fields.

Prefer multi-column layouts on desktop when appropriate.

Example:

Age | Sex
Height | Weight
Activity | Goal

On mobile, stack them naturally.

## Result Layout

Results should be scannable and compact.

Prefer:

Primary Result
Supporting Values
Breakdown
Short Explanation

Avoid large blank areas between result sections.

## Mobile

On mobile, compactness must not reduce usability.

Controls may stack vertically when necessary.

Keep touch targets usable.

Never allow compact layout rules to create:

- clipped controls
- text overlap
- horizontal overflow
- inaccessible buttons
- dropdown overflow

## Main Rule

Use the minimum amount of space required to make the interface:

- clear
- readable
- accessible
- responsive
- visually balanced

Do not make a tool look bigger simply because there is available screen space.
