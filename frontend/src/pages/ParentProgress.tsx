
import {useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/ParentProgress.css'
import '../styles/App.css'

// API imports
import { getStudents } from '../api/parents';
import { listAllQuizAssignments } from '../api/students';
import { getAllBooks } from '../api/books'
import type { Child, Book, Assignment } from "../api/types"

export default function ParentProgress() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Child[]>()
  const [selectedChild, setSelectedChild] = useState<Child>();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookAssignments, setBookAssignments] = useState<Assignment[]>([])

  // ON PAGE LOAD: Get this parent's kids
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStudents()
        setStudents(result)
      } catch (error) {
        console.error('Error getting list of students: ', error)
      }
    }
    fetchData()
  }, []);

  // ON PAGE LOAD: Set first student as default
  useEffect(() => {
    if (students && students.length > 0)
      setSelectedChild(students[0])
  }, [students]);

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

  // ON selectedChild UPDATE: Get this student's book assignments
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedChild?.child_id != null) {
          const result = await listAllQuizAssignments(selectedChild.child_id)
          setBookAssignments(result)
        }
      } catch (error) {
        console.error('Error getting list of student quiz assignments: ', error)
      }
    }
    fetchData()
  }, [selectedChild])

  async function navToLibrary() {
    if (!selectedChild) return;
    sessionStorage.setItem('targetStudentId', JSON.stringify(selectedChild.child_id));
    sessionStorage.setItem('meType', JSON.stringify('parent'));
    navigate('/library');
  }

  return (
    <div className='parentProgressContainer'>

      {/* top row */}
      <div className='headerButtons'>

        <div className="childTabs">
          {students?.map(child => {
            return (
              <button
                key={child.child_id}
                className={`childTab ${selectedChild === child ? "onChildTab" : ""}`}
                onClick={() => setSelectedChild(child)}
              >
                {child.child_name}
              </button>
            );
          })}
        </div>

      </div>

      <div className="contentArea">

        {/* stats & goals */}
        <div className="progressCard">
          <h1>{selectedChild?.child_name}'s Progress</h1>

          {/* assigned goals -- MUST LINK TO BACKEND HERE -- also adjust how % caluclated*/}
          <div className="goalRow">
            <span>Goal 1:</span>
            <div className="progressBar">
              <div className="progressBarFill" style={{ width: "50%" }} />
            </div>
          </div>

          <div className="goalRow">
            <span>Goal 2:</span>
            <div className="progressBar">
              <div className="progressBarFill" style={{ width: "70%" }} />
            </div>
          </div>

          <div className="goalRow">
            <span>Goal 3:</span>
            <div className="progressBar">
              <div className="progressBarFill" style={{ width: "20%" }} />
            </div>
          </div>

          {/* Adding goals or assigning books feature -- LINK TO OTHER pages HERE */}
          <div className="goalButtons">
            <Button>Add goal</Button>
            <Button onClick={navToLibrary}>Assign a book</Button>
          </div>

          {/* LINK to backend for stats for each kid  */}
          <div className="summarizedStats">
            <h3> Overall stats </h3>
            <p> Total completed: 0 </p>
            <p> Coins: 0 </p>
          </div>
        </div>

        <div className="booksCard">
          <h2> Books completed: </h2>
          <div className="bookList">
            {bookAssignments.map(assignment => {
              // Find the corresponding book using book_id
              // book.book_id is a string, assignment.book_id is a number
              const book = books?.find(b => parseInt(b.book_id) === assignment.book_id);

              if (!book) {
                console.log('No book found for assignment book_id:', assignment.book_id);
                return null;
              }

              // build the combined book object
              const bookWithStatus = {
                title: book.title,
                status: assignment.passed ? 'passed' : 'incomplete',
                level: book.reading_level
              };

              return (
                <div className="book">
                  <p><b>Title:</b> {bookWithStatus.title} </p>
                  <p><b>Reading Level:</b> {bookWithStatus.level} </p>
                  <p><b>Status:</b> {bookWithStatus.status} </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}