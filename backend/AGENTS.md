# XeooTools Backend Rules

## Stack

Backend uses:

- PHP
- MySQL
- Laragon

Do not assume XAMPP.

---

## API

Before creating an endpoint:

1. Inspect existing API endpoints.
2. Follow existing response conventions.
3. Follow existing CORS conventions.
4. Follow existing authentication/session conventions where applicable.
5. Reuse existing backend patterns before introducing a new pattern.

Do not create duplicate endpoints for functionality that already exists.

---

## Security

Validate all user input.

Use parameterized SQL queries.

Never concatenate user input directly into SQL.

Do not expose:

- database credentials
- API keys
- filesystem paths
- stack traces
- internal server details
- server environment information
- SQL queries
- sensitive session information

Do not trust:

- request parameters
- headers
- cookies
- uploaded filenames
- MIME types
- client-side validation

Validate important values again on the backend.

---

## CORS

Follow the existing XeooTools CORS architecture.

Do not introduce overly broad CORS rules.

Do not use:

```text
Access-Control-Allow-Origin: *
```

when the endpoint requires restricted origins.

Keep allowed origins consistent with the existing application architecture.

---

## Environment

Secrets and API keys belong in environment configuration.

Never hardcode:

- API keys
- database passwords
- private tokens
- authentication secrets

Do not commit secrets to Git.

Use the existing XeooTools environment configuration pattern.

---

## Authentication / Sessions

For admin or protected endpoints:

- inspect existing authentication/session implementation first
- reuse existing authentication helpers
- do not create a second authentication system
- verify authorization on the server
- do not trust frontend-only authentication state

Never expose protected admin data through an endpoint that lacks server-side authorization.

---

## Database

Before creating or modifying database queries:

1. Inspect the existing schema.
2. Inspect existing table naming conventions.
3. Inspect existing primary/foreign key conventions.
4. Inspect existing query patterns.
5. Reuse existing tables when appropriate.

Use:

- parameterized queries
- explicit column names
- appropriate indexes
- proper error handling

Avoid:

- unnecessary duplicate tables
- duplicate data
- unnecessary migrations
- destructive schema changes without explicit requirements

---

## Tool Metadata / Tool Registry

When the backend manages tool information, use a consistent structure.

Tool metadata may include concepts such as:

```text
name
slug
category
status
description
route
```

Status values must remain standardized.

Preferred values:

```text
ready
maintenance
soon
```

Do not introduce inconsistent variations such as:

```text
Ready
READY
active
working
coming-soon
coming_soon
```

unless the existing database schema already requires a specific representation.

If the existing schema already defines status values, follow that schema.

---

## Tool Categories

Tool categories must remain consistent between backend and frontend.

Before adding a category:

1. Inspect existing categories.
2. Reuse the existing category when appropriate.
3. Do not create duplicate categories with slightly different names.
4. Follow existing naming conventions.

Examples:

```text
Math
Psychology
Law
Health
Network
Security
Image
File
Encoding
SEO
Defacement
Code
Productive
```

Do not create variations such as:

```text
Images
Image Tools
ImageTool
image
```

when the existing project already has an established category name.

Backend category data should remain compatible with the frontend category structure.

---

## Tool Ordering

When the backend provides tool lists to the frontend/admin panel, preserve a predictable ordering model.

Preferred logical order:

```text
Category
→ Ready
→ Maintenance
→ Soon
→ Tool name
```

If the frontend already performs sorting/grouping, do not duplicate conflicting sorting logic in the backend.

The backend should provide clean, reliable metadata.

Do not randomly reorder tools between requests.

---

## Tool Status Changes

When an admin changes a tool status:

- validate the requested tool
- validate the requested status
- use parameterized SQL
- return a consistent JSON response
- do not silently modify unrelated tool fields

Status changes should use only the project's approved status values.

If status changes have permission requirements, enforce them server-side.

---

## Frontend / Backend Separation

Do not move frontend-only functionality to PHP simply because the tool exists in the backend project.

If a tool is explicitly frontend-only:

- do not create a PHP endpoint
- do not create unnecessary database tables
- do not upload files to the backend
- do not create server-side processing merely for convenience

Backend should only be introduced when the tool genuinely requires:

- server-side processing
- persistent data
- authentication
- database access
- external API protection
- privileged operations

---

## File Uploads

When backend upload is explicitly required:

- validate file type
- validate actual file content where appropriate
- validate file size
- sanitize filenames
- prevent path traversal
- use generated storage names
- never trust the original filename
- never directly execute uploaded files
- store uploads outside executable locations when possible

Do not implement file uploads when the tool is explicitly frontend-only.

---

## External APIs

When a backend endpoint proxies an external API:

- inspect the existing API integration pattern
- keep API credentials server-side
- validate incoming parameters
- validate external API responses
- handle external API failure gracefully
- do not expose private API credentials to the frontend
- return normalized XeooTools JSON responses

Do not expose raw external API responses when the project already has a normalized response convention.

---

## Responses

Return consistent JSON.

Prefer:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

For failures, follow the same structure where appropriate:

```json
{
  "success": false,
  "message": "...",
  "data": null
}
```

Do not expose:

- raw PHP warnings
- database errors
- SQL errors
- stack traces
- filesystem details
- internal server information

User-facing messages should be safe and understandable.

Internal diagnostic information should remain server-side.

---

## HTTP Status Codes

Use appropriate HTTP status codes where the existing API architecture supports them.

Examples:

```text
200 → successful request
400 → invalid request
401 → unauthenticated
403 → unauthorized
404 → resource not found
422 → validation error
500 → internal server error
```

Do not return HTTP 200 for every possible error when the existing API convention supports meaningful status codes.

Follow the project's established behavior when it differs.

---

## Validation

Validate all input on the backend even if the frontend already validates it.

Check:

- required fields
- allowed values
- string length
- numeric ranges
- IDs
- slugs
- status values
- categories
- file types
- file sizes

Never assume frontend validation is sufficient.

---

## Error Handling

Use controlled error handling.

Production responses must not expose:

- PHP warnings
- notices
- fatal error details
- SQL errors
- absolute filesystem paths
- server configuration
- stack traces

Log useful diagnostics server-side when the existing project supports logging.

Return a safe JSON error response to the frontend.

---

## Admin Endpoints

For admin endpoints:

- require authenticated session where appropriate
- verify authorization server-side
- validate all submitted values
- protect state-changing actions
- avoid exposing unnecessary admin data
- return consistent JSON

Do not rely solely on hidden frontend routes for security.

---

## API Naming / File Naming

Before creating new PHP files:

1. Inspect existing backend naming conventions.
2. Follow the established directory structure.
3. Use descriptive, consistent names.
4. Do not create multiple files for the same responsibility without a reason.

Do not introduce unnecessary architecture.

---

## Do Not Duplicate Architecture

Before creating:

- endpoint
- helper
- database table
- authentication mechanism
- response format
- validation helper
- CORS implementation

inspect existing backend code first.

Reuse existing patterns whenever possible.

The backend should grow consistently rather than accumulating several competing implementations.

---

## Verification

After backend changes:

- check PHP syntax
- check endpoint behavior
- check JSON responses
- check database queries
- check parameterized queries
- check authentication where applicable
- check authorization where applicable
- check CORS where applicable
- check validation
- check error handling
- check file upload restrictions where applicable
- verify no secrets are exposed
- verify no sensitive server information is returned

---

## Final Principle

The XeooTools backend must remain:

- consistent
- secure
- predictable
- minimal
- maintainable
- compatible with the existing frontend architecture

Before introducing a new backend pattern, inspect the existing implementation first.

**Extend the existing architecture. Do not create a separate architecture for every new tool.**
