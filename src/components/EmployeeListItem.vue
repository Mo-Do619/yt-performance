<template>
  <view class="employee-item card" @click="$emit('click', performance)">
    <view class="item-left">
      <view class="emp-avatar">{{ performance.employee.name[0] }}</view>
      <view class="emp-info">
        <text class="emp-name">{{ performance.employee.name }}</text>
        <text class="emp-dept">{{ performance.employee.department }}</text>
      </view>
    </view>
    <view class="item-right">
      <view class="item-tags">
        <text v-if="performance.calibration_status === 'rejected'" class="tag tag-rejected">已退回</text>
        <text class="tag" :style="{ background: nodeColor + '1a', color: nodeColor }">
          {{ nodeLabel }}
        </text>
      </view>
      <DeadlineBadge v-if="deadline" :deadline="deadline" />
      <text class="item-arrow">→</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import DeadlineBadge from './DeadlineBadge.vue'
import { NODE_MAP } from '@/utils/constants.js'

const props = defineProps({
  performance: { type: Object, required: true },
  tab: { type: String, default: 'eval' } // eval | confirm | calibrate
})

defineEmits(['click'])

const nodeInfo = computed(() => NODE_MAP[props.performance.current_node] || {})
const nodeLabel = computed(() => nodeInfo.value.label || '')
const nodeColor = computed(() => nodeInfo.value.color || '#909399')

const deadline = computed(() => {
  const dl = props.performance.deadlines
  if (!dl) return ''
  return dl[props.performance.current_node] || ''
})
</script>

<style lang="scss" scoped>
.employee-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-top: 12rpx;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.emp-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-lg;
  font-weight: 600;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.emp-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-size: $font-base;
  font-weight: 500;
  color: $text-primary;
}

.emp-dept {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 4rpx;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-tags .tag {
  font-size: $font-xs;
  padding: 4rpx 14rpx;
  border-radius: $radius-round;
}

.tag-rejected {
  background: #fff3f0;
  color: $color-danger;
}

.item-arrow {
  font-size: 32rpx;
  color: $text-hint;
}
</style>
