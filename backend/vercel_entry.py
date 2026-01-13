import os
import sys

# Add the current directory to sys.path to allow absolute imports from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# Set root_path for Vercel
# The requests come in as /api/endpoint (routed by vercel.json)
# This ensures FastAPI strips this prefix and matches the correct route
app.root_path = "/api"
