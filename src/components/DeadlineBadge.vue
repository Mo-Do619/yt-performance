<template>
  <view class="deadline-badge" :class="'deadline-' + status">
    <text class="deadline-icon">{{ icon }}</text>
    <text class="deadline-text">{{ text }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getDeadlineStatus, getDeadlineText } from '@/utils/constants.js'

const props = defineProps({
  deadline: { type: String, default: '' }
})

const status = computed(() => getDeadlineStatus(props.deadline))
const text = computed(() => getDeadlineText(props.deadline))

const iconMap = { normal: '●', approaching: '◉', overdue: '⚠' }
const icon = computed(() => iconMap[status.value] || '')
</script>

<style lang="scss" scoped>
.deadline-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: $radius-round;
  font-size: $font-xs;
}

.deadline-normal {
  background: rgba(25, 190, 107, 0.1);
  color: $deadline-normal;
}

.deadline-approaching {
  background: rgba(255, 153, 0, 0.1);
  color: $deadline-approaching;
}

.deadline-overdue {
  background: rgba(250, 53, 52, 0.1);
  color: $deadline-overdue;
}

.deadline-icon {
  margin-right: 6rpx;
  font-size: $font-xs;
}

.deadline-text {
  font-weight: 500;
}
</style>
