import React, { useState, useEffect } from 'react';
import FunderService from '../../services/funder.service';
import AuthService from '../../services/auth.service';

const FunderProfileForm = () => {
    const [profile, setProfile] = useState({
        organizationName: '',
        funderType: '',
        website: '',
        contactEmail: '',
        fundingAreas: '',
        grantSizeRange: '',
        eligibilitySummary: '',
        applicationPortalLink: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isFunder, setIsFunder] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'funder') {
            setIsFunder(true);
            setLoading(true);
            FunderService.getMyProfile().then(
                (response) => {
                    if (response.data.profile) {
                        setProfile(response.data.profile);
                    } else {
                         setProfile(prev => ({ ...prev, contactEmail: currentUser.email }));
                    }
                    setLoading(false);
                },
                (error) => {
                    const resMessage = (error.response?.data?.message) || error.message || error.toString();
                    setError("Error loading profile: " + resMessage);
                    setLoading(false);
                }
            );
        } else {
             setError("Access denied. Only Funders can edit this profile.");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        FunderService.updateMyProfile(profile).then(
            (response) => {
                setMessage(response.data.message);
                setProfile(response.data.profile);
                setLoading(false);
            },
            (error) => {
                const resMessage = (error.response?.data?.message) || error.message || error.toString();
                setError("Error saving profile: " + resMessage);
                setLoading(false);
            }
        );
    };

    if (!isFunder) {
        return <div>{error || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>Funder Profile</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSave}>
                <div><label>Organization Name *</label><input type="text" name="organizationName" value={profile.organizationName || ''} onChange={handleChange} required /></div>
                <div><label>Funder Type</label><input type="text" name="funderType" value={profile.funderType || ''} onChange={handleChange} placeholder="e.g., Foundation, Government" /></div>
                <div><label>Website</label><input type="url" name="website" value={profile.website || ''} onChange={handleChange} /></div>
                <div><label>Contact Email</label><input type="email" name="contactEmail" value={profile.contactEmail || ''} onChange={handleChange} /></div>
                <div><label>Funding Areas (comma-separated)</label><input type="text" name="fundingAreas" value={profile.fundingAreas || ''} onChange={handleChange} /></div>
                <div><label>Typical Grant Size/Range</label><input type="text" name="grantSizeRange" value={profile.grantSizeRange || ''} onChange={handleChange} placeholder="e.g., $10k-$50k" /></div>
                <div><label>Eligibility Summary</label><textarea name="eligibilitySummary" value={profile.eligibilitySummary || ''} onChange={handleChange}></textarea></div>
                <div><label>Main Application Portal Link</label><input type="url" name="applicationPortalLink" value={profile.applicationPortalLink || ''} onChange={handleChange} /></div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default FunderProfileForm;
