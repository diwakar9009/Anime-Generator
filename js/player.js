/* ============================================================
   js/player.js
   Animation loop, scene sequencing, and playback controls.
   ============================================================ */

'use strict';

/* ── State ── */
let _generatedScenes = [];
let _currentScene    = 0;
let _playing         = false;
let _lastTimestamp   = null;
let _elapsedInScene  = 0;
let _globalTime      = 0;   // ever-increasing ms counter (drives animations)

/* ────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────── */

/** Kick off / restart playback with a new set of scenes. */
function startPlayback(scenes) {
  _generatedScenes = scenes;
  _currentScene    = 0;
  _elapsedInScene  = 0;
  _playing         = true;
  _lastTimestamp   = null;
  _updatePlayBtn();
  _updateDots();
}

function togglePlay() {
  _playing = !_playing;
  if (_playing) _lastTimestamp = null;
  _updatePlayBtn();
}

function prevScene() {
  _currentScene   = (_currentScene - 1 + _generatedScenes.length) % _generatedScenes.length;
  _elapsedInScene = 0;
  _updateDots();
}

function nextScene() {
  _currentScene   = (_currentScene + 1) % _generatedScenes.length;
  _elapsedInScene = 0;
  _updateDots();
}

/** Return the index of the scene currently on screen. */
function currentSceneIndex() { return _currentScene; }

/** Reset playback to the first scene (used before recording). */
function resetToStart() {
  _currentScene   = 0;
  _elapsedInScene = 0;
  _playing        = true;
  _lastTimestamp  = null;
  _updatePlayBtn();
  _updateDots();
}

/* ────────────────────────────────────────────
   ANIMATION LOOP
   ──────────────────────────────────────────── */

function _loop(timestamp) {
  const canvas = document.getElementById('anime-canvas');
  const ctx    = canvas.getContext('2d');

  if (_generatedScenes.length === 0) {
    // Draw idle placeholder
    _drawIdle(ctx, canvas);
    requestAnimationFrame(_loop);
    return;
  }

  // Delta time
  if (!_lastTimestamp) _lastTimestamp = timestamp;
  const delta = timestamp - _lastTimestamp;
  _lastTimestamp = timestamp;
  _globalTime   += delta;

  if (_playing) {
    _elapsedInScene += delta;
    const dur = _sceneDuration();
    if (_elapsedInScene >= dur) {
      _elapsedInScene = 0;
      _currentScene   = (_currentScene + 1) % _generatedScenes.length;
      _updateDots();
      // Speak the new scene's dialogue
      const sc = _generatedScenes[_currentScene];
      if (sc && typeof ttsSpeak === 'function') ttsSpeak(sc.text, _currentScene);
    }
  }

  const progress = _elapsedInScene / _sceneDuration();
  const sc       = _generatedScenes[_currentScene];
  const bgKey    = document.getElementById('bgTheme').value;
  const style    = _getSelectedStyle();
  const title    = document.getElementById('videoTitle').value || 'Anime Comedy';

  drawScene(ctx, canvas, sc, _globalTime, progress, bgKey, style, title);

  requestAnimationFrame(_loop);
}

/** Start the RAF loop. Call once on page load. */
function startLoop() {
  requestAnimationFrame(_loop);
}

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */

function _sceneDuration() {
  return parseInt(document.getElementById('sceneDuration').value, 10) || 3000;
}

function _getSelectedStyle() {
  const chip = document.querySelector('#styleChips .chip.selected');
  return chip ? chip.dataset.style : 'shonen';
}

function _updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === _currentScene);
    d.classList.toggle('done', i < _currentScene);
  });
}

function _updatePlayBtn() {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.textContent = _playing ? '⏸ Pause' : '▶ Play';
  btn.classList.toggle('active', _playing);
}

function _drawIdle(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#0D0D1A';
  ctx.fillRect(0, 0, W, H);
  ctx.font = `bold ${Math.min(W * 0.06, 22)}px "Nunito", sans-serif`;
  ctx.fillStyle = 'rgba(240,240,255,0.3)';
  ctx.textAlign = 'center';
  ctx.fillText('Add scenes & press', W / 2, H / 2 - 18);
  ctx.fillStyle = '#FF2D78';
  ctx.fillText('▶ GENERATE VIDEO', W / 2, H / 2 + 18);
}
