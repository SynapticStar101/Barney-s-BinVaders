# Barney's BinVaders — Vibe Coding Devlog
### A learning resource for non-developers building browser games with AI

---

## What This Document Is

This is the complete behind-the-scenes record of building **Barney's BinVaders** — a Space Invaders tribute with the Barney's Bins rubbish aesthetic. Every prompt the creator wrote, every decision made, and every bug fixed is recorded here in plain English.

If you want to build browser games with AI and you've never written code before, this is for you.

---

## Entry 1 — The Initial Brief

**What the user asked:**

> *"Looking at the different retro game repos we have created. I now want to recreate the classic Space Invaders game but keep the Barneys bins aesthetic and fun feel. The invaders are different types of rubbish, toxic metal barrels with skull and crossbones, piles of rubbish, rats, overflowing wheelie bins. There will be 10 levels. Barney's wagon will shoot missiles to defeat the advancing side scrolling lines of invaders that start from the top of the screen and slowly advance down. Catch music should play at the start of each new level and a level announcement should sound with a physical graphical interface. You have 3 lives. Occasionally the pink rat space ship will appear moving across the top of the screen which you can shoot for 700 bonus points. Each level the aliens increase in the speed they move down the screen. Whilst building this game capture all prompts I write and all items that are changed with each progressive improvement or bug fix as an easy to read learning tool for future vibe programmers to learn from."*

**Then:**

> *"Please go ahead make sure the invaders also fire on Barney and that Barney has some barriers to hide under that also degrade as the invaders shoot down if they hit them."*

---

## What Was Built in the First Session

### The Complete Game Architecture

Everything in a single HTML file — the same approach proven in Barney's Bins and BinDaRoids. Here's what that single file contains:

| Component | Technique | Why |
|-----------|-----------|-----|
| Graphics | Canvas API — drawn in code | No image files to host or load |
| Audio | Web Audio API — synthesised in code | No audio files, zero loading time |
| Game logic | Vanilla JavaScript | No frameworks, no dependencies |
| Hosting | Any static web host (GitHub Pages) | Free, instant, one link to share |

---

## Key Technical Decisions

### 1. The Grid System

Space Invaders' defining mechanic: all invaders move together as one unit. When the group hits a wall, the entire grid reverses direction and drops down.

**How it works in code:**
- Two variables track the grid's offset: `gx` (horizontal drift) and `gy` (vertical drift)
- Every invader's position is calculated as: `base_x + gx + (column × spacing)`
- On each "step", `gx` changes by a fixed amount in the current direction
- If any live invader goes out of bounds after the step, the direction reverses and `gy` increases by the drop amount

**Why this matters:**
It means you never have to update 55 individual invader positions. You update two numbers and all 55 positions update automatically. Elegant, and very fast.

### 2. Speed That Increases Automatically

The step interval (frames between each grid movement) is calculated fresh every time an invader dies:

```
step_interval = base_interval × (alive_invaders / total_invaders)
```

At level 1 with all 55 invaders alive: step interval ≈ 55 frames (slow)
At level 1 with 5 invaders left: step interval ≈ 5 frames (very fast)
At level 10 with all alive: step interval ≈ 8 frames (already fast)

This means the game automatically gets more intense as you clear invaders — without any extra code.

### 3. Five Invader Types — All Drawn in Code

| Row | Type | Points | Visual |
|-----|------|--------|--------|
| 0 (top) | Rat | 50 pts | Pink body, red eyes, animated tail |
| 1 | Rubbish Pile | 40 pts | Mound of junk, tin can, animated debris |
| 2 | Black Bag | 30 pts | Tied bin bag with animated legs |
| 3 | Overflowing Wheelie Bin | 20 pts | Green bin, animated lid, overflowing rubbish |
| 4 (bottom) | Toxic Barrel | 10 pts | Brown barrel, skull & crossbones, toxic drip |

Top rows are worth more (harder to shoot — you have to clear the bottom first). This follows classic Space Invaders scoring logic.

Each invader has two animation frames that alternate on every grid step — the same technique as the original 1978 arcade game.

### 4. Degrading Barriers

Four green bunkers sit between Barney's wagon and the invaders. Each bunker is a pixel grid (11 wide × 8 tall = 88 pixels total), shaped like a classic arch:

```
  ■■■■■■■■■
 ■■■■■■■■■■■
 ■■■■■■■■■■■
 ■■■■■■■■■■■
 ■■         ■■
 ■■         ■■
```

**When a missile hits the barrier:**
- The pixel that was hit is destroyed
- Adjacent pixels have a random chance (35–55%) of also being destroyed
- This creates natural-looking crater damage

Both player missiles AND invader missiles damage the barriers. Eventually they erode completely and leave Barney exposed.

### 5. Invaders Fire Back

The invaders fire down at Barney. The firing system:
- Only the **bottom-most alive invader in each column** can fire (hidden invaders can't shoot through their friends — same as the original)
- A random column's bottom invader is selected each fire interval
- The fire interval shortens each level: from ~78 frames at level 1 to ~16 frames at level 10
- Maximum active invader missiles increases with level (prevents overwhelming at level 1)
- Two missile shapes: straight and zigzag (for visual variety)

### 6. The Pink Rat UFO

The mystery bonus ship from Space Invaders, reimagined as a pink flying saucer with a rat inside:
- Appears at random intervals (every 12–25 seconds roughly)
- Moves left-to-right OR right-to-left randomly
- Worth exactly 700 points if destroyed
- Plays a pulsing hum sound while on screen
- Explodes spectacularly with sound and particle effects

### 7. Audio — Everything Synthesised

No audio files exist in this game. Every sound is generated mathematically using the Web Audio API:

| Sound | Technique |
|-------|-----------|
| Player shoot | Two square wave tones, descending |
| Invader shoot | Sawtooth waves, low frequency |
| Explosion (small) | White noise burst + low sine tone |
| Explosion (large) | Longer noise + lower tone |
| UFO hum | Two sine waves with slight detuning |
| March beat | Square wave cycling through 4 pitches |
| Level fanfare | 8-note ascending melody (square wave) |
| Life lost | Three descending tones + noise |
| Game over | 5-note descending sawtooth melody |
| Victory | Ascending major scale + final chord |

**Why square waves?** They sound inherently retro — classic 8-bit computer audio was all square waves because that's what early sound chips could generate.

### 8. The Level Announcement Screen

When each new level begins:
1. The fanfare plays immediately
2. A semi-transparent overlay slides over the game scene
3. The level number is shown in large gold text
4. A themed subtitle appears (e.g. "THE BINS ARE COMING!", "RAT INVASION!", "THE FINAL FILTH!")
5. A pulsing "GET READY!" message counts down
6. After ~3 seconds, the overlay fades and play begins

This gives the player time to prepare and creates excitement before each wave.

### 9. Three Lives with Visual Indicator

Three mini bin wagons are displayed in the bottom bar as life indicators — the same style as the classic Space Invaders, which showed mini ships. Losing a life:
1. Triggers a dramatic explosion effect on the player
2. All missiles are cleared
3. The player flashes (visible/invisible alternating) for ~2 seconds
4. The player respawns at the centre

### 10. 10 Levels of Escalating Difficulty

Each level increases difficulty through:
- Faster base step interval
- Shorter invader fire interval
- More invader missiles allowed on screen simultaneously

By level 10, the invaders are significantly faster than level 1, and missiles are raining down frequently.

---

## The Single-File Architecture — Why It Works

```
index.html
├── <style>     CSS for layout, canvas scaling, mobile buttons, scanlines overlay
├── <canvas>    The game renders here — 800×640 logical pixels
├── Mobile buttons  Three touch buttons: LEFT | FIRE | RIGHT
└── <script>    Everything else:
    ├── Canvas setup & scaling
    ├── Game constants (grid size, speeds, etc.)
    ├── Audio engine (tone + noise generators)
    ├── Drawing functions (invaders, player, UFO, barriers, UI, screens)
    ├── Game state variables
    ├── Update functions (player, missiles, invaders, UFO, particles)
    ├── Collision detection
    └── Main game loop (runs 60 times per second)
```

Everything in one file means:
- One file to deploy
- No build process
- No dependencies
- Works on any device with a browser
- Share with a single link

---

## How the Game Loop Works

The game runs in a loop that executes approximately 60 times per second. Each iteration:

1. **Clear the canvas** (wipe the previous frame)
2. **Check game state** (menu / announce / playing / dead / game over / victory)
3. **Update** (move everything, check collisions, handle input)
4. **Draw** (render the current frame)
5. **Wait** for the next animation frame

This is the "flipbook" model — like animation cels, you draw a complete still image 60 times per second and the human eye sees smooth motion.

---

## Collision Detection

Every collision check is a rectangle overlap test:

```
Two rectangles overlap if:
  left_A < right_B  AND  right_A > left_B
  AND
  top_A < bottom_B  AND  bottom_A > top_B
```

This is used for:
- Player missile vs invader hitbox
- Player missile vs UFO
- Player missile vs barrier pixels
- Invader missile vs player
- Invader missile vs barrier pixels

Hitboxes are slightly smaller than the visible sprite — this is deliberate and makes the game feel fair. Missing something that visually seems like a hit is frustrating; the game feels better when hitboxes are forgiving.

---

## Mobile Support

The game works on phones and tablets through:

1. **Canvas scaling** — The logical canvas is 800×640 pixels. CSS scales it to fit the screen while maintaining aspect ratio. Touch `image-rendering: pixelated` keeps crisp pixels at any scale.

2. **Mobile buttons** — Three buttons below the canvas (LEFT, FIRE, RIGHT). They use `touchstart` and `touchend` events rather than `click`, so they respond instantly without the 300ms tap delay.

3. **No scroll, no zoom** — `user-scalable=no` and `touch-action: none` prevent the browser from intercepting touch inputs.

---

## Things That Were Got Right From The Start

- **Single-file approach** — proven in previous games, no reason to change it
- **Canvas coordinate system** — logical 800×640 scaled via CSS, not recalculated in code
- **Web Audio synthesis** — all sounds ready instantly, no loading, no CORS issues
- **Grid-based invader movement** — two numbers control 55 sprites
- **Pixel art aesthetic** — code-drawn graphics, no image files needed

---

---

## Entry 2 — Two Bugs That Caused a Completely Black Screen

**What the user saw:**

> *"I opened the index file and it is showing just a black screen with a yellow border, there is no game there and I cannot click on anything."*

This is one of the most alarming things that can happen — the canvas border is there (CSS rendered fine) but the canvas itself is black and nothing is interactive. The cause is always the same: the JavaScript script failed to parse before it even started running.

**Bug 1 — The Unicode Minus Sign**

When the AI wrote the code for the UFO lights array, it used a typographic minus sign (−) instead of a regular hyphen-minus (-). These look identical on screen but are completely different characters. Unicode character U+2212 (−) is not a valid JavaScript operator. The parser hit it, couldn't make sense of it, and stopped — refusing to execute any of the script at all.

```javascript
// What was written (broken — uses Unicode minus U+2212):
const lights = [[-−22, 7, ...]];   // ← this character is not a minus sign

// What it should be (standard hyphen-minus U+002D):
const lights = [[-22, 7, ...]];
```

**Why the whole screen goes black:** JavaScript is parsed all at once before any of it runs. One character that can't be understood means zero code runs — including the code that draws the menu screen.

**Bug 2 — A Duplicate Property Overwriting Itself**

Invader objects were being created with two properties both called `col`:

```javascript
{ row: r, col: c, type, pts, col: INV_DEFS[r].col }
//                          ^^^                ^^^
//     column index (number)      colour string (e.g. '#dd9090')
```

JavaScript doesn't error on duplicate keys — it silently keeps the last one. So every invader's `col` became a colour string like `'#dd9090'` instead of a column number. When the code tried to calculate the invader's x position using `inv.col * INV_CW`, it computed `'#dd9090' * 62` which equals `NaN`. All 55 invaders were positioned at NaN — effectively invisible, placed somewhere off-screen that doesn't exist.

**The fix:** Rename the colour property to `color` throughout — in the definitions array, in the invader objects, and in all drawing code that references it. Two properties, two different names, no collision.

**The lesson:**

When the entire game goes black and nothing is clickable, the JavaScript never ran. Open the browser's developer console (F12 → Console tab) and look for a red error message. It will tell you exactly which line the parser choked on. Fix that line and the whole game comes back to life.

---

## Entry 3 — The Life Loss Bug Chain

**What the user saw:**

> *"When Barney gets hit and loses a life, the Level 1 indicator comes up and it looks like the level resets and the life is not decreased by 1. Check the coding loop and fix."*

What looked like one bug turned out to be five separate problems interacting with each other. Each one individually caused strange behaviour. Together, they produced the confusing result the user described.

### Bug 1 — `continue` Instead of `return` in the Missile Loop

The invader missile update function loops through every active missile. When a missile hits Barney, it:
1. Removes that missile from the list
2. Calls `loseLife()`
3. ... and then the loop tried to continue to the next item

But `loseLife()` clears the entire missile list as part of the life-lost reset. The loop was now iterating over an empty (or shifted) array with its old index — accessing `undefined`. This could silently corrupt game state before anyone noticed.

**Fix:** Change `continue` to `return` after calling `loseLife()`. Exit the function completely — there's no point processing more missiles when the player just died and the list has been wiped.

### Bug 2 — `loseLife()` Had No Guard

The `loseLife()` function could be called while the game was already in the "dead" state (player already dying). This meant a second missile hitting in the same frame could trigger a second life loss — or worse, trigger "game over" when the player still had lives remaining.

**Fix:** Add a guard at the top of `loseLife()`:

```javascript
function loseLife() {
  if (gs === 'dead' || gs === 'gameover' || gs === 'victory') return;
  // ... rest of function
}
```

If we're already handling a death, ignore any further calls.

### Bug 3 — `nextLevel()` Could Fire During Death

When all invaders are cleared, a `setTimeout(nextLevel, 900)` is queued. If the player died in those 900 milliseconds, `nextLevel()` would fire anyway — during the death animation. This triggered the Level Announcement screen mid-death, which looked like the level was resetting.

**Fix:** Add a guard at the top of `nextLevel()`:

```javascript
function nextLevel() {
  if (gs !== 'playing' && gs !== 'dead') return;
  // ... rest of function
}
```

Only proceed if the game is in a valid state for a new level to start.

### Bug 4 — No Input Cooldown After Game Over

When the last life was lost, the game state changed to `gameover`. But if the player was holding the fire/space key at the moment of death, that same keypress immediately triggered `startGame()` — restarting the game before the game over screen had even finished appearing.

**Fix:** Set an input cooldown counter when entering game over state:

```javascript
inputCD = 90;  // ignore input for 90 frames (~1.5 seconds)
```

Check this counter before processing any keyboard input. It counts down each frame and input is only accepted once it reaches zero.

### Bug 5 — Auto-Fire on Respawn

After dying and respawning, if the player had been holding space, the `spacePrev` variable (which tracks whether space was already held on the previous frame, to prevent auto-fire) had not been updated during the death sequence. So the game thought space had just been pressed — and fired immediately on respawn.

**Fix:** When transitioning from dead state back to playing, set:

```javascript
spacePrev = true;
```

This tells the edge-detection logic "space was already held" — so it won't fire until the player releases and presses again intentionally.

### What Edge Detection Is

The game uses edge detection to prevent the player from holding space and getting a continuous stream of bullets. The code tracks whether space was pressed on the *previous* frame (`spacePrev`). A shot only fires when space is pressed AND was not pressed last frame. This detects the "edge" — the moment it goes from up to down.

---

## Entry 4 — Deploying to GitHub Pages

**What the user asked:**

> *"I want to make this available via GitHub Pages, the repo is public and I have added pages — how do I make sure it works?"*

**The problem:** The game wasn't appearing at the GitHub Pages URL despite the settings being correct.

**Why:** GitHub Pages serves the files from your repository. But files that have been written or edited locally don't exist on GitHub until they're committed and pushed. The game file existed on the local computer but had never been sent to GitHub.

**The fix — three commands:**

```bash
git add index.html DEVLOG.md
git commit -m "Initial game build"
git push
```

- `git add` — tells git which files to include in the next snapshot
- `git commit` — creates the snapshot with a description of what changed
- `git push` — sends the snapshot to GitHub

After pushing, GitHub Pages automatically rebuilds the site. It takes 1–2 minutes. The game then appears at the Pages URL.

**Version numbers:** Adding a version number to the menu screen (e.g. "v1.1") makes it easy to confirm the latest version is live. If the number on screen matches what you just deployed, you're seeing the new version. If it still shows an old number, either GitHub hasn't finished deploying yet, or the browser has cached the old page — a hard refresh (Ctrl+Shift+R) fixes this.

---

## Entry 5 — Choosing a Leaderboard: Why Google Sheets

**What the user asked:**

> *"I need to create a universal high score table but can't use free Supabase as I have reached my limit. What other options do I have for free?"*

The previous games used Supabase (a free database service), but the free tier only allows a limited number of projects. Options considered:

| Option | Cost | Account needed | Complexity |
|--------|------|----------------|------------|
| Supabase | Free (but limit reached) | Yes (limit hit) | Low |
| Firebase | Free tier | New Google project | Medium |
| Dreamlo | Free | Yes (new) | Low |
| **Google Sheets + Apps Script** | **Free forever** | **Uses existing Google account** | **Low** |
| Neon / PlanetScale | Free tier | New account | Medium |

**Why Google Sheets won:**
- No new account needed — uses the existing Google account
- The data is visible as a normal spreadsheet (easy to see who's playing)
- Google Apps Script is free forever with no project limits
- No database configuration — the spreadsheet *is* the database

**Is it safe if other people are playing?**

Yes. The Apps Script acts as a secure gateway between the game and the spreadsheet. Players never have direct access to the spreadsheet — they can only submit a name/score through the game's specific API endpoint. The script sanitises all inputs (strips invalid characters, caps name length at 12, caps score at 999999). The spreadsheet itself remains private — only the owner can see the raw data.

**Will the leaderboard look the same?**

Yes. The leaderboard screen in the game is drawn on canvas by the game's own code. It looks identical regardless of whether the data came from Supabase, Google Sheets, or any other source. The source is invisible to the player.

---

## Entry 6 — Building the Google Sheets Leaderboard

**What was built:**

A two-part system:
1. **Google Apps Script** — a small piece of server-side code that runs on Google's servers, receives scores from the game, and reads/writes to a Google Spreadsheet
2. **Game-side code** — new states and functions in `index.html` that handle name entry, score submission, and displaying the top 10

### How the Data Flows

```
Player finishes game
       ↓
Name entry screen (canvas-drawn, hidden input captures keyboard)
       ↓
Game sends score to Google Apps Script (POST request)
       ↓
Apps Script writes name/score/level/date to spreadsheet row
       ↓
Game waits 1.8 seconds (time for the sheet to save)
       ↓
Game fetches top 10 from Apps Script (GET request)
       ↓
Apps Script reads sheet, sorts by score descending, returns top 10 as JSON
       ↓
Game draws leaderboard screen on canvas
```

### The CORS Problem and How It Was Solved

When a web page sends data to a different server (cross-origin), the browser first sends a "preflight" request (OPTIONS method) asking "is this allowed?" Google Apps Script doesn't respond to OPTIONS requests, so the browser rejects the request before it's even sent.

**The solution:** Use `mode: 'no-cors'` for the POST (score submission):

```javascript
fetch(SCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify({ name, score, level })
});
```

With `no-cors`, the browser sends the data without waiting for permission. The downside: you can't read the response. That's fine — for score submission, we just need the data to arrive; we don't need confirmation.

For the GET request (fetching top 10), no-cors isn't needed because GET requests don't trigger preflight. The leaderboard data comes back as normal JSON.

### Mobile Name Entry — The Hidden Input Trick

The game is drawn on a `<canvas>` element. Canvas doesn't support text input natively, and calling `canvas.focus()` on mobile doesn't bring up the keyboard. To capture the player's name on mobile:

A hidden `<input>` element exists in the HTML (2×2 pixels, 1% opacity, pointer-events disabled — invisible and untouchable):

```html
<input id="name-el" type="text" maxlength="12"
  autocomplete="off" autocorrect="off" autocapitalize="characters"
  style="position:fixed;opacity:0.01;pointer-events:none;
         top:0;left:0;width:2px;height:2px;">
```

When name entry starts, `nameEl.focus()` is called. On mobile, focusing any input element brings up the native keyboard. The player types on the keyboard, the input captures the keystrokes, and the game reads `nameEl.value` each frame to display what's been typed on the canvas.

### New Game States Added

The game state machine gained three new states:

| State | What's Happening |
|-------|-----------------|
| `namentry` | Player is typing their name after game over |
| `submitting` | Score is being sent; leaderboard is loading |
| `leaderboard` | Top 10 is displayed; press any key to play again |

### Step-by-Step Setup Guide

To connect the leaderboard to a new Google Sheet:

1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet
2. In Row 1 (header), enter: `Name` | `Score` | `Level` | `Date`
3. Go to **Extensions → Apps Script**
4. Delete all existing code, paste in the contents of `APPS_SCRIPT.gs`
5. Click **Deploy → New deployment**
6. Set type to **Web App**
7. Set "Execute as" to **Me**
8. Set "Who has access" to **Anyone**
9. Click **Deploy** and authorise when prompted
10. Copy the deployment URL
11. Paste the URL into `index.html` as the value of `SCRIPT_URL`

---

## Entry 7 — The Broken String Bug (Black Screen Returns)

**What the user saw:**

> *"It looks like a previous bug of just the yellow box has returned — check to see what the error is."*

The black-screen-yellow-border symptom appeared again. This time the cause was in how the Google Apps Script URL was pasted into the code. The URL ended up split across two lines inside a single-quoted string:

```javascript
// How it ended up in the file (broken):
const SCRIPT_URL = 'https://script.google.com/.../exec
    ';
```

In JavaScript, you cannot have a literal newline inside a single-quoted or double-quoted string. The parser hits the line break, considers the string ended (without a closing quote), and immediately throws a SyntaxError. Entire script fails. Black screen.

**The fix:** Put the opening quote, the full URL, and the closing quote all on one line:

```javascript
// Correct:
const SCRIPT_URL = 'https://script.google.com/.../exec';
```

**The lesson:** String literals in JavaScript must start and end on the same line (unless you use template literals with backticks, or explicitly escape the newline with `\`). When pasting long URLs into code, make sure no line break sneaks in. The browser console (F12) will show a `SyntaxError: Invalid or unexpected token` error pointing to the exact line if this happens.

---

## Entry 8 — Mobile Keyboard Staying Open After Name Entry

**What the user saw:**

After typing a name on the leaderboard screen and starting a new game, the mobile soft keyboard stayed open. It covered part of the game screen and intercepted touch inputs — the movement buttons were being grabbed by the keyboard instead of the game.

**Why it happened:**

The hidden `<input>` element that captures the player's name was given `.focus()` when name entry started — this is what opens the keyboard. But when `startGame()` was called to restart, nothing told the browser to close the keyboard. The input kept its focus, the keyboard stayed open, and the game started in a state where touches were split between the game buttons and the keyboard.

**The fix:**

One line added at the top of `startGame()`:

```javascript
function startGame() {
  if (nameEl) nameEl.blur();   // dismiss mobile keyboard
  score = 0; lives = 3; level = 1;
  initLevel();
}
```

`.blur()` is the opposite of `.focus()`. Removing focus from the input tells the mobile OS there's nothing to type into — the keyboard closes automatically.

**The lesson:**

On mobile, whatever you `.focus()` to open the keyboard, you must `.blur()` to close it. The browser won't close it on its own just because the game state changed — it has no idea the game has moved on. Explicit blur at the right moment is the only reliable way to dismiss the keyboard.

---

## Entry 9 — Two More Mobile Keyboard Issues

**What the user saw:**

> *"Keyboard input still has issues — if the keyboard loses focus whilst inputting name you cannot get it back up. Also the keyboard obscures the input name screen when in landscape mode."*

Two separate problems, both rooted in the same area of the code.

### Problem 1 — Keyboard Disappears and Can't Be Restored

If the player accidentally tapped somewhere outside the keyboard area during name entry, the hidden input lost focus. The keyboard closed. There was no way to bring it back — the game was stuck on the name entry screen with no way to type.

**Why:** The hidden input was focused once (when name entry started) and nothing watched for it losing focus again. A stray tap was enough to permanently dismiss the keyboard.

**The fix — two parts:**

**Part A:** Listen for the input's own `blur` event and re-focus it if the game is still in name-entry state:

```javascript
nameEl.addEventListener('blur', () => {
  if (gs === 'namentry') {
    setTimeout(() => { if (gs === 'namentry') nameEl.focus(); }, 80);
  }
});
```

The 80ms delay matters. If you call `.focus()` synchronously inside a `blur` handler, some browsers interpret it as a loop and refuse to do it. The short delay lets the blur event finish, then re-focuses cleanly.

**Part B:** Tapping the canvas also restores focus:

```javascript
canvas.addEventListener('touchstart', () => {
  if (gs === 'namentry') nameEl.focus();
}, { passive: true });
```

So even if focus is lost, a tap anywhere on the game canvas brings the keyboard back.

### Problem 2 — Keyboard Covers the Name Entry Screen in Landscape

On a phone held sideways (landscape), the screen is wide but short. The soft keyboard takes up roughly half the vertical space. The game canvas was sized to fit the full screen height, so the bottom half — including the name entry text box — was hidden behind the keyboard.

**Why:** The resize function was using `window.innerHeight` to calculate how large the canvas should be. But `window.innerHeight` doesn't change when the keyboard opens on iOS — it reflects the full physical screen height, ignoring the keyboard entirely.

**The fix — use `visualViewport.height` instead:**

```javascript
function resize() {
  const vvh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const s = Math.min(window.innerWidth / W, (vvh - 90) / H);
  canvas.style.width  = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
}

if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
```

`visualViewport` is a browser API that reports the rectangle that is actually visible to the user — it shrinks when the keyboard opens. By listening to its `resize` event, the canvas immediately recalculates its size whenever the keyboard appears or disappears. In landscape with the keyboard open, the canvas scales down to fit the visible space above the keyboard, keeping the name entry area on screen.

**The lesson:**

`window.innerHeight` lies on mobile — it doesn't account for the keyboard. `visualViewport.height` tells the truth. For any layout that needs to stay visible when the keyboard is open, always use `visualViewport` if it's available.

---

## Entry 10 — iPhone Keyboard Not Opening at All

**What the user saw:**

> *"Looks like Apple phones can't type in the leaderboard."*

On iPhones, reaching the name entry screen after game over showed the input box but the keyboard never appeared. The player had no way to type their name.

**Why Android worked but iOS didn't:**

Both platforms use the same trick of a hidden `<input>` element to capture keyboard input. The code called `.focus()` on that input when name entry started — on Android, this opens the keyboard. On iOS Safari, it doesn't.

The reason is a security rule enforced by iOS Safari: **the keyboard only opens if `.focus()` is called directly inside a user gesture handler** (a `touchstart`, `touchend`, or `click` event). If `.focus()` is called from anywhere else — a `setTimeout`, a `Promise` callback, an `async` function — iOS ignores it completely and the keyboard never appears.

The name entry starts 1.8 seconds after the final death, inside a `setTimeout`:

```javascript
// This works on Android. iOS ignores the .focus() call — wrong context.
setTimeout(() => {
  gs = 'namentry';
  if (nameEl) { nameEl.value = ''; nameEl.focus(); }
}, 1800);
```

There is no way to call `.focus()` from inside a `setTimeout` and have it open the keyboard on iOS. The only option is to restructure the code so the keyboard opens in response to an actual tap.

**The fix — transparent input overlay:**

The hidden input is normally 2×2 pixels with `pointer-events: none` — invisible and untouchable. During name entry, a new function `setNameInputActive(true)` expands it to cover the entire canvas area and enables touch events:

```javascript
function setNameInputActive(active) {
  if (!nameEl) return;
  if (active) {
    nameEl.style.width = '100%';
    nameEl.style.height = 'calc(100% - 100px)'; // leaves room for mobile buttons below
    nameEl.style.pointerEvents = 'auto';
    nameEl.focus(); // opens keyboard on Android/desktop; iOS needs a tap
  } else {
    nameEl.style.width = '2px';
    nameEl.style.height = '2px';
    nameEl.style.pointerEvents = 'none';
  }
}
```

Now the input is a transparent layer on top of the canvas. When the player taps anywhere on the canvas, they are tapping the input directly — that IS a user gesture. iOS opens the keyboard from that real touch.

The canvas still renders normally underneath. The input is 1% opacity so it's invisible. The game drawing and the input capturing coexist without conflict.

When the player submits their name or starts a new game, `setNameInputActive(false)` shrinks the input back to 2×2 and disables pointer events, so normal game touch controls work again.

An on-screen hint was added to the name entry screen:

```
iPhone / iPad: tap the screen to open keyboard
```

**The lesson:**

iOS Safari's keyboard security rule — "focus must come from a user gesture" — is non-negotiable and cannot be worked around with clever timing. The solution is to stop trying to open the keyboard programmatically and instead create the conditions for the user to open it themselves with a real tap. A transparent input overlay that covers the tap area is the standard technique for this.

---

## What Comes Next (Future Improvements)

Potential additions for future sessions:
- Difficulty selection on menu
- More invader animation frames
- Shield flicker effect on barrier damage
- Screen shake on player hit
- Boss level at level 10

---

## The Golden Rule of Vibe Coding

> *Describe what you see, describe what you want, be specific about what's wrong.*

When something isn't right, don't say "it's broken." Say "the invaders are moving too fast at the start" or "the barriers disappear all at once instead of degrading gradually." The more specific the description, the more precise the fix.

---

*Built with Claude Code. Single HTML file. Zero dependencies. Zero hosting cost.*
*Part of the Barney's Bins retro game series.*
