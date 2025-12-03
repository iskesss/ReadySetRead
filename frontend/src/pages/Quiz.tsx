import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/App.css'
import '../styles/Quiz.css'

// API imports
import type { QuizResponse } from '../api/types';


export default function Quiz() {

    const location = useLocation();
    const { quizData } = location.state as { quizData: QuizResponse };
    const navigate = useNavigate();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1

    const handleAnswerClick = (selectedOption: string) => {
        if (selectedOption == quizData.questions[currentQuestionIndex].correct_answer) {
            const newScore = score + 1;
            setScore(newScore);

            if (isLastQuestion) {
                navigate('/quizResults', {
                    state: {
                        quizData: quizData,
                        score: newScore  // Use the new score here
                    }
                })
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
        }
        else {
            setShowResults(true);
        }
    }

    const handleNextClicked = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowResults(false)
    }

    return (
        <div className='page-background'>
            <div className='layout-box'>

                <Link to="/studentLanding">
                    <Button>
                        Quit
                    </Button>
                </Link>
                <div className='card quiz-question-box'>
                    <h1>Question {currentQuestionIndex + 1} of {quizData.questions.length}</h1>
                    {!showResults &&
                        <p>{currentQuestion.question}</p>
                    }
                    {showResults &&
                        <p>{currentQuestion.explanation}</p>
                    }
                </div>
                <div className='answer-container'>
                    {!showResults && currentQuestion.options.map((option, index) => (
                        <Button
                            key={index}
                            onClick={() => handleAnswerClick(option)}
                        >
                            {option}
                        </Button>
                    ))}
                    {showResults &&
                        <Button onClick={() => handleNextClicked()}>
                            Next Question
                        </Button>

                    }
                </div>
            </div>
        </div>
    )
}