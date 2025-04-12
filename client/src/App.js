import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AuthService from './services/auth.service';

// Import components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
// Profiles
import NgoProfileForm from './components/Profile/NgoProfileForm';
import FunderProfileForm from './components/Profile/FunderProfileForm';
import ProviderProfileForm from './components/Profile/ProviderProfileForm'; // Import Provider Profile Form
// Admin
import VerifyNgos from './components/Admin/VerifyNgos';
import CreateFundingOpportunity_Admin from './components/Admin/CreateFundingOpportunity';
import CreateDiscountOffer_Admin from './components/Admin/CreateDiscountOffer';
import AdminDashboard from './components/Admin/AdminDashboard'; // Import Admin Dashboard
import UserManagement from './components/Admin/UserManagement'; // Import User Management
import AdminManageFunding from './components/Admin/AdminManageFunding'; // Import Admin Manage Funding
import AdminManageDiscounts from './components/Admin/AdminManageDiscounts'; // Import Admin Manage Discounts
// Public Lists
import FundingList from './components/Public/FundingList';
import DiscountList from './components/Public/DiscountList';
// Funder
import FundingOpportunityForm from './components/Funder/CreateFundingOpportunityForm';
import MyFundingOpportunitiesList from './components/Funder/MyFundingOpportunitiesList'; // Import list component
import ViewApplications from './components/Funder/ViewApplications'; // Import View Applications
// Provider
import DiscountOfferForm from './components/Provider/CreateDiscountOfferForm';
import MyDiscountOffersList from './components/Provider/MyDiscountOffersList'; // Import list component
import NgoDashboardSavedSearches from './components/Dashboard/NgoDashboardSavedSearches'; // Import Saved Searches component
import ApplicationForm from './components/Application/ApplicationForm'; // Import Application Form
import MyApplicationsList from './components/Application/MyApplicationsList'; // Import My Applications List
import NotificationsDisplay from './components/Notifications/NotificationsDisplay'; // Import Notifications


function Home() {
  return (
      <div>
        <h2>Welcome to the NGO Platform</h2>
        <p>Connecting NGOs with funding and discounts.</p>
        <p>
            <Link to="/funding">View Funding Opportunities</Link> | <Link to="/discounts">View Discount Offers</Link>
        </p>
      </div>
  );
}

function DashboardPlaceholder() {
    const currentUser = AuthService.getCurrentUser();
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome, {currentUser?.email}!</p>
            <p>Role: {currentUser?.role}</p>
            {currentUser?.role === 'ngo_admin' && (
                 <>
                    {!currentUser?.isVerified && (
                        <p style={{color: 'orange'}}>Your account is pending verification.</p>
                    )}
                    <p><Link to="/profile">Edit Your NGO Profile</Link></p>
                    <p><Link to="/my-applications">View My Submitted Applications</Link></p> {/* Add link */}
                    <NgoDashboardSavedSearches />
                 </>
            )}
             {currentUser?.role === 'funder' && (
                 <>
                    <p><Link to="/funder/profile">Edit Your Funder Profile</Link></p>
                    {/* Link to the list/management page */}
                    <p><Link to="/funder/funding/my">Manage Funding Opportunities</Link></p>
                 </>
             )}
             {currentUser?.role === 'service_provider' && (
                 <>
                    <p><Link to="/provider/profile">Edit Your Provider Profile</Link></p>
                    {/* Link to the list/management page */}
                    <p><Link to="/provider/discounts/my">Manage Discount Offers</Link></p>
                 </>
             )}
             {currentUser?.role === 'platform_admin' && (
                 <>
                    {/* Link to the main Admin Dashboard */}
                    <p><Link to="/admin">Admin Dashboard</Link></p>
                 </>
             )}
        </div>
    );
}


function App() {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    window.location.href = "/login"; // Force redirect after logout
  };


  return (
    <Router>
      <div>
         <nav>
          <ul style={{ display: 'flex', alignItems: 'center' }}> {/* Use flexbox for alignment */}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/funding">Funding</Link></li>
            <li><Link to="/discounts">Discounts</Link></li>

            {currentUser ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                {/* Conditionally show profile links */}
                {currentUser.role === 'ngo_admin' && <li><Link to="/profile">NGO Profile</Link></li>}
                {currentUser.role === 'funder' && <li><Link to="/funder/profile">Funder Profile</Link></li>}
                {currentUser.role === 'service_provider' && <li><Link to="/provider/profile">Provider Profile</Link></li>}
                 {/* Conditionally show management links */}
                {currentUser.role === 'ngo_admin' && <li><Link to="/my-applications">My Applications</Link></li>}
                {currentUser.role === 'funder' && <li><Link to="/funder/funding/my">My Opportunities</Link></li>}
                {currentUser.role === 'service_provider' && <li><Link to="/provider/discounts/my">My Offers</Link></li>}
                {/* Conditionally show admin links */}
                {currentUser.role === 'platform_admin' && <li><Link to="/admin">Admin</Link></li>}

                {/* Spacer to push logout/notifications to the right */}
                <li style={{ flexGrow: 1 }}></li>

                 {/* Notifications Component */}
                 <li style={{ marginRight: '15px' }}><NotificationsDisplay /></li>

                <li><a href="/login" onClick={logOut} style={{cursor: 'pointer'}}>Logout</a></li>
              </>
            ) : (
              <>
                 {/* Spacer for non-logged-in users */}
                 <li style={{ flexGrow: 1 }}></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>

        <hr />

        <div className="container mt-3">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/funding" element={<FundingList />} />
              <Route path="/discounts" element={<DiscountList />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<DashboardPlaceholder />} />
              {/* NGO */}
              <Route path="/profile" element={<NgoProfileForm />} />
              <Route path="/apply/:opportunityId" element={<ApplicationForm />} />
              <Route path="/my-applications" element={<MyApplicationsList />} /> {/* Add route */}

              {/* Funder */}
              <Route path="/funder/profile" element={<FunderProfileForm />} />
              <Route path="/funder/funding/create" element={<FundingOpportunityForm />} />
              <Route path="/funder/funding/my" element={<MyFundingOpportunitiesList />} />
              <Route path="/funder/funding/edit/:opportunityId" element={<FundingOpportunityForm />} />
              <Route path="/funder/funding/:opportunityId/applications" element={<ViewApplications />} /> {/* Route for viewing applications */}

              {/* Provider */}
              <Route path="/provider/profile" element={<ProviderProfileForm />} />
              {/* Use renamed form component for create */}
              <Route path="/provider/discounts/create" element={<DiscountOfferForm />} />
              {/* Add route for listing Provider's offers */}
              <Route path="/provider/discounts/my" element={<MyDiscountOffersList />} />
              {/* Add route for editing an offer */}
              <Route path="/provider/discounts/edit/:offerId" element={<DiscountOfferForm />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} /> {/* Main admin route */}
              <Route path="/admin/verify-ngos" element={<VerifyNgos />} />
              {/* Admin Create Routes (using existing components or dedicated ones) */}
              <Route path="/admin/create-funding" element={<FundingOpportunityForm isAdmin={true} />} />
              <Route path="/admin/create-discount" element={<DiscountOfferForm isAdmin={true} />} />
              <Route path="/admin/users" element={<UserManagement />} />
              {/* Admin Content Management List Routes */}
              <Route path="/admin/content/funding" element={<AdminManageFunding />} />
              <Route path="/admin/content/discounts" element={<AdminManageDiscounts />} />
              {/* Admin Content Edit Routes (using modified forms) */}
              <Route path="/admin/content/funding/edit/:opportunityId" element={<FundingOpportunityForm isAdmin={true} />} />
              <Route path="/admin/content/discounts/edit/:offerId" element={<DiscountOfferForm isAdmin={true} />} />

            </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
