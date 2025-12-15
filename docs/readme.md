

```bash
$ fastapi dev main.py
$ uvicorn --reload --host 0.0.0.0 --port 8000 src.main:app

# production
$ uvicorn --host 0.0.0.0 --port 8000 src.main:app --workers 4 --log-level info
```