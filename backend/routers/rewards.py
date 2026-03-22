from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from datetime import date, timedelta
from typing import List
import models, schemas, auth

router = APIRouter(prefix="/api/rewards", tags=["rewards"])

MILESTONES = [
    (7,   "7-Day Streak 🌟",   "You kept going for a full week!",  "streak",    "🌟"),
    (14,  "2-Week Warrior 💪", "14 days of consistency!",          "streak",    "💪"),
    (21,  "21-Day Champion 🏆","You built a real habit!",          "milestone", "🏆"),
    (30,  "30-Day Legend 🔥",  "A whole month of dedication!",     "milestone", "🔥"),
    (50,  "50-Day Titan ⚡",   "Halfway to 100 days!",             "milestone", "⚡"),
    (75,  "75 Days Strong 💎", "75 Hard complete!",                "milestone", "💎"),
    (100, "Century Club 🎯",   "100 days of pure discipline!",     "milestone", "🎯"),
]


def compute_overall_streak(db: Session, user: models.User) -> int:
    today  = date.today()
    streak = 0
    cursor = today
    for _ in range(365):
        has_checkin = db.query(models.HabitCheckin).filter(
            models.HabitCheckin.user_id   == user.id,
            models.HabitCheckin.date      == cursor,
            models.HabitCheckin.completed == True,
        ).first()
        if has_checkin:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break
    return streak


def check_and_grant_rewards(db: Session, user: models.User):
    streak = compute_overall_streak(db, user)
    earned = {r.title for r in db.query(models.Reward).filter(
        models.Reward.user_id == user.id
    ).all()}
    for days, title, desc, rtype, icon in MILESTONES:
        if streak >= days and title not in earned:
            db.add(models.Reward(
                user_id=user.id, title=title,
                description=desc, reward_type=rtype, badge_icon=icon,
            ))
    db.commit()


@router.get("", response_model=List[schemas.RewardOut])
def get_rewards(
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Reward)
        .filter(models.Reward.user_id == user.id)
        .order_by(models.Reward.earned_at.desc())
        .all()
    )
