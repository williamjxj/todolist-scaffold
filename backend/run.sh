#!/bin/bash
# FastAPI development server startup script
# Run with: ./run.sh

cd "$(dirname "$0")/src"
uvicorn app.main:app --reload --port 8173
