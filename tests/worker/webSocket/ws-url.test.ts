import { describe, expect, it } from 'vitest'
import { buildSocketUrl, toWebSocketProtocol } from '@/worker/webSocket/ws-url'

/**
 * 单元测试：裸 WebSocket 契约地址（rust ws-frontend-contract 路径 1）
 *
 * 浏览器 `new WebSocket(...)` 无法自定义请求头，token 只能走 `?token=`；
 * 路径 `{userId}` 必须与 token 主体一致，由调用方保证。
 */

describe('buildSocketUrl', () => {
  it('拼接 VITE_WS_BASE 与 userId、token', () => {
    expect(buildSocketUrl({
      wsBase: 'wss://genshin-dev.momincong.com/ws',
      userId: 42,
      token: 'AT-1',
    })).toBe('wss://genshin-dev.momincong.com/ws/42?token=AT-1')
  })

  it('userId 追加在基地址路径之后，token 做 URL 编码', () => {
    const url = new URL(buildSocketUrl({
      wsBase: 'wss://example.test/ws',
      userId: '12',
      token: 'a b&c=/+',
    }))
    expect(url.protocol).toBe('wss:')
    expect(url.pathname).toBe('/ws/12')
    expect(url.searchParams.get('token')).toBe('a b&c=/+')
  })

  it('http 基地址自动转换为 ws', () => {
    expect(buildSocketUrl({
      wsBase: 'http://127.0.0.1:9000/ws',
      userId: 1,
      token: 't',
    })).toBe('ws://127.0.0.1:9000/ws/1?token=t')
  })

  it('未配置 VITE_WS_BASE 时由 VITE_API_BASE 推导 /ws 路径', () => {
    expect(buildSocketUrl({
      apiBase: 'https://api.example.test',
      userId: 7,
      token: 'at',
    })).toBe('wss://api.example.test/ws/7?token=at')
  })

  it('相对 API 基地址按 origin 解析为 ws', () => {
    expect(buildSocketUrl({
      apiBase: '/api-dev',
      origin: 'http://localhost:9000',
      userId: 7,
      token: 'at',
    })).toBe('ws://localhost:9000/ws/7?token=at')
  })

  it('两个基地址都缺失时抛出明确错误', () => {
    expect(() => buildSocketUrl({ userId: 1, token: 't' }))
      .toThrow('无法确定 WebSocket 地址')
  })

  it('只替换协议，不重复包装路径', () => {
    expect(toWebSocketProtocol('https://a.test/ws')).toBe('wss://a.test/ws')
    expect(toWebSocketProtocol('http://a.test/ws')).toBe('ws://a.test/ws')
    expect(toWebSocketProtocol('wss://a.test/ws')).toBe('wss://a.test/ws')
  })
})
