/** 分页请求 */
export interface PaginationRequest {
  /**
   * 当前页，从0开始，从0开始
   */
  current?: number
  /**
   * 每页大小，默认为10，默认为10
   */
  size?: number
}
