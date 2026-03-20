# CLAUDE.md — Trident Network Explorer

## Project Overview

**Trident Network Explorer** is a blockchain explorer for the Trident community testnet (BFT PoS, 2s block time, Chain ID `0x76a81b116bfaa26e`).

- **Frontend**: React 18 SPA — `frontend/src/` (37 components, i18n EN/ES/PT, dark/light theme, PWA)
- **Backend**: Express.js REST API + WebSocket — `backend/server.js` (5 route groups, 20+ utilities)
- **Stack**: Node 18/20, Jest, ESLint, Prettier, Docker, Kubernetes

---

## Development Commands

```bash
# First-time setup
make setup            # copies .env.example → .env, installs deps

# Daily development
make dev              # full stack via Docker Compose (recommended)
make dev-backend      # backend only: cd backend && npm run dev
make dev-frontend     # frontend only: cd frontend && npm start

# Quality checks (run these before committing)
make lint             # ESLint both projects
make lint-fix         # auto-fix lint issues
make format           # Prettier both projects
make test             # Jest both projects
make test-coverage    # Jest with coverage report
make check            # lint + test together

# CI simulation (mirrors GitHub Actions exactly)
make ci               # install + lint + test
```

Backend: `http://localhost:4000` · Frontend: `http://localhost:3000`

---

## Architecture

### Backend (`backend/`)
```
server.js                  # Express app entry, middleware stack
routes/
  blocks.js                # GET /api/blocks, /api/blocks/:hash
  transactions.js          # GET /api/transactions/:hash
  accounts.js              # GET /api/accounts/:address
  validators.js            # GET /api/validators
  health.js                # GET /health
utils/
  cache.js                 # LRU cache
  websocket.js             # WebSocket push updates
  rateLimiter.js           # 100 req/15min
  inputSanitizer.js        # sanitize all user input
  errorHandler.js          # centralised error handling
  ...                      # export, admin auth, perf monitor, etc.
```

**Pattern for new routes**: add route file → register in `server.js` → add tests in `backend/tests/`.

### Frontend (`frontend/src/`)
```
App.js                     # Router, context providers
api/                       # API client (fetch wrappers)
context/                   # React context for global state
hooks/                     # Custom hooks (data fetching, WebSocket, etc.)
components/                # Reusable UI components
pages (components)/        # HomePage, BlockDetails, TransactionDetails, etc.
locales/                   # i18n JSON (en, es, pt)
utils/                     # Pure utility functions
```

**Pattern for new components**: component file → add to router in `App.js` if page-level → add tests in `frontend/tests/`.

---

## Environment Variables

```bash
# backend/.env (copy from backend/.env.example)
PORT=4000
CHAIN_MODE=rpc
TRIDENT_NODE_RPC_URL=https://testnet.rpc.trident.network
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info

# frontend/.env (copy from frontend/.env.example)
REACT_APP_BACKEND_URL=http://localhost:4000
```

---

## Testing

Tests live alongside the code they test:
- `backend/tests/routes.test.js` — API integration tests (supertest)
- `backend/tests/validator.test.js` — Validator logic
- `backend/utils/__tests__/` — Utility unit tests
- `frontend/tests/` — Component and hook tests (jest + react-test-renderer)

Before marking any task done:
```bash
make check   # lint + all tests must pass
```

If CI is failing, fix it locally first with `make ci`.

---

## Code Style

- **Linter**: ESLint (`eslint-plugin-react`)
- **Formatter**: Prettier
- Run `make lint-fix && make format` before committing
- Never disable ESLint rules without a comment explaining why
- No `console.log` left in production code (use the logger utility)

---

## Security — Non-Negotiable

This is a public blockchain explorer. Always preserve these:

- **Input sanitization**: All user-supplied data must pass through `utils/inputSanitizer.js` before use
- **Rate limiting**: Do not raise or remove the 100 req/15min limit without explicit approval
- **Helmet headers**: Do not disable any security headers set in `server.js`
- **No secrets in code**: Credentials, keys, and tokens go in `.env` only — never committed
- **Validate at boundaries**: Validate input at route entry; trust internal utilities

---

## Git Workflow

```bash
# Branch naming for Claude work
claude/<description>-<sessionId>

# Before pushing, CI must pass locally
make ci

# Commit style: imperative, present tense, ≤72 chars subject
# Examples:
#   Add block pagination to /api/blocks
#   Fix WebSocket reconnect on network drop
#   Update validator endpoint to include uptime
```

CI runs on push to `main` and `develop`: lint → test → build → Docker build. All gates must be green.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
Keep the main context window clean:
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake from recurring
- Review `tasks/lessons.md` at session start before touching code

### 4. Verification Before Done
- Never mark a task complete without proving it works (`make check`)
- Ask: "Would a staff engineer approve this PR?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip for simple, obvious fixes — don't over-engineer

### 6. Autonomous Bug Fixing
- When given a bug report: fix it. Don't ask for hand-holding
- Trace logs → failing test → root cause → fix
- Go fix failing CI without being told how

---

## Task Management

Tasks are tracked in `tasks/` (create the directory if it doesn't exist):

1. **Plan First**: Write plan to `tasks/todo.md` with checkable `- [ ]` items
2. **Verify Plan**: Check in with the user before starting implementation
3. **Track Progress**: Mark items `- [x]` as you go
4. **Explain Changes**: High-level summary at each milestone
5. **Document Results**: Add outcome notes to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after any correction

```
tasks/
  todo.md       # current work plan with checkable items
  lessons.md    # accumulated rules from past mistakes
```

---

## Core Principles

- **Simplicity First**: Minimum code to achieve the goal. No gold-plating.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Touch only what's necessary. Avoid side-effect changes.
- **Security by Default**: Never weaken input validation, rate limiting, or sanitization.
- **Tests are non-optional**: Every new route or component gets a test. No exceptions.
