# Case.ly Platform - Phase 1

A production-quality interview platform infrastructure with voice I/O, WebSocket communication, and session management. This is Phase 1 focusing on platform infrastructure with a placeholder agent.

## 🎯 What's Built (Phase 1)

✅ **Full Platform Infrastructure**
- WebSocket real-time communication
- Voice I/O with browser Speech Recognition API
- Session management (start, pause, resume, end)
- PostgreSQL database with SQLAlchemy ORM
- Turn-taking system with silence detection

✅ **Interview UI**
- Voice input with visual indicators
- Real-time transcript display
- Basic avatar placeholder
- Connection status monitoring

✅ **Placeholder Agent**
- Simple keyword-based responses
- No LLM integration yet (Phase 2)

## 🚫 What's NOT Built Yet (Phase 2)

❌ Complex multi-model routing  
❌ AWS Bedrock integration  
❌ Polly TTS with visemes  
❌ 3D avatar with lip-sync  
❌ Framework grading  
❌ Exhibit handling  

## 🏗️ Architecture

```
Frontend (React + TypeScript) 
    ↕ WebSocket
Backend (FastAPI)
    ↕ SQLAlchemy
PostgreSQL Database
```

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** (local or remote)
- **Chrome or Edge browser** (for Speech Recognition API)

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Setup PostgreSQL:**
   - **Mac:** 
     ```bash
     brew install postgresql
     brew services start postgresql
     createdb casely
     ```
   - **Linux:** 
     ```bash
     sudo apt install postgresql
     sudo systemctl start postgresql
     createdb casely
     ```
   - **Verify PostgreSQL is running:** `pg_isready` (should return "accepting connections")
   - **If database creation fails:** Make sure PostgreSQL is running first!

5. **Create `.env` file:**
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/casely
CORS_ORIGINS=http://localhost:5173
DEBUG=true
EOF
```

Replace `YOUR_USERNAME` with your PostgreSQL username. If you have a password, use:
```
DATABASE_URL=postgresql://username:password@localhost:5432/casely
```

6. **Initialize database:**
```bash
python init_db.py
```

This will:
- Create all database tables
- Create a test user
- Create a sample case

**Note:** Save the User ID and Case ID from the output - you'll need them for testing.

7. **Start backend server:**
```bash
python -m uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local` file:**
```bash
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
EOF
```

4. **Start development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🧪 Testing

1. **Open browser** (Chrome or Edge recommended)
2. **Navigate to** `http://localhost:5173`
3. **Select a case** from the list
4. **Click "Start Interview"**
5. **Grant microphone permission** when prompted
6. **Speak:** "Can I ask some clarifying questions?"
7. **Wait 2 seconds of silence** after speaking
8. **Agent should respond** with a text message
9. **Browser TTS will read** the response aloud
10. **Continue conversation** for multiple turns

## 📁 Project Structure

```
case-ly/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── agent_placeholder.py # Placeholder agent
│   ├── init_db.py           # Database setup
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── CaseList.tsx
│   │   │   ├── InterviewRoom.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   └── AvatarPlaceholder.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔧 Key Features

### Turn-Taking System

- **Browser VAD:** Uses Web Speech API for voice activity detection
- **Silence Detection:** 2-second silence threshold after speech
- **Auto-send:** Transcript automatically sent when turn complete
- **No button needed:** Fully voice-driven interaction

### Session Management

- **Start:** Create new session via REST API
- **Resume:** Load conversation history on reconnect
- **Pause:** Auto-pause on disconnect
- **End:** Explicit end via "End Interview" button

### Voice Input

- **Continuous listening** with interim results
- **Visual indicators:** Red dot when listening, gray when paused
- **Interim transcript** shown while speaking
- **Final transcript** sent after 2 seconds of silence

### Placeholder Agent

Simple keyword-based responses:
- Questions/clarifications → Encourages asking more
- Thinking time → Allows pause
- Framework mentions → Asks for elaboration
- Revenue/cost keywords → Prompts deeper analysis
- Default → Generic follow-up questions

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `createdb casely`

**WebSocket connection fails:**
- Check CORS_ORIGINS in `.env` matches frontend URL
- Verify backend is running on port 8000

### Frontend Issues

**Speech Recognition not working:**
- Use Chrome or Edge (Safari/Firefox don't support it)
- Grant microphone permissions in browser settings
- Check browser console for errors

**WebSocket disconnects:**
- Check backend is running
- Verify VITE_WS_URL in `.env.local`
- Check browser console for connection errors

## 📝 API Endpoints

### REST Endpoints

- `GET /` - Health check
- `GET /cases` - List all cases
- `POST /sessions/start` - Create new session
- `GET /sessions/{id}` - Get session details

### WebSocket

- `ws://localhost:8000/ws/interview/{session_id}` - Interview WebSocket connection

## 🎯 Success Criteria

✅ Backend starts without errors  
✅ Database tables created  
✅ Can create a session via API  
✅ WebSocket connects successfully  
✅ Voice input works (Chrome/Edge only)  
✅ Transcript appears as you speak  
✅ After 2 seconds silence, message sent  
✅ Agent responds with text  
✅ Response appears in transcript  
✅ Browser TTS reads response aloud  
✅ Can conduct 10+ turn conversation  
✅ Can disconnect and resume session  

## 🔮 Phase 2 Preview

Phase 2 will add:
- Real AI agent with AWS Bedrock
- Polly TTS with visemes for lip-sync
- 3D avatar with realistic animations
- Framework grading and analysis
- Exhibit handling and display

## 📄 License

MIT
