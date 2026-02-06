from sqlalchemy import Column, String, Integer, TIMESTAMP, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Case(Base):
    __tablename__ = "cases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(JSONB, nullable=False)  # Full case as flexible document
    difficulty = Column(String(20))
    case_type = Column(String(50))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Session(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    case_id = Column(UUID(as_uuid=True), ForeignKey('cases.id'))
    status = Column(String(20), default='active')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    last_activity_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    ended_at = Column(TIMESTAMP(timezone=True))

class Turn(Base):
    __tablename__ = "turns"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id'))
    turn_index = Column(Integer, nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
