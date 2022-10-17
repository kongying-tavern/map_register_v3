export interface PaginationState {
  /** 总数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页条数 */
  pageSize: number
}

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

export const usePagination = (options: PaginationHookOptions = {}) => {
  const { init, units = [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.JUMPER] } = options

  const layout = computed(() => units.join(','))

  const pagination = ref<PaginationState>({
    total: init?.total ?? 0,
    current: init?.current ?? 1,
    pageSize: init?.pageSize ?? 10,
  })

  return { pagination, layout }
}
