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
  console.log(`OpenAI API: ${openai ? 'Available' : 'Not available - using mock translation'}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Helper: Translate text using OpenAI or mock
async function translateText(text, from, to) {
  if (!openai) {
    // Mock translation with some basic patterns
    const mockTranslations = {
      'hello': 'hola',
      'how are you': 'cómo estás',
      'good morning': 'buenos días',
      'good afternoon': 'buenas tardes',
      'good evening': 'buenas noches',
      'thank you': 'gracias',
      'you are welcome': 'de nada',
      'please': 'por favor',
      'excuse me': 'disculpe',
      'i am sorry': 'lo siento',
      'repeat that': 'repite eso',
      'hola': 'hello',
      'cómo estás': 'how are you',
      'buenos días': 'good morning',
      'buenas tardes': 'good afternoon',
      'buenas noches': 'good evening',
      'gracias': 'thank you',
      'de nada': 'you are welcome',
      'por favor': 'please',
      'disculpe': 'excuse me',
      'lo siento': 'i am sorry',
      'repite eso': 'repeat that'
    };
    
    const lowerText = text.toLowerCase();
    if (mockTranslations[lowerText]) {
      return `[${to}] ${mockTranslations[lowerText]}`;
    }
    
    // Simple mock translation
    return `[${to}] ${text}`;
  }
  
  try {
    const prompt = `Translate this from ${from} to ${to}. Only provide the translation, no explanations: ${text}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.3,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return `[${to}] ${text}`;
  }
}

// Helper: Summarize conversation and detect actions
async function summarizeAndDetectActions(messages) {
  if (!openai) {
    // Mock summary/actions based on conversation content
    const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const lowerText = conversationText.toLowerCase();
    
    let mockActions = [];
    if (lowerText.includes('appointment') || lowerText.includes('cita') || lowerText.includes('schedule')) {
      mockActions.push({ 
        type: 'schedule followup appointment', 
        details: 'Patient requested follow-up appointment' 
      });
    }
    if (lowerText.includes('lab') || lowerText.includes('test') || lowerText.includes('blood') || lowerText.includes('sangre')) {
      mockActions.push({ 
        type: 'send lab order', 
        details: 'Lab tests requested during consultation' 
      });
    }
    if (lowerText.includes('prescription') || lowerText.includes('medication') || lowerText.includes('medicine') || lowerText.includes('medicina')) {
      mockActions.push({ 
        type: 'prescribe medication', 
        details: 'Medication prescription discussed' 
      });
    }
    
    return {
      summary: `Mock summary: This was a medical consultation between a doctor and patient. The conversation covered ${messages.length} exchanges.`,
      actions: mockActions,
    };
  }
  
  try {
    const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `Analyze this medical conversation and provide:
1. A concise summary of the consultation
2. Any specific actions that need to be taken (like schedule followup appointment, send lab order, prescribe medication)

Conversation:
${conversationText}

Format your response as:
SUMMARY: [summary here]
ACTIONS:
- [action type]: [details]
- [action type]: [details]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });
    
    const content = completion.choices[0].message.content.trim();
    const lines = content.split('\n');
    
    let summary = '';
    let actions = [];
    
    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('-') && line.includes(':')) {
        const actionText = line.replace('-', '').trim();
        const [type, ...detailsParts] = actionText.split(':');
        actions.push({
          type: type.trim(),
          details: detailsParts.join(':').trim()
        });
      }
    }
    
    return { summary, actions };
  } catch (error) {
    console.error('Summary error:', error);
    return {
      summary: 'Error generating summary',
      actions: []
    };
  }
}

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Track conversation state per connection
  ws.conversation = [];
  ws.lastDoctorUtterance = null;

  ws.on('message', async (message) => {
    let msg;
    try {
      msg = JSON.parse(message.toString());
    } catch (e) {
      console.error('Invalid JSON received:', e);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON format' }));
      return;
    }

    try {
      if (msg.type === 'utterance') {
        // Handle 'repeat that' from patient
        if (msg.role === 'patient' && 
            (msg.text.trim().toLowerCase() === 'repeat that' || 
             msg.text.trim().toLowerCase() === 'repite eso')) {
          
          if (ws.lastDoctorUtterance) {
            // Repeat last doctor utterance (translated to Spanish)
            const translated = await translateText(ws.lastDoctorUtterance.text, 'English', 'Spanish');
            const repeatMsg = {
              type: 'utterance',
              role: 'doctor',
              text: ws.lastDoctorUtterance.text,
              translated,
              isRepeat: true
            };
            ws.conversation.push(repeatMsg);
            ws.send(JSON.stringify(repeatMsg));
          } else {
            const noRepeatMsg = {
              type: 'utterance', 
              role: 'system', 
              text: 'No previous doctor utterance to repeat.',
              translated: 'No hay mensaje previo del doctor para repetir.'
            };
            ws.send(JSON.stringify(noRepeatMsg));
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
          timestamp: new Date().toISOString()
        };
        
        ws.conversation.push(utterMsg);
        if (msg.role === 'doctor') {
          ws.lastDoctorUtterance = utterMsg;
        }
        ws.send(JSON.stringify(utterMsg));
        
      } else if (msg.type === 'end_conversation') {
        // Summarize and detect actions
        console.log('Ending conversation, generating summary...');
        const summaryData = await summarizeAndDetectActions(ws.conversation);
        ws.send(JSON.stringify({ type: 'summary', ...summaryData }));
        
      } else {
        ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Internal server error processing your request' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

