interface Option {
  label: string
  value: string
}

interface OptionGroup extends Option {
  options: Option[]
}

export const GROUPED_ACCESS_POLICY_OPTIONS: OptionGroup[] = [
  {
    label: 'IP 策略',
    value: 'ip',
    options: [
      { label: '与最后一次登录 ip 相同', value: 'ip:same_last_ip' },
      { label: '与最后一次登录地区相同', value: 'ip:same_last_region' },
      { label: '对列表中有效的 ip 放行', value: 'ip:pass_allow_ip' },
      { label: '对列表中禁用的 ip 拦截', value: 'ip:block_disallow_ip' },
      { label: '对列表中有效的地区放行', value: 'ip:pass_allow_region' },
      { label: '对列表中禁用的地区拦截', value: 'ip:block_disallow_region' },
    ],
  },
  {
    label: '设备策略',
    value: 'device',
    options: [
      { label: '与最后一次登录设备相同', value: 'dev:same_last_device' },
      { label: '对列表中有效的设备放行', value: 'dev:pass_allow_device' },
      { label: '对列表中禁用的设备拦截', value: 'dev:block_disallow_device' },
    ],
  },
]
