<template>
  <q-card
    class="row q-pa-md"
    style="min-width: 550px; max-width: 60vw;"
    :style="{
      width: item_selector_open ? '60vw' : 'auto',
    }">
    <!-- <div><q-toggle v-model="extra_mode" label="高级模式" /></div> -->
    <div class="col">
      <div class="row justify-between">
        <q-list bordered separator style="width: 100%;">
          <q-item v-show="layer_info.id == '' ? false : true">
            <q-item-section side top> 点位编号 </q-item-section>
            <q-item-section>
              <q-input
                v-model="layer_info.id"
                outlined
                dense
                readonly>
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section side top> 点位名称 </q-item-section>
            <q-item-section>
              <q-input
                v-model="layer_info.markerTitle"
                outlined
                dense
                placeholder="点位名称"
              >
              </q-input>
            </q-item-section>
          </q-item>

          <!-- 多物品类型分组展示 -->
          <q-item>
            <q-item-section side top> 所属物品 </q-item-section>
            <q-item-section>
              <div>
                <div
                  v-for="(item, itemIndex) in layer_info.itemList"
                  class="row q-gutter-x-md q-gutter-y-sm">
                  <div class="col-7 q-gutter-x-sm">
                    <q-chip v-if="item.itemId" plain>
                      <q-avatar size="sm">
                        <img :src="item_get_image(item.itemId)">
                      </q-avatar>
                      {{item_get_name(item.itemId)}}
                    </q-chip>
                    <q-chip v-else>请选择物品</q-chip>

                    <q-btn
                      size="md"
                      icon="edit"
                      plain
                      dense
                      round
                      @click="item_select(itemIndex)">
                    </q-btn>
                  </div>
                  <div class="col-2">
                    <q-input
                      v-model="item.count"
                      plain
                      dense>
                      <template #prepend>
                        &times;
                      </template>
                    </q-input>
                  </div>
                  <div class="col text-right">
                    <q-btn
                      v-if="!item_selector_open"
                      icon="close"
                      color="red-6"
                      size="md"
                      plain
                      dense
                      round
                      @click="item_del(itemIndex)">
                    </q-btn>
                  </div>
                </div>
              </div>
              <q-btn
                class="q-mt-sm"
                color="primary"
                icon="add"
                plain
                @click="item_add">
                添加关联物品
              </q-btn>
            </q-item-section>
          </q-item>

          <!-- 如果是海岛的点位的话，提供岛屿形态的选择 -->
          <q-item v-if="propdata.list.area.name == '金苹果群岛'">
            <q-item-section side top> 所属岛屿 </q-item-section>
            <q-item-section>
              <island-selector
                :propdata="propdata.data"
                @callback="island_callback"
              ></island-selector>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side top> 点位说明 </q-item-section>
            <q-item-section>
              <q-input
                v-model="layer_info.content"
                type="textarea"
                style="white-space: pre-line"
                outlined
                dense
                placeholder="点位说明"
              >
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section side top> 点位图像 </q-item-section>
            <q-item-section>
              <div class="row q-gutter-x-md">
                <q-img
                  class="col image-box"
                  :src="
                    layer_info.picture === ''
                      ? 'https://assets.yuanshen.site/images/noImage.png'
                      : layer_info.picture
                  "
                  spinner-color="white"
                  style="height: 150px; max-width: 150px; cursor: pointer"
                  @click="img_preview"
                >
                  <template v-slot:error>
                    <div
                      class="absolute-full flex flex-center bg-primary text-white"
                    >
                      没有相关图片
                    </div>
                  </template>
                  <q-inner-loading
                    :showing="loading_img"
                    label="图片上传中..."
                    label-class="primary"
                    label-style="font-size: 1.1em" />
                </q-img>
                <div class="col-auto q-gutter-y-sm">
                  <q-btn
                    class="row"
                    label="上传图像"
                    icon="upload"
                    size="md"
                    plain
                    color="primary"
                    @click="img_picker_popup">
                    <q-file
                      v-show="false"
                      v-model="image_upload_file"
                      ref="img_upload"
                      label="Standard"
                      @update:model-value="img_upload" />
                  </q-btn>

                  <q-btn
                    class="row"
                    label="清除图像"
                    icon="delete"
                    size="md"
                    plain
                    color="red-6"
                    @click="img_delete">
                  </q-btn>

                  <q-btn
                    class="row"
                    label="预览"
                    icon="search"
                    size="md"
                    plain
                    @click="img_preview">
                  </q-btn>
                </div>
              </div>
            </q-item-section>
          </q-item>
            <q-item-section></q-item-section>
          <q-item>
            <q-item-section side top> &emsp;&emsp;&emsp;&emsp; </q-item-section>
            <q-item-section>
              <q-checkbox
                v-if="!is_neigui"
                v-model="layer_info.hiddenFlag"
                :true-value="0"
                :false-value="1"
                dense
                label="点位显示/隐藏"
              />
              <q-toggle
                v-else
                v-model="layer_info.hiddenFlag"
                toggle-indeterminate
                :true-value="0"
                :false-value="1"
                :indeterminate-value="2"
                dense
                :label="{
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
        <q-btn color="primary" label="保存" @click="save" />
        <q-btn
          color="primary"
          flat
          style="margin-left: 20px"
          v-close-popup
          label="取消"
          @click="cancel"
        />
      </div>
    </div>
    <div v-show="item_selector_open" class="col relative-position q-ml-md q-my-md">
      <item-selector
        class="absolute-full"
        style="overflow: auto;"
        :item-config="item_config"
        @update="item_update">
      </item-selector>
    </div>

    <!-- 裁剪弹窗 -->
    <q-dialog v-model="image_upload_cropper_open">

      <img-cut :crooper_img="image_upload_base64" @screenshot="img_crop"></img-cut>
    </q-dialog>
    <!-- 查看大图弹窗 -->
    <q-dialog v-model="image_preview_open">
      <q-card style="width: 50vw; height: 50vh">
        <q-img
          :src="layer_info.picture"
          spinner-color="white"
          style="height: 100%; max-width: 100%"
          @click="img_preview"
        >
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
import _ from 'lodash'
import {
  upload_img,
} from "../../service/base_data_request";
import {
  edit_layer_extralabel,
  upload_layer,
  edit_layer,
} from "../../service/edit_request";
import { get_user_id, has_user_role } from "../../service/user_info";
import ImgCut from "./vue-cropper.vue";
import IslandSelector from "../v2.8/island_value_selector.vue";
import ItemSelector from './item_selector.vue';
import { create_notify } from "../../api/common";

const icon_no_img = 'https://assets.yuanshen.site/icons/-1.png';
export default {
  name: "LayerEdit",
  props: ["propdata", "basicTypes", "basicIcon", "basicItems"],
  data() {
    return {
      extra_mode: false,
      layer_info_default: {
        id: null,
        markerTitle: '',
        content: '',
        position: '',
        hiddenFlag: 0,
        picture: '',
        pictureCreatorId: 0,
        videoPath: '',
        refreshTime: 0,
        markerCreatorId: get_user_id(),
        itemList: []
      },
      layer_info: {},
      item_selector_open: false,
      item_selector_index: -1,
      image_upload_cropper_open: false,
      image_preview_open: false,
      image_upload_file: null,
      image_upload_base64: "",
      loading: false,
      loading_img: false,
      island_propdata: null,
      island_callback_data: null,
    };
  },
  computed: {
    is_neigui() {
      return has_user_role('MAP_NEIGUI');
    },
    type_list() {
      let type_list = _.chain(this.basicTypes)
        .values()
        .filter(v => v.isFinal)
        .sortBy(v => -v.sortIndex)
        .value();
      return type_list;
    },
    item_packed_list() {
      let packed_list = _.map(this.basicItems, v => {
        let icon_tag = v.iconTag || '';
        let icon_url = _.get(this.basicIcon, [icon_tag, 'url'], icon_no_img);
        v.iconUrl = icon_url;
        return v;
      });
      return packed_list;
    },
    item_map() {
      let item_map = _.keyBy(this.item_packed_list, 'itemId');
      return item_map;
    },
    item_groups() {
      let item_groups = _.chain(this.item_packed_list)
        .groupBy('typeId')
        .value();
      return item_groups;
    },
    item_config() {
      let item_groups = _
        .chain(this.type_list)
        .map(v => {
          let type = v;
          let type_id = v.typeId;
          let itemList = this.item_groups[type_id] || {};
          return {
            type,
            itemList
          }
        })
        .value();
      return item_groups;
    }
  },
  components: {
    ImgCut,
    IslandSelector,
    ItemSelector
  },
  methods: {
    //查看大图
    img_preview() {
      if (this.layer_info.picture !== "") {
        this.image_preview_open = true;
      }
    },
    img_delete() {
      this.layer_info.picture = "";
      this.layer_info.pictureCreatorId = get_user_id();
    },
    //开启文件选择器
    img_picker_popup() {
      this.$refs.img_upload.pickFiles();
    },
    //上传图片加以裁剪，以及裁剪前处理
    img_upload() {
      if (this.image_upload_file != null) {
        //将图片转化为base64
        let img = this.image_upload_file;
        let fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.image_upload_base64 = res.target.result;
          //在转换完成后清除file，以重新触发input事件
          this.image_upload_file = null;
        };
        this.image_upload_cropper_open = true;
      }
    },
    //返回裁剪后的数据
    img_crop(data) {
      if (_.isString(data) && data.indexOf("base64") !== -1) {
        this.loading_img = true;
        upload_img(Date.now(), data)
          .then(res => {
            let img_path = _.get(res, 'data.path', '');
            if(img_path) {
              this.layer_info.picture = `https://yuanshen.site${img_path}`;
              this.layer_info.pictureCreatorId = get_user_id();
            }
          })
          .finally(() => {
            this.loading_img = false;
          });
      }
    },
    item_add() {
      this.layer_info.itemList.push({
        itemId: null,
        count: 1,
      });
    },
    item_select(index = -1) {
      if(this.layer_info.itemList[index]) {
        this.item_selector_index = index;
        this.item_selector_open = true;
      }
    },
    item_update(item = {}) {
      if(this.layer_info.itemList[this.item_selector_index]) {
        this.layer_info.itemList[this.item_selector_index].itemId = item.itemId;
        this.layer_info.itemList[this.item_selector_index].count = item.defaultCount;
      }
      this.item_selector_open = false;
      this.item_selector_index = -1;
    },
    item_del(index = -1) {
      if(this.layer_info.itemList[index]) {
        this.layer_info.itemList.splice(index, 1);
      }
    },
    item_get_image(itemId = 0) {
      return _.get(this.item_map, [itemId, 'iconUrl'], icon_no_img);
    },
    item_get_name(itemId = 0) {
      return _.get(this.item_map, [itemId, 'name'], '');
    },
    //海岛回调
    island_callback(val) {
      this.island_callback_data = val;
    },
    //提交要上传的数据
    save() {
      this.loading = true;
      let save_promise = null;
      if(this.layer_info.id) {
        save_promise = edit_layer
      } else {
        save_promise = upload_layer
      }
      save_promise(this.layer_info)
        .then(res => {
          if(res.data.data) {
            create_notify('保存成功', 'positive');
          } else {
            let message = res.data.message || '';
            if(message) {
              create_notify(message, 'negative');
            } else {
              create_notify('保存失败', 'negative');
            }
          }
        })
      this.$emit("refresh");
    },
    //取消
    cancel() {
      this.layer_info = {};
      this.$emit("cancel");
    },
  },
  mounted() {
    this.layer_info = _.defaultsDeep({}, this.propdata.data, this.layer_info_default)
    //如果有子分类的话，查询子分类的各项选项
  },
};
</script>

<style lang="scss" scoped>
.image-box {
  border-radius: 6px;
  border: 1px dashed #aaa;
}
</style>
