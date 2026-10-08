# XeooTools Frontend Rules

## Scope

These rules apply to the XeooTools frontend located under:

```text
frontend/
```

The frontend follows the root project rules in:

```text
AGENTS.md
```

When rules overlap, the root `AGENTS.md` remains the project-level source of truth.

For theme-specific behavior, also follow:

```text
../.agents/rules/theme.md
```

and use:

```text
frontend/src/theme.css
```

as the authoritative source for theme token values.

---

## Stack

Frontend uses:

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React

Follow the existing project versions and configuration.

Do not introduce a competing frontend architecture.

---

## Architecture

Follow the existing frontend architecture.

Do not introduce:

- a second application architecture
- unnecessary state-management systems
- unnecessary routing systems
- duplicate component systems
- unnecessary abstraction layers

Prefer simple structures that match the existing project.

Do not rewrite working architecture merely because another pattern is more familiar.

---

# Before Editing

Before modifying frontend files:

1. Read the existing file.
2. Understand its current structure and behavior.
3. Inspect related files when necessary.
4. Inspect existing implementations of similar functionality.
5. Inspect tools in the same category when changing or creating tool UI.
6. Inspect existing shared components before creating new ones.
7. Read the relevant `.agents/rules/*.md` file when the task falls under that rule set.
8. Follow established XeooTools patterns.
9. Modify only what is necessary for the requested task.

For UI, styling, colors, responsive behavior, or Light/Dark mode:

1. Read:

```text
../.agents/rules/theme.md
```

2. Inspect:

```text
frontend/src/theme.css
```

3. Inspect an existing tool in the same category.
4. Reuse established category patterns.

Do not create unnecessary folders.

Do not create unnecessary abstractions.

Do not perform unrelated refactoring.

---

## Components

Reuse existing shared components where appropriate.

Do not duplicate application-wide components inside individual tools.

Before creating a new shared component:

1. Inspect existing components.
2. Check whether an equivalent already exists.
3. Reuse or extend the existing component when practical.
4. Create a new component only when genuinely necessary.

A tool may have its own specialized internal UI when the feature requires it.

---

# Category UI Consistency

## Core Rule

Each tool category must have a consistent UI/UX design language.

The most important rule is:

> **Features may differ, but the overall UI template of tools in the same category must remain consistent.**

When creating or modifying a tool, the agent MUST inspect existing tools in the same category before implementing the UI.

Existing tools in that category are the primary visual reference.

---

## Existing Category Tools Are the UI Reference

Before creating a new tool under:

```text
frontend/src/tools/<category>/
```

inspect the tools already present in that category.

Review their:

- layout
- content width
- spacing
- cards
- borders
- radius
- inputs
- dropdowns
- buttons
- upload areas
- previews
- results
- typography
- icons
- status indicators
- empty states
- loading states
- error states
- responsive behavior
- Light Mode
- Dark Mode

Do not create a new UI from scratch when the category already has established patterns.

---

## Same Category = Same UI Family

Tools in the same category should share:

- overall page structure
- content width
- spacing rhythm
- card system
- border/radius style
- input style
- dropdown style
- button style
- typography hierarchy
- icon style
- result presentation
- responsive behavior
- Light/Dark behavior

The feature-specific controls may differ.

The overall visual language must remain the same.

Example:

```text
Image Tools
├── Image Compressor
├── Image Resizer
├── Image Converter
└── Image Metadata Viewer
```

These tools can have different functionality, but they should clearly look like members of the same Image Tools family.

---

## Do Not Invent a New UI for Every Tool

Do not create separate designs such as:

```text
Tool A -> one upload style
Tool B -> another upload style
Tool C -> another card style
Tool D -> another button system
```

When an established pattern already exists, reuse it.

Prefer:

```text
Category UI Pattern
        |
        +-- Tool A -> feature-specific controls
        +-- Tool B -> feature-specific controls
        +-- Tool C -> feature-specific controls
        +-- Tool D -> feature-specific controls
```

---

## Reuse Existing Category Patterns

If existing tools already have a common pattern for:

- upload/dropzone
- file picker
- file preview
- image preview
- text inputs
- number inputs
- dropdowns
- buttons
- result cards
- metadata rows
- progress indicators
- status badges
- empty states
- loading states
- error states

reuse that pattern.

Do not create another visually different implementation of the same UI purpose.

If multiple existing tools already share the same pattern, treat that pattern as the category standard.

---

## Category UI Evolution

When adding another tool to an existing category:

```text
Existing category tools
        |
        v
Inspect established patterns
        |
        v
Reuse existing UI
        |
        v
Add feature-specific controls
        |
        v
Preserve category visual language
```

The category should become more consistent as it grows.

Do not allow each new tool to gradually introduce another visual system.

---

## New UI Pattern Exception

A new UI pattern is allowed only when the existing category pattern genuinely cannot support the new functionality.

Even then:

- keep the same typography
- keep the same spacing language
- keep the same colors
- keep the same border/radius language
- keep the same button/input language
- keep the same responsive principles
- keep the same Light/Dark system

Only the necessary feature-specific interface may be different.

Do not redesign unrelated parts of the tool.

---

# Theme

XeooTools uses a centralized theme system.

The theme token values are defined in:

```text
frontend/src/theme.css
```

The detailed theme usage rules are defined in:

```text
../.agents/rules/theme.md
```

These are complementary:

- `frontend/src/theme.css` = theme token definitions and Light/Dark values
- `../.agents/rules/theme.md` = rules for how frontend code must use those tokens

Treat `frontend/src/theme.css` as the single source of truth for `--color-xeoo-*` values.

Do not create a separate frontend theme implementation.

---

## Theme Token Usage

Prefer the existing XeooTools semantic tokens for:

- background
- surface
- surface-soft
- border
- border-dark
- text
- text-soft
- muted
- primary
- accent
- success
- warning
- danger
- info
- focus
- overlay

Common utilities include:

```text
bg-xeoo-bg
bg-xeoo-surface
bg-xeoo-surface-soft

text-xeoo-text
text-xeoo-text-soft
text-xeoo-muted

border-xeoo-border
border-xeoo-border-dark

text-xeoo-primary
text-xeoo-success
text-xeoo-warning
text-xeoo-danger
text-xeoo-info
```

Use these tokens instead of hardcoded neutral colors when they provide the required behavior.

---

## Theme Source of Truth

Do not redefine existing XeooTools tokens inside:

- `.tsx`
- `.ts`
- component CSS
- tool-specific CSS
- page-specific CSS

Do not add another `--color-xeoo-*` definition system.

If a global theme token genuinely needs to change, modify:

```text
frontend/src/theme.css
```

Do not patch the token locally inside an individual component.

---

## Light / Dark Text Rule

Normal neutral text should use:

```tsx
text - xeoo - text;
```

This allows the same component to follow the centralized Light/Dark theme.

Do not use:

```tsx
text-black dark:text-white
```

for ordinary XeooTools neutral text when `text-xeoo-text` is appropriate.

Likewise, do not use:

```tsx
text-white dark:text-black
```

for ordinary neutral text.

Use:

```tsx
text - xeoo - text;
text - xeoo - text - soft;
text - xeoo - muted;
```

according to the intended emphasis.

---

## Dark Mode

Dark mode is controlled by:

```css
html.dark {
  ...
}
```

Do not manually recreate the dark palette in tool components.

Prefer theme-aware XeooTools utilities.

Avoid unnecessary classes such as:

```text
dark:text-white
dark:text-black
dark:bg-black
dark:bg-gray-900
dark:border-gray-700
```

when an existing `xeoo-*` token already handles the same behavior.

`dark:` remains allowed when:

- a semantic status needs a component-specific variation
- an existing token cannot express the required state
- the user explicitly requests a specific dark-only variation

---

# Tool UI

Tools should generally be:

- compact
- utility-first
- lightweight
- easy to scan
- responsive
- visually consistent

Avoid:

- giant hero sections
- oversized page headers
- oversized cards
- oversized buttons
- excessive whitespace
- unnecessary decorative sections
- excessive animation

Primary workflows should fit comfortably within the available desktop viewport where practical.

Do not force `100vh` when it would clip required content.

Use internal scrolling for long sections when it improves usability.

---

# Tool Pages

Tool pages generally should not contain a large page header or marketing-style hero.

Avoid:

- giant titles
- huge category banners
- redundant introductions
- large decorative headers

Follow the established tool-page structure of the project.

---

# Static UI Language

Tool-facing UI should use English unless explicitly requested otherwise.

Do not add a language toggle unless explicitly requested.

Do not create unnecessary mixed-language UI.

---

# Inputs

Inputs within the same category should visually match.

Standardize:

- height
- padding
- border
- radius
- background
- text
- placeholder
- focus state
- disabled state

Inspect existing category tools before creating a new input style.

Do not create a different input design for every tool.

Use existing theme tokens for neutral input colors.

---

# Dropdowns

Dropdowns are part of the category UI system.

Before implementing a dropdown, inspect existing dropdowns in the same category and reuse their established pattern.

Dropdowns must:

- stay within the viewport
- have readable options
- have clear selected state
- have clear hover state
- have visible focus state
- support keyboard navigation where applicable
- handle long option names safely
- use a reasonable max-height
- scroll vertically when necessary
- work on mobile
- avoid horizontal overflow

Do not use `max-content` in a way that causes the dropdown to escape the viewport.

If an existing category uses a custom dropdown, follow that implementation style.

Do not introduce a heavy dropdown library only to change appearance.

Do not create several dropdown designs inside the same category.

---

# Buttons

Buttons within a category should share:

- height
- radius
- typography
- padding
- icon size
- icon spacing
- hover
- active
- focus
- disabled
- loading state

Tool-specific button labels may differ.

The visual system should remain consistent.

Avoid unnecessary decorative icons.

Do not add Sparkles, Shield, Camera, Wand, AI-style, or unrelated decorative icons unless they genuinely represent the action.

Use existing theme tokens for neutral, primary, and semantic button states.

---

# Icons

Use Lucide React and existing project conventions.

Prefer functional icons.

Do not introduce a separate icon style for individual tools.

Do not add icon clutter merely for decoration.

Neutral icons should normally follow the same theme-aware text tokens as surrounding content.

---

# Spacing

Follow the established category spacing rhythm.

Keep consistent:

- page padding
- card padding
- section spacing
- label spacing
- input spacing
- button spacing
- result spacing

Avoid:

- giant gaps
- excessive padding
- inconsistent vertical rhythm
- overly compressed controls

---

# Responsive Behavior

All tools must work correctly at:

```text
320px
375px
414px
640px
768px
1024px
1280px+
```

Verify:

- no horizontal overflow
- readable text
- usable controls
- safe dropdowns
- responsive cards
- responsive previews
- safe long filenames
- mobile-friendly buttons

When creating a new tool, inspect responsive behavior of existing tools in the same category and follow that pattern.

Do not create a completely different mobile layout unless the functionality genuinely requires it.

---

# Light / Dark Theme

Every new or modified tool must be checked in:

- Light Mode
- Dark Mode

Verify:

- background
- cards
- panels
- inputs
- dropdowns
- buttons
- icons
- borders
- result sections
- status indicators
- focus states
- selected states
- disabled states

Do not leave permanent black or white elements when they should follow the centralized theme.

Do not consider a theme fix complete until both modes have been checked.

---

# Tools

Tool-specific code belongs under:

```text
frontend/src/tools/<category>/
```

Keep related UI and logic close together.

Prefer simple structures.

Avoid unnecessary nested directories.

Follow existing category organization.

Example:

```text
frontend/src/tools/network/
├── IpLookup.tsx
├── ipLookupLogic.ts
├── DnsLookup.tsx
└── dnsLookupLogic.ts
```

---

# TypeScript

Use strict TypeScript.

Avoid `any` unless genuinely unavoidable.

Use type-only imports when required.

Avoid:

- implicit `any`
- unsafe casts
- unused imports
- unused variables
- unnecessary duplicate types
- unnecessary abstractions

Follow existing TypeScript conventions.

---

# Tool Logic

Keep substantial processing logic separate from UI when the existing project follows that pattern.

Prefer:

```text
Tool.tsx
toolLogic.ts
```

Keep:

- React UI/state in TSX
- calculations/processing/parsing in logic files

Do not refactor existing business logic merely to change appearance.

When logic and UI are already split in an existing category, preserve that convention.

---

# Frontend-Only Tools

When a tool is explicitly frontend-only:

- process files locally in the browser
- keep user files in the browser
- do not upload files to PHP
- do not upload files to third-party services
- do not create unnecessary API endpoints
- do not create unnecessary database tables

Prefer browser-native APIs when practical.

---

# User Files

For frontend-only file tools:

- validate supported file types
- enforce supported formats
- enforce file count limits where required
- enforce file size limits where required
- handle corrupt/unsupported files safely
- do not trust file extensions alone when actual validation is required

Do not send user files anywhere without an explicit requirement.

---

# Alerts

Never use native browser dialogs:

```text
alert()
confirm()
prompt()
```

Use the existing:

```text
frontend/src/alert.ts
```

helpers.

Reuse the existing alert implementation.

Do not create another notification/alert system.

Inspect the helper signature before using it.

---

# Existing Patterns

Before introducing a new frontend pattern:

1. Inspect existing shared components.
2. Inspect existing tools.
3. Inspect tools in the same category.
4. Inspect existing theme usage.
5. Inspect existing responsive patterns.
6. Reuse established conventions.

Existing XeooTools code is the primary reference.

---

# Routing

Follow the existing routing conventions.

Do not redesign the router for a single tool.

Do not change existing routes unless explicitly requested.

---

# Dependencies

Before adding a package:

1. Check whether the existing project already provides the capability.
2. Check whether a browser-native API can solve it.
3. Check whether an existing utility/component can be reused.

Do not add dependencies for trivial functionality.

Avoid unnecessary heavy libraries.

---

# Performance

Keep tools lightweight.

Avoid:

- unnecessary dependencies
- unnecessary re-renders
- large eager-loaded modules
- duplicate data
- unnecessary global state
- unnecessary processing of large files

Lazy-load heavy functionality where practical.

For image/file tools, avoid unnecessary copies of large binary data.

---

# Scope

Modify only the files necessary for the requested task.

Do not modify unrelated:

- tools
- routes
- backend
- APIs
- database
- theme
- shared components
- configuration

unless explicitly required.

When a request is UI-only, do not modify business logic.

When a request is logic-only, do not redesign the UI.

---

# Accessibility

Maintain:

- keyboard accessibility
- visible focus states
- proper labels
- meaningful buttons
- accessible dropdowns
- clear active/selected states
- status indicators that are not color-only

Do not sacrifice accessibility for compactness.

---

# Build

After frontend changes, verify:

- TypeScript
- imports
- unused imports
- unused variables
- Vite build
- requested behavior
- responsive behavior
- Light Mode
- Dark Mode

Never claim a check passed unless it was actually performed.

---

# Final Category UI Check

Before finishing any new or modified tool:

Compare it directly with existing tools in the same category.

Check:

- layout
- upload/input UI
- cards
- spacing
- typography
- inputs
- dropdowns
- buttons
- icons
- previews
- results
- responsive behavior
- Light Mode
- Dark Mode

Ask:

> Does this look like another tool from the same category, or does it look like a separate application?

If it looks like a separate application, revise the UI before finishing.

---

# Priority

When rules conflict, use this priority:

```text
1. Explicit user request
2. Root AGENTS.md
3. Existing frontend architecture
4. Existing category UI patterns
5. Detailed frontend rules in this file
6. Detailed theme rules in ../.agents/rules/theme.md
7. frontend/src/theme.css for actual token values
8. Existing frontend conventions
9. Simplicity and maintainability
10. New visual or architectural ideas
```

Do not sacrifice an existing working pattern for an unnecessary new approach.

---

# Final Principle

**XeooTools frontend should feel like one product, not a collection of independently designed tools.**

When adding or modifying a tool:

- inspect existing implementations first
- inspect the tools in the same category
- read the relevant `.agents/rules/*.md` file
- reuse established patterns
- preserve existing architecture
- use the centralized XeooTools theme
- add only the functionality required
- keep the UI consistent
- keep the responsive behavior consistent
- keep Light/Dark behavior consistent
- keep the code simple
- keep the scope controlled

**The feature can be new. The tool should still look and behave like XeooTools.**
