## Centralized Axios Client

**What this file does**

- Creates a centralized Axios client for making API requests.
- Avoids writing `axios.get('http://localhost:8000/...')` directly inside individual UI components.
- Makes API configuration and token handling easier to maintain.

**Main features**

1. **Configurable Base URL**
   - Uses environment variables to configure the backend API URL.
   - If the API endpoint changes, we only need to update the environment variable.

2. **Request Interceptor**
   - Automatically gets the JWT token from `localStorage`.
   - Adds the token to the `Authorization` header of outgoing requests.
   - Uses the format: `Bearer <token>`.
   - Avoids manually adding the token to every API request.

3. **Response Interceptor**
   - Checks API responses for errors.
   - If the server returns `401 Unauthorized`, it clears the stored session.
   - Helps handle expired or invalid JWT tokens.

**Why centralized Axios client?**

- Avoids duplicate API configuration.
- Avoids repeating token-handling logic.
- Makes API requests consistent across the application.
- Easier to maintain when backend URLs or authentication logic change.


## API & Services Architecture

### 1. `endpoints.js` (Single Source of Truth)
- Centralizes all backend route paths in one dictionary.
- Uses dynamic route-builder functions for parameterized URLs.
- Example: `(repoId) => /repositories/${repoId}/index`.
- If an API route changes, we only need to update it in one place.

### 2. `client.js` (HTTP Core)
- Creates a pre-configured Axios instance using `VITE_API_BASE_URL`.
- **Request Interceptor:** Automatically injects `Authorization: Bearer <token>` from `localStorage`.
- **Response Interceptor:** Catches `401 Unauthorized`, clears stale tokens, and redirects to `/login`.

### 3. `authService.js` (Identity & Session)
- `register()`: Creates a new user account.
- `login()`: Authenticates credentials and retrieves the JWT access token.
- `getCurrentUser()`: Fetches the authenticated user's profile using `/auth/me`.

### 4. `repoService.js` (Repositories & RAG)
- `getRepositories()`: Lists connected repositories.
- `createRepository()`: Connects a new repository.
- `indexRepository()`: Triggers background AST parsing and vector embeddings.
- `getRepositoryChunks()`: Inspects indexed code chunks and line ranges.
- `askRepository()`: Submits codebase RAG queries and receives answers with file citations.

### 5. `reviewService.js` (PR Reviews & Audits)
- `submitReview()`: Posts Git diffs for automated security, bug, and test analysis.
- `getReviewsByRepo()`: Retrieves review history for a repository.
- `getReviewById()`: Retrieves a specific review and its categorized findings.

### 6. `actionService.js` (Human-in-the-Loop Patch Approvals)
- `getPendingActions()`: Fetches staged code patches waiting for human approval.
- `approveAction()`: Approves a proposed code change.
- `rejectAction()`: Rejects a proposed code change.
- Submits audit resolution with developer comments.

### 7. `feedbackService.js` (Developer Feedback Loop)
- `submitFeedback()`: Submits thumbs-up or thumbs-down feedback on findings.
- `ACCURATE_FIX`: Indicates that the finding or suggested fix is accurate.
- `FALSE_POSITIVE`: Indicates that the finding is incorrect or not a real issue.
- `getFeedbackStats()`: Fetches model precision percentage and accuracy metrics.


# Redux State Management

### 1. `authSlice.js` (Authentication State)
- Manages the JWT token.
- Stores the current logged-in user profile.
- Tracks authentication status using `isAuthenticated`.
- Manages login, registration, fetching the user profile (`/auth/me`), and logout.
- Initializes the token directly from `localStorage` so refreshing the browser doesn't log the user out.

### 2. `repoSlice.js` (Repository State)
- Manages the list of connected repositories.
- Stores the `activeRepo` (the repository currently selected by the developer).
- Ensures Codebase Q&A, PR Reviews, and Feedback use the correct repository ID.
- Manages repository indexing status transitions:
  - `UNINDEXED` → Repository has not been indexed.
  - `INDEXING` → Repository indexing is in progress.
  - `READY` → Repository indexing is complete.

  