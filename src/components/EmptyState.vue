<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="desc" class="empty-desc">{{ desc }}</text>
    <view v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  icon: { type: String, default: '📋' },
  title: { type: String, default: '暂无数据' },
  desc: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: $font-lg;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-hint;
  text-align: center;
}

.empty-action {
  margin-top: 30rpx;
}
</style>
