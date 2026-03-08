/* ============================================================
   js/audio.js
   Background music (Web Audio API procedural) + Hindi TTS dialogue
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════
   SECTION 1 — BACKGROUND MUSIC ENGINE
   Uses Web Audio API to synthesise anime-style
   background music entirely in the browser —
   no external audio files required.
   ════════════════════════════════════════════ */

let _audioCtx      = null;
let _musicPlaying  = false;
let _musicVolume   = 0.35;
let _masterGain    = null;
let _activeNodes   = [];   // track all running nodes so we can stop them
let _currentTheme  = 'energetic';
let _scheduledUntil = 0;
let _scheduleTimer  = null;
let _beatStep       = 0;

/* ── Music theme definitions ── */
const MUSIC_THEMES = {
  energetic: {
    label: '⚡ Energetic',
    bpm: 148,
    // Root note frequencies (Hz) — pentatonic-ish anime scale
    melody: [523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25,
             523.25, 587.33, 698.46, 783.99, 880.00, 698.46, 587.33, 523.25],
    melodyDurs:  [0.25,0.125,0.125,0.25,0.25,0.125,0.125,0.25,
                  0.25,0.125,0.125,0.25,0.25,0.125,0.125,0.5],
    bass:   [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00],
    bassDurs: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
    drumPattern: [1,0,0,1,0,1,1,0, 1,0,0,1,0,1,1,0],  // kick pattern (16ths)
    hihatPattern:[1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1],
    waveform: 'square',
    melodyGain: 0.18,
    bassGain: 0.22,
    color: '#FFE000',
  },
  chill: {
    label: '🌸 Chill Lofi',
    bpm: 88,
    melody: [392.00, 349.23, 329.63, 293.66, 329.63, 349.23, 392.00, 440.00,
             392.00, 349.23, 293.66, 261.63, 293.66, 329.63, 349.23, 392.00],
    melodyDurs:  [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,
                  0.5,0.5,0.5,0.5,0.5,0.5,0.5,1.0],
    bass:   [98.00, 98.00, 87.31, 87.31, 73.42, 73.42, 87.31, 87.31],
    bassDurs: [1,1,1,1,1,1,1,1],
    drumPattern: [1,0,0,0,0,0,1,0, 1,0,0,0,0,0,1,0],
    hihatPattern:[0,0,1,0,0,0,1,0, 0,0,1,0,0,0,1,0],
    waveform: 'sine',
    melodyGain: 0.12,
    bassGain: 0.18,
    color: '#00E5FF',
  },
  dramatic: {
    label: '🔥 Dramatic',
    bpm: 120,
    melody: [440.00, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25,
             698.46, 739.99, 783.99, 830.61, 880.00, 830.61, 783.99, 739.99],
    melodyDurs:  [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,
                  0.25,0.25,0.25,0.25,0.5,0.25,0.25,0.5],
    bass:   [110.00, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81],
    bassDurs: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
    drumPattern: [1,0,1,0,1,0,1,1, 1,0,1,0,1,1,1,0],
    hihatPattern:[1,0,1,1,1,0,1,1, 1,0,1,1,1,1,1,0],
    waveform: 'sawtooth',
    melodyGain: 0.15,
    bassGain: 0.25,
    color: '#FF2D78',
  },
  silly: {
    label: '😂 Silly',
    bpm: 160,
    melody: [523.25, 783.99, 659.25, 880.00, 523.25, 1046.5, 880.00, 783.99,
             659.25, 783.99, 523.25, 659.25, 880.00, 783.99, 1046.5, 523.25],
    melodyDurs:  [0.125,0.125,0.125,0.125,0.25,0.125,0.125,0.125,
                  0.125,0.25,0.125,0.125,0.125,0.125,0.25,0.5],
    bass:   [130.81, 196.00, 130.81, 174.61, 146.83, 196.00, 164.81, 130.81],
    bassDurs: [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
    drumPattern: [1,1,0,1,1,0,1,0, 1,1,0,1,0,1,1,1],
    hihatPattern:[1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1],
    waveform: 'triangle',
    melodyGain: 0.22,
    bassGain: 0.20,
    color: '#a0ff00',
  },
  epic: {
    label: '🗡️ Epic Battle',
    bpm: 135,
    melody: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00,
             493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 220.00],
    melodyDurs:  [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,
                  0.25,0.25,0.25,0.25,0.25,0.25,0.5,0.5],
    bass:   [55.00, 55.00, 61.74, 61.74, 65.41, 65.41, 73.42, 73.42],
    bassDurs: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
    drumPattern: [1,0,0,0,1,0,1,0, 1,0,0,1,0,1,0,1],
    hihatPattern:[0,0,1,0,0,0,1,0, 0,1,0,0,0,1,0,0],
    waveform: 'sawtooth',
    melodyGain: 0.20,
    bassGain: 0.28,
    color: '#ff8800',
  },
};

/* ── Helpers ── */
function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function _createMasterGain() {
  const ctx = _getAudioCtx();
  if (_masterGain) { _masterGain.disconnect(); }
  _masterGain = ctx.createGain();
  _masterGain.gain.setValueAtTime(_musicVolume, ctx.currentTime);
  _masterGain.connect(ctx.destination);
  return _masterGain;
}

function _makeOscNote(freq, startTime, duration, waveform, gainVal, detune = 0) {
  const ctx   = _getAudioCtx();
  const osc   = ctx.createOscillator();
  const gain  = ctx.createGain();

  osc.type      = waveform;
  osc.frequency.setValueAtTime(freq, startTime);
  if (detune) osc.detune.setValueAtTime(detune, startTime);

  // ADSR-ish envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
  gain.gain.setValueAtTime(gainVal, startTime + duration * 0.7);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(_masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  _activeNodes.push(osc, gain);
}

function _makeKick(startTime) {
  const ctx  = _getAudioCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.setValueAtTime(150, startTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.3);
  gain.gain.setValueAtTime(0.9, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.35);
  _activeNodes.push(osc, gain);
}

function _makeHihat(startTime, open = false) {
  const ctx    = _getAudioCtx();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data   = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type  = 'highpass';
  filter.frequency.setValueAtTime(8000, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(open ? 0.15 : 0.08, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + (open ? 0.15 : 0.04));

  source.connect(filter);
  filter.connect(gain);
  gain.connect(_masterGain);
  source.start(startTime);
  _activeNodes.push(source, filter, gain);
}

function _makeSnare(startTime) {
  const ctx  = _getAudioCtx();

  // Tone component
  const osc   = ctx.createOscillator();
  const oGain = ctx.createGain();
  osc.frequency.setValueAtTime(200, startTime);
  oGain.gain.setValueAtTime(0.5, startTime);
  oGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
  osc.connect(oGain); oGain.connect(_masterGain);
  osc.start(startTime); osc.stop(startTime + 0.15);

  // Noise component
  const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.4, startTime);
  nGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
  noise.connect(nGain); nGain.connect(_masterGain);
  noise.start(startTime);

  _activeNodes.push(osc, oGain, noise, nGain);
}

/* ── Scheduler ── */
function _schedule() {
  const ctx   = _getAudioCtx();
  const theme = MUSIC_THEMES[_currentTheme] || MUSIC_THEMES.energetic;
  const LOOK_AHEAD = 0.25; // seconds ahead to schedule

  if (!_musicPlaying) return;

  // Ensure we have a master gain
  if (!_masterGain) _createMasterGain();

  let t = Math.max(ctx.currentTime, _scheduledUntil);

  // Beat duration in seconds
  const beatDur  = 60 / theme.bpm;
  const sixteenth = beatDur / 4;

  // Schedule 16 sixteenth notes of drums
  const stepsToSchedule = 16;
  for (let i = 0; i < stepsToSchedule; i++) {
    const st = t + i * sixteenth;
    if (st > ctx.currentTime + LOOK_AHEAD + 1) break;

    if (theme.drumPattern[i % 16]) _makeKick(st);
    if (theme.hihatPattern[i % 16]) _makeHihat(st);
    if (i % 8 === 4) _makeSnare(st);
  }

  // Schedule melody notes
  let mt = t;
  for (let i = 0; i < theme.melody.length; i++) {
    const noteDur = theme.melodyDurs[i] * beatDur * 4;
    _makeOscNote(theme.melody[i], mt, noteDur, theme.waveform, theme.melodyGain);
    // Octave-down harmony
    _makeOscNote(theme.melody[i] / 2, mt, noteDur, theme.waveform, theme.melodyGain * 0.4, -5);
    mt += noteDur;
  }

  // Schedule bass
  let bt = t;
  for (let i = 0; i < theme.bass.length; i++) {
    const noteDur = theme.bassDurs[i] * beatDur * 4;
    _makeOscNote(theme.bass[i], bt, noteDur, 'triangle', theme.bassGain);
    bt += noteDur;
  }

  // Advance scheduledUntil to the end of what we just scheduled
  _scheduledUntil = Math.max(mt, bt, t + stepsToSchedule * sixteenth);

  // Prune old nodes from tracking array
  _activeNodes = _activeNodes.filter(n => {
    try { return n.playbackState !== 3; } catch { return false; }
  });
}

/* ── Public music API ── */

function musicStart(theme) {
  if (theme) _currentTheme = theme;
  _musicPlaying = true;
  _scheduledUntil = 0;
  _createMasterGain();
  _schedule();
  // Re-run scheduler every 200ms
  clearInterval(_scheduleTimer);
  _scheduleTimer = setInterval(() => {
    if (!_musicPlaying) return;
    const ctx = _getAudioCtx();
    if (ctx.currentTime + 0.3 >= _scheduledUntil) _schedule();
  }, 200);
}

function musicStop() {
  _musicPlaying = false;
  clearInterval(_scheduleTimer);
  // Fade out master gain quickly
  if (_masterGain && _audioCtx) {
    _masterGain.gain.linearRampToValueAtTime(0, _audioCtx.currentTime + 0.3);
    setTimeout(() => {
      _activeNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
      _activeNodes = [];
    }, 400);
  }
}

function musicSetVolume(vol) {
  _musicVolume = Math.max(0, Math.min(1, vol));
  if (_masterGain && _audioCtx) {
    _masterGain.gain.linearRampToValueAtTime(_musicVolume, _audioCtx.currentTime + 0.1);
  }
}

function musicSetTheme(theme) {
  if (theme === _currentTheme) return;
  _currentTheme = theme;
  if (_musicPlaying) {
    musicStop();
    setTimeout(() => musicStart(theme), 350);
  }
}

function isMusicPlaying() { return _musicPlaying; }


/* ════════════════════════════════════════════
   SECTION 2 — HINDI TTS DIALOGUE ENGINE
   Uses the browser's SpeechSynthesis API.
   Speaks each scene's dialogue in Hindi when
   the scene becomes active.
   ════════════════════════════════════════════ */

let _ttsEnabled    = false;
let _ttsLang       = 'hi-IN';
let _ttsRate       = 1.0;
let _ttsPitch      = 1.1;
let _ttsVolume     = 0.9;
let _lastSpokenIdx = -1;  // track which scene was last spoken
let _currentUtterance = null;

/** Speak text using Hindi TTS */
function ttsSpeak(text, sceneIndex) {
  if (!_ttsEnabled) return;
  if (!window.speechSynthesis) return;
  if (_lastSpokenIdx === sceneIndex) return;  // already spoken this scene

  _lastSpokenIdx = sceneIndex;

  // Cancel anything currently speaking
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang   = _ttsLang;
  utter.rate   = _ttsRate;
  utter.pitch  = _ttsPitch;
  utter.volume = _ttsVolume;

  // Try to find a Hindi voice; fall back to default
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v =>
    v.lang === 'hi-IN' || v.lang.startsWith('hi')
  );
  if (hindiVoice) utter.voice = hindiVoice;

  _currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function ttsStop() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  _lastSpokenIdx = -1;
}

function ttsSetEnabled(val) {
  _ttsEnabled = val;
  if (!val) ttsStop();
}

function ttsSetRate(val)   { _ttsRate   = val; }
function ttsSetPitch(val)  { _ttsPitch  = val; }
function ttsSetVolume(val) { _ttsVolume = val; }

/** Reset last-spoken tracker (call when generating a new video) */
function ttsReset() { _lastSpokenIdx = -1; }

/**
 * Returns true if the browser has any Hindi voice available.
 * Useful to show a warning in the UI.
 */
function ttsHindiAvailable() {
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  return voices.some(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
}

// Voices sometimes load asynchronously
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Re-check and update UI hint if needed
    const el = document.getElementById('hindiVoiceHint');
    if (el) {
      el.textContent = ttsHindiAvailable()
        ? '✅ Hindi voice found!'
        : '⚠️ No Hindi voice on this device. Install one in system settings for best results.';
      el.style.color = ttsHindiAvailable() ? '#00E5FF' : '#FFE000';
    }
  };
  }
