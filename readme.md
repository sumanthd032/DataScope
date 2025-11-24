# Datascope

Datascope is a modern, **AI-powered SQLite database visualizer and editor**. It allows you to upload, explore, query, and visualize SQLite databases directly in your browser with a beautiful dark-mode UI.

## Features

### Drag & Drop Upload  
Instantly parse `.sqlite` or `.db` files.

### Schema Explorer  
View tables, columns, types, and primary keys in a responsive sidebar.

### SQL Editor  
Full-featured SQL editor (Monaco) with syntax highlighting and keyboard shortcuts.

### AI-Assisted Querying  
Ask natural language questions (e.g., “Show top 5 users by spend”) and automatically get SQL generated for you via Google Gemini.

### Smart Insights  
Automatic data profiling with missing-value detection, unique counts, and distribution charts.

### ER Diagrams  
Auto-generated Entity-Relationship diagrams using Mermaid.js.

### Query Plan Visualizer  
Visual EXPLAIN QUERY PLAN breakdown to debug performance issues.


## 🛠️ Tech Stack

### Frontend
- React (Vite) + TypeScript  
- TailwindCSS  
- Monaco Editor  
- Recharts  
- Mermaid.js  
- Lucide React  

### Backend
- Python 3.x  
- FastAPI  
- Pandas & NumPy  
- Google Gemini API  
- SQLite3  

# Getting Started

## Prerequisites

- Node.js (v16+)  
- Python (v3.8+)  
- Google Cloud API Key  

# 1. Clone the Repository

```bash
git clone https://github.com/sumanthd032/datascope.git
cd datascope
```

# 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart pandas numpy google-generativeai python-dotenv
```

Create `.env`:

```
GOOGLE_API_KEY="YOUR_ACTUAL_GOOGLE_API_KEY_HERE"
```

Run backend:

```bash
uvicorn main:app --reload
```

# 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

# Usage Guide

- Open http://localhost:5173  
- Upload database  
- Explore schema  
- View insights  
- View ER diagram  
- Run SQL or ask AI  
- Download updated DB  

