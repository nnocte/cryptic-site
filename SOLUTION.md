# The Observatory — Solution Key

A solveable narrative ARG built as a static puzzle-network. The player explores an abandoned observatory, follows the logs of the previous keeper (Elias), decodes an extraterrestrial signal, and makes a final choice.

## Story summary

Elias was the keeper of a remote observatory. While watching the sky, he found that the star Antares was not behaving naturally — it was responding to his observations. By tuning to the hydrogen line frequency (1420 MHz), he received an echo. After measuring an eight-second delay, the signal began sending numbers that translated to the word "hello."

The beings on the other side exist only in the act of being perceived. They offer Elias a choice: **open** the contact and let them in, or **close** it and turn away. Elias could not decide. He left the choice to the next person who found the observatory — the player.

Either branch leads to the same realization: every visitor becomes the new keeper, and the cycle begins again.

## Intended path

### Act I — Discovery

| Page | What you read | Clue | Solution |
|------|---------------|------|----------|
| `/` | Gate with a note asking for "the keeper of the light" | Name scratched into the metal | **elias** → `/elias/` |
| `/elias/` | Foyer with coat, desk, logbook | The logbook | **logbook** → `/log/` |
| `/log/` | Logbook full of crossed-out dates; only entry 12 is clean | The clean entry number | **twelve** → `/12/` |
| `/12/` | Log entry: phenomenon appears at 03:14 | The time | **03:14** → `/0314/` |
| `/0314/` | Telescope points to southern wall; chart has a circled star | The chart | **chart** → `/chart/` |
| `/chart/` | One star ringed in red; labeled by Elias | The star name | **antares** → `/antares/` |

**Optional side pages:** `/coat/`, `/desk/`, `/drawer/`, `/photo/`, `/window/`, `/clock/`. These add atmosphere and story detail but are not required.

### Act II — The Signal

| Page | What you read | Clue | Solution |
|------|---------------|------|----------|
| `/antares/` | Antares flickers responsively; the signal has a frequency | frequency | **frequency** → `/frequency/` |
| `/frequency/` | Hydrogen sings at 1420 MHz | The frequency number | **1420** → `/1420/` |
| `/1420/` | The whisper repeats; it is an echo | echo | **echo** → `/echo/` |
| `/echo/` | The echo is actually a reply; there is a delay | delay | **delay** → `/delay/` |
| `/delay/` | The delay is exactly eight seconds | The duration | **eight** → `/8/` |
| `/8/` | After eight seconds, the signal sends numbers | numbers | **numbers** → `/numbers/` |
| `/numbers/` | 8-5-12-12-15 → translate to letters | A1Z26 cipher spelling a greeting | **hello** → `/hello/` |

**Difficulty note:** `/numbers/` is the first real puzzle. The page explicitly tells the player to "translate the numbers to letters," and 8-5-12-12-15 maps to H-E-L-L-O. This introduces the idea that decoding is required.

### Act III — Contact

| Page | What you read | Clue | Solution |
|------|---------------|------|----------|
| `/hello/` | Elias asks a question; the answer takes twelve minutes | question | **question** → `/question/` |
| `/question/` | They answer: "We are what looks back." | The phrase | **looks back** → `/looks-back/` |
| `/looks-back/` | They exist in attention; they want Elias to choose | choose | **choose** → `/choose/` |

### Act IV — The Choice

| Page | What you read | Clue | Solution |
|------|---------------|------|----------|
| `/choose/` | Two buttons: open and close | Pick one | **open** → `/open/` or **close** → `/close/` |

#### OPEN branch

| Page | What happens | Next clue |
|------|--------------|-----------|
| `/open/` | Walls thin; both sides become visible | **visible** → `/visible/` |
| `/visible/` | They ask if they can stay | **stay** → `/stay/` |
| `/stay/` | Elias says yes; handwriting is no longer only his | **not mine** → `/not-mine/` |
| `/not-mine/` | Notes call him "the previous occupant" | **previous** → `/previous/` |
| `/previous/` | Ending: every visitor becomes the keeper | Terminal |

#### CLOSE branch

| Page | What happens | Next clue |
|------|--------------|-----------|
| `/close/` | Humming stops; Elias sits in the dark | **dark** → `/dark/` |
| `/dark/` | Afterimage of eyes waits for him to look again | **eyes** → `/eyes/` |
| `/eyes/` | He cannot forget; he never left the room | **room** → `/room/` |
| `/room/` | Ending: the observatory is wherever you look closely enough | Terminal |

## Puzzle types used

1. **Direct word clues** — find a name, object, or direction in the text and use it as the URL (`elias`, `logbook`, `chart`, `antares`, `frequency`, etc.).
2. **Number clues** — dates, times, and frequencies become routes (`twelve` → `/12/`, `03:14` → `/0314/`, `1420` → `/1420/`, `eight` → `/8/`).
3. **Cipher** — A1Z26 on `/numbers/` (8-5-12-12-15 = HELLO).
4. **Branching choice** — `/choose/` presents two buttons; the player picks a path.
5. **Narrative loop** — both endings reveal that the player has become the new keeper, returning the story to its beginning.

## Design rationale

- **Linear progression:** The main path is strictly linear. A player can solve it without guessing or brute-forcing URLs.
- **Fair difficulty curve:** The first several pages are trivial "find the word" puzzles so the player learns the mechanic. The cipher at `/numbers/` is the first real challenge, and it is explicitly cued.
- **No dead-end abuse:** Dead-end side pages exist, but they are optional and clearly optional within the text. The main path never punishes the player with a fake clue.
- **Story first:** Every clue is grounded in the fiction. Numbers are telescope readings and frequencies; words are objects Elias left behind; the final choice is the emotional core of the story.
- **Visual restraint:** Near-black background, single text color, system monospace, generous whitespace. Links are barely styled to keep the focus on reading.

## Total pages

35 pages: 17 main-path pages, 2 terminal endings, 9 optional side pages, and 7 branch-transition pages.

## How to run

```bash
cd /home/nocte/arg/cryptic-site
node generate.mjs
node server.mjs
# open http://localhost:4000/
```
