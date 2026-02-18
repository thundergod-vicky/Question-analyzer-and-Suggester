from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from typing import List, Optional
import uuid
from services.pdf_parser import process_file
from routers.auth import get_current_user

router = APIRouter()

# In-memory session store (production would use Redis/DB)
sessions: dict = {}


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    api_key: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload 1-10 question paper files (PDF or image)."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")

    session_id = str(uuid.uuid4())
    extracted_texts = []
    errors = []

    for file in files:
        try:
            content = await file.read()
            text = await process_file(file.filename, content, api_key=api_key, user_id=current_user["id"])
            extracted_texts.append(f"[FILE: {file.filename}]\n{text}")
        except Exception as e:
            import traceback
            print(f"ERROR processing {file.filename}: {e}")
            traceback.print_exc()
            errors.append(f"{file.filename}: {str(e)}")

    if not extracted_texts:
        raise HTTPException(status_code=422, detail=f"Could not extract text from any file. Errors: {errors}")

    sessions[session_id] = {
        "extracted_texts": extracted_texts,
        "api_key": api_key,
        "analysis": None,
        "paper": None,
        "answers": None,
        "user_id": current_user["id"]
    }

    return {
        "session_id": session_id,
        "files_processed": len(extracted_texts),
        "extracted_text": extracted_texts,
        "credits_used": current_user["credits_used"] + len(extracted_texts), # Rough estimate for UI
        "message": f"Successfully processed {len(extracted_texts)} file(s). {f'Errors: {errors}' if errors else ''}",
    }


def get_session(session_id: str) -> dict:
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload files again.")
    return sessions[session_id]
