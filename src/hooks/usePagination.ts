import type { ManagerModule } from '@/shared'
import { usePreferenceStore } from '@/stores'

export interface PaginationState {
  /** 总数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页条数 */
  pageSize: number
}

/** el-pagination 的控制器单元 */
export enum PgUnit {
  SIZE = 'sizes',
  PREV = 'prev',
  PAGER = 'pager',
  NEXT = 'next',
  JUMPER = 'jumper',
  REST = '->',
  TOTAL = 'total',
  SLOT = 'slot',
}

export interface PaginationHookOptions {
  /** 初始化分页值 */
  init?: Partial<PaginationState>
  /** 分页布局元素，会按照顺序显示 */
  units?: PgUnit[]
  /** 分页所属的管理模块，如果提供此值，将会关联首选项中与当前模块相关的分页配置 */
  module?: ManagerModule
}

/**
 * ## 分页 hook
 *
 * ### 关于 module
 * 提供 module 参数，hook 提供的值将会对接到首选项设置，产生记忆能力。首选项值会覆盖 init 的相关字段。
 *
 * #### 1. `pageSize` 每页项目数
 * 该字段包括 4 个值，3 个固定值和一个自定义值，自定义值只能在设置面板中进行设置。
 * #### 2. 其他字段开发中...
 */
export const usePagination = (options: PaginationHookOptions = {}) => {
  const preferenceStore = usePreferenceStore()

  const pageSizeSetting = computed(() => new Map(preferenceStore.preference['manager.setting.pageSize']))

  const {
    init,
    units = [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.JUMPER],
    module,
  } = options

  const getModulePagination = (module?: ManagerModule, init: Partial<PaginationState> = {}): PaginationState => {
    const defaultPagination = {
      total: 0,
      current: 1,
      pageSize: 10,
    }
    if (!module)
      return Object.assign(defaultPagination, init)
    const size = Number(pageSizeSetting.value.get(module))
    return Object.assign(defaultPagination, init, {
      pageSize: Number.isInteger(size) ? size : defaultPagination.pageSize,
    })
  }

  const layout = computed(() => units.join(','))

  const pagination = ref<PaginationState>(getModulePagination(module, init))

  // 如果提供了 module，更新 pageSize 时将其同步到用户首选项
  if (module) {
    watch(() => pagination.value.pageSize, (pageSize) => {
      preferenceStore.preference['manager.setting.pageSize'] = [...new Map(pageSizeSetting.value).set(module, pageSize).entries()]
    }, { deep: true })
  }

  const pages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

  const disabledNext = computed(() => pagination.value.current >= pages.value)

  const disabledPre = computed(() => pagination.value.current <= 1)

  const nextPage = () => {
    if (disabledNext.value)
      return
    pagination.value.current += 1
  }

  const prePage = () => {
    if (disabledPre.value)
      return
    pagination.value.current -= 1
  }

  return { pagination, pages, layout, disabledNext, disabledPre, nextPage, prePage }
}
