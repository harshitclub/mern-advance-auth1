import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const API_URL = `${BACKEND_URL}/api/users/`;

// Validate email
export const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

//register user
const register = async (userData) => {
  const response = await axios.post(API_URL + "register", userData);

  return response.data;
};

//login user
const login = async (userData) => {
  const response = await axios.post(API_URL + "login", userData);

  return response.data;
};

//logout user
const logout = async (userData) => {
  const response = await axios.get(API_URL + "logout", userData);

  return response.data.message;
};

//login status
const loginStatus = async (userData) => {
  const response = await axios.get(API_URL + "loginStatus", userData);

  return response.data;
};

//get user profile
const getUser = async (userData) => {
  const response = await axios.get(API_URL + "getUser", userData);

  return response.data;
};

//update user
const updateUser = async (userData) => {
  const response = await axios.patch(API_URL + "updateUser", userData);

  return response.data;
};

//send verification email
const sendVerificationEmail = async () => {
  const response = await axios.post(API_URL + "verificationEmail");

  return response.data.message;
};

//verify user
const verifyUser = async (verificationToken) => {
  const response = await axios.patch(
    `${API_URL}verifyUser/${verificationToken}`
  );

  return response.data.message;
};

//change user password
const changePassword = async (userData) => {
  const response = await axios.patch(API_URL + "changePassword", userData);

  return response.data.message;
};

//forgot password
const forgotPassword = async (userData) => {
  const response = await axios.post(API_URL + "forgotPassword", userData);

  return response.data.message;
};

//reset password
const resetPassword = async (userData, resetToken) => {
  const response = await axios.patch(
    `${API_URL}resetPassword/${resetToken}`,
    userData
  );

  return response.data.message;
};

// Get Users
const getUsers = async () => {
  const response = await axios.get(API_URL + "getUsers");

  return response.data;
};

// Delete User
const deleteUser = async (id) => {
  const response = await axios.delete(API_URL + id);

  return response.data.message;
};

// Upgrade User
const upgradeUser = async (userData) => {
  const response = await axios.post(API_URL + "upgradeUser", userData);

  return response.data.message;
};

const authService = {
  register,
  login,
  logout,
  loginStatus,
  getUser,
  updateUser,
  sendVerificationEmail,
  verifyUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  upgradeUser,
};

export default authService;
