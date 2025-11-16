
import { Link } from 'react-router-dom';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/ParentLanding.css'
import '../styles/App.css'

//CONNECT TO BACKEND: THE PARENT NAME
function Greeting({ parentName }: { parentName: string }) {
  return <h1> Welcome, {parentName}!</h1>;
}

export default function ParentLandingPage() {

  return (


    //CONNECT TO BACKEND:CHILDREN NAME(S) & # cards displayed (edge case to add child?)
    //must also add links to each specific child's progress page

    <div className='parentLandingContainer'>

      <div className='header'>
        <Link to="/">
          <Button className="btn logoutBtn">
            Log out
          </Button>
        </Link>

        <Greeting parentName="Mimi" />
        <p>{localStorage.getItem('token')}</p>
      </div>

      <div className="card studentCard">
        <div className='childName'> Lilly </div>
        <Button className=' btn viewProgress'> View Progress </Button>
      </div>


      <div className="card studentCard">
        <div className='childName'> Abraham </div>
        <Button className=' btn viewProgress'> View Progress </Button>
      </div>


      <div className="card studentCard">
        <div className='childName'> Kit </div>
        <Button className='btn viewProgress'> View Progress </Button>
      </div>


    </div>
  );
}