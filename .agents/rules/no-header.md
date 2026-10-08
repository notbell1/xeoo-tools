---
trigger: glob
globs: "frontend/src/tools/**/*.tsx"
description: "All XeooTools tool pages must not create a page header or tool hero header."
---

# No Tool Header

These rules apply to all TSX files inside:

frontend/src/tools/

## Rule

Tool pages MUST NOT create or render a page header.

Do not add:

- page header
- hero header
- tool hero section
- category badge above the tool
- large introductory title section
- large introductory description section

Do not import the shared Header component into a tool page unless the user explicitly requests it.

Do not create a replacement header inside a tool.

## No Language Toggle

Do not automatically add a language selector or language toggle to tool pages.

Only add language controls when the user explicitly requests them.

## Avoid Large Intro Sections

Do not create a large introductory section before the actual tool functionality.

Avoid stacked layouts containing:

- category badge
- icon
- large title
- long description
- large spacing
- decorative hero content

The user should reach the actual tool quickly.

## Preferred Structure

Start with the actual tool functionality.

Examples:

- input
- form
- editor
- calculator
- questionnaire
- result
- preview

## Small Contextual Text

A small title or instructional sentence inside the functional tool interface is allowed when useful.

For example:

Answer each statement using the scale below.

This is acceptable because it directly supports the tool.

Do not turn it into a separate page hero.

## Footer

The absence of a Header does not automatically mean the Footer must be removed.

Use the existing Footer when consistent with the existing application structure.

## Exception

If the user explicitly requests a header for a specific tool, follow the explicit user request.
