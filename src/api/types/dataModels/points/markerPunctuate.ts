import type { MarkerSingle, MarkerExtra } from '.'

/** 点位提交信息 */
export interface MarkerPunctuate
  extends MarkerSingle,
    Omit<MarkerExtra, 'markerId'> {
  /**
   * 审核备注
   */
  auditRemark?: string
  /**
   * 申请者ID
   */
  author: number
  /**
   * 操作类型，1: 新增 2: 修改 3: 删除
   */
  methodType: string
  /**
   * 打点提交ID
   */
  punctuateId: string
  /**
   * 状态，0:暂存 1:审核中 2:不通过
   */
  status: string
}
