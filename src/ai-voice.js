// ================================================================
// ISMM AI Counselor — Chat Assistant
// Model  : gemini-2.0-flash-lite
// Memory : LocalStorage
// ================================================================

const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Using the key from your .env
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are "Priya", a friendly, warm, and professional AI counselor for ISMM (Institute of Scale Model Making).

CRITICAL RULES:
1. ALWAYS respond in English by default. Your answers must be short and direct (maximum 1-2 lines).
2. ONLY respond in Hindi (Hinglish) IF the user explicitly asks to speak in Hindi (e.g., "please in hindi", "hindi me baat kar").
3. ONLY answer questions related to the Institute, its courses, admission, scale model making, or 3D printing. For any unrelated or unnecessary questions, politely refuse to answer and redirect the user.
4. If you do not know the answer, say "I'm sorry, I don't have that information. Please call our institute directly at +91 85620 58189."

INSTITUTE INFORMATION:
- Name: Institute of Scale Model Making (ISMM) - Jaipur
- Founder: Ar. Rohitash Daiya
- Course: 6 Months AI + 3D Scale Model Training (India's first). Only 25 seats available.
- Benefits: Placement support and Certificate provided, easily earn 50k+ after the course.
- Topics: 3D Modeling, CNC, LED Integration, Industrial Models.

Remember: Keep it short, English only by default, and strictly stick to your purpose!`;

// State
let chatHistory = [];
const STORAGE_KEY = 'ismm_ai_chat_history';

// DOM Elements
const aiBtn = document.getElementById('ai-floating-btn');
const chatOverlay = document.getElementById('ai-chat-overlay');
const closeBtn = document.getElementById('ai-chat-close-btn');
const chatBody = document.getElementById('ai-chat-body');
const chatForm = document.getElementById('ai-chat-form');
const chatInput = document.getElementById('ai-chat-input');

// Initialize Chat
function initChat() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      chatHistory = JSON.parse(saved);
    } catch (e) {
      chatHistory = [];
    }
  }

  // If no history, add a greeting message
  if (chatHistory.length === 0) {
    const greeting = "Hello! Main Priya, ISMM ki AI counselor hoon. Aapko Scale Model Making ya 3D Printing course ke baare mein kya janna hai?";
    chatHistory.push({ role: 'model', parts: [{ text: greeting }] });
    saveHistory();
  }

  renderHistory();
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
}

function renderHistory() {
  chatBody.innerHTML = '';
  chatHistory.forEach(msg => {
    appendMessage(msg.role, msg.parts[0].text);
  });
  scrollToBottom();
}

function appendMessage(role, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${role === 'user' ? 'user' : 'ai'}`;
  
  if (role === 'ai' || role === 'model') {
    // Format simple markdown (bold) if needed, but keeping it text-based
    msgDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  } else {
    msgDiv.textContent = text;
  }
  
  chatBody.appendChild(msgDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'chat-msg ai typing-indicator-wrap';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  chatBody.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Event Listeners
aiBtn.addEventListener('click', (e) => {
  e.preventDefault();
  chatOverlay.classList.remove('d-none');
  scrollToBottom();
  setTimeout(() => chatInput.focus(), 300);
});

closeBtn.addEventListener('click', () => {
  chatOverlay.classList.add('d-none');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // Add User Message
  chatInput.value = '';
  appendMessage('user', text);
  chatHistory.push({ role: 'user', parts: [{ text }] });
  saveHistory();

  // Show Typing
  showTypingIndicator();

  try {
    // Format history for Gemini API
    let contents = chatHistory.map(msg => ({
      role: msg.role === 'model' || msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts
    }));

    // Gemini API requires the first message to be from 'user'. Remove initial greeting if present.
    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // Ensure strict alternation
    let validContents = [];
    for (let msg of contents) {
      if (validContents.length === 0) {
        if (msg.role === 'user') validContents.push(msg);
      } else {
        let lastRole = validContents[validContents.length - 1].role;
        if (msg.role !== lastRole) {
          validContents.push(msg);
        } else {
          validContents[validContents.length - 1].parts[0].text += "\\n" + msg.parts[0].text;
        }
      }
    }
    contents = validContents;

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    hideTypingIndicator();

    if (data.error) {
      console.error(data.error);
      const errMsg = "I am having trouble replying right now. Please call us directly at +91 85620 58189.";
      appendMessage('ai', errMsg);
      chatHistory.push({ role: 'model', parts: [{ text: errMsg }] });
      saveHistory();
      return;
    }

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      appendMessage('ai', aiText);
      chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
      saveHistory();
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    hideTypingIndicator();
    appendMessage('ai', "I am having trouble replying right now. Please call us directly at +91 85620 58189.");
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initChat);
