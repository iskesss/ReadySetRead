import React, { forwardRef } from 'react'

import { Button } from './button';

import "../styles/LibraryBook.css"


type LibraryBookProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    title: string;
    status: 'passed' | 'incomplete';
    level: number;
    added: boolean;
    onAdd: () => void;
};

// Commenting out old syntax so i remember, will probably need it on the non-dummy version
// export const LibraryBook = forwardRef<HTMLButtonElement, LibraryBookProps>(({  title, status, level, onAdd ...props }, ref) => {
export const LibraryBook = forwardRef<HTMLButtonElement, LibraryBookProps>(
    ({ title, status, level, added, onAdd }) => {
        const statusClass =
            status === 'passed' ? 'passedCard' : 'incompleteCard';

        return (
            <div className={`libraryBookCard ${statusClass}`}>
                <h3>{title}</h3>
                <p>Status: {status}</p>
                <p>Level: {level}</p>
                <Button onClick={onAdd}>{added ? "Added!" : "Add"}</Button>
            </div>
        );
    }
);
