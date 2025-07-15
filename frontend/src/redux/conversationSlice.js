import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  summary: null,
  actions: [],
  role: 'doctor', // or 'patient'
  listening: false,
  conversationEnded: false,
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
      state.conversationEnded = true;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setListening: (state, action) => {
      state.listening = action.payload;
    },
    resetConversation: (state) => {
      state.messages = [];
      state.summary = null;
      state.actions = [];
      state.listening = false;
      state.conversationEnded = false;
    },
    clearSummary: (state) => {
      state.summary = null;
      state.actions = [];
      state.conversationEnded = false;
    },
  },
});

export const { 
  addMessage, 
  setSummary, 
  setRole, 
  setListening, 
  resetConversation, 
  clearSummary 
} = conversationSlice.actions;
export default conversationSlice.reducer;