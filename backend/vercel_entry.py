import os
import sys

# Add the current directory to sys.path to allow absolute imports from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# This is the entry point for Vercel's Python Runtime
# It looks for a variable named 'app' in the file specified in vercel.json
