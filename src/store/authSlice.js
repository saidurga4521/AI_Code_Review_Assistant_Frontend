import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../api/authService";

// pull intial token dafely from localstorage
const token =localStorage.getItem('token');
const intialState={
  user:null,
  token:token || null,
  isAuthenticated:false,
  error:null
}

//1.Async Thunk:Reegister User
export const userRegister=createAsyncThunk(
  'auth/register',
  async(userData,{rejectWithValue})=>{
    try {
      const data=await authService.register(userData)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Registration failed.Please check your details'
      )
    }
  })

  //2.Login User Async Thunk
export const loginUser=createAsyncThunk(
  'auth/login',
  async(credentials,{dispatch,rejectWithValue})=>{
    try {
      const data=await authService.login(credentials)
      localStorage.setItem('token',data.access_token)
      dispatch(fetchCurrentUser());
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Login Failed.Please check your details'
      )
    }
  }
)

//3.fetchCurrentUser async thunk
export const fetchCurrentUser=createAsyncThunk(
  'auth/fetchCurrentUser',
  async(_,{rejectWithValue})=>{
    try {
       const user=await authService.getCurrentUser()
       return user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch user profile'
      )
    }
  }
)

const authSlice=createSlice({
  name:'auth',
  intialState,
  //reducers create the actions itself
  reducers:{
     logout:(state)=>{
        localStorage.removeItem('token')
        state.user=null
        state.token=null
        state.isAuthenticated=false
        state.loading=false
        state.error=null
     },
     clearError:(state)=>{
      state.error=null
     }
  },
  //In extra reducers actions comes from somewhere else
  extraReducers:(builder)=>{
    builder
    //register
    .addCase(userRegister.pending,(state)=>{
      state.loading = true
      state.error=null
    })
    .addCase(userRegister.fulfilled,(state)=>{
      state.loading=false
    })
    .addCase(userRegister.rejected,(state,action)=>{
      state.loading=true
      state.error=action.payload
    })

    //Login
    .addCase(loginUser.pending,(state)=>{
      state.loading=true
      state.error=null
    })
    .addCase(loginUser.fulfilled,(state,action)=>{
      state.loading=false
      state.access_token=action.access_token,
      state.isAuthenticated=true
    })
    .addCase(loginUser.rejected,(state,action)=>{
      state.loading=true
      state.error=action.payload
    })

    //fetch current user
    .addCase(fetchCurrentUser.rejected,(state)=>{
      state.loading=true
    })
    .addCase(fetchCurrentUser.fulfilled,(state,action)=>{
      state.loading=false
      state.user=action.payload
    })
    .addCase(fetchCurrentUser.rejected,(state,action)=>{
      state.loading=true
      state.isAuthenticated=false
      state.access_token=null
      state.error=action.payload
      localStorage.removeItem('token')

    })
  }
})

export const {logout,clearError}=authSlice.actions
export default authSlice.reducer



