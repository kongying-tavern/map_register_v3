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