# Barracks (Training Grounds)
Medieval-fantasy RPG workout tracker. Installable PWA, no build step. Data lives in localStorage, with optional online saves.

## Run locally
`python3 -m http.server 8000` then open http://localhost:8000

## Host (free)
GitHub: push to a repo, Settings > Pages > Deploy from branch `main` / root. Open the URL on your phone and "Add to Home Screen".

## Release
Bump `VERSION` in `sw.js` on every change so installed copies update. Add new files to `src/index.json` and the script list in `index.html`.

## Saves
Progress is stored on the device. Players can sign in (Profile or Settings > Account) with email or Google to save it online and use it on any device. Settings > Data > Export / Import save (JSON) still works as a manual backup.

## Accounts (Firebase)
Uses Firebase Auth and Firestore (free Spark plan). In the Firebase console: enable Email/Password and Google under Authentication > Sign-in method, add the site's domain under Authentication > Settings > Authorized domains, create a Firestore database, and paste `firestore.rules` into Firestore > Rules.

## Friends
Signed-in players get a friend code (Profile > Friends). Adding someone's code shows their name, picture, rank, level and streak on a leaderboard.

## Single-file build
`node scripts/inline.mjs` -> `dist/barracks.html`.
