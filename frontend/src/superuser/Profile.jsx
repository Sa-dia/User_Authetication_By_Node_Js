import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = ({ token }) => {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:5000/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfileData(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error.message);
                // Handle error, redirect to login or show error message
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    return (
        <div>
            <h2>Profile</h2>
            {profileData ? (
                <div>
                    <p>Super User ID: {profileData.user.su_id}</p>
                    <p>Message: {profileData.message}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;
