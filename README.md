# KidVersa™

**Play · Learn · Create · Explore**

KidVersa is a privacy-first games platform in development for children aged **9–12**, targeting modern web browsers and Android.

## Current implementation

### Flagship 3D racing experience — Turbo Track Legends

- Built with **Three.js + React Three Fiber** on React 19.
- Real-time 3D scene with modeled player vehicles, rival traffic, moving road markings, roadside scenery, lighting, fog, and themed environments.
- Four vehicle classes: Street Racer, Hyper GT (level 3), Turbo Kart (level 2), and Monster Truck (level 5); six paint colours.
- Five selectable environments: Neon City, Sunset Desert, Emerald Forest, Cloud Peaks, and Sunny Coast.
- Three race modes: Quick Race, Championship distance, and Time Trial distance.
- Three-lane steering, acceleration, braking, arcade drifting, nitro boost, rival-car collision feedback, pause/resume, race restart, and finish rewards.
- Upgrade tuning presets: Balanced, Speed Engine, Grip Handling, and Nitro Efficiency.
- Keyboard support (arrow keys / WASD / Space) and large touch-friendly mobile controls.
- Procedurally synthesized optional engine tone, ambient music layer, nitro, collision, and victory effects. Sound can be muted.
- Local level and star rewards use the existing KidVersa progress system. No account, cloud profile, purchases, ads, or public chat are added by the racing game.
- Mobile performance settings: capped device pixel ratio, disabled expensive antialiasing, compact geometry, and responsive touch UI.

### Other playable game experiences
- **Memory Galaxy** — match six to fifteen pairs as levels advance; move counter and completion reward.
- **Number Dash** — arithmetic rounds scale from 8 to 20 questions with level-based number ranges.
- **Speed Racers** — lightweight three-lane obstacle-dodging challenge scales from 12 to 30 track sections.
- **Adventure Quest** — grid exploration, crystal collection, and keyboard/touch movement.
- **Creative Builder** — 8×8 tile-based pixel-art canvas with a colour palette.
- **Sports Arena** — penalty challenge scales from 5 to 10 shots.
- **Space Explorer** — five to fifteen science and general-knowledge questions as levels advance.

### Game hub
- Responsive game library with search and category filters.
- Touch-friendly controls and keyboard movement in Adventure Quest.
- Ten-level local progression per game, with difficulty scaling in maths, racing, and sports.
- Local accessibility preferences: larger text, higher contrast, and reduced motion.
- Optional synthesized sound effects and a quiet ambient tone layer using the Web Audio API; audio is opt-in, locally controlled, and never recorded or uploaded.
- Responsive visual system with progress indicators, level badges, visible keyboard focus, and larger interactive controls.
- Local stars, per-game levels, accessibility preferences, session preferences, and Creative Builder artwork saved in browser storage.
- Installable web-app manifest and basic service-worker shell caching.
- Capacitor configuration for packaging the web app as an Android project.
- GitHub Actions build workflow.

## Technology
- React 19 + TypeScript
- Vite
- Three.js + React Three Fiber (3D racing)
- Lucide icons
- Capacitor 7 (Android wrapper)
- Browser localStorage for simple local progress

## 3D racing controls

| Action | Keyboard | Touch |
|---|---|---|
| Steer left / right | Left / Right or A / D | Left / right arrows |
| Accelerate | Up or W | Hold Gas |
| Brake | Down or S | Hold Brake |
| Nitro | Space | Hold Nitro |
| Pause / resume | — | Pause button |

Choose the race mode, environment, car type, and paint before starting. The selected setup is locked during a race to keep the run consistent. Use Restart to begin a fresh run.

## Run locally

Requirements: Node.js 22 LTS or newer, npm, and Git.

```bash
git clone https://github.com/pcmdk369/KidVersa.git
cd KidVersa
npm install
npm run dev
```

Vite prints a local URL. Open it in a browser.

Production web build:

```bash
npm run build
npm run preview
```

## Android setup

Install Android Studio, a compatible Android SDK, and a JDK supported by your installed Android Gradle Plugin. Then run:

```bash
npm install
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

Build and test the APK from Android Studio. The Android project is generated locally by Capacitor. The repository can build a signed Android App Bundle only after the owner configures the required private GitHub Actions signing secrets; never commit a keystore or passwords. Play Console listing, privacy declarations, and device testing are still required before publication.

## Privacy and child-safety principles

- No public chat or user-to-user messaging.
- No location collection or sharing.
- No targeted advertising or behavioural ad profiles.
- No in-app purchases in the current prototype.
- Local progress, display/audio preferences, and a simple session-length setting are stored on the device; there is no account or cloud-sync backend in this version.
- Online multiplayer and secure parent accounts are not implemented. Do not expose child profiles, chat, matchmaking, or personal data until a server-side security, parental-consent, moderation, and privacy design is approved.
- A basic arithmetic parent gate is a convenience screen only, not secure adult verification or a device-level restriction.
- Do not enter a child's real name, contact details, school, or other personal information.

**Important:** These are product design intentions, not a legal certification or a guarantee of regulatory compliance. Before release, complete a child-privacy review, accessibility review, security assessment, parental-consent analysis where applicable, and age-appropriate usability testing. The current parent area only offers local session-length settings and local star reset. Secure parent authentication, enforceable screen-time controls, identity, remote data protection, and cloud sync are not implemented. The 3D racing game is a local single-player arcade prototype; its rival vehicles are simulated traffic, not networked multiplayer opponents.

## Quality status

The repository includes an automated TypeScript/production-build workflow. A green CI run is necessary but not sufficient: manual browser/Android testing, signed release verification, and child-safety review remain mandatory. This code has not yet been independently validated on physical Android devices.

## Roadmap
- Automated unit and end-to-end tests for all games.
- Expand 3D racing with real track layouts, lap timing, drifting physics, vehicle upgrades, unlock conditions, and additional AI racing strategies.
- Add more levels, progression, achievements, and accessible difficulty options.
- Parent dashboard with robust adult verification and enforceable session settings.
- Server-authoritative multiplayer rooms with child-safe matchmaking and no open chat.
- Secure parent accounts, parental consent, data minimisation, account recovery, and audited access controls.
- Optional secure account and cloud-save system only after privacy/security design.
- Android accessibility, performance, offline, and release-signing validation.

## Ownership

PCMDK369™ — https://www.pcmdk369.com/


## UX and child-safety research references

The design implementation uses these public guidance sources as a baseline, not as a certification:
- [Google for Developers — Designing engaging apps for kids](https://developers.google.com/building-for-kids/designing-engaging-apps): predictable navigation, simple interactions, and large touch targets.
- [W3C — Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/wcag/): contrast, keyboard operation, focus visibility, target sizing, and reduced barriers.
- [Google Play — Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335): child-appropriate content, privacy disclosures, SDK and advertising requirements.

These references should be rechecked during release review because platform policies can change.
