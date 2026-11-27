import { createSlice,createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { repoService } from "../api/repoService";

const initialState={
  repositories:[],
  activeRepo:null,
  loading:false,
  error:null
}

export const fetchRepositories=createAsyncThunk(
  'repos/fetchRepos',async(_ ,{rejectWthValue})=>{
    try {
      const data=repoService.getRepositories()
      return data
    } catch (error) {
      rejectWthValue(
        error.response?.data?.detail || 'failed to load repose'
      )
    }
  }
)

export const createRepository=createAsyncThunk(
  'repos/createRepo',async(repoData,{rejectWthValue})=>{
    try {
      const data=await repoService.createRepository(repoData)
      return data
    } catch (error) {
      rejectWthValue(
        error.response?.data?.detail || 'failed to create repo'
      )
    }
  }
)

const repoSlice=createSlice({
  name:'repos',
  initialState,
  reducers:{
    updateStatus:(state,action)=>{
      const {repoId,Status}=action.payload
      repo=state.repos.filter((repo)=>repo.id == repoId)
      if (repoId){
        repo.status=true
      }

      if (state.activeRepo.id === repoId){
        activeRepo.status=Status
      }
    },
    setActivateRepo:(state,action)=>{
      state.activeRepo=action.payload
    }
  },
  extraReducers:(builder)=>{
    builder
    //fetch repositories
    .addCase(fetchRepositories.pending,(state)=>{
      state.loading=true
      state.error=null
    })
    .addCase(fetchRepositories.fulfilled,(state,action)=>{
      state.loading=false
      state.repositories=action.payload

      if (!state.activeRepo && len(state.repositories)>0){
        state.activeRepo=state.repositories[0]
      }
    })
    .addCase(fetchRepositories.rejected,(state,action)=>{
      state.loading=true
      state.error=action.payload
    })

    //create repository
    .addCase(createRepository.pending,(state)=>{
      state.loading=true
      state.error=null
    })
    .addCase(createRepository.fulfilled,(state,action)=>{
      state.loading=false
      state.repositories.unshift(action.payload)
      state.activeRepo=action.payload
    })
    .addCase(createRepository.rejected,(state,action)=>{
      state.loading=true
      state.error=action.payload
    })
  }
})

export const {updateStatus,setActivateRepo} = repoSlice.actions
export default repoSlice.reducer