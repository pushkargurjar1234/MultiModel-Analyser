#!/bin/bash

# Move into backend folder
cd backend

# Run FastAPI app with uvicorn
uvicorn main:app --host 0.0.0.0 --port $PORT
