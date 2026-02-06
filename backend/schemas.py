from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    user_id: str
    case_id: str

class SessionResponse(BaseModel):
    session_id: str
    status: str

class CaseResponse(BaseModel):
    id: str
    title: str
    difficulty: Optional[str]
    case_type: Optional[str]
