import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const AdminManageDiscounts = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For delete confirmation
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
            fetchOffers();
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []);

    const fetchOffers = () => {
        setLoading(true);
        setError('');
        setMessage('');
        AdminService.listAllOffers().then(
            (response) => {
                setOffers(response.data);
                setLoading(false);
            },
            (error) => {
                setError("Error loading offers: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    };

    const handleDelete = (offerId, offerName) => {
        if (!window.confirm(`ADMIN ACTION: Are you sure you want to delete the offer "${offerName}"? This cannot be undone.`)) {
            return;
        }
        setMessage('Deleting...');
        setError('');
        AdminService.deleteOffer(offerId).then(
            (response) => {
                setMessage(response.data.message);
                fetchOffers(); // Refresh list
                setTimeout(() => setMessage(''), 3000);
            },
            (error) => {
                setError("Error deleting offer: " + ((error.response?.data?.message) || error.message || error.toString()));
                setMessage('');
            }
        );
    };

     const getPostedBy = (offer) => {
        if (offer.postingAdminOffer) return `Admin (${offer.postingAdminOffer.email})`;
        if (offer.postingProvider) return `Provider (${offer.postingProvider.email})`;
        return 'Unknown';
    };


    if (!isAdmin) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading offers...</p>;

    return (
        <div>
            <h2>Manage Discount Offers (Admin)</h2>
             <Link to="/admin">Back to Admin Dashboard</Link> | <Link to="/admin/create-discount">Create New</Link>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

             <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                 <thead>
                    <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                        <th>Product/Service</th>
                        <th>Provider Name</th>
                        <th>Posted By</th>
                        <th>Created On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                 <tbody>
                    {offers.map(offer => (
                        <tr key={offer.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 0' }}>{offer.productServiceName}</td>
                            <td style={{ padding: '8px 0' }}>{offer.providerName}</td>
                             <td style={{ padding: '8px 0' }}>{getPostedBy(offer)}</td>
                            <td style={{ padding: '8px 0' }}>{new Date(offer.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '8px 0' }}>
                                <Link to={`/admin/content/discounts/edit/${offer.id}`}>Edit</Link>
                                <button
                                    onClick={() => handleDelete(offer.id, offer.productServiceName)}
                                    style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    title="Delete Offer"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminManageDiscounts;
