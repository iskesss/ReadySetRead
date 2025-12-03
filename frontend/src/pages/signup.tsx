import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png';

import { signupParent } from '../api/parents';
import { signupStudent } from '../api/students';

import { Button } from "../components/button.tsx"

import '../styles/Signup.css'
import '../styles/App.css'

export default function CreateAccount() {
  const [signUpType, setSignUpType] = useState('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const idPlaceholder = signUpType === 'student' ? 'Username' : 'Email';

  async function AfterSubmitClicked() {
    setError('');
    setLoading(true);

    try {
      if (signUpType === 'student') {
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
      } else {
        if (!parentName) {
          setError('Parent name is required');
          setLoading(false);
          return;
        }

        await signupParent({
          adult_email: id,
          password,
          adult_name: parentName,
        });

        navigate('/parentLanding');
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-background">
      <img src={logo} className="logo" alt="Logo" />

      <div className="card">
        <h1>Create Account</h1>
        <p>Select your login type:</p>

        <div className="ParentOrStudentToggle">
          <Button
            className={signUpType === 'student' ? 'active' : ''}
            onClick={() => setSignUpType('student')}
          >
            Student
          </Button>
          <Button
            className={signUpType === 'parent' ? 'active' : ''}
            onClick={() => setSignUpType('parent')}
          >
            Parent
          </Button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); AfterSubmitClicked(); }}>
          {signUpType === 'parent' && (
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Parent Name"
              required
            />
          )}
          {signUpType === 'student' && (
            <input
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="Parent Email"
              required
            />
          )}
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={signUpType === 'student' ? "Username" : "Email"}
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
            {signUpType === 'student' ? "Create Student Account" : "Create Parent Account"}
          </Button>
          <Link to="/"><Button type="button">Log In instead</Button></Link>
        </form>
      </div>
    </div>
  );
}