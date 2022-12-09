import type { Arrayable } from '@vueuse/core'
import type { FormItemRule } from 'element-plus'

export type Trigger = 'blur' | 'change' | 'active'

export type ItemFormRules<T> = {
  [P in keyof T]: Arrayable<FormItemRule> | undefined
}

export const lengthCheck = (trigger: Trigger, name: string, max: number, min = 1): FormItemRule => ({
  required: true,
  message: `${name}需要 ${min} - ${max} 个字符`,
  pattern: new RegExp(`\\S{${min},${max}}`),
  trigger,
})

export const emptyCheck = (name = '', trigger: Trigger = 'blur') => ({
  message: `${name}不能含有空白字符`,
  pattern: /^\S+$/,
  trigger,
})
