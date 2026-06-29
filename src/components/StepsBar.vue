<template>
  <view class="steps-bar">
    <view
      v-for="(step, index) in steps"
      :key="step.key"
      class="step-item"
      :class="{
        'step-active': index <= current,
        'step-current': index === current
      }"
    >
      <view class="step-dot">
        <view v-if="index < current" class="step-check">&#10003;</view>
        <view v-else class="step-num">{{ index + 1 }}</view>
      </view>
      <text class="step-label">{{ step.label }}</text>
      <view
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ 'line-done': index < current }"
      ></view>
    </view>
  </view>
</template>

<script setup>
import { STEPS } from '@/utils/constants.js'

const props = defineProps({
  current: { type: Number, default: 0 },
  steps: { type: Array, default: () => STEPS }
})
</script>

<style lang="scss" scoped>
.steps-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20rpx 0;
  overflow-x: auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 100rpx;
}

.step-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 1;
}

.step-num {
  font-size: $font-sm;
  color: $text-inverse;
  font-weight: 600;
}

.step-check {
  font-size: $font-sm;
  color: $text-inverse;
  font-weight: 700;
}

.step-label {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 8rpx;
  white-space: nowrap;
  transition: color 0.3s;
}

.step-line {
  position: absolute;
  top: 22rpx;
  left: calc(50% + 30rpx);
  width: calc(100% - 60rpx);
  height: 2rpx;
  background: $border-color;
  transition: background 0.3s;
}

.line-done {
  background: $color-primary;
}

.step-active .step-dot {
  background: $color-primary;
}

.step-current .step-dot {
  background: $color-primary;
  box-shadow: 0 0 0 6rpx rgba(41, 121, 255, 0.2);
}

.step-active .step-label {
  color: $color-primary;
  font-weight: 500;
}
</style>
