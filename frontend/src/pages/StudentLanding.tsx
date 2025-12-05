import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { generateQuiz } from '../api/quiz';
import '../styles/library.css';
import '../styles/LibraryBook.css';

//Component Imports
import StudentLandingBook from '../components/StudentLandingBook';
import ProgressPieChart from '../components/progresschart';

//Api imports
import { getCurrentStudent, listAllQuizAssignments } from '../api/students';
import { getAllBooks } from '../api/books';
import type { Assignment, Book } from '../api/types';

type BookType = {
  title: string;
  status: 'passed' | 'incomplete';
  level: number;
  quiz_id: number;
};

export default function StudentLandingPage() {
  const navigate = useNavigate();
  const [myId, setMyId] = useState<number | null>(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [studentAssignments, setStudentAssignments] = useState<Assignment[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [popUpOpen, setPopUpOpen] = useState(false)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)

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
          setIsLoadingAssignments(true)  //these make sure popups don't load when switching pages
          const result = await listAllQuizAssignments(myId)
          setStudentAssignments(result)
          setIsLoadingAssignments(false)
        }
      } catch (error) {
        console.error('Error getting quiz assignments: ', error)
        setIsLoadingAssignments(false)
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



  //When take quiz button clicked
  async function takeQuiz(book: BookType) {
    try {
      if (isGeneratingQuiz) return;
      setIsGeneratingQuiz(true);
      setPopUpOpen(true);
      setQuizError(null);

      const quizData = await generateQuiz({
        book_title: book.title,
        author: 'J.K. Rowling',
        reading_level: book.level.toString(),
        num_questions: 10,
      });
      const quiz_id = book.quiz_id;

      setPopUpOpen(false);
      setIsGeneratingQuiz(false);

      navigate('/quiz', {
        state: { quizData, quiz_id },
      });
    } catch (error) {
      console.log(error);
      setQuizError("");
      setIsGeneratingQuiz(false);
      setPopUpOpen(false);
    }
  }

  // async function navToLibrary() {
  //   try {
  //     const result = await getCurrentStudent();
  //     const student_id = result.child_id;
  //     sessionStorage.setItem('targetStudentId', JSON.stringify(student_id));
  //     sessionStorage.setItem('meType', JSON.stringify('student'));
  //     navigate('/library');
  //   } catch (error) {
  //     console.log(error)
  //     return
  //   }
  // }

  const passedCount = studentAssignments.filter((a) => a.passed).length;
  const incompleteCount = studentAssignments.filter((a) => !a.passed).length;

  // function to go to library
  const goToLibrary = () => {
    if (myId === null) {
      console.error('Student ID not available'); 
      return;
    }
    sessionStorage.setItem('targetStudentId', JSON.stringify(myId));
    sessionStorage.setItem('meType', JSON.stringify('student'));
    navigate('/library');
  };

  return (
    <div className="studentLandingContainer">

      {/* popup shown when no quizzes assigned */}
      {!isLoadingAssignments && studentAssignments.length === 0 && books.length > 0 && myId !== null && (
        <div className="popUpOverlay">
          <div className="popUpBox emptyStatePopup">
            <h2 className="popUpText" style={{ fontSize: '28px', marginBottom: '20px' }}>
              Welcome to Your Dashboard!
            </h2>
            <p className="popUpText" style={{ fontSize: '18px', marginBottom: '30px' }}>
              You don't have any quizzes yet. Go to the Library page to add your first quiz!
            </p>
            <div className="popUpButtons">
              <button onClick={goToLibrary}>
                Go to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* quiz generation popup */}
      {popUpOpen && (
        <div className="popUpOverlay">
          <div className="popUpBox">
            <p className="popUpText">Generating your quiz, please wait...</p>

            <div className="progressBarContainer">
              <div className="progressBar"> </div>
            </div>

          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          marginTop: "24px",
        }}
      >
        {/* left: books using existing libraryGrid CSS */}
        <div style={{ flex: 3 }}>
          <div className="libraryGrid">
            {studentAssignments.map((assignment) => {
              const book = books?.find(
                (b) => parseInt(b.book_id) === assignment.book_id
              );

              if (!book) {
                console.log(
                  "No book found for assignment book_id:",
                  assignment.book_id
                );
                return null;
              }

              const bookWithStatus: BookType = {
                title: book.title,
                status: assignment.passed ? "passed" : "incomplete",
                level: book.reading_level,
                quiz_id: assignment.quiz_id,
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
        </div>

        {/* right: progress card only on this page */}
        <div
          className="progressReportCard"
        >
          <h2>Progress Report</h2>
          <ProgressPieChart
            passed={passedCount}
            incomplete={incompleteCount}
          />
        </div>
      </div>

      {isGeneratingQuiz && (
        <div className="loading-message">
          <p>Please wait while we generate your quiz...</p>
        </div>
      )}
      {quizError && (
        <div className="error-message">
          <p style={{ color: "red" }}>{quizError}</p>
        </div>
      )}
    </div>
  );

}
