import axios from 'axios';
import authHeader from './auth-header'; // Helper to get JWT token header

const API_URL = '/api/ngo/';

// Get the current logged-in NGO's profile
const getMyProfile = () => {
  return axios.get(API_URL + 'profile/me', { headers: authHeader() });
};

// Update the current logged-in NGO's profile
const updateMyProfile = (profileData) => {
  return axios.put(API_URL + 'profile/me', profileData, { headers: authHeader() });
};

// Saved Searches
const createSavedSearch = (searchData) => {
  // searchData should contain { searchType: 'funding'|'discounts', keywords: '...', searchName: '...' (optional) }
  return axios.post(API_URL + 'saved-searches', searchData, { headers: authHeader() });
};

const getMySavedSearches = () => {
  return axios.get(API_URL + 'saved-searches', { headers: authHeader() });
};

const deleteMySavedSearch = (searchId) => {
  return axios.delete(API_URL + `saved-searches/${searchId}`, { headers: authHeader() });
};


// Application Submission
const submitApplication = (opportunityId, submissionData) => {
  // submissionData should be an object { fieldLabel: value, ... }
  return axios.post(API_URL + `opportunities/${opportunityId}/apply`, { submissionData }, { headers: authHeader() });
};

// Application Tracking
const listMyApplications = () => {
  return axios.get(API_URL + 'applications', { headers: authHeader() });
};

const NgoService = {
  getMyProfile,
  updateMyProfile,
  createSavedSearch, // Add new function
  getMySavedSearches, // Add new function
  deleteMySavedSearch, // Add new function
  submitApplication,
  listMyApplications, // Add new function
};

export default NgoService;
