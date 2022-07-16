<template>
  <div class="IslandSelector">
    <div class="row">
      <div
        class="row col-12 items-center"
        v-for="(item, index) in island_name_list"
        :key="index"
      >
        <div class="col-12" :class="`text-${island_color[index]}`">
          <span style="font-weight: bold">{{ item }}</span>
        </div>
        <div class="col-12">
          <q-option-group
            inline
            v-model="island_type_index[index]"
            :options="get_options(index)"
            color="primary"
            @update:model-value="return_islandtype"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { layergroup_register } from "../../api/layer";
import { add_map_overlay_qd } from "../../api/map";
const island_name_list = ["危危岛", "破破岛", "双双岛", "布丁岛"];
const island_color = ["purple", "cyan", "primary", "red"];
const island_type_list = [
  ["初始", "沉入水下"],
  ["初始", "低", "高"],
  ["初始", "形态2", "形态3", "形态4"],
  [
    "初始",
    "优悠-优悠",
    "优悠-浮光",
    "优悠-磐固",
    "浮光-优悠",
    "浮光-浮光",
    "浮光-磐固",
    "磐固-优悠",
    "磐固-浮光",
    "磐固-磐固",
  ],
];
export default {
  name: "IslandSelector",
  data() {
    return {
      island_name_list,
      island_color,
      island_type_list,
      island_map: new Map(),
      island_type_index: [0, 0, 0, 0],
      handle_group: layergroup_register(),
    };
  },
  props: ["map"],
  methods: {
    get_options(index) {
      let option = [];
      for (let [key, value] of island_type_list[index].entries()) {
        option.push({
          label: value,
          value: key,
        });
      }
      return option;
    },
    return_islandtype() {
      this.handle_group.clearLayers();
      let islandshort = ["ww", "pp", "ss", "bd"];
      for (let i in this.island_type_index) {
        let img = add_map_overlay_qd(islandshort[i], this.island_type_index[i]);
        this.handle_group.addLayer(img);
        this.island_map.set(islandshort[i], img);
      }
      this.map.addLayer(this.handle_group);
    },
  },
  mounted() {
    this.return_islandtype();
  },
};
</script>

<style>
</style>