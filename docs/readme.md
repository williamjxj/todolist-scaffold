## backend (cors)

```bash
$ fastapi dev main.py
$ uvicorn --reload --host 0.0.0.0 --port 8000 src.main:app

# production
$ uvicorn --host 0.0.0.0 --port 8000 src.main:app --workers 4 --log-level info
```

```psql

psql -U postgres
\c todo_app
```

## frontend

```
We have this todo app UI. Help me generate a self-playing loop animation for a landing page showcase.

The scenario:
1. User types a new todo and adds it
2. User completes an existing todo
3. User deletes a todo (it should disappear)

Technical Requirements (Crucial):
- Use Framer Motion for all animations.
- Simulate a Mouse Cursor: Add a fake cursor that clicks the buttons.
- Dynamic Positioning: Do NOT use hardcoded coordinates or percentages for cursor movement. Since the layout is responsive/centered, you must use Refs (useRef) to get the bounding box of the actual UI elements (buttons, inputs) and animate the cursor to those specific x/y coordinates.

Looping: The state should reset at the end so it loops perfectly.

```