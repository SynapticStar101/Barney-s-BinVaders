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

## What Comes Next (Future Improvements)

Potential additions for future sessions:
- Global leaderboard (Supabase integration — same as BinDaRoids)
- High score name entry
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
