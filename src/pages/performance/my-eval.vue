<template>
  <view class="my-eval-page" v-if="myPerformance">
    <!-- 模块A：基础信息 -->
    <view class="info-card card">
      <view class="info-item">
        <text class="info-label">姓名</text>
        <text class="info-value">{{ myPerformance.employee.name }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">部门</text>
        <text class="info-value">{{ myPerformance.employee.department }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">周期</text>
        <text class="info-value">{{ myPerformance.cycle }}</text>
      </view>
      <view class="info-item" v-if="currentDeadline">
        <text class="info-label">截止</text>
        <DeadlineBadge :deadline="currentDeadline" />
      </view>
    </view>

    <!-- 模块B：指标制定 -->
    <IndicatorForm
      :indicators="myPerformance.indicators"
      :confirmStatus="myPerformance.indicator_confirm_status"
      :rejectReason="myPerformance._reject_reason || ''"
      :editable="isGoalSetting"
      @save="handleSaveIndicators"
      @submit="handleSubmitAll"
    />

    <!-- 模块C：目标与自评 -->
    <SelfEvalForm
      :content="myPerformance.self_evaluation?.content || ''"
      :score="myPerformance.self_evaluation?.score"
      :editable="isGoalSetting"
      :indicators="myPerformance.indicators"
      @save="handleSaveSelfEval"
    />

    <!-- 模块D：多上级评估区 -->
    <ManagerEvalList
      :evaluations="myPerformance.manager_evaluations"
      :indicators="myPerformance.indicators"
      :finalScore="myPerformance.final_score"
      :showDetail="true"
    />

    <!-- 底部步骤条 -->
    <view class="steps-footer card">
      <StepsBar :current="store.currentStep" />
    </view>
  </view>

  <!-- 无绩效数据 -->
  <EmptyState
    v-else
    icon="📭"
    title="暂无绩效数据"
    desc="您的绩效记录尚未生成，请联系管理员"
  />
</template>

<script setup>
import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.js'
import IndicatorForm from '@/components/IndicatorForm.vue'
import SelfEvalForm from '@/components/SelfEvalForm.vue'
import ManagerEvalList from '@/components/ManagerEvalList.vue'
import StepsBar from '@/components/StepsBar.vue'
import DeadlineBadge from '@/components/DeadlineBadge.vue'
import EmptyState from '@/components/EmptyState.vue'

const store = usePerformanceStore()

const myPerformance = computed(() => store.myPerformance)

const isGoalSetting = computed(() =>
  myPerformance.value?.current_node === 'goal_setting' ||
  myPerformance.value?.indicator_confirm_status === 'rejected'
)

const currentDeadline = computed(() => {
  const perf = myPerformance.value
  if (!perf?.deadlines || !perf?.current_node) return ''
  return perf.deadlines[perf.current_node] || ''
})

function handleSaveIndicators(indicators) {
  store.saveIndicators(indicators)
  uni.showToast({ title: '指标已保存', icon: 'success' })
}

function handleSaveSelfEval({ content }) {
  const perf = myPerformance.value
  if (perf) {
    perf.self_evaluation.content = content
  }
  uni.showToast({ title: '总结已保存', icon: 'success' })
}

function handleSubmitAll(indicators) {
  // 统一提交：保存指标并提交确认
  store.saveIndicators(indicators)
  store.submitIndicatorsForConfirm()
  // 自评分数由指标自动计算，一并提交
  if (myPerformance.value) {
    const total = indicators.reduce((sum, ind) => sum + (ind.self_score || 0) * (ind.weight || 0), 0)
    myPerformance.value.self_evaluation.score = parseFloat(total.toFixed(1))
  }
  uni.showToast({ title: '已提交确认', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.my-eval-page {
  min-height: 100vh;
  padding-top: 20rpx;
  padding-bottom: 40rpx;
}

.info-card {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx 30rpx;
}

.info-item {
  width: 50%;
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}

.info-label {
  font-size: $font-sm;
  color: $text-hint;
  width: 80rpx;
}

.info-value {
  font-size: $font-base;
  color: $text-primary;
  font-weight: 500;
}

.steps-footer {
  padding: 20rpx 30rpx;
}
</style>
