# Wildin Playwright Tests

Quick scaffold to run Playwright tests against the Wildin Shop demo.

Setup

1. Change into the tests folder:

```bash
cd playwright-tests
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

Serve the demo app (from the repository root) on port 3000. Example using `http-server`:

```bash
# from repository root (one level up)
npx http-server . -p 3000
```

Run tests

```bash
cd playwright-tests
npm test
```

Notes

- The tests expect the app to be reachable at `http://localhost:3000`.
- Use `npm run test:headed` to see tests in a headed browser.
