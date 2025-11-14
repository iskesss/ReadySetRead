import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';

//Component imports
import { Button } from "../components/button.tsx"

//Style imports
import '../styles/Signup.css'
import '../styles/App.css'

export default function CreateAccount() {
  const [signUpType, setSignUpType] = useState('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const idPlaceholder = signUpType === 'student' ? 'Username' : 'Email';

  function AfterSubmitClicked() {
    <Link to="/login">
      <button type="button" className='btn'>
        {signUpType === 'student' ? 'Sign in as Student' : 'Sign in as Parent'}
      </button>
    </Link>
  }

  return (
    <div className="page-background">
      <div className="logo-container">
        <img src={logo} className="logo" alt="Logo" />
      </div>

      <main>
        <div className="card">
          <h1 className="header">Create Account</h1>
          <p className="subheader">Select your login type:</p>

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
            />

            <Button
              type="submit"
              onClick={() => {
                setSignUpType('parent');
              }
              }>
              {signUpType === 'student' ? 'Create a Student Account' : 'Create a Parent Account'}
            </Button>
            <Link to="/">
              <Button type="button">
                Log In instead
              </Button>
            </Link>

            {/* TEMMPORARY BUTTON TO NAVIGATE AND TEST LIBRARY PAGE */}
            <Link to="/library">
              <Button>
                Library
              </Button>
            </Link>

          </form>
        </div>
      </main>
    </div>
  );
}