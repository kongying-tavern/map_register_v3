<!-- 图片裁剪 -->
<template>
  <div class="cropper_containor">
    <div class="cropper_area">
      <vueCropper
        ref="cropper"
        :img="crooper_img"
        :outputSize="option.size"
        :outputType="option.outputType"
        :info="true"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :original="option.original"
        :autoCrop="option.autoCrop"
        :centerBox="option.centerBox"
        :infoTrue="option.infoTrue"
        :fixed="option.fixed"
        :fixedBox="option.fixedBox"
        @realTime="img_perview"
      ></vueCropper>
    </div>
    <div class="cropper_option">
      <span class="option_title">图片预览</span>
      <div :style="perview_img_style">
        <div :style="perview_img.div">
          <img :src="perview_img.url" :style="perview_img.img" />
        </div>
      </div>
      <q-card-section class="row justify-center">
        <q-btn
          label="确认"
          v-close-popup
          color="primary"
          @click="cut_img"
        ></q-btn>
        <q-btn label="取消" v-close-popup style="margin-left: 30px"></q-btn>
      </q-card-section>
    </div>
  </div>
</template>

<script>
import 'vue-cropper/dist/index.css'
import { VueCropper } from "vue-cropper";
export default {
  name: "ImgCut",
  data() {
    return {
      perview_img: "",
      perview_img_style: "",
      option: {
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 512, // 默认生成截图框宽度
        autoCropHeight: 512, // 默认生成截图框高度
        fixed: true,
        fixedBox: false, // 固定截图框大小 不允许改变
        canMoveBox: true, // 截图框能否拖动
        original: true, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: false, // True 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
    };
  },
  components: {
    VueCropper,
  },
  props: ["crooper_img"],
  methods: {
    // 预览图生成
    img_perview(data) {
      const previews = data;
      this.perview_img_style = {
        width: previews.w + "px",
        height: previews.h + "px",
        overflow: "hidden",
        margin: "0 auto",
        zoom: 200 / previews.w,
      };
      this.perview_img = data;
    },
    // 截图
    cut_img() {
      this.$refs.cropper.getCropData((data) => {
        this.$emit("screenshot", data);
      });
    },
  },
  mounted() {},
};
</script>
<style scoped>
.cropper_containor {
  box-shadow: none;
  position: relative;
  width: 1280px;
  max-width: 1920px;
  height: 720px;
  overflow: hidden;
}
.cropper_area {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.cropper_option {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 320px;
  background: #fff;
  overflow: hidden;
}
.perview_img {
  display: block;
  width: 150px;
  height: 150px;
  margin: 20px auto;
  overflow: hidden;
}
.option_title {
  width: 100%;
  text-align: center;
  display: block;
  font-size: 20px;
  margin-top: 20px;
}
</style>