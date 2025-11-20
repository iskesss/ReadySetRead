
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
// import logo from '../logo.png';

//API type imports
import { generateQuiz } from '../api/quiz';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/App.css'

//CONNECT TO BACKEND: THE PARENT NAME
export default function PHStudentLandingPage() {
    const navigate = useNavigate();
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);

    async function takeQuiz() {
        try {
            setIsGeneratingQuiz(true);
            setQuizError(null);

            // Hard code book data for now
            const title = "Harry Potter and the Sorcerer's Stone"
            const author = "J.K. Rowling"
            const reading_level = "5"
            const num_questions = 10

            const quizData = await generateQuiz({
                book_title: title,
                author: author,
                reading_level: reading_level,
                num_questions: num_questions
            })

            navigate('/quiz', {
                state: {
                    quizData: quizData
                }
            })
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            setQuizError("Failed to generate quiz. Please try again.");
            setIsGeneratingQuiz(false);
        }
    }

    return (

        //CONNECT TO BACKEND:CHILDREN NAME(S) & # cards displayed (edge case to add child?)
        //must also add links to each specific child's progress page

        <div className='parentLandingContainer'>

            <div className='header'>
                <h1>Temporary student landing page</h1>
                <p>{localStorage.getItem('token')}</p>
                <Link to="/">
                    <Button>
                        Log out
                    </Button>
                </Link>
                <Link to="/quiz">
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            takeQuiz();
                        }}
                        disabled={isGeneratingQuiz}
                        loading={isGeneratingQuiz}
                    >
                        {isGeneratingQuiz ? "Generating Quiz..." : "Take Quiz"}
                    </Button>
                </Link>
                <Link to="/library">
                    <Button>
                        Library
                    </Button>
                </Link>
                {isGeneratingQuiz && (
                    <div className="loading-message">
                        <p>Please wait while we generate your quiz...</p>
                        <p>This may take up to 30 seconds.</p>
                    </div>
                )}
                {quizError && (
                    <div className="error-message">
                        <p style={{ color: 'red' }}>{quizError}</p>
                    </div>
                )}
            </div>
        </div>
    );
}