# Language Interpreter Frontend

This is the React.js frontend for the Language Interpreter application.

## Features

- **Real-time Speech-to-Text & Text-to-Speech**: Speak and listen in English or Spanish
- **Bidirectional Translation**: English ↔ Spanish
- **Role Switching**: Toggle between Doctor (English) and Patient (Spanish)
- **"Repeat That" Command**: Patient can say "repeat that" to hear the last doctor's utterance
- **Conversation Summary**: Automatic summary at the end of the session
- **Action Detection**: Detects actions like scheduling followups or sending lab orders
- **Action Execution**: (Stretch) Send actions to a webhook (webhook.site)
- **Modern, Responsive UI**: Beautiful, accessible, and mobile-friendly

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the frontend**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

3. **Connect to Backend**
   - The frontend expects the backend WebSocket at `ws://localhost:4000` by default.
   - To change, update `WS_URL` in `src/App.jsx`.

## Usage

- Use the role switcher to toggle between Doctor (English) and Patient (Spanish).
- Click "Speak" and talk in the selected language.
- As the patient, say "repeat that" to hear the last doctor's utterance.
- Click "End Conversation" to see the summary and detected actions.
- (Stretch) Set your webhook.site URL in `ActionList.jsx` to test action execution.

## Web Speech API Requirements
- Use **Google Chrome** or **Microsoft Edge** (not supported in Firefox/Safari).
- Works on `localhost` or HTTPS only.
- Allow microphone permissions when prompted.

## Troubleshooting

- **Speech recognition error: network**
  - Use Chrome/Edge, not Incognito mode
  - Ensure you are online
  - Allow microphone permissions
  - Use HTTPS or localhost

- **No speech detected**
  - Speak clearly and wait for the beep
  - Check your microphone

- **WebSocket connection error**
  - Ensure the backend is running on port 4000
  - Check the `WS_URL` in `src/App.jsx`

## Customization

- **Webhook for Actions**: Get a unique URL from [webhook.site](https://webhook.site/) and update it in `src/components/ActionList.jsx`.
- **Styling**: Edit `src/App.css` for custom styles.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   ├── redux/
│   ├── App.jsx
│   ├── App.css
│   └── ...
├── public/
├── package.json
└── ...
```

## License
MIT
