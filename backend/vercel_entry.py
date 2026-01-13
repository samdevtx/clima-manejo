import os
import sys

# Add the current directory to sys.path to allow absolute imports from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app as fastapi_app

# Vercel ASGI Wrapper
# This function intercepts the request before it reaches FastAPI.
# It strips the '/api' prefix so routes match correctly (e.g. /api/cities -> /cities)
# and sets root_path so documentation works correctly.
async def app(scope, receive, send):
    if scope["type"] == "http":
        if scope["path"].startswith("/api"):
            scope["path"] = scope["path"][4:]  # Remove '/api'
            scope["root_path"] = "/api"        # Tell FastAPI we are mounted at /api
            
    await fastapi_app(scope, receive, send)
