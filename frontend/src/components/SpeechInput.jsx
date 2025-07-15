import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setListening } from '../redux/conversationSlice';

export default function SpeechInput({ onResult }) {
  const dispatch = useDispatch();
  const listening = useSelector(state => state.conversation.listening);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US'; // or 'es-ES' based on role
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      dispatch(setListening(false));
    };
    recognition.onend = () => dispatch(setListening(false));
    recognition.onerror = () => dispatch(setListening(false));
    recognitionRef.current = recognition;
    recognition.start();
    dispatch(setListening(true));
  };

  const stopListening = () => {
    recognitionRef.current && recognitionRef.current.stop();
    dispatch(setListening(false));
  };

  return (
    <button onClick={listening ? stopListening : startListening}>
      {listening ? 'Stop' : 'Speak'}
    </button>
  );
}
