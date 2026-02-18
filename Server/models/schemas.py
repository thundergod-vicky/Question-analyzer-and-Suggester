from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UploadResponse(BaseModel):
    session_id: str
    files_processed: int
    extracted_text: List[str]
    message: str


class QuestionEntry(BaseModel):
    question: str
    marks: int
    topic: str
    year: Optional[str] = None
    section: Optional[str] = None


class TopicFrequency(BaseModel):
    topic: str
    count: int
    years: List[str]
    percentage: float


class AnalysisResult(BaseModel):
    session_id: str
    total_questions: int
    topics: List[TopicFrequency]
    year_distribution: Dict[str, int]
    predicted_topics: List[str]
    pattern_insights: List[str]
    all_questions: List[QuestionEntry]


class GeneratedQuestion(BaseModel):
    number: int
    question: str
    marks: int
    section: str
    topic: str


class GeneratedSection(BaseModel):
    name: str
    instructions: str
    questions: List[GeneratedQuestion]
    total_marks: int


class GeneratedPaper(BaseModel):
    session_id: str
    title: str
    subject: str
    total_marks: int
    duration: str
    general_instructions: List[str]
    sections: List[GeneratedSection]


class AnsweredQuestion(BaseModel):
    number: int
    question: str
    marks: int
    section: str
    answer: str


class AnswerSet(BaseModel):
    session_id: str
    title: str
    answered_questions: List[AnsweredQuestion]
