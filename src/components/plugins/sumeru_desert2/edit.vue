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
          v-model="underground_data.ug_name"
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
          v-model="underground_data.ug_level"
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

const build_data = (data = {}) => {
  const ug_name = _.get(data, "ug_name", null);
  const ug_level = _.get(data, "ug_level", []);

  return {
    ug_name,
    ug_level,
  };
};

const normalize_data = (data = {}) => {
  if (_.isNil(data.ug_name)) {
    return null;
  }

  return data;
};

const underground_options = [{ label: "无区域", value: "ug" }];

export default {
  name: "PluginSumeruDesert2Edit",
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
        underground_data.value = { ug_name: "ug" };
      } else {
        underground_data.value = {};
      }

      underground_update();
    };

    const underground_main_change = () => {
      underground_data.value.ug_level = [];
      underground_update();
    };

    const underground_update = () => {
      funcExtraData.put_marker_extra_data_entry(
        "sumeru_desert2",
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
          (v) => v.value === this.underground_data.ug_name
        ) || {};
      const states = found_selector.children || [];
      return states;
    },
  },
};
</script>
