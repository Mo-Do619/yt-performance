<template>
  <view class="reminder-btn" @click="handleRemind">
    <text class="reminder-icon">🔔</text>
    <text class="reminder-text">{{ label }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: '一键催办' },
  stage: { type: String, default: '' }
})

const emit = defineEmits(['remind'])

function handleRemind() {
  emit('remind', props.stage)
}
</script>

<style lang="scss" scoped>
.reminder-btn {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 28rpx;
  background: $color-warning;
  color: #fff;
  border-radius: $radius-round;
  font-size: $font-sm;
  font-weight: 500;
}

.reminder-icon {
  margin-right: 8rpx;
}

.reminder-text {
  white-space: nowrap;
}
</style>
