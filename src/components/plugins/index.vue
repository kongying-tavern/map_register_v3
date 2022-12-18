<template>
  <template v-for="field_name in plugin_fields" :key="field_name">
    <pl28Island v-if="field_name === '2_8_island'" />
    <plSumerUnderground v-else-if="field_name === 'sumeru_underground'" />
  </template>
</template>

<script>
import extraData from "../extra-data";
import pl28Island from "./2_8_island/edit.vue";
import plSumerUnderground from "./sumeru_underground/edit.vue";
import { get_map_plugin_config } from "src/api/map";

export default {
  name: "PluginAdapter",
  setup() {
    return {
      ...extraData,
    };
  },
  components: {
    pl28Island,
    plSumerUnderground,
  },
  props: {
    area: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    plugin_fields() {
      const area_code = this.area.code || "";
      const area_config = get_map_plugin_config(area_code);
      const field_config = area_config.extra || {};
      return field_config;
    },
  },
};
</script>
