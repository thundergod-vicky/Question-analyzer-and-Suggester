from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import upload, analyze, generate, answers, pdf_export, auth
from database import init_db

app = FastAPI(
    title="Question Analyzer & Suggester API",
    description="AI-powered question paper analysis and prediction system",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    # Force schema creation on startup
    init_db()

app.include_router(auth.router, prefix="/api")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(generate.router, prefix="/api", tags=["Generate"])
app.include_router(answers.router, prefix="/api", tags=["Answers"])
app.include_router(pdf_export.router, prefix="/api", tags=["PDF Export"])


@app.get("/")
async def root():
    return {"message": "Question Analyzer & Suggester API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
