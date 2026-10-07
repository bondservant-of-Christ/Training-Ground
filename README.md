# Barracks (Training Grounds)
Medieval-fantasy RPG workout tracker. Installable PWA, no build step, data in localStorage.

## Run locally
`python3 -m http.server 8000` then open http://localhost:8000

## Host (free)
GitHub: push to a repo, Settings > Pages > Deploy from branch `main` / root. Open the URL on your phone and "Add to Home Screen".

## Release
Bump `VERSION` in `sw.js` on every change so installed copies update. Add new files to `src/index.json` and the script list in `index.html`.

## Saves
Settings > Data > Export / Import save (JSON). Use this to move progress between devices.

## Single-file build
`node scripts/inline.mjs` -> `dist/barracks.html`.
