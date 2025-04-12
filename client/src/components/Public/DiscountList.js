import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import PublicService from '../../services/public.service';
import NgoService from '../../services/ngo.service';
import AuthService from '../../services/auth.service';

const DiscountList = () => {
    // Remove 'offers' state
    const [filteredOffers, setFilteredOffers] = useState([]); // Holds current page items
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [saveSearchMessage, setSaveSearchMessage] = useState('');
    const [currentUser] = useState(AuthService.getCurrentUser());
    const isNgo = currentUser && currentUser.role === 'ngo_admin';
    const canViewRedemption = isNgo && currentUser.isVerified;
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // Function to fetch data
    const fetchData = useCallback((page, keyword, categories) => {
        setLoading(true);
        setError('');
        const params = { page, size: pageSize };
        if (keyword) params.q = keyword;
        if (categories) params.categoryTags = categories; // Match backend param name

        PublicService.getDiscountOffers(params).then(
            (response) => {
                const { items, totalPages, totalItems, currentPage: respCurrentPage } = response.data;
                setFilteredOffers(items);
                setTotalPages(totalPages);
                setTotalItems(totalItems);
                 if (currentPage !== respCurrentPage) {
                    setCurrentPage(respCurrentPage);
                }
                setLoading(false);
            },
            (error) => {
                setError("Error loading offers: " + ((error.response?.data?.message) || error.message || error.toString()));
                setLoading(false);
            }
        );
    }, [currentPage]); // Include currentPage dependency

    // Effect to load initial data and react to search param changes
    useEffect(() => {
        const pageQuery = parseInt(searchParams.get('page') || '1', 10);
        const query = searchParams.get('q') || '';
        const categoriesQuery = searchParams.get('categories') || ''; // Use 'categories' from saved search link

        setSearchTerm(query);
        setCategoryFilter(categoriesQuery);
        setCurrentPage(pageQuery);

        fetchData(pageQuery, query, categoriesQuery);

    }, [searchParams, fetchData]);

    // Function to handle search/filter changes
    const handleSearch = () => {
        setCurrentPage(1);
        const params = {};
        if (searchTerm) params.q = searchTerm;
        if (categoryFilter) params.categories = categoryFilter; // Use 'categories' for URL param
        params.page = '1';
        setSearchParams(params);
        // fetchData(1, searchTerm, categoryFilter);
    };

     // Handle Enter key press
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const params = { ...Object.fromEntries(searchParams), page: newPage.toString() };
            setSearchParams(params);
            // fetchData(newPage, searchTerm, categoryFilter);
        }
    };

    // Remove client-side filtering useEffect

     const handleSaveSearch = () => {
        // ... existing save search logic using current searchTerm and categoryFilter ...
         if (!searchTerm && !categoryFilter) {
            setSaveSearchMessage("Please enter keywords or categories to save a search.");
            return;
        }
        setSaveSearchMessage('Saving...');
        NgoService.createSavedSearch({
            searchType: 'discounts',
            keywords: searchTerm,
            filters: { categories: categoryFilter } // Ensure 'categories' matches saved search model/logic
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
            <h2>Discount Offers ({totalItems > 0 ? totalItems : '...'})</h2>

             {/* Search & Filter Inputs */}
            <div style={{ margin: '10px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                     style={{ padding: '8px', flexGrow: 1, minWidth: '200px' }}
                />
                 <input
                    type="text"
                    placeholder="Filter by categories (comma-sep)..."
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    onKeyPress={handleKeyPress}
                     style={{ padding: '8px', flexGrow: 1, minWidth: '200px' }}
                />
                 <button onClick={handleSearch} style={{ padding: '8px 15px' }}>Search</button>
                 {isNgo && (
                    <button onClick={handleSaveSearch} disabled={!searchTerm && !categoryFilter} style={{ padding: '8px 15px' }}>
                        Save Search
                    </button>
                 )}
            </div>
             {isNgo && saveSearchMessage && <div style={{ marginBottom: '10px', color: saveSearchMessage.startsWith('Error') ? 'red' : 'green' }}>{saveSearchMessage}</div>}


            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && filteredOffers.length === 0 && <p>No matching discount offers found.</p>}

            {/* Display Current Page Offers */}
            {filteredOffers.map(offer => (
                 <div key={offer.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{offer.productServiceName}</h3>
                    <p>
                        <strong>Provider:</strong> {offer.providerDisplayName}
                        {offer.providerWebsite && (
                            <> (<a href={offer.providerWebsite} target="_blank" rel="noopener noreferrer">Website</a>)</>
                        )}
                    </p>
                    <p>{offer.description}</p>
                    <p><strong>Offer:</strong> {offer.discountDetails}</p>
                    {offer.eligibilityCriteria && <p><strong>Eligibility:</strong> {offer.eligibilityCriteria}</p>}
                    {offer.validityPeriod && <p><strong>Validity:</strong> {offer.validityPeriod}</p>}
                    {offer.categoryTags && <p><strong>Category:</strong> {offer.categoryTags}</p>}
                    <div>
                        <strong>Redemption:</strong>
                        {canViewRedemption ? (
                            <p>{offer.redemptionInfo}</p>
                        ) : (
                            <p><i>Login as a verified NGO to view redemption details.</i></p>
                        )}
                    </div>
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

export default DiscountList;
