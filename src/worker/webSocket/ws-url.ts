/**
 * 裸 WebSocket 契约地址拼接
 *
 * Rust 后端契约：`GET /ws/{userId}`，浏览器端 token 只能通过 `?token=` 查询参数传递
 * （`new WebSocket(...)` 无法自定义请求头），路径 `userId` 必须与 token 主体一致。
 *
 * @see rust-genshin-cloud `docs/zh-Hans/designs/ws-frontend-contract.md` 路径 1
 */

/** 把 http(s) 地址转换为 ws(s) 地址 */
export const toWebSocketProtocol = (raw: string): string => {
  return raw.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')
}

export interface BuildSocketUrlOptions {
  /** 显式 WebSocket 基地址，通常来自 `VITE_WS_BASE`（形如 `wss://host/ws`） */
  wsBase?: string
  /** 回退方案：由 API 基地址推导（取协议与主机，路径固定为 `/ws`） */
  apiBase?: string
  /** 相对地址的解析基准；worker 中传 `globalThis.location.origin` */
  origin?: string
  /** 登录用户 id，必须与 token 主体一致 */
  userId: string | number
  /** OAuth access token */
  token: string
}

/** 获取相对地址的解析基准（允许在单测 / Node 环境传入） */
const resolveOrigin = (origin?: string) => {
  if (origin)
    return origin
  if (typeof location !== 'undefined' && location.origin)
    return location.origin
  return 'http://localhost'
}

/**
 * 拼接裸 WebSocket 契约地址：`{wsBase}/{userId}?token={accessToken}`
 *
 * 优先使用显式 `wsBase`（`VITE_WS_BASE` 已带 `/ws` 路径，开发环境走直连，绕开 Vite 代理）；
 * 未配置时按 `VITE_API_BASE` 的协议与主机推导出 `ws(s)://host` 再拼 `/ws`。
 */
export const buildSocketUrl = (options: BuildSocketUrlOptions): string => {
  const { wsBase, apiBase, userId, token } = options
  const origin = resolveOrigin(options.origin)
  const explicitBase = wsBase?.trim()
  const apiBaseURL = apiBase?.trim()

  let base: URL
  if (explicitBase) {
    base = new URL(toWebSocketProtocol(explicitBase), origin)
  }
  else if (apiBaseURL) {
    const apiURL = new URL(apiBaseURL, origin)
    base = new URL(`${toWebSocketProtocol(apiURL.origin)}/ws`)
  }
  else {
    throw new Error('无法确定 WebSocket 地址：VITE_WS_BASE 与 VITE_API_BASE 均为空')
  }

  if (base.protocol !== 'ws:' && base.protocol !== 'wss:')
    throw new Error(`不支持的 WebSocket 协议：${base.protocol}`)

  // 丢弃基地址里可能存在的查询参数与哈希，只保留路径前缀
  base.search = ''
  base.hash = ''
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/${encodeURIComponent(String(userId))}`
  base.searchParams.set('token', token)
  return base.toString()
}
