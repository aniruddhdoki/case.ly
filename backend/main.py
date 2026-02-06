from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from database import get_db, engine, Base
from models import Session, Case, User, Turn
from agent_placeholder import PlaceholderAgent
from schemas import SessionCreate, SessionResponse, CaseResponse
import json
import uuid
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Case.ly Platform API")

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = PlaceholderAgent()

@app.websocket("/ws/interview/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str):
    db = None
    session_uuid = None
    try:
        await websocket.accept()
        print(f"[WS] Client connected: {session_id}")
        
        db = next(get_db())
        
        # Validate session_id format
        try:
            session_uuid = uuid.UUID(session_id)
        except ValueError as e:
            print(f"[WS] Invalid session ID format: {session_id}, error: {e}")
            await websocket.send_json({"type": "error", "error": "Invalid session ID format"})
            await websocket.close(code=1008)
            if db:
                db.close()
            return
        
        # Load session and case
        session = db.query(Session).filter(Session.id == session_uuid).first()
        if not session:
            print(f"[WS] Session not found: {session_id}")
            await websocket.send_json({"type": "error", "error": "Session not found"})
            await websocket.close(code=1008)
            if db:
                db.close()
            return
        
        case = db.query(Case).filter(Case.id == session.case_id).first()
        if not case:
            print(f"[WS] Case not found for session: {session_id}")
            await websocket.send_json({"type": "error", "error": "Case not found"})
            await websocket.close(code=1008)
            if db:
                db.close()
            return
        
        # Check if new or resume
        turn_count = db.query(Turn).filter(Turn.session_id == session_uuid).count()
        
        if turn_count == 0:
            # New session - send initial prompt
            initial_message = f"Hello! Let's begin your case interview.\n\n{case.content.get('problem_statement', 'Case problem statement')}\n\nTake a moment to think, and when you're ready, let me know if you have any clarifying questions."
            
            await websocket.send_json({
                "type": "agent_message",
                "text": initial_message
            })
        else:
            # Resume - send welcome back message
            await websocket.send_json({
                "type": "agent_message",
                "text": "Welcome back! Let's continue where we left off."
            })
        
        # Main loop
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'user_message':
                user_text = data['text']
                print(f"[WS] Received: {user_text[:50]}...")
                
                # Get conversation history
                turns = db.query(Turn).filter(Turn.session_id == session_uuid).order_by(Turn.turn_index).all()
                history = [{"role": t.role, "content": t.content} for t in turns]
                
                # Call placeholder agent
                context = {
                    "session_id": session_id,
                    "case": case.content,
                    "history": history
                }
                response = agent.process_turn(user_text, context)
                
                # Save turns
                next_index = len(turns)
                db.add(Turn(session_id=session_uuid, turn_index=next_index, role='user', content=user_text))
                db.add(Turn(session_id=session_uuid, turn_index=next_index+1, role='assistant', content=response['text']))
                session.last_activity_at = func.now()
                session.status = 'active'
                db.commit()
                
                # Send response
                await websocket.send_json({
                    "type": "agent_message",
                    "text": response["text"]
                })
            
            elif data.get('type') == 'end_session':
                session.status = 'ended'
                session.ended_at = func.now()
                db.commit()
                await websocket.send_json({
                    "type": "session_ended",
                    "message": "Interview ended successfully"
                })
                break
    
    except WebSocketDisconnect:
        print(f"[WS] Disconnected: {session_id}")
        try:
            if db and session_uuid:
                session = db.query(Session).filter(Session.id == session_uuid).first()
                if session and session.status == 'active':
                    session.status = 'paused'
                    db.commit()
        except Exception as e:
            print(f"[WS] Error updating session status: {e}")
    except Exception as e:
        print(f"[WS] Error: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.send_json({"type": "error", "error": str(e)})
        except:
            pass
    finally:
        try:
            if db:
                db.close()
        except Exception as e:
            print(f"[WS] Error closing DB: {e}")

@app.post("/sessions/start", response_model=SessionResponse)
async def start_session(session_data: SessionCreate, db: DBSession = Depends(get_db)):
    try:
        # Ensure user exists (create if not)
        user_id = uuid.UUID(session_data.user_id)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            # Create user with default email if doesn't exist
            user = User(id=user_id, email=f"user_{user_id}@example.com", name="Test User")
            db.add(user)
            db.commit()
        
        # Verify case exists
        case = db.query(Case).filter(Case.id == uuid.UUID(session_data.case_id)).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        session_id = uuid.uuid4()
        session = Session(
            id=session_id,
            user_id=user_id,
            case_id=uuid.UUID(session_data.case_id),
            status='active'
        )
        db.add(session)
        db.commit()
        return {"session_id": str(session_id), "status": "active"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/cases", response_model=list[CaseResponse])
async def list_cases(db: DBSession = Depends(get_db)):
    cases = db.query(Case).all()
    return [{"id": str(c.id), "title": c.title, "difficulty": c.difficulty, "case_type": c.case_type} for c in cases]

@app.get("/sessions/{session_id}")
async def get_session(session_id: str, db: DBSession = Depends(get_db)):
    try:
        session = db.query(Session).filter(Session.id == uuid.UUID(session_id)).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        turns = db.query(Turn).filter(Turn.session_id == uuid.UUID(session_id)).order_by(Turn.turn_index).all()
        case = db.query(Case).filter(Case.id == session.case_id).first()
        
        return {
            "session_id": str(session.id),
            "status": session.status,
            "case": {"id": str(case.id), "title": case.title} if case else None,
            "turns": [{"role": t.role, "content": t.content, "timestamp": str(t.timestamp)} for t in turns]
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

@app.get("/")
async def root():
    return {"status": "online", "service": "Case.ly Platform API"}
