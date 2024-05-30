import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const response = await axios.post('http://localhost:5000/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccessMessage('CSV data uploaded successfully!');
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setError('Failed to upload CSV file.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Upload CSV</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Select CSV file:</label>
                                    <input type="file" className="form-control-file" onChange={handleFileChange} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Upload</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSVUpload;
