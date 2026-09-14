from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)

    habits = relationship("Habit", back_populates="owner")
    logs = relationship("Log", back_populates="user")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50))
    field_definitions = Column(JSONB, nullable=False, server_default="[]")

    owner = relationship("User", back_populates="habits")
    logs = relationship("Log", back_populates="habit", cascade="all, delete-orphan")


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    custom_fields = Column(JSONB, nullable=False, server_default="{}")

    user = relationship("User", back_populates="logs")
    habit = relationship("Habit", back_populates="logs")