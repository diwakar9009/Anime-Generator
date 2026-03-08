/* ============================================================
   js/renderer.js
   Canvas 2D drawing engine — backgrounds, characters, SFX,
   captions, style overlays, and the main drawScene() entry point.
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────
   BACKGROUND RENDERERS
   Each function receives the canvas 2D context,
   canvas dimensions, and a running timestamp t.
   ──────────────────────────────────────────── */
const BG_RENDERERS = {

  classroom(ctx, W, H, t) {
    // Sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#c8e6fa');
    g.addColorStop(1, '#e8f4fd');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Wooden floor
    ctx.fillStyle = '#d4a96a';
    ctx.fillRect(0, H * 0.72, W, H * 0.28);

    // Blackboard
    ctx.fillStyle = '#2d7a4f';
    ctx.fillRect(W * 0.1, H * 0.05, W * 0.8, H * 0.28);
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 8;
    ctx.strokeRect(W * 0.1, H * 0.05, W * 0.8, H * 0.28);

    // Chalk lines on board
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const y = H * (0.05 + i * 0.065);
      ctx.beginPath();
      ctx.moveTo(W * 0.15, y);
      ctx.lineTo(W * 0.85, y);
      ctx.stroke();
    }

    // Windows
    [0.15, 0.75].forEach(x => {
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(W * x, H * 0.38, W * 0.12, H * 0.18);
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = 4;
      ctx.strokeRect(W * x, H * 0.38, W * 0.12, H * 0.18);
    });
  },

  street(ctx, W, H, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a0a2e');
    g.addColorStop(0.6, '#1a1a5e');
    g.addColorStop(1, '#2a1a0e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137 + t * 0.01) % W;
      const sy = (i * 91) % (H * 0.5);
      ctx.fillStyle = `rgba(255,255,200,${0.4 + Math.sin(t * 0.003 + i) * 0.3})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Building silhouettes
    const buildings = [
      [0,    0.4, 0.2,  0.6,  '#1a1a3a'],
      [0.18, 0.25, 0.15, 0.75, '#161630'],
      [0.32, 0.35, 0.18, 0.65, '#1e1e40'],
      [0.48, 0.2,  0.22, 0.8,  '#141428'],
      [0.68, 0.3,  0.14, 0.7,  '#1c1c38'],
      [0.8,  0.15, 0.2,  0.85, '#181832'],
    ];

    buildings.forEach(([bx, bh, bw, by, col]) => {
      ctx.fillStyle = col;
      ctx.fillRect(W * bx, H * bh, W * bw, H * (1 - bh));

      // Lit windows (randomised but stable via index math)
      for (let wy = bh + 0.03; wy < 0.72; wy += 0.07) {
        for (let wx = 0.01; wx < bw - 0.01; wx += 0.05) {
          if (((bx * 100 + wy * 10 + wx * 100) | 0) % 2 === 0) {
            const alpha = 0.3 + ((bx * 17 + wy * 7) % 10) / 20;
            ctx.fillStyle = `rgba(255,220,80,${alpha})`;
            ctx.fillRect(W * (bx + wx), H * wy, W * 0.025, H * 0.04);
          }
        }
      }
    });

    // Road
    ctx.fillStyle = '#111';
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
    ctx.strokeStyle = '#FFE000';
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, H * 0.89);
    ctx.lineTo(W, H * 0.89);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  sky(ctx, W, H, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1a6e');
    g.addColorStop(0.5, '#6b2fa0');
    g.addColorStop(1, '#f97316');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Drifting clouds
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 5; i++) {
      const cx = (i * 200 + t * 0.02) % W;
      const cy = 50 + i * 60;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80 + i * 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Radial speed lines
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#FFE000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const len = H * 0.4;
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(W / 2 + Math.cos(a) * len, H / 2 + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();

    // Ground
    const gg = ctx.createLinearGradient(0, H * 0.75, 0, H);
    gg.addColorStop(0, '#1a3a1a');
    gg.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = gg;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);
  },

  sakura(ctx, W, H, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#fce4ec');
    g.addColorStop(0.7, '#f8bbd9');
    g.addColorStop(1, '#7cb342');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Falling petals
    for (let i = 0; i < 20; i++) {
      const px = (i * 137 + t * 0.05) % W;
      const py = ((i * 73 + t * 0.03 * i) % H);
      ctx.fillStyle = 'rgba(255,182,193,0.7)';
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * 0.002 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tree trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(W * 0.05, H * 0.2, W * 0.07, H * 0.7);

    // Blossom blob
    ctx.fillStyle = 'rgba(255,105,180,0.55)';
    ctx.beginPath();
    ctx.ellipse(W * 0.15, H * 0.18, W * 0.18, H * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grass
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
  },

  dojo(ctx, W, H, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a0a00');
    g.addColorStop(1, '#3a1a00');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Pillars
    [0.05, 0.85].forEach(x => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(W * x, 0, W * 0.06, H * 0.8);
      ctx.fillStyle = '#4a2000';
      ctx.fillRect(W * x, 0, W * 0.06, H * 0.06);
    });

    // Torii gate
    ctx.strokeStyle = '#cc2200';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.15); ctx.lineTo(W * 0.8, H * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.08); ctx.lineTo(W * 0.75, H * 0.08); ctx.stroke();
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.08); ctx.lineTo(W * 0.3, H * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.7, H * 0.08); ctx.lineTo(W * 0.7, H * 0.55); ctx.stroke();

    // Wooden floor
    ctx.fillStyle = '#2d1500';
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
  },

  space(ctx, W, H, t) {
    ctx.fillStyle = '#000005';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 80; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 91.3) % H;
      const alpha = 0.3 + Math.sin(t * 0.005 + i) * 0.4;
      const radius = i % 20 === 0 ? 2 : 0.8;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Planet
    const pr = W * 0.18;
    const px = W * 0.75, py = H * 0.2;
    const pg = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
    pg.addColorStop(0, '#7b5ea7');
    pg.addColorStop(1, '#2d1b4e');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.strokeStyle = 'rgba(150,100,220,0.4)';
    ctx.lineWidth = 4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(0.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, pr * 1.6, pr * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};


/* ────────────────────────────────────────────
   CHARACTER RENDERER
   ──────────────────────────────────────────── */

/**
 * Draw a full anime-style character at (cx, cy) with the given size.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  - Horizontal centre
 * @param {number} cy  - Vertical anchor (top of character)
 * @param {number} S   - Size unit
 * @param {string} emotion
 * @param {string} char   - Character archetype key
 * @param {number} t      - Elapsed time for animation
 */
function drawCharacter(ctx, cx, cy, S, emotion, char, t) {
  // Body
  ctx.fillStyle = CHAR_COLORS[char] || '#1565c0';
  ctx.beginPath();
  ctx.roundRect(cx - S * 0.3, cy + S * 0.55, S * 0.6, S * 0.7, S * 0.08);
  ctx.fill();

  // Head with gentle bounce
  const bounce = Math.sin(t * 0.004) * S * 0.03;
  const hx = cx;
  const hy = cy + bounce;

  const headG = ctx.createRadialGradient(hx, hy + S * 0.1, S * 0.05, hx, hy + S * 0.2, S * 0.45);
  headG.addColorStop(0, '#ffe0b2');
  headG.addColorStop(1, '#ffcc80');
  ctx.fillStyle = headG;
  ctx.beginPath();
  ctx.ellipse(hx, hy + S * 0.3, S * 0.38, S * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair base
  ctx.fillStyle = HAIR_COLORS[char] || '#212121';
  ctx.beginPath();
  ctx.ellipse(hx, hy + S * 0.1, S * 0.4, S * 0.22, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Hair spikes
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(hx + i * S * 0.12, hy + S * 0.03);
    ctx.lineTo(
      hx + i * S * 0.12 + (i % 2 === 0 ? S * 0.04 : -S * 0.04),
      hy - S * 0.14 - (Math.abs(i) % 2 === 0 ? S * 0.06 : 0)
    );
    ctx.lineTo(hx + i * S * 0.12 + (i % 2 === 0 ? -S * 0.06 : S * 0.06), hy - S * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes
  _drawEyes(ctx, hx, hy, S, emotion, t);

  // Mouth
  _drawMouth(ctx, hx, hy + S * 0.42, S, emotion);

  // Blush cheeks
  if (['embarrassed', 'happy', 'crying'].includes(emotion)) {
    ctx.fillStyle = 'rgba(255,100,100,0.25)';
    ctx.beginPath(); ctx.ellipse(hx - S * 0.22, hy + S * 0.38, S * 0.1, S * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx + S * 0.22, hy + S * 0.38, S * 0.1, S * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Sweat drop
  if (['nervous', 'embarrassed'].includes(emotion)) {
    ctx.fillStyle = 'rgba(100,180,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(hx + S * 0.35, hy + S * 0.1, S * 0.05, S * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function _drawEyes(ctx, hx, hy, S, emotion, t) {
  const blink = Math.sin(t * 0.003) > 0.96;
  const eyeY = hy + S * 0.27;
  const offsets = [-S * 0.14, S * 0.14];

  offsets.forEach(ox => {
    const ex = hx + ox;

    if (emotion === 'dead') {
      // X eyes
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex - S * 0.06, eyeY - S * 0.05); ctx.lineTo(ex + S * 0.06, eyeY + S * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + S * 0.06, eyeY - S * 0.05); ctx.lineTo(ex - S * 0.06, eyeY + S * 0.05); ctx.stroke();
      return;
    }

    // Eyeball white
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, S * 0.09, blink ? S * 0.01 : S * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!blink) {
      // Iris colour
      const irisCol = emotion === 'shocked'  ? '#1a237e'
                    : emotion === 'angry'     ? '#b71c1c'
                    : emotion === 'smug'      ? '#1b5e20'
                    : '#0d47a1';
      ctx.fillStyle = irisCol;
      ctx.beginPath(); ctx.ellipse(ex, eyeY, S * 0.06, S * 0.09, 0, 0, Math.PI * 2); ctx.fill();

      // Pupil
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(ex, eyeY, S * 0.03, S * 0.05, 0, 0, Math.PI * 2); ctx.fill();

      // Specular shine
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ex - S * 0.02, eyeY - S * 0.03, S * 0.015, 0, Math.PI * 2); ctx.fill();

      // Shocked tiny pupils
      if (emotion === 'shocked') {
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(ex, eyeY, S * 0.01, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Eyebrows
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = S * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (emotion === 'angry' || emotion === 'determined') {
      ctx.moveTo(ex - S * 0.09, eyeY - S * 0.17);
      ctx.lineTo(ex + S * 0.09, eyeY - S * 0.22 + (ox < 0 ? S * 0.06 : 0));
    } else if (emotion === 'shocked') {
      ctx.moveTo(ex - S * 0.09, eyeY - S * 0.24);
      ctx.quadraticCurveTo(ex, eyeY - S * 0.3, ex + S * 0.09, eyeY - S * 0.24);
    } else {
      ctx.moveTo(ex - S * 0.09, eyeY - S * 0.19);
      ctx.lineTo(ex + S * 0.09, eyeY - S * 0.19);
    }
    ctx.stroke();

    // Tears
    if (emotion === 'crying') {
      ctx.strokeStyle = 'rgba(100,180,255,0.8)';
      ctx.lineWidth = S * 0.025;
      ctx.beginPath();
      ctx.moveTo(ex, eyeY + S * 0.08);
      ctx.quadraticCurveTo(ex + S * 0.03, eyeY + S * 0.2, ex, eyeY + S * 0.3);
      ctx.stroke();
    }
  });

  // Smug / cool half-lid
  if (emotion === 'smug' || emotion === 'cool') {
    ctx.fillStyle = 'rgba(255,204,128,0.7)';
    offsets.forEach(ox => {
      ctx.beginPath();
      ctx.ellipse(hx + ox, eyeY - S * 0.04, S * 0.09, S * 0.06, 0, 0, Math.PI);
      ctx.fill();
    });
  }
}

function _drawMouth(ctx, mx, my, S, emotion) {
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = S * 0.025;
  ctx.lineCap = 'round';

  switch (emotion) {
    case 'happy':
      ctx.beginPath(); ctx.arc(mx, my, S * 0.12, 0.2, Math.PI - 0.2); ctx.stroke();
      break;
    case 'shocked':
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.ellipse(mx, my, S * 0.08, S * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'angry':
      ctx.beginPath(); ctx.moveTo(mx - S * 0.12, my + S * 0.04); ctx.lineTo(mx + S * 0.12, my - S * 0.04); ctx.stroke();
      break;
    case 'crying':
      ctx.beginPath(); ctx.arc(mx, my + S * 0.05, S * 0.1, Math.PI + 0.2, 2 * Math.PI - 0.2); ctx.stroke();
      break;
    case 'smug':
      ctx.beginPath(); ctx.moveTo(mx - S * 0.1, my); ctx.quadraticCurveTo(mx, my + S * 0.06, mx + S * 0.14, my - S * 0.04); ctx.stroke();
      break;
    case 'dead':
      ctx.beginPath(); ctx.moveTo(mx - S * 0.1, my); ctx.lineTo(mx + S * 0.1, my); ctx.stroke();
      break;
    case 'nervous':
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.1, my);
      ctx.quadraticCurveTo(mx - S * 0.03, my + S * 0.04, mx, my);
      ctx.quadraticCurveTo(mx + S * 0.03, my - S * 0.04, mx + S * 0.1, my);
      ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.arc(mx, my, S * 0.08, 0.1, Math.PI - 0.1); ctx.stroke();
  }
}


/* ────────────────────────────────────────────
   SFX OVERLAY RENDERER
   ──────────────────────────────────────────── */

/**
 * Render per-scene special effects.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} sfx      - Effect key
 * @param {number} t        - Absolute timer
 * @param {number} progress - 0–1 within the current scene
 * @param {number} W
 * @param {number} H
 */
function drawSFX(ctx, sfx, t, progress, W, H) {
  if (!sfx || sfx === 'none') return;

  switch (sfx) {
    case 'flash':
      if (progress < 0.15) {
        ctx.fillStyle = `rgba(255,255,255,${((0.15 - progress) / 0.15) * 0.7})`;
        ctx.fillRect(0, 0, W, H);
      }
      break;

    case 'dramatic': {
      // Dark radial vignette
      const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.7);
      rg.addColorStop(0, 'transparent');
      rg.addColorStop(1, `rgba(0,0,0,${Math.min(progress * 2, 0.7)})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      // Radial speed lines on entry
      if (progress < 0.3) {
        ctx.save();
        ctx.globalAlpha = ((0.3 - progress) / 0.3) * 0.5;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
          const a = (i / 30) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(W / 2, H / 2);
          ctx.lineTo(W / 2 + Math.cos(a) * H, H / 2 + Math.sin(a) * H);
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }

    case 'burst':
      if (progress < 0.4) {
        const alpha = (0.4 - progress) / 0.4;
        const bx = W * 0.5, by = H * 0.35;
        const r1 = W * 0.28, r2 = W * 0.15, spikes = 12;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFE000';
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / spikes) * Math.PI;
          const r = i % 2 === 0 ? r1 : r2;
          ctx.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;

    case 'shake':
      // Shake is handled in drawScene via canvas translation; nothing extra here.
      break;

    case 'rainbow':
      if (progress < 0.5) {
        const alpha = ((0.5 - progress) / 0.5) * 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ['#ff0000','#ff7700','#ffff00','#00ff00','#0000ff','#8b00ff'].forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(0, H * i / 6, W, H / 6);
        });
        ctx.restore();
      }
      break;

    case 'sweat':
      ctx.fillStyle = 'rgba(100,180,255,0.6)';
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(W * (0.3 + i * 0.1), H * (0.15 + Math.sin(i) * 0.05 + progress * 0.3));
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
  }
}


/* ────────────────────────────────────────────
   CAPTION RENDERER
   ──────────────────────────────────────────── */

/**
 * Draw the dialogue caption box at the bottom of the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} centreY  - Vertical centre for the caption block
 * @param {number} progress - 0–1 within scene (drives slide-in)
 * @param {string} style    - Comedy style key
 * @param {number} W
 */
function drawCaption(ctx, text, centreY, progress, style, W) {
  const lineH = W * 0.07;
  const maxW = W * 0.88;
  const fontSize = Math.min(W * 0.065, 36);

  ctx.font = `900 ${fontSize}px "Bangers", cursive`;
  ctx.textAlign = 'center';

  // Word-wrap
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    const test = line + (line ? ' ' : '') + w;
    if (ctx.measureText(test).width > maxW) { lines.push(line); line = w; }
    else line = test;
  });
  lines.push(line);

  const totalH = lines.length * lineH;
  const startY = centreY - totalH / 2;

  // Slide-in animation
  const slideP = Math.min(progress * 6, 1);
  const offsetY = (1 - slideP) * 40;

  const panelPad = 16;
  const panelBg = STYLE_PANEL_COLORS[style]   || 'rgba(0,0,0,0.82)';
  const captCol = STYLE_CAPTION_COLORS[style]  || '#FFE000';
  const bordCol = STYLE_BORDER_COLORS[style]   || '#FFE000';

  ctx.save();
  ctx.globalAlpha = slideP;
  ctx.translate(0, offsetY);

  // Panel background
  ctx.fillStyle = panelBg;
  ctx.beginPath();
  ctx.roundRect(W * 0.06, startY - panelPad, W * 0.88, totalH + panelPad * 2, 12);
  ctx.fill();

  // Panel border
  ctx.strokeStyle = bordCol;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Text with drop shadow
  lines.forEach((ln, i) => {
    const ly = startY + i * lineH + lineH * 0.75;
    ctx.fillStyle = '#000';
    ctx.fillText(ln, W / 2 + 2, ly + 2);
    ctx.fillStyle = captCol;
    ctx.fillText(ln, W / 2, ly);
  });

  ctx.restore();
}


/* ────────────────────────────────────────────
   STYLE OVERLAY
   ──────────────────────────────────────────── */

function drawStyleFX(ctx, style, t, W, H) {
  switch (style) {
    case 'shonen':
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#FFE000';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(W / 2, H / 2);
        ctx.lineTo(W / 2 + Math.cos(a) * H, H / 2 + Math.sin(a) * H);
        ctx.stroke();
      }
      ctx.restore();
      break;

    case 'chibi':
      for (let i = 0; i < 5; i++) {
        const hx = (i * 200 + t * 0.02) % W;
        const hy = ((i * 130 + t * 0.025) % H) * 0.6 + H * 0.05;
        ctx.fillStyle = `rgba(255,105,180,${0.3 + Math.sin(t * 0.003 + i) * 0.2})`;
        ctx.font = `${16 + i * 4}px serif`;
        ctx.fillText('♥', hx, hy);
      }
      break;

    case 'meme':
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, W - 6, H - 6);
      break;

    case 'reaction':
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#FF2D78';
      ctx.lineWidth = 2;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * H / 15);
        ctx.lineTo(W, i * H / 15);
        ctx.stroke();
      }
      ctx.restore();
      break;
  }
}


/* ────────────────────────────────────────────
   TITLE BAR
   ──────────────────────────────────────────── */

function drawTitle(ctx, title, W, H) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, H * 0.04, W, H * 0.13);

  const fontSize = Math.min(W * 0.072, 38);
  ctx.font = `900 ${fontSize}px "Bangers", cursive`;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#000';
  ctx.fillText(title, W / 2 + 2, H * 0.12 + 2);
  ctx.fillStyle = '#FFE000';
  ctx.fillText(title, W / 2, H * 0.12);
  ctx.restore();
}


/* ────────────────────────────────────────────
   CHARACTER NAME TAG
   ──────────────────────────────────────────── */

function drawNameTag(ctx, character, emotion, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.roundRect(W * 0.5 - 70, H * 0.58, 140, 28, 8);
  ctx.fill();

  const fontSize = Math.min(W * 0.042, 18);
  ctx.font = `bold ${fontSize}px "Nunito", sans-serif`;
  ctx.fillStyle = '#00E5FF';
  ctx.textAlign = 'center';
  ctx.fillText(`${character} — ${emotion}`, W / 2, H * 0.598);
}


/* ────────────────────────────────────────────
   MAIN SCENE ENTRY POINT
   ──────────────────────────────────────────── */

// Persistent shake offsets (decay each frame)
let _shakeX = 0, _shakeY = 0;

/**
 * Render a full frame for the given scene data.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {object} scene      - { character, emotion, text, sfx }
 * @param {number} t          - Absolute frame time (ms)
 * @param {number} progress   - 0–1 within the scene
 * @param {string} bgKey      - Background theme key
 * @param {string} style      - Comedy style key
 * @param {string} title      - Video title string
 */
function drawScene(ctx, canvas, scene, t, progress, bgKey, style, title) {
  if (!scene) return;
  const W = canvas.width, H = canvas.height;

  // Screen shake
  if (scene.sfx === 'shake' && progress < 0.25) {
    _shakeX = (Math.random() - 0.5) * 12;
    _shakeY = (Math.random() - 0.5) * 8;
  } else {
    _shakeX *= 0.8;
    _shakeY *= 0.8;
  }

  ctx.save();
  ctx.translate(_shakeX, _shakeY);

  // 1. Background
  const bgRender = BG_RENDERERS[bgKey] || BG_RENDERERS.classroom;
  bgRender(ctx, W, H, t);

  // 2. Style FX (behind character)
  drawStyleFX(ctx, style, t, W, H);

  // 3. Character
  const charSize = H * 0.38;
  drawCharacter(ctx, W * 0.5, H * 0.3, charSize, scene.emotion, scene.character, t);

  // 4. Scene SFX
  drawSFX(ctx, scene.sfx, t, progress, W, H);

  // 5. Caption
  drawCaption(ctx, scene.text, H * 0.79, progress, style, W);

  // 6. Title bar
  drawTitle(ctx, title, W, H);

  // 7. Name tag
  drawNameTag(ctx, scene.character, scene.emotion, W, H);

  ctx.restore();
}
