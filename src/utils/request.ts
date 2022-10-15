import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { getUserToken } from './auth'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 2000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    config.validateStatus = (status) => {
      return status === 400 || (status >= 200 && status < 300)
    }

    // todo: append
    if (!config.headers)
      config.headers = {}

    const token = getUserToken()
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'

    return config
  },
  (error) => {
    // Do something with request error
    console.error(error) // for debug
    Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    // todo: response handler
    return response.data
  },
  (error) => {
    // todo: response handler
    return Promise.reject(error)
  },
)

const request = async <T>(url: string, options: AxiosRequestConfig<any>) => {
  return (await axiosInstance(url, options)) as T
}

export { axiosInstance, request }
