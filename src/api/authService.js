import api from './client'
import { ENDPOINTS } from './endpoints'

export const authService={
  register:async (userData)=>{
    const response=await api.post(ENDPOINTS.AUTH.REGISTER,userData)
    return response.data
  },
  login:async (credentials)=>{
    const response=await api.post(ENDPOINTS.AUTH.LOGIN,credentials)
    return response.data
  },
  getCurrentUser:async()=>{
    const response=await api.get(ENDPOINTS.AUTH.ME)
    return response.data
  }
}