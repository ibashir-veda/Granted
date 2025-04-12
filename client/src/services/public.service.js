import axios from 'axios';

const API_URL = '/api/public/';

// Updated to accept params object
const getFundingOpportunities = (params = {}) => {
  // params = { page: 1, size: 10, q: 'keyword', tags: 'tag1,tag2' }
  return axios.get(API_URL + 'funding', { params });
};

// Updated to accept params object
const getDiscountOffers = (params = {}) => {
   // params = { page: 1, size: 10, q: 'keyword', categoryTags: 'cat1,cat2' }
  return axios.get(API_URL + 'discounts', { params });
};

const PublicService = {
  getFundingOpportunities,
  getDiscountOffers,
};

export default PublicService;
