import { ElMessageBox } from 'element-plus'
import type { Coordinate2D } from './../../../core/GenshinMap'
import { GSMessageService } from '@/components'
import { useMap, useMarkerCollimator, useMarkerEdit, useMarkerFocus } from '@/pages/pageMapV2/hooks'

export const usePositionEdit = () => {
  const { collimatorVisible, hook } = useMarkerCollimator()
  const { map } = useMap()
  const { focus } = useMarkerFocus()

  const cachedMarkerVo = ref<API.MarkerVo | null>(null)
  const { editMarker, onSuccess: onEditSuccess } = useMarkerEdit(cachedMarkerVo)

  hook.open((coord) => {
    if (!focus.value || !coord || !map.value)
      return
    cachedMarkerVo.value = focus.value
    map.value.updateViewState({
      target: map.value.projectCoord(coord),
    })
  })

  hook.confirm(async (coord) => {
    if (!focus.value || !cachedMarkerVo.value)
      return
    const isConfirm = await ElMessageBox.confirm('确认操作？').catch(() => false)
    if (!isConfirm)
      return
    cachedMarkerVo.value.position = coord.join(',')
    await editMarker()
  })

  hook.cancel(() => {
    if (!focus.value || !map.value)
      return
    collimatorVisible.value = false
    const coord = cachedMarkerVo.value?.position?.split(',').map(Number) as Coordinate2D | undefined
    coord && map.value.updateViewState({
      target: map.value.projectCoord(coord),
    })
  })

  onEditSuccess(() => {
    if (!cachedMarkerVo.value)
      return
    collimatorVisible.value = false
    GSMessageService.info('修改成功，请等待点位信息同步')
  })
}
