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
          v-model="underground_name"
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
          v-model="underground_levels"
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

const normalize_data = (is_ug = false, name = "", levels = []) => {
  if (!is_ug) {
    return null;
  }

  if (!name) {
    return null;
  }

  return {
    palace_name: name,
    palace_level: levels,
  };
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
    const is_underground = ref(false);
    const name = ref("");
    const levels = ref([]);
    const underground_type = computed(() =>
      is_underground.value ? "地下" : "地上"
    );

    const underground_switch = (val) => {
      if (val) {
        name.value = "ug";
        levels.value = [];
      } else {
        name.value = "";
        levels.value = [];
      }

      underground_update();
    };

    const underground_main_change = () => {
      levels.value = [];
      underground_update();
    };

    const underground_update = () => {
      funcExtraData.put_marker_extra_data_entry(
        "sumeru_palace",
        normalize_data(is_underground.value, name.value, levels.value)
      );
    };

    return {
      ...funcExtraData,
      is_underground,
      underground_name: name,
      underground_levels: levels,

      underground_type,
      underground_options,

      underground_switch,
      underground_main_change,
      underground_update,
    };
  },
  mounted() {
    this.$nextTick().then(() => {
      const data_val = this.get_marker_extra_data_entry("sumeru_palace") || {};
      const name_val = _.get(data_val, "palace_name", "");
      const levels_val = _.get(data_val, "palace_level", []);
      if (name_val) {
        this.is_underground = true;
        this.underground_name = name_val;
        this.underground_levels = levels_val;
      } else {
        this.is_underground = false;
        this.underground_name = "";
        this.underground_levels = [];
      }
    });
  },
  computed: {
    underground_options_state() {
      const found_selector =
        _.find(
          this.underground_options,
          (v) => v.value === this.underground_name
        ) || {};
      const states = found_selector.children || [];
      return states;
    },
  },
};
</script>
