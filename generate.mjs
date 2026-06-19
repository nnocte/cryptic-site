// generate.mjs — Builds all pages for the cryptic puzzle-network site
import { mkdirSync, writeFileSync, cpSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'public');
const CSS_PATH = join(OUT, 'common.css');

// ─── Design Tokens ────────────────────────────────────────────────
// Background: near-black. Not #000 — slightly off, like an old screen.
// Text: dim warm gray. Not pure white — it should feel like reading in
//       a room where the lights are mostly off.
// Font: monospace. System-level. A found document, not a composed one.
// Links: barely distinguishable — same color, underline on hover only.
const TOKENS = {
  bg: '#0e0d0c',
  text: '#b5b0ab',
  textDim: '#6b6763',
  link: '#b5b0ab',
  linkHover: '#d4cfc8',
  selection: '#3a3632',
  font: `ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'Consolas', 'Courier New', monospace`,
  fz: '13px',
  lh: '1.9',
  maxW: '32em',
  pageTitle: '—',
};

// ─── Page Data ────────────────────────────────────────────────────
// Each page: { route, lines: string[] }
// Lines are rendered as paragraphs. Words wrapped in `**...**` become
// <a href='...'> links. Use exact URL path (e.g. `/one/`).
//
// Dead-end pages (no ** clues): threshold, five, still, return/return/return,
//   seven, eight, between/and/between, fork/left/path, dead/end,
//   dead/end/further, unfinished, loop, wait, omit.
// Time-dependent page: wait (uses hour-based JS).

const PAGES = [
  // ── Entry ───────────────────────────────────────────────────────
  {
    route: '/',
    lines: [
      'Some doors only open when you stop knocking.',
      'The first **one** appeared after I gave up counting.',
    ],
  },
  // ── Narrative chain (1→2→3→door) ────────────────────────────────
  {
    route: 'one',
    lines: [
      "You've already taken steps you don't remember taking.",
      'The **second** is indistinguishable from the first.',
    ],
  },
  {
    route: 'second',
    lines: [
      'Between two points, a line. Between two people, a gap.',
      'The **third** was never the point.',
    ],
  },
  {
    route: 'third',
    lines: [
      'Three is the smallest crowd.',
      'Stop keeping count and the **door** appears.',
    ],
  },
  // ── Source branch ───────────────────────────────────────────────
  {
    route: 'source/door',
    lines: [
      'A door is also a wall.',
      'It depends on whether you try to open it or walk through it.',
      'The **threshold** is the part everyone forgets.',
    ],
  },
  {
    route: 'threshold',
    lines: [
      'A threshold is just a line drawn and agreed upon.',
      'You knew before you arrived.',
    ],
    // dead end
  },
  // ── Cycle branch (four→0→one) ──────────────────────────────────
  {
    route: 'four',
    lines: [
      'Four has no **beginning** you can see.',
      'It was always already in progress.',
    ],
  },
  {
    route: '0',
    lines: [
      'Before the first step is the zeroth step.',
      'You forgot it the moment you took it.',
      'Return to the **first** and see if it reads differently now.',
    ],
  },
  // ── Shape branch ────────────────────────────────────────────────
  {
    route: 'five',
    lines: [
      'Five is the shape of a hand not reaching.',
      'The next is easier to miss.',
    ],
    // dead end (the next would be six — but there is no /six)
  },
  {
    route: 'still',
    lines: [
      'Stillness is not silence.',
      'The difference is what you hear when you stop listening for it.',
    ],
    // dead end
  },
  // ── Echo chain ──────────────────────────────────────────────────
  {
    route: 'echo',
    lines: [
      "Echoes arrive after the sound, which means you are always listening to the **past**.",
    ],
  },
  {
    route: 'return/return/return',
    lines: [
      'Looping is not the same as finding.',
      'A circle has no destination.',
    ],
    // dead end
  },
  // ── Number pages ────────────────────────────────────────────────
  {
    route: 'seven',
    lines: [
      'Seven remains unsaid. You know it anyway.',
      'The numbers that matter are the ones not written.',
    ],
    // dead end (interpretive puzzle: which numbers are missing from
    // the page sequence? 11 is one of them.)
  },
  {
    route: 'eight',
    lines: [
      "Eight is how many times you've checked for a pattern.",
      "It's still not here.",
    ],
    // dead end
  },
  {
    route: '11',
    lines: [
      'Eleven comes after ten, which is why it is always late.',
      'Some **arrivals** have no reason.',
    ],
  },
  {
    route: '42',
    lines: [
      'The answer was never the question.',
      "You've been asking the **wrong** ones.",
    ],
  },
  // ── Perception branch ───────────────────────────────────────────
  {
    route: 'lens',
    lines: [
      'How you read changes what is here.',
      'Try reading **between** the lines.',
    ],
  },
  {
    route: 'between/and/between',
    lines: [
      'Between and between is still between.',
      'You are always in the middle of something.',
    ],
    // dead end
  },
  // ── Connections ─────────────────────────────────────────────────
  {
    route: '13',
    lines: [
      'Thirteen is unlucky only for those who count.',
      'The rest just **walk through** it.',
    ],
  },
  {
    route: 'source',
    lines: [
      'This is where the signal was before it arrived.',
      'The message changed in **transit**.',
    ],
  },
  {
    route: 'source/file/034',
    lines: [
      "Correction 034: replace 'you' with 'we' across all files.",
      'This is the **only** file where the change was not applied.',
    ],
  },
  // ── Mirror / recursion ──────────────────────────────────────────
  {
    route: 'mirror',
    lines: [
      "If this text is reversed, you're reading correctly.",
      'The **other** side is closer than it appears.',
    ],
  },
  {
    route: '9/9/9/9/9',
    lines: [
      'Nine repeated is still nine.',
      "A number doesn't change just because you **say** it again.",
    ],
  },
  {
    route: 'fragment',
    lines: [
      'The whole was never assembled.',
      'You arrived in the middle of something that has no **beginning**.',
    ],
  },
  {
    route: 'edge',
    lines: [
      'The edge is where the page ends, not where you stop.',
      'Beyond it is more of the same, but it **looks** different.',
    ],
  },
  // ── Fork ────────────────────────────────────────────────────────
  {
    route: 'fork/left/path',
    lines: [
      "Left is a direction that depends on where you're facing.",
      'You chose without knowing your orientation.',
    ],
    // dead end
  },
  {
    route: 'fork/right/path',
    lines: [
      "Right is a direction that depends on where you're facing.",
      'You chose without knowing the consequence.',
      'There is only **stillness** after the choice.',
    ],
  },
  // ── Dead ends ───────────────────────────────────────────────────
  {
    route: 'dead/end',
    lines: [
      "This is where the road runs out.",
      "The map says 'here be dragons' but the dragons left.",
    ],
    // dead end
  },
  {
    route: 'dead/end/further',
    lines: [
      "Further isn't always forward.",
      "Sometimes it's just more of the same.",
    ],
    // dead end
  },
  // ── Inward ──────────────────────────────────────────────────────
  {
    route: 'inward/inward/inward',
    lines: [
      "Going inward enough times, you stop recognizing the walls.",
      "Everything looks like the **inside** of something else.",
    ],
  },
  // ── Trace ───────────────────────────────────────────────────────
  {
    route: 'trace',
    lines: [
      "A trace is not a path.",
      "It's what remains after something **passed through**.",
    ],
  },
  // ── Fragment / unfinished ───────────────────────────────────────
  {
    route: 'unfinished',
    lines: [
      "This page ends mid-sentence, and that's the only way it could",
    ],
    // dead end (intentionally incomplete — no period even)
  },
  // ── Silent (hidden clue) ────────────────────────────────────────
  {
    route: 'silent',
    lines: [],   // content is a hidden span in the template
    hidden: '<span class="h">Nothing is **still** here.</span>',
  },
  // ── Time-dependent page ─────────────────────────────────────────
  {
    route: 'wait',
    timeDependent: true,
    before: [
      "It's not time yet.",
      'Some things open only when the light is right.',
    ],
    after: [
      'The window was brief.',
      'You caught it or you did not.',
    ],
    // dead end either way — the "puzzle" is the changing content itself
  },
  // ── Final dead end ──────────────────────────────────────────────
  {
    route: 'loop',
    lines: [
      "Coming back doesn't mean starting over.",
      "You're different this time.",
      'The door is the same — you are not.',
    ],
    // dead end (deliberate mirror of the entry page)
  },
  // ── URL-structure clue page ─────────────────────────────────────
  {
    route: 'omit',
    lines: [
      "What's left out says more than what remains.",
      'Look at what is **between** the pages.',
    ],
  },
];

// ── HTML Template ─────────────────────────────────────────────────
function pageHTML(title, bodyHTML, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${TOKENS.pageTitle}</title>
<link rel="stylesheet" href="/common.css">
${extraHead}
<style>
::selection { background: ${TOKENS.selection}; color: ${TOKENS.text}; }
::-moz-selection { background: ${TOKENS.selection}; color: ${TOKENS.text}; }
</style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
}

// ── Render a page's content ───────────────────────────────────────
function renderContent(page) {
  let html = '<div class="p">\n';

  if (page.timeDependent) {
    // Time-dependent rendering via JS
    html += '  <div id="before" class="c">\n';
    for (const line of page.before) {
      html += `    <p>${renderLine(line)}</p>\n`;
    }
    html += '  </div>\n';
    html += '  <div id="after" class="c" style="display:none">\n';
    for (const line of page.after) {
      html += `    <p>${renderLine(line)}</p>\n`;
    }
    html += '  </div>\n';
    html += `  <script>
(function(){
  var h = new Date().getHours();
  var unlock = 18; // 6pm
  if (h >= unlock) {
    document.getElementById('before').style.display = 'none';
    document.getElementById('after').style.display = '';
  }
})();
</script>\n`;
  } else {
    html += '  <div class="c">\n';
    for (const line of page.lines) {
      html += `    <p>${renderLine(line)}</p>\n`;
    }
    if (page.hidden) {
      html += `    ${renderLine(page.hidden)}\n`;
    }
    html += '  </div>\n';
  }

  html += '</div>\n';

  // Browser console whisper (tiny text for /silent - the hidden link works
  // differently since the word itself is barely visible)
  if (page.route === 'silent') {
    html += `<div style="position:fixed;bottom:8px;right:12px;font-size:9px;color:#2a2825;letter-spacing:0.5px;">⌨</div>\n`;
  }

  return html;
}

// ── Parse inline links from **word** syntax ───────────────────────
function renderLine(text) {
  // Match **word** patterns where word is a href destination
  return text.replace(/\*\*([^*]+)\*\*/g, (match, word) => {
    // Determine the URL from a lookup
    const url = wordToURL(word);
    if (url) {
      return `<a href="${url}">${word}</a>`;
    }
    // Fallback: if we can't resolve, just return the word
    return word;
  });
}

// ── Word → URL mapping ────────────────────────────────────────────
// Each key is the **word** as it appears in page text.
// Values are the target routes (without trailing slash for directory).
const WORD_MAP = {
  'one':          '/one/',
  'second':       '/second/',
  'third':        '/third/',
  'door':         '/source/door/',
  'threshold':    '/threshold/',
  'beginning':    '/four/',
  'first':        '/one/',
  'past':         '/return/return/return/',
  'arrivals':     '/42/',
  'wrong':        '/lens/',
  'between':      '/between/and/between/',
  'walk through': '/source/door/',
  'transit':      '/source/file/034/',
  'only':         '/one/',
  'other':        '/9/9/9/9/9/',
  'say':          '/echo/',
  'looks':        '/lens/',
  'stillness':    '/still/',
  'inside':       '/threshold/',
  'passed through': '/source/door/',
  'still':        '/still/',
};

function wordToURL(word) {
  if (WORD_MAP[word]) return WORD_MAP[word];
  // Fallback: try lowercased, trimmed
  const w = word.toLowerCase().trim();
  if (WORD_MAP[w]) return WORD_MAP[w];
  return null;
}

// ── Write a page ──────────────────────────────────────────────────
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
  const html = pageHTML(TOKENS.pageTitle, body);
  writeFileSync(htmlFile, html, 'utf-8');
  console.log(`  ✓ /${page.route}/`);
}

// ── Entry point ───────────────────────────────────────────────────
console.log('Building cryptic puzzle-network site...\n');

mkdirSync(OUT, { recursive: true });

// Write shared CSS
const css = `/* ─── cryptic puzzle‑network: design tokens ─── */

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
}

.p {
  width: 100%;
  max-width: ${TOKENS.maxW};
}

.c p {
  margin-bottom: 1.5em;
}

.c p:last-child {
  margin-bottom: 0;
}

/* Barely-there links */
a {
  color: ${TOKENS.link};
  text-decoration: none;
}

a:hover, a:focus-visible {
  color: ${TOKENS.linkHover};
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

a:focus-visible {
  outline: 1px dotted ${TOKENS.textDim};
  outline-offset: 3px;
}

/* Hidden text (used on /silent/) */
.h {
  display: block;
  font-size: 6px;
  line-height: 1;
  opacity: 0.2;
  margin-top: 40vh;
  text-align: center;
}

/* Selection */
::selection {
  background: ${TOKENS.selection} !important;
  color: ${TOKENS.text} !important;
}

::-moz-selection {
  background: ${TOKENS.selection} !important;
  color: ${TOKENS.text} !important;
}

/* Reduced motion: respect user preference */
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0s !important; }
}
`;

writeFileSync(CSS_PATH, css, 'utf-8');
console.log('  ✓ common.css');

// Generate all pages
for (const page of PAGES) {
  writePage(page);
}

console.log(`\nDone. ${PAGES.length} pages generated.`);
console.log('Start with: node server.mjs\n');
