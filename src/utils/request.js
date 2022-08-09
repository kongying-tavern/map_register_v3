import axios from 'axios'

console.log(process.env.VITE_API_BASE)
const service = axios.create({
  baseURL: process.env.VITE_API_BASE,
  timeout: 2000
})

service.interceptors.request.use(
  config => {
    config.validateStatus = function(status) {
      return status === 400 || (status >= 200 && status < 300)
    }
    // todo: append
    config.headers['Content-Type'] = 'application/json'

    return config
  },
  error => {
    // Do something with request error
    console.error(error) // for debug
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    // todo: response handler
    return response.data
  },
  error => {
    // todo: response handler
    return Promise.reject(error)
  }
)

export default service
