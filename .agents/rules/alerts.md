---
trigger: glob
globs: "frontend/src/**/*.tsx,frontend/src/**/*.ts"
description: "Rules for alerts, confirmations, notifications, and user feedback in XeooTools."
---

# XeooTools Alert Rules

## No Native JavaScript Alerts

Never use native browser dialogs such as:

- alert()
- window.alert()
- confirm()
- window.confirm()
- prompt()
- window.prompt()

Do not create user-facing browser dialogs that produce messages such as:

"localhost says"

"localhost wants to..."

or other native browser popup UI.

## Existing XeooTools Alert System

XeooTools already provides a shared alert/notification system.

When an alert, confirmation, information message, warning, error, or success notification is required:

Use the existing helpers from:

frontend/src/alert.ts

Use the existing project helpers where appropriate, including:

- showConfirm
- showError
- showInfo
- showSuccess
- showWarning

Before importing alert helpers, inspect src/alert.ts if the exact available API is unclear.

Do not create another alert/notification system for an individual tool.

## Confirmation

Use the existing confirmation helper for destructive or irreversible actions.

Examples:

- delete history
- reset saved project
- remove stored entries
- clear all tracker data

Do not use confirm().

## Errors

Use the existing error notification system for user-facing errors when an alert-style notification is appropriate.

Do not use alert().

## Success

Use the existing success notification system for successful actions when feedback is useful.

Examples:

- copied successfully
- exported successfully
- saved successfully
- imported successfully

Do not use alert().

## Informational Messages

Use the existing informational notification system when a temporary informational message is appropriate.

Do not create ad-hoc browser dialogs.

## UI Feedback

Prefer inline UI feedback when the message is part of the normal page flow.

Use alerts for:

- confirmations
- important transient feedback
- success/error actions
- important warnings

Do not use alerts for every minor interaction.

## Consistency

All tools must use the same XeooTools alert system.

Do not:

- introduce another modal library
- create custom browser dialogs
- use native JavaScript dialogs
- create a custom alert implementation without explicit approval
