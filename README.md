# Rock Paper Scissors — ShadowX Edition

A modern, responsive Rock Paper Scissors (with Lizard & Spock) web game built with plain HTML, CSS and JavaScript.

This repository contains a small playable web game with keyboard shortcuts, audio effects, a leaderboard stored in `localStorage`, and accessibility improvements.

## Quick Preview
- Open `index.html` in a browser or run a local static server and visit `http://localhost:8000`.

## Features
- Rock, Paper, Scissors, Lizard, Spock gameplay
- Best-of modes: 3, 5, 7
- Countdown timer per round with visual progress bar
- Pause / Resume controls
- Keyboard shortcuts (default 1–5) and a keyboard remapping UI
- Sounds (click, win, lose, tie, background music) with preload and a graceful autoplay fallback
- Leaderboard stored in `localStorage` (top 5 scores)
- Responsive layout and mobile-friendly touch sizing
- Confetti for celebratory wins and subtle UI animations

## Files of interest
- `index.html` — Main page
- `style.css` — Styling and responsive rules
- `script.js` — Game logic, UI interactions, storage
- `assets/` — Logo and image assets
- `sounds/` — Audio assets used by the game

## How to run (development)
Use a simple static server. From PowerShell run:

```powershell
cd 'C:\Users\USER\OneDrive\Desktop\GitHub\game by web'
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

You can also serve the folder using any static file server (VS Code Live Server, `http-server`, etc.).

## Controls
- Start / Stop: Use the Start button in the setup panel.
- Choices: Click the on-screen buttons or press keys `1`–`5` (default mapping) to choose Rock / Paper / Scissors / Lizard / Spock.
- Pause/Resume: Click the `Pause` button while playing.
- Reset: Click `Reset Game` to restart current session (clears current round scores but does not clear leaderboard).
- Mute: Toggle audio with `Mute`.

### Keyboard Remapping
Open the "Keyboard Controls" panel, click the `Remap` button for a choice, then press the new key. The mapping is saved in `localStorage` under the key `rps_keyMap` and persists between sessions.

## Leaderboard & Storage
- Player name and leaderboard are saved in `localStorage`:
  - `rps_playerName` — the last used player name
  - `rps_leaderboard` — JSON array of top scores (top 5)
  - `rps_keyMap` — custom keyboard mapping

To clear the leaderboard from the browser devtools console run:

```javascript
localStorage.removeItem('rps_leaderboard');
localStorage.removeItem('rps_playerName');
localStorage.removeItem('rps_keyMap');
```

## Assets & Logo
- The displayed logo image is `assets/logo.png` (and responsive variants `logo-64.png`, `logo-128.png`, `logo-512.png` if present).
- To replace the logo, put your image at `assets/logo.png` (or replace the SVG), then update `index.html` if you need a different filename.

### Generate scaled PNGs (optional)
If you have Python and Pillow installed, you can create scaled icons with this snippet (run from the project folder):

```powershell
python - <<'PY'
from PIL import Image
im = Image.open('assets\logo.png').convert('RGBA')
for s in (64,128,512):
    out = im.resize((s,s), Image.LANCZOS)
    out.save(f'assets\\logo-{s}.png')
print('Scaled icons created.')
PY
```

## Accessibility
- Buttons include `aria-label` and results are updated in an `aria-live` region.
- Keyboard navigation and clear focus behavior are supported.

## Troubleshooting
- No audio? Browser autoplay policies may block music. Click anywhere on the page when the loader overlay is visible to enable sounds.
- If the page looks broken after edits, clear the browser cache or open in an incognito window.
- If sounds are silent, check `sounds/voices/` files exist and `script.js` references match file names.

## Contributing
Suggestions and pull requests are welcome. For larger changes please open an issue describing what you want to do first.

## License & Credits
This project is provided as-is for demonstration and learning. Replace or remove any copyrighted assets you do not own before publishing.

Created & maintained by TheRealShadowX.

## Preview Images

You can include preview and screenshot images that will be displayed in the project and README. Drop your image files into `assets/` with these names:

- `assets/preview.png` — a wide/hero preview image (used on the page if present)
- `assets/screenshot.png` — an optional screenshot or alternate preview

If you add these files, they will appear here in the README automatically. Example markdown (already used by the project if files are present):

![Preview1 image](assets/Preview1.png)

![screenshot1 image](assets/screenshot1.png)

![screenshot2 image](assets/screenshot2.png)


