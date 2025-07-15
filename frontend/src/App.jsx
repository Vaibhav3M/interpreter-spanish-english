import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setSummary, setRole, resetConversation } from './redux/conversationSlice';
import Chat from './components/Chat';
import SpeechInput from './components/SpeechInput';
import TTSOutput from './components/TTSOutput';
import ActionList from './components/ActionList';
import SummaryView from './components/SummaryView';
import './App.css';

const WS_URL = 'ws://localhost:4000'; // Update if backend is hosted elsewhere

function App() {
  const dispatch = useDispatch();
  const [ws, setWs] = useState(null);
  const [pendingTTS, setPendingTTS] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const role = useSelector(state => state.conversation.role);
  const messages = useSelector(state => state.conversation.messages);

  useEffect(() => {
    const socket = new window.WebSocket(WS_URL);
    
    socket.onopen = () => {
      setConnectionStatus('Connected');
    };
    
    socket.onclose = () => {
      setConnectionStatus('Disconnected');
    };
    
    socket.onerror = () => {
      setConnectionStatus('Connection Error');
    };
    
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'utterance') {
        dispatch(addMessage(msg));
        // Determine language for TTS based on role
        const lang = msg.role === 'doctor' ? 'es-ES' : 'en-US';
        setPendingTTS({ text: msg.translated, lang });
      }
      if (msg.type === 'summary') {
        dispatch(setSummary({ summary: msg.summary, actions: msg.actions }));
      }
    };
    setWs(socket);
    return () => socket.close();
  }, [dispatch]);

  const handleSpeechResult = (text) => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'utterance', role, text }));
    }
  };

  const endConversation = () => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'end_conversation' }));
    }
  };

  const switchRole = () => {
    const newRole = role === 'doctor' ? 'patient' : 'doctor';
    dispatch(setRole(newRole));
  };

  const handleResetConversation = () => {
    dispatch(resetConversation());
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Language Interpreter</h1>
        <div className="connection-status">
          Status: <span className={`status ${connectionStatus.toLowerCase().replace(' ', '-')}`}>
            {connectionStatus}
          </span>
        </div>
      </header>

      <main className="app-main">
        <div className="controls-section">
          <div className="role-selector">
            <h3>Current Role: <span className={`role ${role}`}>{role === 'doctor' ? '👨‍⚕️ Doctor (English)' : '👤 Patient (Spanish)'}</span></h3>
            <button onClick={switchRole} className="switch-role-btn">
              Switch to {role === 'doctor' ? 'Patient' : 'Doctor'}
            </button>
          </div>
          
          <div className="action-buttons">
            <SpeechInput onResult={handleSpeechResult} />
            <button 
              onClick={endConversation} 
              className="end-conversation-btn"
              disabled={messages.length === 0}
            >
              End Conversation
            </button>
            <button 
              onClick={handleResetConversation} 
              className="reset-btn"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="conversation-section">
          <Chat />
        </div>

        <div className="summary-section">
          <SummaryView />
          <ActionList />
        </div>
      </main>

      {pendingTTS && <TTSOutput text={pendingTTS.text} lang={pendingTTS.lang} />}
    </div>
  );
}

export default App;