import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png';

//API imports
import { loginParent } from '../api/parents';
import { loginStudent } from '../api/students';

// Component imports
import { Button } from "../components/button"

// Style imports
import '../styles/Login.css'

export default function LoginAccount() {
    const [loginType, setLoginType] = useState('student');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const idPlaceholder = loginType === 'student' ? 'Username' : 'Email';

    async function AfterSubmitClicked() {
        setError('');
        setLoading(true);

        try {
            if (loginType === 'student') {
                await loginStudent({
                    child_name: id,
                    password
                });

                navigate('/studentLanding');
            }
            else {
                // Parent login
                await loginParent({
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

    return (
        <div className="page-background">
            <div className="logo-container">
                <img src={logo} className="logo" alt="Logo" />
            </div>

            <main>
                <div className="card">
                    <h1 className="header">Sign In</h1>
                    <p className="subheader">Select your login type:</p>

                    {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

                    <div className="ParentOrStudentToggle">
                        <Button 
                            className={loginType == 'student' ? 'role-selected' : ''}
                            onClick = {() => setLoginType('student')}
                        >
                            Student
                        </Button>

                        <Button  
                            className={loginType === 'parent' ? 'role-selected' : ''}
                            onClick={() => setLoginType('parent')}
                        >
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
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? 'Logging in...'
                                : loginType === 'student' ? 'Login as student' : 'Login as Parent'}
                        </Button>
                        <Link to="/signup">
                            <Button type="button">
                                Create Account Instead
                            </Button>
                        </Link>
                    </form>
                </div>
            </main>
        </div>
    );
}