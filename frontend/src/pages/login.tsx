import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';

// Component imports
import { Button } from "../components/button"

// Style imports
import '../styles/Login.css'


export default function LoginAccount() {
    const [loginType, setLoginType] = useState('student');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const idPlaceholder = loginType === 'student' ? 'Username' : 'Email';

    function AfterCreateAccountClicked() {
        <Link to="/signup">
            <Button>
                {loginType === 'student' ? 'Sign in as Student' : 'Sign in as Parent'}
            </Button>
        </Link>
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

                    <div className="ParentOrStudentToggle">
                        <Button onClick={() => {
                            setLoginType('student');
                        }}>
                            Student
                        </Button>

                        <Button onClick={() => {
                            setLoginType('parent');
                        }}>
                            Parent
                        </Button>
                    </div>

                    <form
                        onSubmit={() => {
                            AfterCreateAccountClicked();
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

                        <Button>
                            {loginType === 'student' ? 'Sign in as Student' : 'Sign in as Parent'}
                        </Button>
                        <Link to="/signup">
                            <Button type="button">
                                Create account instead
                            </Button>
                        </Link>
                    </form>
                </div>
            </main>
        </div>
    );
}