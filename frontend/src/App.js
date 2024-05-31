import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './superuser/AuthContext';
import Login from './superuser/Login';
import Dashboard from './superuser/Dashboard';
import Register from './superuser/Register';
import CSVUpload from './superuser/upload_csv/CSVUpload';
import CsvToXmlUploader from './superuser/upload_csv_xml/CsvToXmlUploader';
import CsvToXmlRoom from './superuser/upload_csv_xml/CsvToXmlRoom'
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/csv-upload" element={<CSVUpload />} />
                    <Route path="/csv-upload-xml" element={<CsvToXmlUploader />} />
                    <Route path="/CsvToXmlRoom" element={<CsvToXmlRoom/>}/>
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

const PrivateRoute = ({ children }) => {
    const { token } = React.useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

export default App;
