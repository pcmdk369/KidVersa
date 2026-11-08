# KidVersa™

**Play · Learn · Create · Explore**

KidVersa is a privacy-first games platform in development for children aged **9–12**, targeting modern web browsers and Android.

## Current implementation

### Playable game experiences
- **Memory Galaxy** — match six pairs; move counter and completion reward.
- **Number Dash** — eight arithmetic questions with generated answer choices.
- **Speed Racers** — three-lane obstacle-dodging arcade challenge.
- **Adventure Quest** — grid exploration, crystal collection, and keyboard/touch movement.
- **Creative Builder** — 8×8 tile-based pixel-art canvas with a colour palette.
- **Sports Arena** — five-shot penalty challenge.
- **Space Explorer** — short science and general-knowledge quiz.

### Game hub
- Responsive game library with search and category filters.
- Touch-friendly controls and keyboard movement in Adventure Quest.
- Local star count saved in browser storage.
- Installable web-app manifest and basic service-worker shell caching.
- Capacitor configuration for packaging the web app as an Android project.
- GitHub Actions build workflow.

## Technology
- React + TypeScript
- Vite
- Lucide icons
- Capacitor 7 (Android wrapper)
- Browser localStorage for simple local progress

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

Build and test the APK from Android Studio. The Android project is generated locally by Capacitor; a signed release build, Play Console listing, privacy declarations, and device testing are still required before publication.

## Privacy and child-safety principles

- No public chat or user-to-user messaging.
- No location collection or sharing.
- No targeted advertising or behavioural ad profiles.
- No in-app purchases in the current prototype.
- Local progress is stored on the device; there is no account or cloud-sync backend in this version.
- Do not enter a child's real name, contact details, school, or other personal information.

**Important:** These are product design intentions, not a legal certification or a guarantee of regulatory compliance. Before release, complete a child-privacy review, accessibility review, security assessment, parental-consent analysis where applicable, and age-appropriate usability testing. The current parental controls, identity system, remote data protection, and enforceable screen-time controls are not implemented.

## Quality status

The repository includes an automated TypeScript/production-build workflow. A green CI run and manual browser/Android test results must be checked before calling a build release-ready. This code has not yet been independently validated on physical Android devices.

## Roadmap
- Automated unit and end-to-end tests for all games.
- More levels, progression, achievements, and accessible difficulty options.
- Parent dashboard with robust adult verification and enforceable session settings.
- Optional secure account and cloud-save system only after privacy/security design.
- Android accessibility, performance, offline, and release-signing validation.

## Ownership

PCMDK369™ — https://www.pcmdk369.com/
