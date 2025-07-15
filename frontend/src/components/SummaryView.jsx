import React from 'react';
import { useSelector } from 'react-redux';

export default function SummaryView() {
  const summary = useSelector(state => state.conversation.summary);

  if (!summary) return null;

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h3>📋 Conversation Summary</h3>
      </div>
      <div className="summary-content">
        <p>{summary}</p>
      </div>
    </div>
  );
}
