import _ from "lodash";
import { ref } from "vue";
import { map } from "src/api/map_obj";
import { layer_register, layer_mark } from "src/api/layer";
import { mapDisplayList } from "src/components/register/layer_table";

export const layerGroup = ref(null);

export const layerCurrent = ref(null);

export const layerPopupWindow = ref(null);

export const layerPopupShow = ref(false);

export const layerDragMode = ref(false);

export const layerDragWindow = ref(false);

export const layerPaint = (value = []) => {
  for (const i of value) {
    layerGroup.value?.addLayer(
      layer_register(i, _.isNil(i.icon.url) ? "" : i.icon.url)
    );
  }

  layerEventBind();
  map.value?.addLayer(layerGroup.value);
};

export const layerClear = () => {
  map.value?.removeLayer(layerGroup.value);
  layerGroup.value?.clearLayers();
};

export const layerRefresh = () => {
  layerClear();
  layerPaint(mapDisplayList.value);
};

export const layerEventBind = () => {
  // 为点位绑定弹窗事件和拖动事件
  layerGroup.value?.eachLayer((layer) => {
    const layerid = layer.options.data.id;
    const marklist = JSON.parse(localStorage.getItem("marked_layers"));
    if (marklist.findIndex((item) => item === layerid) !== -1) {
      layer_mark(layer);
    }

    layer.bindPopup(layerPopupWindow.value);
    layer.on({
      popupopen(layer) {
        layerCurrent.value = layer;
        layerPopupShow.value = true;
      },
      dragstart(layer) {
        layerDragMode.value = true;
        layerCurrent.value = layer;
        layerUnbindDrag(layer);
      },
      dragend(layer) {
        layerDragWindow.value = true;
        layerCurrent.value = layer;
      },
    });
  });
};

// 解绑未选中点位的拖动
export const layerUnbindDrag = (draglayer) => {
  layerGroup.value?.eachLayer((layer) => {
    if (layer.options.data.id !== draglayer.target.options.data.id) {
      layer.dragging.disable();
    }
  });
};
