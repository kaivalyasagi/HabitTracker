from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from datetime import date
from typing import List, Optional
import models, schemas, auth
from routers.rewards import check_and_grant_rewards

router = APIRouter(prefix="/api/checkins", tags=["checkins"])


@router.post("", response_model=schemas.CheckinOut)
def upsert_checkin(
    data: schemas.CheckinCreate,
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == data.habit_id,
        models.Habit.user_id == user.id,
    ).first()
    if not habit:
        raise HTTPException(404, "Habit not found")

    existing = db.query(models.HabitCheckin).filter(
        and_(
            models.HabitCheckin.habit_id == data.habit_id,
            models.HabitCheckin.user_id  == user.id,
            models.HabitCheckin.date     == data.date,
        )
    ).first()

    if existing:
        existing.completed = data.completed
        existing.value     = data.value
        existing.notes     = data.notes
        db.commit()
        db.refresh(existing)
        checkin = existing
    else:
        checkin = models.HabitCheckin(
            habit_id=data.habit_id, user_id=user.id,
            date=data.date, completed=data.completed,
            value=data.value, notes=data.notes,
        )
        db.add(checkin)
        db.commit()
        db.refresh(checkin)

    check_and_grant_rewards(db, user)
    return checkin


@router.get("/today", response_model=List[schemas.CheckinOut])
def get_today(
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.HabitCheckin).filter(
        models.HabitCheckin.user_id == user.id,
        models.HabitCheckin.date   == date.today(),
    ).all()


@router.get("/range", response_model=List[schemas.CheckinOut])
def get_range(
    start:    date,
    end:      date,
    habit_id: Optional[int] = None,
    db:       Session       = Depends(get_db),
    user:     models.User   = Depends(auth.get_current_user),
):
    query = db.query(models.HabitCheckin).filter(
        models.HabitCheckin.user_id == user.id,
        models.HabitCheckin.date   >= start,
        models.HabitCheckin.date   <= end,
    )
    if habit_id:
        query = query.filter(models.HabitCheckin.habit_id == habit_id)
    return query.all()
