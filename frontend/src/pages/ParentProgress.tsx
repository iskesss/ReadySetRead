
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/ParentProgress.css'
import '../styles/App.css'

// API imports
import { getStudents } from '../api/parents';
import type { Child } from "../api/types"

export default function ParentProgress() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Child[]>()
  const [selectedChild, setSelectedChild] = useState<Child>();

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

        <Link to="/"><button className="btn logoutBtn">Log out</button></Link>
      </div>

      <div className="contentArea">

        {/* stats & goals */}
        <div className="progressCard">
          <h1>{selectedChild?.child_name}'s Progress</h1>

          {/* assigned goals -- MUST LINK TO BACKANED HERE -- also adjust how % caluclated*/}
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


        {/* list of books -- right column --> CONNECT TO BACKEND */}
        <div className="booksCard">
          <h2> Books completed: </h2>
          <div className="bookList">
            <div className="book">Book 1</div>
            <div className="book">Book 2</div>
            <div className="book">Book 3</div>
            <div className="book">Book 4</div>
          </div>
        </div>

      </div>
    </div>
  );
}