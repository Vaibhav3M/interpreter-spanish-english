import React from 'react';
import { useSelector } from 'react-redux';

export default function ActionList() {
  const actions = useSelector(state => state.conversation.actions);

  if (!actions || actions.length === 0) return null;

  return (
    <div className="actions">
      <h3>Detected Actions</h3>
      <ul>
        {actions.map((a, idx) => (
          <li key={idx}>
            <b>{a.type}</b>: {a.details}
          </li>
        ))}
      </ul>
    </div>
  );
}
