# Martini's Brainrot Brawl

A game by **martinipolice**. Current version: **v1.4.0** (shown under the game screen).

A Street Fighter-style 1v1 pixel-art browser fighter starring Italian brainrot memes. It's one HTML file with no build step and no dependencies.

**Play online:** https://martinipolice.github.io/brainrot-brawl/

You can also open `index.html` in a browser to play offline. The live site is deployed with GitHub Pages from the `main` branch, so every push to `main` updates it.

## Modes
The title screen opens with PRESS START, then a menu:

- **Start game (arcade):** pick a fighter and climb a ladder: the other three fighters in random order, then a shadow copy of yourself with 30% more health. The CPU gets sharper every stage, and your score carries across stages. Clearing the ladder plays an ending with the credits.
- **Versus CPU:** you pick your fighter and the CPU's. The CPU's level (Easy, Normal or Hard) is set in Options.
- **2 Players:** two people share one keyboard and pick at the same time with their own cursors.
- **Move list**, **Options** and **Exit**. Options sets the CPU level, effects and music volume, the announcer and the CRT filter, all remembered in your browser. Browsers don't let a page close its own tab, so Exit shows a goodbye screen.

Against the CPU, losing gives you a 9-second CONTINUE countdown before GAME OVER. Rounds last 60 seconds, the first fighter to win 2 rounds takes the match, and the third round is announced as FINAL ROUND.

## Controls
| | Player 1 | Player 2 |
|---|---|---|
| Move · jump | A D · W | ← → · ↑ |
| Guard | hold S, or hold back | hold ↓, or hold back |
| Light · heavy · special | J K L (F G H also work) | , . / (or Numpad 1 2 3) |
| Ultimate (SUPER full) | K + L together | . + / together |

Esc pauses (the pause menu has the move list), M mutes and C switches the CRT filter. In menus, the arrow keys or WASD move the cursor and Enter or J selects. On touch screens, on-screen buttons control Player 1, including an ULT button.

## How a fight works
- **SP gauge (special):** you start each round with one special ready. After that, landing a light attack charges the gauge by 25% and a heavy by 40% (blocked hits count half). A full gauge lets you use your special.
- **SUPER meter (ultimate):** fills as you deal damage, and a little when you take it. When it's full, press Heavy + Special together (↓ → + Special also works). The fight freezes for a cut-in cutscene, then the ultimate plays out.
- **Rage:** when a fighter drops below 30% health, they turn red, hit 10% harder for the rest of the round, and their SUPER fills once: a comeback ultimate.

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

### Balance
Tuned with simulated CPU-vs-CPU rounds (250–400 per pairing). At mid skill every fighter wins 48–52% of rounds. Like most fighting games, it shifts with skill: slow, hard-hitting Tung does best among players who rarely block, and the fast fighters do best among players who guard well. In simulation, the first fighter to hit rage goes on to win about a quarter of those rounds.

## Sound
Everything is synthesized live with the Web Audio API; there are no audio files. Effects, menu sounds and music each play through their own channel into a limiter, so a pile-up of hits doesn't distort. Effects get a touch of room reverb, and the music dips under ultimates, KOs and rage. The title screen has its own theme. The fight tarantella adds a drum layer in the final round, and speeds up when someone is in rage or the clock is under 10 seconds. The optional announcer ("Round one… Fight!") uses your browser's built-in speech voice, so how it sounds depends on your browser and system.

## Scoring
Hits score 100 points per point of damage, plus a bonus for combos. The round winner gets a TIME bonus (100 per second left), a VITAL bonus (50 per HP left) and 10,000 for a PERFECT (winning without taking damage). The best human score is saved in the browser as the HI-SCORE on the title screen.

## Look and feel
The arena draws at 320×180. Every sprite is snapped to a fixed palette with hard edges and scaled up with no smoothing, and the background uses dithered gradients.

When a hit lands, the game freezes briefly (hitstop) and the defender shudders. Sparks scatter and bounce off the sand, a heavy hit zooms the camera and pops a brainrot word (TUNG!, KABOOM!), and the health bar shakes. A KO adds slow motion, a camera zoom on the loser, a screen flash, a confetti burst and the body bouncing on the ground. Fighters squash and stretch on jumps, landings and hits, knockback leaves afterimages, and stunned fighters splat against the walls. Turning on the OS reduced-motion setting tones down the shake, zoom and flashes.

## Self-check
Open `index.html#selftest`, or run `selfTest()` in the console. It runs 19 checks, including hits and blocking, guarding by holding back, the L, L, H chain, dashing, the SP gauge, rage, all three ultimate inputs (and that they need a full meter), KOs and the score bonuses.

## Changelog
- **v1.4.0:** Martini's title and logo, a cleaner title card (logo and menu only), a cleaner character select (name and SPD/POW/HP bars), SP gauge charged by hits, Heavy + Special ultimate, rage mode, new sound mix (effects and music volumes, title theme, adaptive drums, ducking, announcer), compact controls card, version label, rebalance.
- **v1.3.0:** Arcade ladder with a shadow boss and ending, CPU difficulty levels, J/K/L controls, dashes and combos, SUPER meter and ultimates with cutscenes, higher jumps, title logo and menus.
- **v1.2.0:** Retro arcade cabinet UI, Street Fighter-style select and VS screens, HUD, scoring, continue screen.
- **v1.1.0:** Pixel-art rendering and game juice (hitstop, particles, KO slow motion, chiptune music).
- **v1.0.0:** First release: four fighters, versus CPU and 2 players.

Fan-made parody. The characters are internet memes, drawn here from scratch with canvas shapes and pixelated at runtime.
