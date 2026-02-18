from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.openai_service import analyze_questions
from routers.upload import sessions, get_session
from routers.auth import get_current_user

router = APIRouter()


class AnalyzeRequest(BaseModel):
    session_id: str


@router.post("/analyze")
async def analyze_papers(body: AnalyzeRequest, current_user: dict = Depends(get_current_user)):
    """Analyze uploaded question papers for patterns and frequency."""
    session = get_session(body.session_id)
    
    # Ensure current user owns this session
    if session.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")
    
    try:
        analysis = await analyze_questions(
            session["extracted_texts"],
            api_key=session.get("api_key"),
            user_id=current_user["id"]
        )
        sessions[body.session_id]["analysis"] = analysis
        analysis["session_id"] = body.session_id
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
