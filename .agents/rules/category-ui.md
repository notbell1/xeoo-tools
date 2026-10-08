# Category UI Consistency

## Scope

This rule applies to all tools inside:

```text
frontend/src/tools/<category>/
```

## Core Rule

Each tool category must have **one consistent UI/UX design language**.

When creating or modifying a tool, the agent MUST inspect existing tools in the same category first.

The existing tools are the primary visual reference.

### The rule is:

> **New features may differ. The overall UI template must not.**

Tools within the same category should look like they belong to the same product family.

---

## BEFORE CREATING OR MODIFYING A TOOL

The agent MUST inspect existing tools in the same category before writing UI code.

Inspect at least:

- existing TSX structure
- layout
- spacing
- cards
- inputs
- buttons
- dropdowns
- upload areas
- result panels
- typography
- icons
- status indicators
- responsive behavior
- Light/Dark theme behavior

If multiple existing tools already share a common pattern, that pattern becomes the default category standard.

Do not invent a new UI pattern without a strong functional reason.

---

## CATEGORY TEMPLATE

Each category should develop its own reusable visual template.

For example:

```text
Image Tools
├── Image Compressor
├── Image Resizer
├── Image Converter
└── Image Metadata Viewer
```

These tools may have different features, but their overall UI should share:

- same page structure
- same content width
- same card system
- same upload/input pattern
- same form controls
- same button system
- same spacing rhythm
- same typography hierarchy
- same result presentation
- same responsive behavior
- same Light/Dark behavior

Only the feature-specific controls and content should differ.

---

## DO NOT CREATE A NEW DESIGN FOR EVERY TOOL

Avoid creating separate designs such as:

```text
Tool A → large cards
Tool B → compact cards
Tool C → completely different upload UI
Tool D → different button system
```

This is NOT allowed when the tools belong to the same category.

Instead:

```text
Category Template
        ↓
Tool A → feature variation
Tool B → feature variation
Tool C → feature variation
Tool D → feature variation
```

---

## EXISTING TOOL = DESIGN REFERENCE

When a category already contains tools:

**Do not start the new tool UI from scratch.**

Find the closest existing tool and reuse its visual patterns.

Example:

```text
Image Tools:
Image Compressor
Image Resizer
Image Converter
Image Metadata Viewer
```

A future:

```text
Image Cropper
Image Watermark
Image Color Picker
```

must first inspect the existing Image Tools UI.

The new tool should inherit the established Image Tools visual language.

---

## REUSE PATTERNS

Prefer reusing existing patterns for:

- upload/dropzone
- file cards
- image previews
- input fields
- number inputs
- select/dropdown
- buttons
- tabs
- result cards
- status badges
- progress indicators
- metadata rows
- empty states
- error states
- success states

Do not create a visually different implementation of an existing pattern unless there is a functional requirement.

---

## FUNCTIONAL DIFFERENCES ARE ALLOWED

The feature itself can be different.

For example:

```text
Image Compressor
→ Quality
→ Compression result

Image Resizer
→ Width
→ Height
→ Aspect ratio

Image Converter
→ Format
→ Quality
→ Batch conversion

Image Metadata Viewer
→ Metadata
→ EXIF
→ GPS
```

These controls can differ.

However, their presentation should still use the same category template.

---

## INPUT/UI STANDARDIZATION

If several tools in a category use the same type of input, the visual presentation must be consistent.

Examples:

```text
image upload → same visual pattern
text input   → same visual pattern
number input → same visual pattern
dropdown     → same visual pattern
primary button → same visual pattern
result card  → same visual pattern
```

Do not create a different component style for each tool.

---

## DROPDOWN RULE

Dropdowns within the same category must follow the established category pattern.

The agent MUST inspect existing dropdown implementations before creating another one.

Keep:

- same width behavior
- same height
- same radius
- same border
- same typography
- same focus state
- same selected state
- same hover state
- same responsive behavior

The dropdown must not overflow the viewport.

When the existing category uses a custom dropdown, reuse that pattern.

Do not introduce another dropdown design without justification.

---

## BUTTON RULE

Buttons within a category should share:

- height
- radius
- typography
- padding
- icon behavior
- hover state
- focus state
- disabled state

Tool-specific button text may differ.

The button design should not.

Avoid unnecessary decorative icons.

---

## ICON RULE

Use the established icon style of the category.

Do not introduce decorative or unrelated icons simply to make a new tool look different.

Use icons only when they communicate the action clearly.

---

## SPACING RULE

Maintain the established spacing rhythm of the category.

Do not make new tools:

- significantly more spacious
- significantly more compressed
- full of giant cards
- full of oversized buttons
- full of excessive margins

The visual density should match existing tools.

---

## RESPONSIVE RULE

A new tool in an existing category must follow the responsive behavior of existing tools.

Inspect how current category tools behave at:

```text
320px
375px
414px
640px
768px
1024px
1280px+
```

Do not invent a completely different mobile layout unless the feature requires it.

---

## LIGHT / DARK RULE

All tools in the same category must use the same theme system.

The agent MUST inspect existing category tools before deciding how colors should work.

Reuse:

- theme tokens
- surface styles
- border styles
- text hierarchy
- semantic colors
- focus styles

Do not create a separate theme system for a new tool.

Do not introduce arbitrary hardcoded colors when an existing token already provides the required style.

---

## CATEGORY EVOLUTION

The first tools in a category establish the category's visual language.

As more tools are added:

```text
Existing category pattern
        ↓
Inspect
        ↓
Reuse
        ↓
Add feature-specific UI
        ↓
Keep visual consistency
```

Do not allow every new tool to gradually create another visual system.

---

## WHEN A NEW PATTERN IS ACTUALLY NECESSARY

A new UI pattern is allowed only when the existing category template cannot reasonably support the new functionality.

Examples:

- a new interaction type
- a complex editor
- advanced data visualization
- unique multi-step workflow

Even then:

1. Reuse the existing category styling.
2. Keep the new pattern visually compatible.
3. Do not redesign unrelated parts of the tool.
4. Prefer extending an existing pattern over replacing it.

---

## DO NOT MODIFY THE CATEGORY TEMPLATE CASUALLY

If an existing pattern is already used by several tools, do not change it only for one new tool.

If a shared improvement is required, determine whether the change should be applied consistently to the category.

Avoid:

```text
Tool A → old upload
Tool B → new upload
Tool C → another upload
```

Prefer:

```text
Category
→ one approved upload pattern
→ all applicable tools use it
```

---

## BEFORE FINISHING

The agent MUST compare the new/modified tool with existing tools in the same category.

Verify:

- layout consistency
- input consistency
- dropdown consistency
- button consistency
- card consistency
- spacing consistency
- typography consistency
- icon consistency
- theme consistency
- responsive consistency

Ask internally:

> "Does this look like a new tool from the same category, or does it look like a completely different application?"

If it looks like a different application, revise the UI before finishing.

---

## PRIORITY

When UI decisions conflict, use this priority:

```text
1. Existing category UI pattern
2. Existing XeooTools global UI rules
3. Tool-specific functional requirements
4. New visual ideas
```

Existing category consistency takes priority over introducing a new visual style.

---

## FINAL PRINCIPLE

**Tools in the same category should share the same UI template.**

The feature may change.

The data may change.

The controls may change.

The overall visual language must remain consistent.

**Inspect existing category tools first. Reuse their patterns. Extend the template. Do not invent a separate design for every new tool.**
