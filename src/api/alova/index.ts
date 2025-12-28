import { createAlova } from 'alova'
import { createClientTokenAuthentication } from 'alova/client'
import fetchAdapter from 'alova/fetch'
import VueHook from 'alova/vue'
import { useUserStore } from '@/stores'
import { Logger } from '@/utils'
import { Zip } from '@/utils/Zip'
import compiled from '../protobuf/compiled'
import { createApis, withConfigType } from './createApis'

const logger = new Logger('Alova')

const { onAuthRequired } = createClientTokenAuthentication({
  refreshToken: {
    handler: async () => {
      const { refreshToken } = useUserStore()
      return refreshToken()
    },
    isExpired: () => {
      const { isTokenValid } = useUserStore()
      return !isTokenValid()
    },
  },
})

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 300 * 1000,
  statesHook: VueHook,
  cacheFor: null,
  requestAdapter: fetchAdapter(),

  beforeRequest: onAuthRequired((method) => {
    const { headers } = method.config
    const { auth } = useUserStore()
    const { accessToken, tokenType = 'bearer' } = auth
    // 如果 token 不为空且不存在自定义 token，则为所有请求附加上 token
    if (accessToken && !headers.Authorization) {
      headers.Authorization = `${tokenType.replace(/^./, c => c.toUpperCase())} ${accessToken}`
    }
  }),

  responded: async (response, method) => {
    const { status, statusText } = response

    // 验证状态码：只接受 200-399 的状态码
    if (status < 200 || status >= 400) {
      logger.error('Response Error:', { response, method })

      // 处理 401/403 错误，调用 logout
      if (status === 401 || status === 403)
        useUserStore().logout()

      throw new Error(statusText)
    }

    // 解析响应数据
    const contentType = response.headers.get('Content-Type')
    if (contentType !== 'application/json')
      return response

    if (method.config.meta?.raw)
      return response

    const data = (await response.json())

    if (data.error)
      throw new Error(data.message || data.error_description || data.errorData || statusText)

    return data as unknown
  },
})

export const $$userConfigMap = withConfigType({
  'marker_doc.listMarkersByBinary': {
    meta: { raw: true },
    transform: async (res) => {
      const buffer = await (res as unknown as Response).arrayBuffer()
      const decompressedData = await Zip.decompress(new Uint8Array(buffer))
      const data = compiled.protobuf.MarkerVoList.decode(decompressedData)
      return data
    },
  },
  'marker_doc.listMarkerDiffSnapshotByBinary': {
    meta: { raw: true },
    transform: async (res) => {
      const buffer = await (res as unknown as Response).arrayBuffer()
      const data = compiled.protobuf.MarkerDiffSnapshotVoList.decode(new Uint8Array(buffer))
      return data
    },
  },
})

const Apis = createApis(alovaInstance, $$userConfigMap)

export default Apis
