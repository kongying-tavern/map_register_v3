<template>
  <q-item>
    <q-item-section side top> 地下区域 </q-item-section>
    <q-item-section>
      <div class="row q-gutter-x-md content-top">
        <q-select
          class="col-4"
          v-model="palace_data.palace_name"
          :options="palace_options"
          emit-value
          map-options
          label="选择区域"
          outlined
          dense
          size="sm"
          @update:model-value="palace_select_main"
        />
        <q-select
          class="col"
          v-if="palace_options_state.length > 0"
          v-model="palace_data.palace_level"
          :options="palace_options_state"
          emit-value
          map-options
          label="选择层级"
          outlined
          dense
          size="sm"
          multiple
          use-chips
          @update:model-value="palace_update"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import _ from "lodash";
import funcExtraData from "../../extra-data";

export default {
  name: "PluginSumeruPalaceEdit",
  setup() {
    return {
      ...funcExtraData,
    };
  },
  data() {
    return {
      palace_options: [
        { label: "无", value: null },
        { label: "地下", value: "ug" },
        {
          label: "圣显",
          value: "sx",
          children: [
            { label: "圣显 · 上", value: "1" },
            { label: "圣显 · 中", value: "2" },
            { label: "圣显 · 下", value: "3" },
          ],
        },
        {
          label: "舍身",
          value: "ss",
          children: [
            { label: "舍身 · 上", value: "1" },
            { label: "舍身 · 中", value: "2" },
            { label: "舍身 · 下", value: "3" },
          ],
        },
        {
          label: "秘仪",
          value: "my",
          children: [
            { label: "秘仪 · 上", value: "1" },
            { label: "秘仪 · 中", value: "2" },
            { label: "秘仪 · 下", value: "3" },
          ],
        },
        {
          label: "王陵",
          value: "wl",
          children: [
            { label: "王陵 · 初", value: "0" },
            { label: "王陵 · 上", value: "1" },
            { label: "王陵 · 中", value: "2" },
            { label: "王陵 · 下", value: "3" },
          ],
        },
      ],
    };
  },
  computed: {
    palace_data() {
      const palace_data =
        _.get(this.layer_extra_data, "sumeru_palace", null) || {};
      const palace_name = _.get(palace_data, "palace_name", null);
      const palace_level = _.get(palace_data, "palace_level", []);

      return {
        palace_name,
        palace_level,
      };
    },
    palace_options_state() {
      const found_selector =
        _.find(
          this.palace_options,
          (v) => v.value === this.palace_data.palace_name
        ) || {};
      const states = found_selector.children || [];
      return states;
    },
    palace_data_parsed() {
      if (_.isNil(this.palace_data.palace_name)) {
        return null;
      }

      return this.palace_data;
    },
  },
  methods: {
    palace_select_main() {
      this.palace_data.palace_level = [];
      this.palace_update();
    },
    palace_update() {
      this.put_marker_extra_data_entry(
        "sumeru_palace",
        this.palace_data_parsed
      );
    },
  },
};
</script>
