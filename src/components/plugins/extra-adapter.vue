<script setup>
import { computed } from "vue";
// Import pl16Island from "./1_6_island/edit.vue";
// import pl28Island from "./2_8_island/edit.vue";
import plUnderground from "./underground/edit.vue";
import { get_map_plugin_config } from "src/api/map";
import { markerExtra } from "../extra-data";

const props = defineProps({
  area: {
    type: Object,
    default: () => ({}),
  },
});

const plugin_tags = computed(() => {
  const area_code = props.area.code || "";
  const area_config = get_map_plugin_config(area_code);
  const plugin_tags = area_config.extra || {};
  return plugin_tags;
});

const plugin_options = computed(() => {
  const area_code = props.area.code || "";
  const area_config = get_map_plugin_config(area_code);
  const plugin_config = area_config.extraConfig || {};
  return plugin_config;
});
</script>

<template>
  <template v-for="plugin_tag in plugin_tags" :key="plugin_tag">
    <!-- 海岛 -->
    <!-- <pl16Island v-if="plugin_tag === '1_6_island'" />
    <pl28Island v-else-if="plugin_tag === '2_8_island'" /> -->

    <!-- 地下层级   -->
    <plUnderground
      v-if="plugin_tag === 'underground'"
      :textInactive="plugin_options.underground?.textInactive"
      :textActive="plugin_options.underground?.textActive"
      :modelId="plugin_options.underground?.modelId"
      :undergroundDetail="plugin_options.underground?.useDetail"
      :undergroundLevels="plugin_options.underground?.levels"
    >
    </plUnderground>
  </template>
</template>
