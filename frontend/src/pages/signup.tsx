import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';

export default function CreateAccount() {
  const [signUpType, setSignUpType] = useState('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const idPlaceholder = signUpType === 'student' ? 'Username' : 'Email';

  function AfterSubmitClicked() {
    <Link to="/login">
        <button type="button">
            {signUpType === 'student' ? 'Sign in as Student' : 'Sign in as Parent'}
        </button>
    </Link>
    //CONNECT BACKEND HERE
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
            <button
              type="button"
              onClick={() => {
                setSignUpType('student');
              }}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => {
                setSignUpType('parent');
              }}
            >
              Parent
            </button>
          </div>

          <form
            onSubmit={(e) => {
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
              placeholder="password"
              required
            />

            <button type="submit">
              {signUpType === 'student' ? 'Sign in as Student' : 'Sign in as Parent'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}