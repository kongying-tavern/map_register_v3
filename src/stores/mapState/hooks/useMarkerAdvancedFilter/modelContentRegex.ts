import type {
  MAFConfig,
  MAFMetaContentRegex,
  MAFOptionInput,
  MAFValueInput,
} from '@/stores/types'

export const contentRegex: MAFConfig = {
  id: 4,
  name: '内容正则匹配',
  option: {
    placeholder: '',
  },
  defaultVal: {
    v: '',
  },
  prepare: (val: MAFValueInput): MAFMetaContentRegex => {
    const meta: MAFMetaContentRegex = {
      re: undefined,
    }
    if (!val.v)
      return meta

    try {
      meta.re = new RegExp(val.v, 'gui')
    }
    catch (_err) {
      // 忽略错误
    }
    return meta
  },
  semantic: (val: MAFValueInput, _opt: MAFOptionInput, _meta: MAFMetaContentRegex, opposite: boolean): string => {
    if (!val.v)
      return ''
    return `内容${opposite ? '不' : ''}满足正则【${val.v ?? ''}】`
  },
  filter: (_val: MAFValueInput, _opt: MAFOptionInput, meta: MAFMetaContentRegex, marker: API.MarkerVo): boolean => {
    if (!meta.re)
      return false
    return meta.re.test(marker.content ?? '')
  },
}
