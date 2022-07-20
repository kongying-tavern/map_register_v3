<template>
  <div>
    <q-select outlined v-model="callback_data.island_name" :options="island_name_list" label="选择岛屿"
      @update:model-value="extra_select_check" />
    <q-select outlined multiple use-chips stack-label
      v-show="callback_data.island_name != null && island_isempty == false" v-model="callback_data.island_type"
      :options="island_type_options" label="岛屿形态" style="margin-top: 10px" />
  </div>
</template>

<script>
export default {
  name: "IslandSelector",
  data() {
    return {
      island_name: null,
      island_name_list: [
        { label: "无", value: "0" },
        { label: "危危岛", value: "ww" },
        { label: "破破岛", value: "pp" },
        { label: "双双岛", value: "ss" },
        { label: "布丁岛", value: "bd" },
      ],
      island_type: null,
      island_type_options: [],
      bd_left: null,
      bd_right: null,
      island_type_list: [
        { label: "无", value: "0" },
        [
          { label: "初始", value: "0" },
          { label: "沉入水下", value: "1" },
        ],
        [
          { label: "初始", value: "0" },
          { label: "低", value: "2" },
          { label: "高", value: "1" },
        ],
        [
          { label: "初始", value: "0" },
          { label: "最终形态", value: "3" }
        ],
        [
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
        ],
      ],
      callback_data: {
        island_name: null,
        island_type: [],
      },
      island_isempty: false,
    };
  },
  props: ["propdata"],
  methods: {
    extra_select_check(value) {
      this.callback_data.island_type = [];
      let index = this.island_name_list.findIndex((item) => item == value);
      this.island_type_options = this.island_type_list[index];
      if (value.value == "0") {
        this.island_isempty = true;
      } else {
        this.island_isempty = false;
      }
    },
  },
  watch: {
    callback_data: {
      handler(val) {
        if (val.island_name.value != "0") {
          let arr = [];
          for (let i of val.island_type) {
            arr.push(i.value);
          }
          let data = JSON.stringify({
            "2_8_island": {
              island_name: val.island_name.value,
              island_state: arr,
            },
          });
          this.$emit("callback", data);
        } else {
          this.$emit("callback", 0);
        }
      },

      deep: true,
    },
  },
  mounted() {
    if (this.propdata != undefined) {
      if (
        this.propdata.markerExtraContent != null &&
        this.propdata.markerExtraContent != "{}" &&
        this.propdata.markerExtraContent != "0"
      ) {
        let data = JSON.parse(this.propdata.markerExtraContent);
        this.callback_data.island_name = this.island_name_list.find(
          (item) => item.value == data["2_8_island"].island_name
        );
        let index = this.island_name_list.findIndex(
          (item) => item.value == data["2_8_island"].island_name
        );
        let arr = [];
        for (let i of data["2_8_island"].island_state) {
          let item = this.island_type_list[index].find(
            (item) => item.value == i
          );
          arr.push(item);
        }
        this.extra_select_check(this.callback_data.island_name);
        this.callback_data.island_type = arr;
      } else {
        this.callback_data.island_name = this.island_name_list[0];
        this.island_isempty = true;
      }
    } else {
      this.callback_data.island_name = this.island_name_list[0];
      this.island_isempty = true;
      this.$emit("callback", 0);
    }
  },
};
</script>

<style>
</style>
