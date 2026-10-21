# Martini's Brainrot Brawl

A game by **martinipolice**. Current version: **v1.8.0** (shown under the game screen).

A Street Fighter-style 1v1 pixel-art browser fighter starring Italian brainrot memes. It's plain HTML, CSS and JavaScript modules, with no build step and no dependencies.

**Play online:** https://martinipolice.github.io/brainrot-brawl/

The live site is deployed with GitHub Pages from the `main` branch, so every push to `main` updates it.

To play offline, serve the folder with any static web server and open it in a browser. Opening `index.html` straight from disk won't work, because browsers only load JavaScript modules over HTTP. With Python installed, run this in the project folder, then open http://localhost:8000:

```bash
python -m http.server 8000
```

## Modes
The title screen opens with PRESS START, then a menu:

- **Start game (arcade):** pick a fighter and climb a ladder: the other three fighters in random order, then a shadow copy of yourself with 30% more health. The CPU gets sharper every stage, and your score carries across stages. Clearing the ladder plays an ending with the credits.
- **Versus CPU:** you pick your fighter and the CPU's. The CPU's level (Easy, Normal or Hard) is set in Options.
- **2 Players:** two people share one keyboard and pick at the same time with their own cursors.
- **Move list**, **Options** and **Exit**. Options sets the CPU level, effects and music volume, the announcer (JP, EN or Off), the CRT filter and screen shake and flashing (Full, Reduced or Off), all remembered in your browser. Browsers don't let a page close its own tab, so Exit shows a goodbye screen.

Against the CPU, losing gives you a 9-second CONTINUE countdown before GAME OVER. Rounds last 60 seconds, the first fighter to win 2 rounds takes the match, and the third round is announced as FINAL ROUND.

## Controls
| | Player 1 | Player 2 |
|---|---|---|
| Move · jump | A D · W | ← → · ↑ |
| Guard | hold S, or hold back | hold ↓, or hold back |
| Light · heavy · special | J K L (F G H also work) | , . / (or Numpad 1 2 3) |
| Ultimate (SUPER full) | K + L together | . + / together |

Esc pauses; the pause menu can restart the match or show the move list, and switching to another window or tab pauses the fight for you. Pressing Light, Heavy or Special skips the ROUND call and the rest of an ultimate cut-in. Character select starts on the fighters you picked last time. M mutes and C switches the CRT filter. In menus, the arrow keys or WASD move the cursor and Enter or J selects. On touch screens, on-screen buttons control Player 1, including an ULT button.

## How a fight works
- **SP gauge (special):** starts each round empty. Landing a light attack charges it by 25% and a heavy by 40% (blocked hits count half). A full gauge lets you use your special.
- **SUPER meter (ultimate):** fills slowly as you deal damage, and a little when you take it, and carries over between rounds. When it's full, press Heavy + Special together (↓ → + Special also works). The fight freezes for a slow-motion cut-in, and the ultimate opens in slow motion before playing out at full speed.
- **Rage:** when a fighter drops below 30% health, they turn red, hit 10% harder for the rest of the round, and their SUPER jumps by 35%, once a round.

Every fighter also has these moves (written for facing right):

| Input | Move |
|---|---|
| → → / ← ← | Dash in / backstep |
| → + Heavy | Rush attack: a lunging heavy |
| ← + Heavy | Launcher: an anti-air that pops the opponent up for a juggle |
| Light, Light, Heavy | Chain combo when the hits connect |
| Light or Heavy, then Special | Cancel a connected hit into your special |

## Roster
| Fighter | Style | Special | Ultimate |
|---|---|---|---|
| Tralalero Tralala | Fast shark on three sneakers | **Tralala Wave**: a projectile | **Tralala Tsunami**: a giant wave that washes through projectiles |
| Tung Tung Tung Sahur | Slow, hard-hitting log with a bat | **Tung Tung Tung**: a 3-hit armored rush | **Tung x9 Sahur**: a 7-hit armored beatdown |
| Bombardiro Crocodilo | Floaty crocodile bomber | **Bombardino**: a lobbed bomb | **Bombardino Barrage**: five bombs rain down on the opponent |
| Ballerina Cappuccina | Spinning dancer | **Pirouette**: a 4-hit spinning dash | **Cappuccino Cyclone**: a 7-hit spinning dash |

Blocking takes 15% chip damage (30% against ultimates). When two projectiles meet, they cancel out, except the Tsunami, which washes through.

## Stages
Versus CPU and 2 Players pick one of five stages at random for each match, and the VS screen names it. In arcade, each opponent fights you on their home stage and the shadow boss waits in The Storm. Every stage reacts to the fight, purely for show: nothing on a stage changes damage or position.

| Stage | Home of | What reacts |
|---|---|---|
| Sunset Beach | | Clouds drift and the sea glints |
| Sahur Village | Tung | Lanterns sway, and swing after big hits. Neighbours lean out of their windows to wave at combos and KOs. The kentongan drum in the guard post swings with every big hit and rings "TUNG!" when one lands close by, and on every KO |
| Bombardiro Airfield | Bombardiro | A bomber crosses the sky every ten seconds and drops a bomb far out on the field. The windsock flaps, the tower beacon flashes after a KO, and two mechanics cheer |
| Opera Cappuccina | Ballerina | Spotlights follow both fighters and the footlights flare on big hits. The audience stands for combos and KOs, and a KO brings the chandelier crashing down and roses onto the stage (it's hung again next round) |
| Shark Pier | Tralalero | Seagulls circle and scatter after big hits, waves throw spray over the railing, the lighthouse blinks, and the crate stacks at each end smash when someone is slammed into them (they're stacked again next round) |
| The Storm | Shadow boss | Rain, and lightning every few seconds and on every KO. The flash follows the Shake & flash option |

### Balance
Tuned with simulated CPU-vs-CPU matches: 1,800 matches across three CPU skill levels (Easy, Normal and Hard). Averaged over the three, every fighter wins 48–53% of rounds, and a round at Normal lasts about 30 seconds. Like most fighting games, it shifts with skill: slow, hard-hitting Tung does best against players who rarely block, and the fast fighters (Tralalero and Ballerina) do best against players who guard well. Health: Tralalero 124, Tung 108, Bombardiro 123, Ballerina 129.

## Sound
Everything is synthesized live with the Web Audio API; there are no audio files. Effects, menu sounds and music each play through their own channel into a master low-pass and a limiter, so a pile-up of hits never distorts. Effects get a touch of room reverb.

- **Battle theme:** a 150 BPM track in A minor with a plucky synth bass, kick, snare, hats, chord stabs and a lead melody. It builds with the fight: the intro is rhythm only, the melody comes in on FIGHT!, the final round adds faster hats, and rage or the last 10 seconds add crashes, a doubled bass and a harmony line. It gets busier rather than louder, and it sits under the fight: it is softened in the highs and dips under the announcer, big hits, ultimates, KOs and rage.
- **Sound effects:** every fighter's hits carry their own flavour on top of the impact (Tung's wooden "tung", Tralalero's splash, Bombardiro's chomp, Ballerina's twirl). Light and heavy attacks whoosh differently, footsteps tap softly, and a KO muffles everything for a moment, like ringing ears.
- **Announcer:** Street Fighter and Tekken style calls: round and FIGHT!, K.O., PERFECT, TIME OVER, the winner, the VS matchup, "Choose your fighter", "Excellent!" on a 5-hit combo, "Continue?", "Game over" and "Congratulations". It uses your browser's built-in speech voices. **JP** (the default) gives Japanese-accented English: with a Japanese voice installed (Chrome's "Google 日本語", Edge's Nanami or Keita) it reads the lines in katakana; without one, an English voice reads a phonetic respelling ("Raundo wan... Faito!"). **EN** is plain English, and **OFF** turns it off. How it sounds depends on the voices on your system.

## Scoring
Hits score 100 points per point of damage, plus a bonus for combos. The round winner gets a TIME bonus (100 per second left), a VITAL bonus (50 per HP left) and 10,000 for a PERFECT (winning without taking damage). The best human score is saved in the browser as the HI-SCORE on the title screen.

## Look and feel
The arena draws at 320×180. In battle the camera sits 1.5× closer than the whole stage and follows the fight on a smooth spring: it frames both fighters and any projectile in flight, ignores small shuffles, eases into the stage edges, and rises during jumps only as far as it can without losing the ground. Both fighters always stay on screen. The zoom stays fixed so the pixel art never shimmers. Every sprite is snapped to a fixed palette with hard edges and scaled up with no smoothing, and the background uses dithered gradients.

When a hit lands, the game freezes briefly (hitstop) and the defender shudders. Sparks scatter and bounce off the sand, a heavy hit zooms the camera and pops a brainrot word (TUNG!, KABOOM!), and the health bar shakes. A KO adds slow motion, a camera zoom on the loser, a screen flash and a confetti burst. The loser's body keeps the spin of the blow: it tumbles through the air, bounces, and rocks to rest flat on the sand, and a body knocked into a wall bounces off it spinning back. Fighters squash and stretch on jumps, landings and hits, knockback leaves afterimages, and stunned fighters splat against the walls. Screen shake builds up from impacts and settles smoothly: a light hit nudges the screen by about a pixel, a KO by about five, and quick combos stack. Turning on the OS reduced-motion setting starts the Shake & flash option at Reduced and tones down the zoom.

## Project structure
`index.html` holds the page layout and the screen containers. It links the stylesheets and loads `js/main.js` as an ES module, which imports everything else.

| Path | What's in it |
|---|---|
| `css/` | Styles, one file per part of the page, linked in cascade order: base, cabinet, components, title, select, fight, controls, reduced motion |
| `js/main.js` | Entry point: paints the stage, wires up the page, runs the fixed 60 Hz game loop |
| `js/core/` | Constants, saved settings, shared game state, small helpers |
| `js/render/` | Canvas and offscreen layer, shape helpers, pixel pass, pixel text, camera, stage, fight scene, HUD, fighter previews |
| `js/stages/` | The stages: each one's backdrop, moving details and reactions, and the list that picks them |
| `js/game/` | Fighters' art, roster, match and round flow, the per-tick fighter update, combat and projectiles, effects |
| `js/audio/` | Mixer, sound effects, announcer, music |
| `js/input/` | Key maps, global keys and screen routing, touch pad |
| `js/ai/cpu.js` | CPU opponent |
| `js/ui/` | Screens: title and options, character select, VS splash, ending, menus, screen switching and match flow |
| `js/tests/selftest.js` | The self-check |
| `img/` | Tab icon and home-screen icon (Tung's face as 32×32 pixel art in the game's palette) and the 1200×630 link preview image, drawn with the game's own art |

Shared mutable values (the current match, which screen is showing and so on) live in the module that owns them. Other modules read them through imports and change them through that module's setters, such as `setGame()`, because an imported binding is read-only. The shape helpers draw into one target at a time; `withTarget(canvas, draw)` points them at another canvas for the length of `draw` and always switches back.

## Self-check
Serve the folder as above and open `index.html#selftest`, or run `selfTest()` in the console. It runs 20 checks, including hits and blocking, guarding by holding back, the L, L, H chain, dashing, the SP gauge (and that it starts empty), rage, all three ultimate inputs (and that they need a full meter), KOs and the score bonuses.

## Changelog
- **v1.8.0:** Five new stages: Sahur Village (Tung), Bombardiro Airfield, Opera Cappuccina (Ballerina), Shark Pier (Tralalero) and The Storm for the shadow boss, each reacting to the fight with swinging lanterns and drums, cheering crowds, a bomber flyover, a falling chandelier, smashing crates and lightning, all visual only. Versus picks a stage at random and the VS screen names it; arcade fights each opponent on their home stage.
- **v1.7.1:** New tab and home-screen icon: Tung's grinning face as 32×32 pixel art in the game's palette, framed in the logo's gold-to-pink.
- **v1.7.0:** Ultimate cut-ins are close-ups framed on each fighter's face; rounds last longer (more health, rebalanced so every fighter wins about half its rounds across CPU levels); the SP gauge starts each round empty; SUPER fills more slowly and rage adds 35% instead of a full bar; pause menu Restart match; the fight pauses itself when you switch windows; Light, Heavy or Special skips the ROUND call and cut-ins; character select remembers your last picks; menu items are full-size tap targets on touch screens; a tab icon, a home-screen icon and a link preview image for sharing.
- **v1.6.0:** Slow-motion ultimate cut-in that opens the move in slow motion; knocked-out fighters tumble, bounce and settle on the sand with physics instead of a fixed fall; keys used in the pause menu no longer make fighters attack or jump on resume; holding M no longer flickers mute; the code is split into CSS files and JavaScript modules.
- **v1.5.0:** Redrawn fighters closer to the source memes (torpedo-shaped Tralalero, Tung's carved drum slit and grin, a green crocodile-bodied Bombardiro, Ballerina's pointe-shoe ribbons and layered tutu); a closer battle camera that follows the fight on a smooth spring with a deadzone, frames projectiles, and keeps the ground in view during jumps, so the fighters are about 50% bigger on screen; slimmer HUD; knocked-out fighters now lie on the sand instead of sinking into it; centred title menu and character select; header is just the title; touch controls fit phones down to 320px; faster palette lookup; Ballerina 104 HP; new battle theme that builds with the fight, per-fighter hit sounds, a louder and cleaner mix, and a Japanese-accented arcade announcer with more lines.
- **v1.4.0:** Martini's title and logo, a cleaner title card (logo and menu only), a cleaner character select (name and SPD/POW/HP bars), SP gauge charged by hits, Heavy + Special ultimate, rage mode, new sound mix (effects and music volumes, title theme, adaptive drums, ducking, announcer), compact controls card, version label, rebalance.
- **v1.3.0:** Arcade ladder with a shadow boss and ending, CPU difficulty levels, J/K/L controls, dashes and combos, SUPER meter and ultimates with cutscenes, higher jumps, title logo and menus.
- **v1.2.0:** Retro arcade cabinet UI, Street Fighter-style select and VS screens, HUD, scoring, continue screen.
- **v1.1.0:** Pixel-art rendering and game juice (hitstop, particles, KO slow motion, chiptune music).
- **v1.0.0:** First release: four fighters, versus CPU and 2 players.

Fan-made parody. The characters are internet memes, drawn here from scratch with canvas shapes and pixelated at runtime.
