<template>
  <div>
    <q-card class="row q-pa-md" style="width: 500px">
      <div class="col-12">
        <q-list bordered separator>
          <q-item v-show="layer_detail.markerId == undefined ? false : true">
            <q-item-section> 点位编号 </q-item-section>
            <q-item-section>
              <q-input outlined v-model="layer_detail.markerId" readonly>
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section> 点位名称 </q-item-section>
            <q-item-section>
              <q-input
                outlined
                v-model="layer_detail.markerTitle"
                placeholder="点位名称"
              >
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section> 点位说明 </q-item-section>
            <q-item-section>
              <q-input
                outlined
                type="textarea"
                style="white-space: pre-line"
                v-model="layer_detail.content"
                placeholder="点位说明"
              >
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section> 点位图像 </q-item-section>
            <q-item-section>
              <div class="row justify-center">
                <q-img
                  :src="
                    layer_detail.picture == null
                      ? `${VITE_ASSET_BASE}/images/noImage.png`
                      : layer_detail.picture
                  "
                  spinner-color="white"
                  style="height: 150px; max-width: 150px; cursor: pointer"
                  @click="check_fullimg"
                >
                  <template v-slot:error>
                    <div
                      class="absolute-full flex flex-center bg-primary text-white"
                    >
                      没有相关图片
                    </div>
                  </template>
                </q-img>
              </div>
              <q-btn
                label="上传图像"
                @click="open_filepicker"
                color="primary"
                style="margin-top: 20px"
              >
                <q-file
                  v-show="false"
                  v-model="upload_img_file"
                  ref="img_upload"
                  label="Standard"
                  @update:model-value="upload_crooper_img"
                />
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-12" style="margin-top: 10px">
        <q-btn color="primary" label="保存" />
        <q-btn
          color="primary"
          flat
          style="margin-left: 20px"
          v-close-popup
          label="取消"
        />
      </div>
    </q-card>
    <!-- 裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="upload_img_base64" @screenshot="cut_img"></img-cut>
    </q-dialog>
    <!-- 查看大图弹窗 -->
    <q-dialog v-model="fullimg_window">
      <q-card style="width: 50vw; height: 50vh">
        <q-img
          :src="layer_detail.picture"
          spinner-color="white"
          style="height: 100%; max-width: 100%"
          @click="check_fullimg"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-negative text-white">
              无图像
            </div>
          </template>
        </q-img>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import ImgCut from "./vue-cropper.vue";
export default {
  name: "LayerDetailWindow",
  props: ["detail"],
  setup() {
    return {
      VITE_ASSET_BASE: import.meta.env.VITE_ASSET_BASE,
    };
  },
  data() {
    return {
      layer_detail: {},
      cropper_window: false,
      fullimg_window: false,
      cropper_img: "",
      upload_img_file: null,
      upload_img_base64: "",
    };
  },
  components: {
    ImgCut,
  },
  methods: {
    // 开启文件选择器
    open_filepicker() {
      this.$refs.img_upload.pickFiles();
    },
    // 上传图片加以裁剪，以及裁剪前处理
    upload_crooper_img() {
      if (this.upload_img_file !== null) {
        // 将图片转化为base64
        const img = this.upload_img_file;
        const fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.upload_img_base64 = res.target.result;
          // 在转换完成后清除file，以重新触发input事件
          this.upload_img_file = null;
        };

        this.cropper_window = true;
      }
    },
    // 返回裁剪后的数据
    cut_img(data) {
      this.cropper_img = data;
    },
    // 查看大图
    check_fullimg() {
      this.fullimg_window = true;
    },
  },
  mounted() {
    this.layer_detail = { ...this.detail };
  },
};
</script>

<style></style>
