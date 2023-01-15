<template>
  <q-item>
    <q-item-section side top> 点位区域 </q-item-section>
    <q-item-section>
      <q-toggle
        v-model="layer_extra_data.dragonspine_cave"
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
  name: "PluginDragonspineCaveEdit",
  setup() {
    return {
      ...funcExtraData,
    };
  },
  computed: {
    underground_type() {
      return this.layer_extra_data.dragonspine_cave === true
        ? "山体外"
        : "山体内";
    },
  },
};
</script>
