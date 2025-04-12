import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const CreateFundingOpportunity = () => {
    const [formData, setFormData] = useState({
        title: '',
        funderName: '',
        description: '',
        fundingAmountRange: '',
        eligibilityCriteria: '',
        applicationDeadline: '',
        applicationLink: '',
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

     useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Convert empty deadline string to null before sending
        const dataToSend = {
            ...formData,
            applicationDeadline: formData.applicationDeadline || null
        };


        AdminService.createFundingOpportunity(dataToSend).then(
            (response) => {
                setMessage(response.data.message);
                setLoading(false);
                // Clear form or redirect
                setFormData({ /* Reset form fields */ });
            },
            (error) => {
                const resError =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setError("Error creating opportunity: " + resError);
                setLoading(false);
            }
        );
    };

     if (!isAdmin) {
        return <div>{error || "Access Denied"}</div>;
    }


    return (
        <div>
            <h2>Create New Funding Opportunity</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                {/* Add form fields for each property in formData */}
                <div><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                <div><label>Funder Name *</label><input type="text" name="funderName" value={formData.funderName} onChange={handleChange} required /></div>
                <div><label>Description *</label><textarea name="description" value={formData.description} onChange={handleChange} required></textarea></div>
                <div><label>Funding Amount Range</label><input type="text" name="fundingAmountRange" value={formData.fundingAmountRange} onChange={handleChange} /></div>
                <div><label>Eligibility Criteria</label><textarea name="eligibilityCriteria" value={formData.eligibilityCriteria} onChange={handleChange}></textarea></div>
                <div><label>Application Deadline</label><input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} /></div>
                <div><label>Application Link *</label><input type="url" name="applicationLink" value={formData.applicationLink} onChange={handleChange} required /></div>
                <div><label>Tags (comma-separated)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} /></div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Opportunity'}
                </button>
            </form>
        </div>
    );
};

export default CreateFundingOpportunity;
