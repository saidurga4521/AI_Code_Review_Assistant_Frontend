import axios from 'axios';

//create the axios instance
const api=axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers:{
    'Content-Type':'application/json'
  }
})

//Request interceptor
api.interceptors.request.use(
  (config)=>{
    const token =localStorage.getItem('token')
    if(token){
      config.headers.Authorization =`Bearer ${token}`
    }
    return config
  },
  (error)=>{
    return Promise.reject(error)
  }
)

//Response :It handles 401 errors
api.interceptors.response.use(
  (response)=>response,
  (error)=>{
    if (error.response && error.response.status === 401){
      // clear invalid token
      localStorage.removeItem('token');
      // If not already on auth pages ,redirect to login
      if (!window.location.pathname.startsWith('/login') && 
      !window.location.pathname.startsWith('/register')){
        window.location.pathname='/login';
      }
    }
    return Promise.reject(error)
  }
)

export default api