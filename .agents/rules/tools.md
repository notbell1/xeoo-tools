---
trigger: glob
globs: "frontend/src/tools/**/*.tsx,frontend/src/tools/**/*.ts"
description: "General rules for every XeooTools tool."
---

# General Tool Rules

## Utility-First Layout

XeooTools is a utility platform, not a marketing landing-page system.

Tool interfaces should prioritize function over decoration.

Prefer:

Input
→ Action
→ Result

over:

Hero
→ Introduction
→ Large cards
→ Decorative section
→ Tool

The actual functionality should occupy most of the visible page area.

Do not use large visual sections merely to fill available space.

## UI Language

All static user-facing UI text must be in English.

This includes:

- titles
- labels
- buttons
- placeholders
- helper text
- validation messages
- loading messages
- error messages
- success messages
- empty states
- tooltips
- accessibility labels

Do not introduce Indonesian UI unless the user explicitly requests Indonesian UI.

Do not add a language selector or language toggle unless explicitly requested.

Dynamic backend or API data may retain its original value when appropriate.

## Tool Location

Every new tool must be created inside its appropriate category folder.

Required pattern:

frontend/src/tools/<category>/

Examples:

frontend/src/tools/psychology/
frontend/src/tools/security/
frontend/src/tools/network/
frontend/src/tools/law/
frontend/src/tools/defacement/
frontend/src/tools/math/

If the category folder does not exist:

1. Create the category folder.
2. Create the tool inside that category folder.

Do not place tool files directly inside frontend/src/tools/ unless explicitly required by the project architecture.

Do not create unnecessary nested folders.

## Naming

React component files:

PascalCase.tsx

Logic and helper files:

camelCase.ts

Use descriptive but reasonably short names.

Avoid unnecessarily long filenames.

## Token Efficiency

Keep implementation efficient and maintainable.

Avoid:

- unnecessary comments
- repeated code
- duplicated UI structures
- unnecessary abstractions
- unnecessary helper files
- verbose source code
- unnecessary configuration

Do not overengineer simple tools.

Prefer the simplest implementation that satisfies the requested functionality.

## Agent Communication Efficiency

Keep agent responses concise.

Do not:

- repeat the user's requirements
- restate rules unnecessarily
- explain obvious implementation details at length
- provide long summaries when a short summary is sufficient
- repeat information already established in the conversation

When reporting completed work, prefer:

- files changed
- concise summary of changes
- verification result
- remaining issue, if any

Do not spend context on unnecessary commentary.

## Performance

Tool pages should feel lightweight.

Avoid:

- unnecessarily large DOM trees
- expensive calculations on every render
- excessive event listeners
- unnecessary network requests
- large libraries for simple features
- expensive animations
- unnecessary assets

Use browser-native APIs when practical.

## Smooth UI and UX

Interactions should feel responsive and polished.

Use short, subtle transitions.

Avoid:

- long animations
- blocking interactions
- unnecessary loading screens
- distracting effects
- excessive motion

The user should understand what to do without unnecessary steps.

## Page Weight

Keep tool pages lightweight.

Do not add large libraries for small tasks.

Do not load heavy assets unless required.

Do not introduce unnecessary third-party resources.

Prefer local and browser-native functionality when possible.

## Styling Consistency

Every tool must look like part of XeooTools.

Reuse existing project conventions for:

- spacing
- cards
- buttons
- inputs
- typography
- icons
- semantic colors
- focus states
- disabled states
- responsive behavior

Do not create every tool as a completely different application.

A specialized internal editor can have its own visual language when that is explicitly part of the tool's purpose.

The surrounding XeooTools UI must remain consistent.

## Light and Dark Theme

Every tool must work with:

- light theme
- dark theme

Never assume:

- white-only backgrounds
- black-only text
- light-only inputs
- light-only borders

Check all UI states when switching theme.

## Responsive

Every tool must work across common screen sizes.

Consider:

- 320px
- 375px
- 414px
- 768px
- 1024px
- 1280px and above

Do not allow horizontal overflow.

## Scope

Stay exactly within the user's requested scope.

Do not add unrelated:

- features
- APIs
- backend systems
- databases
- authentication
- accounts
- analytics
- AI services
- cloud storage
- sharing systems

unless explicitly requested.

## Validation

Validate input before processing.

Validation messages must be:

- concise
- clear
- actionable

Do not silently accept invalid input and produce misleading results.

## States

Where applicable, support:

- initial state
- empty state
- processing state
- success state
- error state
- disabled state
- reset state

## Accessibility

Use semantic HTML and accessible controls.

Provide:

- visible focus states
- labels
- appropriate ARIA attributes
- keyboard-accessible interactions

Do not rely only on color for important status information.

## User Files

If a tool is frontend-only:

- process files locally
- do not upload files to the backend
- do not send files to external services
- do not create hidden upload requests

Use browser-native APIs where possible.

## Existing Tool Reference

Before creating a new tool, inspect one or more existing XeooTools tools.

Follow the existing patterns rather than inventing a new application-wide style.

## Final Tool Checklist

Before finishing a tool, verify:

- UI is English
- no unrequested language toggle
- tool is inside the correct category folder
- filename is clear and reasonably short
- styling matches XeooTools
- light theme works
- dark theme works
- responsive layout works
- UI feels smooth
- page is lightweight
- implementation is within scope
- TypeScript passes
- build passes
- no unnecessary files were created
