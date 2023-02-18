import { request } from '@/utils';

/** 此处后端没有提供注释 GET /.well-known/jwks.json */
export async function getJwk(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/.well-known/jwks.json', {
    method: 'GET',
    ...(options || {}),
  });
}
