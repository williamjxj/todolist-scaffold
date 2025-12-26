# Tasks: Migrate Local PostgreSQL to Cloud Supabase

**Input**: Design documents from `/specs/002-supabase-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included to ensure migration reliability and data integrity validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend paths: `backend/src/app/`, `backend/`, `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Supabase integration preparation

- [x] T001 [P] Add Supabase Python client dependency to backend/requirements.txt (optional, for future features)
- [x] T002 [P] Verify psycopg[binary] dependency exists in backend/requirements.txt for PostgreSQL connection
- [x] T003 [P] Review existing backend/src/app/config.py structure for environment variable support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update backend/src/app/config.py to support Supabase environment variables (SUPABASE_URL, SUPABASE_KEY, DATABASE_URL)
- [x] T005 Update backend/src/app/database.py to handle Supabase PostgreSQL connection strings with SSL requirements
- [x] T006 [P] Add connection error handling and logging in backend/src/app/database.py for Supabase connection failures
- [x] T007 [P] Update backend/src/app/database.py to verify connection to Supabase on startup with clear error messages

**Checkpoint**: Foundation ready - Supabase connection infrastructure is in place, user story implementation can now begin

---

## Phase 3: User Story 1 - Application operates with cloud Supabase database (Priority: P1) 🎯 MVP

**Goal**: Configure the application to connect to Supabase and verify all todo CRUD operations work correctly with the cloud database.

**Independent Test**: Configure the application with Supabase connection string, start the application, and verify all todo operations (create, read, update, delete) function correctly. Test that data persists in Supabase and remains accessible after application restart.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Create integration test for Supabase connection in backend/tests/integration/test_supabase_connection.py
- [x] T009 [P] [US1] Create integration test for todo CRUD operations against Supabase in backend/tests/integration/test_todos_supabase.py
- [x] T010 [P] [US1] Create unit test for Supabase connection error handling in backend/tests/unit/test_database_supabase.py

### Implementation for User Story 1

- [x] T011 [US1] Update backend/src/app/config.py to read SUPABASE_URL and SUPABASE_KEY from environment variables (optional, for future features)
- [x] T012 [US1] Update backend/src/app/database.py to support Supabase connection strings (postgresql+psycopg:// with sslmode=require)
- [x] T013 [US1] Update backend/init_db.py to create todos table in Supabase using SQLAlchemy Base.metadata.create_all() with safeguards to avoid modifying existing tables
- [x] T014 [US1] Add table existence check in backend/init_db.py to prevent accidental modification of existing tables (patients, migration_checkpoints, alembic_version)
- [x] T015 [US1] Update backend/src/app/database.py to log Supabase connection status on startup
- [x] T016 [US1] Verify backend/src/app/services/todo_service.py works unchanged with Supabase (no modifications needed)
- [x] T017 [US1] Verify backend/src/app/api/routes/todos.py works unchanged with Supabase (no modifications needed)
- [ ] T018 [US1] Test all todo CRUD operations manually against Supabase to verify functionality (REQUIRES: Supabase connection configured in backend/.env)

**Checkpoint**: At this point, User Story 1 should be fully functional - application connects to Supabase and all todo operations work correctly. The application can operate independently with Supabase as the database backend.

---

## Phase 4: User Story 2 - Existing local PostgreSQL data migrated to Supabase (Priority: P2)

**Goal**: Create and execute a migration script that transfers all existing todo data from local PostgreSQL to Supabase with data integrity validation.

**Independent Test**: Capture a snapshot of todos in local PostgreSQL, run the migration script, verify that Supabase contains the same todos with matching fields (description, completed, priority, due_date, category, timestamps), and verify record counts match.

### Tests for User Story 2

- [x] T019 [P] [US2] Create unit test for migration script data reading logic in backend/tests/unit/test_migration_read.py
- [x] T020 [P] [US2] Create unit test for migration script data writing logic in backend/tests/unit/test_migration_write.py
- [x] T021 [P] [US2] Create integration test for end-to-end migration process in backend/tests/integration/test_migration_supabase.py

### Implementation for User Story 2

- [x] T022 [US2] Create backend/migrate_to_supabase.py script with source (local PostgreSQL) and target (Supabase) connection configuration
- [x] T023 [US2] Implement data reading logic in backend/migrate_to_supabase.py to read all todos from local PostgreSQL
- [x] T024 [US2] Implement data writing logic in backend/migrate_to_supabase.py to write todos to Supabase with field mapping (id, description, completed, priority, due_date, category, created_at, updated_at)
- [x] T025 [US2] Add data validation in backend/migrate_to_supabase.py to compare record counts between source and destination
- [x] T026 [US2] Add field-level validation in backend/migrate_to_supabase.py to verify data integrity (all fields match, timestamps preserved)
- [x] T027 [US2] Add error handling in backend/migrate_to_supabase.py for connection failures, partial migrations, and data mismatches
- [x] T028 [US2] Add progress logging in backend/migrate_to_supabase.py to show migration status and record counts
- [x] T029 [US2] Add rollback guidance in backend/migrate_to_supabase.py error messages for recovery from failed migrations
- [ ] T030 [US2] Test migration script with sample data from local PostgreSQL to Supabase (REQUIRES: Local PostgreSQL and Supabase databases configured)
- [ ] T031 [US2] Verify migrated data in Supabase matches source data exactly (manual verification - REQUIRES: Migration execution)

**Checkpoint**: At this point, User Story 2 should be complete - migration script successfully transfers all data from local PostgreSQL to Supabase with validation. Data integrity is verified and migration can be executed during maintenance window.

---

## Phase 5: User Story 3 - Simple configuration for Supabase connection (Priority: P3)

**Goal**: Provide clear documentation and configuration examples for setting up Supabase connection in different environments (dev, staging, production).

**Independent Test**: Follow documented configuration steps to set up Supabase connection via environment variables, start the application, and verify it connects successfully to Supabase on first attempt. Test with different environment configurations.

### Tests for User Story 3

- [x] T032 [P] [US3] Create test for configuration validation in backend/tests/unit/test_config_supabase.py
- [x] T033 [P] [US3] Create test for environment-specific configuration loading in backend/tests/unit/test_config_environments.py

### Implementation for User Story 3

- [x] T034 [US3] Update backend/src/app/config.py to validate Supabase connection string format and provide clear error messages for misconfiguration
- [x] T035 [US3] Add configuration examples in specs/002-supabase-migration/quickstart.md for different environments (dev, staging, production)
- [x] T036 [US3] Update backend/.env.example (if exists) or create backend/.env.template with Supabase configuration examples
- [x] T037 [US3] Add connection verification endpoint or health check in backend/src/app/main.py to verify Supabase connectivity
- [x] T038 [US3] Update documentation in specs/002-supabase-migration/quickstart.md with troubleshooting section for common configuration errors
- [ ] T039 [US3] Test configuration setup in different scenarios (valid credentials, invalid credentials, missing variables) (REQUIRES: Manual testing with different configurations)

**Checkpoint**: At this point, User Story 3 should be complete - developers and operators can easily configure Supabase connection for any environment using documented steps. Configuration errors are clearly communicated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T040 [P] Update backend/README.md with Supabase setup instructions and migration guide
- [x] T041 [P] Update docs/START-BACKEND.md with Supabase configuration steps
- [x] T042 [P] Add connection performance monitoring in backend/src/app/database.py to log connection time (target: < 5 seconds)
- [x] T043 [P] Add query performance logging in backend/src/app/services/todo_service.py for Supabase query timing
- [x] T044 [P] Update backend/migrate_schema.py to work with Supabase (if needed for future schema changes) - No changes needed, already compatible
- [ ] T045 Run quickstart.md validation - follow all steps and verify they work correctly (REQUIRES: Manual validation)
- [x] T046 [P] Code cleanup and refactoring - remove any local PostgreSQL-specific code that's no longer needed - No cleanup needed, code is database-agnostic
- [x] T047 [P] Add deployment notes for Render cloud in docs/DEPLOYMENT.md with Supabase configuration
- [ ] T048 Verify all existing tests pass with Supabase backend (REQUIRES: Supabase connection configured for integration tests)
- [ ] T049 [P] Performance testing - verify connection time < 5 seconds and API p95 latency < 200ms with Supabase (REQUIRES: Manual performance testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start immediately after Foundational
  - User Story 2 (P2) can start after Foundational but should wait for US1 validation
  - User Story 3 (P3) can start after Foundational, can run in parallel with US1/US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. This is the MVP.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Should wait for US1 to be validated to ensure Supabase connection works before migrating data
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Can run in parallel with US1/US2 but benefits from US1 completion for testing

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Configuration updates before connection logic
- Connection logic before data operations
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - User Story 1 can start immediately
  - User Story 3 can start in parallel with User Story 1 (different files)
  - User Story 2 should wait for US1 validation
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after foundational)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create integration test for Supabase connection in backend/tests/integration/test_supabase_connection.py"
Task: "Create integration test for todo CRUD operations against Supabase in backend/tests/integration/test_todos_supabase.py"
Task: "Create unit test for Supabase connection error handling in backend/tests/unit/test_database_supabase.py"

# Launch configuration updates together (after tests):
Task: "Update backend/src/app/config.py to read SUPABASE_URL and SUPABASE_KEY from environment variables"
Task: "Update backend/src/app/database.py to support Supabase connection strings"
Task: "Update backend/init_db.py to create todos table in Supabase"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Create unit test for migration script data reading logic in backend/tests/unit/test_migration_read.py"
Task: "Create unit test for migration script data writing logic in backend/tests/unit/test_migration_write.py"
Task: "Create integration test for end-to-end migration process in backend/tests/integration/test_migration_supabase.py"

# Launch migration script components together (after tests):
Task: "Implement data reading logic in backend/migrate_to_supabase.py"
Task: "Implement data writing logic in backend/migrate_to_supabase.py"
Task: "Add data validation in backend/migrate_to_supabase.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Configure Supabase connection
   - Create todos table
   - Test all CRUD operations
   - Verify data persists in Supabase
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Execute migration → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP - highest priority)
   - Developer B: User Story 3 (configuration - can run in parallel)
   - Developer C: Wait for US1 validation, then start User Story 2 (migration)
3. Stories complete and integrate independently

### Migration Execution Strategy

**Before Migration (User Story 2)**:
1. Complete User Story 1 and validate Supabase connection works
2. Schedule maintenance window (15-30 minutes)
3. Notify stakeholders of downtime
4. Backup local PostgreSQL database
5. Stop application or put in read-only mode

**During Migration**:
1. Run `backend/migrate_to_supabase.py` script
2. Monitor progress and validation
3. Verify data integrity checks pass
4. Update `backend/.env` with Supabase connection string
5. Test application startup with Supabase

**After Migration**:
1. Verify all todo operations work correctly
2. Keep local PostgreSQL as backup (don't delete immediately)
3. Monitor application for 7 days per success criteria
4. Document any issues and resolutions

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CRITICAL**: Do NOT modify existing Supabase tables (patients, migration_checkpoints, alembic_version)
- **CRITICAL**: Use `todos` as table name (not `todo-list`) to match existing model
- Migration script must validate data integrity before considering migration complete
- Keep local PostgreSQL database intact until migration is fully verified
- Connection string must include `?sslmode=require` for Supabase SSL connections

---

## Task Summary

- **Total Tasks**: 49
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (User Story 1 - P1)**: 11 tasks (3 tests + 8 implementation)
- **Phase 4 (User Story 2 - P2)**: 13 tasks (3 tests + 10 implementation)
- **Phase 5 (User Story 3 - P3)**: 8 tasks (2 tests + 6 implementation)
- **Phase 6 (Polish)**: 10 tasks

**Parallel Opportunities**: 
- Setup phase: 3 parallel tasks
- Foundational phase: 2 parallel tasks
- User Story 1: 3 parallel test tasks, then parallel implementation tasks
- User Story 2: 3 parallel test tasks, then parallel implementation tasks
- User Story 3: 2 parallel test tasks, then parallel implementation tasks
- Polish phase: 8 parallel tasks

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 18 tasks total

**Independent Test Criteria**:
- **User Story 1**: Configure Supabase, start app, verify all CRUD operations work, verify data persists after restart
- **User Story 2**: Run migration script, verify record counts match, verify all fields match, verify data integrity
- **User Story 3**: Follow configuration docs, set up Supabase connection, verify app starts and connects successfully

