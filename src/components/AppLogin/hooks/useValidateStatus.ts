import type { FormItemProp } from 'element-plus'

interface ValidateStatusHookOptions {
  keys: string[]
}

export const useValidateStatus = (options: ValidateStatusHookOptions) => {
  const { keys } = options

  const unvalidPropKeys = ref(new Set<string>(keys))

  const isValid = computed(() => !unvalidPropKeys.value.size)

  const handleValidate = (prop: FormItemProp, isPropValid: boolean) => {
    if (isPropValid) {
      Array.isArray(prop)
        ? prop.forEach(key => unvalidPropKeys.value.delete(key))
        : unvalidPropKeys.value.delete(prop)
      return
    }
    Array.isArray(prop)
      ? prop.forEach(key => unvalidPropKeys.value.add(key))
      : unvalidPropKeys.value.add(prop)
  }

  return {
    isValid,
    handleValidate,
  }
}
