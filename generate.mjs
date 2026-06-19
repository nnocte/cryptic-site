// generate.mjs — Builds "The Observatory" ARG
// Atmosphere: a found terminal monitoring a remote signal.
// The signature element is a per-page status line — a system readout
// in the top-left corner that turns the site into a control room.
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'public');

// ─── Design Tokens ────────────────────────────────────────────────
// Five colors, used sparingly. The site reads as dim parchment
// in a near-black room, with the status line and corner stamp
// acting as a found terminal monitoring the scene.
const TOKENS = {
  bg:       '#0e0d0c',  // ink — primary background
  text:     '#c8c3bc',  // parchment — primary text
  textDim:  '#6b6763',  // dim — secondary text
  link:     '#c8c3bc',  // parchment
  linkHover:'#e8e4df',  // bone — on hover
  ember:    '#b3402c',  // red accent (horror/contact)
  signal:   '#5a8a6a',  // green accent (transmission)
  bone:     '#d8d4cc',  // bright text (stark/decision)
  font: `ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'Consolas', 'Courier New', monospace`,
  fz: '16px',
  lh: '1.85',
  maxW: '33em',
};

// Subtle tints per page — barely perceptible shifts, not theme changes
const TINTS = {
  cold:  { bg: '#0d0e10', text: '#c4c0b8' },
  amber: { bg: '#100e0b', text: '#ccc4b4' },
  red:   { bg: '#110d0c', text: '#c8bcb8' },
  green: { bg: '#0c0e0c', text: '#bcc8c0' },
  stark: { bg: '#0a0a09', text: '#d8d4cc' },
};

// ─── Word → URL mapping ───────────────────────────────────────────
const WORD_MAP = {
  'elias':        '/elias/',
  'coat':         '/coat/',
  'desk':         '/desk/',
  'logbook':      '/log/',
  'twelve':       '/12/',
  '03:14':        '/0314/',
  'chart':        '/chart/',
  'antares':      '/antares/',
  'frequency':    '/frequency/',
  '1420':         '/1420/',
  'echo':         '/echo/',
  'delay':        '/delay/',
  'eight':        '/8/',
  'numbers':      '/numbers/',
  'hello':        '/hello/',
  'question':     '/question/',
  'looks back':   '/looks-back/',
  'choose':       '/choose/',
  'open':         '/open/',
  'close':        '/close/',
  'visible':      '/visible/',
  'stay':         '/stay/',
  'not mine':     '/not-mine/',
  'previous':     '/previous/',
  'dark':         '/dark/',
  'eyes':         '/eyes/',
  'room':         '/room/',
  'drawer':       '/drawer/',
  'photograph':   '/photo/',
  'window':       '/window/',
  'roof':         '/roof/',
  'kitchen':      '/kitchen/',
  'bedroom':      '/bedroom/',
  'clock':        '/clock/',
};

// ─── Page Data ────────────────────────────────────────────────────
// decoration: { pattern, tint, extra? }
//   pattern — string of 1s and 0s, visual dot pattern (top-left)
//   tint    — background + text color shift class
//   extra   — optional special effect class
const PAGES = [
  // ── Act I: Discovery ─────────────────────────────────────────────
  { route: '/',       lines: ['The observatory gate is rusted shut.',
                             "A note is taped to it: 'Name the keeper of the light. The door knows the answer.'",
                             'Below, someone has scratched a name into the metal: **elias**.'],
    decoration: { pattern: '1000', tint: 'cold' } },

  { route: 'elias',   lines: ['Inside, the air is cold.',
                             'A **coat** hangs by the door. A **desk** sits against the wall.',
                             'On it, a **logbook** is open to page twelve.'],
    decoration: { pattern: '0100', tint: 'cold' } },

  { route: 'coat',    lines: ["Elias's coat is still damp.",
                             'It smells like rain and metal.',
                             'In the pocket, a receipt from a town that is not on any map.'],
    decoration: { pattern: '0010', tint: 'amber' } },

  { route: 'desk',    lines: ['The **drawer** is locked.',
                             'On top: a pen, a half-empty notebook, and a **photograph** turned face-down.'],
    decoration: { pattern: '0001', tint: 'amber' } },

  { route: 'drawer',  lines: ['You force the drawer.',
                             'Inside: a single key, unlabeled.',
                             'You try it on every door. It fits none of them.'],
    decoration: { pattern: '1100', tint: 'red' } },

  { route: 'photo',   lines: ['You turn the photograph over.',
                             'Two people stand in front of the observatory.',
                             'One is Elias. The other has no face — just static, or a developing error.'],
    decoration: { pattern: '1010', tint: 'red', extra: 'static' } },

  { route: 'log',     lines: ['The logbook is full of crossed-out dates.',
                             'Only one entry is clean: number **twelve**, dated December 12.'],
    decoration: { pattern: '0110', tint: 'amber' } },

  { route: '12',      lines: ['December 12. Clear skies.',
                             'It appeared again at **03:14**. Same position.',
                             'I am certain now that it sees me when I look at it.'],
    decoration: { pattern: '1001', tint: 'amber' } },

  { route: 'clock',   lines: ['The wall clock stopped at 03:14.',
                             'The second hand trembles but does not move forward.'],
    decoration: { pattern: '0100', tint: 'cold', extra: 'frozen' } },

  { route: '0314',    lines: ['At 03:14 the equipment hums.',
                             'The telescope turns on its own toward the southern wall.',
                             'The **chart** there has one star circled.'],
    decoration: { pattern: '1000', tint: 'cold' } },

  { route: 'window',  lines: ['Outside, the hills roll away under a sky too bright for the hour.',
                             'A second moon would explain the shadows.',
                             'There is not one.'],
    decoration: { pattern: '0110', tint: 'cold' } },

  // ── Act II: The Signal ───────────────────────────────────────────
  { route: 'chart',   lines: ['The chart is crowded with constellations.',
                             'One star is ringed in red.',
                             "Below it, in Elias's hand: **antares**."],
    decoration: { pattern: '1010', tint: 'cold', extra: 'grid' } },

  { route: 'roof',    lines: ['The telescope is open to the sky.',
                             'It is warm, as if it has been tracking something for hours.',
                             'No one has touched it in days.'],
    decoration: { pattern: '1110', tint: 'cold' } },

  { route: 'antares', lines: ['Antares flickers wrong.',
                             'Not variable — responsive.',
                             'The signal has a **frequency**.'],
    decoration: { pattern: '1101', tint: 'red' } },

  { route: 'frequency', lines: ['The dial runs from 1000 to 2000.',
                               'Hydrogen sings at **1420**.',
                               'I marked it so I would not forget.'],
    decoration: { pattern: '0111', tint: 'green' } },

  { route: '1420',    lines: ["1420 megahertz. The universe's whisper.",
                             'But this whisper repeats. It waits for me to stop before it starts again.',
                             'It is an **echo**.'],
    decoration: { pattern: '1111', tint: 'green', extra: 'signal' } },

  { route: 'echo',    lines: ['I send a tone. It comes back.',
                             'Not a reflection — a reply.',
                             'There is a **delay** between my voice and its answer.'],
    decoration: { pattern: '10101', tint: 'green', extra: 'wave' } },

  { route: 'delay',   lines: ['I timed it.',
                             'The delay is exactly **eight** seconds.',
                             'Someone is counting with me.'],
    decoration: { pattern: '00111', tint: 'green' } },

  { route: '8',       lines: ['After eight seconds, the signal changes.',
                             'It no longer copies me.',
                             'It sends **numbers**.'],
    decoration: { pattern: '1100', tint: 'green' } },

  { route: 'numbers', lines: ['The first message: 8-5-12-12-15.',
                             'Translate the numbers to letters.',
                             'The word is **hello**.'],
    decoration: { pattern: '10110', tint: 'green' } },

  // ── Act III: Contact ─────────────────────────────────────────────
  { route: 'hello',   lines: ['I said hello back.',
                             'The static shifted.',
                             'I asked my **question**. The answer took twelve minutes.'],
    decoration: { pattern: '1110', tint: 'red' } },

  { route: 'question', lines: ["I wrote: 'Who are you?'",
                              "They did not give a name.",
                              "They said: 'We are what **looks back**.'"],
    decoration: { pattern: '0111', tint: 'red' } },

  { route: 'looks-back', lines: ['They exist in the act of being seen.',
                                'They do not have bodies, only attention.',
                                'They want me to **choose**.'],
    decoration: { pattern: '1101', tint: 'red', extra: 'gaze' } },

  { route: 'kitchen', lines: ['A cup of tea sits on the table.',
                             'It is still warm.',
                             'You did not make it.'],
    decoration: { pattern: '0101', tint: 'red' } },

  { route: 'bedroom', lines: ["The bed is made.",
                             "On the pillow, a single hair that is not yours and not Elias's.",
                             'It glows faintly in the dark.'],
    decoration: { pattern: '1001', tint: 'red' } },

  // ── Act IV: The Choice ───────────────────────────────────────────
  { route: 'choose',  lines: ['Two buttons under cracked glass.',
                             'One marked **open**. One marked **close**.',
                             'Elias wrote below: "I could not decide. I left it for whoever came next."'],
    decoration: { pattern: '101', tint: 'stark' } },

  // ── Branch: OPEN ─────────────────────────────────────────────────
  { route: 'open',    lines: ['I pressed open.',
                             'The walls became thin. I saw through them. They saw through me.',
                             'We became **visible** to each other.'],
    decoration: { pattern: '1110', tint: 'red', extra: 'thin' } },

  { route: 'visible', lines: ['They are not hostile.',
                             'They are curious.',
                             'They want to know what it is like to be one person, one ending. They asked if they could **stay**.'],
    decoration: { pattern: '1111', tint: 'red' } },

  { route: 'stay',    lines: ['I said yes.',
                             'Now I am not alone in my own head.',
                             'Sometimes I write things and do not remember writing them. Sometimes the handwriting is **not mine**.'],
    decoration: { pattern: '1011', tint: 'red' } },

  { route: 'not-mine', lines: ['I found a second set of notes.',
                              'They describe the observatory from above.',
                              'They call me "the **previous** occupant." I do not remember moving out.'],
    decoration: { pattern: '0101', tint: 'red' } },

  { route: 'previous', lines: ['Every visitor becomes the keeper.',
                              'Every keeper leaves notes for the next.',
                              'You named me. Now you are where I was. The light is still on. Scratch your name into the gate.'],
    decoration: { pattern: '1100', tint: 'cold' } },

  // ── Branch: CLOSE ────────────────────────────────────────────────
  { route: 'close',   lines: ['I pressed close.',
                             'The humming stopped. The lights went out.',
                             'I sat in the **dark** for a long time, telling myself I had done the right thing.'],
    decoration: { pattern: '0001', tint: 'cold' } },

  { route: 'dark',    lines: ['In the dark, I could still see the afterimage.',
                             'A shape burned into the inside of my eyelids.',
                             'It was waiting for me to open my **eyes** again.'],
    decoration: { pattern: '0100', tint: 'cold' } },

  { route: 'eyes',    lines: ['I cannot forget the eyes.',
                             'I see them when I wake. I see them when I sleep.',
                             'I left the observatory, but I never left the **room**.'],
    decoration: { pattern: '1100', tint: 'red', extra: 'gaze' } },

  { route: 'room',    lines: ['There is no outside.',
                             'The observatory is wherever you look closely enough.',
                             'I came back. The light was still on. Someone had scratched a new name into the gate.'],
    decoration: { pattern: '0000', tint: 'cold' } },
];

// ─── HTML Template ────────────────────────────────────────────────
function pageHTML(page, bodyHTML) {
  const d = page.decoration || { pattern: '0000', tint: 'cold' };
  const tintClass = `tint-${d.tint}`;
  const extraClass = d.extra ? ` extra-${d.extra}` : '';

  // Render pattern as dots: first dot pulses, rest are on/off per pattern
  const pattern = d.pattern || '0000';
  let dotsHTML = '<div class="status" aria-hidden="true">';
  for (let i = 0; i < pattern.length; i++) {
    const on = pattern[i] === '1';
    const cls = `mark${on ? ' on' : ''}${i === 0 ? ' pulse' : ''}`;
    dotsHTML += `<span class="${cls}"></span>`;
  }
  dotsHTML += '</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>—</title>
<link rel="stylesheet" href="/common.css">
<style>
::selection { background: #3a3632; color: ${TOKENS.text}; }
::-moz-selection { background: #3a3632; color: ${TOKENS.text}; }
</style>
</head>
<body class="${tintClass}${extraClass}">
${dotsHTML}
<div class="hairline" aria-hidden="true"></div>
<div class="corner" aria-hidden="true"></div>
${bodyHTML}
</body>
</html>`;
}

// ─── Render a page's content ──────────────────────────────────────
function renderContent(page) {
  let html = '<div class="p">\n  <div class="c">\n';
  for (const line of page.lines) {
    html += `    <p>${renderLine(line)}</p>\n`;
  }
  html += '  </div>\n</div>\n';
  return html;
}

function renderLine(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, (match, word) => {
    const url = wordToURL(word);
    if (url) return `<a href="${url}">${word}</a>`;
    return word;
  });
}

function wordToURL(word) {
  if (WORD_MAP[word]) return WORD_MAP[word];
  const w = word.toLowerCase().trim();
  if (WORD_MAP[w]) return WORD_MAP[w];
  return null;
}

// ─── Write a page ─────────────────────────────────────────────────
function writePage(page) {
  let outDir, htmlFile;
  if (page.route === '/') {
    outDir = OUT;
    htmlFile = join(outDir, 'index.html');
  } else {
    outDir = join(OUT, page.route);
    htmlFile = join(outDir, 'index.html');
  }
  mkdirSync(outDir, { recursive: true });

  const body = renderContent(page);
  const html = pageHTML(page, body);
  writeFileSync(htmlFile, html, 'utf-8');
  console.log(`  ✓ /${page.route}/`);
}

// ─── Entry point ──────────────────────────────────────────────────
console.log('Building "The Observatory"...\n');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Write shared CSS — the design system for the whole site
const css = `/* ─── The Observatory ─── */

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: ${TOKENS.bg};
  color: ${TOKENS.text};
  font-family: ${TOKENS.font};
  font-size: ${TOKENS.fz};
  line-height: ${TOKENS.lh};
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  min-height: 100%;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${TOKENS.bg};
  color: ${TOKENS.text};
  transition: background 1.2s ease, color 1.2s ease;
}

/* ─── Tints: subtle per-page color shift ─── */
body.tint-cold  { background: ${TINTS.cold.bg};  color: ${TINTS.cold.text}; }
body.tint-amber { background: ${TINTS.amber.bg}; color: ${TINTS.amber.text}; }
body.tint-red   { background: ${TINTS.red.bg};   color: ${TINTS.red.text}; }
body.tint-green { background: ${TINTS.green.bg}; color: ${TINTS.green.text}; }
body.tint-stark { background: ${TINTS.stark.bg}; color: ${TINTS.stark.text}; }

/* ─── Status line: top-left dot pattern. No text — pure visual. ───
   Each page gets a unique pattern of small dots. The first dot pulses.
   The pattern is a visual signature, not information — it can't mislead
   the player into thinking any of the dots are clues. */
.status {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  gap: 5px;
  z-index: 10;
  user-select: none;
  pointer-events: none;
}

.status .mark {
  display: block;
  width: 5px;
  height: 5px;
  background: rgba(200, 195, 188, 0.10);
}

.status .mark.on {
  background: rgba(200, 195, 188, 0.40);
}

.status .mark.pulse {
  animation: pulse 3.4s ease-in-out infinite;
}

body.tint-red .status .mark.on   { background: rgba(179, 64, 44, 0.45); }
body.tint-green .status .mark.on { background: rgba(90, 138, 106, 0.50); }
body.tint-amber .status .mark.on { background: rgba(200, 170, 120, 0.42); }
body.tint-stark .status .mark.on { background: rgba(216, 212, 204, 0.45); }

@keyframes pulse {
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 0.95; }
}

/* ─── Hairline: left margin rule ─── */
.hairline {
  position: fixed;
  top: 0;
  left: 1.5rem;
  width: 1px;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(200, 195, 188, 0.05) 12%,
    rgba(200, 195, 188, 0.05) 88%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* ─── Corner stamp: bottom-right geometric bracket. No text. ─── */
.corner {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 8px;
  height: 8px;
  border-right: 1px solid rgba(200, 195, 188, 0.18);
  border-bottom: 1px solid rgba(200, 195, 188, 0.18);
  pointer-events: none;
  z-index: 10;
}

body.tint-red .corner   { border-color: rgba(179, 64, 44, 0.22); }
body.tint-green .corner { border-color: rgba(90, 138, 106, 0.25); }
body.tint-amber .corner { border-color: rgba(200, 170, 120, 0.20); }
body.tint-stark .corner { border-color: rgba(216, 212, 204, 0.22); }

/* ─── Main content ─── */
.p {
  width: 100%;
  max-width: ${TOKENS.maxW};
  position: relative;
  z-index: 5;
}

.c p {
  margin-bottom: 1.6em;
}

.c p:last-child {
  margin-bottom: 0;
}

/* ─── Links: invisible as links. The puzzle is to notice the word. ───
   Default state is identical to body text. The browser's pointer cursor
   on hover is the only signal. No underline, no border, no color shift
   in the default state — giving away the link would spoil the puzzle. */
a {
  color: inherit;
  text-decoration: none;
  border-bottom: none;
  background: none;
  cursor: pointer;
  transition: color 0.18s ease;
}

a:hover, a:focus-visible {
  color: ${TOKENS.linkHover};
  outline: none;
}

a:focus-visible {
  outline: 1px dotted ${TOKENS.textDim};
  outline-offset: 4px;
}

/* Selection */
::selection {
  background: #3a3632 !important;
  color: ${TOKENS.text} !important;
}

::-moz-selection {
  background: #3a3632 !important;
  color: ${TOKENS.text} !important;
}

/* ─── Page-specific extras ─── */

/* Static / corruption: subtle noise overlay */
body.extra-static::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 2px,
    rgba(255, 255, 255, 0.012) 2px,
    rgba(255, 255, 255, 0.012) 3px
  );
  pointer-events: none;
  z-index: 2;
  animation: static-shift 0.18s steps(2) infinite;
}

@keyframes static-shift {
  0%   { opacity: 0.7; }
  50%  { opacity: 0.4; }
  100% { opacity: 0.8; }
}

/* Frozen: time feels stuck — text gets a barely-blurred quality */
body.extra-frozen .c p {
  text-shadow: 0 0 0.5px currentColor;
  filter: contrast(0.95);
}

/* Grid: star chart backdrop — barely visible crosshatch */
body.extra-grid::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(200, 195, 188, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 195, 188, 0.025) 1px, transparent 1px);
  background-size: 64px 64px;
  pointer-events: none;
  z-index: 1;
}

/* Signal: faint oscilloscope glow on the status dot only */
body.extra-signal .status .dot {
  background: ${TOKENS.signal};
  animation: pulse-signal 1.4s ease-in-out infinite;
}

@keyframes pulse-signal {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%      { opacity: 0.95; transform: scale(1.2); }
}

/* Wave: status dot uses a longer, slower pulse for echo */
body.extra-wave .status .dot {
  background: ${TOKENS.signal};
  animation: pulse-wave 2.0s ease-in-out infinite;
  animation-delay: 0.3s;
}

@keyframes pulse-wave {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 0.7; }
}

/* Decode: a visual cipher key for /numbers/ — two rows of small dots.
   26 dots in a 2×13 grid. Pure visual, no text. The page text already
   reveals the answer; this is a decorative element. */
body.extra-decode::after {
  content: '';
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  width: 78px;
  height: 12px;
  background-image: radial-gradient(circle, rgba(200,195,188,0.18) 1.2px, transparent 1.5px);
  background-size: 6px 6px;
  background-position: 0 0;
  pointer-events: none;
  user-select: none;
  z-index: 10;
  opacity: 0.6;
}

/* Gaze: afterimage effect — text-shadow ghost */
body.extra-gaze .c p {
  text-shadow:
    0.6px 0 0 rgba(179, 64, 44, 0.18),
   -0.6px 0 0 rgba(200, 195, 188, 0.05);
}

/* Thin: permeability — text appears slightly translucent */
body.extra-thin .c p {
  letter-spacing: 0.01em;
  filter: contrast(1.05);
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  body, a, .status .dot, body::before, body::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
  }
}

/* ─── Mobile padding adjustments ─── */
@media (max-width: 600px) {
  .status { top: 0.9rem; left: 0.9rem; gap: 4px; }
  .status .mark { width: 4px; height: 4px; }
  .corner { bottom: 0.9rem; right: 0.9rem; width: 6px; height: 6px; }
  .hairline { left: 0.9rem; }
  body { padding: 3.5rem 1.2rem; }
  body.extra-decode::after { left: 0.9rem; bottom: 0.9rem; }
}
`;

writeFileSync(join(OUT, 'common.css'), css, 'utf-8');
console.log('  ✓ common.css');

for (const page of PAGES) {
  writePage(page);
}

console.log(`\nDone. ${PAGES.length} pages generated.`);
console.log('Start with: node server.mjs');
