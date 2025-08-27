import axios from "axios"
import { ACCESS_TOKEN } from "./constants"


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
        console.error("Response error status:", error.response?.status)
        console.error("Response error data:", error.response?.data?.detail)
        console.error("Full error object:", error)
        console.error("djj:", error.response.message)

        if (error.response?.status === 403) {
            
            console.error("Authentication error - clearing token")
            localStorage.removeItem(ACCESS_TOKEN)
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
