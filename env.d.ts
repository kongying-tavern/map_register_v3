/// <reference types="vite/client" />

/** 拓展 ENV 环境变量对象的类型 */
interface ImportMetaEnv {
  /** 标题 */
  readonly VITE_TITLE: string

  /**
   * 接口地址
   * @default /dev-api
   */
  readonly VITE_API_BASE: string

  /**
   * 开发模式下跨域代理
   * @default https://test.yuanshen.site
   */
  readonly VITE_API_PROXY_TARGET: string

  /**
   * 路由创建历史记录的模式
   */
  VITE_ROUTER_MODE: 'history' | 'hash' | 'memory'

  /**
   * token 有效期小于多长时刷新（秒）
   * @default 600
   */
  readonly VITE_TOKEN_REFRESH_REST_TIME: number

  /**
   * 开发模式下自动填充用户名
   * @default ''
   */
  readonly VITE_AUTO_COMPLETE_USERNAME: string

  /**
   * 开发模式下自动填充密码
   * @default ''
   */
  readonly VITE_AUTO_COMPLETE_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
