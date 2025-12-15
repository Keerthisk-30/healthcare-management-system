#!/usr/bin/env python
"""
Startup script for the FastAPI server.
This script can be run from any directory.
"""
import sys
import os
from pathlib import Path

# Add the parent directory to Python path so we can import backend
backend_dir = Path(__file__).parent
parent_dir = backend_dir.parent
sys.path.insert(0, str(parent_dir))

# Now we can import and run uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)]
    )

