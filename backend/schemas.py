from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    onboarding_completed: bool
    user_id: int
    username: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    onboarding_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Onboarding ───────────────────────────────────────────────────────────────

class OnboardingCreate(BaseModel):
    goals: List[str]
    life_areas: List[str]
    focus_domain: str
    commitment_days: int

class OnboardingOut(BaseModel):
    id: int
    user_id: int
    goals: List[str]
    life_areas: List[str]
    focus_domain: str
    commitment_days: int

    class Config:
        from_attributes = True


# ─── Habits ───────────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    name: str
    habit_type: str = "boolean"
    frequency: str = "daily"
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    preferred_time: Optional[str] = "anytime"
    duration_days: int = 21
    color: Optional[str] = "#FADADD"
    icon: Optional[str] = "✨"
    start_date: Optional[date] = None

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    habit_type: Optional[str] = None
    frequency: Optional[str] = None
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    preferred_time: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

class HabitOut(BaseModel):
    id: int
    user_id: int
    name: str
    habit_type: str
    frequency: str
    target_value: Optional[float]
    target_unit: Optional[str]
    preferred_time: Optional[str]
    duration_days: int
    color: str
    icon: str
    is_active: bool
    start_date: date
    created_at: datetime
    current_streak: Optional[int] = 0
    completion_rate: Optional[float] = 0.0
    total_checkins: Optional[int] = 0

    class Config:
        from_attributes = True


# ─── Checkins ─────────────────────────────────────────────────────────────────

class CheckinCreate(BaseModel):
    habit_id: int
    date: date
    completed: bool = True
    value: Optional[float] = None
    notes: Optional[str] = None

class CheckinOut(BaseModel):
    id: int
    habit_id: int
    user_id: int
    date: date
    completed: bool
    value: Optional[float]
    notes: Optional[str]

    class Config:
        from_attributes = True


# ─── Analytics ────────────────────────────────────────────────────────────────

class DayCell(BaseModel):
    date: str
    count: int
    level: int

class AnalyticsSummary(BaseModel):
    total_habits: int
    active_habits: int
    overall_completion_rate: float
    longest_streak: int
    current_streak: int
    total_checkins: int
    checkins_this_week: int
    checkins_this_month: int
    habit_breakdown: List[dict]
    heatmap_data: List[DayCell]


# ─── Rewards ──────────────────────────────────────────────────────────────────

class RewardOut(BaseModel):
    id: int
    title: str
    description: str
    reward_type: str
    badge_icon: str
    earned_at: datetime

    class Config:
        from_attributes = True
