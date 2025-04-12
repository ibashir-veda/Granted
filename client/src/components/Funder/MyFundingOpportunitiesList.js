import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FunderService from '../../services/funder.service';
import AuthService from '../../services/auth.service';

const MyFundingOpportunitiesList = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFunder, setIsFunder] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'funder') {
            setIsFunder(true);
            setLoading(true);
            FunderService.getMyFundingOpportunities().then(
                (response) => {
                    setOpportunities(response.data);
                    setLoading(false);
                },
                (error) => {
                    setError("Error loading opportunities: " + ((error.response?.data?.message) || error.message || error.toString()));
                    setLoading(false);
                }
            );
        } else {
            setError("Access Denied: Requires Funder role.");
        }
    }, []);

    const handleDelete = (opportunityId, opportunityTitle) => {
        if (!window.confirm(`Are you sure you want to delete the opportunity "${opportunityTitle}"? This cannot be undone.`)) {
            return;
        }
        setDeleteMessage('Deleting...');
        setDeleteError('');
        FunderService.deleteMyFundingOpportunity(opportunityId).then(
            (response) => {
                setDeleteMessage(response.data.message);
                // Refresh list after delete
                setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
                setTimeout(() => setDeleteMessage(''), 3000); // Clear message
            },
            (error) => {
                setDeleteError("Error deleting opportunity: " + ((error.response?.data?.message) || error.message || error.toString()));
                setDeleteMessage('');
            }
        );
    };

     if (!isFunder) {
        return <div>{error || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>My Posted Funding Opportunities</h2>
            <Link to="/funder/funding/create">Post New Opportunity</Link>
            {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
            {deleteMessage && <p style={{ color: 'green' }}>{deleteMessage}</p>}

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && opportunities.length === 0 && <p>You have not posted any opportunities yet.</p>}

            {opportunities.map(opp => (
                <div key={opp.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{opp.title}</h3>
                    <p><strong>Deadline:</strong> {opp.applicationDeadline ? new Date(opp.applicationDeadline).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Accepts Integrated App:</strong> {opp.acceptsIntegratedApp ? 'Yes' : 'No'}</p>
                    <Link to={`/funder/funding/edit/${opp.id}`}>Edit</Link>
                    {opp.acceptsIntegratedApp && <Link to={`/funder/funding/${opp.id}/applications`} style={{ marginLeft: '10px' }}>View Applications</Link>}
                    {/* Add delete button */}
                    <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Delete Opportunity"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MyFundingOpportunitiesList;
