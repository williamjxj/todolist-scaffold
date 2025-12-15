# Data Model: Switch from SQLite to PostgreSQL 17

## Entities

### Todo

- **Description**: Represents a single task in the todo application.
- **Fields**:
  - `id` (integer, primary key, auto-increment)
  - `title` (string, required, reasonable length limit, e.g., 255 characters)
  - `description` (string, optional, longer text)
  - `completed` (boolean, default `false`)
  - `created_at` (timestamp, default current time)
  - `updated_at` (timestamp, updated on modification)

- **Constraints & Rules**:
  - `title` MUST be non-empty after trimming whitespace.
  - `id` MUST be unique across all todos.
  - `created_at` MUST NOT change after initial insert.
  - `updated_at` MUST reflect the last update time for the row.

### Database Configuration (conceptual)

- **Description**: Represents how the backend chooses and connects to the underlying database.
- **Fields** (expressed as configuration, not persisted entity):
  - `DB_BACKEND` (enum-like: `postgresql` or `sqlite`)
  - `DATABASE_URL` (connection string/URL for the selected backend)

- **Constraints & Rules**:
  - When `DB_BACKEND` is `postgresql`, `DATABASE_URL` MUST be a valid PostgreSQL connection URL reachable from the local machine.
  - When `DB_BACKEND` is `sqlite`, `DATABASE_URL` MUST point to the existing SQLite file.
  - The application MUST use a single active backend at runtime (no mixed writes).

## Relationships

- Current scope uses a single `Todo` entity with no additional relations.
- Future extensions (e.g., users, tags) SHOULD be modeled via foreign keys in PostgreSQL-compatible ways.

## Migration Mapping (SQLite → PostgreSQL)

- **Source**: Existing SQLite `todos` table (fields as defined above).
- **Target**: PostgreSQL `todos` table with matching fields and compatible types.

- **Mapping rules**:
  - `id` → `id` (integer to integer, preserve values if possible)
  - `title` → `title` (text to text/varchar)
  - `description` → `description` (text to text)
  - `completed` → `completed` (boolean-like to boolean)
  - `created_at` → `created_at` (datetime to timestamp with time zone or without, consistent across app)
  - `updated_at` → `updated_at` (datetime to timestamp)

- **Validation**:
  - Row counts MUST match between SQLite and PostgreSQL after migration.
  - For each migrated row, all field values MUST be semantically equivalent (allowing for minor formatting differences in timestamps).
