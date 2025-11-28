// import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


// Component imports
import { Button } from "../components/button"
import { LibraryBook } from "../components/LibraryBook"

// Style imports
import '../styles/library.css'

// API imports
import type { Book } from "../api/types"
import { getAllBooks, createAssignment } from '../api/books';


export default function Library() {
    const navigate = useNavigate()
    const [books, setBooks] = useState<Book[]>([]);
    const [targetStudentId, setTargetStudentId] = useState<number | null>(null);
    const [meType, setMeType] = useState<string | null>(null);
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
            } catch (error) {
                console.error("Error with books api call", error);
                setError(String(error));
            }
        }
        fetchData()
    }, [])

    const handleAddBook = (book_id: number) => {
        const postToDB = async () => {
            if (targetStudentId === null) {
                console.error("No student selected");
                return;
            }
            try {
                const result = await createAssignment({ child_id: targetStudentId, book_id: book_id })
                return result;
            } catch (error) {
                setError(String(error))
            }
        }
        const response = postToDB()
        console.log("Success?? : ", response) //To see if it worked before we get the full stack functionality
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
                <Link to="/">
                    <Button onClick={backClicked}>
                        Go back
                    </Button>
                </Link>
                {error && (
                    <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
                        {error}
                    </div>
                )}

                <div className='libraryGrid'>
                    {books.map((option) => (
                        <LibraryBook
                            title={option.title}
                            status='incomplete' // need a different route to handle this
                            level={option.reading_level}
                            onAdd={() => handleAddBook(Number(option.book_id))}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};