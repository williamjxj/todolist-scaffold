# Tasks: Switch persistent database from SQLite to PostgreSQL 17

**Input**: Design documents from `/specs/001-switch-db-postgresql/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Back-end tests are recommended for this feature to ensure behavior is identical when switching from SQLite to PostgreSQL.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing tooling and add basic configuration scaffolding for DB switching.

- [ ] T001 Confirm Python and JS tooling work by running backend and frontend test suites in `backend/` and `frontend/` (currently failing in this environment due to Python import path and vitest CLI options; kept as a manual check for the developer)
- [ ] T002 [P] Verify existing FastAPI app and todo endpoints in `backend/src/app/main.py` and `backend/src/app/api/routes/todos.py` still pass tests using SQLite
- [ ] T003 [P] Review current database configuration and engine setup in `backend/src/app/database.py` and `backend/src/app/config.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration and environment handling that MUST be complete before any user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Introduce `DB_BACKEND` and `DATABASE_URL` configuration handling in `backend/src/app/config.py`
- [ ] T005 [P] Refactor `backend/src/app/database.py` to derive the SQLAlchemy engine from `DATABASE_URL` and support both SQLite and PostgreSQL URLs
- [ ] T006 [P] Ensure SQLAlchemy session creation in `backend/src/app/database.py` is backend-agnostic (no SQLite-specific options)
- [ ] T007 Add or update backend configuration documentation in `docs/implementation_summary.md` to mention DB_BACKEND and DATABASE_URL for local dev

**Checkpoint**: Foundation ready – application can be configured to use different DB backends without further code changes.

---

## Phase 3: User Story 1 - Reliable local PostgreSQL-backed data storage (Priority: P1) 🎯 MVP

**Goal**: Application uses PostgreSQL 17 as the primary persistent store for todos in local development while keeping API behavior unchanged.

**Independent Test**: Configure the app to use PostgreSQL 17 on the local MacBook Pro and verify todo CRUD behavior matches the SQLite-backed version.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add or update backend integration test to run todo CRUD operations against PostgreSQL in `backend/tests/test_todos.py`
- [ ] T009 [P] [US1] Add a simple smoke test or helper to verify the app is connected to PostgreSQL (e.g., checking database URL or a trivial query) in `backend/tests/test_services.py`

### Implementation for User Story 1

- [ ] T010 [P] [US1] Update SQLAlchemy engine configuration in `backend/src/app/database.py` to correctly construct a PostgreSQL engine (e.g., using `postgresql+psycopg` URL)
- [ ] T011 [P] [US1] Ensure `backend/src/app/models.py` uses PostgreSQL-compatible column types and defaults for the `Todo` model
- [ ] T012 [US1] Verify that `backend/src/app/services/todo_service.py` and `backend/src/app/api/routes/todos.py` work unchanged when using PostgreSQL and adjust any SQLite-specific assumptions
- [ ] T013 [US1] Run and fix `backend/tests` so that todo tests pass with PostgreSQL configured via env vars

**Checkpoint**: User Story 1 fully functional – app can run locally with PostgreSQL 17, and todo CRUD is verified by tests.

---

## Phase 4: User Story 2 - Seamless migration from existing SQLite data (Priority: P2)

**Goal**: Provide a straightforward way to migrate existing todo data from SQLite to PostgreSQL for local development.

**Independent Test**: Given a known set of todos in SQLite, run the migration process and confirm the same todos exist with equivalent fields in PostgreSQL.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add a migration verification test that compares row counts and sample field values between SQLite and PostgreSQL in `backend/tests/test_services.py`

### Implementation for User Story 2

- [ ] T015 [P] [US2] Implement a one-time migration script or function in `backend/init_db.py` to copy todos from the SQLite file to the PostgreSQL database
- [ ] T016 [US2] Ensure the migration process preserves `id`, `title`, `description`, `completed`, `created_at`, and `updated_at` fields as defined in `backend/src/app/models.py`
- [ ] T017 [US2] Add basic logging or console output in the migration process in `backend/init_db.py` to show counts and success/failure status
- [ ] T018 [US2] Document the migration steps, including the short maintenance window recommendation, in `specs/001-switch-db-postgresql/quickstart.md`

**Checkpoint**: User Story 2 complete – developers can migrate any existing local SQLite todos to PostgreSQL and validate successful migration.

---

## Phase 5: User Story 3 - Simple local environment configuration for the new database (Priority: P3)

**Goal**: Make it easy for developers to configure and run the app locally against PostgreSQL without code changes.

**Independent Test**: A new developer can follow documentation to configure and run the app with PostgreSQL in under 30 minutes.

### Tests for User Story 3

- [ ] T019 [P] [US3] Add a minimal documentation validation checklist to `specs/001-switch-db-postgresql/quickstart.md` (steps that must work end-to-end)

### Implementation for User Story 3

- [ ] T020 [P] [US3] Ensure environment variable handling for `DB_BACKEND` and `DATABASE_URL` in `backend/src/app/config.py` is clearly documented and has sensible defaults
- [ ] T021 [US3] Update `docs/START-BACKEND.md` and `docs/implementation_summary.md` with step-by-step instructions for switching between SQLite and PostgreSQL locally
- [ ] T022 [US3] Verify that the existing `backend/run.sh` and repo-level `restart-services.sh` scripts work correctly when using PostgreSQL, updating them if needed

**Checkpoint**: User Story 3 complete – configuration and documentation make PostgreSQL usage straightforward for any developer.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality.

- [ ] T023 [P] Run through `specs/001-switch-db-postgresql/quickstart.md` from scratch and refine wording or fix any gaps
- [ ] T024 Address any minor refactors or cleanup in `backend/src/app/database.py`, `backend/src/app/config.py`, and `backend/init_db.py`
- [ ] T025 [P] Add any additional small tests in `backend/tests/` to cover edge cases (e.g., misconfigured DATABASE_URL, unavailable PostgreSQL instance)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) – No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) – Depends functionally on basic Postgres support from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) – Can be done in parallel with US2 once US1 behaviors are stable

### Within Each User Story

- Tests should be written or updated before major implementation where feasible
- Core configuration before migration and documentation
- Migration implementation before verification tests

### Parallel Opportunities

- All tasks marked [P] can be run in parallel with other non-dependent tasks
- User Story 2 (migration) and User Story 3 (documentation & configuration) can largely proceed in parallel once foundational work and User Story 1 basics are in place

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL – blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using PostgreSQL-backed tests
5. Use this as the local dev baseline

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Use as MVP
3. Add User Story 2 → Test independently (migration) → Adopt for any existing SQLite data
4. Add User Story 3 → Test independently (docs and configuration) → Onboard new developers more easily

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (engine and CRUD verification)
   - Developer B: User Story 2 (migration tooling and tests)
   - Developer C: User Story 3 (configuration and docs)
3. Stories complete and integrate independently while keeping behavior consistent.
