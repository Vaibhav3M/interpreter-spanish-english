import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export default function ActionList() {
  const actions = useSelector(state => state.conversation.actions);
  const [executingActions, setExecutingActions] = useState(new Set());

  if (!actions || actions.length === 0) return null;

  const executeAction = async (action) => {
    if (executingActions.has(action.type)) return;
    
    setExecutingActions(prev => new Set(prev).add(action.type));
    
    try {
      // Using webhook.site as mentioned in the project instructions
      // You can get a unique URL from https://webhook.site/
      const webhookUrl = 'https://webhook.site/your-unique-url'; // Replace with your webhook URL
      
      const payload = {
        action: action.type,
        details: action.details,
        timestamp: new Date().toISOString(),
        source: 'Language Interpreter System',
        priority: 'normal'
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        alert(`✅ Action "${action.type}" executed successfully!\n\nCheck webhook.site to see the request.`);
      } else {
        alert(`❌ Failed to execute action "${action.type}"\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      alert(`❌ Error executing action "${action.type}":\n\n${error.message}\n\nMake sure to update the webhook URL in ActionList.jsx`);
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.type);
        return newSet;
      });
    }
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('schedule') || actionType.includes('appointment')) {
      return '📅';
    } else if (actionType.includes('lab') || actionType.includes('test')) {
      return '🧪';
    } else if (actionType.includes('prescription') || actionType.includes('medication')) {
      return '💊';
    } else {
      return '⚡';
    }
  };

  return (
    <div className="actions-container">
      <div className="actions-header">
        <h3>🎯 Detected Actions</h3>
        <p className="actions-hint">
          Click "Execute" to send these actions to the webhook for processing
        </p>
      </div>
      <div className="actions-list">
        {actions.map((action, idx) => (
          <div key={idx} className="action-item">
            <div className="action-icon">
              {getActionIcon(action.type)}
            </div>
            <div className="action-content">
              <h4 className="action-type">{action.type}</h4>
              <p className="action-details">{action.details}</p>
            </div>
            <button 
              onClick={() => executeAction(action)}
              className={`execute-button ${executingActions.has(action.type) ? 'executing' : ''}`}
              disabled={executingActions.has(action.type)}
            >
              {executingActions.has(action.type) ? '⏳ Executing...' : 'Execute'}
            </button>
          </div>
        ))}
      </div>
      <div className="webhook-info">
        <p>
          <strong>Note:</strong> Update the webhook URL in <code>ActionList.jsx</code> to see real action execution.
          Get a unique URL from <a href="https://webhook.site" target="_blank" rel="noopener noreferrer">webhook.site</a>
        </p>
      </div>
    </div>
  );
}
