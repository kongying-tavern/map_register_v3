import { ConditionManager } from '@/pages/pageMapV2/core'

const sharedInstance = new ConditionManager()

export const useCondition = () => {
  return sharedInstance
}
