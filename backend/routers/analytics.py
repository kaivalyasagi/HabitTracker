from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from datetime import date, timedelta
from collections import defaultdict
import models, schemas, auth

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def compute_streak(completed_dates: set, today: date) -> int:
    streak = 0
    cursor = today
    while cursor in completed_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


@router.get("", response_model=schemas.AnalyticsSummary)
def get_analytics(
    db:   Session     = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    today    = date.today()
    year_ago = today - timedelta(days=364)

    habits = db.query(models.Habit).filter(models.Habit.user_id == user.id).all()
    active_habits = [h for h in habits if h.is_active]

    all_checkins = db.query(models.HabitCheckin).filter(
        models.HabitCheckin.user_id   == user.id,
        models.HabitCheckin.completed == True,
    ).all()

    # Heatmap
    day_counts: dict = defaultdict(int)
    for c in all_checkins:
        if c.date >= year_ago:
            day_counts[str(c.date)] += 1

    max_count = max(day_counts.values(), default=1)
    heatmap   = []
    for i in range(365):
        d   = year_ago + timedelta(days=i)
        cnt = day_counts.get(str(d), 0)
        level = 0 if cnt == 0 else min(4, 1 + int(cnt / max_count * 3.99))
        heatmap.append(schemas.DayCell(date=str(d), count=cnt, level=level))

    # Streaks
    completed_dates = {c.date for c in all_checkins}
    current_streak  = compute_streak(completed_dates, today)

    longest = run = 0
    for i in range(365):
        d = today - timedelta(days=i)
        if d in completed_dates:
            run += 1
            longest = max(longest, run)
        else:
            run = 0

    # Week / month counts
    week_start  = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    week_checkins  = sum(1 for c in all_checkins if c.date >= week_start)
    month_checkins = sum(1 for c in all_checkins if c.date >= month_start)

    # Per-habit breakdown
    breakdown = []
    for h in active_habits:
        completed = [c for c in h.checkins if c.completed]
        elapsed   = max(1, min((today - h.start_date).days + 1, h.duration_days))
        rate      = round(len(completed) / elapsed * 100, 1)
        breakdown.append({
            "id": h.id, "name": h.name, "color": h.color, "icon": h.icon,
            "completion_rate": rate, "total_completed": len(completed),
            "duration_days": h.duration_days,
        })

    total_possible = sum(
        max(1, min((today - h.start_date).days + 1, h.duration_days))
        for h in active_habits
    ) or 1
    overall_rate = min(100.0, round(len(all_checkins) / total_possible * 100, 1))

    return schemas.AnalyticsSummary(
        total_habits=len(habits),
        active_habits=len(active_habits),
        overall_completion_rate=overall_rate,
        longest_streak=longest,
        current_streak=current_streak,
        total_checkins=len(all_checkins),
        checkins_this_week=week_checkins,
        checkins_this_month=month_checkins,
        habit_breakdown=breakdown,
        heatmap_data=heatmap,
    )
