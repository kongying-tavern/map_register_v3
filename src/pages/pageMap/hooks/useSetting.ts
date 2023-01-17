import { SettingPanel } from '../components'
import { useGlobalDialog } from '@/hooks'

export interface SettingVo extends Record<string, boolean | number | string> {
  // hiddenFlag为1, 2突出显示
  showSpecialMarker: boolean
  // 地下模式时仅显示地下点位
  onlyShowUnderGround: boolean
  // 根据点位坐标将地图移动到点集中心
  moveToCenter: boolean
}

/** 设置显示名字 */
const settingName = [
  { key: 'showSpecialMarker', value: 'hiddenFlag为1, 2突出显示', type: 'boolean' },
  { key: 'onlyShowUnderGround', value: '地下模式时仅显示地下点位', type: 'boolean' },
  { key: 'moveToCenter', value: '根据点位坐标将地图移动到点集中心', type: 'boolean' },
]

export const useSetting = () => {
  const init = '{"showSpecialMarker": false, "onlyShowUnderGround": false, "moveToCenter": false, "undergroundMarkerStyle": false}'
  const settingInfo = ref<SettingVo>(JSON.parse(localStorage.getItem('userSetting') ?? init))

  const { DialogService } = useGlobalDialog()

  watch(settingInfo, () => {
    localStorage.setItem('userSetting', JSON.stringify(settingInfo.value))
  }, { deep: true })

  /** 获取设置 */
  const getSetting = (key: string) => {
    return settingInfo.value[key]
  }

  /** 打开设置界面 */
  const openSetting = () => {
    DialogService
      .config({
        title: '设置界面',
        top: '10vh',
        width: '500px',
        class: 'transition-all p-2',
      })
      .props({
        modelValue: settingInfo.value,
        settingName,
      })
      .open(SettingPanel)
  }

  return { settingInfo, settingName, openSetting, getSetting }
}
