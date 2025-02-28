import { defineStore } from 'pinia'

interface BroadcastMeta {
  /** 页面 id */
  id: string
  /** 页面创建时间 */
  time: number
}

interface BroadcastChannelPayload {
  type: string
  param: unknown
}

export const useBroadcastStore = defineStore('broadcast-channel', () => {
  /** 当前页面信息 */
  const meta: BroadcastMeta = {
    id: crypto.randomUUID().split('-')[0].toUpperCase(),
    time: Date.now(),
  }

  /** 多页面状态 */
  const state = ref({
    clients: new Map<string, BroadcastMeta>([
      [meta.id, meta],
    ]),
  })

  /** 状态同步频道 */
  const bc = new BroadcastChannel('state-sync')

  const actionMap: Record<string, (param: unknown) => void> = {
    /** 广播自身存在 */
    displaySelf: (data) => {
      const clientMeta = data as BroadcastMeta
      if (state.value.clients.has(clientMeta.id))
        return
      state.value.clients.set(clientMeta.id, clientMeta)
    },
    /** 有其他页面接入 */
    register: (data) => {
      const clientMeta = data as BroadcastMeta
      state.value.clients.set(clientMeta.id, clientMeta as BroadcastMeta)
      bc.postMessage({ type: 'displaySelf', param: meta })
    },
    /** 有其他页面关闭 */
    unregister: (data) => {
      const clientMeta = data as BroadcastMeta
      state.value.clients.delete(clientMeta.id)
    },
  }

  bc.addEventListener('message', (ev: MessageEvent<BroadcastChannelPayload>) => {
    const { type, param } = ev.data
    actionMap[type]?.(param)
  })

  const init = () => {
    bc.postMessage({ type: 'register', param: meta })

    window.addEventListener('beforeunload', () => {
      bc.postMessage({ type: 'unregister', param: meta })
    })
  }

  return {
    init,
    meta,
    state,
  }
})
