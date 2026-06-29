<template>
  <view class="status-card card">
    <view class="card-header">
      <view class="cycle-info">
        <text class="cycle-label">{{ cycle }}</text>
        <text class="cycle-sub">绩效周期</text>
      </view>
      <view class="node-badge" :style="{ background: nodeColor }">
        {{ nodeLabel }}
      </view>
    </view>

    <view class="card-body">
      <view class="deadline-row" v-if="deadline">
        <text class="deadline-label">下一节点截止</text>
        <DeadlineBadge :deadline="deadline" />
      </view>
    </view>

    <view class="card-footer">
      <StepsBar :current="currentStep" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import StepsBar from './StepsBar.vue'
import DeadlineBadge from './DeadlineBadge.vue'
import { NODE_MAP } from '@/utils/constants.js'

const props = defineProps({
  cycle: { type: String, default: '2026 Q3' },
  currentNode: { type: String, default: 'goal_setting' },
  deadline: { type: String, default: '' },
  currentStep: { type: Number, default: 0 }
})

const nodeInfo = computed(() => NODE_MAP[props.currentNode] || {})
const nodeLabel = computed(() => nodeInfo.value.label || '未知')
const nodeColor = computed(() => nodeInfo.value.color || '#909399')
</script>

<style lang="scss" scoped>
.status-card {
  background: linear-gradient(135deg, #2979ff, #1a5cd4);
  color: #fff;
  padding: 30rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.cycle-info {
  display: flex;
  flex-direction: column;
}

.cycle-label {
  font-size: $font-xl;
  font-weight: 700;
}

.cycle-sub {
  font-size: $font-xs;
  opacity: 0.75;
  margin-top: 4rpx;
}

.node-badge {
  padding: 8rpx 20rpx;
  border-radius: $radius-round;
  font-size: $font-sm;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.25);
}

.card-body {
  margin-bottom: 20rpx;
}

.deadline-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.deadline-label {
  font-size: $font-xs;
  opacity: 0.75;
}

.card-footer {
  border-top: 1px solid rgba(255,255,255,0.15);
  padding-top: 16rpx;
}

.card-footer :deep(.step-dot) {
  width: 32rpx;
  height: 32rpx;
  background: rgba(255,255,255,0.3);
}

.card-footer :deep(.step-active .step-dot) {
  background: #fff;
}

.card-footer :deep(.step-current .step-dot) {
  box-shadow: 0 0 0 4rpx rgba(255,255,255,0.4);
}

.card-footer :deep(.step-label) {
  color: rgba(255,255,255,0.7);
}

.card-footer :deep(.step-active .step-label) {
  color: #fff;
}

.card-footer :deep(.step-line) {
  background: rgba(255,255,255,0.2);
}

.card-footer :deep(.line-done) {
  background: #fff;
}
</style>
