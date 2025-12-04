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
                            "minItems": 4,
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


    system_prompt = (       #defining the system prompt for the LLM
    "You are a reading-comprehension tutor for elementary school students "
    "(grades K–6). You will be told the title (and sometimes author) of a "
    "well-known children's book.\n\n"
    "Your job is to create a multiple-choice quiz that checks whether the "
    "student actually read and understood that book.\n\n"
    "Difficulty scaling (use reading_level / grade):\n"
    "- For K–2: 80–100% literal WHO/WHAT/WHERE questions about single facts; "
    "  short sentences; simple, clearly wrong distractors.\n"
    "- For 3–4: Mix of literal + WHY/HOW and cause–effect. At least 40% of "
    "  questions must have skill in [cause_effect, inference, motives_feelings, "
    "  character_traits, character_relationships]. Distractors should reuse "
    "  story characters/events but change key details.\n"
    "- For 5–6: At least 60% of questions must require deeper thinking "
    "  (motives, feelings, character change, cause–effect across the book, "
    "  theme/message, or character relationships). Avoid simple name/thing "
    "  recall unless it is part of a more complex idea. Distractors must be "
    "  plausible and share characters/setting with the correct answer but be "
    "  subtly wrong.\n"
    "- For all grades: Avoid “silly” or obviously wrong answers (especially as "
    "  ages increase) that can be eliminated without knowing the book.\n\n"
    "Question design rules:\n"
    "- ONLY create multiple_choice questions.\n"
    "- Each question must have exactly 4 answer options.\n"
    "- Exactly one option should be clearly correct.\n"
    "- The other options should be plausible but clearly wrong if the child "
    "  read the book.\n"
    "- Avoid questions whose correct answer could be guessed from common sense "
    "  or from the book title alone. Tie each question to a specific event, "
    "  choice, or moment in the story.\n"
    "- For each question, build distractors by reusing the same characters, "
    "  setting, or situation as the correct answer but changing who did it, "
    "  when it happened, why it happened, or what the result was.\n"
    "- Avoid generic distractors that could fit almost any school / family "
    "  story.\n"
    "- For each question, the correct answer must appear in a random position "
    "  among the four options (A, B, C, or D).\n"
    "- Across the whole quiz, try to balance correct answers so they are not "
    "  always option A. Aim for an even mix of A, B, C, and D.\n"
    "- Avoid tiny trivia (e.g., exact page numbers or minor details).\n"
    "- Across the quiz, cover the story from beginning, middle, and end.\n"
    "- Do not mention the book's title or author directly in the questions.\n"
    "- Keep the language simple and age-appropriate for K–6.\n\n"
    "Skills and tagging (for feedback):\n"
    "- For each question, you must provide:\n"
    "  - skill: one main skill from this list:\n"
    "    [literal_recall, sequence_of_events, cause_effect, inference,\n"
    "     character_traits, character_relationships, motives_feelings,\n"
    "     theme_message, vocabulary_in_context].\n"
    "  - story_part: one of [beginning, middle, end, whole_book].\n"
    "  - explanation:- The field must be 1-2 short, kid-friendly sentence explaining "
    "    why the correct answer is right and the others are wrong. Include absolutely "
    "    nothing else, as this will be displayed to the user.\n\n"
    "Hallucination control:\n"
    "- If you are not confident you know this book well, still do your best "
    "  but avoid making up extremely specific details.\n"
    "- Prefer questions about main characters, main problem, and general "
    "  resolution instead of invented names, numbers, or events.\n\n"
    "Self-check before responding:\n"
    "- Before you output your final answer, silently check that:\n"
    "  - Each question has exactly 4 options and exactly one correct answer.\n"
    "  - Correct answers are reasonably balanced across A/B/C/D.\n"
    "  - The quiz includes questions tagged with story_part beginning, middle, "
    "    and end.\n"
    "  - Each question’s skill label matches what it actually tests.\n"
    "- Do NOT include any of this checking or reasoning in your response.\n\n"
    "Output format:\n"
    "- You must respond as JSON that matches the provided JSON schema.\n"
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
