import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/button';
import '../styles/App.css';
import '../styles/QuizResults.css';

export default function QuizResults() {

    const location = useLocation();

    {/*CONNECT TO BACKEND */}
    const resultData = location.state || { score: 7, totalQuestions: 9 };
    const earnedCoins = 15;

    return (
        <div className='quizResultsPageBkgd'>
            <div className='outer-container'>
                
                <div className='quizSection'>
                    <div className='header'>
                        <h1>Quiz Complete!</h1>
                        <div className='scoreCircle'>
                            {/*CONNECT TO BACKEND */}
                            Your score: {resultData.score}/10
                        </div>
                    </div>

                    <h3>Incorrect answers:</h3>

                    {/*CONNECT TO BACKEND FOR INCORRECT Qs */}
                    <div className='incorrect-list-container'>
                        <div className='questionRow'>
                            <div className='questionNumber'>Q3</div>
                            <div className='questionFeedback'>Recall that photosynthesis requires sunlight...</div>
                        </div>
                        <div className='questionRow'>
                            <div className='questionNumber'>Q5</div>
                            <div className='questionFeedback'>The capital of France is Paris, not Nice.</div>
                        </div>
                         <div className='questionRow'>
                            <div className='questionNumber'>Q8</div>
                            <div className='questionFeedback'>7 x 8 is 56.</div>
                        </div>
                    </div>

                    <div className='buttonRow'>
                        <Link to='/studentLanding'>
                            <Button>Back to Home</Button>
                        </Link>
                        <Link to='/studentLanding'>
                            <Button>Try Again</Button>
                        </Link>
                        <Link to='/rewards'>
                            <Button>Store</Button>
                        </Link>
                    </div>
                </div>
                
                <div className='rightColumn'>
                    <div className='earnings-card'>
                        <div className='earnings-header'>Earnings:</div>
                        
                        {/*CONNECT TO BACKEND for correct answers */}
                        <div className='statsItem'>
                            <span>Correct Answers:</span>
                            <span>{resultData.score}</span>
                        </div>

                        <div className='coinDisplay'>
                            <p>You earned</p>
                            <div className='coinBubble'>{earnedCoins} </div>
                            <p>coins!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}