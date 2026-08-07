from typing import Optional
from pydantic import BaseModel, ConfigDict

from datetime import date as date_type
from decimal import Decimal

from pydantic import EmailStr

class HabitCreate(BaseModel):
    name: str
    type: Optional[str] = None


class HabitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    type: Optional[str] = None


class LogCreate(BaseModel):
    habit_id: int
    date: date_type
    completed: bool = False
    lessons_completed: Optional[int] = None
    pages_read: Optional[int] = None
    exercise_type: Optional[str] = None
    weight: Optional[int] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    miles: Optional[Decimal] = None


class LogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    habit_id: int
    date: date_type
    completed: bool
    lessons_completed: Optional[int] = None
    pages_read: Optional[int] = None
    exercise_type: Optional[str] = None
    weight: Optional[int] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    miles: Optional[Decimal] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"