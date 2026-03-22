from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    email                = Column(String, unique=True, index=True, nullable=False)
    username             = Column(String, unique=True, index=True, nullable=False)
    hashed_password      = Column(String, nullable=False)
    is_active            = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())

    profile  = relationship("OnboardingProfile", back_populates="user", uselist=False)
    habits   = relationship("Habit", back_populates="user")
    rewards  = relationship("Reward", back_populates="user")


class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True)
    goals           = Column(JSON, default=[])
    life_areas      = Column(JSON, default=[])
    focus_domain    = Column(String, nullable=True)
    commitment_days = Column(Integer, default=21)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")


class Habit(Base):
    __tablename__ = "habits"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    name           = Column(String, nullable=False)
    habit_type     = Column(String, default="boolean")
    frequency      = Column(String, default="daily")
    target_value   = Column(Float, nullable=True)
    target_unit    = Column(String, nullable=True)
    preferred_time = Column(String, nullable=True)
    duration_days  = Column(Integer, default=21)
    color          = Column(String, default="#FADADD")
    icon           = Column(String, default="✨")
    is_active      = Column(Boolean, default=True)
    start_date     = Column(Date, nullable=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    user     = relationship("User", back_populates="habits")
    checkins = relationship("HabitCheckin", back_populates="habit", cascade="all, delete-orphan")


class HabitCheckin(Base):
    __tablename__ = "habit_checkins"

    id         = Column(Integer, primary_key=True, index=True)
    habit_id   = Column(Integer, ForeignKey("habits.id"))
    user_id    = Column(Integer, ForeignKey("users.id"))
    date       = Column(Date, nullable=False)
    completed  = Column(Boolean, default=False)
    value      = Column(Float, nullable=True)
    notes      = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    habit = relationship("Habit", back_populates="checkins")


class Reward(Base):
    __tablename__ = "rewards"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    title       = Column(String)
    description = Column(Text)
    reward_type = Column(String)
    badge_icon  = Column(String, default="🏆")
    earned_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="rewards")
