import React, { forwardRef } from 'react'

import { Button } from './button';

import "../styles/LibraryBook.css"


type LibraryBookProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    title: string;
    status: string;
    level: number;
};

// Commenting out old syntax so i remember, will probably need it on the non-dummy version
// export const LibraryBook = forwardRef<HTMLButtonElement, LibraryBookProps>(({ children, title, status, level, ...props }, ref) => {
export const LibraryBook = forwardRef<HTMLButtonElement, LibraryBookProps>(({ title, status, level }) => {
    return (
        <div className='libraryBookCard'>
            <h3>{title}</h3>
            <p>Status: {status}</p>
            <p>Level: {level}</p>
            <Button>
                Add
            </Button>
        </div>
    );
})