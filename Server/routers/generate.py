from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.openai_service import generate_question_paper
from routers.upload import sessions, get_session
from routers.auth import get_current_user

router = APIRouter()


class GenerateRequest(BaseModel):
    session_id: str


@router.post("/generate")
async def generate_paper(body: GenerateRequest, current_user: dict = Depends(get_current_user)):
    """Generate a predicted question paper based on analysis."""
    session = get_session(body.session_id)
    
    # Ensure current user owns this session
    if session.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")
    
    if not session.get("analysis"):
        raise HTTPException(status_code=400, detail="Please analyze papers first before generating.")
    
    try:
        paper = await generate_question_paper(
            session["analysis"],
            api_key=session.get("api_key"),
            user_id=current_user["id"]
        )
        sessions[body.session_id]["paper"] = paper
        paper["session_id"] = body.session_id
        return paper
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Paper generation failed: {str(e)}")
