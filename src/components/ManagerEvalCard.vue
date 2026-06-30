<template>
  <view class="manager-eval-card" :class="'eval-' + evaluation.status">
    <view class="card-top">
      <view class="manager-info">
        <view class="manager-avatar">{{ evaluation.manager_name[0] }}</view>
        <view class="manager-detail">
          <view class="manager-name-row">
            <text class="manager-name">{{ evaluation.manager_name }}</text>
            <text v-if="evaluation.is_primary_manager" class="primary-tag">直属主管</text>
            <text class="role-tag">{{ evaluation.role_label }}</text>
          </view>
          <text class="manager-weight">权重 {{ (evaluation.weight * 100).toFixed(0) }}%</text>
        </view>
      </view>
      <view class="eval-status" :style="{ color: statusColor }">
        {{ statusLabel }}
      </view>
    </view>

    <!-- 逐项指标评分 -->
    <view v-if="evaluation.status !== 'pending' || showDetail" class="card-scores">
      <view class="scores-title">逐项指标评分</view>
      <view
        v-for="indicator in indicators"
        :key="indicator.id"
        class="score-row"
      >
        <text class="score-ind-name">{{ indicator.name }}</text>
        <text class="score-ind-weight">权重{{ (indicator.weight * 100).toFixed(0) }}%</text>
        <text class="score-ind-val">{{ evaluation.indicator_scores[indicator.id] ?? '--' }}</text>
      </view>
    </view>

    <view class="card-bottom" v-if="evaluation.status !== 'pending'">
      <view class="total-score-row">
        <text class="total-label">综合评分</text>
        <text class="total-num">{{ evaluation.total_score ?? '--' }}</text>
        <text v-if="evaluation.total_score !== null" class="total-grade" :style="{ color: gradeColor }">
          {{ gradeLabel }}
        </text>
      </view>
      <text class="eval-comment" v-if="evaluation.comment">"{{ evaluation.comment }}"</text>
    </view>

    <view v-if="evaluation.status === 'pending'" class="pending-hint">
      <text>等待该上级完成评估...</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { EVAL_STATUS_MAP, getGrade } from '@/utils/constants.js'

const props = defineProps({
  evaluation: { type: Object, required: true },
  indicators: { type: Array, default: () => [] },
  showDetail: { type: Boolean, default: true }
})

const statusInfo = computed(() => EVAL_STATUS_MAP[props.evaluation.status] || {})
const statusLabel = computed(() => statusInfo.value.label)
const statusColor = computed(() => statusInfo.value.color)

const gradeInfo = computed(() => getGrade(props.evaluation.total_score))
const gradeLabel = computed(() => gradeInfo.value?.label || '')
const gradeColor = computed(() => gradeInfo.value?.color || '#909399')
</script>

<style lang="scss" scoped>
.manager-eval-card {
  background: $bg-grey;
  border-radius: $radius-base;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.manager-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.manager-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-lg;
  font-weight: 600;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.manager-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
}

.manager-name {
  font-size: $font-base;
  font-weight: 500;
  color: $text-primary;
}

.primary-tag {
  font-size: $font-xs;
  color: $color-primary;
  background: rgba(41,121,255,0.1);
  padding: 2rpx 10rpx;
  border-radius: $radius-sm;
}

.role-tag {
  font-size: $font-xs;
  color: $text-hint;
}

.manager-weight {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 4rpx;
}

.eval-status {
  font-size: $font-sm;
  font-weight: 500;
}

.card-scores {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid $border-light;
}

.scores-title {
  font-size: $font-xs;
  color: $text-hint;
  margin-bottom: 12rpx;
}

.score-row {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.score-ind-name {
  flex: 1;
  font-size: $font-sm;
  color: $text-primary;
}

.score-ind-weight {
  font-size: $font-xs;
  color: $text-hint;
  margin-right: 16rpx;
}

.score-ind-val {
  font-size: $font-base;
  font-weight: 600;
  color: $color-primary;
  width: 60rpx;
  text-align: right;
}

.card-bottom {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid $border-light;
}

.total-score-row {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-right: 12rpx;
}

.total-num {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;
  margin-right: 12rpx;
  line-height: 1;
}

.total-grade {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1;
}

.eval-comment {
  font-size: $font-sm;
  color: $text-secondary;
  font-style: italic;
  margin-top: 10rpx;
}

.pending-hint {
  text-align: center;
  padding: 16rpx;
  font-size: $font-sm;
  color: $text-hint;
}
</style>
