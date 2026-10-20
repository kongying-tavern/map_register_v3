import { createPinia, setActivePinia } from 'pinia'
import Apis from '@/api/alova'

/**
 * 初始化接口测试运行环境。
 *
 * 应用运行时由 `main.ts` 挂载全局 `Apis` 对象，测试中没有这一步骤，需要手动补齐；
 * 同时准备一个干净的 Pinia 容器 —— 源码中的 alova 拦截器会通过 `useUserStore()`
 * 读取 / 刷新 token，若没有激活的 pinia 实例会直接抛错。
 */
export const setupApiEnv = () => {
  // token 由 useLocalStorage 持有，清空以避免上一个用例的登录态残留
  localStorage.clear()
  setActivePinia(createPinia())
  Reflect.set(globalThis, 'Apis', Apis)
}
