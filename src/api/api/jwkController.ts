import { request } from '@/utils'

/** 此处后端没有提供注释 GET /.well-known/jwks.json */
export async function getJwk(options?: { [key: string]: unknown }) {
  return request<Record<string, unknown>>('/.well-known/jwks.json', {
    method: 'GET',
    ...(options || {}),
  })
}
