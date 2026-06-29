<template>
  <view class="manager-eval-list">
    <view class="section-title">多上级评估区</view>

    <ManagerEvalCard
      v-for="(item, index) in evaluations"
      :key="index"
      :evaluation="item"
      :indicators="indicators"
      :showDetail="showDetail"
    />

    <!-- 最终得分汇总 -->
    <view v-if="showFinalScore && finalScore !== null" class="final-score-card">
      <text class="final-label">加权最终得分</text>
      <view class="final-score-row">
        <text class="final-num">{{ finalScore }}</text>
        <text class="final-grade" :style="{ color: finalGradeColor }">{{ finalGrade }}</text>
      </view>
      <text class="final-formula">计算公式：SUM(各上级综合分 × 权重)</text>
    </view>

    <view v-if="evaluations.length === 0" class="no-eval">
      <text>暂无上级评估记录</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import ManagerEvalCard from './ManagerEvalCard.vue'
import { getGrade } from '@/utils/constants.js'

const props = defineProps({
  evaluations: { type: Array, default: () => [] },
  indicators: { type: Array, default: () => [] },
  finalScore: { type: Number, default: null },
  showDetail: { type: Boolean, default: true }
})

const showFinalScore = computed(() => props.finalScore !== null)

const finalGradeInfo = computed(() => getGrade(props.finalScore))
const finalGrade = computed(() => finalGradeInfo.value?.label || '')
const finalGradeColor = computed(() => finalGradeInfo.value?.color || '#909399')
</script>

<style lang="scss" scoped>
.manager-eval-list {
  background: #fff;
  border-radius: $radius-lg;
  padding: 30rpx;
  margin: 0 20rpx 20rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid $border-light;
}

.final-score-card {
  background: linear-gradient(135deg, rgba(25,190,107,0.08), rgba(41,121,255,0.08));
  border-radius: $radius-base;
  padding: 24rpx;
  margin-top: 20rpx;
  text-align: center;
}

.final-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.final-score-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin: 10rpx 0;
}

.final-num {
  font-size: 60rpx;
  font-weight: 700;
  color: $text-primary;
  margin-right: 16rpx;
}

.final-grade {
  font-size: $font-xl;
  font-weight: 700;
}

.final-formula {
  font-size: $font-xs;
  color: $text-hint;
}

.no-eval {
  text-align: center;
  padding: 30rpx;
  color: $text-hint;
  font-size: $font-sm;
}
</style>
