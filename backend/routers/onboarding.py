from fastapi import APIRouter

router = APIRouter(prefix="/api/onboarding")

@router.post("")
def onboarding():
    return {"message": "Onboarding saved"}
