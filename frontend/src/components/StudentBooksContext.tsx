//not sure if we will need this i thought using reacts context feature could be helpful may end up being useless when we connect backend

import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

export type BookType = {
  title: string;
  status: 'passed' | 'incomplete';
  level: number;
};

export const StudentBooksContext = createContext<{
  studentBooks: BookType[];
  setStudentBooks: React.Dispatch<React.SetStateAction<BookType[]>>;
}>({
  studentBooks: [],
  setStudentBooks: () => {},
});

type StudentBooksProviderProps = {
  children: ReactNode;
};

export function StudentBooksProvider({ children }: StudentBooksProviderProps) {
  const [studentBooks, setStudentBooks] = useState<BookType[]>([]);
  return (
    <StudentBooksContext.Provider value={{ studentBooks, setStudentBooks }}>
      {children}
    </StudentBooksContext.Provider>
  );
}
