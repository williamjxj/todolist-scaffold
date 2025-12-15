# Research: Switch persistent database from SQLite to PostgreSQL 17 (local dev)

## Decision 1: Database engine for persistent storage

- **Decision**: Use PostgreSQL 17 as the primary persistent store for todos in local development, replacing SQLite.
- **Rationale**: PostgreSQL is closer to what a production deployment would use, supports richer SQL features, better concurrency, and clearer separation between app code and storage. Using it in local dev reduces surprise when moving toward production-like environments.
- **Alternatives considered**:
  - **Keep SQLite only**: Simpler to run with no external service, but diverges from typical production DB setups and makes it harder to validate schema and SQL behavior.
  - **Other relational DBs (MySQL, MariaDB)**: Also viable, but PostgreSQL is widely adopted, has strong tooling, and is already available on the target MacBook Pro.

## Decision 2: Migration strategy from SQLite to PostgreSQL (local-only)

- **Decision**: Perform a one-time migration using a short, scheduled maintenance window, with the app stopped or in read-only mode while data is copied from SQLite into PostgreSQL.
- **Rationale**: For local development, zero-downtime migration is unnecessary overhead. A simple stop–migrate–start flow is easier to reason about, test, and document.
- **Alternatives considered**:
  - **Zero-downtime dual-write strategy**: More complex to implement and debug; overkill for local/dev scenarios.
  - **Drop-and-reseed only**: Losing existing local data is acceptable in some cases, but the feature explicitly calls for migrating existing SQLite data where present.

## Decision 3: Configuration and environment handling

- **Decision**: Drive the database choice and connection details via environment variables and/or a single configuration module, with PostgreSQL as the default for this feature, while still allowing fallback to SQLite when needed.
- **Rationale**: This keeps the switch between SQLite and PostgreSQL trivial (change env values), avoids hardcoding machine-specific settings in code, and aligns with typical FastAPI configuration patterns.
- **Alternatives considered**:
  - **Hardcoded PostgreSQL DSN in source**: Fastest to implement but brittle and not shareable across machines.
  - **Separate code branches for SQLite vs PostgreSQL**: Increases maintenance and testing surface; better to have a single code path with pluggable URL/engine.

## Decision 4: FastAPI integration approach

- **Decision**: Use SQLAlchemy with a PostgreSQL connection URL for the existing FastAPI backend, reusing the current ORM models where possible and updating only the engine/session configuration and any SQLite-specific SQL.
- **Rationale**: The project already uses a relational model for todos; switching engines at the SQLAlchemy level minimizes changes to service and API layers.
- **Alternatives considered**:
  - **Direct psycopg or raw SQL integration**: More control, but diverges from existing patterns and increases boilerplate.
  - **Introduce a repository abstraction layer now**: Useful for larger systems, but adds indirection beyond what is needed for this single-feature switch.

## Decision 5: Testing and validation focus

- **Decision**: Focus tests on ensuring identical behavior of todo operations (CRUD) when backed by PostgreSQL, plus a migration verification test that compares pre- and post-migration data sets.
- **Rationale**: The feature’s main risk is behavioral divergence or data loss; centering tests around these flows gives the highest assurance.
- **Alternatives considered**:
  - **Broad performance benchmarking**: Useful but not necessary for local-only dev use.
  - **Complex rollback logic**: For local/dev usage, manual cleanup or re-running migration is acceptable if something fails.