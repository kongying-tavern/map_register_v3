<template>
  <q-item>
    <q-item-section side top> 阶段限定 </q-item-section>
    <q-item-section>
      <q-select
        v-model="island_data"
        :options="island_options"
        emit-value
        map-options
        label="选择阶段"
        outlined
        dense
        multiple
        use-chips
        size="sm"
        @update:model-value="island_update"
      />
    </q-item-section>
  </q-item>
</template>

<script>
import _ from "lodash";
import funcExtraData from "../../extra-data";

export default {
  name: "Plugin16IslandEdit",
  setup() {
    return {
      ...funcExtraData,
    };
  },
  mounted() {
    this.$nextTick().then(() => {
      this.island_data = this.island_data_init;
    });
  },
  data() {
    return {
      island_data: [],
      island_options: [
        { label: "第一阶段", value: "1" },
        { label: "第二阶段", value: "2" },
      ],
    };
  },
  computed: {
    island_data_init() {
      const island_data = _.get(this.layer_extra_data, "1_6_island", []) || [];
      return island_data;
    },
    island_data_parsed() {
      if (_.isNil(this.island_data)) {
        return null;
      }

      if (_.isArray(this.island_data) && _.isEmpty(this.island_data)) {
        return null;
      }

      return this.island_data;
    },
  },
  methods: {
    island_update() {
      this.put_marker_extra_data_entry("1_6_island", this.island_data_parsed);
    },
  },
};
</script>
