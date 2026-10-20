import type { CapturedRequest } from '../_support/httpMock'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpMock, headerOf, jsonResponse } from '../_support/httpMock'

/**
 * 契约测试：OAuth 请求构造
 *
 * 只验证「请求长什么样」，不依赖真实后端。
 *
 * 两个关键点：
 * 1. `basicAuth` 在模块加载时求值，因此必须先用 `vi.stubEnv` 固定环境变量，
 *    再 `resetModules` 后动态导入，才能断言到确定的认证头。
 * 2. OAuth 模块只在 401/403 时访问用户仓库，这里直接把 `@/stores` 换掉，
 *    避免连带编译 `@/hooks`、`@/components` 整个组件树（会拖垮 hook 超时）。
 */

const mocks = vi.hoisted(() => {
  const store = {
    auth: {} as Record<string, unknown>,
    /** 与真实 store 一致：登出即清空登录态 */
    logout() {
      store.auth = {}
    },
  }
  return { store }
})

vi.mock('@/stores', () => ({ useUserStore: () => mocks.store }))

const CLIENT_USERNAME = 'unit-client'
const CLIENT_PASSWORD = 'unit-secret'

const http = createHttpMock()

const buildBasic = () => `Basic ${btoa(`${CLIENT_USERNAME}:${CLIENT_PASSWORD}`)}`

describe('oauth 请求构造', () => {
  let oauth: typeof import('@/api/oauth').default

  beforeEach(async () => {
    http.requests.length = 0
    http.respond = () => jsonResponse({ access_token: 'at' })
    http.install()

    vi.resetModules()
    vi.stubEnv('VITE_API_BASE', 'https://api.example.test')
    vi.stubEnv('VITE_API_AUTH_USERNAME', CLIENT_USERNAME)
    vi.stubEnv('VITE_API_AUTH_PASSWORD', CLIENT_PASSWORD)

    oauth = (await import('@/api/oauth')).default
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  const lastRequest = (): CapturedRequest => {
    expect(http.requests).toHaveLength(1)
    return http.requests[0]
  }

  it('login 以 FormData 提交账号密码', async () => {
    await oauth.oauth.token({ grant_type: 'password', username: 'someone', password: 'pwd' })

    const { url, init } = lastRequest()
    expect(init.method).toBe('POST')
    expect(new URL(url).pathname).toBe('/oauth/token')
    // 密码模式不带任何 query 参数
    expect(new URL(url).search).toBe('')

    const body = init.body as FormData
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('grant_type')).toBe('password')
    expect(body.get('username')).toBe('someone')
    expect(body.get('password')).toBe('pwd')
  })

  it('login 携带 OAuth 客户端 Basic 认证头', async () => {
    await oauth.oauth.token({ grant_type: 'password', username: 'someone', password: 'pwd' })

    expect(headerOf(lastRequest().init, 'Authorization')).toBe(buildBasic())
  })

  it('refresh 以 query 传参而非表单体', async () => {
    await oauth.oauth.refresh({ grant_type: 'refresh_token', refresh_token: 'rt-1' })

    const { url, init } = lastRequest()
    expect(init.method).toBe('POST')
    const parsed = new URL(url)
    expect(parsed.pathname).toBe('/oauth/token')
    expect(parsed.searchParams.get('grant_type')).toBe('refresh_token')
    expect(parsed.searchParams.get('refresh_token')).toBe('rt-1')
  })

  it('refresh 声明 JSON 内容类型并携带 Basic 认证头', async () => {
    await oauth.oauth.refresh({ grant_type: 'refresh_token', refresh_token: 'rt-1' })

    const { init } = lastRequest()
    expect(headerOf(init, 'Content-Type')).toBe('application/json;charset=UTF-8')
    expect(headerOf(init, 'Authorization')).toBe(buildBasic())
  })
})
