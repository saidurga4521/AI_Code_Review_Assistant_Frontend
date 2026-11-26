export const ENDPOINTS = {
  // 1. Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },

  // 2. Repositories & RAG
  REPOSITORIES: {
    LIST: '/repositories/',
    CREATE: '/repositories/',
    DETAIL: (repoId) => `/repositories/${repoId}`,
    INDEX: (repoId) => `/repositories/${repoId}/index`,
    CHUNKS: (repoId) => `/repositories/${repoId}/chunks`,
    ASK: (repoId) => `/repositories/${repoId}/ask`,
    FEEDBACK_STATS: (repoId) => `/repositories/${repoId}/feedback_stats`,
  },

  // 3. PR Reviews & Audits
  REVIEWS: {
    CREATE_REVIEW: (repoId) => `/repositories/${repoId}/review`,
    LIST_BY_REPO: (repoId) => `/repositories/${repoId}/reviews`,
    DETAIL: (reviewId) => `/reviews/${reviewId}`,
  },

  // 4. Human-in-the-Loop Actions
  ACTIONS: {
    PENDING: '/actions/pending',
    APPROVE: (actionId) => `/actions/${actionId}/approve`,
    REJECT: (actionId) => `/actions/${actionId}/reject`,
  },

  // 5. Developer Feedback
  FEEDBACK: {
    SUBMIT: (findingId) => `/findings/${findingId}/feedback`,
  },
};