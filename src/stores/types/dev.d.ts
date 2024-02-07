declare namespace DevStore {
  interface RuntimeLog {
    type: 'info' | 'warn' | 'error'
    args: unknown[]
  }
}
