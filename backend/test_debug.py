import sys
with open("debug_test.txt", "w") as f:
    f.write(f"Python version: {sys.version}\n")
    try:
        import uvicorn
        import fastapi
        f.write("Uvicorn and FastAPI imported successfully\n")
    except ImportError as e:
        f.write(f"ImportError: {e}\n")
