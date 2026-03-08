/* ============================================================
   js/app.js
   Application bootstrap — wires up all UI interactions and
   connects the editor, player, recorder, and audio modules.
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────
   CANVAS SETUP
   ──────────────────────────────────────────── */

const canvas = document.getElementById('anime-canvas');

function resizeCanvas() {
  const wrap  = document.getElementById('canvas-wrap');
  canvas.width  = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ────────────────────────────────────────────
   STYLE CHIP SELECTION
   ──────────────────────────────────────────── */

document.querySelectorAll('#styleChips .chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#styleChips .chip').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

/* ────────────────────────────────────────────
   BACKGROUND MUSIC CONTROLS
   ──────────────────────────────────────────── */

const musicToggleBtn = document.getElementById('musicToggle');
const musicThemeSel  = document.getElementById('musicTheme');
const musicVolSlider = document.getElementById('musicVolume');
const musicVolLabel  = document.getElementById('musicVolLabel');

function updateMusicUI() {
  const on = isMusicPlaying();
  musicToggleBtn.textContent = on ? '🔊 Music ON' : '🔇 Music OFF';
  musicToggleBtn.classList.toggle('active', on);
}

musicToggleBtn.addEventListener('click', () => {
  if (isMusicPlaying()) {
    musicStop();
  } else {
    musicStart(musicThemeSel.value);
  }
  updateMusicUI();
});

musicThemeSel.addEventListener('change', () => {
  musicSetTheme(musicThemeSel.value);
});

musicVolSlider.addEventListener('input', () => {
  const vol = parseFloat(musicVolSlider.value);
  musicSetVolume(vol);
  musicVolLabel.textContent = Math.round(vol * 100) + '%';
});

/* ────────────────────────────────────────────
   HINDI TTS CONTROLS
   ──────────────────────────────────────────── */

const ttsToggleBtn   = document.getElementById('ttsToggle');
const ttsRateSlider  = document.getElementById('ttsRate');
const ttsRateLabel   = document.getElementById('ttsRateLabel');
const ttsPitchSlider = document.getElementById('ttsPitch');
const ttsPitchLabel  = document.getElementById('ttsPitchLabel');
const hindiPresetSel = document.getElementById('hindiPreset');
const insertPresetBtn= document.getElementById('insertPreset');

ttsToggleBtn.addEventListener('click', () => {
  const enabled = !ttsToggleBtn.classList.contains('active');
  ttsSetEnabled(enabled);
  ttsToggleBtn.textContent = enabled ? '🗣️ Voice ON' : '🔇 Voice OFF';
  ttsToggleBtn.classList.toggle('active', enabled);
});

ttsRateSlider.addEventListener('input', () => {
  const rate = parseFloat(ttsRateSlider.value);
  ttsSetRate(rate);
  ttsRateLabel.textContent = rate.toFixed(1) + '×';
});

ttsPitchSlider.addEventListener('input', () => {
  const pitch = parseFloat(ttsPitchSlider.value);
  ttsSetPitch(pitch);
  ttsPitchLabel.textContent = pitch.toFixed(1);
});

// Build Hindi preset dropdown from HINDI_PRESETS constant
function buildHindiPresets() {
  if (!hindiPresetSel) return;
  hindiPresetSel.innerHTML = '<option value="">— Hindi dialogue चुनें —</option>';
  Object.entries(HINDI_PRESETS).forEach(([group, lines]) => {
    const og = document.createElement('optgroup');
    og.label = group;
    lines.forEach(line => {
      const opt = document.createElement('option');
      opt.value = line;
      opt.textContent = line;
      og.appendChild(opt);
    });
    hindiPresetSel.appendChild(og);
  });
}

// Insert selected preset into the last scene's text field
insertPresetBtn.addEventListener('click', () => {
  const val = hindiPresetSel.value;
  if (!val) return;

  const sceneCards = document.querySelectorAll('.scene-card');
  if (sceneCards.length === 0) {
    addScene({ text: val });
    return;
  }

  const lastCard = sceneCards[sceneCards.length - 1];
  const inp = lastCard.querySelector('input[type="text"]');
  if (inp) {
    inp.value = val;
    inp.dispatchEvent(new Event('input'));
  }

  lastCard.style.transition = 'border-color 0.1s';
  lastCard.style.borderColor = '#FFE000';
  setTimeout(() => { lastCard.style.borderColor = ''; }, 600);
  hindiPresetSel.value = '';
});

/* ────────────────────────────────────────────
   TEST VOICE BUTTON
   ──────────────────────────────────────────── */
const testVoiceBtn = document.getElementById('testVoice');
if (testVoiceBtn) {
  testVoiceBtn.addEventListener('click', () => {
    ttsSetEnabled(true);
    ttsToggleBtn.classList.add('active');
    ttsToggleBtn.textContent = '🗣️ Voice ON';
    ttsSpeak('नमस्ते! मैं आपका एनीमे कॉमेडी असिस्टेंट हूँ!', -99);
  });
}

/* ────────────────────────────────────────────
   GENERATE BUTTON
   ──────────────────────────────────────────── */

function generateVideo() {
  const sceneData = getScenes();
  if (!sceneData.length) {
    alert('Add at least one scene first!');
    return;
  }

  ttsReset();
  startPlayback(sceneData);

  // Speak first scene immediately
  if (sceneData[0]) ttsSpeak(sceneData[0].text, 0);

  // Restart music
  if (isMusicPlaying()) {
    musicStop();
    setTimeout(() => musicStart(musicThemeSel.value), 350);
  }

  const dotsEl = document.getElementById('sceneDots');
  dotsEl.innerHTML = sceneData
    .map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`)
    .join('');

  document.getElementById('statusBar').textContent =
    `▶ Playing ${sceneData.length} scene${sceneData.length > 1 ? 's' : ''}!`;

  const fl = document.getElementById('flash');
  fl.style.transition = 'opacity 0.05s';
  fl.style.opacity    = '1';
  setTimeout(() => {
    fl.style.transition = 'opacity 0.4s';
    fl.style.opacity    = '0';
  }, 80);
}

/* ────────────────────────────────────────────
   DOWNLOAD / RECORD BUTTON
   ──────────────────────────────────────────── */

function downloadVideo() {
  if (isRecording()) return;

  const sceneData = getScenes();
  if (!sceneData.length) {
    alert('Generate your video first!');
    return;
  }

  const dur      = parseInt(document.getElementById('sceneDuration').value, 10) || 3000;
  const totalMs  = sceneData.length * dur;
  const statusEl = document.getElementById('statusBar');
  const recBadge = document.getElementById('recBadge');

  ttsReset();
  startPlayback(sceneData);

  startRecording(
    canvas,
    totalMs,
    () => { recBadge.style.display = 'block'; statusEl.textContent = '🔴 Recording… please wait'; },
    () => { recBadge.style.display = 'none';  statusEl.textContent = '✅ Video saved! Check your downloads.'; }
  );
}

/* ────────────────────────────────────────────
   INIT
   ──────────────────────────────────────────── */

buildHindiPresets();
DEFAULT_SCENES.forEach(d => addScene(d));
startLoop();
generateVideo();
