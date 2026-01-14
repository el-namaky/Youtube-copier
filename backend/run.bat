@echo off
set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
python -m uvicorn main:app --reload
pause
