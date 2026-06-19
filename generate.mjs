// generate.mjs — Builds the refactored ARG: "The Observatory"
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'public');

// ─── Design Tokens ────────────────────────────────────────────────
// Near-black background, single warm-gray text color, system monospace.
// Links are almost invisible until hovered/focused.
const TOKENS = {
  bg: '#0e0d0c',
  text: '#c8c3bc',
  textDim: '#6b6763',
  link: '#c8c3bc',
  linkHover: '#e8e4df',
  selection: '#3a3632',
  font: `ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'Consolas', 'Courier New', monospace`,
  fz: '16px',
  lh: '1.85',
  maxW: '33em',
};

// ─── Word → URL mapping ───────────────────────────────────────────
// Every **word** in page text is looked up here and turned into a link.
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
// route: directory name(s) for this page.
// lines: 1–3 short sentences. Wrap a clue word in **word** to make it a link.
const PAGES = [
  // ── Act I: Discovery ─────────────────────────────────────────────
  {
    route: '/',
    lines: [
      'The observatory gate is rusted shut.',
      "A note is taped to it: 'Name the keeper of the light. The door knows the answer.'",
      'Below, someone has scratched a name into the metal: **elias**.',
    ],
  },
  {
    route: 'elias',
    lines: [
      'Inside, the air is cold.',
      'A **coat** hangs by the door. A **desk** sits against the wall.',
      'On it, a **logbook** is open to page twelve.',
    ],
  },
  {
    route: 'coat',
    lines: [
      "Elias's coat is still damp.",
      'It smells like rain and metal.',
      'In the pocket, a receipt from a town that is not on any map.',
    ],
  },
  {
    route: 'desk',
    lines: [
      'The **drawer** is locked.',
      'On top: a pen, a half-empty notebook, and a **photograph** turned face-down.',
    ],
  },
  {
    route: 'drawer',
    lines: [
      'You force the drawer.',
      'Inside: a single key, unlabeled.',
      'You try it on every door. It fits none of them.',
    ],
  },
  {
    route: 'photo',
    lines: [
      'You turn the photograph over.',
      'Two people stand in front of the observatory.',
      'One is Elias. The other has no face — just static, or a developing error.',
    ],
  },
  {
    route: 'log',
    lines: [
      'The logbook is full of crossed-out dates.',
      'Only one entry is clean: number **twelve**, dated December 12.',
    ],
  },
  {
    route: '12',
    lines: [
      'December 12. Clear skies.',
      'It appeared again at **03:14**. Same position.',
      'I am certain now that it sees me when I look at it.',
    ],
  },
  {
    route: 'clock',
    lines: [
      'The wall clock stopped at 03:14.',
      'The second hand trembles but does not move forward.',
    ],
  },
  {
    route: '0314',
    lines: [
      'At 03:14 the equipment hums.',
      'The telescope turns on its own toward the southern wall.',
      'The **chart** there has one star circled.',
    ],
  },
  {
    route: 'window',
    lines: [
      'Outside, the hills roll away under a sky too bright for the hour.',
      'A second moon would explain the shadows.',
      'There is not one.',
    ],
  },
  // ── Act II: The Signal ───────────────────────────────────────────
  {
    route: 'chart',
    lines: [
      'The chart is crowded with constellations.',
      'One star is ringed in red.',
      'Below it, in Elias\'s hand: **antares**.',
    ],
  },
  {
    route: 'roof',
    lines: [
      'The telescope is open to the sky.',
      'It is warm, as if it has been tracking something for hours.',
      'No one has touched it in days.',
    ],
  },
  {
    route: 'antares',
    lines: [
      'Antares flickers wrong.',
      'Not variable — responsive.',
      'The signal has a **frequency**.',
    ],
  },
  {
    route: 'frequency',
    lines: [
      'The dial runs from 1000 to 2000.',
      'Hydrogen sings at **1420**.',
      'I marked it so I would not forget.',
    ],
  },
  {
    route: '1420',
    lines: [
      '1420 megahertz. The universe\'s whisper.',
      'But this whisper repeats. It waits for me to stop before it starts again.',
      'It is an **echo**.',
    ],
  },
  {
    route: 'echo',
    lines: [
      'I send a tone. It comes back.',
      'Not a reflection — a reply.',
      'There is a **delay** between my voice and its answer.',
    ],
  },
  {
    route: 'delay',
    lines: [
      'I timed it.',
      'The delay is exactly **eight** seconds.',
      'Someone is counting with me.',
    ],
  },
  {
    route: '8',
    lines: [
      'After eight seconds, the signal changes.',
      'It no longer copies me.',
      'It sends **numbers**.',
    ],
  },
  {
    route: 'numbers',
    lines: [
      'The first message: 8-5-12-12-15.',
      'Translate the numbers to letters.',
      'The word is **hello**.',
    ],
  },
  // ── Act III: Contact ─────────────────────────────────────────────
  {
    route: 'hello',
    lines: [
      'I said hello back.',
      'The static shifted.',
      'I asked my **question**. The answer took twelve minutes.',
    ],
  },
  {
    route: 'question',
    lines: [
      "I wrote: 'Who are you?'",
      "They did not give a name.",
      "They said: 'We are what **looks back**.'",
    ],
  },
  {
    route: 'looks-back',
    lines: [
      'They exist in the act of being seen.',
      'They do not have bodies, only attention.',
      'They want me to **choose**.',
    ],
  },
  {
    route: 'kitchen',
    lines: [
      'A cup of tea sits on the table.',
      'It is still warm.',
      'You did not make it.',
    ],
  },
  {
    route: 'bedroom',
    lines: [
      'The bed is made.',
      'On the pillow, a single hair that is not yours and not Elias\'s.',
      'It glows faintly in the dark.',
    ],
  },
  // ── Act IV: The Choice ───────────────────────────────────────────
  {
    route: 'choose',
    lines: [
      'Two buttons under cracked glass.',
      'One marked **open**. One marked **close**.',
      'Elias wrote below: "I could not decide. I left it for whoever came next."',
    ],
  },
  // ── Branch: OPEN ─────────────────────────────────────────────────
  {
    route: 'open',
    lines: [
      'I pressed open.',
      'The walls became thin. I saw through them. They saw through me.',
      'We became **visible** to each other.',
    ],
  },
  {
    route: 'visible',
    lines: [
      'They are not hostile.',
      'They are curious.',
      'They want to know what it is like to be one person, one ending. They asked if they could **stay**.',
    ],
  },
  {
    route: 'stay',
    lines: [
      'I said yes.',
      'Now I am not alone in my own head.',
      'Sometimes I write things and do not remember writing them. Sometimes the handwriting is **not mine**.',
    ],
  },
  {
    route: 'not-mine',
    lines: [
      'I found a second set of notes.',
      'They describe the observatory from above.',
      'They call me "the **previous** occupant." I do not remember moving out.',
    ],
  },
  {
    route: 'previous',
    lines: [
      'Every visitor becomes the keeper.',
      'Every keeper leaves notes for the next.',
      'You named me. Now you are where I was. The light is still on. Scratch your name into the gate.',
    ],
  },
  // ── Branch: CLOSE ────────────────────────────────────────────────
  {
    route: 'close',
    lines: [
      'I pressed close.',
      'The humming stopped. The lights went out.',
      'I sat in the **dark** for a long time, telling myself I had done the right thing.',
    ],
  },
  {
    route: 'dark',
    lines: [
      'In the dark, I could still see the afterimage.',
      'A shape burned into the inside of my eyelids.',
      'It was waiting for me to open my **eyes** again.',
    ],
  },
  {
    route: 'eyes',
    lines: [
      'I cannot forget the eyes.',
      'I see them when I wake. I see them when I sleep.',
      'I left the observatory, but I never left the **room**.',
    ],
  },
  {
    route: 'room',
    lines: [
      'There is no outside.',
      'The observatory is wherever you look closely enough.',
      'I came back. The light was still on. Someone had scratched a new name into the gate.',
    ],
  },
];

// ─── HTML Template ────────────────────────────────────────────────
function pageHTML(bodyHTML) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>—</title>
<link rel="stylesheet" href="/common.css">
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

// ─── Render a page's content ──────────────────────────────────────
function renderContent(page) {
  let html = '<div class="p">\n  <div class="c">\n';
  for (const line of page.lines) {
    html += `    <p>${renderLine(line)}</p>\n`;
  }
  html += '  </div>\n</div>\n';
  return html;
}

// ─── Parse inline links from **word** syntax ───────────────────────
function renderLine(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, (match, word) => {
    const url = wordToURL(word);
    if (url) {
      return `<a href="${url}">${word}</a>`;
    }
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
  const html = pageHTML(body);
  writeFileSync(htmlFile, html, 'utf-8');
  console.log(`  ✓ /${page.route}/`);
}

// ─── Entry point ──────────────────────────────────────────────────
console.log('Building "The Observatory"...\n');

// Clean previous build so removed/renamed pages never linger
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Write shared CSS
const css = `/* ─── The Observatory ─── */

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
  margin-bottom: 1.6em;
}

.c p:last-child {
  margin-bottom: 0;
}

/* Barely-there links */
a {
  color: ${TOKENS.link};
  text-decoration: none;
  border-bottom: 1px dotted rgba(200, 195, 188, 0.22);
}

a:hover, a:focus-visible {
  color: ${TOKENS.linkHover};
  border-bottom-color: rgba(232, 228, 223, 0.65);
  outline: none;
}

a:focus-visible {
  outline: 1px dotted ${TOKENS.textDim};
  outline-offset: 3px;
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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0s !important; }
}
`;

writeFileSync(join(OUT, 'common.css'), css, 'utf-8');
console.log('  ✓ common.css');

// Generate all pages
for (const page of PAGES) {
  writePage(page);
}

console.log(`\nDone. ${PAGES.length} pages generated.`);
console.log('Start with: node server.mjs');
