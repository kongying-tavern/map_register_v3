import _ from 'lodash'

export const channelsDict = [
  { label: '通用', value: 'COMMON' },
  { label: '前台', value: 'APPLICATION' },
  { label: 'App客户端', value: 'CLIENT_APP' },
  { label: 'PC客户端', value: 'CLIENT_PC' },
  { label: '网页版', value: 'WEB' },
  { label: '后台', value: 'DASHBOARD' },
  { label: '维系天理', value: 'TIANLI' },
]

export const channelsMap = _.chain(channelsDict)
  .map(v => [v.value, v.label])
  .fromPairs()
  .value()

export const getValidDict = [
  { label: '有效', value: true },
  { label: '失效', value: false },
]
