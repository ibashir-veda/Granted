import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProviderService from '../../services/provider.service';
import AdminService from '../../services/admin.service'; // Import Admin Service
import AuthService from '../../services/auth.service';

// Accept isAdmin prop
const DiscountOfferForm = ({ isAdmin = false }) => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!offerId;

    const [formData, setFormData] = useState({
        productServiceName: '',
        providerName: '',
        description: '',
        discountDetails: '',
        eligibilityCriteria: '',
        redemptionInfo: '',
        websiteLink: '',
        validityPeriod: '',
        categoryTags: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isAllowed, setIsAllowed] = useState(false); // Combined Provider/Admin check

     useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
         const hasPermission = (isAdmin && currentUser?.role === 'platform_admin') || (!isAdmin && currentUser?.role === 'service_provider');
         setIsAllowed(hasPermission);

        if (hasPermission) {
             if (isEditMode) {
                setLoading(true);
                 // Use Admin or Provider service based on prop
                const fetchService = isAdmin ? AdminService.getOfferDetails : ProviderService.getMyDiscountOfferDetails;
                fetchService(offerId).then(
                    (response) => {
                        setFormData(response.data);
                        setLoading(false);
                    },
                    (error) => {
                        setError("Error loading offer details: " + ((error.response?.data?.message) || error.message || error.toString()));
                        setLoading(false);
                    }
                );
            }
        } else {
            setError("Access Denied.");
        }
    }, [isEditMode, offerId, isAdmin]); // Add isAdmin dependency


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const dataToSend = { ...formData };

        // Use Admin or Provider service based on prop
        let action;
        if (isAdmin) {
             action = isEditMode
                ? AdminService.updateOffer(offerId, dataToSend)
                : AdminService.createDiscountOffer(dataToSend); // Assumes admin create endpoint exists/is same
        } else {
             action = isEditMode
                ? ProviderService.updateMyDiscountOffer(offerId, dataToSend)
                : ProviderService.createDiscountOffer(dataToSend);
        }


        action.then(
            (response) => {
                setMessage(response.data.message + (isEditMode ? "" : " You can create another or go back."));
                setLoading(false);
                if (!isEditMode) {
                    setFormData({ productServiceName: '', providerName: '', description: '', discountDetails: '', eligibilityCriteria: '', redemptionInfo: '', websiteLink: '', validityPeriod: '', categoryTags: '' });
                } else {
                    // Navigate back to appropriate list
                     const backUrl = isAdmin ? '/admin/content/discounts' : '/provider/discounts/my';
                     // navigate(backUrl); // Optional: redirect after edit
                }
            },
            (error) => {
                 const resError = (error.response?.data?.message) || error.message || error.toString();
                setError(`Error ${isEditMode ? 'updating' : 'creating'} offer: ${resError}`);
                setLoading(false);
            }
        );
    };

     if (!isAllowed) { // Check combined permission state
        return <div>{error || "Access Denied"}</div>;
    }
     if (loading && isEditMode) {
         return <p>Loading offer details...</p>;
     }

    return (
        <div>
             <h2>{isAdmin ? '(Admin) ' : ''}{isEditMode ? 'Edit' : 'Post New'} Discount Offer</h2>
             {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                 {/* Add Provider Name field only for Admin edit/create */}
                 {isAdmin && (
                     <div><label>Provider Name *</label><input type="text" name="providerName" value={formData.providerName || ''} onChange={handleChange} required /></div>
                 )}
                <div><label>Product/Service Name *</label><input type="text" name="productServiceName" value={formData.productServiceName} onChange={handleChange} required /></div>
                <div><label>Description *</label><textarea name="description" value={formData.description} onChange={handleChange} required></textarea></div>
                <div><label>Discount Details *</label><input type="text" name="discountDetails" value={formData.discountDetails} onChange={handleChange} required placeholder='e.g., 50% off, Free Tier'/></div>
                <div><label>Eligibility Criteria</label><textarea name="eligibilityCriteria" value={formData.eligibilityCriteria || ''} onChange={handleChange} placeholder='e.g., Verified NGOs only'></textarea></div>
                <div><label>Redemption Info *</label><textarea name="redemptionInfo" value={formData.redemptionInfo} onChange={handleChange} required placeholder='Instructions, code, link...'></textarea></div>
                <div><label>Product/Offer Website Link</label><input type="url" name="websiteLink" value={formData.websiteLink || ''} onChange={handleChange} /></div>
                <div><label>Validity Period</label><input type="text" name="validityPeriod" value={formData.validityPeriod || ''} onChange={handleChange} placeholder='e.g., Ongoing, Until Dec 31'/></div>
                <div><label>Category Tags (comma-separated)</label><input type="text" name="categoryTags" value={formData.categoryTags || ''} onChange={handleChange} placeholder='e.g., CRM, Accounting'/></div>

                <button type="submit" disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Posting...') : (isEditMode ? 'Save Changes' : 'Post Offer')}
                </button>
                 {isEditMode && <button type="button" onClick={() => navigate(isAdmin ? '/admin/content/discounts' : '/provider/discounts/my')} style={{ marginLeft: '10px' }}>Cancel</button>}
            </form>
        </div>
    );
};

export default DiscountOfferForm;
