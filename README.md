# Brainrot Brawl

A game by **martinipolice**.

A Street Fighter-style 1v1 pixel-art browser fighter starring Italian brainrot memes. It's one HTML file with no build step and no dependencies.

**Play online:** https://martinipolice.github.io/brainrot-brawl/

You can also open `index.html` in a browser to play offline. The live site is deployed with GitHub Pages from the `main` branch, so every push to `main` updates it.

## Modes
The title screen opens with PRESS START, then a menu:

- **Start game (arcade):** pick a fighter and climb a ladder: the other three fighters in random order, then a shadow copy of yourself with 30% more health. The CPU gets sharper every stage, and your score carries across stages. Clearing the ladder plays an ending with the credits.
- **Versus CPU:** you pick your fighter and the CPU's. The CPU's level (Easy, Normal or Hard) is set in Options.
- **2 Players:** two people share one keyboard and pick at the same time with their own cursors.
- **Move list**, **Options** (CPU level, sound, music, CRT filter, all remembered in your browser) and **Exit**. Browsers don't let a page close its own tab, so Exit shows a goodbye screen.

Against the CPU, losing gives you a 9-second CONTINUE countdown before GAME OVER. Rounds last 60 seconds, the first fighter to win 2 rounds takes the match, and the third round is announced as FINAL ROUND.

## Controls
| Action | Player 1 | Player 2 |
|---|---|---|
| Walk | A / D | ← / → |
| Jump | W | ↑ |
| Guard (hold) | S, or hold back | ↓, or hold back |
| Light / Heavy / Special | J / K / L (F / G / H also work) | , . / (or Numpad 1 2 3) |

Menus: arrow keys or WASD move the cursor, and Enter or J selects. On the select screen, Player 2 uses the arrows and `,` to pick, K or `.` undoes a pick, and Esc goes back.

Press Esc to pause (the pause menu has the move list), M to mute and C to switch the CRT filter on or off. On touch screens, on-screen buttons control Player 1, including an ULT button.

## Moves
Every fighter has these (written for facing right):

| Input | Move |
|---|---|
| → → / ← ← | Dash in / backstep |
| → + Heavy | Rush attack: a lunging heavy |
| ← + Heavy | Launcher: an anti-air that pops the opponent up for a juggle |
| Light, Light, Heavy | Chain combo when the hits connect |
| Light or Heavy, then Special | Cancel a connected hit into your special |
| ↓ → + Special | **Ultimate**, when your SUPER meter is full |

The SUPER meter fills as you deal damage (and a little when you take it). Triggering an ultimate freezes the fight for a cut-in cutscene, then the move plays out.

## Roster
| Fighter | Style | Special | Ultimate |
|---|---|---|---|
| Tralalero Tralala | Fast shark on three sneakers | **Tralala Wave**: a projectile | **Tralala Tsunami**: a giant wave that washes through projectiles |
| Tung Tung Tung Sahur | Slow, hard-hitting log with a bat | **Tung Tung Tung**: a 3-hit armored rush | **Tung x9 Sahur**: a 7-hit armored beatdown |
| Bombardiro Crocodilo | Floaty crocodile bomber | **Bombardino**: a lobbed bomb | **Bombardino Barrage**: five bombs rain down on the opponent |
| Ballerina Cappuccina | Spinning dancer | **Pirouette**: a 4-hit spinning dash | **Cappuccino Cyclone**: a 7-hit spinning dash |

Blocking takes 15% chip damage (30% against ultimates). Specials recharge over time. When two projectiles meet, they cancel out, except the Tsunami, which washes through.

### Balance
Tuned with simulated CPU-vs-CPU rounds (300–400 per pairing). At mid skill every fighter wins 46–54% of rounds. Like most fighting games, it shifts with skill: slow, hard-hitting Tung does best among players who rarely block, and the fast fighters do best among players who guard well.

## Scoring
Hits score 100 points per point of damage, plus a bonus for combos. The round winner gets a TIME bonus (100 per second left), a VITAL bonus (50 per HP left) and 10,000 for a PERFECT (winning without taking damage). The best human score is saved in the browser as the HI-SCORE on the title screen.

## Look and feel
The arena draws at 320×180. Every sprite is snapped to a fixed palette with hard edges and scaled up with no smoothing, and the background uses dithered gradients.

When a hit lands, the game freezes briefly (hitstop) and the defender shudders. Sparks scatter and bounce off the sand, a heavy hit zooms the camera and pops a brainrot word (TUNG!, KABOOM!), and the health bar shakes. A KO adds slow motion, a camera zoom on the loser, a screen flash, a confetti burst and the body bouncing on the ground. Fighters squash and stretch on jumps, landings and hits, knockback leaves afterimages, and stunned fighters splat against the walls. A chiptune tarantella plays during rounds and speeds up in the last 10 seconds. Turning on the OS reduced-motion setting tones down the shake, zoom and flashes.

## Self-check
Open `index.html#selftest`, or run `selfTest()` in the console. It runs 14 checks, including hits and blocking, guarding by holding back, the L, L, H chain, dashing, ultimates (and that they need a full meter), KOs and the score bonuses.

Fan-made parody. The characters are internet memes, drawn here from scratch with canvas shapes and pixelated at runtime.
