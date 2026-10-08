---
trigger: glob
globs: "frontend/src/tools/**/*.tsx,frontend/src/tools/**/*.ts"
description: "Change scope and file modification rules for XeooTools tools."
---

# Tool Change Rules

## Inspect First

Before editing a tool:

1. Read the target file.
2. Read related logic files.
3. Inspect nearby existing tools when useful.
4. Follow existing project patterns.

Do not edit blindly.

## Scope

Only modify files required for the user's request.

Do not unnecessarily modify:

- unrelated tools
- shared components
- global theme files
- router
- backend
- database
- authentication
- configuration
- package dependencies

## Styling Requests

If the user asks for styling:

- change styling
- preserve logic
- preserve API behavior
- preserve data structures

Do not silently redesign unrelated parts.

## Logic Requests

If the user asks for logic:

- change the required logic
- preserve existing UI where possible
- preserve unrelated styling

## Text Requests

If the user asks to translate or change UI text:

- change only relevant user-facing text
- preserve functionality
- preserve styling unless requested

## New Files

Do not create unnecessary abstractions.

Prefer simple file structures.

For example:

Tool.tsx
toolLogic.ts

is preferred over many small folders and files when the tool does not need them.

## Dependencies

Do not install packages unless necessary.

Check:

- existing packages
- existing utilities
- browser-native APIs

before adding a new dependency.

## Router

Do not rewrite routing for a single tool unless explicitly requested or genuinely required.

## Final Check

Before declaring completion:

- verify the requested change
- verify TypeScript
- verify build
- verify that unrelated systems were not changed
- verify that no unnecessary files were created
