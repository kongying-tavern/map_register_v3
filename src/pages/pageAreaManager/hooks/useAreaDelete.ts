import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useAreaDelete = () => {
  const { loading, refresh: deleteArea, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: (area: API.AreaVo) => Api.area.deleteArea({ areaId: area.id! }),
  })

  return { loading, deleteArea, onSuccess, onError, ...rest }
}
