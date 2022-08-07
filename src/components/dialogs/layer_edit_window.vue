<template>
  <q-card class="q-pa-md" style="max-width: 50vw;">
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
            <q-input outlined v-model="layer_info.markerTitle" placeholder="点位名称">
            </q-input>
          </q-item-section>
        </q-item>
        <!-- 如果是宝箱的话，提供品质和方式选择 -->
        <q-item v-if="propdata.list.item_child.length != 0" v-for="(i, index) in propdata.list.item_child">
          <q-item-section> {{ i.name }} </q-item-section>
          <q-item-section>
            <q-select outlined v-model="item_child_value_list[index]" :options="item_child_options_list[index]"
              :label="i.name" />
          </q-item-section>
        </q-item>
        <!-- 如果是海岛的点位的话，提供岛屿形态的选择 -->
        <q-item v-if="propdata.list.area.name == '金苹果群岛'">
          <q-item-section> 所属岛屿 </q-item-section>
          <q-item-section>
            <island-selector :propdata="propdata.data" @callback="island_callback"></island-selector>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> 点位说明 </q-item-section>
          <q-item-section>
            <q-input outlined type="textarea" style="white-space: pre-line" v-model="layer_info.content"
              placeholder="点位说明">
            </q-input>
          </q-item-section>
        </q-item>


        <q-item>
          <q-item-section> 点位图像 </q-item-section>
          <q-item-section>
            <div class="row justify-center">
              <q-img :src="
                  layer_info.picture == ''
                    ? 'https://assets.yuanshen.site/images/noImage.png'
                    : layer_info.picture
                " spinner-color="white" style="height: 150px; max-width: 150px; cursor: pointer"
                @click="check_fullimg">
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-primary text-white">
                    没有相关图片
                  </div>
                </template>
              </q-img>
            </div>
            <q-btn label="上传图像" @click="open_filepicker" color="primary" style="margin-top: 20px">
              <q-file v-show="false" v-model="upload_img_file" ref="img_upload" label="Standard"
                @update:model-value="upload_crooper_img" />
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item-section></q-item-section>
        <q-item>
          <q-item-section></q-item-section>
          <q-item-section>
            <q-checkbox v-if="!is_neigui" v-model="layer_info.hiddenFlag" :true-value="0" :false-value="1"
              label="点位显示/隐藏" />
            <q-toggle v-else v-model="layer_info.hiddenFlag" toggle-indeterminate :true-value="0" :false-value="1"
              :indeterminate-value="2" :label="{
                0: '显示点位',
                1: '隐藏点位',
                2: '内鬼点位',
              }[layer_info.hiddenFlag] || '点位显示/隐藏'">
            </q-toggle>
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

      </q-list>
    </div>
    <div style="margin-top: 10px">
      <q-btn color="primary" label="保存" @click="upload_layerdata" />
      <q-btn color="primary" flat style="margin-left: 20px" v-close-popup label="取消" @click="cancel" />
    </div>
    <!-- 裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="upload_img_base64" @screenshot="cut_img"></img-cut>
    </q-dialog>
    <!-- 查看大图弹窗 -->
    <q-dialog v-model="fullimg_window">
      <q-card style="width: 50vw; height: 50vh">
        <q-img :src="layer_info.picture" spinner-color="white" style="height: 100%; max-width: 100%"
          @click="check_fullimg">
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-negative text-white">
              无图像
            </div>
          </template>
        </q-img>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading">
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
    edit_layer_extralabel,
    edit_layer,
  } from "../../service/edit_request";
  import {
    get_user_id,
    has_user_role
  } from "../../service/user_info"
  import ImgCut from "./vue-cropper.vue";
  import IslandSelector from "../v2.8/island_value_selector.vue";
  import {
    create_notify
  } from "../../api/common";
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
          hiddenFlag: 0,
        },
        cropper_window: false,
        fullimg_window: false,
        cropper_img: "",
        upload_img_file: null,
        upload_img_base64: "",
        item_child_value_list: [],
        item_child_options_list: [],
        item_count: false,
        loading: false,
        island_propdata: null,
        island_callback_data: null,
      };
    },

    computed: {
      is_neigui() {
        return has_user_role('MAP_NEIGUI');
      },

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
          id: undefined,
          itemList: [],
          markerTitle: this.layer_info.markerTitle,
          position: this.propdata.position,
          picture: this.layer_info.picture,
          hiddenFlag: 0,
          markerCreatorId: get_user_id(),
          videoPath: "",
          pictureCreatorId: get_user_id(),
          refreshTime: 0,
          content: this.layer_info.content,
          markerExtraContent: undefined,
        };
        //如果上传了图片，将其上传至图床
        if (upload_data.picture.indexOf("base64") != -1) {
          let date = Date.now();
          let res = await upload_img(date, upload_data.picture);
          upload_data.picture = `https://yuanshen.site${res.data.path}`;
        }
        //宝箱品质和方式至少选择一个
        if (this.propdata.list.item_child.length != 0) {
          if (this.item_child_value_list.length == 0) {
            alert("请选择宝箱品质或打开方式");
            this.loading = false;
            return;
          } else {
            for (let i of this.item_child_value_list) {
              if (i != undefined) {
                upload_data.itemList.push({
                  count: 1,
                  itemId: i.value,
                });
              }
            }
          }
        } else {
          upload_data.itemList.push({
            count: this.propdata.list.item.defaultCount,
            itemId: this.propdata.list.item.itemId,
          });
        }
        //根据类型不同走不同的接口
        switch (this.propdata.type) {
          case 1:
            upload_layer(upload_data).then((res) => {
              create_notify(res.data.message);
              if (this.propdata.list.area.name == "金苹果群岛") {
                if (this.island_callback_data != 0) {
                  upload_layer_extralabel({
                    markerId: res.data.data,
                    markerExtraContent: this.island_callback_data,
                    isRelated: upload_data.itemList.length > 1 ? 1 : 0,
                  }).then((res) => {
                    create_notify(res.data.message);
                    this.loading = false;
                    this.$emit("refresh");
                  });
                } else {
                  this.loading = false;
                  this.$emit("refresh");
                }
              } else {
                this.loading = false;
                this.$emit("refresh");
              }
            });
            break;
          case 2:
            upload_data = {
              ...upload_data,
              id: this.propdata.data.id,
              position: this.propdata.data.position,
              hiddenFlag: this.layer_info.hiddenFlag,
              refreshTime: this.layer_info.refreshTime,
              markerExtraContent: this.propdata.data.markerExtraContent,
            };
            edit_layer(upload_data).then((res) => {
              create_notify(res.data.message);
              if (
                JSON.stringify(JSON.parse(this.island_callback_data)) !=
                JSON.stringify(JSON.parse(upload_data.markerExtraContent))
              ) {
                edit_layer_extralabel({
                  isRelated: upload_data.itemList.length > 1 ? 1 : 0,
                  markerId: upload_data.id,
                  markerExtraContent: this.island_callback_data == 0 ?
                    null : this.island_callback_data,
                }).then((res) => {
                  this.loading = false;
                  this.$emit("refresh");
                });
              } else {
                this.loading = false;
                this.$emit("refresh");
              }
            });
            break;
        }
      },
      //海岛回调
      island_callback(val) {
        this.island_callback_data = val;
      },
      //取消
      cancel() {
        this.$emit("cancel");
      },

      // 获取数据

    },
    mounted() {

      this.layer_info = {
        ...this.layer_info,
        ...this.propdata.data
      };
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
          console.log(res);
          return
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
              for (let i of this.item_child_options_list) {
                for (let j of this.propdata.data.itemList) {
                  let item = i.find((item) => item.value == j.itemId);
                  if (item != undefined) {
                    this.item_child_value_list.push(item);
                  }
                }
              }
              console.log(
                this.item_child_value_list,
                this.item_child_options_list
              );
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
              content: `${this.propdata.list.item.defaultContent}`,
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
