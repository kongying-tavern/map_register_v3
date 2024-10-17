import { WindowContext } from '../core'

let instance: WindowContext

export const useWindowContext = () => {
  if (!instance)
    instance = new WindowContext()
  return instance
}
