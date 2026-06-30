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

    <!-- 阶段标签 -->
    <view class="phase-tag card">
      <text class="phase-text">当前阶段：{{ currentNodeLabel }}</text>
    </view>

    <!-- 模块B：指标制定（Phase 1） -->
    <IndicatorForm
      :indicators="myPerformance.indicators"
      :confirmStatus="myPerformance.indicator_confirm_status"
      :rejectReason="myPerformance._reject_reason || ''"
      :editable="isIndicatorEditable"
      @save="handleSaveIndicators"
      @submit="handleSubmitIndicators"
    />

    <!-- 模块C：数据填报 + 自评（Phase 2） -->
    <view class="section card" v-if="showDataEntry">
      <view class="section-title">数据填报</view>

      <view class="field-block">
        <text class="field-label">月度绩效完成情况</text>
        <textarea
          v-model="monthlyCompletionDraft"
          class="field-textarea"
          placeholder="请简述各月度的绩效完成情况..."
          :disabled="!isDataEntryEditable"
        />
      </view>

      <view class="field-block">
        <text class="field-label">绩效自评总结</text>
        <textarea
          v-model="selfEvalContentDraft"
          class="field-textarea"
          placeholder="请对本周期工作进行总结自评..."
          :disabled="!isDataEntryEditable"
        />
      </view>

      <view class="field-block" v-if="isDataEntryEditable">
        <button class="btn-submit" @click="handleSubmitDataEntry">提交数据填报</button>
      </view>
    </view>

    <!-- 模块D：自评展示（Phase 2 提交后，只读） -->
    <view class="section card" v-if="showSelfEvalReadonly">
      <view class="section-title">数据填报内容</view>
      <view class="readonly-block">
        <text class="field-label">月度绩效完成情况</text>
        <text class="readonly-text">{{ myPerformance.monthly_completion || '暂无' }}</text>
      </view>
      <view class="readonly-block">
        <text class="field-label">绩效自评总结</text>
        <text class="readonly-text">{{ myPerformance.self_evaluation?.content || '暂无' }}</text>
      </view>
      <view class="score-box">
        <text class="score-box-label">综合自评分</text>
        <text class="score-box-num">{{ myPerformance.self_evaluation?.score ?? '--' }}</text>
        <text class="score-box-unit">分</text>
      </view>
    </view>

    <!-- 模块E：直属领导评分 -->
    <view class="section card" v-if="primaryEval && showPrimaryEval">
      <view class="section-title">直属领导评分</view>
      <ManagerEvalCard
        :evaluation="primaryEval"
        :indicators="myPerformance.indicators"
        :showDetail="true"
      />
    </view>

    <!-- 模块F：绩效结果（Phase 4：结果查看） -->
    <view class="section card" v-if="showResult">
      <view class="section-title">绩效结果</view>
      <view class="result-hero">
        <text class="result-hero-score">{{ myPerformance.final_score }}</text>
        <view class="result-hero-grade" :style="{ background: resultGradeColor }">
          <text class="result-hero-grade-text">{{ resultGrade }}</text>
        </view>
      </view>
      <view class="result-divider" />
      <view class="result-row" v-if="primaryEval?.comment">
        <text class="result-label">直属领导评语</text>
        <text class="result-comment">{{ primaryEval.comment }}</text>
      </view>
      <view class="result-row" v-if="myPerformance.calibration_comment">
        <text class="result-label">校准意见</text>
        <text class="result-comment">{{ myPerformance.calibration_comment }}</text>
      </view>
      <view class="result-row" v-if="myPerformance.hr_review_comment">
        <text class="result-label">HR复核意见</text>
        <text class="result-comment">{{ myPerformance.hr_review_comment }}</text>
      </view>
    </view>

    <!-- 底部步骤条 -->
    <view class="steps-footer card">
      <StepsBar :current="store.currentStep" />
    </view>
  </view>

  <EmptyState
    v-else
    icon="📭"
    title="暂无绩效数据"
    desc="您的绩效记录尚未生成，请联系管理员"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.js'
import IndicatorForm from '@/components/IndicatorForm.vue'
import ManagerEvalCard from '@/components/ManagerEvalCard.vue'
import StepsBar from '@/components/StepsBar.vue'
import DeadlineBadge from '@/components/DeadlineBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { NODE_MAP, getGrade } from '@/utils/constants.js'

const store = usePerformanceStore()

const myPerformance = computed(() => store.myPerformance)

const currentNodeLabel = computed(() => {
  const node = myPerformance.value?.current_node
  return NODE_MAP[node]?.label || '未知'
})

// Phase 1: 指标可编辑（goal_setting 或被驳回）
const isIndicatorEditable = computed(() => {
  const node = myPerformance.value?.current_node
  return node === 'goal_setting' || myPerformance.value?.indicator_confirm_status === 'rejected'
})

// Phase 2: 显示数据填报区域（仅在 self_evaluating 阶段）
const showDataEntry = computed(() =>
  myPerformance.value?.current_node === 'self_evaluating'
)

// 数据填报可编辑（仅在 self_evaluating 阶段）
const isDataEntryEditable = computed(() =>
  myPerformance.value?.current_node === 'self_evaluating'
)

// Phase 2+：自评只读展示（提交后）
const showSelfEvalReadonly = computed(() => {
  const node = myPerformance.value?.current_node
  const hasSubmitted = myPerformance.value?.self_evaluation?.submitted_at
  const afterDataEntry = ['manager_evaluating', 'calibrating', 'hr_reviewing', 'result_visible', 'archived']
  return afterDataEntry.includes(node) && hasSubmitted
})

// 显示直属领导评分
const showPrimaryEval = computed(() => {
  const node = myPerformance.value?.current_node
  const afterScoring = ['calibrating', 'hr_reviewing', 'result_visible', 'archived']
  return afterScoring.includes(node) || node === 'manager_evaluating'
})

// Phase 4: 展示绩效结果
const showResult = computed(() => {
  const node = myPerformance.value?.current_node
  return node === 'result_visible' || node === 'archived'
})

const primaryEval = computed(() => {
  const perf = myPerformance.value
  if (!perf) return null
  return perf.manager_evaluations.find(m => m.is_primary_manager) || null
})

const resultGradeInfo = computed(() => getGrade(myPerformance.value?.final_score))
const resultGrade = computed(() => resultGradeInfo.value?.label || '')
const resultGradeColor = computed(() => resultGradeInfo.value?.color || '#909399')

const currentDeadline = computed(() => {
  const perf = myPerformance.value
  if (!perf?.deadlines || !perf?.current_node) return ''
  return perf.deadlines[perf.current_node] || ''
})

// 数据填报草稿
const monthlyCompletionDraft = ref(myPerformance.value?.monthly_completion || '')
const selfEvalContentDraft = ref(myPerformance.value?.self_evaluation?.content || '')

function handleSaveIndicators(indicators) {
  store.saveIndicators(indicators)
  uni.showToast({ title: '指标已保存', icon: 'success' })
}

function handleSubmitIndicators(indicators) {
  store.saveIndicators(indicators)
  store.submitIndicatorsForConfirm()
  if (myPerformance.value) {
    const total = indicators.reduce((sum, ind) => sum + (ind.self_score || 0) * (ind.weight || 0), 0)
    myPerformance.value.self_evaluation.score = parseFloat(total.toFixed(1))
  }
  uni.showToast({ title: '已提交', icon: 'success' })
}

function handleSubmitDataEntry() {
  const perf = myPerformance.value
  if (!perf) return
  const total = perf.indicators.reduce((sum, ind) => sum + (ind.self_score || 0) * (ind.weight || 0), 0)
  const score = parseFloat(total.toFixed(1))
  store.submitSelfEval(monthlyCompletionDraft.value, selfEvalContentDraft.value, score)
  uni.showToast({ title: '已提交', icon: 'success' })
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

.phase-tag {
  margin: 0 20rpx 20rpx;
  padding: 16rpx 30rpx;
  background: linear-gradient(135deg, rgba(41,121,255,0.06), rgba(41,121,255,0.02));
  border-left: 6rpx solid $color-primary;
}

.phase-text {
  font-size: $font-sm;
  color: $color-primary;
  font-weight: 500;
}

.section {
  margin: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid $border-light;
}

.field-block {
  margin-bottom: 24rpx;
}

.field-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 10rpx;
  display: block;
}

.field-textarea {
  width: 100%;
  height: 150rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 16rpx;
  font-size: $font-sm;
  background: $bg-grey;
}

.readonly-block {
  margin-bottom: 20rpx;
}

.readonly-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
  white-space: pre-wrap;
}

.score-box {
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, rgba(41,121,255,0.06), rgba(41,121,255,0.02));
  border-radius: $radius-base;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
}

.score-box-label {
  font-size: $font-sm;
  color: $text-hint;
}

.score-box-num {
  font-size: 48rpx;
  font-weight: 700;
  color: $color-primary;
}

.score-box-unit {
  font-size: $font-sm;
  color: $text-hint;
}

.btn-submit {
  width: 100%;
  height: 80rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-base;
  font-size: $font-base;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 20rpx 0;
}

.result-hero-score {
  font-size: 56rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1;
}

.result-hero-grade {
  padding: 8rpx 20rpx;
  border-radius: $radius-sm;
}

.result-hero-grade-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.result-row {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.result-label {
  font-size: $font-sm;
  color: $text-hint;
  width: 180rpx;
  flex-shrink: 0;
  padding-top: 2rpx;
}

.result-comment {
  font-size: $font-sm;
  color: $text-secondary;
  flex: 1;
  line-height: 1.6;
}

.result-divider {
  height: 1px;
  background: $border-light;
  margin: 16rpx 0;
}

.steps-footer {
  padding: 20rpx 30rpx;
  margin: 0 20rpx;
}
</style>
