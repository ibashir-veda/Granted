import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
            setLoading(true);
            AdminService.getDashboardStats().then(
                (response) => {
                    setStats(response.data);
                    setLoading(false);
                },
                (error) => {
                    setError("Error loading dashboard stats: " + ((error.response?.data?.message) || error.message || error.toString()));
                    setLoading(false);
                }
            );
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []);

    if (!isAdmin) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Admin Dashboard</h2>

            {stats && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {/* User Stats */}
                    <div style={statBoxStyle}>
                        <h3>Users ({stats.totalUsers})</h3>
                        <p>NGOs: {stats.usersByRole?.ngo || 0} ({stats.ngoVerification?.unverified || 0} unverified)</p>
                        <p>Funders: {stats.usersByRole?.funder || 0}</p>
                        <p>Providers: {stats.usersByRole?.serviceProvider || 0}</p>
                        <p>Admins: {stats.usersByRole?.admin || 0}</p>
                    </div>

                    {/* Content Stats */}
                     <div style={statBoxStyle}>
                        <h3>Content</h3>
                        <p>Funding Opportunities: {stats.contentCounts?.fundingOpportunities || 0}</p>
                        <p>Discount Offers: {stats.contentCounts?.discountOffers || 0}</p>
                    </div>

                     {/* Quick Actions */}
                     <div style={statBoxStyle}>
                        <h3>Quick Actions</h3>
                        <p><Link to="/admin/verify-ngos">Verify NGOs ({stats.ngoVerification?.unverified || 0})</Link></p>
                        <p><Link to="/admin/users">Manage Users</Link></p>
                        <p><Link to="/admin/content/funding">Manage Funding</Link></p> {/* Add link */}
                        <p><Link to="/admin/content/discounts">Manage Discounts</Link></p> {/* Add link */}
                        {/* Keep create links or remove if covered by Manage pages */}
                        {/* <p><Link to="/admin/create-funding">Create Funding Opportunity</Link></p> */}
                        {/* <p><Link to="/admin/create-discount">Create Discount Offer</Link></p> */}
                    </div>
                </div>
            )}
        </div>
    );
};

// Basic styling for stat boxes
const statBoxStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '5px',
    minWidth: '200px'
};


export default AdminDashboard;
