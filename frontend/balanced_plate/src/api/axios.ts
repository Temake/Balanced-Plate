import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"


declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string
  }
  interface ST{
    detail?:string
  }
interface DataType{
    data?:ST
    status?:number
    detail?:string

}
interface DjangoError{
   readonly response: DataType,


}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        console.log("Current token:", token) 
        
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
            console.log("Request URL:", config.url)
            console.log("Request Method:", config.method)
            console.log("Request Headers:", config.headers)
        } else {
            console.log("No token found in localStorage")
        }
        return config
    },
    (error: Error) => {
        console.error("Request interceptor error:", error)
        return Promise.reject(error)
    }
)


api.interceptors.response.use(
    (response) => {
        console.log("Response success:", response.config.url)
        return response
    },
    async (error) => {
        const originalRequest = error.config
        console.error("Response error status:", error.response?.status)
        console.error("Response error data:", error.response?.data?.detail)

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            const refreshToken = localStorage.getItem(REFRESH_TOKEN)
            if (refreshToken) {
                try {
                    const response = await api.post('/auth/token/refresh/', {
                        refresh: refreshToken
                    })
                    
                    if (response.data?.access) {
                        localStorage.setItem(ACCESS_TOKEN, response.data.access)
                        originalRequest.headers.Authorization = `Bearer ${response.data.access}`
                        return api(originalRequest)
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError)
                }
            }
            
            // If refresh fails, clear tokens and redirect to login
            console.error("Authentication error - clearing token")
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            window.location.href = '/login'
        }
        
        return Promise.reject(error)
    }
)

export default api
