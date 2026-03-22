from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import onboarding
import models
from routers import auth, habits, checkins, analytics, rewards

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bloom API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://habit-tracker-eta-rose.vercel.app" ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(checkins.router)
app.include_router(analytics.router)
app.include_router(rewards.router)
app.include_router(onboarding.router)

@app.get("/")
def root():
    return {"message": "Bloom API is running 🌸"}

@app.get("/health")
def health():
    return {"status": "ok"}
