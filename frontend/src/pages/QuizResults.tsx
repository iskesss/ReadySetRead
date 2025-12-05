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
    const resultData = location.state
    // const quizData = resultData['quizData']
    const score = resultData['score']
    const quiz_id = resultData['quiz_id']
    const earnedCoins = 15

    const [feedback, setFeedback] = useState<string>()
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(true)


    //ON PAGE LOAD: Get and store feedback
    useEffect(() => {
        let pollCount = 0
        const maxPolls = 20 // Poll for up to 20 seconds to wait for backend

        const fetchData = async () => {
            try {
                const result = await getQuizFeedback({ quiz_id })
                if (result.feedback && result.feedback.trim() !== '') {
                    setFeedback(result.feedback)
                    setIsLoadingFeedback(false)
                    console.log("Feedback received: ", result.feedback)
                } else if (pollCount < maxPolls) {
                    // Feedback not ready yet, poll again in 1 second
                    pollCount++
                    console.log(`Feedback not ready, polling again (${pollCount}/${maxPolls})...`)
                    setTimeout(fetchData, 1000)
                } else {
                    // Give up after max polls
                    setFeedback("Feedback is still being generated. Please check back later.")
                    setIsLoadingFeedback(false)
                    console.log("Max poll attempts reached")
                }
            } catch (error) {
                console.error('Error getting feedback: ', error)
                setFeedback("Unable to load feedback at this time.")
                setIsLoadingFeedback(false)
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
                        {isLoadingFeedback ? (
                            <div className='questionFeedback'>Loading feedback...</div>
                        ) : (
                            <div className='questionFeedback'>{feedback}</div>
                        )}
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