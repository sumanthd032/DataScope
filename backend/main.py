import uvicorn
import shutil
import os
import sqlite3  
import uuid  
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
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

db_sessions = {}

def parse_schema(db_path: str):
    """Connects to the SQLite DB and extracts its schema."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        schema = {}
        
        for (table_name,) in tables:
            if table_name.startswith("sqlite_"):
                continue
                
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            schema[table_name] = [
                {
                    "name": col[1],
                    "type": col[2],
                    "notnull": bool(col[3]),
                    "pk": bool(col[5]),
                }
                for col in columns
            ]
            
        conn.close()
        return schema
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse database file: {e}")


@app.get("/api/ping")
def read_root():
    return {"message": "Hello from Datascope Backend!"}


@app.post("/api/upload-db")
async def upload_database_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a .sqlite or .db file.
    It saves the file, parses its schema, and returns the schema
    along with a session ID.
    """
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension not in [".sqlite", ".db"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .sqlite or .db file.")

    session_id = str(uuid.uuid4())
    safe_filename = f"{session_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        schema = parse_schema(file_path)
        
        db_sessions[session_id] = file_path
        
        return {
            "message": f"File '{file.filename}' processed successfully.",
            "schema": schema,
            "session_id": session_id
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        file.file.close()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)