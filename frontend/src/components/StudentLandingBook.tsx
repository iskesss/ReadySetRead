import {Button} from '../components/button';
import '../styles/library.css'
type Props = {
  title: string;
  status: 'passed' | 'incomplete';
  level: number;
  onTakeQuiz: () => void;
  isGeneratingQuiz?: boolean;
};

export default function StudentLandingBook({
  title,
  status,
  level,
  onTakeQuiz,
  isGeneratingQuiz,
}: Props) {
  const statusClass =
    status === 'passed' ? 'passedCard' : 'incompleteCard';

  return (
    <div className={`libraryBookCard ${statusClass}`}>
      <h3>{title}</h3>
      <p>Status: {status}</p>
      <p>Level: {level}</p>
      <Button
        onClick={onTakeQuiz}
        disabled={isGeneratingQuiz || status === 'passed'}
      >
        {status === 'passed' ? 'Quiz Passed' : 'Take Quiz'}
      </Button>
    </div>
  );
  
}


