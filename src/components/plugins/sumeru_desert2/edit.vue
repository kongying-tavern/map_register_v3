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
      <!-- <div v-if="is_underground" class="row q-gutter-x-md content-top">
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
      </div> -->
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
    ug_name: name,
    ug_level: levels,
  };
};

const underground_options = [{ label: "无区域", value: "ug" }];

export default {
  name: "PluginSumeruDesert2Edit",
  setup() {
    const is_underground_val = ref(false);
    const is_underground = computed({
      get() {
        const name_val = _.get(
          funcExtraData.get_marker_extra_data_entry("sumeru_desert2"),
          "ug_name"
        );
        return is_underground_val.value || Boolean(name_val);
      },
      set(val) {
        is_underground_val.value = val;
      },
    });
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
        "sumeru_desert2",
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
      const data_val = this.get_marker_extra_data_entry("sumeru_desert2") || {};
      const name_val = _.get(data_val, "ug_name", "");
      const levels_val = _.get(data_val, "ug_level", []);
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
