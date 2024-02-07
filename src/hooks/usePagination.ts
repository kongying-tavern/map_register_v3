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
  init?: PaginationState
  /** 分页布局元素，会按照顺序显示 */
  units?: PgUnit[]
}

/**
 * 分页数据封装
 * @todo 考虑抽离为公共 hook
 */
export const usePagination = (options: PaginationHookOptions = {}) => {
  const { init, units = [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.JUMPER] } = options

  const layout = computed(() => units.join(','))

  const pagination = ref<PaginationState>({
    total: init?.total ?? 0,
    current: init?.current ?? 1,
    pageSize: init?.pageSize ?? 10,
  })

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
