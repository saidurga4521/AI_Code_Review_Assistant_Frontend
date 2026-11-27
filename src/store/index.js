import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import repoReducer from './repoSlice'

export const store=configureStore({
  reducer:{
    auth:authReducer,
    repo:repoReducer
  }
})