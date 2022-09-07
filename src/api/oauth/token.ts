import { request } from '@/utils'

/**
 * 登录接口
 * @todo
 * 1. 类型不完善
 */
export function token(data: Record<string, any>) {
  const form = new FormData()
  for (const key in data) {
    const value = data[key]
    form.append(key, value)
  }

  return request({
    url: '/oauth/token',
    method: 'post',
    data: form,
    auth: {
      username: 'client',
      password: 'secret',
    },
  })
}

export default {
  token,
}
