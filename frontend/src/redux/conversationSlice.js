import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  summary: null,
  actions: [],
  role: 'doctor', // or 'patient'
  listening: false,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSummary: (state, action) => {
      state.summary = action.payload.summary;
      state.actions = action.payload.actions;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setListening: (state, action) => {
      state.listening = action.payload;
    },
    resetConversation: () => initialState,
  },
});

export const { addMessage, setSummary, setRole, setListening, resetConversation } = conversationSlice.actions;
export default conversationSlice.reducer;