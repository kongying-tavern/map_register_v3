import type {
  MAFConfig,
  MAFMetaContentRegex,
  MAFOptionInput,
  MAFValueString,
} from '@/stores/types'

export class ContentRegex implements MAFConfig {
  id = 4
  name = '内容正则匹配'
  option: MAFOptionInput = {
    placeholder: '',
  }

  get defaultVal(): MAFValueString {
    return {
      s: '',
    }
  }

  prepare(val: MAFValueString): MAFMetaContentRegex {
    const meta: MAFMetaContentRegex = {
      re: undefined,
    }
    if (!val.s)
      return meta

    try {
      meta.re = new RegExp(val.s, 'gui')
    }
    catch (_err) {
      // 忽略错误
    }
    return meta
  }

  semantic(val: MAFValueString, _opt: MAFOptionInput, _meta: MAFMetaContentRegex, opposite: boolean): string {
    return `内容${opposite ? '不' : ''}满足正则【${val.s ?? ''}】`
  }

  filter(_val: MAFValueString, _opt: MAFOptionInput, meta: MAFMetaContentRegex, marker: API.MarkerVo): boolean {
    if (!meta.re)
      return false
    return meta.re.test(marker.content ?? '')
  }
}
