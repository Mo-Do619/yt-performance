<template>
  <view class="scoring-hints" v-if="hint">
    <text class="hint-icon">💡</text>
    <text class="hint-text">{{ hint }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  hint: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.scoring-hints {
  display: flex;
  align-items: flex-start;
  padding: 14rpx 20rpx;
  background: rgba(41, 121, 255, 0.06);
  border-radius: $radius-sm;
  margin-top: 12rpx;
}

.hint-icon {
  margin-right: 10rpx;
  font-size: $font-sm;
  flex-shrink: 0;
}

.hint-text {
  font-size: $font-xs;
  color: $color-primary-light;
  line-height: 1.5;
}
</style>
