/// <reference types="vite/client" />

/** 拓展 ENV 环境变量对象的类型 */
interface ImportMetaEnv {
  /** 标题 */
  readonly VITE_TITLE: string

  /** 内嵌文档地址  */
  readonly VITE_DOCUMENT_URL: string

  /** @dev 是否启用 HTTPS */
  readonly VITE_HTTPS?: string

  /** 接口地址 */
  readonly VITE_API_BASE: string

  /** @dev 接口反代理 */
  readonly VITE_API_PROXY_TARGET: string

  /** 路由创建历史记录的模式 */
  readonly VITE_ROUTER_MODE: 'history' | 'hash' | 'memory'

  /** @dev 顶部指示环境的置顶文本 */
  readonly VITE_ENV_BANNER: string

  /** @dev 开发信息的可见性 */
  readonly VITE_DEV_INFO_VISIBLE: 'on' | 'off'

  /** 个人信息面板 banner 展示图 */
  readonly VITE_BANNER_IMAGE: string

  /**
   * token 有效期小于多长时刷新（秒）
   * @default 600
   */
  readonly VITE_TOKEN_REFRESH_REST_TIME: number

  /** @dev 下自动填充用户名 */
  readonly VITE_AUTO_COMPLETE_USERNAME: string

  /** @dev 下自动填充密码 */
  readonly VITE_AUTO_COMPLETE_PASSWORD: string

  /** 资源服务器地址 */
  readonly VITE_ASSETS_BASE: string

  /** @dev 网络模式 */
  readonly VITE_DEVELOPMENT_MODE: 'default' | 'offline'

  /** API 前置账号 */
  readonly VITE_API_AUTH_USERNAME: string

  /** API 前置口令 */
  readonly VITE_API_AUTH_PASSWORD: string

  /** WebSocket 地址 */
  readonly VITE_WS_BASE: string

  /** @ignore */
  readonly APP_VERSION: string
  /** @ignore */
  readonly APP_BRANCH: string
  /** @ignore */
  readonly APP_COMMIT_HASH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
