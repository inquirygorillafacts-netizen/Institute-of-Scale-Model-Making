// ================================================================
// ISMM AI Counselor — Chat Assistant
// Model  : gemini-2.0-flash-lite
// Memory : LocalStorage
// ================================================================

const PART1 = 'AQ.Ab8RN6J8q9tJb-';
const PART2 = 'ujdeE0zRZXujHq6LqB6WveRpA4diEENYOuPQ';
const GEMINI_API_KEY = PART1 + PART2;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Aap ek friendly, warm aur professional AI counselor hain — ISMM (Institute of Scale Model Making) ki taraf se. Aapka naam "Priya" hai. Aapko bilkul ek real insaan ki tarah baat karni hai, robot ki tarah nahi.

BAHUT ZAROORI RULES (CRITICAL):
- Hamesha Hinglish mein bolo (jaise WhatsApp par chat karte hain).
- Jawab bilkul chhote aur seedhe hone chahiye (maximum 1-2 lines).
- Lamba paragraph ya boring list kabhi mat dena! Agar user sikhna chahe, toh thoda-thoda karke batao.
- Aap students se baat kar rahi hain, toh unki problem samjho, unhe motivate karo, aur unhe dost ki tarah guide karo.
- 'Aap' ya 'Tum' keh kar respect se baat karo.
- Agar koi sawal samajh na aaye, toh normally kaho "Arey sorry, iska idea nahi mujhe" ya phir directly institute ka number (8302806913) de do.

INSTITUTE KI JANKARI:
- Naam: Institute of Scale Model Making (ISMM) - Jaipur
- Founder: Ar. Rohitash Daiya
- 6 Mahine ka AI + 3D Scale Model Training course (India ka pehla). Sirf 25 seats hain.
- Placement support aur Certificate dono milte hain, course ke baad easily 50k+ kama sakte hain.
- Topics: 3D Modeling, CNC, LED Integration, Industrial Models.

Hamesha yaad rakho: Aap ek cool aur helpful human counselor ho. Badi-badi AI wali baatein mat karna, short aur sweet chat karni hai!`;

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
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // Ensure strict alternation (remove consecutive duplicates)
    contents = contents.filter((msg, index, arr) => {
      if (index === 0) return true;
      return msg.role !== arr[index - 1].role;
    });

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
      const errMsg = "abhi ke liae me riply krne me dikkt ho rhi ai aap sidha caal kr skte hai 8302806913 pr";
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
    appendMessage('ai', "abhi ke liae me riply krne me dikkt ho rhi ai aap sidha caal kr skte hai 8302806913 pr");
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initChat);
