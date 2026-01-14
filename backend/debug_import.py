import sys
import traceback

with open("startup_error.log", "w") as log:
    try:
        log.write("Attempting to import main...\n")
        import main
        log.write("Import successful.\n")
    except Exception:
        log.write("Exception during import:\n")
        traceback.print_exc(file=log)
