import uvicorn
import shutil
import os
import sqlite3
import uuid
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import numpy as np
import json

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    print("Warning: GOOGLE_API_KEY not found in .env file. AI features will be disabled.")
    genai_configured = False
else:
    genai.configure(api_key=API_KEY)
    genai_configured = True

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

class QueryRequest(BaseModel):
    session_id: str
    query: str

class AIQueryRequest(BaseModel):
    prompt: str
    schema_str: str

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

db_sessions = {}

def clean_value(val):
    """Helper to convert numpy types to standard Python types for JSON."""
    if pd.isna(val) or np.isnan(val):
        return None
    if isinstance(val, (np.int64, np.int32, np.int16)):
        return int(val)
    if isinstance(val, (np.float64, np.float32)):
        return float(val)
    if isinstance(val, (np.bool_)):
        return bool(val)
    return val

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

def get_gemini_prompt(schema_str: str, user_prompt: str) -> str:
    return f"""
You are an expert SQLite database engineer. Your task is to write a single, valid SQLite query based on a user's request and a given database schema.

**Database Schema:**
```sql
{schema_str}
```

**User Request:**
"{user_prompt}"

**Instructions:**
1.  Only output a single, valid SQLite query.
2.  Do NOT include any explanations, comments, or markdown formatting (like ```sql).
3.  Analyze the user's request and the schema to formulate the correct query.
4.  If the request is ambiguous or cannot be answered by the schema, you should still attempt to write the most logical query.

**Query:**
"""

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

@app.post("/api/run-query")
async def run_query(request: QueryRequest):
    """
    Executes a user-provided SQL query.
    Handles data-returning queries (SELECT) and
    action queries (INSERT, UPDATE, DELETE) differently.
    """
    session_id = request.session_id
    query = request.query.strip()
    query_lower = query.lower()
    
    if session_id not in db_sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload the file again.")
    
    db_path = db_sessions[session_id]
    
    conn = None # Initialize connection variable
    try:
        conn = sqlite3.connect(db_path)
        
        # Check if this is a query that returns data
        if query_lower.startswith("select") or query_lower.startswith("with") or query_lower.startswith("pragma"):
            
            df = pd.read_sql_query(query, conn)
            df = df.where(pd.notnull(df), None)
            
            columns = df.columns.tolist()
            data = df.to_dict('records')
            total_rows = len(data)
            
            return {
                "table_name": "Query Result",
                "columns": columns,
                "data": data,
                "pagination": {
                    "page": 1,
                    "page_size": total_rows,
                    "total_rows": total_rows,
                    "total_pages": 1
                }
            }
        
        else:
            cursor = conn.cursor()
            cursor.execute(query)
            conn.commit()
            
            rows_affected = cursor.rowcount

            return {
                "table_name": "Action Result",
                "columns": ["message"],
                "data": [{"message": f"Query executed successfully. {rows_affected} rows affected."}],
                "pagination": {
                    "page": 1,
                    "page_size": 1,
                    "total_rows": 1,
                    "total_pages": 1
                }
            }
            
    except sqlite3.Error as e:
        if conn:
            conn.rollback() 
        raise HTTPException(status_code=400, detail=f"Query Error: {e}")
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        if conn:
            conn.close() 

@app.post("/api/generate-sql")
async def generate_sql(request: AIQueryRequest):
    if not genai_configured:
        raise HTTPException(status_code=503, detail="AI service is not configured. Missing GOOGLE_API_KEY.")

    try:
        full_prompt = get_gemini_prompt(request.schema_str, request.prompt)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(full_prompt)
        
        sql_query = response.text.strip().replace("```sql", "").replace("```", "").strip()
        
        return {
            "sql_query": sql_query,
            "prompt": request.prompt
        }
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI service: {str(e)}")
    
@app.get("/api/table-insights")
async def get_table_insights(
    session_id: str = Query(...),
    table_name: str = Query(...)
):
    """
    Analyzes a table and returns key statistics and insights.
    """
    if session_id not in db_sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload the file again.")
    
    db_path = db_sessions[session_id]
    
    try:
        conn = sqlite3.connect(db_path)
        # Load the *entire* table into a pandas DataFrame
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        conn.close()
        
        if df.empty:
            return {
                "table_name": table_name,
                "total_rows": 0,
                "total_cols": 0,
                "column_stats": []
            }

        total_rows = int(df.shape[0])
        total_cols = int(df.shape[1])
        
        column_stats = []
        
        for col in df.columns:
            col_type = str(df[col].dtype)
            
            # Basic stats
            missing_count = int(df[col].isnull().sum())
            missing_percent = (missing_count / total_rows) * 100
            unique_count = int(df[col].nunique())
            unique_percent = (unique_count / total_rows) * 100
            
            stat = {
                "name": col,
                "type": col_type,
                "missing_count": missing_count,
                "missing_percent": round(missing_percent, 2),
                "unique_count": unique_count,
                "unique_percent": round(unique_percent, 2)
            }
            
            # Numeric stats
            if pd.api.types.is_numeric_dtype(df[col]):
                stat["numeric_stats"] = {
                    "mean": clean_value(df[col].mean()),
                    "median": clean_value(df[col].median()),
                    "std_dev": clean_value(df[col].std()),
                    "min": clean_value(df[col].min()),
                    "max": clean_value(df[col].max())
                }
            
            # Categorical stats (for strings or low-cardinality numbers)
            if pd.api.types.is_string_dtype(df[col]) or unique_count < 50:
                # Get top 10 most frequent items
                top_values = df[col].value_counts().nlargest(10).to_dict()
                stat["categorical_stats"] = {
                    "top_values": {str(k): int(v) for k, v in top_values.items()}
                }
                
            column_stats.append(stat)
            
        return {
            "table_name": table_name,
            "total_rows": total_rows,
            "total_cols": total_cols,
            "column_stats": column_stats
        }

    except sqlite3.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)