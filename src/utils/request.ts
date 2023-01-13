// TODO: 迁移
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { upperFirst } from 'lodash'
import { useUserStore } from '@/stores'

const debug = import.meta.env.DEV

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 5000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    config.validateStatus = (status) => {
      return status === 400 || (status >= 200 && status < 300)
    }

    // todo: append
    if (!config.headers)
      config.headers = {}

    const userStore = useUserStore()
    if (userStore.auth.token_type && userStore.auth.access_token)
      config.headers.Authorization = `${upperFirst(userStore.auth.token_type)} ${userStore.auth.access_token}`
    config.headers['Content-Type'] = 'application/json'

    return config
  },
  (error) => {
    // Do something with request error
    debug && console.error(error)
    Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.error)
      return Promise.reject(new Error(data.message))
    return data
  },
  (error) => {
    // todo: response handler
    debug && console.error(error)
    return Promise.reject(error)
  },
)

const request = async <T>(url: string, options: AxiosRequestConfig) => {
  return (await axiosInstance(url, options)) as T
}

export { axiosInstance, request }
