<script setup>
import _ from "lodash";
import { ref, computed, defineProps, watch } from "vue";
import { add_map_overlay, get_map_plugin_config } from "src/api/map";
import { layergroup_register } from "src/api/layer";
import { map, mapTiles } from "src/pages/map";

const lodashTemplateOptions = {
  interpolate: /{{([\s\S]+?)}}/g,
};

const props = defineProps({
  area: {
    type: Object,
    default: () => ({}),
  },
});

const overlay_config = computed(() => {
  const area_code = props.area.code || "";
  const config = get_map_plugin_config(area_code);
  return config;
});

const overlay_visible = computed(() => {
  const visible = Boolean(overlay_config.value.overlay);
  return visible;
});

const overlay_options = computed(() => {
  const options = overlay_config.value.overlayConfig || {};
  return options;
});

const overlayIcon = computed(() => overlay_options.value?.panelIcon || "");

const overlayIconColorDefault = "#9d9d9d";
const overlayIconColor = computed(
  () => overlay_options.value?.panelIconColor || overlayIconColorDefault
);

const overlayMaskOpacityDefault = 0.55;
const overlayMaskOpacity = computed(() => {
  if (!overlay_options.value?.overlayMask) {
    return 1;
  }

  const maskOnSelected = overlay_options.value?.overlayMaskOnSelected ?? true;
  if (maskOnSelected && overlaySelectionIds.value?.length <= 0) {
    return 1;
  }

  return overlay_options.value?.overlayMaskOpacity ?? overlayMaskOpacityDefault;
});

const overlayBaseConfig = computed(() => {
  const overlayList = [];

  const globalUrlTemplate = overlay_options.value.urlTemplate || "";
  const globalIdTemplate =
    overlay_options.value.idTemplate || "{{groupValue}}#{{itemValue}}";
  const globalMultiple = overlay_options.value.multiple;

  const configOverlayList = overlay_options.value.overlays || [];
  for (const configGroup of configOverlayList) {
    const groupLabel = configGroup.label || "";
    const groupValue = configGroup.value || "";
    const groupUrl = configGroup.url || "";
    const groupUrlTemplate = configGroup.urlTemplate || "";
    const groupBounds = configGroup.bounds;
    const groupMultiple = configGroup.multiple;
    const overlayMultiple = Boolean(groupMultiple ?? globalMultiple);

    const groupChildren = configGroup.children || [];
    const overlayChildren = [];
    for (const configItem of groupChildren) {
      const itemLabel = configItem.label || "";
      const itemValue = configItem.value || "";
      const itemUrl = configItem.url || "";
      const itemUrlTemplate = configItem.urlTemplate || "";
      const itemChunks = configItem.chunks || [{}];
      const itemBounds = configItem.bounds;

      // 叠层渲染数据
      const overlayDataPackItem = {
        groupLabel,
        groupValue,
        itemLabel,
        itemValue,
      };

      const overlayChunks = [];
      for (const configChunk of itemChunks) {
        const chunkLabel = configChunk.label || "";
        const chunkValue = configChunk.value || "";
        const chunkUrl = configChunk.url || "";
        const chunkBounds = configChunk.bounds;

        // 叠层渲染数据
        const overlayDataPackChunk = {
          groupLabel,
          groupValue,
          itemLabel,
          itemValue,
          chunkLabel,
          chunkValue,
        };

        // 判断边界是否有效
        const overlayBounds = chunkBounds || itemBounds || groupBounds;
        if (
          !overlayBounds ||
          !_.isArray(overlayBounds) ||
          overlayBounds.length !== 2
        ) {
          continue;
        }

        // 判断地址是否存在
        let overlayUrl = chunkUrl || itemUrl || groupUrl;
        if (!chunkUrl) {
          // 构造地图地址
          const overlayUrlTemplate =
            itemUrlTemplate || groupUrlTemplate || globalUrlTemplate || "";
          const overlayUrlRender = _.template(
            overlayUrlTemplate,
            lodashTemplateOptions
          );
          overlayUrl = overlayUrlRender(overlayDataPackChunk);
        }

        if (!overlayUrl) {
          continue;
        }

        overlayChunks.push({
          label: chunkLabel,
          value: chunkValue,
          url: overlayUrl,
          bounds: overlayBounds,
        });
      }

      // 判断是否有叠图配置
      if (!_.isArray(overlayChunks) || overlayChunks.length <= 0) {
        continue;
      }

      // 自动生成ID
      const overlayIdRender = _.template(
        globalIdTemplate,
        lodashTemplateOptions
      );
      const overlayId = overlayIdRender(overlayDataPackItem);

      overlayChildren.push({
        id: overlayId,
        label: itemLabel,
        value: itemValue,
        chunks: overlayChunks,
      });
    }

    overlayList.push({
      label: groupLabel,
      value: groupValue,
      multiple: overlayMultiple,
      children: overlayChildren,
    });
  }

  return overlayList;
});

const overlaySelectionConfig = computed(() => {
  const configList = [];
  for (const configGroup of overlayBaseConfig.value) {
    const configGroupNew = _.cloneDeep(configGroup);
    const configGroupChildren = _.map(configGroup.children || [], (child) => {
      child.value = child.id;
      return child;
    });
    configGroupNew.children = configGroupChildren;
    configList.push(configGroupNew);
  }

  return configList;
});

const overlayCardVisible = ref(true);

const overlaySelections = ref([]);

const overlaySelectionIds = computed(() =>
  _.chain(overlaySelections.value)
    .flattenDeep()
    .filter((v) => v)
    .value()
);

const overlayConfigMap = computed(() => {
  const configMap = {};
  for (const configGroup of overlayBaseConfig.value) {
    const configGroupChildren = configGroup.children || [];
    for (const configItem of configGroupChildren) {
      const configItemId = configItem.id || "";
      if (configItemId) {
        configMap[configItemId] = configItem;
      }
    }
  }

  return configMap;
});

const overlayInitState = computed(() => {
  const overlayInitData = [];
  for (const configGroup of overlayBaseConfig.value) {
    let overlayInitValue = null;

    if (configGroup.multiple) {
      overlayInitValue = [];
    } else {
      const configChildren = configGroup.children || [];
      const configChildrenFirst = configChildren[0];

      if (configChildrenFirst && _.isPlainObject(configChildrenFirst)) {
        overlayInitValue = configChildrenFirst.id || "";
      }
    }

    overlayInitData.push(overlayInitValue);
  }

  return overlayInitData;
});

const overlayLayerHandle = ref(layergroup_register());

const overlayInit = () => {
  overlaySelections.value = overlayInitState.value;
};

const overlayRefresh = () => {
  // 设置图层透明度
  mapTiles.value?.setOpacity(overlayMaskOpacity.value);

  overlayLayerHandle.value?.clearLayers();

  // 添加新层
  for (const overlaySelectionId of overlaySelectionIds.value) {
    const overlayLayerConfig = overlayConfigMap.value[overlaySelectionId];
    if (overlayLayerConfig) {
      const overlayLayerChunks = overlayLayerConfig.chunks || [];
      if (_.isArray(overlayLayerChunks)) {
        for (const overlayLayerChunk of overlayLayerChunks) {
          const overlayLayerUrl = overlayLayerChunk.url || "";
          const overlayLayerBounds = overlayLayerChunk.bounds;

          if (overlayLayerUrl && overlayLayerBounds) {
            const imageData = add_map_overlay(
              overlayLayerUrl,
              overlayLayerBounds
            );
            overlayLayerHandle.value?.addLayer(imageData);
          }
        }
      }
    }
  }

  map.value?.addLayer(overlayLayerHandle.value);
};

watch(() => overlayBaseConfig.value, overlayInit);

watch(() => overlaySelectionIds.value, overlayRefresh);
</script>

<template>
  <template v-if="overlay_visible">
    <q-card class="absolute-top-right q-pa-md" style="z-index: 9000">
      <div
        v-if="overlayCardVisible"
        style="width: 350px; max-height: 30rem; overflow-y: auto"
      >
        <q-btn
          dense
          flat
          color="white"
          text-color="black"
          icon="mdi-close"
          class="absolute-top-right"
          @click="overlayCardVisible = false"
        />
        <div
          class="q-pb-sm"
          v-for="(group, groupIndex) in overlaySelectionConfig"
          :key="groupIndex"
        >
          <span style="font-weight: bold">{{ group.label }}</span>
          <q-option-group
            v-model="overlaySelections[groupIndex]"
            :options="group.children"
            :type="group.multiple ? 'checkbox' : 'radio'"
            size="sm"
            inline
          />
        </div>
      </div>
      <div v-else>
        <q-btn
          dense
          flat
          :icon="overlayIcon"
          :style="{ color: overlayIconColor }"
          class="absolute-top-right"
          @click="overlayCardVisible = true"
        />
      </div>
    </q-card>
  </template>
</template>
