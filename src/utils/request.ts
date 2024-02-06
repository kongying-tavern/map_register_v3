// TODO: 迁移
import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { upperFirst } from 'lodash'
import { useUserAuthStore } from '@/stores'
import { Logger } from '@/utils'

const logger = new Logger('[axios]')

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 60000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    config.validateStatus = (status) => {
      return status === 400 || (status >= 200 && status < 300)
    }

    const userAuthStore = useUserAuthStore()

    const hasToken = config.headers.Authorization ?? config.headers.authorization

    const { tokenType, accessToken } = userAuthStore.auth

    // 如果存在自定义的凭证信息，则不对其进行覆盖
    if (!hasToken && tokenType && accessToken)
      config.headers.Authorization = `${upperFirst(tokenType)} ${userAuthStore.auth.accessToken}`

    return config
  },
  (error) => {
    logger.error('request', error.request)
    Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.error)
      return Promise.reject(new Error(data.error_description ?? data.message))
    return data
  },
  (error) => {
    if (error instanceof AxiosError) {
      logger.error('response', error.response)
      if (error.response?.status === 401)
        useUserAuthStore().logout()
    }
    return Promise.reject(error)
  },
)

const request = async <T>(url: string, options: AxiosRequestConfig) => {
  return (await axiosInstance(url, options)) as T
}

export { axiosInstance, request }
