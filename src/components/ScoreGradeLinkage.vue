<template>
  <view class="score-grade-linkage" v-if="totalScore !== null">
    <view class="linkage-bar">
      <text class="linkage-label">当前综合分</text>
      <text class="linkage-score">{{ totalScore }}</text>
      <text class="linkage-arrow">→</text>
      <text class="linkage-grade" :style="{ color: gradeColor }">
        等级: {{ gradeInfo.grade }} {{ gradeInfo.label }}
      </text>
    </view>
    <view v-if="calibrateMode" class="linkage-hint">
      校准模式：调整分值后等级将自动联动更新
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getGrade } from '@/utils/constants.js'

const props = defineProps({
  totalScore: { type: Number, default: null },
  calibrateMode: { type: Boolean, default: false }
})

const gradeInfo = computed(() => getGrade(props.totalScore) || { grade: '--', label: '', color: '#909399' })
const gradeColor = computed(() => gradeInfo.value.color)
</script>

<style lang="scss" scoped>
.linkage-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f0f8ff;
  border-radius: $radius-sm;
  border: 2rpx solid #d6e4ff;
}

.linkage-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-right: 12rpx;
}

.linkage-score {
  font-size: $font-lg;
  font-weight: 700;
  color: $text-primary;
  margin-right: 12rpx;
}

.linkage-arrow {
  font-size: $font-base;
  color: $text-hint;
  margin-right: 12rpx;
}

.linkage-grade {
  font-size: $font-lg;
  font-weight: 700;
}

.linkage-hint {
  font-size: $font-xs;
  color: $color-primary;
  margin-top: 10rpx;
  padding-left: 24rpx;
}
</style>
