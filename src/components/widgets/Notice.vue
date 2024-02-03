<script setup>
import { ref, computed, defineComponent, onMounted } from "vue";
import {
  list_notice,
  get_notice_hash,
  compare_hash,
  update_hash,
} from "src/service/notice_request";

defineComponent({
  name: "PluginNotice",
});

// 公告数据
const list = ref([]);

const listHasNew = ref(false);

const refreshNotice = () => {
  list_notice({
    current: 0,
    size: 100,
    sort: ["validTimeStart-"],
    channels: ["COMMON", "DASHBOARD"],
    getValid: true,
  }).then((res) => {
    list.value = res.data?.data?.record || [];
    updateNoticeStatus();
  });
};

const updateNoticeStatus = () => {
  const listData = list.value || [];
  const listHash = get_notice_hash(listData);
  listHasNew.value = !compare_hash(listHash);
};

// 公告弹窗
const dialogVisible = ref(false);

const openDialog = () => {
  dialogSelIndex.value = 0;
  dialogVisible.value = true;

  const listHash = get_notice_hash(list.value || []);
  update_hash(listHash);
  updateNoticeStatus();
};

const closeDialog = () => {
  dialogSelIndex.value = -1;
  dialogVisible.value = false;
};

const dialogSelIndex = ref(-1);

const dialogItem = computed(() => list.value[dialogSelIndex.value] || {});

// 公告刷新机制
let fetcherTimer = null;

// 定时更新公告
onMounted(() => {
  refreshNotice();
  clearInterval(fetcherTimer);
  fetcherTimer = setInterval(() => {
    refreshNotice();
  }, 5 * 60e3);
});
</script>

<template>
  <q-btn
    dense
    class="notice-button"
    :class="{ active: listHasNew }"
    :text-color="listHasNew ? 'red' : 'primary'"
    color="white"
    :icon="
      listHasNew
        ? 'mdi-message-alert-outline'
        : 'mdi-message-processing-outline'
    "
    @click="openDialog"
  >
    <q-tooltip anchor="center left" self="center right">公告</q-tooltip>
  </q-btn>
  <q-dialog v-model="dialogVisible" full-width style="z-index: 9999">
    <q-layout view="hHh Lpr lff" container style="height: 70vh">
      <q-header>
        <q-toolbar>
          <q-icon name="mdi-view-dashboard-outline" size="sm" />
          <q-toolbar-title>公告</q-toolbar-title>
          <q-icon
            name="close"
            size="md"
            class="cursor-pointer text-fr q-pa-sm"
            @click="closeDialog()"
          />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="dialogVisible" :width="300" :breakpoint="500" bordered>
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
          <q-list padding>
            <q-item
              v-for="(item, index) in list"
              :key="index"
              clickable
              :active="dialogSelIndex === index"
            >
              <q-item-section>
                {{ item.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page class="q-px-lg q-py-md dialog-content">
          <div v-dompurify-html="dialogItem.content" />
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<style lang="scss" scoped>
.notice-button {
  position: relative;
  &.active::before {
    content: "";
    position: absolute;
    display: block;
    width: 0.6rem;
    height: 0.6rem;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: #f44336;
  }
}

.dialog-content {
  font-family: HYWH;
  font-size: 20px;
  line-height: 1.1;
  background-color: #d5cec7;
  color: #4f473f;

  ::v-deep(p) {
    padding: 0;
    margin: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    min-height: 1.1rem;
  }
  ::v-deep(size) {
    font-size: calc(--size * 1px);
  }
  ::v-deep(color) {
    color: var(--color);
  }
}
</style>
