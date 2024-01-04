<script setup lang="ts">
import { SettingGroup, SettingPanel } from '../components'
</script>

<template>
  <SettingPanel>
    <SettingGroup name="项目信息">
      <el-image
        src="https://repobeats.axiom.co/api/embed/7910e599e7842fa48c48295b7fcbf0d4e39a9c6b.svg"
        style="width: 100%; aspect-ratio: 317 / 124;"
      >
        <template #placeholder>
          <el-skeleton animated style="width: 100%; height: 100%;">
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
            </template>
          </el-skeleton>
        </template>
      </el-image>
    </SettingGroup>
  </SettingPanel>
</template>
