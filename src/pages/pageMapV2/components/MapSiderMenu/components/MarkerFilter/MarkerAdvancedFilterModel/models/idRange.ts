import type { ConditionAdvancedModel } from '../types'
import { idRange as template } from './templates'
import { IconPound } from '@/components/AppIcons'

export const idRange: ConditionAdvancedModel = {
  id: 1,
  name: 'ID范围',
  icon: IconPound,
  template,
  option: {
    placeholder: '格式为数字，A,B或A-B',
  },
  defaultVal: {
    v: '',
  },
  semantic: () => '',
  filter: () => true,
}
