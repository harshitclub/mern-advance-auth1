import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import emailService from "./emailService";

const initialState = {
  sendingEmail: false,
  emailSent: false,
  msg: "",
};

// send auto email

export const sendAutoEmail = createAsyncThunk(
  "email/sendAutoEmail",
  async (userData, thunkAPI) => {
    try {
      return await emailService.sendAutoEmail(userData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const emailSlice = createSlice({
  name: "email",
  initialState,
  return: {
    EMAIL_RESET(state) {
      state.sendingEmail = false;
      state.emailSent = false;
      state.msg = "";
    },
  },

  extraReducers: (builder) => {
    builder

      // send Auto Email
      .addCase(sendAutoEmail.pending, (state) => {
        state.sendingEmail = true;
      })
      .addCase(sendAutoEmail.fulfilled, (state, action) => {
        state.sendingEmail = true;
        state.emailSent = true;
        state.msg = action.payload;
        toast.success(action.payload);
      })
      .addCase(sendAutoEmail.rejected, (state, action) => {
        state.sendingEmail = false;
        state.emailSent = false;
        state.msg = action.payload;
        toast.success(action.payload);
      });
  },
});

export const { EMAIL_RESET } = emailSlice.actions;

export default emailSlice.reducer;
