import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { generateQuiz } from '../api/quiz';
import { Button } from '../components/button';
import '../styles/LibraryBook.css'; // Make sure your CSS exists and is correct!

//Component Imports
import StudentLandingBook from '../components/StudentLandingBook';

//Api imports
import { getCurrentStudent, listAllQuizAssignments } from '../api/students';
import { getAllBooks } from '../api/books';
import type { Assignment, Book } from '../api/types';

type BookType = {
    title: string;
    status: 'passed' | 'incomplete';
    level: number;
};

export default function StudentLandingPage() {
    const navigate = useNavigate();
    const [myId, setMyId] = useState<number | null>(null)
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [studentAssignments, setStudentAssignments] = useState<Assignment[]>([])
    const [books, setBooks] = useState<Book[]>([])

    // ON PAGE LOAD: Get my Id
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getCurrentStudent()
                setMyId(result.child_id)
            } catch (error) {
                console.error('Error getting quiz assignments: ', error)
            }
        }
        fetchData()
    }, [])

    // ON PAGE LOAD: Get all of this student's quiz assignments
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (myId != null) {
                    const result = await listAllQuizAssignments(myId)
                    setStudentAssignments(result)
                }
            } catch (error) {
                console.error('Error getting quiz assignments: ', error)
            }
        }
        fetchData()
    }, [myId])

    // ON PAGE LOAD: Get all books, for reference by assignments to get book information
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllBooks()
                setBooks(result)
            } catch (error) {
                console.error('Error getting all books: ', error)
            }
        }
        fetchData()
    }, [])

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

    async function navToLibrary() {
        try {
            const result = await getCurrentStudent();
            const student_id = result.child_id;
            sessionStorage.setItem('targetStudentId', JSON.stringify(student_id));
            sessionStorage.setItem('meType', JSON.stringify('student'));
            navigate('/library');
        } catch (error) {
            console.log(error)
            return
        }
    }

    const passedCount = studentAssignments.filter(a => a.passed).length;
    const incompleteCount = studentAssignments.filter(a => !a.passed).length;

    return (
        <div className="studentLandingContainer">
            <div className="header">
                <h1>Welcome back!</h1>
                <Link to="/"><Button>Log out</Button></Link>
                <Button onClick={navToLibrary}>Library</Button>
                <Link to="/rewards"><Button>Store</Button></Link>
            </div>

            <div className="libraryGrid">
                {studentAssignments.map(assignment => {
                    // Find the corresponding book using book_id
                    // book.book_id is a string, assignment.book_id is a number
                    const book = books?.find(b => parseInt(b.book_id) === assignment.book_id);

                    if (!book) {
                        console.log('No book found for assignment book_id:', assignment.book_id);
                        return null;
                    }

                    // build the combined book object
                    const bookWithStatus: BookType = {
                        title: book.title,
                        status: assignment.passed ? 'passed' : 'incomplete',
                        level: book.reading_level
                    };

                    return (
                        <StudentLandingBook
                            key={assignment.quiz_id}
                            title={bookWithStatus.title}
                            status={bookWithStatus.status}
                            level={bookWithStatus.level}
                            onTakeQuiz={() => takeQuiz(bookWithStatus)}
                            isGeneratingQuiz={isGeneratingQuiz}
                        />
                    );
                })}
            </div>

            <div className="progressReport">
                <h2>Progress Report</h2>
                <div className="progressStats">
                    <div>{passedCount} passed</div>
                    <div>{incompleteCount} incomplete</div>
                </div>
            </div>

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
