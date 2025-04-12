import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/admin/';

const getUnverifiedNgos = () => {
  return axios.get(API_URL + 'ngos/unverified', { headers: authHeader() });
};

const verifyNgo = (userId) => {
  return axios.patch(API_URL + `ngos/${userId}/verify`, {}, { headers: authHeader() });
};

const createFundingOpportunity = (data) => {
  return axios.post(API_URL + 'funding', data, { headers: authHeader() });
};

const createDiscountOffer = (data) => {
  return axios.post(API_URL + 'discounts', data, { headers: authHeader() });
};

const getDashboardStats = () => {
  return axios.get(API_URL + 'stats', { headers: authHeader() });
};

// User Management
const listUsers = (page = 1, size = 10) => { // Default page 1, size 10
  return axios.get(API_URL + 'users', {
      params: { page, size }, // Send as query parameters
      headers: authHeader()
  });
};

const updateUser = (userId, data) => {
  // data should contain { role: '...', isVerified: true/false } (optional fields)
  return axios.patch(API_URL + `users/${userId}`, data, { headers: authHeader() });
};

// Add deleteUser later

// Admin Content Management
const listAllOpportunities = () => {
  return axios.get(API_URL + 'content/funding', { headers: authHeader() });
};
const getOpportunityDetails = (opportunityId) => {
  return axios.get(API_URL + `content/funding/${opportunityId}`, { headers: authHeader() });
};
const updateOpportunity = (opportunityId, data) => {
  return axios.put(API_URL + `content/funding/${opportunityId}`, data, { headers: authHeader() });
};
const deleteOpportunity = (opportunityId) => {
  return axios.delete(API_URL + `content/funding/${opportunityId}`, { headers: authHeader() });
};

const listAllOffers = () => {
  return axios.get(API_URL + 'content/discounts', { headers: authHeader() });
};
const getOfferDetails = (offerId) => {
  return axios.get(API_URL + `content/discounts/${offerId}`, { headers: authHeader() });
};
const updateOffer = (offerId, data) => {
  return axios.put(API_URL + `content/discounts/${offerId}`, data, { headers: authHeader() });
};
const deleteOffer = (offerId) => {
  return axios.delete(API_URL + `content/discounts/${offerId}`, { headers: authHeader() });
};


const AdminService = {
  getUnverifiedNgos,
  verifyNgo,
  createFundingOpportunity, // Add new function
  createDiscountOffer,
  getDashboardStats, // Add new function
  listUsers, // Add new function
  updateUser,
  // Admin Content Management
  listAllOpportunities,
  getOpportunityDetails,
  updateOpportunity,
  deleteOpportunity,
  listAllOffers,
  getOfferDetails,
  updateOffer,
  deleteOffer,
};

export default AdminService;
