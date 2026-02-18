import fitz  # PyMuPDF
import base64
from PIL import Image
import io
from services.openai_service import extract_text_from_image


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_parts = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        if text.strip():
            text_parts.append(f"[Page {page_num + 1}]\n{text}")
    doc.close()
    return "\n\n".join(text_parts)


async def extract_text_from_image_file(file_bytes: bytes, api_key: str = None, user_id: int = None) -> str:
    """Extract text from an image file using GPT-4o Vision."""
    # ... grayscale conversion ...
    image = Image.open(io.BytesIO(file_bytes))
    if image.mode != "L":
        image = image.convert("L")
    
    # ... resize ...
    if max(image.size) > 800:
        ratio = 800 / max(image.size)
        new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
        image = image.resize(new_size, Image.LANCZOS)

    image_1bit = image.point(lambda x: 0 if x < 128 else 255, '1')
    buffer = io.BytesIO()
    image_1bit.save(buffer, format="PNG", optimize=True)
    img_bytes = buffer.getvalue()
    image_base64 = base64.b64encode(img_bytes).decode("utf-8")
    
    return await extract_text_from_image(image_base64, api_key=api_key, user_id=user_id)


async def process_file(filename: str, file_bytes: bytes, api_key: str = None, user_id: int = None) -> str:
    """Process a file and return extracted text."""
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
        if len(text.strip()) < 100:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                page = doc[0]
                pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2))
                img_bytes = pix.tobytes("png")
                doc.close()
                text = await extract_text_from_image_file(img_bytes, api_key=api_key, user_id=user_id)
            except Exception as vision_err:
                print(f"Vision fallback failed for {filename}: {vision_err}")
                if text.strip():
                    return text
                raise ValueError(f"Could not extract text from PDF (Vision API error: {vision_err})")
        return text
    elif filename_lower.endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
        return await extract_text_from_image_file(file_bytes, api_key=api_key, user_id=user_id)
    else:
        raise ValueError(f"Unsupported file type: {filename}")

