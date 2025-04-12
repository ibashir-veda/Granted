import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import PublicService from '../../services/public.service';
import NgoService from '../../services/ngo.service';
import AuthService from '../../services/auth.service';

const FundingList = () => {
    // Remove 'opportunities' state
    const [filteredOpportunities, setFilteredOpportunities] = useState([]); // Holds current page items
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [saveSearchMessage, setSaveSearchMessage] = useState('');
    const [currentUser] = useState(AuthService.getCurrentUser());
    const isNgo = currentUser && currentUser.role === 'ngo_admin';
    const [searchParams, setSearchParams] = useSearchParams(); // Use setSearchParams to update URL
    const navigate = useNavigate(); // To potentially replace history

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10; // Items per page

    // Function to fetch data based on current state
    const fetchData = useCallback((page, keyword, tags) => {
        setLoading(true);
        setError('');
        const params = { page, size: pageSize };
        if (keyword) params.q = keyword;
        if (tags) params.tags = tags;

        PublicService.getFundingOpportunities(params).then(
            (response) => {
                const { items, totalPages, totalItems, currentPage: respCurrentPage } = response.data;
                setFilteredOpportunities(items);
                setTotalPages(totalPages);
                setTotalItems(totalItems);
                // Ensure currentPage state matches the response if backend adjusted it
                if (currentPage !== respCurrentPage) {
                    setCurrentPage(respCurrentPage);
                }
                setLoading(false);
            },
            (error) => {
                setError("Error loading opportunities: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    }, [currentPage]); // Include currentPage in dependencies if needed, though it's passed as arg

    // Effect to load initial data and react to search param changes
    useEffect(() => {
        const pageQuery = parseInt(searchParams.get('page') || '1', 10);
        const query = searchParams.get('q') || '';
        const tagsQuery = searchParams.get('tags') || '';

        setSearchTerm(query);
        setTagFilter(tagsQuery);
        setCurrentPage(pageQuery); // Set initial page from URL

        fetchData(pageQuery, query, tagsQuery); // Fetch data based on URL params

    }, [searchParams, fetchData]); // Depend on searchParams and fetchData


    // Function to handle search/filter changes and update URL
    const handleSearch = () => {
        setCurrentPage(1); // Reset to page 1 on new search/filter
        const params = {};
        if (searchTerm) params.q = searchTerm;
        if (tagFilter) params.tags = tagFilter;
        params.page = '1'; // Explicitly set page 1
        setSearchParams(params); // Update URL, triggers useEffect
        // fetchData(1, searchTerm, tagFilter); // Fetch immediately or let useEffect handle it
    };

     // Handle Enter key press in input fields
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            // Update state and URL params
            setCurrentPage(newPage);
            const params = { ...Object.fromEntries(searchParams), page: newPage.toString() };
            setSearchParams(params);
            // fetchData(newPage, searchTerm, tagFilter); // Fetch immediately or let useEffect handle it
        }
    };


    // Remove client-side filtering useEffect

    const handleSaveSearch = () => {
        // ... existing save search logic using current searchTerm and tagFilter ...
        if (!searchTerm && !tagFilter) {
            setSaveSearchMessage("Please enter keywords or tags to save a search.");
            return;
        }
        setSaveSearchMessage('Saving...');
        NgoService.createSavedSearch({
            searchType: 'funding',
            keywords: searchTerm,
            filters: { tags: tagFilter }
        }).then(
            (response) => {
                setSaveSearchMessage("Search saved successfully!");
                setTimeout(() => setSaveSearchMessage(''), 3000);
            },
            (error) => {
                 setSaveSearchMessage("Error saving search: " + ((error.response?.data?.message) || error.message || error.toString()));
            }
        );
    };


    return (
        <div>
            <h2>Funding Opportunities ({totalItems > 0 ? totalItems : '...'})</h2>

            {/* Search & Filter Inputs */}
            <div style={{ margin: '10px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress} // Add Enter key handler
                    style={{ padding: '8px', flexGrow: 1, minWidth: '200px' }}
                />
                 <input
                    type="text"
                    placeholder="Filter by tags (comma-sep)..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    onKeyPress={handleKeyPress} // Add Enter key handler
                    style={{ padding: '8px', flexGrow: 1, minWidth: '200px' }}
                />
                 <button onClick={handleSearch} style={{ padding: '8px 15px' }}>Search</button>
                 {isNgo && (
                    <button onClick={handleSaveSearch} disabled={!searchTerm && !tagFilter} style={{ padding: '8px 15px' }}>
                        Save Search
                    </button>
                 )}
            </div>
             {isNgo && saveSearchMessage && <div style={{ marginBottom: '10px', color: saveSearchMessage.startsWith('Error') ? 'red' : 'green' }}>{saveSearchMessage}</div>}


            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && filteredOpportunities.length === 0 && <p>No matching funding opportunities found.</p>}

            {/* Display Current Page Opportunities */}
            {filteredOpportunities.map(opp => (
                <div key={opp.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{opp.title}</h3>
                    <p>
                        <strong>Funder:</strong> {opp.funderDisplayName}
                        {opp.funderWebsite && (
                            <> (<a href={opp.funderWebsite} target="_blank" rel="noopener noreferrer">Website</a>)</>
                        )}
                    </p>
                    <p>{opp.description}</p>
                    {opp.fundingAmountRange && <p><strong>Amount:</strong> {opp.fundingAmountRange}</p>}
                    {opp.eligibilityCriteria && <p><strong>Eligibility:</strong> {opp.eligibilityCriteria}</p>}
                    {opp.applicationDeadline && <p><strong>Deadline:</strong> {new Date(opp.applicationDeadline).toLocaleDateString()}</p>}
                    {opp.tags && <p><strong>Tags:</strong> {opp.tags}</p>}
                     <p>
                        {opp.acceptsIntegratedApp ? (
                             <Link to={`/apply/${opp.id}`}>Apply Now (Internal)</Link>
                        ) : (
                             <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer">Apply / More Info (External)</a>
                        )}
                    </p>
                </div>
            ))}

             {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
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
        </div>
    );
};

export default FundingList;
