# XeooTools Project Rules

## Project Identity

This repository is the **XeooTools** project.

XeooTools is a free tools platform built with:

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React
- PHP
- MySQL
- Laragon

Preserve the existing project architecture unless the user explicitly requests an architectural change.

Do not replace a working project pattern with another architecture merely because it is more familiar.

---

# Before Editing

Before modifying any file:

1. Read the existing file.
2. Understand its current structure and behavior.
3. Inspect related files when necessary.
4. Inspect existing implementations of similar functionality.
5. Inspect existing tools in the same category when changing or creating a tool UI.
6. Follow established XeooTools patterns.
7. Read the relevant `.agents/rules/*.md` rule file when the task falls under that rule set.
8. Modify only what is necessary for the requested task.

For UI, styling, theme, colors, responsive behavior, or Light/Dark mode work:

1. Read `.agents/rules/theme.md`.
2. Read `frontend/src/theme.css` when theme-token details are relevant.
3. Inspect an existing tool in the same category.
4. Reuse the established visual pattern before creating a new one.

Do not rewrite unrelated code.

Do not create unnecessary folders.

Do not create unnecessary abstractions.

Do not perform unrelated refactoring.

---

# Existing Project Conventions

When an equivalent implementation already exists in XeooTools:

- inspect it first
- reuse its structure
- reuse its conventions
- adapt only what is necessary

Existing working code is the primary reference.

Do not invent a new implementation when an existing project pattern already solves the problem.

---

# Category UI Consistency

This is a core XeooTools rule.

Every tool category must have a consistent UI/UX design language.

The rule is:

> **Features may differ, but tools within the same category must share the same overall UI template.**

When creating or modifying a tool:

1. Identify its category.
2. Inspect existing tools in that category.
3. Determine the established UI patterns.
4. Reuse those patterns.
5. Add only the UI required by the new functionality.

Do not create a visually independent tool when the category already has an established design.

Category consistency includes theme-token usage.

A category may have its own layout and interaction patterns, but it must still use the global XeooTools theme defined by `frontend/src/theme.css`.

---

## Category Design Reference

Existing tools in a category are the primary UI reference for future tools in that category.

Inspect:

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
- result sections
- typography
- icons
- statuses
- empty states
- loading states
- error states
- responsive behavior
- Light/Dark behavior

Example:

```text
Image Tools
├── Image Compressor
├── Image Resizer
├── Image Converter
└── Image Metadata Viewer
```

A new Image Tool must follow the established Image Tools visual language.

It may have different functionality, but it must still look like an Image Tool from XeooTools.

---

## Do Not Reinvent Category UI

Do not independently redesign common patterns such as:

- upload/dropzone
- file selector
- file preview
- input fields
- number fields
- dropdowns
- buttons
- tabs
- result cards
- status badges
- metadata rows
- progress indicators
- empty states

If the category already has an established pattern, reuse it.

If several existing tools share a pattern, treat that shared pattern as the preferred category standard.

---

## New UI Patterns

A new UI pattern is allowed only when the existing category pattern cannot reasonably support the required functionality.

Even then:

- preserve the category's visual language
- preserve typography
- preserve spacing rhythm
- preserve colors
- preserve borders/radius
- preserve responsive behavior
- avoid redesigning unrelated parts

Do not introduce new visual patterns simply because they look different or more modern.

---

# Frontend

Frontend uses:

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React

Use strict TypeScript.

Avoid `any` unless genuinely unavoidable.

Use type-only imports where required by the TypeScript configuration.

Follow the existing frontend architecture.

Do not introduce a competing application architecture.

Detailed frontend rules are defined in:

```text
.agents/rules/frontend.md
```

When a frontend task is covered by `frontend.md`, read and follow that rule file.

---

# Backend

Backend uses:

- PHP
- MySQL
- Laragon

Do not assume XAMPP.

Do not create a backend for a tool explicitly defined as frontend-only.

Detailed backend rules are defined in:

```text
.agents/rules/backend.md
```

When a backend task is covered by `backend.md`, read and follow that rule file.

---

# Tool Structure

Tool-specific code belongs under:

```text
frontend/src/tools/<category>/
```

Keep related UI and logic close together.

Prefer simple structures.

Avoid unnecessary nested directories.

Follow existing naming and folder conventions.

Example:

```text
frontend/src/tools/image/
├── ImageConverter.tsx
├── imageConverterLogic.ts
├── ImageResizer.tsx
└── imageResizerLogic.ts
```

---

# Tool UI

Tool pages should generally be:

- compact
- utility-first
- responsive
- easy to scan
- visually consistent
- lightweight

Avoid:

- oversized hero sections
- unnecessary page headers
- giant cards
- oversized buttons
- excessive whitespace
- unnecessary decorative sections
- excessive animation

The primary workflow should fit comfortably within a normal desktop viewport where practical.

Do not force `100vh` when doing so clips content.

Use internal scrolling for long tool-specific content when appropriate.

---

# No Large Tool Header

Tool pages generally should not contain a large page header or hero.

Do not add:

- oversized titles
- giant category banners
- redundant introductions
- marketing-style hero sections

Follow the established XeooTools tool-page pattern.

---

# UI Language

Tool-facing UI should use English unless the user explicitly requests another language.

Do not add language switching unless explicitly requested.

Do not create unnecessary mixed-language UI.

---

# Shared Components

Reuse existing shared components where appropriate.

Do not duplicate application-wide components inside individual tools.

Before creating a new shared component:

1. Search for an existing equivalent.
2. Determine whether it can be reused.
3. Extend it when reasonable.
4. Create a new component only when genuinely necessary.

A tool may have specialized internal UI when the feature genuinely requires it.

---

# Theme System

XeooTools uses centralized Light/Dark theme tokens.

The authoritative theme token definitions are located at:

```text
frontend/src/theme.css
```

Detailed theme usage rules are defined in:

```text
.agents/rules/theme.md
```

When working on UI, styling, colors, Light/Dark mode, or component visuals:

1. Read `.agents/rules/theme.md`.
2. Treat `frontend/src/theme.css` as the single source of truth for theme token values.
3. Use the existing `xeoo-*` theme utilities.
4. Do not create a competing theme system.
5. Do not duplicate `--color-xeoo-*` definitions inside individual components.

Prefer existing semantic tokens such as:

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

The detailed rules for when and how to use these tokens belong to `.agents/rules/theme.md`.

---

# Light / Dark Consistency

Every new or modified tool must be checked in:

- Light Mode
- Dark Mode

Verify:

- background
- surfaces
- cards
- text
- borders
- inputs
- dropdowns
- buttons
- icons
- result areas
- status colors
- focus states

No tool should look like a separate theme from the rest of XeooTools.

---

# Dark Mode Rule

Do not use `dark:` classes for ordinary neutral colors when an existing `xeoo-*` token already provides the required Light/Dark behavior.

Preferred:

```tsx
className = "bg-xeoo-surface text-xeoo-text border-xeoo-border";
```

Avoid:

```tsx
className =
  "bg-white text-black border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700";
```

`dark:` is still allowed for genuine component-specific or semantic states that cannot reasonably be represented by an existing XeooTools token.

Do not manually recreate the global dark palette inside a tool.

---

# Local Theme Overrides

Do not override XeooTools theme variables inside a component, page, or tool.

Do not add local overrides such as:

```css
.my-tool {
  --color-xeoo-text: #ffffff;
}
```

unless the user explicitly requests a scoped theme variation.

Global theme token changes belong in:

```text
frontend/src/theme.css
```

Rules for using those tokens belong in:

```text
.agents/rules/theme.md
```

---

# Inputs / Dropdowns / Buttons

Inputs, dropdowns, and buttons must follow existing XeooTools patterns.

For a new tool:

1. Inspect equivalent controls in the same category.
2. Reuse their visual structure.
3. Preserve the same sizing and spacing.
4. Preserve the same theme behavior.
5. Preserve responsive behavior.

Dropdowns must:

- stay within the viewport
- support long options safely
- have a reasonable max-height
- scroll when necessary
- remain usable on mobile
- support keyboard interaction where applicable

Do not introduce a heavy dropdown library without a real requirement.

---

# Icons

Use Lucide React and existing icon conventions.

Prefer functional icons.

Do not add decorative icon clutter.

Do not add AI-style/decorative icons merely to make a UI look more advanced.

Icons such as Sparkles, Shield, Camera, Wand, etc. should only be used when they meaningfully represent the action or concept.

---

# Frontend-Only Tools

If a tool is explicitly frontend-only:

- process data locally in the browser
- keep user files in the browser
- do not upload files to PHP
- do not upload files to third-party APIs
- do not create unnecessary backend endpoints
- do not create unnecessary database tables

Prefer browser-native APIs when practical.

---

# User Files

For frontend-only file tools:

- validate supported file types
- enforce supported formats
- enforce file count limits where required
- enforce size limits where required
- handle corrupt/unsupported files safely
- never trust extensions alone when actual validation is necessary

Do not send user files anywhere without an explicit architectural requirement.

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

notification helpers.

Do not create another notification system.

Inspect the existing helper signatures before using them.

---

# Routing

Follow the existing routing conventions.

Do not redesign the router for one tool.

Do not change existing routes unless explicitly requested.

---

# Backend Architecture

Follow existing:

- API conventions
- CORS conventions
- authentication/session conventions
- database patterns
- JSON response formats
- validation patterns

Do not create competing backend patterns.

Detailed backend rules are defined in:

```text
.agents/rules/backend.md
```

---

# Security

Never introduce unsafe behavior merely to simplify implementation.

Do not add:

- credential harvesting
- malware
- persistence
- reverse shells
- arbitrary remote execution
- unauthorized exploitation
- hidden network activity
- automatic modification of third-party websites

Simulation and educational features must remain isolated from real targets.

---

# Scope Control

Stay strictly within the scope requested by the user.

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

Do not modify unrelated tools or systems.

---

# Dependencies

Before adding a package:

1. Check whether the existing project already provides the capability.
2. Check whether browser-native APIs can solve it.
3. Check whether an existing utility can be reused.

Add a dependency only when it materially improves correctness or is genuinely necessary.

Do not add packages for trivial functionality.

---

# TypeScript Quality

Maintain strict TypeScript.

Avoid:

- unnecessary `any`
- unsafe casts
- implicit `any`
- unused imports
- unused variables
- duplicate types
- unnecessary abstractions

Use type-only imports where required.

---

# Performance

Keep the application lightweight.

Avoid:

- unnecessary libraries
- unnecessary re-renders
- duplicate data sources
- large eager-loaded modules
- unnecessary global state

Lazy-load heavy functionality where practical.

For browser file tools, avoid unnecessary copies of large binary data.

---

# Responsive Behavior

New and modified tools must work at:

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
- readable controls
- usable buttons
- safe dropdowns
- safe long filenames
- responsive cards
- responsive previews

For a tool category with existing responsive patterns, follow those patterns.

---

# Existing Patterns

Before introducing a new pattern, inspect existing:

- tools
- components
- category UI
- theme
- dropdowns
- buttons
- alerts
- file handling
- responsive layouts

Prefer established XeooTools patterns over new conventions.

The existing application is the primary reference.

---

# Change Discipline

When modifying existing functionality:

- preserve current behavior
- preserve existing logic unless explicitly asked to change it
- avoid unrelated refactoring
- avoid changing APIs unnecessarily
- avoid changing schemas unnecessarily
- avoid changing routes unnecessarily

When a request is UI-only, do not modify business logic.

When a request is logic-only, do not redesign the UI.

---

# Verification

Before declaring a task complete:

- check TypeScript
- check imports
- check unused variables/imports
- run the relevant build/checks
- verify requested behavior
- verify responsive behavior when relevant
- verify Light Mode when relevant
- verify Dark Mode when relevant
- verify routing when relevant
- verify no unrelated files were changed

For backend work, also verify:

- PHP syntax
- endpoint behavior
- JSON responses
- database queries
- CORS where applicable
- authentication/authorization where applicable

Never claim a check passed unless it was actually performed.

---

# Final Category Check

Before finishing a new or modified tool, compare it against existing tools in the same category.

Ask:

> Does this look like another XeooTools tool from the same category, or does it look like a separate application?

Check consistency of:

- layout
- spacing
- cards
- inputs
- dropdowns
- buttons
- typography
- icons
- upload areas
- previews
- result sections
- responsive behavior
- Light/Dark theme

If it looks like a separate application, revise the UI before finishing.

---

# Priority

When rules conflict, use this priority:

```text
1. Explicit user request
2. Existing project architecture
3. Existing category UI patterns
4. Existing global XeooTools UI/theme patterns
5. Detailed rules in .agents/rules/*.md
6. Existing frontend/backend conventions
7. Simplicity and maintainability
8. New visual or architectural ideas
```

Do not sacrifice an existing working pattern for an unnecessary new approach.

---

# Final Principle

**XeooTools should feel like one product, not a collection of independently designed tools.**

When adding or modifying a tool:

- inspect existing implementations first
- inspect the tools in the same category
- read the relevant `.agents/rules/*.md` file
- reuse established patterns
- preserve existing architecture
- add only the functionality required
- keep the UI consistent
- keep the theme consistent
- keep the code simple
- keep the scope controlled

**The feature can be new. The tool should still look and behave like XeooTools.**
