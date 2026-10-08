# XeooTools Theme Rules

## Scope

These rules apply to the XeooTools frontend project.

Primary theme file:

`frontend/src/theme.css`

Treat `frontend/src/theme.css` as the single source of truth for XeooTools design tokens and theme colors.

## Theme Source of Truth

- Reuse existing `--color-xeoo-*` tokens from `frontend/src/theme.css`.
- Do not create duplicate theme systems inside components.
- Do not redefine existing XeooTools theme variables in `.tsx`, `.ts`, or component CSS unless explicitly requested.
- Check the theme file before introducing a new color.

## Text

Use:

```tsx
text - xeoo - text;
text - xeoo - text - soft;
text - xeoo - muted;
```

For normal neutral UI text, do not replace these with hardcoded `text-black`, `text-white`, `text-gray-*`, `text-slate-*`, `text-zinc-*`, or `text-neutral-*` utilities when an XeooTools token is appropriate.

Do not use `text-black dark:text-white` for normal XeooTools text. The theme token already switches between light and dark values.

## Backgrounds

Prefer:

```tsx
bg - xeoo - bg;
bg - xeoo - surface;
bg - xeoo - surface - soft;
```

## Borders

Prefer:

```tsx
border - xeoo - border;
border - xeoo - border - dark;
```

## Brand

Use the existing:

```text
xeoo-primary
xeoo-primary-hover
xeoo-primary-soft
xeoo-accent
xeoo-accent-hover
xeoo-accent-soft
```

## Semantic Colors

Use existing semantic tokens for status meaning:

```text
xeoo-success
xeoo-warning
xeoo-danger
xeoo-info
```

Semantic colors may remain colored in both light and dark themes.

## Dark Mode

Dark mode is controlled by `html.dark` in `frontend/src/theme.css`.

Prefer theme-aware utilities such as:

```tsx
text - xeoo - text;
bg - xeoo - surface;
border - xeoo - border;
```

Avoid unnecessary `dark:` overrides when an existing XeooTools token already handles the theme.

## Components

Inputs should normally use `bg-xeoo-bg`, `text-xeoo-text`, `border-xeoo-border`, and `placeholder:text-xeoo-muted`.

Neutral buttons should use `bg-xeoo-surface`, `text-xeoo-text`, and `border-xeoo-border`.

Modals should use `bg-xeoo-surface`, `text-xeoo-text`, and `border-xeoo-border`.

Neutral icons should use `text-xeoo-text`, `text-xeoo-text-soft`, or `text-xeoo-muted`.

## Preserve UI/UX

- Preserve existing layout, spacing, responsiveness, interactions, and component structure when fixing theme issues.
- Do not redesign a page just to change colors.

## Adding New Tokens

Only add a new `--color-xeoo-*` token when an existing token cannot represent the requirement and the new token is reusable or explicitly requested.

When adding a new token, define the light value in `@theme` and the dark override in `html.dark`.

## Priority

When component code conflicts with the theme system, `frontend/src/theme.css` is the source of truth.

Recommended order:

1. Check `frontend/src/theme.css`.
2. Reuse an existing XeooTools token.
3. Use a semantic color only where appropriate.
4. Add a new token only when justified.
5. Never create a duplicate theme system inside a component.
