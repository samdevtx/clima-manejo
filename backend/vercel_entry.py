import os
import sys

# Add the current directory to sys.path to allow absolute imports from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# Vercel entry point
# We rely on standard routing without forcing root_path here, 
# letting the rewriting logic handle the path matching naturally.
