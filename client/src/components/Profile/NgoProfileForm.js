import React, { useState, useEffect } from 'react';
import NgoService from '../../services/ngo.service';
import AuthService from '../../services/auth.service'; // To check role

const NgoProfileForm = () => {
    const [profile, setProfile] = useState({
        ngoName: '',
        location: '',
        contactEmail: '',
        website: '',
        mission: '',
        vision: '',
        impactAreas: '',
        registrationDetails: '',
        teamSize: '',
        budgetRange: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isNgoAdmin, setIsNgoAdmin] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'ngo_admin') {
            setIsNgoAdmin(true);
            setLoading(true);
            NgoService.getMyProfile().then(
                (response) => {
                    if (response.data.profile) {
                        setProfile(response.data.profile);
                    } else {
                        // Pre-fill contact email from user if profile is new
                        setProfile(prev => ({ ...prev, contactEmail: currentUser.email }));
                    }
                    setLoading(false);
                },
                (error) => {
                    const resMessage =
                        (error.response && error.response.data && error.response.data.message) ||
                        error.message || error.toString();
                    setMessage("Error loading profile: " + resMessage);
                    setLoading(false);
                }
            );
        } else {
             setMessage("Access denied. Only NGO Admins can edit this profile.");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        NgoService.updateMyProfile(profile).then(
            (response) => {
                setMessage(response.data.message);
                setProfile(response.data.profile); // Update state with potentially updated/created profile data
                setLoading(false);
            },
            (error) => {
                const resMessage =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setMessage("Error saving profile: " + resMessage);
                setLoading(false);
            }
        );
    };

    if (!isNgoAdmin) {
        return <div>{message || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>NGO Profile</h2>
            {loading && <p>Loading...</p>}
            <form onSubmit={handleSave}>
                <div>
                    <label htmlFor="ngoName">NGO Name *</label>
                    <input type="text" name="ngoName" value={profile.ngoName || ''} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="location">Location</label>
                    <input type="text" name="location" value={profile.location || ''} onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="contactEmail">Contact Email</label>
                    <input type="email" name="contactEmail" value={profile.contactEmail || ''} onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="website">Website</label>
                    <input type="url" name="website" value={profile.website || ''} onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="mission">Mission</label>
                    <textarea name="mission" value={profile.mission || ''} onChange={handleChange}></textarea>
                </div>
                 <div>
                    <label htmlFor="vision">Vision</label>
                    <textarea name="vision" value={profile.vision || ''} onChange={handleChange}></textarea>
                </div>
                 <div>
                    <label htmlFor="impactAreas">Impact Areas (comma-separated)</label>
                    <input type="text" name="impactAreas" value={profile.impactAreas || ''} onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="registrationDetails">Registration Details / Tax ID</label>
                    <textarea name="registrationDetails" value={profile.registrationDetails || ''} onChange={handleChange}></textarea>
                </div>
                 <div>
                    <label htmlFor="teamSize">Team Size</label>
                    <input type="text" name="teamSize" value={profile.teamSize || ''} placeholder="e.g., 1-10, 11-50" onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="budgetRange">Annual Budget Range</label>
                    <input type="text" name="budgetRange" value={profile.budgetRange || ''} placeholder="e.g., <$50k, $50k-$250k" onChange={handleChange} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default NgoProfileForm;
