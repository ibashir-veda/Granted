import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProviderService from '../../services/provider.service';
import AuthService from '../../services/auth.service';

const MyDiscountOffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isProvider, setIsProvider] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'service_provider') {
            setIsProvider(true);
            setLoading(true);
            ProviderService.getMyDiscountOffers().then(
                (response) => {
                    setOffers(response.data);
                    setLoading(false);
                },
                (error) => {
                    setError("Error loading offers: " + ((error.response?.data?.message) || error.message || error.toString()));
                    setLoading(false);
                }
            );
        } else {
            setError("Access Denied: Requires Service Provider role.");
        }
    }, []);

     const handleDelete = (offerId, offerName) => {
        if (!window.confirm(`Are you sure you want to delete the offer "${offerName}"? This cannot be undone.`)) {
            return;
        }
        setDeleteMessage('Deleting...');
        setDeleteError('');
        ProviderService.deleteMyDiscountOffer(offerId).then(
            (response) => {
                setDeleteMessage(response.data.message);
                setOffers(prev => prev.filter(offer => offer.id !== offerId));
                setTimeout(() => setDeleteMessage(''), 3000);
            },
            (error) => {
                setDeleteError("Error deleting offer: " + ((error.response?.data?.message) || error.message || error.toString()));
                setDeleteMessage('');
            }
        );
    };


    if (!isProvider) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading your offers...</p>;

    return (
        <div>
            <h2>My Posted Discount Offers</h2>
            <Link to="/provider/discounts/create">Post New Offer</Link>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
            {deleteMessage && <p style={{ color: 'green' }}>{deleteMessage}</p>}

            {!loading && offers.length === 0 && <p>You have not posted any offers yet.</p>}

            {offers.map(offer => (
                <div key={offer.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{offer.productServiceName}</h3>
                    <p><strong>Details:</strong> {offer.discountDetails}</p>
                    <p><strong>Validity:</strong> {offer.validityPeriod || 'N/A'}</p>
                    <Link to={`/provider/discounts/edit/${offer.id}`}>Edit</Link>
                    <button
                        onClick={() => handleDelete(offer.id, offer.productServiceName)}
                        style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Delete Offer"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MyDiscountOffersList;
