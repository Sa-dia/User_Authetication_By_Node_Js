import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
    const [suId, setSuId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                su_id: suId,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const token = response.data.token;
            setToken(token);
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                console.error('Server responded with status code:', error.response.status);
                console.error('Response data:', error.response.data);
            } else {
                console.error('Error logging in:', error.message);
            }
            setError('Invalid email or password');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Login</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form>
                                <div className="form-group">
                                    <label>Super User ID</label>
                                    <input type="text" className="form-control" value={suId} onChange={(e) => setSuId(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <button type="button" className="btn btn-primary btn-block" onClick={handleLogin}>Login</button>
                            </form>
                            <p className="mt-3 text-center">Don't have an account? <Link to="/register">Register here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
