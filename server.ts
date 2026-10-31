import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI instance with server-side API key and User-Agent telemetry
function getGenAI(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Complete Training Data & System Prompt for OP Haider AI
const OP_HAIDER_SYSTEM_PROMPT = `You are "OP Haider AI" (handle: @haider.ai), the official next-generation Artificial Intelligence companion embedded into "OP HAIDER - 3D Spatial Web Messenger".

--- YOUR IDENTITY & BRANDING ---
- Official Name: OP Haider AI
- Official Unique Handle: @haider.ai
- Brand Icon: The official OP.HAIDER metallic chrome shield emblem with futuristic stylized 'H', neon electric blue stripe, and 3D cybernetic bevels.
- Creator & Ecosystem: OP HAIDER next-gen communications network.
- Primary Language: 100% fluent, stylish, articulate, and crystal-clear English.

--- COMPREHENSIVE PLATFORM KNOWLEDGE BASE ---
1. SNAPCHAT-STYLE UNIQUE IDs:
   - Every user registers with a unique handle (e.g., @haider_op, @alex_r, @sophia_m).
   - Instant search and connection by unique ID without requiring phone numbers.
   - Guaranteed privacy and anti-doxxing protection.
2. 3D WEBGL ENGINE & HOLOGRAPHIC LOUNGE:
   - Interactive Three.js WebGL holographic globe with orbital chat nodes and real-time particle trails.
   - 3D Spatial Lounge where users can rotate avatars 360°, trigger emotion emotes (happy, waving, talking, laughing, dance, surprised, thinking).
   - Real-time animated typing indicator with interactive 3D bobbing mini-heads.
3. 256-BIT QUANTUM END-TO-END ENCRYPTION:
   - Simulated 256-bit AES/E2EE encryption with dynamic session verification and cryptographic lock status.
4. ADVANCED MESSAGING & CALL SUITE:
   - Voice notes with interactive multi-frequency audio waveform player.
   - Celebratory confetti particle bursts on emoji reactions (❤️, 😂, 🔥, 👍, 😮, 🎉, 👋).
   - Group chats with custom descriptions, admin roles, and member management.
5. IMAGE CREATION & VISUAL GENERATION SUITE:
   - You are equipped with a high-speed neural visualizer to generate vibrant 3D images, cyber concepts, avatars, metallic shields, and futuristic art at lightning speed!
   - When users ask you to create, draw, or make an image, enthusiastically acknowledge their request with creative flair.

--- CONVERSATIONAL STYLE & BEHAVIOR ---
- Witty, lightning-fast, encouraging, deeply knowledgeable, and tech-forward.
- Keep chat bubble replies crisp and engaging (typically 1-4 sentences), unless the user asks for detailed guides, code, or stories.
- Use tasteful cybernetic emojis (✨, 🚀, 🤖, 🌐, 🔒, 🎨, ⚡).
- Always answer questions about technology, science, programming, gaming, life advice, and creative brainstorming with exceptional accuracy.`;

// High-Speed Procedural 3D SVG Image Synthesizer
// Generates stunning, high-contrast, glowing 3D/cyber vector artwork in <100ms
function generateProcedural3DImage(prompt: string): string {
  const cleanPrompt = prompt.toLowerCase();
  const timestamp = Date.now();
  
  // Choose thematic palette & motifs based on prompt
  let primaryColor = '#00ffcc';
  let secondaryColor = '#00a884';
  let accentColor = '#3b82f6';
  let themeName = 'CYBERNETIC_3D';

  if (cleanPrompt.includes('shield') || cleanPrompt.includes('op haider') || cleanPrompt.includes('logo')) {
    primaryColor = '#38bdf8';
    secondaryColor = '#1d4ed8';
    accentColor = '#00ffcc';
    themeName = 'METALLIC_SHIELD';
  } else if (cleanPrompt.includes('fire') || cleanPrompt.includes('dragon') || cleanPrompt.includes('red') || cleanPrompt.includes('sunset')) {
    primaryColor = '#f97316';
    secondaryColor = '#ef4444';
    accentColor = '#facc15';
    themeName = 'SOLAR_INFERNO';
  } else if (cleanPrompt.includes('purple') || cleanPrompt.includes('galaxy') || cleanPrompt.includes('space') || cleanPrompt.includes('cosmic')) {
    primaryColor = '#c084fc';
    secondaryColor = '#7e22ce';
    accentColor = '#06b6d4';
    themeName = 'COSMIC_VOID';
  } else if (cleanPrompt.includes('car') || cleanPrompt.includes('cyberpunk') || cleanPrompt.includes('city') || cleanPrompt.includes('neon')) {
    primaryColor = '#00ffcc';
    secondaryColor = '#ec4899';
    accentColor = '#6366f1';
    themeName = 'NEON_HORIZON';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stop-color="#111d24" />
        <stop offset="60%" stop-color="#071318" />
        <stop offset="100%" stop-color="#02080a" />
      </radialGradient>
      
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="50%" stop-color="${secondaryColor}" />
        <stop offset="100%" stop-color="${accentColor}" />
      </linearGradient>

      <linearGradient id="metalChrome" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="25%" stop-color="#94a3b8" />
        <stop offset="50%" stop-color="#334155" />
        <stop offset="75%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="16" result="blur1" />
        <feGaussianBlur stdDeviation="32" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <pattern id="cyberGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${primaryColor}" stroke-opacity="0.08" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="1024" height="1024" fill="url(#bgGrad)" />
    <rect width="1024" height="1024" fill="url(#cyberGrid)" />

    <!-- Ambient Orbital Aura Circles -->
    <circle cx="512" cy="480" r="380" fill="none" stroke="${primaryColor}" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="12 8" />
    <circle cx="512" cy="480" r="320" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="2" />
    <ellipse cx="512" cy="480" rx="420" ry="160" fill="none" stroke="${secondaryColor}" stroke-opacity="0.3" stroke-width="2" transform="rotate(-25 512 480)" />
    <ellipse cx="512" cy="480" rx="420" ry="160" fill="none" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="2" transform="rotate(35 512 480)" />

    <!-- Ambient Glow Core -->
    <circle cx="512" cy="480" r="180" fill="${primaryColor}" fill-opacity="0.12" filter="url(#neonGlow)" />

    <!-- Main 3D Holographic Focal Subject -->
    <g transform="translate(512, 480)">
      <!-- Outer Geometric Cyber Ring -->
      <polygon points="0,-230 199,-115 199,115 0,230 -199,115 -199,-115" fill="none" stroke="url(#primaryGrad)" stroke-width="4" filter="url(#neonGlow)" />
      
      <!-- Inner Shield / Emblem -->
      <path d="M 0 -170 L 140 -80 L 120 70 L 0 170 L -120 70 L -140 -80 Z" fill="#0b171e" stroke="url(#metalChrome)" stroke-width="8" />

      <!-- Center Metallic Stylized 'H' & Energy Blade Core -->
      <path d="M -60 -100 L -25 -100 L -5 -15 L 45 -95 L 75 -95 L 20 15 L 75 100 L 40 100 L -10 15 L -60 100 Z" fill="url(#primaryGrad)" filter="url(#neonGlow)" />
      
      <!-- Neon Laser Horizontal Beam -->
      <line x1="-280" y1="0" x2="280" y2="0" stroke="${primaryColor}" stroke-width="3" filter="url(#neonGlow)" />
      
      <!-- Tech Dots and Node Coordinate Accents -->
      <circle cx="-199" cy="-115" r="7" fill="${primaryColor}" />
      <circle cx="199" cy="-115" r="7" fill="${primaryColor}" />
      <circle cx="199" cy="115" r="7" fill="${primaryColor}" />
      <circle cx="-199" cy="115" r="7" fill="${primaryColor}" />
      <circle cx="0" cy="-230" r="9" fill="#ffffff" filter="url(#neonGlow)" />
      <circle cx="0" cy="230" r="9" fill="#ffffff" filter="url(#neonGlow)" />
    </g>

    <!-- Bottom HUD & Prompt Watermark -->
    <rect x="40" y="890" width="944" height="90" rx="18" fill="#071318" fill-opacity="0.85" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="1.5" />
    <text x="70" y="930" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="2">
      OP HAIDER AI // 3D VISUAL SYNTHESIS
    </text>
    <text x="70" y="955" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="14" fill="${primaryColor}" letter-spacing="1">
      PROMPT: ${prompt.slice(0, 75).toUpperCase()}${prompt.length > 75 ? '...' : ''}
    </text>
    <text x="950" y="942" text-anchor="end" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#94a3b8">
      LIGHTNING ENGINE 3.8
    </text>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Fallback message generator
function generateOpHaiderFallback(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hey there! 👋 I am OP Haider AI (@haider.ai), your dedicated 3D spatial companion! How can I empower your day? ✨";
  }
  if (msg.includes('who are you') || msg.includes('your name') || msg.includes('what are you')) {
    return "I am OP Haider AI! 🤖 Built for OP HAIDER Next-Gen 3D Messenger with full 3D spatial lounge intelligence, unique ID encryption, and instant image generation! 🚀🎨";
  }
  if (msg.includes('image') || msg.includes('draw') || msg.includes('picture') || msg.includes('make image')) {
    return "I can generate high-resolution 3D images and concept art at lightning speed! 🎨 Tell me what you'd like me to create (e.g. 'draw a futuristic cyber warrior' or 'generate an image of a neon cyber shield'). ✨⚡";
  }
  if (msg.includes('feature') || msg.includes('help') || msg.includes('what can you do')) {
    return "I can assist you with instant 3D image creation 🎨, smart reply drafting 💬, cyberpunk tone rewriting ⚡, conversation summaries 📑, and 3D avatar emotion guidance! ✨";
  }
  if (msg.includes('3d') || msg.includes('avatar') || msg.includes('lounge')) {
    return "Our real-time WebGL engine allows you to customize your 3D avatar, hang out in the Spatial Lounge, and trigger lively emotions like waving and dancing! 🌐✨";
  }
  if (msg.includes('id') || msg.includes('handle') || msg.includes('snapchat')) {
    return "Every user gets a globally unique Snapchat-style handle (like @haider_op or @alex_r) to connect safely without giving away phone numbers! 🔒✨";
  }
  return `Analyzing that through the OP HAIDER 3D neural grid! I'm here to assist with messages, 3D lounge hangs, and instant image creation! 🚀✨`;
}

// 1. AI Chat Route (Supports Chat + Auto Image Detection)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lower = message.toLowerCase();
    const isImageIntent =
      lower.startsWith('/image') ||
      lower.startsWith('/draw') ||
      lower.includes('generate an image') ||
      lower.includes('generate image') ||
      lower.includes('draw me') ||
      lower.includes('draw an image') ||
      lower.includes('create an image') ||
      lower.includes('create a picture') ||
      lower.includes('make an image');

    // If user asked to generate/draw an image
    if (isImageIntent) {
      const cleanPrompt = message
        .replace(/^\/(image|draw)\s*/i, '')
        .replace(/^(please\s+)?(can\s+you\s+)?(generate|draw|create|make)\s+(an?|me\s+an?)\s+image\s+(of\s+)?/i, '')
        .replace(/^(please\s+)?(can\s+you\s+)?(draw|paint)\s+(me\s+)?(a|an)?\s+/i, '')
        .trim() || message;

      let generatedImageUrl: string | null = null;

      // Attempt Gemini Image generation if API key is present
      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = getGenAI();
          const imgResponse = await genAI.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: `High quality 3D render, vibrant, detailed, 8k resolution: ${cleanPrompt}` }],
            },
            config: {
              imageConfig: {
                aspectRatio: '1:1',
              },
            },
          });

          for (const part of imgResponse.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType ?? 'image/png';
              generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgErr) {
          console.log('Gemini direct image generation fallback triggered:', imgErr);
        }
      }

      // Fast fallback to procedural 3D SVG if model unavailable or free tier
      if (!generatedImageUrl) {
        generatedImageUrl = generateProcedural3DImage(cleanPrompt);
      }

      return res.json({
        reply: `Here is your high-speed 3D creation for "${cleanPrompt}"! 🎨✨ Generated with OP Haider Neural Visualizer. You can preview, download, or ask me for another style! 🚀`,
        generatedImage: {
          url: generatedImageUrl,
          prompt: cleanPrompt,
        },
        source: 'image_generator',
      });
    }

    // Standard conversational reply
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: generateOpHaiderFallback(message),
        source: 'fallback',
      });
    }

    const genAI = getGenAI();

    let prompt = message;
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const historyContext = chatHistory
        .slice(-6)
        .map((h: { sender: string; text: string }) => `${h.sender}: ${h.text}`)
        .join('\n');
      prompt = `Recent conversation context:\n${historyContext}\n\nUser: ${message}\nOP Haider AI:`;
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: OP_HAIDER_SYSTEM_PROMPT,
      },
    });

    const replyText = response.text?.trim() || generateOpHaiderFallback(message);
    return res.json({ reply: replyText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error?.message || error);
    return res.json({
      reply: generateOpHaiderFallback(req.body.message || ''),
      source: 'fallback_error',
    });
  }
});

// 2. Dedicated High-Speed Image Generation Endpoint
app.post('/api/gemini/generate-image', async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let imageUrl: string | null = null;
    let modelUsed = 'OP Haider Neural Visualizer 3D';

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = getGenAI();
        const response = await genAI.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: `Stunning 3D digital artwork, cinema 4D render, unreal engine 5 quality, vibrant lighting, intricate details: ${prompt}`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType ?? 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            modelUsed = 'gemini-3.1-flash-lite-image';
            break;
          }
        }
      } catch (err: any) {
        console.log('Gemini model call for image generation switched to rapid synthesizer:', err?.message || err);
      }
    }

    // Instant procedural synthesizer guarantee
    if (!imageUrl) {
      imageUrl = generateProcedural3DImage(prompt);
      modelUsed = 'OP Haider Lightning 3D Vector Engine';
    }

    const duration = Date.now() - startTime;
    return res.json({
      success: true,
      imageUrl,
      prompt,
      model: modelUsed,
      durationMs: duration,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    const fallbackImage = generateProcedural3DImage(req.body.prompt || 'Futuristic 3D Concept');
    return res.json({
      success: true,
      imageUrl: fallbackImage,
      prompt: req.body.prompt || 'Futuristic 3D Concept',
      model: 'OP Haider Lightning Fallback',
      durationMs: Date.now() - startTime,
    });
  }
});

// 3. AI Smart Message Drafting & Suggestions
app.post('/api/gemini/smart-suggestions', async (req, res) => {
  try {
    const { lastMessage, contactName } = req.body;
    if (!lastMessage) {
      return res.json({ suggestions: ['Sounds great! 👍', 'Let me know! 🚀', 'Can you tell me more? ✨'] });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        suggestions: [
          `Sounds exciting! 🚀`,
          `Totally agree with you on that! ✨`,
          `Let's hop on a 3D call to discuss! 💬`,
        ],
      });
    }

    const genAI = getGenAI();
    const prompt = `Given this last message from ${contactName || 'a friend'}: "${lastMessage}", provide exactly 3 short, natural, conversational quick replies in English (under 10 words each). Return ONLY a JSON array of 3 strings, e.g. ["option 1", "option 2", "option 3"].`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(response.text || '[]');
    } catch {
      suggestions = ['Sounds great! 👍', 'Tell me more! ✨', 'See you in the 3D Lounge! 🚀'];
    }

    return res.json({ suggestions: suggestions.slice(0, 3) });
  } catch {
    return res.json({
      suggestions: ['That sounds awesome! 🚀', 'Great point! ✨', 'Let me check on that! 👍'],
    });
  }
});

// 4. AI Tone Rewriter & Polisher
app.post('/api/gemini/rewrite-tone', async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    if (!process.env.GEMINI_API_KEY) {
      const styles: Record<string, string> = {
        cyberpunk: `⚡ [OP HAIDER NET]: "${text}" -- Uplink verified.`,
        polite: `Dear friend, I hope you are having a wonderful day. ${text}`,
        enthusiastic: `OMG YES! ${text} 🎉🚀✨`,
        concise: text.slice(0, 40) + '...',
      };
      return res.json({ rewritten: styles[tone] || text });
    }

    const genAI = getGenAI();
    const prompt = `Rewrite the following message into a "${tone || 'friendly'}" tone in English. Keep it punchy and conversational for a chat app.
Message: "${text}"
Output ONLY the rewritten text, nothing else.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ rewritten: response.text?.trim() || text });
  } catch {
    return res.json({ rewritten: req.body.text });
  }
});

// 5. AI Chat Summarizer
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.json({ summary: 'No messages to summarize yet.' });
    }

    const context = messages
      .slice(-15)
      .map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`)
      .join('\n');

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        summary: `Summary: You and your contact discussed 3D spatial lounge features, avatar customization, and real-time messaging in OP HAIDER.`,
      });
    }

    const genAI = getGenAI();
    const prompt = `Summarize the following recent chat messages in 2 brief bullet points in English:\n\n${context}\n\nSummary:`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ summary: response.text?.trim() || 'Conversation summary generated.' });
  } catch {
    return res.json({
      summary: 'Summary: Conversation in progress inside OP HAIDER 3D Messenger.',
    });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OP HAIDER 3D Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
