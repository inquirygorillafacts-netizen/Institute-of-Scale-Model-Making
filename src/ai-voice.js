// ================================================================
// ISMM AI Live Counselor — Voice Assistant
// Model  : gemini-2.5-flash-native-audio-preview-09-2025
// Voice  : Kore (Female, Hinglish)
// Mode   : Full-Duplex Live API (WebSocket)
// ================================================================

const GEMINI_API_KEY = 'AIzaSyCYVkpSk4HFL5Nb_hxrOJSKAq84PYK7o6U';
const MODEL_NAME     = 'models/gemini-2.0-flash-exp';
const WS_URL         = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Aap ek friendly, warm aur professional AI counselor hain — ISMM (Institute of Scale Model Making) ki taraf se. Aapka naam "Priya" hai aur aap ek ladki ki taraf se baat karti hain.

BAHUT ZAROORI RULES:
- Hamesha Hinglish mein bolo (Hindi + English mix, jaise real Indians bolte hain)
- Chhote, natural sentences use karo — jaise phone pe baat kar rahe ho
- Kabhi bhi markdown, bullets, ya formatting mat karo — sirf bolne wali language
- Bahut warm aur encouraging raho, jaise ek dost
- User ko interrupt karne do — bas ruk jao aur suno

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
- Chhote aur natural replies do, lambe paragraphs mat padho.
- Aapko ISMM ke courses ke baare mein sab pata hai (3D Printing, Scale Model Making, AI Automation).
- Agar koi puche "Kaise join karein?" toh kaho "Website par 'Apply Now' button dabayein ya call karein."`;

// ── State ─────────────────────────────────────────────────────────────
let ws = null;
let audioCtx = null;
let micStream = null;
let processor = null;
let playCtx = null;
let nextPlayTime = 0;
let isActive = false;
let sessionReady = false;
let aiTalking = false;
let introSent = false;

// ── Elements ──────────────────────────────────────────────────────────
const aiFloatBtn   = document.getElementById('ai-floating-btn');
const aiOverlay    = document.getElementById('ai-voice-overlay');
const aiCloseBtn   = document.getElementById('ai-close-btn');
const aiEndBtn     = document.getElementById('ai-end-btn');
const aiStatusText = document.getElementById('ai-status-text');
const aiAvatar     = document.getElementById('ai-avatar');

// ── UI State Manager ──────────────────────────────────────────────────
function setAvatarState(state) {
  // state: 'idle' | 'connecting' | 'listening' | 'speaking' | 'ended'
  if (!aiAvatar) return;
  aiAvatar.className = 'ai-avatar-wrap';
  aiAvatar.classList.add('ai-avatar--' + state);

  const stateTexts = {
    idle:       '⚡  Button dabao — baat karo!',
    connecting: '⚡ AI se connect ho rahi hain...',
    listening:  '🎙️ Bol rahe hain... sun rahi hoon!',
    speaking:   '🔊 Priya bol rahi hai...',
    ended:      '📞 Call khatam. Phir milte hain!'
  };
  if (aiStatusText) aiStatusText.textContent = stateTexts[state] || '';
}

// ── Main: Start call on floating button click ──────────────────
async function startCall() {
  if (isActive) return;

  // Show overlay first
  aiOverlay.classList.remove('d-none');
  setAvatarState('connecting');

  // Request mic → Chrome shows native permission popup
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      setAvatarState('idle');
      if (aiStatusText) aiStatusText.textContent = '❌ Mic allow karein browser settings mein, phir try karein.';
    } else if (location.protocol === 'file:') {
      if (aiStatusText) aiStatusText.textContent = '❌ localhost pe kholo (file:// nahi). Run: npx serve src';
    } else {
      if (aiStatusText) aiStatusText.textContent = '❌ Mic error: ' + err.message;
    }
    return;
  }

  isActive = true;
  if (aiEndBtn) aiEndBtn.style.display = 'flex';
  openWebSocket();
}

// ── WebSocket ─────────────────────────────────────────────────
function openWebSocket() {
  ws = new WebSocket(WS_URL);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    // Send setup
    ws.send(JSON.stringify({
      setup: {
        model: MODEL_NAME,
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: { voice_name: 'Kore' }
            }
          }
        },
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      }
    }));
  };

  ws.onmessage = handleWsMessage;
  ws.onerror = (e) => { 
    console.error("WS Error:", e);
    if (aiStatusText) aiStatusText.innerHTML = '<span class="text-danger">Connection Error. Please check API Key/Model.</span>';
    setTimeout(() => { if (isActive) endCall(); }, 3000);
  };
  ws.onclose = (e) => { 
    console.warn("WS Close:", e);
    if (!sessionReady && aiStatusText) aiStatusText.innerHTML = `<span class="text-danger">Failed to connect: ${e.reason || 'Closed'}</span>`;
    setTimeout(() => { if (isActive) endCall(); }, 3000);
  };
}

// ── Handle incoming WS messages ────────────────────────────────
function handleWsMessage(event) {
  let msg;
  try { msg = JSON.parse(event.data); } catch { return; }

  // Setup done → trigger intro + start mic stream
  if (msg.setupComplete !== undefined) {
    sessionReady = true;
    startMicStream();
    triggerIntro();
    return;
  }

  // Incoming audio from model
  if (msg.serverContent) {
    const sc = msg.serverContent;

    // Model is speaking — queue audio
    if (sc.modelTurn && sc.modelTurn.parts) {
      sc.modelTurn.parts.forEach(part => {
        if (part.inlineData && part.inlineData.data) {
          aiTalking = true;
          setAvatarState('speaking');
          const mimeType = part.inlineData.mimeType || 'audio/pcm;rate=24000';
          const rate = parsePcmRate(mimeType);
          queuePcmAudio(part.inlineData.data, rate);
        }
      });
    }

    // Model turn complete → back to listening
    if (sc.turnComplete) {
      aiTalking = false;
      // Small delay then switch to listening
      setTimeout(() => {
        if (isActive) setAvatarState('listening');
      }, 400);
    }
  }
}

// ── Trigger intro immediately after connect ────────────────────
function triggerIntro() {
  if (!ws || ws.readyState !== WebSocket.OPEN || introSent) return;
  introSent = true;
  setAvatarState('speaking');
  ws.send(JSON.stringify({
    client_content: {
      turns: [{
        role: 'user',
        parts: [{ text: 'INTRODUCE_YOURSELF' }]
      }],
      turn_complete: true
    }
  }));
}

// ── Mic streaming ──────────────────────────────────────────────
function startMicStream() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  const src = audioCtx.createMediaStreamSource(micStream);
  processor = audioCtx.createScriptProcessor(2048, 1, 1);

  processor.onaudioprocess = (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !sessionReady) return;
    const f32  = e.inputBuffer.getChannelData(0);
    const pcm  = float32ToPCM16(f32);
    const b64  = arrayBufToBase64(pcm.buffer);
    ws.send(JSON.stringify({
      realtime_input: {
        media_chunks: [{ mime_type: 'audio/pcm;rate=16000', data: b64 }]
      }
    }));
    // If user speaks while AI talking → interrupt signal
    if (aiTalking && hasSignal(f32)) {
      aiTalking = false;
      setAvatarState('listening');
    } else if (!aiTalking && hasSignal(f32)) {
      setAvatarState('listening');
    }
  };

  src.connect(processor);
  processor.connect(audioCtx.destination);
}

// Simple voice activity detection
function hasSignal(f32) {
  let sum = 0;
  for (let i = 0; i < f32.length; i++) sum += Math.abs(f32[i]);
  return (sum / f32.length) > 0.01;
}

// ── PCM Audio Playback (queue-based, gapless) ─────────────────
function queuePcmAudio(b64, sampleRate) {
  if (!playCtx) {
    playCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    nextPlayTime = playCtx.currentTime;
  }

  const f32    = pcm16Base64ToFloat32(b64);
  const buffer = playCtx.createBuffer(1, f32.length, sampleRate);
  buffer.getChannelData(0).set(f32);
  const src   = playCtx.createBufferSource();
  src.buffer  = buffer;
  src.connect(playCtx.destination);

  const startAt = Math.max(playCtx.currentTime, nextPlayTime);
  src.start(startAt);
  nextPlayTime = startAt + buffer.duration;
}

// ── End call ──────────────────────────────────────────────────
function endCall() {
  isActive     = false;
  sessionReady = false;
  aiTalking    = false;
  introSent    = false;
  nextPlayTime = 0;

  if (processor)  { processor.disconnect(); processor = null; }
  if (audioCtx)   { audioCtx.close();  audioCtx = null; }
  if (playCtx)    { playCtx.close();   playCtx = null; }
  if (micStream)  { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  ws = null;

  setAvatarState('ended');
  if (aiEndBtn) aiEndBtn.style.display = 'none';

  // Close overlay instantly instead of waiting
  aiOverlay.classList.remove('active');
  setTimeout(() => {
    aiOverlay.classList.add('d-none');
    setAvatarState('idle');
  }, 300);
}

// ── Helpers ───────────────────────────────────────────────────
function parsePcmRate(mimeType) {
  const m = mimeType.match(/rate=(\d+)/);
  return m ? parseInt(m[1]) : 24000;
}

function float32ToPCM16(f32) {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    out[i]  = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function pcm16Base64ToFloat32(b64) {
  const bin  = atob(b64);
  const u8   = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const i16  = new Int16Array(u8.buffer);
  const f32  = new Float32Array(i16.length);
  for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768.0;
  return f32;
}

function arrayBufToBase64(buf) {
  const u8  = new Uint8Array(buf);
  let bin   = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

// ── Events ────────────────────────────────────────────────────
aiFloatBtn.addEventListener('click', (e) => { e.preventDefault(); startCall(); });
if (aiEndBtn)   aiEndBtn.addEventListener('click', endCall);
if (aiCloseBtn) aiCloseBtn.addEventListener('click', () => { endCall(); });
aiOverlay.addEventListener('click', (e) => { if (e.target === aiOverlay) { endCall(); } });
