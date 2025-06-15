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
    updateMeetingData: (state, action) => {
      state.isLoading = false;
      const updatedMeeting = action.payload;
      const index = state.data.findIndex(meeting => meeting._id === updatedMeeting._id);
      if (index !== -1) {
        state.data[index] = updatedMeeting;
      }
      state.error = "";
    },
    clearMeetingData: (state) => {
      state.data = [];
      state.isLoading = false;
      state.error = "";
    },
  },
});

export const { setMeetingLoading, setMeetingData, setMeetingError, updateMeetingData, clearMeetingData } = meetingSlice.actions;
export default meetingSlice.reducer;
