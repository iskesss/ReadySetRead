import { useNavigate, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StudentBooksContext } from '../components/StudentBooksContext';
import { generateQuiz } from '../api/quiz';
import { Button } from '../components/button';
import StudentLandingBook from '../components/StudentLandingBook';
import '../styles/LibraryBook.css'; // Make sure your CSS exists and is correct!

type BookType = {
    title: string;
    status: 'passed' | 'incomplete';
    level: number;
};

export default function StudentLandingPage() {
    const navigate = useNavigate();
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const { studentBooks } = useContext(StudentBooksContext);

    async function takeQuiz(book: BookType) {
        try {
            setIsGeneratingQuiz(true);
            setQuizError(null);

            const quizData = await generateQuiz({
                book_title: book.title,
                author: 'J.K. Rowling',
                reading_level: book.level.toString(),
                num_questions: 10,
            });

            navigate('/quiz', {
                state: { quizData }
            });
        } catch (error) {
            console.log(error)
            setQuizError("Failed to generate quiz. Please try again.");
            setIsGeneratingQuiz(false);
        }
    }

    const passedCount = studentBooks.filter(b => b.status === "passed").length;
    const incompleteCount = studentBooks.filter(b => b.status === "incomplete").length;

    return (
        <div className="studentLandingContainer">
            <div className="header">
                <h1>Welcome back!</h1>
                <Link to="/"><Button>Log out</Button></Link>
                <Link to="/library"><Button>Library</Button></Link>
                <Link to="/rewards"><Button>Store</Button></Link>
            </div>

            {/* Book Tiles in matching grid layout */}
            <div className="libraryGrid">
                {studentBooks.map(book => (
                    <StudentLandingBook
                        key={book.title}
                        // Use same card class as LibraryBook INSIDE StudentLandingBook!
                        title={book.title}
                        status={book.status}
                        level={book.level}
                        onTakeQuiz={() => takeQuiz(book)}
                        isGeneratingQuiz={isGeneratingQuiz}
                    />
                ))}
            </div>

            {/* Progress Report */}
            <div className="progressReport">
                <h2>Progress Report</h2>
                <div className="progressStats">
                    <div>{passedCount} passed</div>
                    <div>{incompleteCount} incomplete</div>
                </div>
            </div>

            {/* Loading & Error Feedback */}
            {isGeneratingQuiz && (
                <div className="loading-message">
                    <p>Please wait while we generate your quiz...</p>
                </div>
            )}
            {quizError && (
                <div className="error-message">
                    <p style={{ color: 'red' }}>{quizError}</p>
                </div>
            )}
        </div>
    );
}
