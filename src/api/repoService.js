import api from './axios'
import { ENDPOINTS } from './endpoints'

export const repoService={
  getRepositories:async ()=>{
    const response=await api.get(ENDPOINTS.REPOSITORIES.LIST)
    return response.data
  },
  createRepository:async(repoData)=>{
    const response=await api.post(ENDPOINTS.REPOSITORIES.CREATE,repoData)
    return response.data
  },
  getRepositoryById: async (repoId) => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.DETAIL(repoId));
    return response.data;
  },
   // POST /repositories/{repo_id}/index?repo_path=/path/to/folder
  indexRepository:async(repoId,repoPath)=>{
    const response=await api.get(ENDPOINTS.REPOSITORIES.INDEX(repoId),null,{params:{repo_path:repoPath}})
    return response.data
  },
  getRepositoryChunks: async (repoId) => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.CHUNKS(repoId));
    return response.data;
  },
   askRepository: async (repoId, query) => {
    const response = await api.post(ENDPOINTS.REPOSITORIES.ASK(repoId), { query });
    return response.data;
  }

}