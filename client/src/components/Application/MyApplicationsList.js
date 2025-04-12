import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NgoService from '../../services/ngo.service';
import AuthService from '../../services/auth.service';

const MyApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isNgo, setIsNgo] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'ngo_admin') {
            setIsNgo(true);
            setLoading(true);
            NgoService.listMyApplications().then(
                (response) => {
                    setApplications(response.data);
                    setLoading(false);
                },
                (error) => {
                    setError("Error loading applications: " + ((error.response?.data?.message) || error.message || error.toString()));
                    setLoading(false);
                }
            );
        } else {
            setError("Access Denied: Requires NGO Admin role.");
        }
    }, []);

    if (!isNgo) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading your applications...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>My Submitted Applications</h2>
            {applications.length === 0 ? (
                <p>You have not submitted any applications through the platform yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                            <th>Opportunity</th>
                            <th>Funder</th>
                            <th>Submitted On</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px 0' }}>
                                    {/* Link back to public opportunity page */}
                                    <Link to={`/funding`}>{app.funding_opportunity?.title || `ID: ${app.fundingOpportunityId}`}</Link>
                                </td>
                                <td style={{ padding: '8px 0' }}>{app.funding_opportunity?.funderName || 'N/A'}</td>
                                <td style={{ padding: '8px 0' }}>{new Date(app.submittedAt).toLocaleDateString()}</td>
                                <td style={{ padding: '8px 0', textTransform: 'capitalize' }}>{app.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyApplicationsList;
