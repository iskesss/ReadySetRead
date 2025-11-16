
import { Link } from 'react-router-dom';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/ParentProgress.css'
import '../styles/App.css'


export default function ParentProgress() {
  
  //CONNECT TO BACKEND:CHILDREN NAME(S) & # cards displayed (edge case to add child?)
  const children = ["Lilly", "Abraham", "Kit"];
  const selectedChild = "Lilly"; 

  return (
    <div className='parentProgressContainer'> 

      {/* top row */}
      <div className='headerButtons'>
       
        <div className="childTabs">
          {children.map(child => {
          const isActive = selectedChild === child;
          return (
            <button key={child} className={`childTab ${isActive ? "onChildTab" : ""}`} >
              {child}
            </button>
          );})}
        </div>

        <Link to="/"><button className="btn logoutBtn">Log out</button></Link>
      </div>

      <div className="contentArea">

        {/* stats & goals */}
        <div className="progressCard">
          <h1>{selectedChild}'s Progress</h1>
      
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

          {/* Adding goals or assigning books feature -- LINK TO OTHER PGs HERE */}
          <div className="goalButtons">
            <Button>Add goal</Button>
            <Button>Assign a book</Button>
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