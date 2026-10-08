---
trigger: glob
globs: "frontend/src/tools/**/*.tsx,frontend/src/tools/**/*.ts"
description: "TypeScript and React rules for XeooTools tools."
---

# Tool TypeScript Rules

## TypeScript

Use strict TypeScript.

Avoid any unless genuinely unavoidable.

Prefer explicit types for:

- props
- state
- tool data
- API responses
- configuration objects
- callbacks
- return values when useful

Do not suppress TypeScript errors without understanding the cause.

## React

Use functional components.

Use React hooks correctly.

Do not introduce unnecessary global state.

Do not introduce unnecessary context providers.

Do not overuse useMemo or useCallback without a real reason.

## Imports

Follow existing project import conventions.

Use type-only imports when required.

Example:

import type { FormEvent } from "react";

Remove unused imports.

Remove unused variables.

## Logic Separation

When a tool contains substantial calculation or processing logic, separate it into a local TypeScript logic file when useful.

Preferred:

Tool.tsx
toolLogic.ts

Do not create many tiny files for trivial logic.

## Existing Logic

When modifying an existing tool:

- preserve current behavior
- preserve existing API contracts
- preserve existing state structure
- preserve existing data structures
- change only what the user requested

Do not rewrite working logic without a clear reason.

## Error Handling

Handle expected errors gracefully.

User-facing errors must be:

- clear
- concise
- actionable

Do not expose raw stack traces.

## Performance

Avoid:

- expensive calculations during every render
- unnecessary event listeners
- giant objects recreated every render
- unnecessary DOM trees
- heavy libraries for simple functionality

Use browser-native APIs when practical.

## Verification

Before finishing:

- check syntax
- check TypeScript
- check imports
- check unused imports
- check unused variables
- check build errors
