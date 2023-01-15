<template>
  <template v-for="field_name in plugin_fields" :key="field_name">
    <pl16Island v-if="field_name === '1_6_island'" />
    <pl28Island v-else-if="field_name === '2_8_island'" />
    <plDragonspineCave v-else-if="field_name === 'dragonspine_cave'" />
    <plInazumaUnderground v-else-if="field_name === 'inazuma_underground'" />
    <plSumeruUnderground v-else-if="field_name === 'sumeru_underground'" />
    <plSumeruPalace v-else-if="field_name === 'sumeru_palace'" />
  </template>
</template>

<script>
import extraData from "../extra-data";
import pl16Island from "./1_6_island/edit.vue";
import pl28Island from "./2_8_island/edit.vue";
import plDragonspineCave from "./dragonspine_cave/edit.vue";
import plInazumaUnderground from "./inazuma_underground/edit.vue";
import plSumeruUnderground from "./sumeru_underground/edit.vue";
import plSumeruPalace from "./sumeru_palace/edit.vue";
import { get_map_plugin_config } from "src/api/map";

export default {
  name: "PluginAdapter",
  setup() {
    return {
      ...extraData,
    };
  },
  components: {
    pl16Island,
    pl28Island,
    plDragonspineCave,
    plInazumaUnderground,
    plSumeruUnderground,
    plSumeruPalace,
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
