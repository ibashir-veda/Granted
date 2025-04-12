import axios from 'axios';

// Use the proxy defined in package.json for development
// For production, you might need to set the full API URL
const API_URL = "/api/auth/";

const register = (email, password, role) => {
  return axios.post(API_URL + "signup", {
    email,
    password,
    role,
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "signin", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        // Store user details and JWT token in local storage
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
