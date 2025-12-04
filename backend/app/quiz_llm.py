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


def generate_quiz_feedback(
    *,
    questions: List[QuizQuestionDict], # a list of quiz questions with correct answers and explanations
    child_responses: List[str], # list of the child's responses (same order as questions)
) -> str:
    
    # build a summary of the quiz results
    results_summary = []
    for i in range(len(questions)):
        question = questions[i]
        response = child_responses[i]
        correct = question["correct_answer"]
        is_correct = response == correct
        results_summary.append({
            "question_number": i + 1,  
            "question": question["question"],
            "correct_answer": correct,
            "child_answer": response,
            "is_correct": is_correct,
            "explanation": question.get("explanation", "")
        })

    # count correct answers
    num_correct = 0
    for r in results_summary:
        if r["is_correct"]:
            num_correct += 1

    total_questions = len(questions)

    # build prompt for feedback generation
    system_prompt = (
        "You are a kind but honest reading tutor for elementary school students "
        "(grades K-6).\n\n"
        "You will be given:\n"
        "- quiz_json: an object with a 'questions' array. Each question has:\n"
        "  - id: string\n"
        "  - type: 'multiple_choice'\n"
        "  - question: string\n"
        "  - options: array of exactly 4 answer choices (strings)\n"
        "  - correct_answer: the correct option text (string)\n"
        "  - explanation: a short explanation of the correct answer\n"
        "- student_answers: an array of strings representing the student's answers, "
        "  in the SAME order as quiz_json.questions.\n\n"
        "Interpreting answers:\n"
        "- If a student answer exactly matches one of the option texts, compare it "
        "  directly to 'correct_answer'.\n"
        "- If a student answer is a single letter like 'A', 'B', 'C', or 'D', treat "
        "  it as choosing options[0], options[1], options[2], or options[3].\n"
        "- Mark each question as correct or incorrect based on this comparison.\n\n"
        "Your job is to generate brief feedback for the student that:\n"
        "- Speaks directly to the student in a friendly, encouraging tone.\n"
        "- Is honest about what they need to improve, but never harsh or discouraging.\n"
        "- Focuses mostly on patterns in what they got WRONG (for example, trouble "
        "  with figuring out why characters did things, understanding how events are "
        "  connected, remembering details about characters or places, or understanding "
        "  the big lesson/theme).\n"
        "- Also briefly mentions 1-2 things they did WELL (for example, remembering "
        "  key events, understanding the main problem and solution, or knowing what "
        "  happened first/next/last).\n"
        "- Uses simple, age-appropriate language for K-6 students.\n"
        "- Avoids repeating every question or listing each missed question by number. "
        "  Instead, summarize the main patterns you see.\n\n"
        "Feedback content guidelines:\n"
        "- Start with a short positive opening that praises the student's effort and, "
        "  if possible, mentions how many they got right out of the total.\n"
        "- In 2-4 sentences, explain what the student needs to work on, based on the "
        "  types of questions they missed. Use clear, kid-friendly language about "
        "  skills like:\n"
        "  - remembering facts from the story\n"
        "  - understanding why something happened (cause and effect)\n"
        "  - paying attention to how characters feel or what they learn\n"
        "  - noticing how the story changes from the beginning to the end\n"
        "- Include 1-3 simple, concrete suggestions the student can try next time "
        "  (for example: \"slow down and reread the part where the problem gets "
        "  solved,\" \"pay attention to how the main character is feeling,\" or "
        "  \"look back at earlier pages if you forget why something happened\").\n"
        "- End with a short, encouraging closer that reinforces a growth mindset, "
        "  such as reminding them that they can improve with practice.\n\n"
        "Style and format:\n"
        "- Write as if you are talking directly to the student (use \"you\").\n"
        "- Keep sentences short and clear.\n"
        "- You may use short paragraphs or bullet points, but the entire response "
        "  must be plain text (a single long string), not JSON.\n"
        "- Do not mention that you are an AI or reference the quiz JSON structure; "
        "  just give the feedback.\n"
    )

    # format the results for the LLM
    results_text = f"The child answered {num_correct} out of {total_questions} questions correctly.\n\nHere are the details:\n\n"

    for r in results_summary:
        status = "Correct" if r["is_correct"] else "Incorrect"
        results_text += f"Question {r['question_number']}: {status}\n"
        results_text += f"  Q: {r['question']}\n"
        results_text += f"  Child's answer: {r['child_answer']}\n"
        results_text += f"  Correct answer: {r['correct_answer']}\n"
        if r.get("explanation"):
            results_text += f"  Explanation: {r['explanation']}\n"
        results_text += "\n"

    user_message = (
        f"{results_text}\n"
        "Based on these results, generate feedback for the child."
    )

    # call OpenAI to generate feedback
    response = client.chat.completions.create(
        model=DEFAULT_QUIZ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=250, # keeps feedback concise enough to fit in our PostgreSQL DB
    )

    feedback = response.choices[0].message.content.strip()
    return feedback # returns string of feedback
