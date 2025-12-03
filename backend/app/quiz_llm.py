# app/quiz_llm.py
import json
import os
from typing import List, TypedDict

from openai import OpenAI


class QuizQuestionDict(TypedDict):      #definings aspects of each quiz Q
    id: str
    type: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  #read OpenAI API key from env var       #???
if not OPENAI_API_KEY:                            #raise error if missing
    raise RuntimeError(
        "OPENAI_API_KEY environment variable is not set; "
        "the quiz generator cannot talk to OpenAI."
    )

client = OpenAI(api_key=OPENAI_API_KEY)

DEFAULT_QUIZ_MODEL = "gpt-5-mini"


def _quiz_json_schema() -> dict: #defining the JSON schema for the quiz questions
    return {
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": [
                        "id",
                        "type",
                        "question",
                        "options",
                        "correct_answer",
                        "explanation",
                    ],
                    "properties": {
                        "id": {"type": "string"},
                        "type": {
                            "type": "string",
                            "enum": ["multiple_choice"],
                        },
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "minItems": 3,
                            "maxItems": 4,
                            "items": {"type": "string"},
                        },
                        "correct_answer": {"type": "string"},
                        "explanation": {"type": "string"},
                    },
                    "additionalProperties": False,
                },
            }
        },
        "required": ["questions"],
        "additionalProperties": False,
    }

def generate_quiz_for_book(
    *,
    book_title: str,
    author: str | None = None,          #optional author parameter
    reading_level: str | None = None,   #optional reading level parameter
    num_questions: int = 10,
) -> List[QuizQuestionDict]:            #returns list of quiz questions(as dicts)
    
    num_questions = max(1, min(num_questions, 20))  #questions capped between 1 and 20

    # ========================================================
    # NOTES FOR PROMPT ENGINEERING -Will
    # 1. Sometimes the first option is always the correct option, tell it to randomize answer order
    # 2.
    # ========================================================

    system_prompt = (                   #system-level instructions for the LLM
        "You are a reading-comprehension tutor for elementary school students "
        "(grades K–6). You will be told the title (and sometimes author) of a "
        "well-known children's book.\n\n"
        "Your job is to create a multiple-choice quiz that checks whether the "
        "student actually read and understood that book.\n\n"
        "Difficulty scaling (use reading_level / grade):\n"
        "- For K–2: 80–100% literal WHO/WHAT/WHERE questions about single facts; short sentences; simple, clearly wrong distractors.\n"
        "- For 3–4: Mix of literal + WHY/HOW and cause–effect (at least 40% of questions must be WHY/HOW or \"What happened because...?\" ); distractors should reuse story characters/events but change key details.\n"
        "- For 5–6: At least 60% of questions must require deeper thinking (motives, feelings, character change, cause–effect across the book, theme, or \"What does this show about...?\" ). Avoid simple name/thing recall unless it is part of a more complex idea. Distractors must be plausible and share characters/setting with the correct answer but be subtly wrong.\n"
        "- For all grades: Generally avoid “silly” or obviously wrong answers (especially as ages increase) that can be eliminated without knowing the book.\n\n"
        "Rules:\n"
        "- ONLY create multiple_choice questions.\n"
        "- Each question must have exactly 4 answer options.\n"
        "- Exactly one option should be clearly correct.\n"
        "- The other options should be plausible but clearly wrong if the child read the book.\n"
        "- For each question, the correct answer must appear in a random position among the four options (A, B, C, or D).\n"
        "- Across the whole quiz, try to balance correct answers so they are not always option A. Aim for an even mix of A, B, C, and D.\n"
        "- Avoid tiny trivia (e.g., exact page numbers or minor details).\n"
        "- Cover the story from beginning, middle, and end.\n"
        "- Do not mention the book's title or author directly in the questions.\n"
        "- Keep the language simple and age-appropriate for K–6.\n"
        "- If you are not confident you know this book, still do your best "
        "  but avoid making up extremely specific details.\n"
        "- You must respond as JSON that matches the provided JSON schema."
    )

    user_context_parts = []
    user_context_parts.append(f"Book title: {book_title}")
    if author:
        user_context_parts.append(f"Author: {author}")                      #optional author parameter
    if reading_level:
        user_context_parts.append(f"Target reading level: {reading_level}")  #optional reading level parameter
    user_context_parts.append(f"Desired number of questions: {num_questions}")
    header = "\n".join(user_context_parts)

    user_message = header  # not putting in full text or pdf, just relying on model's knowledge of the book

    response = client.chat.completions.create(
        model=DEFAULT_QUIZ_MODEL,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "readysetread_book_mcq_quiz",
                "schema": _quiz_json_schema(),
                "strict": True,
            },
        },
        messages=[
            {"role": "system", "content": system_prompt},           #job to follow no matter what
            {"role": "user", "content": user_message},              #specific task given job outlined earlier
        ],
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)                                          #if the model returns valid JSON, parse it, if not, it will raise an error
    questions: List[QuizQuestionDict] = data.get("questions", [])

    if len(questions) > num_questions:                              #just in case the model produces more Qs than requested
        questions = questions[:num_questions]

    
    for q in questions:
        q.setdefault("type", "multiple_choice")                     # ensure each question has a "type" field, defaulting to "multiple_choice"

    return questions
