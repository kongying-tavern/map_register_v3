import type { ConditionAdvancedModel } from '../types'
import { idRange as template } from './templates'
import { IconPound } from '@/components/AppIcons'

export const idRange: ConditionAdvancedModel = {
  id: 1,
  name: 'ID范围',
  icon: IconPound,
  template,
  option: {
    placeholder: '',
  },
  defaultVal: {
    v: '',
  },
  semantic: () => '',
  filter: () => true,
}
