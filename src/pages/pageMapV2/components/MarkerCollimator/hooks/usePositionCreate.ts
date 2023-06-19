import { useMarkerCollimator } from '@/pages/pageMapV2/hooks'
import { MarkerCreatePanel } from '@/pages/pageMapV2/components'
import { useGlobalDialog } from '@/hooks'

export const usePositionCreate = () => {
  const { collimatorVisible, collimatorEditMode, hook } = useMarkerCollimator()

  const { DialogService } = useGlobalDialog()

  hook.confirm(async (coord) => {
    if (collimatorEditMode.value)
      return
    await DialogService
      .config({
        alignCenter: true,
        width: 'fit-content',
        title: '创建点位',
      })
      .props({
        coordinate: coord,
      })
      .open(MarkerCreatePanel)
      .afterClosed()
    collimatorVisible.value = false
  })

  hook.cancel(() => {
    if (collimatorEditMode.value)
      return
    collimatorVisible.value = false
  })
}
