/* eslint-disable ts/no-explicit-any */
// TODO 迁移至 fetch
import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { upperFirst } from 'lodash'
import { useUserStore } from '@/stores'
import { Logger } from '@/utils'

const logger = new Logger('Axios')

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 60000,
  validateStatus: status => status >= 200 && status < 300,
})

/** 请求拦截 */
const onRequestFulfilled = <T>(config: InternalAxiosRequestConfig<T>) => {
  const { auth } = useUserStore()

  // 如果 token 不为空且不存在自定义 token，则为所有请求附加上 token
  if (auth.accessToken && !config.headers.hasAuthorization())
    config.headers.setAuthorization(`${upperFirst(auth.tokenType)} ${auth.accessToken}`)

  return config
}

instance.interceptors.request.use(onRequestFulfilled, (error) => {
  logger.error('Request Error:', error)
  return Promise.reject(error)
})

/** 响应拦截 */
const onResponseFulfilled = (response: AxiosResponse<any, any>) => {
  const { data } = response
  if (data.error)
    return Promise.reject(new Error(data.message || data.error_description || data.errorData))
  return data
}

instance.interceptors.response.use(onResponseFulfilled, (error: AxiosError) => {
  logger.error('Response Error:', error)
  const { status, data } = error.response ?? {}
  switch (status) {
    case 401:
    case 403:
      useUserStore().logout()
      break
    default:
      break
  }
  if (!error.message && data instanceof Object && 'error_description' in data)
    error.message = `${data.error_description ?? 'Unknown Error'}`

  return Promise.reject(error)
})

const request = async <T>(url: string, options: AxiosRequestConfig) => {
  return (await instance(url, options)) as T
}

export { instance, request }
