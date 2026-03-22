from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from datetime import date, timedelta
from typing import List
import models, schemas, auth

router = APIRouter(prefix="/api/habits", tags=["habits"])


def compute_streak(checkins: list, today: date) -> int:
    completed_dates = sorted(
        {c.date for c in checkins if c.completed}, reverse=True
    )
    if not completed_dates:
        return 0
    streak = 0
    cursor = today
    for d in completed_dates:
        if d == cursor:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break
    return streak


def enrich_habit(habit: models.Habit, today: date) -> dict:
    checkins  = habit.checkins
    completed = [c for c in checkins if c.completed]
    elapsed   = max(1, min((today - habit.start_date).days + 1, habit.duration_days))
    rate      = round(len(completed) / elapsed * 100, 1)

    out = schemas.HabitOut.model_validate(habit).model_dump()
    out["current_streak"] = compute_streak(checkins, today)
    out["completion_rate"] = rate
    out["total_checkins"]  = len(completed)
    return out


@router.get("", response_model=List[schemas.HabitOut])
def get_habits(
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    habits = (
        db.query(models.Habit)
        .filter(models.Habit.user_id == user.id, models.Habit.is_active == True)
        .all()
    )
    today = date.today()
    return [enrich_habit(h, today) for h in habits]


@router.post("", response_model=schemas.HabitOut)
def create_habit(
    data: schemas.HabitCreate,
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    habit = models.Habit(
        user_id        = user.id,
        name           = data.name,
        habit_type     = data.habit_type,
        frequency      = data.frequency,
        target_value   = data.target_value,
        target_unit    = data.target_unit,
        preferred_time = data.preferred_time or "anytime",
        duration_days  = data.duration_days,
        color          = data.color or "#FADADD",
        icon           = data.icon or "✨",
        start_date     = data.start_date or date.today(),
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return enrich_habit(habit, date.today())


@router.patch("/{habit_id}", response_model=schemas.HabitOut)
def update_habit(
    habit_id: int,
    data: schemas.HabitUpdate,
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == user.id,
    ).first()
    if not habit:
        raise HTTPException(404, "Habit not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(habit, field, value)
    db.commit()
    db.refresh(habit)
    return enrich_habit(habit, date.today())


@router.delete("/{habit_id}")
def delete_habit(
    habit_id: int,
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == user.id,
    ).first()
    if not habit:
        raise HTTPException(404, "Habit not found")

    habit.is_active = False
    db.commit()
    return {"message": "Habit archived"}
