import { idRange as template } from './templates'
import type { MAFConfig } from '@/stores/types'
import { IconPound } from '@/components/AppIcons'

export const idRange: MAFConfig = {
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
