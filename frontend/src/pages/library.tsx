// import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';


// Component imports
import { Button } from "../components/button"
import { LibraryBook } from "../components/LibraryBook"

// Style imports
import '../styles/library.css'
import { useContext } from 'react';
import { StudentBooksContext } from '../components/StudentBooksContext';


type BookType ={
    title: string;
    status: 'passed' | 'incomplete';
    level: number;

};


export default function Library() {
  const { studentBooks, setStudentBooks } = useContext(StudentBooksContext);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleAddBook = (book: BookType) => {
    if (studentBooks.some(b => b.title === book.title)) {
      setError("You have already added this book.");
      return;
    }
    setStudentBooks((prev: BookType[]) => [...prev, book]);
    setError(null);
    navigate('/studentLanding');
  };

    return (
        <div className='page-background'>
            <main>
                <Link to="/">
                    <Button>
                        Go back and logout
                    </Button>
                </Link>
                {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
    
                <div className='libraryGrid'>
                    <LibraryBook
                        title='Harry Potter 1'
                        status='incomplete'
                        level={1}
                        onAdd={() => handleAddBook({title: 'Harry Potter 1', status: 'incomplete', level: 1})}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 2'
                        status='incomplete'
                        level={2}
                        onAdd={() => handleAddBook({title: 'Harry Potter 1', status: 'incomplete', level: 1})}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 3'
                        status='incomplete'
                        level={3}
                        onAdd={() => handleAddBook({title: 'Harry Potter 3', status: 'incomplete', level: 1})}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 4'
                        status='incomplete'
                        level={4}
                        onAdd={() => handleAddBook({title: 'Harry Potter 1', status: 'incomplete', level: 1})}
                    >
                    </LibraryBook>
                </div>
            </main>
        </div>

    )
}