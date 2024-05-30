import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [suId, setSuId] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:5000/register', {
                su_id: suId,
                password: password
            });
            setSuccessMessage('User registered successfully');
        } catch (error) {
            setError('Error registering user');
            console.error('Error registering user:', error.message);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Register</h2>
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
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
                                <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>Register</button>
                            </form>
                            <p className="mt-3 text-center">Already have an account? <Link to="/login">Login here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
