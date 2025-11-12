import uvicorn
import shutil
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/api/ping")
def read_root():
    """
    A simple ping endpoint to check if the server is running.
    """
    return {"message": "Hello from Datascope Backend!"}


@app.post("/api/upload-db")
async def upload_database_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a .sqlite file.
    It saves the file temporarily to the server.
    """

    if not file.filename.endswith(".sqlite"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .sqlite file.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": f"File '{file.filename}' uploaded successfully.",
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while saving the file: {str(e)}")
    finally:
        file.file.close()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)