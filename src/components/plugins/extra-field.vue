<script setup>
import { computed } from "vue";
import { get_map_plugin_config } from "src/api/map";
import pl16Island from "./extra-field/1_6_island.vue";
import pl28Island from "./extra-field/2_8_island.vue";
import plUnderground from "./extra-field/underground.vue";

const props = defineProps({
  area: {
    type: Object,
    default: () => ({}),
  },
});

const extra_config = computed(() => {
  const area_code = props.area.code || "";
  const config = get_map_plugin_config(area_code);
  return config;
});

const extra_tags = computed(() => {
  const tags = extra_config.value.extra || {};
  return tags;
});

const extra_options = computed(() => {
  const options = extra_config.value.extraConfig || {};
  return options;
});
</script>

<template>
  <template v-for="plugin_tag in extra_tags" :key="plugin_tag">
    <!-- 海岛 -->
    <pl16Island
      v-if="plugin_tag === '1_6_island'"
      :stages="extra_options['1_6_island']?.stages"
    />
    <pl28Island
      v-else-if="plugin_tag === '2_8_island'"
      :stages="extra_options['2_8_island']?.stages"
    />

    <!-- 分层层级 -->
    <plUnderground
      v-else-if="plugin_tag === 'underground'"
      :textInactive="extra_options.underground?.textInactive"
      :textActive="extra_options.underground?.textActive"
      :modelId="extra_options.underground?.modelId"
      :undergroundDetail="extra_options.underground?.useDetail"
      :undergroundLevels="extra_options.underground?.levels"
    >
    </plUnderground>
  </template>
</template>
