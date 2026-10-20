# Brainrot Brawl

A Street Fighter-style 1v1 pixel-art browser fighter starring Italian brainrot memes. It's one HTML file with no build step and no dependencies.

**Play online:** https://martinipolice.github.io/brainrot-brawl/

You can also open `index.html` in a browser to play offline. The live site is deployed with GitHub Pages from the `main` branch, so every push to `main` updates it.

## Modes
- **1 Player vs CPU**: you pick your fighter, then the CPU's. If the CPU wins, you get a 9-second CONTINUE countdown before GAME OVER.
- **2 Players**: two people share one keyboard and pick at the same time with their own cursors.

The game runs like an arcade cabinet: PRESS START, a mode menu, a Street Fighter-style select screen with a 30-second timer, a VS splash, then the fight. Rounds last 60 seconds, the first fighter to win 2 rounds takes the match, and the third round is announced as FINAL ROUND.

## Scoring
Hits score 100 points per point of damage, plus a bonus for combos. The round winner gets a TIME bonus (100 per second left), a VITAL bonus (50 per HP left) and 10,000 for a PERFECT (winning without taking damage). The best human score is saved in the browser as the HI-SCORE on the title screen.

## Controls
| Action | Player 1 | Player 2 |
|---|---|---|
| Walk | A / D | ← / → |
| Jump | W | ↑ |
| Block (hold) | S | ↓ |
| Light / Heavy / Special | F / G / H | , . / (or Numpad 1 2 3) |

Menus: arrow keys or WASD move the cursor, and Enter or F selects. On the select screen, Player 2 uses the arrows and `,` to pick, G or `.` undoes a pick, and Esc goes back.

Press Esc to pause, M to mute and C to switch the CRT filter (scanlines and vignette) on or off. On touch screens, on-screen buttons control Player 1.

## Roster
| Fighter | Style | Special |
|---|---|---|
| Tralalero Tralala | Fast shark on three sneakers | **Tralala Wave**: a projectile |
| Tung Tung Tung Sahur | Slow, hard-hitting log with a bat | **Tung Tung Tung**: a 3-hit armored rush |
| Bombardiro Crocodilo | Floaty crocodile bomber | **Bombardino**: a lobbed bomb that explodes on landing |
| Ballerina Cappuccina | Spinning dancer, low health | **Pirouette**: a 4-hit spinning dash |

## Look and feel
The arena draws at 320×180. Every sprite is snapped to a fixed palette with hard edges and scaled up with no smoothing, and the background uses dithered gradients.

When a hit lands, the game freezes briefly (hitstop) and the defender shudders. Sparks scatter and bounce off the sand, a heavy hit zooms the camera and pops a brainrot word (TUNG!, KABOOM!), and the health bar shakes. A KO adds slow motion, a camera zoom on the loser, a screen flash, a confetti burst and the body bouncing on the ground. Fighters squash and stretch on jumps, landings and hits, knockback leaves afterimages, and stunned fighters splat against the walls. A chiptune tarantella plays during rounds and speeds up in the last 10 seconds. Turning on the OS reduced-motion setting tones down the shake, zoom and flashes.

Blocking takes 15% chip damage. Specials recharge over time. When two projectiles meet, they cancel each other out.

## Self-check
Open `index.html#selftest`, or run `selfTest()` in the console. It checks that hits land, blocking reduces damage, projectiles hit and a KO ends the round.

Fan-made parody. The characters are internet memes, drawn here from scratch with canvas shapes and pixelated at runtime.
