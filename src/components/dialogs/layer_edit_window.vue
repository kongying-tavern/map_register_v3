<template>
  <q-card
    class="row q-pa-md"
    style="min-width: 550px; max-width: 60vw"
    :style="{
      width: item_selector_open ? '60vw' : '550px',
    }"
  >
    <!-- <div><q-toggle v-model="extra_mode" label="高级模式" /></div> -->
    <div class="col">
      <div class="row justify-between">
        <q-list bordered separator style="width: 100%">
          <q-item v-show="layer_info.id">
            <q-item-section side top> 点位编号 </q-item-section>
            <q-item-section>
              <q-input v-model="layer_info.id" outlined dense readonly>
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
                  :key="itemIndex"
                  class="row q-gutter-x-md q-gutter-y-sm"
                >
                  <div class="col-7 q-gutter-x-sm">
                    <q-chip v-if="item.itemId" plain>
                      <q-avatar size="sm">
                        <img :src="item_get_image(item.itemId)" />
                      </q-avatar>
                      {{ item_get_name(item.itemId) }}
                    </q-chip>
                    <q-chip v-else>请选择物品</q-chip>

                    <q-btn
                      size="md"
                      icon="edit"
                      :color="
                        item_selector_open && itemIndex === item_selector_index
                          ? 'amber'
                          : 'white'
                      "
                      :text-color="
                        item_selector_open && itemIndex === item_selector_index
                          ? 'white'
                          : 'black'
                      "
                      plain
                      dense
                      round
                      @click="item_select_toggle(itemIndex)"
                    >
                    </q-btn>
                  </div>
                  <div class="col-2">
                    <q-input v-model="item.count" plain dense>
                      <template #prepend> &times; </template>
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
                      @click="item_del(itemIndex)"
                    >
                    </q-btn>
                  </div>
                </div>
              </div>
              <q-btn
                class="q-mt-sm"
                color="primary"
                icon="add"
                plain
                @click="item_add"
              >
                添加关联物品
              </q-btn>
            </q-item-section>
          </q-item>

          <!-- 添加字段插件 -->
          <ExtraAdapter :area="selArea"></ExtraAdapter>

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
                    label-style="font-size: 1.1em"
                  />
                </q-img>
                <div class="col-auto q-gutter-y-sm">
                  <q-btn
                    class="row"
                    label="上传图像"
                    icon="upload"
                    size="md"
                    plain
                    color="primary"
                    @click="img_picker_popup"
                  >
                    <q-file
                      v-show="false"
                      v-model="image_upload_file"
                      ref="img_upload"
                      label="Standard"
                      @update:model-value="img_upload"
                    />
                  </q-btn>

                  <q-btn
                    class="row"
                    label="清除图像"
                    icon="delete"
                    size="md"
                    plain
                    color="red-6"
                    @click="img_delete"
                  >
                  </q-btn>

                  <q-btn
                    class="row"
                    label="预览"
                    icon="search"
                    size="md"
                    plain
                    @click="img_preview"
                  >
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
                :label="
                  {
                    0: '显示点位',
                    1: '隐藏点位',
                    2: '内鬼点位',
                  }[layer_info.hiddenFlag] || '点位显示/隐藏'
                "
              >
              </q-toggle>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side top> 点位视频 </q-item-section>
            <q-item-section>
              <q-input
                v-model="layer_info.videoPath"
                outlined
                dense
                placeholder="点位视频"
              >
              </q-input>
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
    <div v-show="item_selector_open" class="col relative-position q-ml-md">
      <item-selector
        class="absolute-full overflow-hidden"
        :item-config="item_config"
        @update="item_update"
      >
      </item-selector>
    </div>

    <!-- 裁剪弹窗 -->
    <q-dialog v-model="image_upload_cropper_open">
      <img-cut
        :crooper_img="image_upload_base64"
        @screenshot="img_crop"
      ></img-cut>
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
import _ from "lodash";
import funcExtraData from "../extra-data";
import { upload_img } from "../../service/base_data_request";
import {
  edit_layer_extralabel,
  upload_layer,
  edit_layer,
} from "../../service/edit_request";
import { get_user_id, is_neigui } from "../../service/user_info";
import ImgCut from "./vue-cropper.vue";
import ExtraAdapter from "../plugins/extra-adapter.vue";
import ItemSelector from "./item_selector.vue";
import { create_notify } from "../../api/common";

const icon_no_img = "https://assets.yuanshen.site/icons/-1.png";
export default {
  name: "LayerEdit",
  props: [
    "propdata",
    "basicTypes",
    "basicIcon",
    "basicItems",
    "selArea",
    "selType",
    "selItem",
  ],
  setup() {
    return {
      ...funcExtraData,
    };
  },
  data() {
    return {
      layer_info_default: {
        id: null,
        markerTitle: "",
        content: "",
        position: "",
        hiddenFlag: 0,
        picture: "",
        pictureCreatorId: 0,
        videoPath: "",
        refreshTime: 0,
        markerCreatorId: get_user_id(),
        itemList: [],
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
    };
  },
  computed: {
    is_neigui,
    type_list() {
      const type_list = _.chain(this.basicTypes)
        .values()
        .filter((v) => v.isFinal)
        .sortBy((v) => -v.sortIndex)
        .value();
      return type_list;
    },
    type_map() {
      const type_map = _.keyBy(this.type_list, "typeId");
      return type_map;
    },
    item_packed_list() {
      const packed_list = _.map(this.basicItems, (v) => {
        const icon_tag = v.iconTag || "";
        const icon_url = _.get(this.basicIcon, [icon_tag, "url"], icon_no_img);
        v.iconUrl = icon_url;
        return v;
      });
      return packed_list;
    },
    item_map() {
      const item_map = _.keyBy(this.item_packed_list, "itemId");
      return item_map;
    },
    item_groups() {
      const item_groups = _.chain(this.item_packed_list)
        .groupBy("typeId")
        .value();
      return item_groups;
    },
    item_config() {
      const item_groups = _.chain(this.type_list)
        .map((v) => {
          const type = v;
          const type_id = v.typeId;
          const itemList = this.item_groups[type_id] || {};
          return {
            type,
            itemList,
          };
        })
        .value();
      return item_groups;
    },
  },
  components: {
    ImgCut,
    ItemSelector,
    ExtraAdapter,
  },
  methods: {
    // 查看大图
    img_preview() {
      if (this.layer_info.picture !== "") {
        this.image_preview_open = true;
      }
    },
    img_delete() {
      this.layer_info.picture = "";
      this.layer_info.pictureCreatorId = get_user_id();
    },
    // 开启文件选择器
    img_picker_popup() {
      this.$refs.img_upload.pickFiles();
    },
    // 上传图片加以裁剪，以及裁剪前处理
    img_upload() {
      if (this.image_upload_file !== null) {
        // 将图片转化为base64
        const img = this.image_upload_file;
        const fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.image_upload_base64 = res.target.result;
          // 在转换完成后清除file，以重新触发input事件
          this.image_upload_file = null;
        };

        this.image_upload_cropper_open = true;
      }
    },
    // 返回裁剪后的数据
    img_crop(data) {
      if (_.isString(data) && data.indexOf("base64") !== -1) {
        this.loading_img = true;
        upload_img(Date.now(), data)
          .then((res) => {
            const img_path = _.get(res, "data.path", "");
            if (img_path) {
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
    item_select_toggle(index = -1) {
      if (this.layer_info.itemList[index]) {
        if (this.item_selector_open) {
          this.item_selector_index = -1;
          this.item_selector_open = false;
        } else {
          this.item_selector_index = index;
          this.item_selector_open = true;
        }
      }
    },
    item_update(item = {}) {
      if (this.layer_info.itemList[this.item_selector_index]) {
        this.layer_info.itemList[this.item_selector_index].itemId = item.itemId;
        this.layer_info.itemList[this.item_selector_index].count =
          item.defaultCount;
        this.layer_info.refreshTime = item.defaultRefreshTime || 0;
      }

      this.item_selector_open = false;
      this.item_selector_index = -1;
    },
    item_del(index = -1) {
      if (this.layer_info.itemList[index]) {
        this.layer_info.itemList.splice(index, 1);
      }
    },
    item_remove_empty(item_list = []) {
      return _.filter(
        item_list,
        (v) => v && _.isFinite(v.itemId) && v.itemId > 0
      );
    },
    item_get_image(itemId = 0) {
      return _.get(this.item_map, [itemId, "iconUrl"], icon_no_img);
    },
    item_get_name(itemId = 0) {
      const item_config = this.item_map[itemId] || {};
      const item_name = item_config.name || "";
      const type_id = Number(item_config.typeId) || 0;
      const type_name = _.get(this.type_map, [type_id, "name"], "");
      const item_compound_name = `${type_name} - ${item_name}`;
      return item_compound_name;
    },
    // 提交要上传的数据
    save() {
      const validate_res = this.save_validate();
      if (validate_res.errors.length > 0) {
        create_notify(validate_res.errors.join("<br>"), "negative", {
          timeout: 5000,
          html: true,
          actions: [
            {
              icon: "close",
              color: "white",
              dense: true,
            },
          ],
        });
        return;
      }

      // 将经过过滤后的数据设置回提交数据池
      this.layer_info.itemList = validate_res.items || [];

      this.loading = true;
      let save_promise = null;
      if (this.layer_info.id) {
        save_promise = edit_layer;
      } else {
        save_promise = upload_layer;
      }

      this.loading = true;

      save_promise(this.layer_info)
        .then((res) => {
          const { data } = res.data;
          const markerId = this.layer_info.id ? this.layer_info.id : data;
          return markerId;
        })
        .then((markerId) => {
          if (
            _.isFinite(markerId) &&
            markerId > 0 &&
            _.isPlainObject(this.layer_extra_data) &&
            !_.isEmpty(this.layer_extra_data)
          ) {
            return edit_layer_extralabel({
              markerId,
              markerExtraContent: JSON.stringify(this.layer_extra_data),
              isRelated: 0,
            });
          }

          return Promise.resolve();
        })
        .then(() => {
          create_notify("保存成功", "positive");
        })
        .catch((err) => {
          create_notify(err, "negative");
        })
        .finally(() => {
          this.loading = false;
          this.$emit("refresh");
        });
    },
    save_validate() {
      const data_pack = {
        errors: [],
        items: this.layer_info.itemList || [],
      };
      data_pack.items = this.item_remove_empty(data_pack.items);

      // 关联物品校验
      if (data_pack.items.length === 0) {
        data_pack.errors.push("请选择关联物品");
        return data_pack;
      }

      // 重复项选择校验
      const item_ids_uniq = _.chain(data_pack.items)
        .map((v) => v.itemId)
        .uniq()
        .value();
      if (data_pack.items.length !== item_ids_uniq.length) {
        data_pack.errors.push("物品中存在重复项，请修改");
      }

      // 宝箱类别判断
      const item_list_entries = _.chain(item_ids_uniq)
        .map((v) => this.item_map[v])
        .filter((v) => v)
        .value();
      const item_list_types = _.chain(item_list_entries)
        .map((v) => v.typeIdList || [])
        .flattenDeep()
        .map((v) => _.get(this.type_map, [v, "name"], ""))
        .filter((v) => v)
        .value();
      const item_list_companion_1 = _.filter(
        item_list_types,
        (v) => v === "获取方式" || v === "宝箱品质"
      );
      if (item_list_companion_1.length === 1) {
        data_pack.errors.push("获取方式和宝箱品质需同时选中");
      }

      return data_pack;
    },
    // 取消
    cancel() {
      this.layer_info = {};
      this.$emit("cancel");
    },
  },
  mounted() {
    let layer_info = _.defaultsDeep(
      {},
      this.propdata.data,
      this.layer_info_default
    );
    layer_info = _.omit(layer_info, "version");
    this.layer_info = layer_info;

    // 获取附加数据
    this.set_marker_extra_data(this.layer_info.markerExtraContent || "");

    // 如果是新数据
    if (!this.layer_info.id) {
      this.layer_info.position = this.propdata.position || "";
      this.layer_info.content = _.get(this.selItem, "defaultContent", "");

      // 构造标题
      const title_tpl = _.get(this.selType || {}, "content", "");
      const title_renderer = _.template(title_tpl, {
        interpolate: /{{([\s\S]+?)}}/g,
      });
      const title_data = {
        area: this.selArea || {},
        type: this.selType || {},
        item: this.selItem || {},
      };
      const title_str = title_renderer(title_data);
      this.layer_info.markerTitle = title_str;

      // 构造关联类别
      if (!this.layer_info.itemList) {
        this.layer_info.itemList = [];
      }

      if (this.layer_info.itemList.length <= 0) {
        const item_sel = this.selItem || {};
        const item_link = {
          itemId: item_sel.itemId,
          count: item_sel.defaultCount,
        };
        this.layer_info.itemList.push(item_link);
        this.layer_info.refreshTime = item_sel.defaultRefreshTime || 0;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.image-box {
  border-radius: 6px;
  border: 1px dashed #aaa;
}
</style>
