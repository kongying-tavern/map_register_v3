<!--
 * @Description:
 * @Author: HuangWenXin
 * @Date: 2022-07-19 10:30:27
 * @LastEditors: HuangWenXin
 * @LastEditTime: 2022-07-19 18:40:02
-->
<template>
  <div id="opened_popup row">
    <div class="text">
      <p>{{ layer_data.markerTitle }} id:{{ layer_data.id }}</p>
      <q-img
        class="layer_img"
        :src="
          layer_data.picture == ''
            ? 'https://assets.yuanshen.site/images/noImage.png'
            : layer_data.picture
        "
        spinner-color="primary"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-primary text-white">
            没有相关图片
          </div>
        </template>
      </q-img>
      <p>点位描述：{{ layer_data.content }}</p>
      <p>点位显示状态：{{ layerhidden }}</p>
    </div>
    <div class="btns row justify-between">
      <q-btn
        flat
        :label="item"
        v-for="(item, index) in btn_labels"
        :key="index"
        @click="callback_handle(index)"
        color="primary"
      ></q-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "PopupWindow",
  data() {
    return {
      layer_data: {},
      btn_labels: ["修改", "标记", "更改坐标", "删除"],
    };
  },
  props: ["layer", "map"],
  methods: {
    //向父组件传递事件类型
    callback_handle(type) {
      this.$emit("callback", {
        type: type,
        layer: this.layer,
        data: this.layer_data,
      });
    },
    //标记点位
    mark_layer() {},
  },
  mounted() {},
  computed: {
    layerhidden() {
      if (this.layer != null && this.layer_data != null) {
        let hiddenState = ""
        switch(this.layer_data.hiddenFlag){
          case 0:
            hiddenState = "显示"
            break
          case 1:
            hiddenState = "隐藏"
            break
          case 2:
            hiddenState = "内鬼"
            break
          default:
            hiddenState = "未知"
            break
        }
        return hiddenState;
      }
      else return "未知"
    },
  },
  watch: {
    layer: function (val) {
      console.log(val);
      this.layer_data = val.target.options.data;
    },
  },
};
</script>
<style scoped>
p {
  margin: 10px auto;
  font-size: 16px;
}
</style>
<style>
.leaflet-popup-content {
  width: 100% !important;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.leaflet-popup-close-button {
  zoom: 2;
}
</style>
