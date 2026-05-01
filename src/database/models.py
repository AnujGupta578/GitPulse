from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from .session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ArchitectureState(Base):
    __tablename__ = "architecture_states"
    
    id = Column(Integer, primary_key=True, index=True)
    repo_name = Column(String, index=True)
    commit_sha = Column(String, index=True)
    mermaid_code = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
