from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.openai_service import generate_answers
from routers.upload import sessions, get_session
from routers.auth import get_current_user

router = APIRouter()


class AnswersRequest(BaseModel):
    session_id: str


@router.post("/answers")
async def get_answers(body: AnswersRequest, current_user: dict = Depends(get_current_user)):
    """Generate mark-appropriate answers for the generated question paper."""
    session = get_session(body.session_id)
    
    # Ensure current user owns this session
    if session.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")
    
    if not session.get("paper"):
        raise HTTPException(status_code=400, detail="Please generate a question paper first.")
    
    try:
        answer_set = await generate_answers(
            session["paper"],
            api_key=session.get("api_key"),
            user_id=current_user["id"]
        )
        sessions[body.session_id]["answers"] = answer_set
        answer_set["session_id"] = body.session_id
        answer_set["title"] = session["paper"].get("title", "Question Paper")
        return answer_set
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {str(e)}")
