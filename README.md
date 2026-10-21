# Martini's Brainrot Brawl

A 1v1 pixel-art fighting game for the browser, starring Italian brainrot memes, in plain HTML, CSS and JavaScript modules.

[![Play](https://img.shields.io/badge/play-online-ff3b5c)](https://martinipolice.github.io/brainrot-brawl/)
[![Pages](https://img.shields.io/github/deployments/martinipolice/brainrot-brawl/github-pages?label=pages)](https://github.com/martinipolice/brainrot-brawl/deployments)
![Version](https://img.shields.io/badge/version-1.8.1-ffde3b)
![Dependencies](https://img.shields.io/badge/dependencies-none-4d8b3a)

## Features
- **Modes:** Arcade (a ladder of the three other fighters, then a shadow copy of you as the boss, then an ending), Versus CPU (Easy, Normal or Hard) and 2 Players on one keyboard.
- **Roster:** Tralalero Tralala, Tung Tung Tung Sahur, Bombardiro Crocodilo and Ballerina Cappuccina, each with their own special and ultimate.
- **Fighting system:**
  - light, heavy and special attacks;
  - guarding by holding back, dashes, rush attacks and launchers;
  - L, L, H chains and special cancels;
  - an SP gauge for specials and a SUPER meter for ultimates, with slow-motion cut-ins;
  - rage below 30% health.
- **Stages:** six stages that react to the fight for show only: Sunset Beach, Sahur Village, Bombardiro Airfield, Opera Cappuccina, Shark Pier and The Storm.
- **Rendering:** a 320×180 canvas, with every sprite snapped to a fixed palette at runtime. Hitstop, screen shake, particles and KO physics.
- **Audio:** music and effects synthesized live with the Web Audio API, with no audio files. The announcer uses the browser's speech voices, in JP or EN.
- **Input:** keyboard for two players, plus an on-screen pad for Player 1 on touch screens.
- **Saved in the browser:** options, the hi-score and the CRT filter setting.
- **Built-in self-check:** 20 simulation tests.

## Tech Stack
- HTML5 Canvas 2D
- CSS (one file per part of the page, in `css/`)
- JavaScript ES modules (`js/`), with no framework, no bundler and no build step
- Web Audio API and Web Speech API
- GitHub Pages for hosting, deployed from `main`

## Getting Started

### Prerequisites
- Any current browser that supports ES modules (Chrome, Edge, Firefox or Safari).
- A static file server. The commands below use Python 3. Opening `index.html` straight from disk won't work, because browsers only load modules over HTTP.

### Installation
```bash
git clone https://github.com/martinipolice/brainrot-brawl.git
```

```bash
cd brainrot-brawl
```

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

### Configuration
There are no `.env` keys and no build configuration. Gameplay settings are in the in-game Options menu and are saved in `localStorage` under these keys:
- `brainrot-brawl-opts`
- `brainrot-brawl-hi`
- `brainrot-brawl-crt`

## Usage
Play online at https://martinipolice.github.io/brainrot-brawl/, or open the local server and run the self-check:

```text
http://localhost:8000/#selftest
```

You can also call `selfTest()` from the browser console.

| | Player 1 | Player 2 |
|---|---|---|
| Move · jump | A D · W | ← → · ↑ |
| Guard | hold S or back | hold ↓ or back |
| Light · heavy · special | J K L | , . / (Numpad 1 2 3) |
| Ultimate | K + L | . + / |

Esc pauses, M mutes and C toggles the CRT filter. Version history is in [CHANGELOG.md](CHANGELOG.md).

## License
No license has been chosen yet, so all rights are reserved by default. This is a fan-made parody: the characters are internet memes, drawn from scratch with canvas shapes.
