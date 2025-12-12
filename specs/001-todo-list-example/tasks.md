# Tasks: TODO List Application

**Input**: Design documents from `/specs/001-todo-list-example/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are included as optional but recommended for learning. They can be skipped if focusing on rapid prototyping.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both backend and frontend

- [x] T001 Create backend project structure (backend/src/app/, backend/tests/)
- [x] T002 Create frontend project structure (frontend/src/, frontend/tests/)
- [x] T003 [P] Create Python virtual environment in backend/venv using `python -m venv venv`
- [x] T004 [P] Create backend/requirements.txt with FastAPI, SQLAlchemy, Pydantic dependencies
- [x] T005 [P] Create backend/requirements-dev.txt with pytest, black, flake8, mypy dependencies
- [x] T006 [P] Initialize Node.js frontend project with React, TypeScript, Vite in frontend/package.json
- [x] T007 [P] Configure backend linting and formatting (black, flake8, mypy) in backend/
- [x] T008 [P] Configure frontend linting and formatting (ESLint, Prettier) in frontend/
- [x] T009 [P] Setup Tailwind CSS configuration in frontend/tailwind.config.js
- [x] T010 [P] Create backend README.md with virtual environment setup instructions
- [x] T011 [P] Create frontend README.md with setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Setup SQLite database connection in backend/src/app/database.py
- [x] T013 Create database session dependency function in backend/src/app/database.py
- [x] T014 Create database initialization function in backend/src/app/database.py
- [x] T015 [P] Create TodoItem SQLAlchemy model in backend/src/app/models.py
- [x] T016 [P] Create Pydantic schemas (TodoItemCreate, TodoItemUpdate, TodoItemResponse) in backend/src/app/schemas.py
- [x] T017 [P] Create TypeScript types (TodoItem, TodoItemCreate, TodoItemUpdate) in frontend/src/types/todo.ts
- [x] T018 Create FastAPI application instance with CORS middleware in backend/src/app/main.py
- [x] T019 Create API client service (Axios) in frontend/src/services/api.ts
- [x] T020 [P] Create configuration management in backend/src/app/config.py
- [x] T021 [P] Setup error handling infrastructure in backend/src/app/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View TODO Items (Priority: P1) 🎯 MVP

**Goal**: Users can create new TODO items and view them in a list. This is the core functionality that enables users to track tasks.

**Independent Test**: Create a TODO item with a description and verify it appears in the list. The item should persist after page refresh.

### Tests for User Story 1 (OPTIONAL - Recommended for Learning)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] Create backend integration test for POST /api/todos in backend/tests/test_todos.py
- [x] T023 [P] [US1] Create backend integration test for GET /api/todos in backend/tests/test_todos.py
- [x] T024 [P] [US1] Create frontend component test for TodoForm in frontend/tests/components/TodoForm.test.tsx
- [x] T025 [P] [US1] Create frontend component test for TodoList in frontend/tests/components/TodoList.test.tsx

### Implementation for User Story 1

- [x] T026 [US1] Implement TodoService.create() method in backend/src/app/services/todo_service.py
- [x] T027 [US1] Implement TodoService.get_all() method in backend/src/app/services/todo_service.py
- [x] T028 [US1] Implement POST /api/todos endpoint in backend/src/app/api/routes/todos.py
- [x] T029 [US1] Implement GET /api/todos endpoint in backend/src/app/api/routes/todos.py
- [x] T030 [US1] Register todos router in backend/src/app/main.py
- [x] T031 [US1] Create custom React hook useTodos() in frontend/src/hooks/useTodos.ts
- [x] T032 [US1] Create TodoForm component for creating TODOs in frontend/src/components/TodoForm.tsx
- [x] T033 [US1] Create TodoList component for displaying TODOs in frontend/src/components/TodoList.tsx
- [x] T034 [US1] Create TodoItem component for individual TODO display in frontend/src/components/TodoItem.tsx
- [x] T035 [US1] Integrate TodoForm and TodoList in frontend/src/App.tsx
- [x] T036 [US1] Add frontend validation for empty/whitespace description in frontend/src/components/TodoForm.tsx
- [x] T037 [US1] Add frontend validation for 500 character limit in frontend/src/components/TodoForm.tsx
- [x] T038 [US1] Add backend validation for empty/whitespace description in backend/src/app/services/todo_service.py
- [x] T039 [US1] Add backend validation for 500 character limit in backend/src/app/services/todo_service.py
- [x] T040 [US1] Add error handling and user-friendly error messages in frontend/src/components/TodoForm.tsx
- [x] T041 [US1] Add loading states for API calls in frontend/src/hooks/useTodos.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create TODO items and see them in a list.

---

## Phase 4: User Story 2 - Mark TODO Items as Complete (Priority: P2)

**Goal**: Users can mark TODO items as completed when they finish a task, allowing them to track progress and distinguish between pending and completed work.

**Independent Test**: Create a TODO item, mark it as complete, and verify it appears in a completed state with visual distinction.

### Tests for User Story 2 (OPTIONAL - Recommended for Learning)

- [x] T042 [P] [US2] Create backend integration test for PATCH /api/todos/{id}/complete in backend/tests/test_todos.py
- [x] T043 [P] [US2] Create frontend component test for toggle complete functionality in frontend/tests/components/TodoItem.test.tsx

### Implementation for User Story 2

- [x] T044 [US2] Implement TodoService.toggle_complete() method in backend/src/app/services/todo_service.py
- [x] T045 [US2] Implement PATCH /api/todos/{id}/complete endpoint in backend/src/app/api/routes/todos.py
- [x] T046 [US2] Add toggle complete functionality to useTodos hook in frontend/src/hooks/useTodos.ts
- [x] T047 [US2] Add checkbox/button for marking complete in frontend/src/components/TodoItem.tsx
- [x] T048 [US2] Add visual styling for completed items (e.g., crossed out, different color) in frontend/src/components/TodoItem.tsx
- [x] T049 [US2] Update TodoList to visually distinguish completed vs pending items in frontend/src/components/TodoList.tsx
- [x] T050 [US2] Add ability to toggle back to incomplete in frontend/src/components/TodoItem.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create, view, and mark TODOs as complete.

---

## Phase 5: User Story 3 - Edit TODO Item Descriptions (Priority: P2)

**Goal**: Users can modify the description of an existing TODO item when they need to update or correct task details.

**Independent Test**: Create a TODO item, edit its description, and verify the change is saved and displayed. The edited description should persist after page refresh.

### Tests for User Story 3 (OPTIONAL - Recommended for Learning)

- [x] T051 [P] [US3] Create backend integration test for PUT /api/todos/{id} in backend/tests/test_todos.py
- [x] T052 [P] [US3] Create frontend component test for edit functionality in frontend/tests/components/TodoItem.test.tsx

### Implementation for User Story 3

- [x] T053 [US3] Implement TodoService.update() method in backend/src/app/services/todo_service.py
- [x] T054 [US3] Implement PUT /api/todos/{id} endpoint in backend/src/app/api/routes/todos.py
- [x] T055 [US3] Add update functionality to useTodos hook in frontend/src/hooks/useTodos.ts
- [x] T056 [US3] Add edit mode to TodoItem component in frontend/src/components/TodoItem.tsx
- [x] T057 [US3] Add edit button/icon to TodoItem component in frontend/src/components/TodoItem.tsx
- [x] T058 [US3] Add inline editing UI (input field) in frontend/src/components/TodoItem.tsx
- [x] T059 [US3] Add save and cancel buttons for edit mode in frontend/src/components/TodoItem.tsx
- [x] T060 [US3] Add validation for edited description (empty/whitespace, 500 char limit) in frontend/src/components/TodoItem.tsx
- [x] T061 [US3] Add backend validation for updated description in backend/src/app/services/todo_service.py
- [x] T062 [US3] Handle 404 error when editing non-existent TODO in frontend/src/hooks/useTodos.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can create, view, mark complete, and edit TODOs.

---

## Phase 6: User Story 4 - Delete TODO Items (Priority: P3)

**Goal**: Users can remove TODO items that are no longer relevant or were created by mistake.

**Independent Test**: Create a TODO item, delete it, and verify it no longer appears in the list. The item should remain deleted after page refresh.

### Tests for User Story 4 (OPTIONAL - Recommended for Learning)

- [x] T063 [P] [US4] Create backend integration test for DELETE /api/todos/{id} in backend/tests/test_todos.py
- [x] T064 [P] [US4] Create frontend component test for delete functionality in frontend/tests/components/TodoItem.test.tsx

### Implementation for User Story 4

- [x] T065 [US4] Implement TodoService.delete() method in backend/src/app/services/todo_service.py
- [x] T066 [US4] Implement DELETE /api/todos/{id} endpoint in backend/src/app/api/routes/todos.py
- [x] T067 [US4] Add delete functionality to useTodos hook in frontend/src/hooks/useTodos.ts
- [x] T068 [US4] Add delete button/icon to TodoItem component in frontend/src/components/TodoItem.tsx
- [x] T069 [US4] Add confirmation dialog or immediate delete with undo option in frontend/src/components/TodoItem.tsx
- [x] T070 [US4] Add error handling for deleting non-existent TODO in frontend/src/hooks/useTodos.ts
- [x] T071 [US4] Add user-friendly error message and list refresh on delete error in frontend/src/components/TodoItem.tsx

**Checkpoint**: All user stories should now be independently functional. Users can create, view, mark complete, edit, and delete TODOs.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final touches

- [x] T072 [P] Add GET /api/todos/{id} endpoint implementation in backend/src/app/api/routes/todos.py
- [x] T073 [P] Add error handling component (ErrorMessage) in frontend/src/components/ErrorMessage.tsx
- [x] T074 [P] Add loading states and spinners throughout frontend components
- [x] T075 [P] Improve error messages consistency across all operations
- [x] T076 [P] Add accessibility attributes (ARIA labels) to all interactive elements
- [x] T077 [P] Add keyboard navigation support (Enter to submit, Escape to cancel)
- [x] T078 [P] Add responsive design improvements for mobile devices
- [x] T079 [P] Add visual feedback for all user actions (success messages, transitions)
- [x] T080 [P] Update backend README.md with API documentation links
- [x] T081 [P] Update frontend README.md with component documentation
- [x] T082 [P] Run quickstart.md validation and update if needed
- [x] T083 [P] Add service layer unit tests in backend/tests/test_services.py
- [x] T084 [P] Add API client unit tests in frontend/tests/services/api.test.ts
- [x] T085 [P] Code cleanup and refactoring (remove unused imports, dead code)
- [x] T086 [P] Performance optimization (check bundle size, API response times)
- [x] T087 [P] Final integration testing of all user stories together

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for TodoItem component structure
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for TodoItem component structure
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for TodoItem component structure

**Note**: While US2, US3, and US4 depend on US1's TodoItem component, they can still be implemented independently by extending the existing component. Each story adds distinct functionality.

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Service layer before API endpoints
- API endpoints before frontend components
- Core implementation before validation/error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Service and endpoint tasks within a story can run in parallel with frontend tasks (different layers)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: T020 [P] [US1] Create backend integration test for POST /api/todos
Task: T021 [P] [US1] Create backend integration test for GET /api/todos
Task: T022 [P] [US1] Create frontend component test for TodoForm
Task: T023 [P] [US1] Create frontend component test for TodoList

# Launch backend and frontend tasks in parallel (different layers):
Task: T024 [US1] Implement TodoService.create() method (backend)
Task: T025 [US1] Implement TodoService.get_all() method (backend)
Task: T029 [US1] Create custom React hook useTodos() (frontend)
Task: T030 [US1] Create TodoForm component (frontend)
Task: T031 [US1] Create TodoList component (frontend)
Task: T032 [US1] Create TodoItem component (frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: Users can create TODO items and view them in a list. This is a functional, independently testable application.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add Polish phase → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1 - MVP)
   - Developer B: User Story 2 (P2 - can start after US1 structure)
   - Developer C: User Story 3 (P2 - can start after US1 structure)
3. After US1-3 complete:
   - Developer A: User Story 4 (P3)
   - Developer B: Polish phase tasks
4. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 87 tasks
- **Setup Phase**: 11 tasks
- **Foundational Phase**: 10 tasks
- **User Story 1 (P1)**: 20 tasks (4 tests + 16 implementation)
- **User Story 2 (P2)**: 9 tasks (2 tests + 7 implementation)
- **User Story 3 (P2)**: 12 tasks (2 tests + 10 implementation)
- **User Story 4 (P3)**: 9 tasks (2 tests + 7 implementation)
- **Polish Phase**: 16 tasks

### Parallel Opportunities

- **Phase 1**: 9 parallel tasks (T003-T011)
- **Phase 2**: 5 parallel tasks (T013-T015, T018-T019)
- **Phase 3**: 4 parallel test tasks, then backend/frontend can work in parallel
- **Phase 4-6**: Similar parallel opportunities within each story
- **Phase 7**: 16 parallel tasks

### Independent Test Criteria

- **User Story 1**: Create a TODO item and verify it appears in the list
- **User Story 2**: Mark a TODO item as complete and verify visual distinction
- **User Story 3**: Edit a TODO item description and verify it persists
- **User Story 4**: Delete a TODO item and verify it's removed

### Suggested MVP Scope

**MVP = User Story 1 Only** (Phase 1 + Phase 2 + Phase 3)

This delivers:
- ✅ Complete project setup
- ✅ Database and API infrastructure
- ✅ Create TODO items
- ✅ View TODO items
- ✅ Data persistence
- ✅ Basic validation

**Total MVP Tasks**: 41 tasks (11 setup + 10 foundational + 20 US1)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests are included)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to project root (backend/ or frontend/)
- Tests are optional but recommended for learning FastAPI and React patterns
