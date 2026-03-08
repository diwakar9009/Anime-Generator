/* ============================================================
   js/constants.js
   Shared constants, lookup tables, and default scene data
   ============================================================ */

'use strict';

/** Available character emotions */
const EMOTIONS = [
  'happy', 'shocked', 'angry', 'crying', 'smug',
  'cool', 'nervous', 'determined', 'embarrassed', 'dead'
];

/** Available character archetypes */
const CHARS = [
  'Student', 'Teacher', 'Hero', 'Villain', 'Idol',
  'Samurai', 'Wizard', 'Kawaii Girl', 'Office Guy', 'Sensei'
];

/** Available scene special effects */
const SFX_OPTIONS = ['none', 'flash', 'dramatic', 'burst', 'shake', 'rainbow', 'sweat'];

/** Default demo scenes loaded on first launch (Hindi dialogue) */
const DEFAULT_SCENES = [
  { character: 'Student', emotion: 'shocked',  text: 'अरे! आज होमवर्क नहीं?! 😱',           sfx: 'flash'    },
  { character: 'Teacher', emotion: 'smug',     text: 'अप्रैल फूल! 😈 डबल होमवर्क मिलेगा!', sfx: 'dramatic' },
  { character: 'Student', emotion: 'crying',   text: 'नहींईईईई!!! 😭💀 बर्बाद हो गया!',       sfx: 'burst'    },
];

/** Hindi comedy dialogue presets — grouped by theme */
const HINDI_PRESETS = {
  'स्कूल (School)': [
    'अरे! आज होमवर्क नहीं?! 😱',
    'मैडम जी, मेरा होमवर्क कुत्ते ने खा लिया! 🐶',
    'परीक्षा में 100 में से 2 नंबर! यही मेरी किस्मत है 😭',
    'टीचर आ गए! सब किताबें निकालो! 📚',
    'बस 5 मिनट और सो लेने दो... 😴',
  ],
  'दोस्ती (Friendship)': [
    'यार, तूने मेरा टिफिन फिर खा लिया! 😠',
    'भाई, प्यार हो गया मुझे! 💕',
    'सच में?! तूने यह मुझे नहीं बताया?! 😱',
    'दोस्त हो या दुश्मन? समझ नहीं आता! 🤔',
    'अरे भाई, एक बार तो मेरी बात मान ले! 🙏',
  ],
  'ड्रामा (Drama)': [
    'मैं तुम्हें कभी माफ नहीं करूंगा! 😤',
    'यह... यह नहीं हो सकता! 😰',
    'मेरी शक्ति अब जाग उठी है!! ⚡',
    'आज के बाद मैं वही नहीं रहूंगा! 🔥',
    'तुमने मुझसे गलत किया! अब देखो! 👊',
  ],
  'रोज़मर्रा (Daily Life)': [
    'सुबह 6 बजे उठना पड़ेगा... नहीं चाहिए ऐसी ज़िंदगी 😩',
    'मम्मी ने आलू-प्याज़ लाने भेजा और मैं... 🥲',
    'WiFi बंद हो गया! यह तो आफत है! 📵',
    'Exam कल है और मैं अभी Netflix देख रहा हूँ 😅',
    'दाल चावल फिर से?! यार कुछ नया खिलाओ! 🍛',
  ],
  'शक्ति (Power)': [
    'मेरी असली शक्ति अभी तक किसी ने नहीं देखी!! ⚡',
    'तुम मुझे जानते नहीं... अभी दिखाता हूँ! 💥',
    'यह मेरा अंतिम वार होगा! 🗡️',
    'मैं हार नहीं मानता! कभी नहीं!! 🔥',
    'देखो कैसे एक ही झटके में सब ठीक करता हूँ! 👊',
  ],
};

/** Body colour per character archetype */
const CHAR_COLORS = {
  'Student':     '#1565c0',
  'Teacher':     '#2e7d32',
  'Hero':        '#b71c1c',
  'Villain':     '#4a148c',
  'Idol':        '#880e4f',
  'Samurai':     '#37474f',
  'Wizard':      '#1a237e',
  'Kawaii Girl': '#e91e63',
  'Office Guy':  '#455a64',
  'Sensei':      '#e65100',
};

/** Hair colour per character archetype */
const HAIR_COLORS = {
  'Student':     '#212121',
  'Teacher':     '#4e342e',
  'Hero':        '#f57f17',
  'Villain':     '#6a1b9a',
  'Idol':        '#e91e63',
  'Samurai':     '#1a1a1a',
  'Wizard':      '#e3f2fd',
  'Kawaii Girl': '#f48fb1',
  'Office Guy':  '#37474f',
  'Sensei':      '#795548',
};

/** Caption colours per comedy style */
const STYLE_CAPTION_COLORS = {
  shonen:   '#FFE000',
  chibi:    '#d63384',
  meme:     '#ffffff',
  slice:    '#FFE000',
  reaction: '#FFE000',
};

/** Caption panel backgrounds per comedy style */
const STYLE_PANEL_COLORS = {
  shonen:   'rgba(0,0,0,0.82)',
  chibi:    'rgba(255,182,193,0.88)',
  meme:     'rgba(0,0,0,0.9)',
  slice:    'rgba(10,10,40,0.85)',
  reaction: 'rgba(10,10,40,0.85)',
};

/** Caption border colours per comedy style */
const STYLE_BORDER_COLORS = {
  shonen:   '#FFE000',
  chibi:    '#FF69B4',
  meme:     '#ffffff',
  slice:    '#00E5FF',
  reaction: '#00E5FF',
};
