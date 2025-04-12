import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicService from '../../services/public.service'; // To get opportunity details initially
import NgoService from '../../services/ngo.service';
import AuthService from '../../services/auth.service';

const ApplicationForm = () => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [formData, setFormData] = useState({}); // Store { fieldLabel: value }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
    const isVerifiedNgo = currentUser && currentUser.role === 'ngo_admin' && currentUser.isVerified;

    useEffect(() => {
        // Fetch opportunity details to get the form fields
        setLoading(true);
        // NOTE: Using public service assumes opportunity details are public.
        // If not, create a protected NGO endpoint to get opportunity details.
        // For simplicity, let's assume public listing has enough info or create a dedicated public detail endpoint.
        // We'll simulate fetching details needed for the form.
        PublicService.getFundingOpportunities().then( // Inefficient: Fetches all, then filters
            (response) => {
                const opp = response.data.find(o => o.id.toString() === opportunityId);
                if (opp && opp.acceptsIntegratedApp) {
                    setOpportunity(opp);
                    // Initialize form data state based on fields
                    const initialFormData = {};
                    (opp.integratedAppFields || []).forEach(field => {
                        initialFormData[field.label] = ''; // Initialize with empty strings
                    });
                    setFormData(initialFormData);
                } else if (opp) {
                     setError("This opportunity does not accept integrated applications.");
                } else {
                    setError("Funding Opportunity not found.");
                }
                setLoading(false);
            },
            (err) => {
                setError("Error loading opportunity details.");
                setLoading(false);
            }
        );

    }, [opportunityId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isVerifiedNgo) {
            setError("You must be logged in as a verified NGO to apply.");
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        NgoService.submitApplication(opportunityId, formData).then(
            (response) => {
                setMessage("Application submitted successfully! You will be redirected shortly.");
                setLoading(false);
                setTimeout(() => navigate('/dashboard'), 3000); // Redirect to dashboard after 3s
            },
            (error) => {
                setError("Error submitting application: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    };

    if (loading && !opportunity) return <p>Loading application form...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!opportunity) return <p>Opportunity not found or does not accept internal applications.</p>;
     if (!isVerifiedNgo) return <p>Please <Link to="/login">login</Link> as a verified NGO to apply.</p>;


    return (
        <div>
            <h2>Apply for: {opportunity.title}</h2>
            <p><strong>Funder:</strong> {opportunity.funderDisplayName}</p>
            <hr />
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                {(opportunity.integratedAppFields || []).map((field) => (
                    <div key={field.label} style={{ marginBottom: '15px' }}>
                        <label htmlFor={field.label}>
                            {field.label} {field.required && '*'}
                        </label>
                        {/* Basic rendering - enhance later based on field.type */}
                        <input
                            type={field.type || 'text'} // Default to text
                            id={field.label}
                            name={field.label}
                            value={formData[field.label] || ''}
                            onChange={handleChange}
                            required={field.required}
                            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                        {/* Add textarea, number, date inputs later based on field.type */}
                    </div>
                ))}
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </form>
        </div>
    );
};

export default ApplicationForm;
