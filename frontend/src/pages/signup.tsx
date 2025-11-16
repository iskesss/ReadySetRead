import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png';

//API imports
import { signupParent } from '../api/parents';
import { signupStudent } from '../api/students';

//Component imports
import { Button } from "../components/button.tsx"

//Style imports
import '../styles/Signup.css'
import '../styles/App.css'

export default function CreateAccount() {
  const [signUpType, setSignUpType] = useState('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const idPlaceholder = signUpType === 'student' ? 'Username' : 'Email';

  async function AfterSubmitClicked() {
    setError('');
    setLoading(true);

    try {
      if (signUpType === 'student') {
        // For students, we need to prompt for parent email
        const parentEmail = prompt('Enter your parent\'s email:');
        if (!parentEmail) {
          setError('Parent email is required for student accounts');
          setLoading(false);
          return;
        }

        await signupStudent({
          child_name: id,
          password,
          adult_email: parentEmail,
        });

        navigate('/studentLanding');
      }
      else {
        // Parent signup
        await signupParent({
          adult_email: id,
          password,
        });

        navigate('/parentLanding');
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  // PAGE STRUCTURE CODE
  return (
    <div className="page-background">
      <div className="logo-container">
        <img src={logo} className="logo" alt="Logo" />
      </div>

      <main>
        <div className="card">
          <h1 className="header">Create Account</h1>
          <p className="subheader">Select your login type:</p>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <div className="ParentOrStudentToggle">
            <Button onClick={() => {
              setSignUpType('student');
            }}>
              Student
            </Button>

            <Button onClick={() => {
              setSignUpType('parent');
            }}>
              Parent
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              AfterSubmitClicked();
            }}
          >
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={idPlaceholder}
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={signUpType === 'student' ? 4 : 8}
            />
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Creating Account...'
                : signUpType === 'student' ? 'Create a Student Account' : 'Create a Parent Account'}
            </Button>
            <Link to="/">
              <Button type="button">
                Log In instead
              </Button>
            </Link>

          </form>
        </div>
      </main>
    </div>
  );
}