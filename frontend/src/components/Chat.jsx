import React from 'react';
import { useSelector } from 'react-redux';

export default function Chat() {
  const messages = useSelector(state => state.conversation.messages);

  if (!messages || messages.length === 0) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 Conversation</h3>
        </div>
        <div className="empty-chat">
          <p>No messages yet. Start speaking to begin the conversation!</p>
          <p className="hint">💡 Try saying "Hello" or "Hola" to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Conversation ({messages.length} messages)</h3>
      </div>
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-header">
              <span className="role-icon">
                {msg.role === 'doctor' ? '👨‍⚕️' : '👤'}
              </span>
              <span className="role-name">
                {msg.role === 'doctor' ? 'Doctor' : 'Patient'}
              </span>
              <span className="message-time">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">
              <div className="original-text">
                <strong>Original:</strong> {msg.text}
              </div>
              {msg.translated && (
                <div className="translated-text">
                  <strong>Translated:</strong> {msg.translated}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 