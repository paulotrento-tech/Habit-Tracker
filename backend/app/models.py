from sqlalchemy import Column, Integer, String, Boolean, Date, Numeric, ForeignKey
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

    owner = relationship("User", back_populates="habits")
    logs = relationship("Log", back_populates="habit")


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    lessons_completed = Column(Integer)
    pages_read = Column(Integer)
    exercise_type = Column(String(100))
    weight = Column(Integer)
    reps = Column(Integer)
    sets = Column(Integer)
    miles = Column(Numeric)

    user = relationship("User", back_populates="logs")
    habit = relationship("Habit", back_populates="logs")