import React from 'react';
import { useSelector } from 'react-redux';

export default function Chat() {
  const messages = useSelector(state => state.conversation.messages);

  if (!messages || messages.length === 0) return <div>No messages yet.</div>;

  return (
    <div className="chat">
      <h3>Conversation</h3>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <b>{msg.role}:</b> {msg.translated || msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
 