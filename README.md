# Language Interpreter End-to-End Proof-of-Concept

A real-time language interpreter system designed to facilitate communication between English-speaking clinicians and Spanish-speaking patients during medical visits.

## Features

- **Real-time Speech-to-Text & Text-to-Speech**: Natural conversation flow with automatic speech recognition and synthesis
- **Bidirectional Translation**: English ↔ Spanish translation using OpenAI GPT-3.5-turbo
- **"Repeat That" Command**: Patients can request repetition of the last doctor's utterance
- **Conversation Summary**: Automatic generation of conversation summaries
- **Action Detection**: Identifies medical actions like "schedule followup appointment" and "send lab order"
- **Action Execution**: Execute detected actions via webhook integration (stretch goal)

## Tech Stack

- **Frontend**: React.js with Redux for state management
- **Backend**: Node.js with Express and WebSocket
- **Translation**: OpenAI GPT-3.5-turbo (with mock fallback)
- **Real-time Communication**: WebSocket
- **Speech**: Web Speech API (SpeechRecognition & SpeechSynthesis)

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (optional - system works with mock translation)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interpreter-spanish-english
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # In backend directory, create .env file
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   echo "PORT=4000" >> .env
   ```

4. **Start the servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory, in new terminal)
   npm run dev
   ```

5. **Open the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## Usage

### Basic Conversation Flow
1. **Start Speaking**: Click the "Speak" button to begin speech recognition
2. **Role Detection**: System automatically detects if you're speaking as doctor (English) or patient (Spanish)
3. **Translation**: Your speech is translated and spoken back in the other language
4. **Continue Conversation**: Repeat for natural back-and-forth communication

### Special Commands
- **"Repeat that"**: If you're the patient, say "repeat that" to hear the last doctor's utterance again

### End Conversation
1. Click "End Conversation" button
2. View the generated summary and detected actions
3. Optionally execute actions using the "Execute" buttons

### Action Execution (Stretch Goal)
1. Get a webhook URL from [webhook.site](https://webhook.site)
2. Update the webhook URL in `frontend/src/components/ActionList.jsx`
3. Click "Execute" on any detected action to send it to the webhook

## Project Structure

```
interpreter-spanish-english/
├── backend/
│   ├── server.js          # WebSocket server & translation logic
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx           # Conversation display
│   │   │   ├── SpeechInput.jsx    # Speech recognition
│   │   │   ├── TTSOutput.jsx      # Text-to-speech
│   │   │   ├── SummaryView.jsx    # Summary display
│   │   │   └── ActionList.jsx     # Action display & execution
│   │   ├── redux/
│   │   │   ├── conversationSlice.js  # Redux state management
│   │   │   └── store.js
│   │   └── App.jsx               # Main application
│   └── package.json
├── FEATURES.md            # Feature documentation
├── TECHNICAL_DESIGN.md    # Technical design document
└── README.md
```

## Configuration

### OpenAI API (Optional)
- Get an API key from [OpenAI](https://platform.openai.com/)
- Add to `backend/.env`: `OPENAI_API_KEY=your_key_here`
- Without API key, system uses mock translation and summary

### Webhook Integration
- Update webhook URL in `ActionList.jsx` for action execution
- Default: `https://webhook.site/your-unique-url`

## Development

### Backend Development
```bash
cd backend
npm start
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Key Files for Modification
- **Translation Logic**: `backend/server.js` - `translateText()` function
- **Action Detection**: `backend/server.js` - `summarizeAndDetectActions()` function
- **UI Components**: `frontend/src/components/`
- **State Management**: `frontend/src/redux/conversationSlice.js`

## Testing

### Manual Testing
1. **Speech Recognition**: Test with different accents and speech patterns
2. **Translation Quality**: Verify English-Spanish translation accuracy
3. **"Repeat That"**: Test the special command functionality
4. **Action Detection**: Have conversations that include medical actions
5. **Webhook Integration**: Verify action execution via webhook

### Browser Compatibility
- Chrome/Edge: Full support for Web Speech API
- Firefox: Limited support for SpeechRecognition
- Safari: Limited support for SpeechRecognition

## Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Ensure you're using Chrome/Edge
   - Check microphone permissions
   - Verify HTTPS in production (required for Speech API)

2. **Translation Not Working**
   - Check OpenAI API key in `.env`
   - Verify internet connection
   - Check browser console for errors

3. **WebSocket Connection Issues**
   - Ensure backend is running on port 4000
   - Check firewall settings
   - Verify WebSocket URL in frontend

4. **Action Execution Fails**
   - Verify webhook URL is correct
   - Check webhook.site for received requests
   - Ensure CORS is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for translation and summarization capabilities
- Web Speech API for speech recognition and synthesis
- React and Redux for frontend architecture
- WebSocket for real-time communication