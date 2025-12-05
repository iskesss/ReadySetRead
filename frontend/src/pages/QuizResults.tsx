import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/button';
import '../styles/App.css';
import '../styles/QuizResults.css';
import { useEffect, useState } from 'react';

//api imports
import { getQuizFeedback } from '../api/quiz';
// import type { QuizFeedbackResponse } from '../api/types';

export default function QuizResults() {

    const location = useLocation();

    //Receive state data from the quiz page
    const resultData = location.state //TODO: Will, check what is being passed in state
    // const quizData = resultData['quizData']
    const score = resultData['score']
    const quiz_id = resultData['quiz_id']
    const earnedCoins = 15

    const [feedback, setFeedback] = useState<string>()


    //ON PAGE LOAD: Get and store feedback
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getQuizFeedback({ quiz_id })
                setFeedback(result.feedback)
            } catch (error) {
                console.error('Error getting feedback: ', error)
            }
        }
        fetchData()
    }, [quiz_id])



    return (
        <div className='quizResultsPageBkgd'>
            <div className='outer-container'>

                <div className='quizSection'>
                    <div className='header'>
                        <h1>Quiz Complete!</h1>
                        <div className='scoreCircle'>
                            {/*CONNECT TO BACKEND */}
                            Your score: {score}/10
                        </div>
                    </div>

                    {/* <h3>Incorrect answers:</h3>

                    
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
                    </div> */}

                    <h3>Feedback:</h3>

                    <div className='incorrect-list-container'>

                        <div className='questionFeedback'>{feedback}</div>
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

                        {/*CONNECT TO BACKEND for coins earned */}
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