# API Reference

**Feature**: TODO List Application  
**Base URL**: `http://localhost:8173/api`  
**Interactive Docs**: http://localhost:8173/docs

## Endpoints

### List All TODOs

```http
GET /api/todos
```

**Query Parameters**:
- `completed` (optional, boolean): Filter by completion status

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "description": "Buy groceries",
    "completed": false,
    "created_at": "2025-01-27T10:30:00Z",
    "updated_at": "2025-01-27T10:30:00Z"
  }
]
```

### Create TODO

```http
POST /api/todos
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Buy groceries"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": false,
  "created_at": "2025-01-27T10:30:00Z",
  "updated_at": "2025-01-27T10:30:00Z"
}
```

**Validation Errors**: `422 Unprocessable Entity`
- Empty or whitespace-only description
- Description exceeds 500 characters

### Get TODO by ID

```http
GET /api/todos/{id}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": false,
  "created_at": "2025-01-27T10:30:00Z",
  "updated_at": "2025-01-27T10:30:00Z"
}
```

**Error**: `404 Not Found` if TODO doesn't exist

### Update TODO

```http
PUT /api/todos/{id}
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "completed": true
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "description": "Updated description",
  "completed": true,
  "created_at": "2025-01-27T10:30:00Z",
  "updated_at": "2025-01-27T10:35:00Z"
}
```

**Errors**:
- `404 Not Found`: TODO doesn't exist
- `422 Unprocessable Entity`: Validation error

### Delete TODO

```http
DELETE /api/todos/{id}
```

**Response**: `204 No Content` (empty body)

**Error**: `404 Not Found` if TODO doesn't exist

### Toggle Completion Status

```http
PATCH /api/todos/{id}/complete
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": true,
  "created_at": "2025-01-27T10:30:00Z",
  "updated_at": "2025-01-27T10:40:00Z"
}
```

**Error**: `404 Not Found` if TODO doesn't exist

## Error Responses

### 404 Not Found
```json
{
  "detail": "TODO item with id 1 not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "description"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "An internal server error occurred"
}
```

## Interactive Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8173/docs
- **ReDoc**: http://localhost:8173/redoc
- **OpenAPI Schema**: http://localhost:8173/openapi.json

You can test all endpoints directly from the Swagger UI.

## Full OpenAPI Specification

See `specs/001-todo-list-example/contracts/openapi.yaml` for the complete OpenAPI 3.1 specification.
