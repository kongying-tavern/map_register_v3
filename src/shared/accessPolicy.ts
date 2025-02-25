/** 权限策略配置 */
const ACCESS_POLICY_CONFIG: Record<string, { label: string, value: string }[]> = {
  ip: [
    { label: '与最后一次登录 ip 相同', value: 'same_last_ip' },
    { label: '对列表中有效的 ip 放行', value: 'pass_allow_ip' },
    { label: '对列表中禁用的 ip 拦截', value: 'block_disallow_ip' },
    { label: '与最后一次登录地区相同', value: 'same_last_region' },
    { label: '对列表中有效的地区放行', value: 'pass_allow_region' },
    { label: '对列表中禁用的地区拦截', value: 'block_disallow_region' },
  ],
  dev: [
    { label: '与最后一次登录设备相同', value: 'same_last_device' },
    { label: '对列表中有效的设备放行', value: 'pass_allow_device' },
    { label: '对列表中禁用的设备拦截', value: 'block_disallow_device' },
  ],
}

/** 权限策略选项 */
export const ACCESS_POLICY_OPTIONS = Object.entries(ACCESS_POLICY_CONFIG).reduce((options, [type, items]) => {
  items.forEach(({ label, value }) => {
    options.push({
      label,
      value: `${type}:${value}`,
    })
  })
  return options
}, [] as { label: string, value: string }[])
