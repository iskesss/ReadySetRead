import { Link } from 'react-router-dom';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/App.css'
import '../styles/Quiz.css'


export default function Quiz() {

    return (
        <div className='page-background'>
            <Link to="/studentLanding">
                <Button>
                    Quit
                </Button>
            </Link>
            <div className='card quiz-question-box'>
                <h1>Question 1</h1>
                <p> How many bears were there in the Goldilocks book?</p>
            </div>
            <div className='answer-container'>
                <Button>Option 1</Button>
                <Button>Option 2</Button>
                <Button>Option 3</Button>
                <Button>Option 4</Button>
            </div>
            <main>
            </main>
        </div>
    )
}