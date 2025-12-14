
Welcome to the ReadySetRead Repository!
-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

We're a reading app for kids. After reading books they can take quizzes, earn coins, & buy rewards. And parents can track their progress.

Authors: Will DeGasparis, Juliana Bruno, Marta Balikcioglu, Jordan Bouret, Cole Paris

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

Tech Stack
----------

Frontend: React 19.1.1, TypeScript, Vite 7.1.7, Axios, React Router, Recharts
Backend: FastAPI, Python 3.11, PostgreSQL, OpenAI API, JWT auth, bcrypt
Deployment: Docker, AWS (RDS for database)

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

Project Structure
-----------------

frontend/src/
    pages/          - login, signup, student/parent landing, library, quiz, results, rewards
    components/     - layout, nav, buttons, book cards, progress charts
    api/            - API calls to backend (students, parents, quiz, rewards, books)
    styles/         - CSS files

backend/app/
    main.py         - FastAPI app setup
    api.py          - all the endpoints
    db.py           - database connection pool
    quiz_llm.py     - OpenAI quiz generation

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

Database (see ERD.png)
----------------------

PostgreSQL on AWS RDS

Tables: adults, children, books, quizzes, custom_rewards

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

How to Run 
----------

Frontend (assuming AWS backend container is up and running):
    cd frontend
    npm install
    npm run dev
    -> http://localhost:3000

Backend:
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

    uvicorn app.main:app --reload --port 8000
    -> http://localhost:8000

Docker:
    cd backend
    docker build -t readysetread-backend .
    docker run -p 8000:8000 --env-file .env readysetread-backend

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

Features
--------

- Adult/child login (separate accounts)
- Book library featuring a multitude of reading levels
- LLM-generated quizzes (using GPT-4)
- Coin rewards system!
- Customizable backgrounds/skins
- Progress tracking for parents/tutors

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

API (high level overview)
-------------------------

Auth:
  POST /v1/adults/signup | /v1/adults/login
  POST /v1/children/signup | /v1/children/login

Books:
  GET  /v1/books
  GET  /v1/books/{book_id}

Quizzes:
  POST /v1/quizzes/generate
  POST /v1/quizzes/submit
  GET  /v1/quizzes/history

Rewards:
  GET  /v1/rewards
  POST /v1/rewards/purchase
  GET  /v1/children/{child_id}/inventory

-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

API Docs: http://localhost:8000/docs (when backend is running)
