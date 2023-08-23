<script setup>
import _ from "lodash";
import { ref, computed, defineProps, watch } from "vue";
import { map_plugin_config } from "src/api/config";
import {
  add_map_overlay,
  create_map_config,
  get_map_plugin_config,
} from "src/api/map";
import { layergroup_register } from "src/api/layer";
import { selectorAreaCodeMap } from "src/components/selector-data";
import { map, mapOptions, mapTiles } from "src/api/map_obj";

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

const overlay_code = computed(() => mapOptions.value?.code || "");

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
  const overlayConfigList = [];

  for (const configAreaCode in map_plugin_config.value) {
    const overlayList = [];

    const { tiles_config: tilesConfig } = create_map_config(configAreaCode);
    const configTilesCode = tilesConfig.code || "";
    // 如果底图不一致则不添加数据
    if (configTilesCode !== overlay_code.value) {
      continue;
    }

    const configAreaData = selectorAreaCodeMap.value[configAreaCode] || {};
    const configPluginConfig = get_map_plugin_config(configAreaCode);
    const configOverlay = Boolean(configPluginConfig.overlay);
    const configOptions = configOverlay
      ? configPluginConfig?.overlayConfig || {}
      : {};

    const globalUrlTemplate = configOptions.urlTemplate || "";
    const globalIdTemplate =
      configOptions.idTemplate || "{{groupValue}}#{{itemValue}}";
    const globalMultiple = configOptions.multiple;

    const configOverlayList = configOptions.overlays || [];
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

    // 如果为空则不加入数据
    if (!_.isEmpty(overlayList)) {
      overlayConfigList.push({
        area: configAreaData,
        overlays: overlayList,
      });
    }
  }

  return overlayConfigList;
});

/** Quasar only */
const overlaySelectionConfig = computed(() =>
  _.chain(overlayBaseConfig.value)
    .map((section) => {
      const sectionNew = _.cloneDeep(section);
      const sectionOverlays = _.chain(sectionNew.overlays)
        .map((group) => {
          const children = _.chain(group.children || [])
            .map((item) => {
              item.value = item.id || "";
              return item;
            })
            .value();

          group.children = children;
          return group;
        })
        .value();

      sectionNew.overlays = sectionOverlays;
      return sectionNew;
    })
    .value()
);
/** Quasar only */

const overlayCardVisible = ref(true);

const overlayAreaTab = ref("");

const overlaySelections = ref({});

const overlaySelectionIds = computed(() =>
  _.chain(overlaySelections.value)
    .values()
    .flattenDeep()
    .filter((v) => v)
    .uniq()
    .value()
);

const overlayConfigMap = computed(() => {
  const configMap = {};
  for (const configSection of overlayBaseConfig.value) {
    const configOverlays = configSection?.overlays || [];
    for (const configGroup of configOverlays) {
      const configGroupChildren = configGroup.children || [];
      for (const configItem of configGroupChildren) {
        const configItemId = configItem.id || "";
        if (configItemId) {
          configMap[configItemId] = configItem;
        }
      }
    }
  }

  return configMap;
});

const overlayInitState = computed(() => {
  const overlayInitDataMap = {};

  for (const configSection of overlayBaseConfig.value) {
    const configAreaCode = configSection?.area?.code || "";
    const configOverlays = configSection?.overlays || [];

    const overlayInitData = [];

    for (const configGroup of configOverlays) {
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

    overlayInitDataMap[configAreaCode] = overlayInitData;
  }

  return overlayInitDataMap;
});

const overlayLayerHandle = ref(layergroup_register());

const overlayInit = () => {
  overlayAreaTab.value = props.area?.code || "";
  overlaySelections.value = _.cloneDeep(overlayInitState.value);
};

const overlayInitGroup = (areaCode = "", groupIndex = -1) => {
  if (
    overlaySelections.value[areaCode] &&
    overlaySelections.value[areaCode][groupIndex]
  ) {
    overlaySelections.value[areaCode][groupIndex] = _.cloneDeep(
      (overlayInitState.value[areaCode] || {})[groupIndex]
    );
  }
};

const overlayRefresh = () => {
  // 设置图层透明度
  mapTiles.value?.setOpacity(overlayMaskOpacity.value);

  overlayLayerHandle.value?.clearLayers();

  const matchedValues = new Set();
  // 添加新层
  for (const overlaySelectionId of overlaySelectionIds.value) {
    const overlayLayerConfig = overlayConfigMap.value[overlaySelectionId];
    if (overlayLayerConfig) {
      const overlayLayerValue = overlayLayerConfig.value || "";
      const overlayLayerChunks = overlayLayerConfig.chunks || [];
      if (
        _.isArray(overlayLayerChunks) &&
        overlayLayerValue &&
        !matchedValues.has(overlayLayerValue)
      ) {
        matchedValues.add(overlayLayerValue);

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
    <q-card
      class="absolute-top-right q-pa-md"
      :class="{ 'q-pt-lg': overlayCardVisible }"
      style="z-index: 9000"
    >
      <div
        v-if="overlayCardVisible"
        style="width: 350px; display: flex; flex-direction: column"
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

        <q-tabs v-model="overlayAreaTab" dense align="justify">
          <q-tab
            v-for="(area, areaIndex) in overlaySelectionConfig"
            :key="areaIndex"
            :label="area?.area?.name"
            :name="area?.area?.code"
          >
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="overlayAreaTab" animated>
          <q-tab-panel
            v-for="(area, areaIndex) in overlaySelectionConfig"
            :key="areaIndex"
            :name="area?.area?.code"
            class="q-mt-sm"
            style="padding: 0; max-height: 32rem; overflow-y: auto"
          >
            <div
              v-for="(group, groupIndex) in area.overlays"
              :key="groupIndex"
              class="q-pb-sm"
            >
              <span style="font-weight: bold">{{ group.label }}</span>
              <q-btn
                v-if="group.multiple"
                class="q-ml-sm"
                flat
                dense
                bg-color="grey-6"
                size="sm"
                icon="mdi-close"
                @click="overlayInitGroup(area?.area?.code, groupIndex)"
              >
              </q-btn>
              <q-option-group
                v-model="overlaySelections[area?.area?.code][groupIndex]"
                :options="group.children"
                :type="group.multiple ? 'checkbox' : 'radio'"
                size="sm"
                inline
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
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
