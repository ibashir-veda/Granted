import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FunderService from '../../services/funder.service';
import AdminService from '../../services/admin.service'; // Import Admin Service
import AuthService from '../../services/auth.service';

// Accept isAdmin prop
const FundingOpportunityForm = ({ isAdmin = false }) => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!opportunityId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fundingAmountRange: '',
        eligibilityCriteria: '',
        applicationDeadline: '',
        applicationLink: '',
        tags: '',
        acceptsIntegratedApp: false,
        integratedAppFields: [] // Store as array of objects { label: '', type: 'text', required: false }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isAllowed, setIsAllowed] = useState(false); // Combined Funder/Admin check

     useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        const hasPermission = (isAdmin && currentUser?.role === 'platform_admin') || (!isAdmin && currentUser?.role === 'funder');
        setIsAllowed(hasPermission);

        if (hasPermission) {
            if (isEditMode) {
                setLoading(true);
                // Use Admin or Funder service based on prop
                const fetchService = isAdmin ? AdminService.getOpportunityDetails : FunderService.getMyFundingOpportunityDetails;
                fetchService(opportunityId).then(
                    (response) => {
                        // ... existing data setting logic ...
                        const data = response.data;
                        const deadline = data.applicationDeadline ? data.applicationDeadline.split('T')[0] : '';
                        setFormData({
                            ...data,
                            applicationDeadline: deadline,
                            integratedAppFields: Array.isArray(data.integratedAppFields) ? data.integratedAppFields : []
                        });
                        setLoading(false);
                    },
                    (error) => {
                        // ... existing error handling ...
                        setError("Error loading opportunity details: " + ((error.response?.data?.message) || error.message || error.toString()));
                        setLoading(false);
                    }
                );
            }
        } else {
            setError("Access Denied.");
        }
    }, [isEditMode, opportunityId, isAdmin]); // Add isAdmin dependency


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Integrated App Field Management ---
    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            integratedAppFields: [...prev.integratedAppFields, { label: '', type: 'text', required: false }]
        }));
    };

    const handleRemoveField = (index) => {
        setFormData(prev => ({
            ...prev,
            integratedAppFields: prev.integratedAppFields.filter((_, i) => i !== index)
        }));
    };

    const handleFieldChange = (index, fieldName, value, type = 'text') => {
         setFormData(prev => ({
            ...prev,
            integratedAppFields: prev.integratedAppFields.map((field, i) =>
                i === index ? { ...field, [fieldName]: type === 'checkbox' ? value : value } : field
            )
        }));
    };
    // --- End Integrated App Field Management ---


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Prepare data, especially integratedAppFields which might need stringifying if not handled by axios/backend
        const dataToSend = {
            ...formData,
            applicationDeadline: formData.applicationDeadline || null,
            // Ensure integratedAppFields is only sent if acceptsIntegratedApp is true
            integratedAppFields: formData.acceptsIntegratedApp ? formData.integratedAppFields : null
        };

        // Use Admin or Funder service based on prop
        let action;
        if (isAdmin) {
             action = isEditMode
                ? AdminService.updateOpportunity(opportunityId, dataToSend)
                : AdminService.createFundingOpportunity(dataToSend); // Assumes admin create endpoint exists/is same
        } else {
             action = isEditMode
                ? FunderService.updateMyFundingOpportunity(opportunityId, dataToSend)
                : FunderService.createFundingOpportunity(dataToSend);
        }


        action.then(
            (response) => {
                // ... existing success logic ...
                 setMessage(response.data.message + (isEditMode ? "" : " You can create another or go back."));
                setLoading(false);
                if (!isEditMode) {
                    setFormData({ title: '', description: '', funderName: '', fundingAmountRange: '', eligibilityCriteria: '', applicationDeadline: '', applicationLink: '', tags: '', acceptsIntegratedApp: false, integratedAppFields: [] });
                } else {
                     // Navigate back to appropriate list
                     const backUrl = isAdmin ? '/admin/content/funding' : '/funder/funding/my';
                     // navigate(backUrl); // Optional: redirect after edit
                }
            },
            (error) => {
                // ... existing error logic ...
                 const resError = (error.response?.data?.message) || error.message || error.toString();
                setError(`Error ${isEditMode ? 'updating' : 'creating'} opportunity: ${resError}`);
                setLoading(false);
            }
        );
    };

     if (!isAllowed) { // Check combined permission state
        return <div>{error || "Access Denied"}</div>;
    }
     if (loading && isEditMode) {
         return <p>Loading opportunity details...</p>;
     }

    return (
        <div>
            <h2>{isAdmin ? '(Admin) ' : ''}{isEditMode ? 'Edit' : 'Post New'} Funding Opportunity</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                {/* ... existing fields ... */}
                 {/* Add Funder Name field only for Admin edit/create */}
                 {isAdmin && (
                     <div><label>Funder Name *</label><input type="text" name="funderName" value={formData.funderName || ''} onChange={handleChange} required /></div>
                 )}

                {/* ... rest of the form including integrated app section ... */}

                <button type="submit" disabled={loading}>
                    {/* ... existing button text logic ... */}
                     {loading ? (isEditMode ? 'Saving...' : 'Posting...') : (isEditMode ? 'Save Changes' : 'Post Opportunity')}
                </button>
                 {isEditMode && <button type="button" onClick={() => navigate(isAdmin ? '/admin/content/funding' : '/funder/funding/my')} style={{ marginLeft: '10px' }}>Cancel</button>}
            </form>
        </div>
    );
};

export default FundingOpportunityForm;
