<template>
  <template v-for="field_name in plugin_fields" :key="field_name">
    <pl16Island v-if="field_name === '1_6_island'" />
    <pl28Island v-else-if="field_name === '2_8_island'" />
    <plDragonspineCave v-else-if="field_name === 'dragonspine_cave'" />
    <plInazumaUnderground v-else-if="field_name === 'inazuma_underground'" />
    <plSumeruUnderground v-else-if="field_name === 'sumeru_underground'" />
    <plSumeruPalace v-else-if="field_name === 'sumeru_palace'" />
    <plSumeruDesert2 v-else-if="field_name === 'sumeru_desert2'" />
    <!-- 通用地下实现   -->
    <plUnderground
      v-else-if="field_name === 'underground_basic'"
      modelId="basic"
      :undergroundDetail="false"
    >
    </plUnderground>
    <plUnderground
      v-else-if="field_name === 'underground_sumeru4'"
      modelId="sumeru4"
      :undergroundDetail="false"
      :undergroundOptions="undergroundOptionsSumeru4"
    >
    </plUnderground>
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
import plSumeruDesert2 from "./sumeru_desert2/edit.vue";
import plUnderground from "./underground/edit.vue";
import { get_map_plugin_config } from "src/api/map";

import { undergroundOptionsSumeru4 } from "./underground/data";

export default {
  name: "PluginAdapter",
  setup() {
    return {
      undergroundOptionsSumeru4,
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
    plSumeruDesert2,
    plUnderground,
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
