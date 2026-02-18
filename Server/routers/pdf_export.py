from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from services.pdf_generator import create_question_paper_pdf, create_answer_pdf
from routers.upload import sessions, get_session
from routers.auth import get_current_user

router = APIRouter()


@router.get("/pdf/questions/{session_id}")
async def download_question_paper(session_id: str, current_user: dict = Depends(get_current_user)):
    """Download the generated question paper as PDF."""
    session = get_session(session_id)
    
    # Ensure current user owns this session
    if session.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")
    
    if not session.get("paper"):
        raise HTTPException(status_code=400, detail="No generated paper found. Please generate a paper first.")
    
    try:
        pdf_bytes = create_question_paper_pdf(session["paper"])
        filename = session["paper"].get("title", "Question_Paper").replace(" ", "_").replace("/", "-")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}.pdf"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.get("/pdf/answers/{session_id}")
async def download_answer_pdf(session_id: str, current_user: dict = Depends(get_current_user)):
    """Download the question paper with answers as PDF."""
    session = get_session(session_id)
    
    # Ensure current user owns this session
    if session.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")
    
    if not session.get("answers"):
        raise HTTPException(status_code=400, detail="No answers found. Please generate answers first.")
    
    try:
        title = session.get("paper", {}).get("title", "Question Paper")
        pdf_bytes = create_answer_pdf(session["answers"], paper_title=title)
        filename = f"{title.replace(' ', '_').replace('/', '-')}_Answers"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}.pdf"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
