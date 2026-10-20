import { vi } from 'vitest'

/** 被捕获的一次请求 */
export interface CapturedRequest {
  url: string
  init: RequestInit
}

/**
 * 构造 JSON 响应（alova 的 responded 只会对 `application/json` 做解析）
 */
export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** 大小写不敏感地读取请求头（alova 不会统一头名大小写） */
export const headerOf = (init: RequestInit, name: string) => {
  const headers = (init.headers ?? {}) as Record<string, string>
  const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())
  return key ? headers[key] : undefined
}

const toUrl = (input: string | URL | Request) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

/**
 * 拦截全局 fetch，用于断言「请求是怎么发出去的」。
 *
 * 契约测试只关心请求构造与响应处理，不应产生真实网络流量；
 * 这里刻意不使用 `vi.fn`，以免 `restoreMocks` 把实现一并还原掉。
 */
export const createHttpMock = () => {
  const requests: CapturedRequest[] = []
  const state = {
    responder: (): Response => jsonResponse({}),
  }

  const fetchMock = async (input: string | URL | Request, init: RequestInit = {}) => {
    const request: CapturedRequest = { url: toUrl(input), init }
    requests.push(request)
    return state.responder()
  }

  return {
    /** 已捕获的请求，按发出顺序排列 */
    requests,
    /** 指定响应（可基于请求内容动态构造） */
    get respond() {
      return state.responder
    },
    set respond(factory: () => Response) {
      state.responder = factory
    },
    /** 仅重置响应工厂，保留已捕获的请求 */
    resetResponder: () => {
      state.responder = () => jsonResponse({})
    },
    /** 安装到全局 fetch */
    install: () => vi.stubGlobal('fetch', fetchMock),
  }
}
