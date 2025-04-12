import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FunderService from '../../services/funder.service';
import AuthService from '../../services/auth.service';

const ViewApplications = () => {
    const { opportunityId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [opportunityTitle, setOpportunityTitle] = useState(''); // Store title for display
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFunder, setIsFunder] = useState(false);
    const [updateStatusError, setUpdateStatusError] = useState(''); // Specific error for status updates
    const [updateStatusLoading, setUpdateStatusLoading] = useState(null); // Track which submission is updating

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role === 'funder') {
            setIsFunder(true);
            setLoading(true);

            // Fetch opportunity details first to get title (optional but good UX)
            FunderService.getMyFundingOpportunityDetails(opportunityId).then(
                (oppResponse) => {
                    setOpportunityTitle(oppResponse.data.title);
                    // Now fetch applications
                    return FunderService.listOpportunityApplications(opportunityId);
                }
            ).then(
                (appResponse) => {
                    setSubmissions(appResponse.data);
                    setLoading(false);
                }
            ).catch(
                 (error) => {
                    setError("Error loading applications: " + ((error.response?.data?.message) || error.message || error.toString()));
                    setLoading(false);
                }
            );
        } else {
            setError("Access Denied: Requires Funder role.");
        }
    }, [opportunityId]);

    const handleStatusChange = (submissionId, newStatus) => {
        setUpdateStatusLoading(submissionId); // Set loading for this specific submission
        setUpdateStatusError('');

        FunderService.updateApplicationStatus(submissionId, newStatus).then(
            (response) => {
                // Update the status in the local state for immediate feedback
                setSubmissions(prevSubs =>
                    prevSubs.map(sub =>
                        sub.id === submissionId ? { ...sub, status: newStatus } : sub
                    )
                );
                setUpdateStatusLoading(null); // Clear loading
            },
            (error) => {
                setUpdateStatusError(`Error updating status for submission ${submissionId}: ` + ((error.response?.data?.message) || error.message || error.toString()));
                setUpdateStatusLoading(null); // Clear loading even on error
            }
        );
    };

    if (!isFunder) return <div>{error || "Access Denied"}</div>;
    if (loading) return <p>Loading applications...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Applications for: {opportunityTitle || `Opportunity ID ${opportunityId}`}</h2>
            <Link to="/funder/funding/my">Back to My Opportunities</Link>
            {updateStatusError && <p style={{ color: 'red' }}>{updateStatusError}</p>}

            {submissions.length === 0 ? (
                <p>No applications received yet.</p>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    {submissions.map(sub => (
                        <div key={sub.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px' }}>
                            <h4>Applicant: {sub.applicantProfile?.ngoName || sub.applicantUser?.email || 'N/A'}</h4>
                            <p><strong>Submitted On:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> <span style={{textTransform: 'capitalize'}}>{sub.status}</span></p>
                            {/* Display NGO Profile Info */}
                            {sub.applicantProfile && (
                                <details>
                                    <summary>View Applicant Profile</summary>
                                    <p><strong>NGO Name:</strong> {sub.applicantProfile.ngoName}</p>
                                    <p><strong>Location:</strong> {sub.applicantProfile.location}</p>
                                    <p><strong>Website:</strong> <a href={sub.applicantProfile.website} target="_blank" rel="noopener noreferrer">{sub.applicantProfile.website}</a></p>
                                    <p><strong>Mission:</strong> {sub.applicantProfile.mission}</p>
                                    {/* Add other profile fields as needed */}
                                </details>
                            )}
                             {/* Display Submitted Answers */}
                             <h5>Submitted Answers:</h5>
                             {Object.entries(sub.submissionData).map(([key, value]) => (
                                 <p key={key}><strong>{key}:</strong> {value}</p>
                             ))}
                             {/* Status Update Controls */}
                             <div style={{ marginTop: '10px' }}>
                                 <label htmlFor={`status-${sub.id}`} style={{ marginRight: '5px' }}>Update Status:</label>
                                 <select
                                     id={`status-${sub.id}`}
                                     defaultValue={sub.status} // Use defaultValue for initial selection
                                     onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                                     disabled={updateStatusLoading === sub.id} // Disable while updating this specific one
                                 >
                                     <option value="submitted">Submitted</option>
                                     <option value="under_review">Under Review</option>
                                     <option value="approved">Approved</option>
                                     <option value="rejected">Rejected</option>
                                 </select>
                                 {updateStatusLoading === sub.id && <span style={{ marginLeft: '10px' }}>Updating...</span>}
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewApplications;
