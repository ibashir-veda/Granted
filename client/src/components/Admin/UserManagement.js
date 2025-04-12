import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10; // Or make this configurable

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
            // Fetch users for the initial page
            // fetchUsers(currentPage); // fetchUsers now called by page change effect
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []); // Run only once on mount

    // Effect to fetch users when currentPage changes
     useEffect(() => {
        if (isAdmin) {
            fetchUsers(currentPage);
        }
    }, [currentPage, isAdmin]); // Add isAdmin dependency


    const fetchUsers = (page) => {
        setLoading(true);
        setError('');
        // Don't clear message on page change
        // setMessage('');
        AdminService.listUsers(page, pageSize).then( // Pass page and size
            (response) => {
                const { users, totalPages, totalItems, currentPage } = response.data;
                setUsers(users);
                setTotalPages(totalPages);
                setTotalItems(totalItems);
                setCurrentPage(currentPage); // Ensure current page state matches response
                setLoading(false);
            },
            (error) => {
                setError("Error loading users: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    };

    const handleUpdate = (userId, field, value) => {
        setMessage('');
        setError('');

        // Find the user and prepare the update data
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) return;

        const updateData = { [field]: value };

        // Optimistic UI update (optional, revert on error)
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, [field]: value } : u));
        setEditingUser(null); // Exit edit mode immediately

        AdminService.updateUser(userId, { [field]: value }).then(
             (response) => {
                setMessage(`User updated successfully.`);
                // No need to fetch all users, optimistic update is done
            },
            (error) => {
                setError(`Error updating user: ` + ((error.response?.data?.message) || error.message || error.toString()));
                // Revert optimistic update by fetching current page data again
                fetchUsers(currentPage);
            }
        );
    };

    // Helper to render controls for role/verification
    const renderControls = (user) => {
        const isEditing = editingUser === user.id;

        return (
            <>
                {/* Role */}
                <td>
                    {isEditing ? (
                        <select
                            defaultValue={user.role}
                            onBlur={(e) => handleUpdate(user.id, 'role', e.target.value)}
                            onChange={(e) => { /* Can add immediate save on change if desired */ }}
                            autoFocus
                        >
                            <option value="ngo_admin">NGO Admin</option>
                            <option value="funder">Funder</option>
                            <option value="service_provider">Service Provider</option>
                            <option value="platform_admin">Platform Admin</option>
                        </select>
                    ) : (
                        <span onClick={() => setEditingUser(user.id)} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>
                            {user.role.replace('_', ' ')}
                        </span>
                    )}
                </td>
                {/* Verification */}
                <td>
                    {isEditing ? (
                         <select
                            defaultValue={user.isVerified.toString()} // Use string for comparison
                            onBlur={(e) => handleUpdate(user.id, 'isVerified', e.target.value === 'true')}
                            onChange={(e) => { /* Can add immediate save on change if desired */ }}
                        >
                            <option value="true">Verified</option>
                            <option value="false">Not Verified</option>
                        </select>
                    ) : (
                         <span onClick={() => setEditingUser(user.id)} style={{ cursor: 'pointer' }}>
                            {user.isVerified ? 'Yes' : 'No'}
                         </span>
                    )}
                </td>
            </>
        );
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // The useEffect hook for currentPage will trigger fetchUsers
        }
    };


    if (!isAdmin) return <div>{error || "Access Denied"}</div>;

    return (
        <div>
            <h2>User Management ({totalItems} total)</h2>
            <Link to="/admin">Back to Admin Dashboard</Link>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <p><small>Click on Role or Verification status to edit.</small></p>

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Verified</th>
                                <th>Registered On</th>
                                {/* Add Actions column later for delete */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                     <td style={{ padding: '8px 0' }}>{user.id}</td>
                                    <td style={{ padding: '8px 0' }}>{user.email}</td>
                                    {renderControls(user)}
                                    <td style={{ padding: '8px 0' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span style={{ margin: '0 15px' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserManagement;
