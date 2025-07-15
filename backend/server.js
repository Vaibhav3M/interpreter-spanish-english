import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// HTTP endpoint for health check
app.get('/', (req, res) => {
  res.send('Language Interpreter Backend is running');
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Helper: Translate text using OpenAI or mock
async function translateText(text, from, to) {
  if (!openai) {
    // Mock translation
    return `[${to}] ${text}`;
  }
  const prompt = `Translate this from ${from} to ${to}: ${text}`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
  });
  return completion.choices[0].message.content.trim();
}

// Helper: Summarize conversation and detect actions
async function summarizeAndDetectActions(messages) {
  if (!openai) {
    // Mock summary/actions
    return {
      summary: 'Mock summary of conversation.',
      actions: [
        { type: 'schedule followup appointment', details: 'Mock followup' },
        { type: 'send lab order', details: 'Mock lab order' },
      ],
    };
  }
  const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
  const prompt = `Summarize the following conversation and list any actions (like schedule followup appointment, send lab order) with details.\n\nConversation:\n${conversationText}`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });
  // Simple parse: assume summary is first paragraph, actions as bullet points
  const content = completion.choices[0].message.content.trim();
  const [summary, ...actionsRaw] = content.split(/\n- /);
  const actions = actionsRaw.map(a => {
    const [type, ...rest] = a.split(':');
    return { type: type.trim(), details: rest.join(':').trim() };
  }).filter(a => a.type);
  return { summary: summary.trim(), actions };
}

wss.on('connection', (ws) => {
  // Track conversation state per connection
  ws.conversation = [];
  ws.lastDoctorUtterance = null;

  ws.on('message', async (message) => {
    let msg;
    try {
      msg = JSON.parse(message.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

    if (msg.type === 'utterance') {
      // Handle 'repeat that' from patient
      if (msg.role === 'patient' && msg.text.trim().toLowerCase() === 'repeat that') {
        if (ws.lastDoctorUtterance) {
          // Repeat last doctor utterance (translated to Spanish)
          const translated = await translateText(ws.lastDoctorUtterance.text, 'English', 'Spanish');
          const repeatMsg = {
            type: 'utterance',
            role: 'doctor',
            text: ws.lastDoctorUtterance.text,
            translated,
          };
          ws.conversation.push(repeatMsg);
          ws.send(JSON.stringify(repeatMsg));
        } else {
          ws.send(JSON.stringify({ type: 'utterance', role: 'system', text: 'No previous doctor utterance to repeat.' }));
        }
        return;
      }
      // Normal utterance: translate and store
      let translated, fromLang, toLang;
      if (msg.role === 'doctor') {
        fromLang = 'English';
        toLang = 'Spanish';
      } else {
        fromLang = 'Spanish';
        toLang = 'English';
      }
      translated = await translateText(msg.text, fromLang, toLang);
      const utterMsg = {
        type: 'utterance',
        role: msg.role,
        text: msg.text,
        translated,
      };
      ws.conversation.push(utterMsg);
      if (msg.role === 'doctor') {
        ws.lastDoctorUtterance = utterMsg;
      }
      ws.send(JSON.stringify(utterMsg));
    } else if (msg.type === 'end_conversation') {
      // Summarize and detect actions
      const summaryData = await summarizeAndDetectActions(ws.conversation);
      ws.send(JSON.stringify({ type: 'summary', ...summaryData }));
    } else {
      ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
  });
});

