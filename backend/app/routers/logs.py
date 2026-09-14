from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..field_validation import validate_custom_fields

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("", response_model=List[schemas.LogRead])
def list_logs(
    habit_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Log).filter(models.Log.user_id == current_user.id)
    if habit_id is not None:
        query = query.filter(models.Log.habit_id == habit_id)
    return query.order_by(models.Log.date.desc()).all()


@router.post("", response_model=schemas.LogRead)
def create_log(
    log_in: schemas.LogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    habit = (
        db.query(models.Habit)
        .filter(models.Habit.id == log_in.habit_id, models.Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    field_defs = [schemas.FieldDefinition(**fd) for fd in habit.field_definitions]
    validate_custom_fields(log_in.custom_fields, field_defs)

    log = models.Log(user_id=current_user.id, **log_in.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    log = (
        db.query(models.Log)
        .filter(models.Log.id == log_id, models.Log.user_id == current_user.id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    db.delete(log)
    db.commit()
    return None

@router.patch("/{log_id}", response_model=schemas.LogRead)
def update_log(
    log_id: int,
    log_in: schemas.LogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    log = (
        db.query(models.Log)
        .filter(models.Log.id == log_id, models.Log.user_id == current_user.id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    update_data = log_in.model_dump(exclude_unset=True)
    if "custom_fields" in update_data:
        habit = db.query(models.Habit).filter(models.Habit.id == log.habit_id).first()
        field_defs = [schemas.FieldDefinition(**fd) for fd in habit.field_definitions]
        validate_custom_fields(update_data["custom_fields"], field_defs)

    for field, value in update_data.items():
        setattr(log, field, value)

    db.commit()
    db.refresh(log)
    return log