<template>
  <q-item>
    <q-item-section side top> 所属岛屿 </q-item-section>
    <q-item-section>
      <div class="row q-gutter-x-md content-top">
        <q-select
          class="col-4"
          v-model="island_data.island_name"
          :options="island_options"
          emit-value
          map-options
          label="选择岛屿"
          outlined
          dense
          size="sm"
          @update:model-value="island_select_main" />
        <q-select
          class="col"
          v-if="island_options_state.length > 0"
          v-model="island_data.island_state"
          :options="island_options_state"
          emit-value
          map-options
          label="岛屿形态"
          outlined
          dense
          size="sm"
          multiple
          use-chips
          @update:model-value="island_update" />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import _ from 'lodash';
import funcExtraData from '../../extra-data'

export default {
  name: 'Plugin28IslandEdit',
  setup() {
    return {
      ...funcExtraData
    }
  },
  data() {
    return {
      island_options: [
        { label: "无", value: null },
        {
          label: "危危岛",
          value: "ww",
          children: [
            { label: "初始", value: "0" },
            { label: "沉入水下", value: "1" },
          ]
        },
        {
          label: "破破岛",
          value: "pp",
          children: [
            { label: "初始", value: "0" },
            { label: "低", value: "2" },
            { label: "高", value: "1" },
          ]
        },
        {
          label: "双双岛",
          value: "ss",
          children: [
            { label: "初始", value: "0" },
            { label: "最终形态", value: "3" }
          ]
        },
        {
          label: "布丁岛",
          value: "bd",
          children: [
            { label: "初始", value: "0-0" },
            { label: "任意-优悠", value: "0-1" },
            { label: "任意-浮光", value: "0-2" },
            { label: "任意-磐固", value: "0-3" },
            { label: "优悠-任意", value: "1-0" },
            { label: "浮光-任意", value: "2-0" },
            { label: "磐固-任意", value: "3-0" },
            { label: "优悠-优悠", value: "1-1" },
            { label: "优悠-浮光", value: "1-2" },
            { label: "优悠-磐固", value: "1-3" },
            { label: "磐固-优悠", value: "3-1" },
            { label: "磐固-浮光", value: "3-2" },
            { label: "磐固-磐固", value: "3-3" },
            { label: "浮光-优悠", value: "2-1" },
            { label: "浮光-浮光", value: "2-2" },
            { label: "浮光-磐固", value: "2-3" },
          ]
        },
      ]
    };
  },
  computed: {
    island_data() {
      const island_data = _.get(this.layer_extra_data, '2_8_island', null) || {}
      const island_name = _.get(island_data, 'island_name', null);
      const island_state = _.get(island_data, 'island_state', []);

      return {
        island_name,
        island_state
      };
    },
    island_options_state() {
      const found_selector = _.find(this.island_options, v => v.value === this.island_data.island_name) || {}
      const states = found_selector.children || []
      return states;
    },
    island_data_parsed() {
      if(_.isNil(this.island_data.island_name)) {
        return null;
      }

      return this.island_data;
    }
  },
  methods: {
    load_data() {
      const island_data = _.get(this.extraData, '2_8_island', null) || {}
      const island_name = _.get(island_data, 'island_name', null);
      const island_state = _.get(island_data, 'island_state', []);

      this.island_data = {
        island_name,
        island_state
      }
    },
    island_select_main() {
      this.island_data.island_state = [];
      this.island_update();
    },
    island_update() {
      this.put_marker_extra_data_entry('2_8_island', this.island_data_parsed);
    }
  }
}
</script>
