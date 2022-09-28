<template>
  <div class="item-selector-box absolute-full">
    <div class="flex-none q-mb-sm">
      <q-input
        v-model="item_filter_text"
        dense
        outlined
        rounded
        placeholder="请输入关键词"
        debounce="300"
        color="primary">
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-icon
            class="cursor-pointer"
            name="close"
            @click="item_filter_clear" />
        </template>
      </q-input>
    </div>
    <div class="flex-auto overflow-auto q-mb-sm">
      <template v-for="itemGroup in item_config_filtered">
        <div
          v-if="itemGroup.itemList && itemGroup.itemList.length"
          class="item-group">
          <label class="title">{{itemGroup.type.name}}</label>
          <div class="row">
            <div
              v-for="item in itemGroup.itemList"
              class="col-6 item-entry cursor-pointer"
              @click="item_update(item)">
              <q-radio
                v-model="item_selected"
                :val="item"
                :label="item.name"
                dense
                size="lg"
                :keep-color="false"
                :checked-icon="`img:${item.iconUrl}`"
                :unchecked-icon="`img:${item.iconUrl}`"
                @update:model-value="item_update">
              </q-radio>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    itemConfig: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      item_filter_text: '',
      item_selected: {}
    }
  },
  computed: {
    item_config_filtered() {
      let filter_text = (this.item_filter_text || '').trim();
      if(!filter_text) {
        return this.itemConfig;
      }

      let config = _.map(this.itemConfig, v => {
        let row = _.cloneDeep(v);
        let item_list = _.filter(row.itemList || [], item => item && item.name && item.name.indexOf(filter_text) !== -1);
        row.itemList = item_list;
        return row;
      });

      return config;
    }
  },
  methods: {
    item_update(item = {}) {
      this.item_selected = item;
      this.$emit('update', this.item_selected)
    },
    item_filter_clear() {
      this.item_filter_text = '';
    }
  }
}
</script>

<style lang="scss" scoped>
.item-selector-box {
  display: flex;
  flex-direction: column;
  .flex-none {
    flex: none;
    position: relative;
  }
  .flex-auto {
    flex: auto;
    position: relative;
  }
}

.item-group {
  & + .item-group {
    border-top: 1px solid #ddd;
  }
  .title {
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 2.6rem;
  }
}
.item-entry {
  line-height: 2.5rem;
  border-radius: 1.2rem;
  padding-left: .4rem;

  &:hover {
    background-color: #e3eefa;
  }
}
</style>
