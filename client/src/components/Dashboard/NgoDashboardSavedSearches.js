import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NgoService from '../../services/ngo.service';

const NgoDashboardSavedSearches = () => {
    const [savedSearches, setSavedSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For delete confirmation

    useEffect(() => {
        fetchSavedSearches();
    }, []);

    const fetchSavedSearches = () => {
        setLoading(true);
        setError('');
        setMessage('');
        NgoService.getMySavedSearches().then(
            (response) => {
                setSavedSearches(response.data);
                setLoading(false);
            },
            (error) => {
                setError("Error loading saved searches: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    };

    const handleDelete = (searchId) => {
        if (!window.confirm("Are you sure you want to delete this saved search?")) {
            return;
        }
        setMessage('');
        setError('');
        NgoService.deleteMySavedSearch(searchId).then(
            (response) => {
                setMessage(response.data.message);
                fetchSavedSearches(); // Refresh list after delete
            },
            (error) => {
                setError("Error deleting search: " + ((error.response?.data?.message) || error.message || error.toString()));
            }
        );
    };

    // Helper to generate the search link including filters
    const getSearchLink = (search) => {
        const params = new URLSearchParams();
        if (search.keywords) {
            params.set('q', search.keywords);
        }
        // Add filter params
        if (search.filters) {
            if (search.searchType === 'funding' && search.filters.tags) {
                params.set('tags', search.filters.tags);
            } else if (search.searchType === 'discounts' && search.filters.categories) {
                params.set('categories', search.filters.categories);
            }
            // Add other filters here later
        }
        return `/${search.searchType}?${params.toString()}`;
    };


    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <h4>My Saved Searches</h4>
            {loading && <p>Loading searches...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {!loading && savedSearches.length === 0 && <p>You have no saved searches yet.</p>}
            {savedSearches.length > 0 && (
                <ul>
                    {savedSearches.map(search => (
                        <li key={search.id} style={{ marginBottom: '5px' }}>
                            <Link to={getSearchLink(search)}>
                                {/* Display keywords and filters in the name for clarity */}
                                {search.searchName ||
                                 `Search (${search.searchType})` +
                                 (search.keywords ? ` for "${search.keywords}"` : '') +
                                 (search.filters?.tags ? ` [Tags: ${search.filters.tags}]` : '') +
                                 (search.filters?.categories ? ` [Categories: ${search.filters.categories}]` : '')
                                }
                            </Link>
                            <button
                                onClick={() => handleDelete(search.id)}
                                style={{ marginLeft: '10px', fontSize: '0.8em', cursor: 'pointer' }}
                                title="Delete Search"
                            >
                                X
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NgoDashboardSavedSearches;
