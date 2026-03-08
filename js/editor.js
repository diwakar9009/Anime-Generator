/* ============================================================
   js/editor.js
   Scene editor — add, remove, update scenes and render the
   scene-card list into the DOM.
   ============================================================ */

'use strict';

/** In-memory scene array. Each item: { id, character, emotion, text, sfx } */
let scenes = [];

/* ────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────── */

/**
 * Add a new scene (optionally pre-populated with data).
 * @param {object} [data]
 */
function addScene(data = {}) {
  const id = Date.now() + Math.random(); // unique even if called rapidly
  scenes.push({
    id,
    character: data.character || 'Hero',
    emotion:   data.emotion   || 'shocked',
    text:      data.text      || 'Write something funny! 😂',
    sfx:       data.sfx       || 'flash',
  });
  _renderSceneList();
}

/**
 * Remove a scene by its id.
 * @param {number} id
 */
function removeScene(id) {
  scenes = scenes.filter(s => s.id !== id);
  _renderSceneList();
}

/**
 * Update a single field on a scene.
 * @param {number} id
 * @param {string} key
 * @param {*}      value
 */
function updateScene(id, key, value) {
  const sc = scenes.find(s => s.id === id);
  if (sc) sc[key] = value;
}

/**
 * Return a shallow copy of the current scenes array (for the player).
 * @returns {object[]}
 */
function getScenes() {
  return scenes.map(s => ({ ...s }));
}

/* ────────────────────────────────────────────
   DOM RENDERING
   ──────────────────────────────────────────── */

function _renderSceneList() {
  const list = document.getElementById('sceneList');
  list.innerHTML = '';

  scenes.forEach((sc, i) => {
    const card = document.createElement('div');
    card.className = 'scene-card';
    card.innerHTML = `
      <div class="scene-num">
        Scene ${i + 1}
        <button class="remove-btn" title="Remove scene"
          onclick="removeScene(${sc.id})">✕</button>
      </div>

      <div class="scene-row">
        <!-- Character -->
        <div>
          <label style="margin-top:0">Character</label>
          <select onchange="updateScene(${sc.id}, 'character', this.value)">
            ${CHARS.map(c => `<option ${c === sc.character ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <!-- Emotion -->
        <div>
          <label style="margin-top:0">Emotion</label>
          <select onchange="updateScene(${sc.id}, 'emotion', this.value)">
            ${EMOTIONS.map(e => `<option ${e === sc.emotion ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <!-- SFX -->
        <div>
          <label style="margin-top:0">SFX</label>
          <select onchange="updateScene(${sc.id}, 'sfx', this.value)">
            ${SFX_OPTIONS.map(s => `<option ${s === sc.sfx ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>

        <!-- Dialogue -->
        <div class="scene-text">
          <label style="margin-top:0">Dialogue / Caption</label>
          <input type="text"
            value="${sc.text.replace(/"/g, '&quot;')}"
            oninput="updateScene(${sc.id}, 'text', this.value)"
            placeholder="Enter funny dialogue…">
        </div>
      </div>`;

    list.appendChild(card);
  });
}
