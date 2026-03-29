# playwright-cli

Use this skill to test browser-based projects with Playwright from the command line.

## Purpose

This skill is for autonomous verification of web apps and games, especially when visual or interactive checks are required.

It is useful for:
- opening a local or remote page
- waiting for the UI to stabilize
- clicking / tapping / typing
- collecting screenshots
- reading console errors
- verifying that a user flow actually works

## Recommended workflow

1. Start the local app/server.
2. Open the target page in Playwright.
3. Wait for a stable state or explicit test hook.
4. Run the smallest interaction needed to verify the behavior.
5. Capture screenshot(s) and console output.
6. If the interaction is flaky, add explicit test hooks in the app instead of relying only on visual heuristics.

## Strong recommendation for games

For Phaser or canvas-heavy apps, prefer exposing a small global test API such as:

```js
window.__GAME_TEST__ = {
  ready: true,
  startGame: () => {},
  scene: () => {},
  snapshot: () => ({})
}
```

This makes Playwright much more reliable than guessing from pixels or hitboxes.

## Standard checks

### Load check
- page loads without fatal console errors
- root canvas or main container exists

### Menu check
- start button or equivalent action transitions into gameplay

### Mobile check
- emulate small viewport
- validate touch-friendly flow
- capture screenshot after input

### Regression check
- compare current screenshot with expected visual state
- confirm no new console errors appear

## Example command shapes

### Start local server
```bash
python3 -m http.server 8080
```

### Run Playwright script
```bash
node scripts/playwright/run-smoke-test.mjs
```

## Notes

- Prefer deterministic hooks over brittle CSS/text matching.
- For canvas games, screenshots are helpful but state hooks are better.
- If a flow repeatedly fails, instrument the game rather than retrying blindly.
