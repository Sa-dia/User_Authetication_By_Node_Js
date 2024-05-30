import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">Dashboard</h1>
                </div>
                <div className="card-body">
                    <p className="card-text">Your token is: {token}</p>
                    <ul className="list-group mb-3">
                        <li className="list-group-item"><Link to="/csv-upload">Upload CSV</Link></li>
                        <li className="list-group-item"><Link to="/csv-upload-xml">Upload CSV to XML</Link></li>
                    </ul>
                    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
