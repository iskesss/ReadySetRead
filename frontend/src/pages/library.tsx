// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


// Component imports
import { Button } from "../components/button"
import { LibraryBook } from "../components/LibraryBook"

// Style imports
import '../styles/library.css'

// API imports
import type { Book, Assignment } from "../api/types"
import { getAllBooks, createAssignment } from '../api/books';
import { listAllQuizAssignments } from '../api/students';


export default function Library() {
    const navigate = useNavigate()
    const [books, setBooks] = useState<Book[]>([]);
    const [studentAssignments, setStudentAssignments] = useState<Assignment[]>([])
    const [targetStudentId, setTargetStudentId] = useState<number | null>(null);
    const [meType, setMeType] = useState<string | null>(null);
    const [added, setAdded] = useState<boolean[]>([]);
    // const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    // const location = useLocation();

    //ON PAGE LOAD: Get context about who we are and what student account we are targeting
    useEffect(() => {
        const meTypeStr = JSON.parse(sessionStorage.getItem('meType') || 'null');
        setMeType(meTypeStr);
        console.log(meType)
        const targetStudentIdNum = JSON.parse(sessionStorage.getItem('targetStudentId') || 'null');
        setTargetStudentId(targetStudentIdNum);
    }, [meType])

    //ON PAGE LOAD: add all books
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllBooks();
                console.log("Successfully retrieved all books");
                setBooks(result);
                // initialize added array to false
                setAdded(new Array(result.length).fill(false));
            } catch (error) {
                console.error("Error with books api call", error);
                setError(String(error));
            }
        }
        fetchData()
    }, [])

    // ON PAGE LOAD: get the target student's assignments so we can get statuses
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (targetStudentId) {
                    const result = await listAllQuizAssignments(targetStudentId)
                    setStudentAssignments(result)
                }
            } catch (error) {
                console.error('Error getting quiz assignments: ', error)
            }
        }
        fetchData()
    }, [targetStudentId])

    const handleAddBook = (book_id: number, index: number) => {
        const postToDB = async () => {
            if (targetStudentId === null) {
                console.error("No student selected");
                return;
            }
            try {
                const result = await createAssignment({ child_id: targetStudentId, book_id: book_id })
                console.log(result)
                // Update the added array to trigger re render
                setAdded(prev => {
                    const newAdded = [...prev];
                    newAdded[index] = true;
                    return newAdded;
                });
            } catch (error) {
                setError(String(error))
                return
            }
        }
        postToDB()
    }

    const backClicked = () => {
        if (meType == 'parent') {
            navigate('/parentProgress')
        }
        if (meType == 'student') {
            navigate('/studentLanding')
        }
    }

    return (
        <div className='page-background'>
            <main>
                <Button onClick={backClicked}>
                    Go back
                </Button>
                {error && (
                    <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
                        {error}
                    </div>
                )}

                <div className='libraryGrid'>
                    {books.map((option, index) => {
                        // Find matching assignment to derive status
                        const assignment = studentAssignments.find(
                            (a) => a.book_id === Number(option.book_id)
                        );
                        const status = assignment
                            ? (assignment.passed ? 'passed' : 'incomplete')
                            : 'unassigned';

                        return (
                            <LibraryBook
                                key={option.book_id}
                                title={option.title}
                                status={status}
                                level={option.reading_level}
                                added={added[index]}
                                onAdd={() => handleAddBook(Number(option.book_id), index)}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
};