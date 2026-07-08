# API Conventions

## Response Shape

Successful responses should use:

```json
{
  "data": {},
  "message": "Optional message"
}
```

Errors should use:

```json
{
  "error": {
    "message": "Human-readable error",
    "code": "ERROR_CODE"
  }
}
```

## Endpoint Rules

- Prefix API routes with `/api`.
- Keep route names plural for resources.
- Use JWT middleware for protected endpoints.
- Validate request bodies before controller logic.
- Keep controller methods thin.
