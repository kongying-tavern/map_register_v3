<template>
  <q-item>
    <q-item-section side top> 地下点位 </q-item-section>
    <q-item-section>
      <q-toggle
        v-model="layer_extra_data.inazuma_underground"
        dense
        :true-value="true"
        :false-value="null"
        :label="underground_type"
        :toggle-indeterminate="false"
      >
      </q-toggle>
    </q-item-section>
  </q-item>
</template>

<script>
import funcExtraData from "../../extra-data";

export default {
  name: "PluginInazumaUndergroundEdit",
  setup() {
    return {
      ...funcExtraData,
    };
  },
  computed: {
    underground_type() {
      return this.layer_extra_data.inazuma_underground === true
        ? "地下"
        : "地上";
    },
  },
};
</script>
