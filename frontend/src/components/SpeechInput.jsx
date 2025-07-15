import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setListening } from '../redux/conversationSlice';

export default function SpeechInput({ onResult }) {
  const dispatch = useDispatch();
  const listening = useSelector(state => state.conversation.listening);
  const role = useSelector(state => state.conversation.role);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    // Set language based on role
    recognition.lang = role === 'doctor' ? 'en-US' : 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognized:', transcript);
      onResult(transcript);
      dispatch(setListening(false));
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      dispatch(setListening(false));
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert(`Speech recognition error: ${event.error}`);
      dispatch(setListening(false));
    };
    
    recognitionRef.current = recognition;
    recognition.start();
    dispatch(setListening(true));
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      dispatch(setListening(false));
    }
  };

  const getLanguageLabel = () => {
    return role === 'doctor' ? 'English' : 'Spanish';
  };

  return (
    <div className="speech-input">
      <div className="speech-info">
        <span className="language-label">Speaking in: {getLanguageLabel()}</span>
        {listening && <span className="listening-indicator">🎤 Listening...</span>}
      </div>
      <button 
        onClick={listening ? stopListening : startListening}
        className={`speak-button ${listening ? 'listening' : ''}`}
        disabled={!('webkitSpeechRecognition' in window)}
      >
        {listening ? '🛑 Stop' : '🎤 Speak'}
      </button>
    </div>
  );
}
