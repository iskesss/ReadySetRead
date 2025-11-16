
import { Link } from 'react-router-dom';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/App.css'

//CONNECT TO BACKEND: THE PARENT NAME
export default function PHStudentLandingPage() {

    return (

        //CONNECT TO BACKEND:CHILDREN NAME(S) & # cards displayed (edge case to add child?)
        //must also add links to each specific child's progress page

        <div className='parentLandingContainer'>

            <div className='header'>
                <h1>Temporary student landing page</h1>
                <p>{localStorage.getItem('token')}</p>
                <Link to="/">
                    <Button>
                        Log out
                    </Button>
                </Link>
                <Link to="/quiz">
                    <Button>
                        Take Quiz
                    </Button>
                </Link>
                <Link to="/library">
                    <Button>
                        Library
                    </Button>
                </Link>
            </div>
        </div>
    );
}