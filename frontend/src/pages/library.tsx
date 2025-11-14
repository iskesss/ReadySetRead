// import { useState } from 'react';
import { Link } from 'react-router-dom';

// Component imports
import { Button } from "../components/button"
import { LibraryBook } from "../components/LibraryBook"

// Style imports
import '../styles/library.css'


export default function Library() {
    return (
        <div className='page-background'>
            <main>
                <Link to="/">
                    <Button>
                        Go back and logout
                    </Button>
                </Link>
                <div className='libraryGrid'>
                    <LibraryBook
                        title='Harry Potter 1'
                        status='incomplete'
                        level={1}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 2'
                        status='incomplete'
                        level={2}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 3'
                        status='incomplete'
                        level={3}
                    >
                    </LibraryBook>
                    <LibraryBook
                        title='Harry Potter 4'
                        status='incomplete'
                        level={4}
                    >
                    </LibraryBook>
                </div>
            </main>
        </div>

    )
}