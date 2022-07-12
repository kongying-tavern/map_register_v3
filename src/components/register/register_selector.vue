<template>
  <div class="row col-12" style="height: 370px">
    <div style="width: 18%">
      <q-scroll-area
        :thumb-style="{ background: 'none' }"
        style="width: 100%; height: 100%"
      >
        <q-btn
          color="primary"
          :label="selected_area == null ? '选择地区' : selected_area.name"
          style="width: 100%"
        >
          <q-menu>
            <q-list style="min-width: 100px; max-height: 350px">
              <q-item
                v-for="i in area_list"
                clickable
                v-close-popup
                @click="switch_area(i)"
              >
                <q-item-section>{{ i.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-tabs
          v-model="selected_type_index"
          dense
          vertical
          class="text-primary"
          style="margin-top: 5px"
          @update:model-value="select_type_list"
        >
          <q-tab
            v-for="i in type_list"
            :name="i.typeId"
            :label="i.name"
            :disable="selected_area == null"
          />
        </q-tabs>
      </q-scroll-area>
    </div>
    <q-separator vertical spaced />
    <div style="width: 75%">
      <q-scroll-area
        :thumb-style="{ background: 'none' }"
        style="width: 100%; height: 370px"
      >
        <div v-if="type_child_list.length != 0" class="row">
          <div class="col-12">
            <q-tabs
              v-model="selected_type_child_index"
              dense
              class="text-primary"
              @update:model-value="selected_item_list"
            >
              <q-tab
                v-for="i in type_child_list"
                :name="i.typeId"
                :label="i.name"
              />
            </q-tabs>
          </div>
          <div class="col-12" v-show="selected_type_child_index != null">
            <q-toggle
              v-model="batch_mode"
              @update:model-value="record_chest_list"
              label="查看全部"
            />
          </div>
        </div>
        <div class="col-12 row content-start">
          <div v-for="i in item_list" style="width: 33%">
            <q-radio
              :disable="batch_mode"
              v-model="selected_item"
              :val="i.itemId"
              :label="i.name"
              @update:model-value="select_item_layers"
            />
          </div>
        </div>
      </q-scroll-area>
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  query_area,
  query_itemtype,
  query_itemlist,
} from "../../service/base_data_request";
export default {
  name: "Selector",
  data() {
    return {
      loading: true,
      batch_mode: false,
      selected_area: null,
      area_list: [],
      selected_type_index: null,
      selected_type: null,
      type_list: [],
      selected_type_child_index: null,
      type_child_list: [],
      selected_item: null,
      item_list: [],
    };
  },
  methods: {
    //清除子分类和物品选择
    clearlist() {
      this.batch_mode = false;
      this.selected_item = null;
      this.item_list = [];
      this.selected_type_child_index = null;
      this.type_child_list = [];
    },
    //切换地区
    switch_area(area) {
      this.selected_type_index = null;
      this.clearlist();
      this.selected_area = area;
    },
    //如果有子分类的话，进行查询，生成子分类tabs
    select_type_list(value) {
      this.loading = true;
      this.clearlist();
      this.selected_type = this.type_list.find((item) => item.typeId == value);
      if (!this.selected_type.isFinal) {
        query_itemtype(1, {
          current: 1,
          typeIdList: [this.selected_type.typeId],
          size: 999,
        }).then((res) => {
          this.loading = false;
          this.type_child_list = res.data.data.record;
        });
      } else {
        this.selected_item_list(value);
      }
    },
    //查询类型下属的物品列表
    selected_item_list(value) {
      this.loading = true;
      query_itemlist({
        typeIdList: [value],
        areaIdList: [this.selected_area.areaId],
        current: 0,
        size: 999,
      }).then((res) => {
        this.loading = false;
        this.item_list = res.data.data.record;
      });
    },
    //记录选中的物品/物品类型数组
    select_item_layers(value) {
      console.log(value);
    },
    //记录宝箱全选时的itemid数组
    record_chest_list(value) {
      this.selected_item = null;
      let arr = [];
      if (value) {
        for (let i of this.item_list) {
          arr.push(i.itemId);
        }
      } else {
        arr = [];
      }
      this.select_item_layers(arr);
    },
  },
  mounted() {
    //查询地区和分类
    this.$axios
      .all([
        query_area({
          parentId: -1,
          isTraverse: true,
        }),
        query_itemtype(1, {
          current: 1,
          typeIdList: [],
          size: 999,
        }),
      ])
      .then(
        this.$axios.spread((arealist, typelist) => {
          this.loading = false;
          this.area_list = [];
          for (let i of arealist.data.data) {
            if (i.isFinal) {
              this.area_list.push(i);
            }
          }
          this.type_list = typelist.data.data.record;
        })
      );
  },
};
</script>

<style>
</style>