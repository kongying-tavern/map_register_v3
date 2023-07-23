<script setup>
import _ from "lodash";
import { ref, computed, defineProps, watch } from "vue";
import { add_map_overlay, get_map_plugin_config } from "src/api/map";
import { layergroup_register } from "src/api/layer";
import { map } from "src/pages/map";

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

const overlayBaseConfig = computed(() => {
  const overlayList = [];

  const globalUrlTemplate = overlay_options.value.urlTemplate || "";
  const globalIdTemplate =
    overlay_options.value.idTemplate || "{{groupValue}}#{{itemValue}}";

  const configOverlayList = overlay_options.value.overlays || [];
  for (const configGroup of configOverlayList) {
    const groupLabel = configGroup.label || "";
    const groupValue = configGroup.value || "";
    const groupUrlTemplate = configGroup.urlTemplate || "";
    const groupUrl = configGroup.url || "";
    const groupBounds = configGroup.bounds;
    const groupMultiple = Boolean(configGroup.multiple);

    const groupChildren = configGroup.children || [];
    const overlayChildren = [];
    for (const configItem of groupChildren) {
      const itemLabel = configItem.label || "";
      const itemValue = configItem.value || "";
      const itemUrl = configItem.url || "";
      const itemBounds = configItem.bounds;

      const overlayDataPack = {
        groupLabel,
        groupValue,
        itemLabel,
        itemValue,
      };

      // 判断边界是否有效
      const overlayBounds = itemBounds || groupBounds;
      if (
        !overlayBounds ||
        !_.isArray(overlayBounds) ||
        overlayBounds.length !== 2
      ) {
        continue;
      }

      // 判断地址是否存在
      let overlayUrl = itemUrl || groupUrl;
      if (!overlayUrl) {
        // 构造地图地址
        const overlayUrlTemplate = groupUrlTemplate || globalUrlTemplate || "";
        const overlayUrlRender = _.template(
          overlayUrlTemplate,
          lodashTemplateOptions
        );
        overlayUrl = overlayUrlRender(overlayDataPack);
      }

      if (!overlayUrl) {
        continue;
      }

      // 自动生成ID
      const overlayIdRender = _.template(
        globalIdTemplate,
        lodashTemplateOptions
      );
      const overlayId = overlayIdRender(overlayDataPack);

      overlayChildren.push({
        id: overlayId,
        label: itemLabel,
        value: itemValue,
        url: overlayUrl,
        bounds: overlayBounds,
      });
    }

    overlayList.push({
      label: groupLabel,
      value: groupValue,
      multiple: groupMultiple,
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
  _.flattenDeep(overlaySelections.value)
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

const overlayLayers = ref({});

const overlayLayerHandle = ref(layergroup_register());

const overlayInit = () => {
  overlaySelections.value = overlayInitState.value;
};

const overlayRefresh = () => {
  // 删除不存在的层
  for (const overlayLayerId in overlayLayers.value) {
    const overlayLayerItem = overlayLayers.value[overlayLayerId];
    if (
      overlayLayerItem &&
      overlaySelectionIds.value.indexOf(overlayLayerId) === -1
    ) {
      overlayLayerHandle.value?.removeLayer(overlayLayerItem);
      delete overlayLayers.value[overlayLayerId];
    }
  }

  // 添加新层
  for (const overlaySelectionId of overlaySelectionIds.value) {
    if (!overlayLayers.value[overlaySelectionId]) {
      const overlayLayerConfig = overlayConfigMap.value[overlaySelectionId];
      if (overlayLayerConfig) {
        const overlayLayerUrl = overlayLayerConfig.url || "";
        const overlayLayerBounds = overlayLayerConfig.bounds;
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
          color="primary"
          :icon="overlay_options.panelIcon"
          class="absolute-top-right"
          @click="overlayCardVisible = true"
        />
      </div>
    </q-card>
  </template>
</template>
