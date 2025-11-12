from fastapi import FastAPI

app = FastAPI()

@app.get("/api/ping")
def read_root():
    """
    A simple ping endpoint to check if the server is running.
    """
    return {"message": "Hello from Datascope Backend!"}