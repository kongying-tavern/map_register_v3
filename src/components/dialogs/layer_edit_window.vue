<template>
  <q-card class="q-pa-md" style="max-width: 50vw">
    <!-- <div><q-toggle v-model="extra_mode" label="高级模式" /></div> -->
    <div class="row justify-between">
      <q-list bordered separator style="min-width: 500px">
        <q-item v-show="layer_info.id == '' ? false : true">
          <q-item-section> 点位编号 </q-item-section>
          <q-item-section>
            <q-input outlined v-model="layer_info.id" readonly> </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> 点位名称 </q-item-section>
          <q-item-section>
            <q-input
              outlined
              v-model="layer_info.markerTitle"
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
              v-model="layer_info.content"
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
                  layer_info.picture == ''
                    ? 'https://assets.yuanshen.site/images/noImage.png'
                    : layer_info.picture
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
        <q-item
          v-if="propdata.list.item_child.length != 0"
          v-for="(i, index) in propdata.list.item_child"
        >
          <q-item-section> {{ i.name }} </q-item-section>
          <q-item-section>
            <q-select
              outlined
              v-model="item_child_value_list[index]"
              :options="item_child_options_list[index]"
              :label="i.name"
            />
            <!-- <q-checkbox
              v-model="item_child_count[index]"
              :true-value="1"
              :false-value="0"
              label="是否计数"
            /> -->
          </q-item-section>
        </q-item>
        <!-- <q-item v-else>
          <q-item-section> 是否计数 </q-item-section>
          <q-item-section>
            <q-checkbox
              v-model="item_count"
              :true-value="1"
              :false-value="0"
              label="是否计数"
            />
          </q-item-section>
        </q-item> -->
        <q-item
          v-if="propdata.type == 1 && propdata.list.area.name == '梦想群岛'"
        >
          <q-item-section> 所属岛屿 </q-item-section>
          <q-item-section>
            <island-selector @callback="island_callback"></island-selector>
          </q-item-section>
        </q-item>
      </q-list>
      <!-- <q-list v-show="extra_mode" bordered separator style="margin-left: 10px">
      </q-list> -->
    </div>
    <div style="margin-top: 10px">
      <q-btn color="primary" label="保存" @click="upload_layerdata" />
      <q-btn
        color="primary"
        flat
        style="margin-left: 20px"
        v-close-popup
        label="取消"
        @click="add_cancel"
      />
    </div>
    <!-- 裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="upload_img_base64" @screenshot="cut_img"></img-cut>
    </q-dialog>
    <!-- 查看大图弹窗 -->
    <q-dialog v-model="fullimg_window">
      <q-card style="width: 50vw; height: 50vh">
        <q-img
          :src="layer_info.picture"
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
    <q-inner-loading :showing="page_loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {
  query_itemtype,
  query_itemlist,
  upload_img,
} from "../../service/base_data_request";
import {
  upload_layer,
  upload_layer_extralabel,
  edit_layer,
} from "../../service/edit_request";
import ImgCut from "./vue-cropper.vue";
import IslandSelector from "../v2.8/island_value_selector.vue";
import { create_notify } from "../../api/common";
export default {
  name: "LayerEdit",
  props: ["propdata"],
  data() {
    return {
      extra_mode: false,
      layer_info: {
        id: "",
        markerTitle: "",
        content: "",
        picture: "",
      },
      cropper_window: false,
      fullimg_window: false,
      cropper_img: "",
      upload_img_file: null,
      upload_img_base64: "",
      item_child_value_list: [],
      item_child_options_list: [],
      item_count: 1,
      item_child_count: [],
      page_loading: true,
      island_callback_data: null,
    };
  },
  components: {
    ImgCut,
    IslandSelector,
  },
  methods: {
    //查看大图
    check_fullimg() {
      if (this.layer_info.picture != "") {
        this.fullimg_window = true;
      }
    },
    //开启文件选择器
    open_filepicker() {
      this.$refs.img_upload.pickFiles();
    },
    //上传图片加以裁剪，以及裁剪前处理
    upload_crooper_img() {
      if (this.upload_img_file != null) {
        //将图片转化为base64
        let img = this.upload_img_file;
        let fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.upload_img_base64 = res.target.result;
          //在转换完成后清除file，以重新触发input事件
          this.upload_img_file = null;
        };
        this.cropper_window = true;
      }
    },
    //返回裁剪后的数据
    cut_img(data) {
      this.layer_info.picture = data;
    },
    //提交要上传的数据
    async upload_layerdata() {
      this.loading = true;
      let upload_data = {
        itemList: [],
        markerTitle: this.layer_info.markerTitle,
        position: this.propdata.position,
        picture: this.layer_info.picture,
        hiddenFlag: this.propdata.list.item.hiddenFlag,
        markerCreatorId: Number(localStorage.getItem("_yuanshen_dadian_user")),
        videoPath: "",
        pictureCreatorId: Number(localStorage.getItem("_yuanshen_dadian_user")),
        refreshTime: this.propdata.list.item.defaultRefreshTime,
        content: this.layer_info.content,
      };
      //如果是多item，则逐个插入，否则单独插入
      if (this.item_child_count.length != 0) {
        for (let i of this.item_child_value_list)
          upload_data.itemList.push({
            itemId: i.value,
            count: this.propdata.list.item.defaultCount,
          });
      } else {
        upload_data.itemList.push({
          itemId: this.propdata.list.item.itemId,
          count: this.propdata.list.item.defaultCount,
        });
      }
      //如果上传了图片，将其上传至图床
      if (upload_data.picture.indexOf("base64") != -1) {
        let date = Date.now();
        let res = await upload_img(date, upload_data.picture);
        upload_data.picture = `https://yuanshen.site${res.data.path}`;
      }
      //根据类型不同走不同的接口
      switch (this.propdata.type) {
        case 1:
          //如果有海岛的数据，则验证一下
          if (this.propdata.list.area.name == "梦想群岛") {
            if (this.island_callback_data == null) {
              alert("请正确选择岛屿及其形态");
              return;
            }
          }
          upload_layer(upload_data).then((res) => {
            if (res.data.code == 200) {
              if (this.propdata.list.area.name == "梦想群岛") {
                upload_layer_extralabel({
                  markerId: res.data.data,
                  markerExtraContent: this.island_callback_data,
                  isRelated: upload_data.itemList.length > 1 ? 1 : 0,
                }).then((res) => {
                  create_notify(res.data.message);
                  this.loading = false;
                });
              }
              create_notify(res.data.message);
            }
          });
          break;
        case 2:
          upload_data = {
            ...upload_data,
            id: this.propdata.data.id,
            position: this.propdata.data.position,
          };
          edit_layer(upload_data).then((res) => {
            create_notify(res.data.message);
            this.loading = false;
          });
          break;
      }
    },
    //取消新增
    add_cancel() {
      if (this.propdata.type == 1) {
        this.$emit("add_cancel");
      }
    },
    //海岛回调
    island_callback(val) {
      this.island_callback_data = val;
    },
  },
  mounted() {
    console.log(this.propdata);
    this.layer_info = { ...this.layer_info, ...this.propdata.data };
    //如果有子分类的话，查询子分类的各项选项
    if (this.propdata.list.item_child.length != 0) {
      let arr = [];
      for (let i of this.propdata.list.item_child) {
        arr.push(
          query_itemlist({
            typeIdList: [i.typeId],
            areaIdList: [this.propdata.list.area.areaId],
            current: 0,
            size: 999,
          })
        );
      }
      this.$axios.all(arr).then((res) => {
        for (let i in res) {
          this.item_child_options_list.push([]);
          for (let j of res[i].data.data.record) {
            this.item_child_options_list[i].push({
              label: j.name,
              value: j.itemId,
            });
          }
        }
        switch (this.propdata.type) {
          //如果是新增的话，填写一些默认字段
          case 1:
            this.layer_info = {
              ...this.layer_info,
              markerTitle: `${this.propdata.list.area.name} - ${this.propdata.list.type.name}`,
              content: `${this.propdata.list.area.name}${this.propdata.list.type.name}`,
            };
            break;
          //如果是编辑的话，匹配下拉列表的选项
          case 2:
            this.item_child_value_list = [];
            for (let i of this.propdata.data.itemList) {
              this.item_child_count.push(i.count);
              for (let j of this.item_child_options_list) {
                let item = j.find((item) => item.value == i.itemId);
                if (item != undefined) {
                  this.item_child_value_list.push(item);
                }
              }
            }
            break;
        }
        this.page_loading = false;
      });
    } else {
      switch (this.propdata.type) {
        //如果是新增的话，填写一些默认字段
        case 1:
          this.layer_info = {
            ...this.layer_info,
            markerTitle: `${this.propdata.list.item.name}`,
            content: `这是一个${this.propdata.list.item.defaultContent}`,
          };
          break;
        //如果是编辑的话，匹配下拉列表的选项
        case 2:
          this.item_count = this.propdata.data.itemList[0].count;
          break;
      }
      this.page_loading = false;
    }
  },
};
</script>

<style>
</style>