import axios from "axios";
import { API_URL } from "../auth/authService";

// send automated email
const sendAutoEmail = async (emailData) => {
  const response = await axios.post(API_URL + "sendAutoEmail", emailData);

  return response.data.message;
};

const emailService = { sendAutoEmail };

export default emailService;
