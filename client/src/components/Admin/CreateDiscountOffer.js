import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const CreateDiscountOffer = () => {
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

        AdminService.createDiscountOffer(formData).then(
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
                setError("Error creating offer: " + resError);
                setLoading(false);
            }
        );
    };

     if (!isAdmin) {
        return <div>{error || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>Create New Discount Offer</h2>
             {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                 {/* Add form fields for each property in formData */}
                <div><label>Product/Service Name *</label><input type="text" name="productServiceName" value={formData.productServiceName} onChange={handleChange} required /></div>
                <div><label>Provider Name *</label><input type="text" name="providerName" value={formData.providerName} onChange={handleChange} required /></div>
                <div><label>Description *</label><textarea name="description" value={formData.description} onChange={handleChange} required></textarea></div>
                <div><label>Discount Details *</label><input type="text" name="discountDetails" value={formData.discountDetails} onChange={handleChange} required placeholder='e.g., 50% off, Free Tier'/></div>
                <div><label>Eligibility Criteria</label><textarea name="eligibilityCriteria" value={formData.eligibilityCriteria} onChange={handleChange}></textarea></div>
                <div><label>Redemption Info *</label><textarea name="redemptionInfo" value={formData.redemptionInfo} onChange={handleChange} required placeholder='Instructions, code, link...'></textarea></div>
                <div><label>Website Link</label><input type="url" name="websiteLink" value={formData.websiteLink} onChange={handleChange} /></div>
                <div><label>Validity Period</label><input type="text" name="validityPeriod" value={formData.validityPeriod} onChange={handleChange} placeholder='e.g., Ongoing, Until Dec 31'/></div>
                <div><label>Category Tags (comma-separated)</label><input type="text" name="categoryTags" value={formData.categoryTags} onChange={handleChange} /></div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Offer'}
                </button>
            </form>
        </div>
    );
};

export default CreateDiscountOffer;
