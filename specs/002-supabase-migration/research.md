# Research: Migrate Local PostgreSQL to Cloud Supabase

## Decision 1: Supabase as cloud database provider

- **Decision**: Use Supabase (cloud-hosted PostgreSQL) as the primary persistent store, replacing local PostgreSQL.
- **Rationale**: 
  - Supabase provides a fully managed PostgreSQL database with automatic backups, scaling, and monitoring
  - PostgreSQL-compatible interface allows existing SQLAlchemy models to work without modification
  - Supports standard PostgreSQL connection strings, enabling seamless migration from local PostgreSQL
  - Free tier suitable for POC/MVP development
  - Accessible from cloud deployment platforms (Render) and local development environments
  - Provides additional features (auth, storage, realtime) that may be useful for future features
- **Alternatives considered**:
  - **AWS RDS**: More complex setup, higher cost, overkill for POC/MVP
  - **Neon**: Similar to Supabase but less mature ecosystem
  - **Railway PostgreSQL**: Good alternative but Supabase offers more integrated features
  - **Keep local PostgreSQL only**: Limits deployment options and collaboration

## Decision 2: Multi-app database pattern

- **Decision**: Add the `todos` table to the existing Supabase database that already contains `patients`, `migration_checkpoints`, and `alembic_version` tables. These tables remain independent and are used by different apps.
- **Rationale**: 
  - For POC/MVP purposes, sharing a database across multiple apps reduces infrastructure complexity and cost
  - Tables are independent (no foreign key relationships between apps), so there's no data coupling
  - Simplifies deployment and management for small-scale applications
  - Can be refactored to separate databases later if needed for production
- **Alternatives considered**:
  - **Separate database per app**: More complex to manage, higher cost, unnecessary for POC/MVP
  - **Schema separation**: Would require schema-level isolation, adding complexity without clear benefit for independent tables

## Decision 3: Connection method - SQLAlchemy with PostgreSQL connection string

- **Decision**: Continue using SQLAlchemy with standard PostgreSQL connection strings to connect to Supabase, rather than using the Supabase Python client library for database operations.
- **Rationale**:
  - Existing SQLAlchemy models and database code work without modification
  - Standard PostgreSQL connection strings are well-supported and documented
  - Supabase provides a direct PostgreSQL connection endpoint
  - Maintains consistency with existing codebase patterns
  - The Supabase Python client is primarily useful for auth, storage, and realtime features, not core database operations
- **Alternatives considered**:
  - **Supabase Python client for database operations**: Would require rewriting database access code, adding unnecessary complexity
  - **Hybrid approach**: Using Supabase client for some operations and SQLAlchemy for others would create inconsistency

## Decision 4: Migration strategy - one-time data transfer during maintenance window

- **Decision**: Perform a one-time migration from local PostgreSQL to Supabase during a short, scheduled maintenance window (15-30 minutes), with the application stopped or in read-only mode.
- **Rationale**:
  - Simple and reliable approach for POC/MVP scale
  - Avoids complexity of dual-write or zero-downtime migration strategies
  - Data volume is manageable (up to 10,000 records)
  - Clear cutover point ensures data consistency
- **Alternatives considered**:
  - **Zero-downtime dual-write**: More complex to implement and debug; overkill for POC/MVP
  - **Incremental sync**: Adds ongoing complexity; not needed for one-time migration
  - **Drop and reseed**: Losing existing data is not acceptable per requirements

## Decision 5: Configuration management - environment variables in backend/.env

- **Decision**: Store Supabase connection credentials in `backend/.env` file using standard environment variable names (`SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL`).
- **Rationale**:
  - Follows existing configuration patterns in the codebase
  - Supports different credentials per environment (dev, staging, production)
  - Secure and standard practice for sensitive credentials
  - Easy to configure for Render cloud deployment
- **Alternatives considered**:
  - **Hardcoded credentials**: Security risk, not environment-specific
  - **Separate config files**: Adds complexity without clear benefit
  - **Secrets management service**: Overkill for POC/MVP; can be added later

## Decision 6: Schema initialization - SQLAlchemy Base.metadata.create_all()

- **Decision**: Use SQLAlchemy's `Base.metadata.create_all()` to create the `todos` table in Supabase, with safeguards to avoid modifying existing tables.
- **Rationale**:
  - Leverages existing SQLAlchemy model definitions
  - Idempotent operation (safe to run multiple times)
  - Automatically handles table creation based on model definitions
  - Can be enhanced with existence checks to prevent accidental modifications
- **Alternatives considered**:
  - **Raw SQL migrations**: More error-prone, requires manual schema management
  - **Alembic migrations**: More complex setup; existing tables use Alembic but todos table is independent
  - **Supabase dashboard manual creation**: Not repeatable, not suitable for deployment automation

## Decision 7: Table name - use 'todos' (not 'todo-list')

- **Decision**: Use `todos` as the table name (matching existing SQLAlchemy model `__tablename__ = 'todos'`), not `todo-list`.
- **Rationale**:
  - Matches existing model definition in `backend/src/app/models.py`
  - Standard naming convention (plural, lowercase, underscores for multi-word)
  - Consistent with existing codebase patterns
  - PostgreSQL table names are case-insensitive but conventionally lowercase
- **Note**: The user mentioned 'todo-list' but the model uses 'todos'. This decision maintains consistency with the existing codebase.

## Decision 8: Data migration script - dedicated Python script

- **Decision**: Create a dedicated `migrate_to_supabase.py` script that reads from local PostgreSQL and writes to Supabase, with validation and error handling.
- **Rationale**:
  - Separates migration logic from application code
  - Can be run independently during maintenance window
  - Includes validation to ensure data integrity
  - Provides clear progress feedback and error reporting
- **Alternatives considered**:
  - **Built into init_db.py**: Mixes concerns, less flexible
  - **Manual SQL export/import**: Error-prone, not automated
  - **Third-party migration tools**: Adds dependencies, may not support Supabase-specific features

## Decision 9: Connection string format - standard PostgreSQL URL

- **Decision**: Use standard PostgreSQL connection string format (`postgresql+psycopg://user:password@host:port/database`) for Supabase connection.
- **Rationale**:
  - Supabase provides direct PostgreSQL connection strings
  - Compatible with existing SQLAlchemy engine configuration
  - Well-documented and standard format
  - Supports SSL connections (required for Supabase)
- **Alternatives considered**:
  - **Supabase-specific connection format**: Less standard, may limit future flexibility
  - **Connection pooling via Supabase client**: Adds unnecessary abstraction layer

## Decision 10: Error handling and validation

- **Decision**: Implement comprehensive error handling for connection failures, migration errors, and data validation, with clear error messages and recovery guidance.
- **Rationale**:
  - Critical for operator confidence during migration
  - Helps diagnose issues quickly
  - Enables recovery from partial failures
  - Meets requirement FR-006 (graceful error handling)
- **Alternatives considered**:
  - **Minimal error handling**: Would make troubleshooting difficult
  - **Silent failures**: Unacceptable for data migration operations

