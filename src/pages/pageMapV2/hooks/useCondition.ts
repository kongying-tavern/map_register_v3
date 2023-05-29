import { onUserLogout } from '@/hooks'
import { ConditionManager } from '@/pages/pageMapV2/core'

const sharedInstance = new ConditionManager()

onUserLogout(() => {
  sharedInstance.clearCondition()
})

export const useCondition = () => {
  return sharedInstance
}
