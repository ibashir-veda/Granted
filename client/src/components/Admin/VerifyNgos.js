import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AuthService from '../../services/auth.service';

const VerifyNgos = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'platform_admin') {
            setIsAdmin(true);
            fetchNgos();
        } else {
            setError("Access Denied: Requires Platform Admin role.");
        }
    }, []);

    const fetchNgos = () => {
        setLoading(true);
        setMessage('');
        setError('');
        AdminService.getUnverifiedNgos().then(
            (response) => {
                setNgos(response.data);
                setLoading(false);
            },
            (error) => {
                const resError =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setError("Error loading NGOs: " + resError);
                setLoading(false);
            }
        );
    };

    const handleVerify = (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to verify NGO: ${userEmail}?`)) {
            return;
        }
        setMessage('');
        setError('');
        // Optionally disable button while processing
        AdminService.verifyNgo(userId).then(
            (response) => {
                setMessage(response.data.message);
                // Refresh the list after verification
                fetchNgos();
            },
            (error) => {
                const resError =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setError("Error verifying NGO: " + resError);
                // Re-enable button if needed
            }
        );
    };

    if (!isAdmin) {
        return <div>{error || "Access Denied"}</div>;
    }

    return (
        <div>
            <h2>Verify NGOs</h2>
            {loading && <p>Loading unverified NGOs...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {ngos.length === 0 && !loading && <p>No NGOs currently awaiting verification.</p>}

            {ngos.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Registered On</th>
                            <th>NGO Name</th>
                            <th>Registration Details</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ngos.map((ngo) => (
                            <tr key={ngo.id}>
                                <td>{ngo.email}</td>
                                <td>{new Date(ngo.createdAt).toLocaleDateString()}</td>
                                <td>{ngo.ngo_profile?.ngoName || '(Profile not created)'}</td>
                                <td>{ngo.ngo_profile?.registrationDetails || '(N/A)'}</td>
                                <td>
                                    <button onClick={() => handleVerify(ngo.id, ngo.email)}>
                                        Verify
                                    </button>
                                    {/* Add link/button to view full profile later if needed */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VerifyNgos;
