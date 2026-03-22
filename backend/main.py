from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routers import auth, habits, checkins, analytics, rewards, onboarding


# ✅ Create DB tables
Base.metadata.create_all(bind=engine)


# ✅ App instance
app = FastAPI(title="Bloom API", version="1.0.0")


# ✅ CORS CONFIG (FINAL WORKING VERSION)
origins = [
    "https://habit-tracker-eta-rose.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("✅ CORS CONFIG LOADED")  # debug line


# ✅ Include routers
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(checkins.router)
app.include_router(analytics.router)
app.include_router(rewards.router)
app.include_router(onboarding.router)


# ✅ Root route
@app.get("/")
def root():
    return {"message": "Bloom API is running 🌸"}


# ✅ Health check
@app.get("/health")
def health():
    return {"status": "ok"}
