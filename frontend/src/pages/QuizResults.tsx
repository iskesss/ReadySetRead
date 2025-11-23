import { Link, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/App.css'
import '../styles/QuizResults.css'

// API imports

export default function QuizResults() {

    const location = useLocation();
    const resultData = location.state;
    // const navigate = useNavigate();

    return (
        <div className='page-background'>
            <main>
                <h1>Quiz Complete!</h1>
                <h3>Your score: {resultData.score}</h3>
                <div className='card'>Incorrect answers:</div>
                <div className='button-container'>
                    <Link to='/studentLanding'>
                        <Button>
                            Back to Home
                        </Button>
                    </Link>
                    <Link to='/studentLanding'>
                        <Button>
                            Try Again
                        </Button>
                    </Link>
                    <Link to='/rewards'>
                        <Button>
                            Go to Store
                        </Button>
                    </Link>
                </div>
            </main>
            <aside>
                <div className='card'>
                    <h2>Rewards breakdown:</h2>

                    <p>Line 1</p>
                    <p>Line 2</p>
                    <p>Line 3</p>
                </div>
            </aside>
        </div>

    )
}