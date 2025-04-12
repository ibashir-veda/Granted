import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const AdminManageFunding = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For delete confirmation
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
            fetchOpportunities();
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []);

    const fetchOpportunities = () => {
        setLoading(true);
        setError('');
        setMessage('');
        AdminService.listAllOpportunities().then(
            (response) => {
                setOpportunities(response.data);
                setLoading(false);
            },
            (error) => {
                setError("Error loading opportunities: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    };

    const handleDelete = (opportunityId, opportunityTitle) => {
        if (!window.confirm(`ADMIN ACTION: Are you sure you want to delete the opportunity "${opportunityTitle}"? This cannot be undone.`)) {
            return;
        }
        setMessage('Deleting...');
        setError('');
        AdminService.deleteOpportunity(opportunityId).then(
            (response) => {
                setMessage(response.data.message);
                fetchOpportunities(); // Refresh list
                setTimeout(() => setMessage(''), 3000);
            },
            (error) => {
                setError("Error deleting opportunity: " + ((error.response?.data?.message) || error.message || error.toString()));
                setMessage('');
            }
        );
    };

    const getPostedBy = (opp) => {
        if (opp.postingAdmin) return `Admin (${opp.postingAdmin.email})`;
        if (opp.postingFunder) return `Funder (${opp.postingFunder.email})`;
        return 'Unknown';
    };

    if (!isAdmin) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading opportunities...</p>;

    return (
        <div>
            <h2>Manage Funding Opportunities (Admin)</h2>
            <Link to="/admin">Back to Admin Dashboard</Link> | <Link to="/admin/create-funding">Create New</Link>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                 <thead>
                    <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                        <th>Title</th>
                        <th>Funder Name</th>
                        <th>Posted By</th>
                        <th>Created On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                 <tbody>
                    {opportunities.map(opp => (
                        <tr key={opp.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 0' }}>{opp.title}</td>
                            <td style={{ padding: '8px 0' }}>{opp.funderName}</td>
                            <td style={{ padding: '8px 0' }}>{getPostedBy(opp)}</td>
                            <td style={{ padding: '8px 0' }}>{new Date(opp.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '8px 0' }}>
                                <Link to={`/admin/content/funding/edit/${opp.id}`}>Edit</Link>
                                <button
                                    onClick={() => handleDelete(opp.id, opp.title)}
                                    style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    title="Delete Opportunity"
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

export default AdminManageFunding;
