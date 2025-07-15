import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setSummary } from './redux/conversationSlice';
import Chat from './components/Chat';
import SpeechInput from './components/SpeechInput';
import TTSOutput from './components/TTSOutput';
import ActionList from './components/ActionList';
import SummaryView from './components/SummaryView';

const WS_URL = 'ws://localhost:4000'; // Update if backend is hosted elsewhere

function App() {
  const dispatch = useDispatch();
  const [ws, setWs] = useState(null);
  const [pendingTTS, setPendingTTS] = useState(null);
  const role = useSelector(state => state.conversation.role);

  useEffect(() => {
    const socket = new window.WebSocket(WS_URL);
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'utterance') {
        dispatch(addMessage(msg));
        setPendingTTS({ text: msg.translated, lang: msg.role === 'doctor' ? 'es-ES' : 'en-US' });
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

  return (
    <div>
      <h1>Language Interpreter</h1>
      <Chat />
      <SpeechInput onResult={handleSpeechResult} />
      <button onClick={endConversation}>End Conversation</button>
      <SummaryView />
      <ActionList />
      {pendingTTS && <TTSOutput text={pendingTTS.text} lang={pendingTTS.lang} />}
    </div>
  );
}

export default App;