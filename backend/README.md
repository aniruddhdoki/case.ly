# Case.ly Backend

FastAPI backend for the Case.ly interview platform.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Setup PostgreSQL:
   - Mac: `brew install postgresql && brew services start postgresql`
   - Linux: `sudo apt install postgresql`
   - Create database: `createdb casely`

4. Create `.env` file (copy from `.env.example`):
```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/casely
CORS_ORIGINS=http://localhost:5173
DEBUG=true
```

5. Initialize database:
```bash
python init_db.py
```

6. Start server:
```bash
uvicorn main:app --reload
```

Server will run on `http://localhost:8000`
