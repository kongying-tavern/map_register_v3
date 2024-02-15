import type { MAFConfig } from '@/stores/types'

export const idRange: MAFConfig = {
  id: 1,
  name: 'ID范围',
  option: {
    placeholder: '格式为数字，A,B或A-B',
  },
  defaultVal: {
    v: '',
  },
  semantic: () => '',
  filter: () => true,
}
