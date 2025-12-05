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
import { updateQuiz, updateQuizFeedback } from '../api/quiz';

export default function Quiz() {

  const location = useLocation();
  const { quizData } = location.state as { quizData: QuizResponse };
  const { quiz_id } = location.state as { quiz_id: number }
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const [score, setScore] = useState(0);
  const [child_responses] = useState<string[]>([])

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100


  const handleAnswerClick = async (selectedOption: string) => {
    //Store student answer
    child_responses[currentQuestionIndex] = selectedOption;

    if (selectedOption == quizData.questions[currentQuestionIndex].correct_answer) {
      const newScore = score + 1;
      setScore(newScore);

      if (isLastQuestion) {
        //Wait for quiz completion data to be sent
        await sendQuizUpdate(newScore)

        //Navigate to results page once backend update is done
        console.log("Navigating to results page")
        navigate('/quizResults', {
          state: {
            quiz_id: quiz_id,
            quizData: quizData,
            score: newScore
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

  const handleNextClicked = async () => {
    const lastQuestion =
      currentQuestionIndex === quizData.questions.length - 1;

    if (lastQuestion) {
      await sendQuizUpdate(score);
      navigate('/quizResults', {
        state: {
          quizData: quizData,
          score: score,
        },
      });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResults(false);
    }
  };

  async function sendQuizUpdate(newScore: number) {
    try {
      const updateQuizPayload = {
        quiz_id: quiz_id,
        score: newScore
      }
      await updateQuiz(updateQuizPayload)
      const updateFeedbackPayload = {
        quiz_id: quiz_id,
        quiz_questions: quizData,
        child_responses: child_responses
      }
      console.log("Updating quiz feedback")
      await updateQuizFeedback(updateFeedbackPayload)
      console.log("Updated quiz feedback")
    } catch (error) {
      console.log("Error sending quiz results to backend: ", error)
    }
  }

  return (
    <div className='page-background'>
      <div className='layout-box'>
        <Link to='/studentLanding'>
          <Button>
            Quit
          </Button>
        </Link>
        <div className='quiz-progress-bar'>
          <div
            className='quiz-progress-fill'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='card quiz-question-box'>
          <h1>Question {currentQuestionIndex + 1} of{" "}{quizData.questions.length}</h1>
          {!showResults && <p>{currentQuestion.question}</p>}
          {showResults &&
            <div style={{ backgroundColor: 'lightpink', padding: '1rem', borderRadius: '6px' }}>
              <h1>Incorrect!</h1>
              <p>{currentQuestion.explanation}</p>
            </div>
          }
        </div>

        <div className='answer-container'>
          {!showResults && currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              className='answer-button'
              onClick={() => handleAnswerClick(option)}
            >
              {option}
            </Button>
          ))}

          {showResults && (
            <Button
              className='answer-button'
              onClick={handleNextClicked}
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
