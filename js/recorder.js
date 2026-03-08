/* ============================================================
   js/recorder.js
   MediaRecorder wrapper — captures the canvas stream and
   offers the result as a downloadable .webm file.
   ============================================================ */

'use strict';

let _isRecording    = false;
let _recordedChunks = [];
let _mediaRecorder  = null;

/* ────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────── */

/**
 * Start recording the canvas for the full video duration, then
 * trigger a file download when done.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number}            totalDurationMs
 * @param {Function}          onStart  - Called when recording begins
 * @param {Function}          onEnd    - Called when the file is saved
 */
function startRecording(canvas, totalDurationMs, onStart, onEnd) {
  if (_isRecording) return;
  _isRecording    = true;
  _recordedChunks = [];

  const stream  = canvas.captureStream(30);
  const options = _bestMimeType();

  try {
    _mediaRecorder = options
      ? new MediaRecorder(stream, { mimeType: options })
      : new MediaRecorder(stream);
  } catch (err) {
    console.warn('MediaRecorder init error:', err);
    _mediaRecorder = new MediaRecorder(stream);
  }

  _mediaRecorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) _recordedChunks.push(e.data);
  };

  _mediaRecorder.onstop = () => {
    const mimeType = _mediaRecorder.mimeType || 'video/webm';
    const ext      = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob     = new Blob(_recordedChunks, { type: mimeType });
    const url      = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = url;
    a.download = `anime-comedy-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    _isRecording = false;
    if (typeof onEnd === 'function') onEnd();
  };

  _mediaRecorder.start();
  if (typeof onStart === 'function') onStart();

  // Auto-stop after the full video length + small buffer
  setTimeout(() => {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
      _mediaRecorder.stop();
    }
  }, totalDurationMs + 600);
}

/** Returns true while a recording is in progress. */
function isRecording() { return _isRecording; }

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */

/** Pick the best supported MIME type for this browser. */
function _bestMimeType() {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}
