import request from '@/utils/request.js'

export function token(data) {
  let form = new FormData();
  for(let key in data) {
    let value = data[key]
    form.append(key, value)
  }

  return request({
    url: '/oauth/token',
    method: 'post',
    data: form,
    auth: {
      username: 'client',
      password: 'secret'
    }
  })
}

export default {
  token
}
