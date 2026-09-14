from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator

from datetime import date as date_type


class FieldDefinition(BaseModel):
    name: str = Field(pattern=r"^[a-z][a-z0-9_]*$", max_length=50)
    label: str
    type: Literal["integer", "float", "text"]


def _check_unique_field_names(field_definitions: List[FieldDefinition]) -> None:
    names = [f.name for f in field_definitions]
    if len(names) != len(set(names)):
        raise ValueError("field_definitions names must be unique")


class HabitCreate(BaseModel):
    name: str
    type: Optional[str] = None
    field_definitions: List[FieldDefinition] = []

    @model_validator(mode="after")
    def unique_field_names(self):
        _check_unique_field_names(self.field_definitions)
        return self


class HabitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    type: Optional[str] = None
    field_definitions: List[FieldDefinition] = []


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    field_definitions: Optional[List[FieldDefinition]] = None

    @model_validator(mode="after")
    def unique_field_names(self):
        if self.field_definitions is not None:
            _check_unique_field_names(self.field_definitions)
        return self


class LogCreate(BaseModel):
    habit_id: int
    date: date_type
    custom_fields: Dict[str, Any] = {}


class LogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    habit_id: int
    date: date_type
    custom_fields: Dict[str, Any] = {}


class LogUpdate(BaseModel):
    date: Optional[date_type] = None
    custom_fields: Optional[Dict[str, Any]] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
