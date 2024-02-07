import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 此处后端没有提供注释 GET /.well-known/jwks.json */
export async function getJwk(options?: AxiosRequestConfig) {
  return request<Record<string, unknown>>('/.well-known/jwks.json', {
    method: 'GET',
    ...(options || {}),
  })
}
