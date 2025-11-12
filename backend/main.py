import uvicorn
import shutil
import os
import sqlite3
import uuid
import pandas as pd  
from fastapi import FastAPI, UploadFile, File, HTTPException, Query 
from fastapi.middleware.cors import CORSMiddleware

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
db_sessions = {}

def parse_schema(db_path: str):
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
                {"name": col[1], "type": col[2], "notnull": bool(col[3]), "pk": bool(col[5])}
                for col in columns
            ]
        conn.close()
        return schema
    except sqlite3.Error as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse database file: {e}")

@app.get("/api/ping")
def read_root():
    return {"message": "Hello from Datascope Backend!"}

@app.post("/api/upload-db")
async def upload_database_file(file: UploadFile = File(...)):
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

@app.get("/api/table-data")
async def get_table_data(
    session_id: str = Query(...),
    table_name: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Fetches paginated data from a specific table.
    """
    if session_id not in db_sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload the file again.")
    
    db_path = db_sessions[session_id]
    
    try:
        conn = sqlite3.connect(db_path)
        
        count_cursor = conn.cursor()
        count_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total_rows = count_cursor.fetchone()[0]
        
        offset = (page - 1) * page_size
        
        query = f"SELECT * FROM {table_name} LIMIT {page_size} OFFSET {offset}"
        
        df = pd.read_sql_query(query, conn)
        
        df = df.where(pd.notnull(df), None)
        
        columns = df.columns.tolist()
        
        data = df.to_dict('records')
        
        conn.close()
        
        return {
            "table_name": table_name,
            "columns": columns,
            "data": data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_rows": total_rows,
                "total_pages": (total_rows + page_size - 1) // page_size
            }
        }
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)