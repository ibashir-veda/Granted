import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/notifications/';

const getUnreadNotifications = () => {
  return axios.get(API_URL + 'unread', { headers: authHeader() });
};

const markAsRead = (notificationIds) => {
  // Expects an array of IDs
  return axios.patch(API_URL + 'read', { ids: notificationIds }, { headers: authHeader() });
};

const markAllAsRead = () => {
    return axios.patch(API_URL + 'read-all', {}, { headers: authHeader() });
};


const NotificationService = {
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
};

export default NotificationService;
