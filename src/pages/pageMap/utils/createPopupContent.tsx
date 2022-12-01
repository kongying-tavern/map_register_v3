import L from 'leaflet'
import { ElButton, ElMessage } from 'element-plus'
import { render } from 'vue'

/** 从点位信息创建显示在点位标记上的弹层组件 */
export const createContent = (markerInfo: API.MarkerVo) => {
  const { id = '', picture, content = '{content}', markerTitle = '{title}' } = markerInfo
  const box = L.DomUtil.create('div', 'w-full h-full')

  // TODO 按钮具体功能待添加
  const onClick = () => {
    ElMessage.success(markerTitle)
  }

  const contentNode = (
    <div class="w-full h-full flex flex-col gap-2">
      <div class="font-bold">{id} - {markerTitle}</div>
      { picture ? <img src={picture} alt="点位说明" class="w-full aspect-square object-cover rounded" /> : null }
      <div class="w-full">{ content.split('\n').filter(Boolean).map(text => <span class="block pb-1 last:pb-0">{text}</span>)}</div>
      <div class="w-full flex justify-center">
        <ElButton plain={true} class="flex-1" size="small" type="primary" onClick={onClick}>测试按钮</ElButton>
        <ElButton plain={true} class="flex-1" size="small" type="danger" onClick={onClick}>测试按钮</ElButton>
      </div>
    </div>
  )

  render(contentNode, box)

  return box
}
