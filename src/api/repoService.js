import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const repoService = {
  // GET /repositories/
  getRepositories: async () => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.LIST);
    return response.data;
  },

  // POST /repositories/
  createRepository: async (repoData) => {
    const response = await api.post(ENDPOINTS.REPOSITORIES.CREATE, repoData);
    return response.data;
  },

  // GET /repositories/{repo_id}
  getRepositoryById: async (repoId) => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.DETAIL(repoId));
    return response.data;
  },

  // POST /repositories/{repo_id}/index?repo_path=/path/to/folder
  indexRepository: async (repoId, repoPath) => {
    const response = await api.post(
      ENDPOINTS.REPOSITORIES.INDEX(repoId),
      null,
      { params: { repo_path: repoPath } }
    );
    return response.data;
  },

  // GET /repositories/{repo_id}/chunks
  getRepositoryChunks: async (repoId) => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.CHUNKS(repoId));
    return response.data;
  },

  // POST /repositories/{repo_id}/ask
  askRepository: async (repoId, query) => {
    const response = await api.post(ENDPOINTS.REPOSITORIES.ASK(repoId), { query });
    return response.data;
  },
};
