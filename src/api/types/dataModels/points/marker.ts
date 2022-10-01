import type { MarkerSingle, MarkerExtra } from '.'

/** 点位信息 */
export interface Marker extends MarkerSingle, Omit<MarkerExtra, 'markerId'> {}
