# Brainrot Brawl

A Street Fighter-style 1v1 browser fighter starring Italian brainrot memes. It's one HTML file with no build step and no dependencies.

**Play:** open `index.html` in a browser, or turn on GitHub Pages for this repo.

## Modes
- **1 Player vs CPU**: you pick your fighter and the CPU's.
- **2 Players**: two people share one keyboard.

Rounds last 60 seconds, and the first fighter to win 2 rounds takes the match.

## Controls
| Action | Player 1 | Player 2 |
|---|---|---|
| Walk | A / D | ← / → |
| Jump | W | ↑ |
| Block (hold) | S | ↓ |
| Light / Heavy / Special | F / G / H | , . / (or Numpad 1 2 3) |

Press Esc to pause and M to mute. On touch screens, on-screen buttons control Player 1.

## Roster
| Fighter | Style | Special |
|---|---|---|
| Tralalero Tralala | Fast shark on three sneakers | **Tralala Wave**: a projectile |
| Tung Tung Tung Sahur | Slow, hard-hitting log with a bat | **Tung Tung Tung**: a 3-hit armored rush |
| Bombardiro Crocodilo | Floaty crocodile bomber | **Bombardino**: a lobbed bomb that explodes on landing |
| Ballerina Cappuccina | Spinning dancer, low health | **Pirouette**: a 4-hit spinning dash |

Blocking takes 15% chip damage. Specials recharge over time. When two projectiles meet, they cancel each other out.

## Self-check
Open `index.html#selftest`, or run `selfTest()` in the console. It checks that hits land, blocking reduces damage, projectiles hit and a KO ends the round.

Fan-made parody. The characters are internet memes, drawn here from scratch with canvas shapes.
