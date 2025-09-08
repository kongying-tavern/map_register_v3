import type { FormItemRule } from 'element-plus'

export const useIconFormRules = (form: Ref<API.IconVo>) => {
  /** 校验规则 */
  const rules: Partial<Record<keyof API.IconVo, FormItemRule>> = {
    tag: {
      required: true,
      trigger: 'change',
      validator: (_, value: string, callback) => {
        const trimText = value.trim()
        form.value.tag = trimText
        if (trimText.length <= 0) {
          callback(new Error('图标名称不能为空'))
          return
        }
        callback()
      },
      message: '图标名称不能为空',
    },
  }

  return { rules }
}
