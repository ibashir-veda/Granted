import React, { useState, useEffect } from 'react';
import ProviderService from '../../services/provider.service';
import AuthService from '../../services/auth.service';

const ProviderProfileForm = () => {
    const [profile, setProfile] = useState({
        companyName: '',
        serviceType: '',
        website: '',
        contactEmail: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isProvider, setIsProvider] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'service_provider') {
            setIsProvider(true);
            setLoading(true);
            ProviderService.getMyProfile().then(
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
             setError("Access denied. Only Service Providers can edit this profile.");
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

        ProviderService.updateMyProfile(profile).then(
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

    if (!isProvider) {
        return <div>{error || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>Service Provider Profile</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSave}>
                <div><label>Company Name *</label><input type="text" name="companyName" value={profile.companyName || ''} onChange={handleChange} required /></div>
                <div><label>Type of Service/Software</label><input type="text" name="serviceType" value={profile.serviceType || ''} onChange={handleChange} placeholder="e.g., CRM, Accounting, Cloud" /></div>
                <div><label>Website</label><input type="url" name="website" value={profile.website || ''} onChange={handleChange} /></div>
                <div><label>Contact Email</label><input type="email" name="contactEmail" value={profile.contactEmail || ''} onChange={handleChange} /></div>
                <div><label>Company/Service Description</label><textarea name="description" value={profile.description || ''} onChange={handleChange}></textarea></div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProviderProfileForm;
