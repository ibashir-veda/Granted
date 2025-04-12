import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/provider/';

// Profile
const getMyProfile = () => {
  return axios.get(API_URL + 'profile/me', { headers: authHeader() });
};

const updateMyProfile = (profileData) => {
  return axios.put(API_URL + 'profile/me', profileData, { headers: authHeader() });
};

// Discount Offers
const createDiscountOffer = (data) => {
  return axios.post(API_URL + 'discounts', data, { headers: authHeader() });
};

const getMyDiscountOffers = () => {
  return axios.get(API_URL + 'discounts/my', { headers: authHeader() });
};

const getMyDiscountOfferDetails = (offerId) => {
  return axios.get(API_URL + `discounts/${offerId}`, { headers: authHeader() });
};

const updateMyDiscountOffer = (offerId, data) => {
  return axios.put(API_URL + `discounts/${offerId}`, data, { headers: authHeader() });
};

const deleteMyDiscountOffer = (offerId) => {
  return axios.delete(API_URL + `discounts/${offerId}`, { headers: authHeader() });
};

const ProviderService = {
  getMyProfile,
  updateMyProfile,
  createDiscountOffer,
  getMyDiscountOffers,
  getMyDiscountOfferDetails,
  updateMyDiscountOffer,
  deleteMyDiscountOffer,
};

export default ProviderService;
