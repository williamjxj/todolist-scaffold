# Quickstart: Migrating from Local PostgreSQL to Cloud Supabase

This guide explains how to migrate the FastAPI backend from local PostgreSQL to cloud-hosted Supabase, enabling cloud deployment and multi-environment access.

## Prerequisites

- Supabase account (free tier is sufficient for POC/MVP)
- Existing Supabase project with database (may already contain `patients`, `migration_checkpoints`, `alembic_version` tables)
- Local PostgreSQL database with existing `todos` table (source data)
- Python 3.12 with backend dependencies installed
- Access to `backend/.env` file for configuration

## Overview

The migration process involves:
1. Setting up Supabase connection credentials
2. Creating the `todos` table in Supabase (without modifying existing tables)
3. Migrating data from local PostgreSQL to Supabase
4. Updating application configuration to use Supabase
5. Verifying the migration

## Step 1: Get Supabase Connection Credentials

1. Log in to your Supabase dashboard: https://app.supabase.com
2. Select your project (or create a new one if needed)
3. Navigate to **Settings** → **Database**
4. Find the **Connection string** section
5. Copy the **Connection string** (URI format) - it looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. Also note your **Project URL** and **API Key** (anon/public key) from **Settings** → **API**

## Step 2: Configure backend/.env for Supabase

Edit `backend/.env` file and add/update the following variables:

### Development Environment

```env
# Database Configuration
DB_BACKEND=postgresql
DATABASE_URL="postgresql+psycopg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

# Supabase Configuration (optional, for future features)
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_KEY="[your-anon-key]"

# CORS Origins (comma-separated for development)
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
```

### Staging Environment

```env
# Database Configuration
DB_BACKEND=postgresql
DATABASE_URL="postgresql+psycopg://postgres.[staging-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

# Supabase Configuration
SUPABASE_URL="https://[staging-project-ref].supabase.co"
SUPABASE_KEY="[staging-anon-key]"

# CORS Origins (comma-separated for staging)
CORS_ORIGINS="https://staging.yourdomain.com,https://staging-app.yourdomain.com"
```

### Production Environment

```env
# Database Configuration
DB_BACKEND=postgresql
DATABASE_URL="postgresql+psycopg://postgres.[prod-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

# Supabase Configuration
SUPABASE_URL="https://[prod-project-ref].supabase.co"
SUPABASE_KEY="[prod-anon-key]"

# CORS Origins (comma-separated for production)
CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

**Important Notes**:
- Replace `[project-ref]`, `[password]`, and `[region]` with your actual Supabase values
- The connection string must include `?sslmode=require` for secure connections (will be added automatically if missing)
- Use the **Connection pooling** URL (port 6543) for better performance, or direct connection (port 5432) if needed
- Keep your local PostgreSQL `DATABASE_URL` commented or in a backup for rollback if needed
- Use different Supabase projects for different environments (dev, staging, production) for better isolation
- CORS_ORIGINS can be a comma-separated string or JSON array format

## Step 3: Verify Supabase Database State

Before proceeding, verify that your Supabase database contains the existing tables that should NOT be modified:
- `patients`
- `migration_checkpoints`
- `alembic_version`

You can verify this using the Supabase SQL Editor or by connecting with a PostgreSQL client.

**DO NOT** modify these tables. The migration will only add the new `todos` table.

## Step 4: Create the todos Table in Supabase

Run the schema initialization script to create the `todos` table:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python init_db.py
```

This script will:
- Read `DATABASE_URL` from `backend/.env`
- Connect to Supabase
- Create the `todos` table using SQLAlchemy's `Base.metadata.create_all()`
- **Only create tables that don't exist** - existing tables (`patients`, `migration_checkpoints`, `alembic_version`) will not be modified

**Expected Output**:
```
Initializing database using configured DATABASE_URL...
  DB_BACKEND = postgresql
  DATABASE_URL = postgresql+psycopg://...
Database initialized successfully! Tables created in configured database.
```

## Step 5: Migrate Data from Local PostgreSQL to Supabase

### 5.1: Prepare for Migration

1. **Stop the application** or put it in read-only mode to prevent new writes during migration
2. **Backup your local PostgreSQL database** (optional but recommended):
   ```bash
   pg_dump -h localhost -U your_user -d your_database > local_postgres_backup.sql
   ```

### 5.2: Update Migration Script Configuration

The migration script needs to connect to both databases. Update `backend/migrate_to_supabase.py` (or create it) with:

- **Source**: Local PostgreSQL connection string (from your previous `DATABASE_URL`)
- **Target**: Supabase connection string (from Step 2)

### 5.3: Run the Migration

```bash
cd backend
source venv/bin/activate
python migrate_to_supabase.py
```

The migration script will:
1. Connect to local PostgreSQL (source)
2. Connect to Supabase (target)
3. Read all `todos` records from local PostgreSQL
4. Write records to Supabase `todos` table
5. Validate data integrity (record counts, field matching)
6. Report migration status

**Expected Output**:
```
Starting migration from local PostgreSQL to Supabase...
Found 150 todos in local PostgreSQL database.
Migrating todos to Supabase...
Migrated 150 todos successfully.
Validating migration...
✓ Record count matches: 150
✓ Data integrity check passed
Migration completed successfully!
```

### 5.4: Verify Migration

After migration, verify the data:

1. **Check record count**:
   ```bash
   # Connect to Supabase and run:
   SELECT COUNT(*) FROM todos;
   ```

2. **Spot check records**:
   ```bash
   # Verify a few records match:
   SELECT id, description, completed, priority, due_date, category 
   FROM todos 
   ORDER BY id 
   LIMIT 10;
   ```

3. **Test the application** (see Step 6)

## Step 6: Update Application and Verify

### 6.1: Verify Configuration

Ensure `backend/.env` has the Supabase `DATABASE_URL` (from Step 2).

### 6.2: Start the Application

```bash
cd backend
source venv/bin/activate
./run.sh
# OR manually:
cd src
uvicorn app.main:app --reload --port 8000
```

### 6.3: Test the Application

1. **Check health endpoint**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **List todos** (should show migrated data):
   ```bash
   curl http://localhost:8000/api/todos
   ```

3. **Create a new todo**:
   ```bash
   curl -X POST http://localhost:8000/api/todos \
     -H "Content-Type: application/json" \
     -d '{"description": "Test todo from Supabase"}'
   ```

4. **Verify in Supabase dashboard**:
   - Go to **Table Editor** → `todos`
   - Confirm you see your todos, including the newly created one

### 6.4: Test All CRUD Operations

Verify that all operations work correctly:
- ✅ Create new todos
- ✅ Read todos (list and by ID)
- ✅ Update todos (description, completion status, priority, due date, category)
- ✅ Delete todos
- ✅ Filter by completion status and priority

## Step 7: Deploy to Render (Future)

When ready to deploy to Render cloud:

1. **Create a Render service**:
   - Connect your repository
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend/src && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Configure environment variables in Render**:
   - `DATABASE_URL`: Your Supabase connection string
   - `DB_BACKEND`: `postgresql`
   - `CORS_ORIGINS`: Your frontend URL(s)
   - `SUPABASE_URL`: Your Supabase project URL (optional)
   - `SUPABASE_KEY`: Your Supabase anon key (optional)

3. **Deploy and verify**:
   - Render will build and deploy your application
   - Test the deployed API endpoints
   - Verify Supabase connection from cloud environment

## Troubleshooting

### Configuration Issues

**Error**: `CORS_ORIGINS parsing error` or `JSONDecodeError`
- **Solution**: Ensure CORS_ORIGINS is either:
  - A comma-separated string: `"http://localhost:5173,http://localhost:3000"`
  - A valid JSON array: `["http://localhost:5173","http://localhost:3000"]`
  - Or leave it unset to use defaults

**Error**: `Extra inputs are not permitted` for PORT or DATABASE_URL_MIGRATION
- **Solution**: These fields are now supported. If you see this error, update your pydantic-settings version or the fields will be automatically ignored.

**Error**: `Invalid PostgreSQL connection string format`
- **Solution**: Verify your DATABASE_URL follows the format:
  `postgresql+psycopg://user:password@host:port/database`
- Check that all components (user, password, host, port, database) are present

### Connection Issues

**Error**: `connection refused` or `timeout`
- **Solution**: 
  - Verify Supabase connection string is correct
  - Check network connectivity
  - Ensure Supabase project is active (not paused)
  - Verify firewall rules allow connections to Supabase

**Error**: `SSL connection required`
- **Solution**: Add `?sslmode=require` to your connection string (or it will be added automatically)

**Error**: `authentication failed`
- **Solution**: 
  - Verify database password in connection string matches Supabase settings
  - Check that the database user has proper permissions
  - Ensure you're using the correct project reference in the connection string

### Migration Issues

**Error**: `table already exists`
- **Solution**: The `todos` table already exists. Either drop it (if safe) or skip table creation step

**Error**: `data type mismatch`
- **Solution**: Verify local PostgreSQL schema matches Supabase schema. Check for custom types or extensions.

**Error**: `partial migration`
- **Solution**: Check migration script logs for specific errors. Re-run migration after fixing issues (may need to clear Supabase `todos` table first)

### Application Issues

**Error**: `no such table: todos`
- **Solution**: Run `python init_db.py` to create the table in Supabase

**Error**: `connection pool exhausted`
- **Solution**: Supabase has connection limits. Use connection pooling (port 6543) or reduce connection pool size in SQLAlchemy

## Rollback Procedure

If you need to rollback to local PostgreSQL:

1. **Stop the application**
2. **Update `backend/.env`**:
   ```env
   DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/database"
   ```
3. **Restart the application**
4. **Verify** data is accessible from local PostgreSQL

**Note**: Data in Supabase remains intact and can be re-migrated later if needed.

## Next Steps

- Monitor application performance and Supabase connection health
- Set up Supabase monitoring and alerts
- Consider implementing connection retry logic for resilience
- Plan for future features that may use Supabase auth, storage, or realtime capabilities

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Python Client](https://supabase.com/docs/reference/python/initializing)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [SQLAlchemy Engine Configuration](https://docs.sqlalchemy.org/en/20/core/engines.html)

