export {}

declare global {
  interface Window {
    readonly __APP_VERSION__: string
    readonly __APP_BRANCH__: string
    readonly __APP_COMMIT_HASH__: string
  }
}
