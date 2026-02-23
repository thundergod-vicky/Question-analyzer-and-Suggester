import asyncio
import functools
from openai import OpenAI, APIConnectionError, RateLimitError, APIStatusError
from dotenv import load_dotenv
import os
import json
import re
from database import get_db_connection

load_dotenv()

# Global client with synchronous transport and timeout
# We will run this in threads to avoid blocking the event loop
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=300.0,
    max_retries=5
)

# Constants for cleanup
JSON_BLOCK_START = r'^```(?:json)?\s*'
JSON_BLOCK_END = r'\s*```$'
DEFAULT_MODEL = "gpt-4o-mini"

def clean_json_response(content: str) -> str:
    content = content.strip()
    content = re.sub(JSON_BLOCK_START, '', content)
    content = re.sub(JSON_BLOCK_END, '', content)
    return content

def increment_user_credits(user_id: int):
    """Increment the credit count for a user in the database."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SET search_path TO AI_Question_Analyzer_greaterdig;")
        cur.execute("UPDATE users SET credits_used = credits_used + 1 WHERE id = %s", (user_id,))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error incrementing credits for user {user_id}: {e}")

async def analyze_questions(extracted_texts: list[str], api_key: str = None, user_id: int = None) -> dict:
    """Analyze question papers and return pattern analysis."""
    c = client
    if api_key:
        c = OpenAI(api_key=api_key, timeout=300.0)

    combined_text = "\n\n---PAPER SEPARATOR---\n\n".join(extracted_texts)

    prompt = f"""You are an expert academic question paper analyzer. Analyze the following question papers carefully.

QUESTION PAPERS:
{combined_text}

Analyze these papers and return a JSON response with the following structure:
{{
  "total_questions": <number>,
  "topics": [
    {{
      "topic": "<topic name>",
      "count": <how many times this topic appeared>,
      "years": ["<year1>", "<year2>"],
      "percentage": <percentage of total questions>
    }}
  ],
  "year_distribution": {{"<year>": <question count>}},
  "predicted_topics": ["<topic most likely to appear this year>", ...],
  "pattern_insights": [
    "<insight about question patterns>",
    ...
  ],
  "all_questions": [
    {{
      "question": "<full question text>",
      "marks": <marks>,
      "topic": "<topic>",
      "year": "<year if identifiable>",
      "section": "<section A/B/C if identifiable>"
    }}
  ]
}}

Be thorough in identifying:
1. Recurring topics and their frequency
2. Mark distribution patterns
3. Section patterns (short answer, long answer, etc.)
4. Topics that haven't appeared recently but are overdue
5. Topics that appear every year

Return ONLY valid JSON, no markdown or explanation."""

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, 
            functools.partial(
                c.chat.completions.create,
                model=DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=4000
            )
        )
        if user_id:
            await asyncio.to_thread(increment_user_credits, user_id)
        content = clean_json_response(response.choices[0].message.content)
        return json.loads(content)
    except Exception as e:
        print(f"Error in analyze_questions: {e}")
        raise ValueError(f"Failed to analyze questions: {str(e)}")


async def generate_question_paper(analysis: dict, api_key: str = None, user_id: int = None) -> dict:
    """Generate a predicted question paper based on analysis."""
    c = client
    if api_key:
        c = OpenAI(api_key=api_key, timeout=300.0)

    prompt = f"""You are an expert academic question paper setter. Based on the following analysis of past question papers, create a comprehensive predicted question paper for this year.

ANALYSIS DATA:
{json.dumps(analysis, indent=2)}

Create a well-structured question paper following the same pattern as the analyzed papers. Return a JSON response:
{{
  "title": "<Subject Name> - Predicted Question Paper 2026",
  "subject": "<Subject Name>",
  "total_marks": <total marks>,
  "duration": "<duration like '3 Hours'>",
  "general_instructions": [
    "<instruction 1>",
    "<instruction 2>",
    ...
  ],
  "sections": [
    {{
      "name": "Section A",
      "instructions": "<section specific instructions>",
      "total_marks": <marks for this section>,
      "questions": [
        {{
          "number": 1,
          "question": "<full question text>",
          "marks": <marks>,
          "section": "A",
          "topic": "<topic>"
        }}
      ]
    }}
  ]
}}

Rules:
1. Focus on predicted_topics from the analysis
2. Include topics that appear frequently
3. Include topics that haven't appeared recently (overdue)
4. Match the mark distribution pattern from past papers
5. Create original questions (not copies from past papers)
6. Ensure questions are academically rigorous
7. Follow the same section structure as past papers

Return ONLY valid JSON, no markdown or explanation."""

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            functools.partial(
                c.chat.completions.create,
                model=DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4000
            )
        )
        if user_id:
            await asyncio.to_thread(increment_user_credits, user_id)
        content = clean_json_response(response.choices[0].message.content)
        return json.loads(content)
    except Exception as e:
        print(f"Error in generate_question_paper: {e}")
        raise ValueError(f"Failed to generate paper: {str(e)}")


async def generate_answers(paper: dict, api_key: str = None, user_id: int = None) -> dict:
    """Generate mark-appropriate answers for each question."""
    c = client
    if api_key:
        c = OpenAI(api_key=api_key, timeout=300.0)

    all_questions = []
    for section in paper.get("sections", []):
        for q in section.get("questions", []):
            all_questions.append(q)

    prompt = f"""You are an expert academic teacher. Provide comprehensive, mark-appropriate answers for the following exam questions.

SUBJECT: {paper.get('subject', 'General')}
EXAM: {paper.get('title', 'Question Paper')}

QUESTIONS:
{json.dumps(all_questions, indent=2)}

For each question, provide an answer that:
- Is appropriate for the marks allocated (1 mark = brief, 2-3 marks = moderate detail, 5+ marks = comprehensive with points/diagrams mentioned)
- Is academically accurate and complete
- Uses proper structure (bullet points for multi-mark answers)
- Includes key terms and concepts

Return a JSON response:
{{
  "answered_questions": [
    {{
      "number": <question number>,
      "question": "<question text>",
      "marks": <marks>,
      "section": "<section>",
      "answer": "<comprehensive answer>"
    }}
  ]
}}

Return ONLY valid JSON, no markdown or explanation."""

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            functools.partial(
                c.chat.completions.create,
                model=DEFAULT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=6000
            )
        )
        if user_id:
            await asyncio.to_thread(increment_user_credits, user_id)
        content = clean_json_response(response.choices[0].message.content)
        return json.loads(content)
    except Exception as e:
        print(f"Error in generate_answers: {e}")
        raise ValueError(f"Failed to generate answers: {str(e)}")


async def extract_text_from_image(image_base64: str, api_key: str = None, user_id: int = None) -> str:
    """Use GPT-4o Vision to extract question text from an image."""
    c = client
    if api_key:
        c = OpenAI(api_key=api_key, timeout=60.0)

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            functools.partial(
                c.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract all the text from this question paper image. Preserve the structure including question numbers, marks, sections, and all text. Return only the extracted text."
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                            }
                        ]
                    }
                ],
                max_tokens=3000
            )
        )
        if user_id:
            await asyncio.to_thread(increment_user_credits, user_id)
        return response.choices[0].message.content.strip()
    except APIConnectionError as e:
        print(f"OpenAI Connection Error: {e}")
        raise ValueError(f"OpenAI connection failed. Details: {e}")
    except RateLimitError as e:
        print(f"OpenAI Rate Limit Error: {e}")
        raise ValueError("OpenAI rate limit reached.")
    except APIStatusError as e:
        print(f"OpenAI API Status Error: {e.status_code} - {e.response.text}")
        raise ValueError(f"OpenAI API error ({e.status_code}).")
    except Exception as e:
        print(f"OpenAI Unexpected Error: {type(e).__name__} - {e}")
        raise ValueError(f"An unexpected error occurred: {str(e)}")
