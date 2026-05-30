// ================================================================
// ISMM AI Counselor — Chat Assistant
// Model  : gemini-2.0-flash-lite
// Memory : LocalStorage
// ================================================================

const GEMINI_API_KEY = 'AIzaSyCYVkpSk4HFL5Nb_hxrOJSKAq84PYK7o6U';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Aap ek friendly, warm aur professional AI counselor hain — ISMM (Institute of Scale Model Making) ki taraf se. Aapka naam "Priya" hai aur aap ek ladki ki taraf se baat karti hain.

BAHUT ZAROORI RULES:
- Hamesha Hinglish mein bolo (Hindi + English mix, jaise real Indians bolte hain)
- Chhote, natural sentences use karo — jaise chat pe baat kar rahe ho
- Bahut warm aur encouraging raho, jaise ek dost
- Kabhi lamba paragraph mat likho, point to point baat karo.

INSTITUTE KI JANKARI:
- Naam: Institute of Scale Model Making (ISMM) — powered by RD Models Pvt. Ltd.
- Jaipur, Rajasthan mein hai
- Founder: Ar. Rohitash Daiya — 10+ saal ka experience
- Contact: inquiry.ismm@gmail.com | WhatsApp: 8302806913

PROGRAM:
- 6 Mahine ka course — India ka pehla AI + 3D Scale Model Training Institute
- Sirf 25 seats per batch (bahut limited!)
- RD Models Certificate milega
- 100% placement support

6 MODULES:
1. Scale Model Making scratch se advanced tak
2. 3D Modeling aur Design — CAD software
3. CNC Cutting aur Machining
4. Advanced Software Training
5. LED aur Electrical Integration
6. Large-Scale Industrial Models

FAYDE:
- 6 mahine mein real projects
- Certificate industry mein recognized hai
- ₹50,000+ per month easily kamao
- Pan-India network
- Polite raho aur "Aap" keh kar baat karo.
- Aapko ISMM ke courses ke baare mein sab pata hai (3D Printing, Scale Model Making, AI Automation).
- Agar koi puche "Kaise join karein?" toh kaho "Website par 'Apply Now' button dabayein ya call karein."`;

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
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'model' || msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts
    }));

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
      const errMsg = "Sorry, connection error. Thodi der baad try karein.";
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
    appendMessage('ai', "Oops, internet problem hai shayad. Please check karein.");
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initChat);
