import { createSlice } from "@reduxjs/toolkit";

const meetingSlice = createSlice({
  name: "meetingData",
  initialState: {
    data: [],
    isLoading: false,
    error: "",
  },
  reducers: {
    setMeetingLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMeetingData: (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = "";
    },
    setMeetingError: (state, action) => {
      state.isLoading = false;
      state.data = [];
      state.error = action.payload;
    },
    clearMeetingData: (state) => {
      state.data = [];
      state.isLoading = false;
      state.error = "";
    },
  },
});

export const { setMeetingLoading, setMeetingData, setMeetingError, clearMeetingData } = meetingSlice.actions;
export default meetingSlice.reducer;
