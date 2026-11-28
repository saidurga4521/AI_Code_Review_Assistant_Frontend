import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { repoService } from '../api/repoService';

const initialState = {
  repositories: [],
  activeRepo: null,
  loading: false,
  error: null,
};

// 1. Fetch All Repositories
export const fetchRepositories = createAsyncThunk(
  'repos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await repoService.getRepositories();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to load repositories.'
      );
    }
  }
);

// 2. Create/Connect Repository
export const createRepository = createAsyncThunk(
  'repos/create',
  async (repoData, { rejectWithValue }) => {
    try {
      const data = await repoService.createRepository(repoData);
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);
      return rejectWithValue(
        detail || error.message || 'Failed to connect repository.'
      );
    }
  }
);

// 3. Index Repository
export const triggerIndexRepository = createAsyncThunk(
  'repos/index',
  async ({ repoId, repoPath }, { rejectWithValue }) => {
    try {
      const data = await repoService.indexRepository(repoId, repoPath);
      return { repoId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to trigger indexing.'
      );
    }
  }
);

const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {
    setActiveRepo: (state, action) => {
      state.activeRepo = action.payload;
    },
    updateRepoStatus: (state, action) => {
      const { repoId, status } = action.payload;
      const repo = state.repositories.find((r) => r.id === repoId);
      if (repo) {
        repo.status = status;
      }
      if (state.activeRepo && state.activeRepo.id === repoId) {
        state.activeRepo.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Repositories
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload || [];
        if (!state.activeRepo && action.payload && action.payload.length > 0) {
          state.activeRepo = action.payload[0];
        }
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Repository
      .addCase(createRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories.unshift(action.payload);
        state.activeRepo = action.payload;
      })
      .addCase(createRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Index Repository
      .addCase(triggerIndexRepository.pending, (state, action) => {
        const repoId = action.meta.arg.repoId;
        const repo = state.repositories.find((r) => r.id === repoId);
        if (repo) repo.status = 'INDEXING';
        if (state.activeRepo && state.activeRepo.id === repoId) {
          state.activeRepo.status = 'INDEXING';
        }
      })
      .addCase(triggerIndexRepository.fulfilled, (state, action) => {
        const { repoId } = action.payload;
        const repo = state.repositories.find((r) => r.id === repoId);
        if (repo) repo.status = 'READY';
        if (state.activeRepo && state.activeRepo.id === repoId) {
          state.activeRepo.status = 'READY';
        }
      })
      .addCase(triggerIndexRepository.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setActiveRepo, updateRepoStatus } = repoSlice.actions;
export default repoSlice.reducer;
