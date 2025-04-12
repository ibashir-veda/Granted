import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/funder/';

// Profile
const getMyProfile = () => {
  return axios.get(API_URL + 'profile/me', { headers: authHeader() });
};

const updateMyProfile = (profileData) => {
  return axios.put(API_URL + 'profile/me', profileData, { headers: authHeader() });
};

// Funding Opportunities
const createFundingOpportunity = (data) => {
  return axios.post(API_URL + 'funding', data, { headers: authHeader() });
};

const getMyFundingOpportunities = () => {
  return axios.get(API_URL + 'funding/my', { headers: authHeader() });
};

const getMyFundingOpportunityDetails = (opportunityId) => {
  return axios.get(API_URL + `funding/${opportunityId}`, { headers: authHeader() });
};

const updateMyFundingOpportunity = (opportunityId, data) => {
  return axios.put(API_URL + `funding/${opportunityId}`, data, { headers: authHeader() });
};

const deleteMyFundingOpportunity = (opportunityId) => {
  return axios.delete(API_URL + `funding/${opportunityId}`, { headers: authHeader() });
};

// Application Viewing
const listOpportunityApplications = (opportunityId) => {
  return axios.get(API_URL + `funding/${opportunityId}/applications`, { headers: authHeader() });
};


// Application Status Update
const updateApplicationStatus = (submissionId, status) => {
  return axios.patch(API_URL + `applications/${submissionId}/status`, { status }, { headers: authHeader() });
};

const FunderService = {
  getMyProfile,
  updateMyProfile,
  createFundingOpportunity,
  getMyFundingOpportunities,
  getMyFundingOpportunityDetails, // Add new function
  updateMyFundingOpportunity, // Add new function
  listOpportunityApplications,
  updateApplicationStatus,
  deleteMyFundingOpportunity, // Add new function
};

export default FunderService;
