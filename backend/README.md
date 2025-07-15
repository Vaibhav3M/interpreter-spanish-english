# Language Interpreter Backend

This is the Node.js backend server for the Language Interpreter application.

## Features

- **WebSocket Server**: Real-time communication with frontend
- **Translation Service**: English ↔ Spanish translation using OpenAI (or mock mode)
- **Action Detection**: Identifies medical actions from conversations
- **Conversation Summary**: Generates summaries of medical consultations
- **"Repeat That" Functionality**: Handles patient requests to repeat doctor's last utterance
- **Mock Mode**: Works without OpenAI API key for demo/testing

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=4000
   ```
   - If you do not provide an OpenAI API key, the backend will use mock translation and summary.

3. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /`: Health check endpoint
- `WebSocket /`: Real-time communication endpoint

## WebSocket Message Types

### From Client to Server
- `utterance`: Send speech input for translation
- `end_conversation`: Request conversation summary and action detection

### From Server to Client
- `utterance`: Translated speech output
- `summary`: Conversation summary and detected actions
- `error`: Error messages

## Development

```bash
# Install nodemon for development
npm install -g nodemon

# Run with auto-restart
nodemon server.js
```

## Troubleshooting

- **WebSocket Connection Issues**
  - Ensure the server is running on the correct port
  - Check firewall settings
  - Verify the WebSocket URL in the frontend

- **Translation Issues**
  - Verify OpenAI API key is valid
  - Check API usage limits
  - Ensure internet connectivity

- **Action Detection Issues**
  - Check conversation content for relevant keywords
  - Verify OpenAI API is responding correctly

## License
MIT 