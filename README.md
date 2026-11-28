# 🛡️ AI Code Review & Repository Assistant (Frontend)

A modern, responsive, and developer-first Frontend for the **AI Code Review & Repository Intelligence Assistant**, built with **React (Vite SPA)**, **Tailwind CSS**, **Redux Toolkit**, **Axios**, and **React Router v6+**.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ installed
- **FastAPI Backend** running at `http://localhost:8000/api/v1`

### 2. Configure Environment
Create or verify your `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🏗️ Architecture & Core Systems

```
src/
├── api/                     # Centralized HTTP & Service Layer
│   ├── client.js            # Axios client with JWT auto-injection & 401 interceptors
│   ├── endpoints.js         # Single source of truth for all backend API routes
│   ├── authService.js       # Register, Login, Me endpoints
│   ├── repoService.js       # Repositories, Indexing, Chunks, Codebase Q&A
│   ├── reviewService.js     # PR Reviews, Findings, Diffs
│   ├── actionService.js     # Human-in-the-Loop Pending Actions & Approvals
│   └── feedbackService.js   # Finding feedback ratings & Model precision stats
├── components/
│   ├── common/              # SeverityBadge, StatusBadge, Modal, FeedbackWidget
│   ├── code/                # Unified DiffViewer with line numbers & copy
│   └── layout/              # Sidebar, Navbar, AppLayout, ProtectedRoute
├── pages/
│   ├── Login.jsx            # Split-screen login with automated JWT session persistence
│   ├── SignUp.jsx           # Split-screen account registration with validation
│   ├── Dashboard.jsx        # Connected repos, Quick stats, Connect & Index modals
│   ├── RepoDetail.jsx       # 4-Tab Workspace (RAG Q&A, PR Audit, Chunks, Telemetry)
│   └── ActionsInbox.jsx     # Human-in-the-Loop staged patch approval center
├── store/                   # Redux Toolkit global state
│   ├── index.js             # Store configuration
│   ├── authSlice.js         # Session state, JWT token, user profile
│   └── repoSlice.js         # Repository list, active repo, status transitions
├── App.jsx                  # React Router DOM layout & route definitions
├── main.jsx                 # Provider mounting
└── index.css                # Tailwind directives & custom scrollbars
```

---

## 🔌 Complete Backend API Mapping

Base URL: `http://localhost:8000/api/v1`

| Category | Method | Endpoint | Description | UI Location |
|---|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | Register new user account | `/register` |
| **Auth** | `POST` | `/auth/login` | Authenticate & retrieve JWT access token | `/login` |
| **Auth** | `GET` | `/auth/me` | Fetch authenticated user profile | Navbar & session bootstrap |
| **Repos** | `GET` | `/repositories/` | List repositories owned by current user | Dashboard (`/`) |
| **Repos** | `POST` | `/repositories/` | Connect/register a new repository | "Connect Repository" Modal |
| **Repos** | `GET` | `/repositories/{id}` | Fetch repository details | `/repos/:id` |
| **Repos** | `POST` | `/repositories/{id}/index?repo_path=...` | Trigger AST chunking & vector embeddings | "Trigger Index" Modal & Detail Bar |
| **Repos** | `GET` | `/repositories/{id}/chunks` | Inspect all indexed AST code chunks | `/repos/:id` (AST Chunks Tab) |
| **Repos** | `POST` | `/repositories/{id}/ask` | Codebase Q&A with evidence grounding | `/repos/:id` (Codebase Q&A Tab) |
| **Reviews**| `POST` | `/repositories/{id}/review` | Submit git diff for security & quality audit | `/repos/:id` (PR Review Tab) |
| **Reviews**| `GET` | `/repositories/{id}/reviews` | Fetch history of PR reviews | `/repos/:id` (Review History) |
| **HITL** | `GET` | `/actions/pending` | List staged write actions requiring human review | `/actions` (Approval Center) |
| **HITL** | `POST` | `/actions/{id}/approve` | Approve staged patch with resolution comment | `/actions` (Approve Dialog) |
| **HITL** | `POST` | `/actions/{id}/reject` | Reject staged patch with rationale | `/actions` (Reject Dialog) |
| **Feedback**| `POST` | `/findings/{id}/feedback` | Submit `ACCURATE_FIX` vs `FALSE_POSITIVE` rating | Inline on each finding card |
| **Feedback**| `GET` | `/repositories/{id}/feedback_stats` | Fetch precision score & accuracy metrics | `/repos/:id` (Model Telemetry Tab) |

---

## 🧪 Local Testing Workflow

### Step 1: Create an Account & Log In
1. Navigate to `http://localhost:5173/register`.
2. Fill in **Full Name**, **Email**, and **Password** (minimum 6 characters).
3. Upon registration, you are redirected to `/login`. Sign in with your credentials.
4. Your JWT access token is stored in `localStorage` and automatically attached by Axios to all future requests.

### Step 2: Connect & Index a Repository
1. In the **Dashboard**, click **"Connect Repository"**.
2. Enter:
   - **Name:** `owner/my-repo`
   - **Clone URL:** `https://github.com/owner/my-repo`
   - **Default Branch:** `main`
3. Click **"Trigger Index"** on your repository card. Provide the local path where your code resides on the backend machine (e.g. `/path/to/folder` or `C:\repos\my-repo`).
4. Watch the status badge transition from `UNINDEXED` ➔ `INDEXING` ➔ `READY`.

### Step 3: Ask Questions with Codebase RAG
1. Click on the repository card to open the **Repository Assistant Workspace**.
2. On the **Codebase Q&A (RAG)** tab, ask questions like:
   - *"How does our authentication system work?"*
   - *"Where are the API routes defined?"*
3. The response will include interactive **grounding evidence badges** displaying the exact file path and line numbers (`L12-L35`). Click any citation to inspect the code evidence!

### Step 4: Audit a Pull Request Diff
1. Switch to the **PR Review & Security Audit** tab.
2. Click **"Load Sample Vulnerable Diff"** (or paste your own `git diff`).
3. Click **"Run PR Review & Security Audit"**.
4. The system displays:
   - **Risk Level** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
   - **Categorized Findings** (`SECURITY`, `BUG_RISK`, `MISSING_TESTS`, `ARCHITECTURE`)
   - **Suggested Remediation Diff** rendered in a unified diff viewer
   - **Feedback Widget**: Click **Thumbs Up** or **Thumbs Down** to rate finding accuracy and update model precision telemetry.

### Step 5: Human-in-the-Loop Approval Center
1. Navigate to **Human Approvals** (`/actions`) in the sidebar.
2. View all staged actions with status `PENDING_APPROVAL`.
3. Inspect the proposed diff payload.
4. Click **"Approve & Apply Patch"** or **"Reject Patch"**, enter your resolution note, and confirm. The patch is resolved with an audit trail!
