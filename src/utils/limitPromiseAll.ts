export interface LimitPromiseAllOptions<T> {
  maxRequests?: number
  initResult?: T[]
}

/**
 * 限制 promise 并发数，使用 Promise.all 进行处理
 *
 * 注意！返回为 null 的项会被过滤
 */
export const limitPromiseAll = async <D, T>(
  data: D[],
  toPromise: (item: D, index: number) => Promise<T | null>,
  {
    maxRequests = 10,
    initResult = [],
  }: LimitPromiseAllOptions<T> = {},
) => {
  let requestQueue: Promise<T | null>[] = []

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    requestQueue.push(toPromise(item, i))
    if (requestQueue.length >= maxRequests) {
      initResult = initResult.concat((await Promise.all(requestQueue)).filter(Boolean) as T[])
      requestQueue = []
    }
  }

  // 清理剩余队列任务
  if (requestQueue.length > 0)
    initResult = initResult.concat((await Promise.all(requestQueue)).filter(Boolean) as T[])

  return initResult
}
