<template>
  <q-item>
    <q-item-section side top> 地下区域 </q-item-section>
    <q-item-section>
      <div class="row q-pb-sm content-top">
        <q-toggle
          v-model="is_underground"
          dense
          :true-value="true"
          :false-value="false"
          :label="underground_type"
          :toggle-indeterminate="false"
          @update:model-value="underground_switch"
        >
        </q-toggle>
      </div>
      <div v-if="is_underground" class="row q-gutter-x-md content-top">
        <q-select
          class="col-4"
          v-model="underground_data.palace_name"
          :options="underground_options"
          emit-value
          map-options
          label="选择区域"
          outlined
          dense
          size="sm"
          @update:model-value="underground_main_change"
        />
        <q-select
          class="col"
          v-if="underground_options_state.length > 0"
          v-model="underground_data.palace_level"
          :options="underground_options_state"
          emit-value
          map-options
          label="选择层级"
          outlined
          dense
          size="sm"
          multiple
          use-chips
          @update:model-value="underground_update"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import _ from "lodash";
import { ref, computed } from "vue";
import funcExtraData from "../../extra-data";

const build_data = (data = {}) => {
  const palace_name = _.get(data, "palace_name", null);
  const palace_level = _.get(data, "palace_level", []);

  return {
    palace_name,
    palace_level,
  };
};

const normalize_data = (data = {}) => {
  if (_.isNil(data.palace_name)) {
    return null;
  }

  return data;
};

const underground_options = [
  { label: "无区域", value: "ug" },
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
];

export default {
  name: "PluginSumeruPalaceEdit",
  setup() {
    const underground_data_value = ref(build_data({}));
    const underground_data = computed({
      get() {
        return underground_data_value.value;
      },
      set(val) {
        underground_data_value.value = build_data(val);
      },
    });
    const is_underground = ref(false);
    const underground_type = computed(() =>
      is_underground.value ? "地下" : "地上"
    );

    const underground_switch = (val) => {
      if (val) {
        underground_data.value = { palace_name: "ug" };
      } else {
        underground_data.value = {};
      }

      underground_update();
    };

    const underground_main_change = () => {
      underground_data.value.palace_level = [];
      underground_update();
    };

    const underground_update = () => {
      funcExtraData.put_marker_extra_data_entry(
        "sumeru_palace",
        normalize_data(underground_data.value)
      );
    };

    return {
      ...funcExtraData,
      is_underground,
      underground_data,
      underground_type,
      underground_options,

      underground_switch,
      underground_main_change,
      underground_update,
    };
  },
  computed: {
    underground_options_state() {
      const found_selector =
        _.find(
          this.underground_options,
          (v) => v.value === this.underground_data.palace_name
        ) || {};
      const states = found_selector.children || [];
      return states;
    },
  },
};
</script>
