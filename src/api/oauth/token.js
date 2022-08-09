import request from '@/utils/request.js'

export function token(data) {
  return request({
    url: '/oauth/token',
    method: 'post',
    data
  })
}

export default {
  token
}
