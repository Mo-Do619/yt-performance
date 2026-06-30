<template>
  <view class="team-eval-page">
    <view v-if="!store.isManager && !store.isAdmin" class="no-permission">
      <EmptyState
        icon="🔒"
        title="无权访问"
        desc="仅主管、部门负责人、HR和管理员可以查看团队评估"
      />
    </view>

    <template v-else>
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'tab-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>

    <!-- Tab 1: 待确认指标（直属领导） -->
    <view v-if="activeTab === 'confirm'" class="tab-content">
      <view v-if="store.pendingConfirmCount > 0">
        <view
          v-for="perf in store.pendingIndicatorConfirms"
          :key="perf.performance_id"
          class="card confirm-card"
        >
          <EmployeeListItem :performance="perf" tab="confirm" />

          <!-- 指标明细 -->
          <view class="indicator-detail">
            <text class="detail-label">指标明细</text>
            <view v-for="ind in perf.indicators" :key="ind.id" class="detail-item">
              <view class="detail-header">
                <text class="detail-name">{{ ind.name }}</text>
                <text class="detail-weight">权重 {{ (ind.weight * 100).toFixed(0) }}%</text>
              </view>
              <view class="detail-row">
                <text class="detail-key">目标</text>
                <text class="detail-val">{{ ind.target }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-key">自评</text>
                <text class="detail-score">{{ ind.self_score ?? '--' }} 分</text>
              </view>
            </view>
          </view>

          <view class="confirm-actions-row">
            <button class="btn-reject-sm" @click="handleReject(perf)">驳回</button>
            <button class="btn-confirm-sm" @click="handleConfirm(perf)">确认指标</button>
          </view>
          <view v-if="rejectTargetId === perf.performance_id" class="reject-input">
            <textarea v-model="rejectReason" placeholder="请输入驳回原因..." class="reject-textarea" />
            <view class="reject-btns">
              <button class="btn-ghost-sm" @click="rejectTargetId = ''">取消</button>
              <button class="btn-danger-sm" @click="submitReject(perf)">确认驳回</button>
            </view>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="📌" title="暂无待确认指标" desc="员工的指标已全部确认" />
    </view>

    <!-- Tab 2: 待复核指标（部门负责人） -->
    <view v-if="activeTab === 'indicator_review'" class="tab-content">
      <view v-if="store.pendingIndicatorReviewCount > 0">
        <view
          v-for="perf in store.pendingIndicatorReviews"
          :key="perf.performance_id"
          class="card review-card"
        >
          <EmployeeListItem :performance="perf" tab="review" />
          <view class="review-indicators">
            <text class="review-section-label">指标明细</text>
            <view v-for="ind in perf.indicators" :key="ind.id" class="review-ind-item">
              <view class="review-ind-header">
                <text class="review-ind-name">{{ ind.name }}</text>
                <text class="review-ind-weight">权重 {{ (ind.weight * 100).toFixed(0) }}%</text>
              </view>
              <view class="review-ind-row">
                <text class="review-ind-label">目标</text>
                <text class="review-ind-val">{{ ind.target }}</text>
              </view>
              <view class="review-ind-row">
                <text class="review-ind-label">自评</text>
                <text class="review-ind-score">{{ ind.self_score ?? '--' }} 分</text>
              </view>
            </view>
          </view>
          <view class="review-comment-input">
            <text class="review-input-label">复核意见</text>
            <textarea
              v-model="indicatorReviewComments[perf.performance_id]"
              class="review-textarea"
              placeholder="请对指标设定进行复核..."
            />
          </view>
          <view class="review-actions">
            <button class="btn-reject-sm" @click="handleIndicatorReviewReject(perf)">驳回复核</button>
            <button class="btn-confirm-sm" @click="handleIndicatorReviewApprove(perf)">复核通过</button>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="🔍" title="暂无待复核指标" desc="直属领导确认后，待复核的指标将在此显示" />
    </view>

    <!-- Tab 3: 待打分（直属领导） -->
    <view v-if="activeTab === 'eval'" class="tab-content">
      <view v-if="store.pendingEvalCount > 0">
        <EmployeeListItem
          v-for="perf in store.pendingEvaluations"
          :key="perf.performance_id"
          :performance="perf"
          tab="eval"
          @click="openDrawer(perf, 'eval')"
        />
      </view>
      <EmptyState v-else icon="✅" title="暂无待打分员工" desc="所有下属的评估已完成" />
    </view>

    <!-- Tab 4: 待校准（部门负责人） -->
    <view v-if="activeTab === 'calibrate'" class="tab-content">
      <view v-if="store.pendingCalibrateCount > 0">
        <view
          v-for="perf in store.pendingCalibrations"
          :key="perf.performance_id"
          class="card review-card"
        >
          <EmployeeListItem :performance="perf" tab="calibrate" />

          <view class="review-content">
            <text class="review-section-label">评分汇总</text>
            <view v-for="evalItem in completedEvals(perf)" :key="evalItem.manager_id" class="eval-summary">
              <text class="eval-mgr-name">{{ evalItem.manager_name }}</text>
              <text class="eval-mgr-score">{{ evalItem.total_score }} 分</text>
              <text class="eval-mgr-grade" :style="{ color: getGrade(evalItem.total_score)?.color }">
                {{ getGrade(evalItem.total_score)?.label }}
              </text>
            </view>
            <text class="review-final-score">最终得分: {{ perf.final_score }} · {{ getGrade(perf.final_score)?.label }}</text>
            <text class="review-comment-text" v-if="primaryEvalComment(perf)">评语: {{ primaryEvalComment(perf) }}</text>
          </view>

          <view class="review-comment-input">
            <text class="review-input-label">退回理由</text>
            <textarea
              v-model="calibrateRejectReasons[perf.performance_id]"
              class="review-textarea"
              placeholder="请填写退回重评的理由..."
            />
          </view>

          <view class="calibrate-actions">
            <button class="btn-reject-sm" @click="handleCalibrationReject(perf)">退回重评</button>
            <button class="btn-primary-sm" @click="openDrawer(perf, 'calibrate')">进入校准</button>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="🎯" title="暂无待校准" desc="直属领导评分完成后，待校准的绩效将在此显示" />
    </view>

    <!-- Tab 5: 待HR复核 -->
    <view v-if="activeTab === 'hrreview'" class="tab-content">
      <view v-if="store.pendingHRReviewCount > 0">
        <view
          v-for="perf in store.pendingHRReviews"
          :key="perf.performance_id"
          class="card review-card"
        >
          <EmployeeListItem :performance="perf" tab="review" />

          <view class="review-content">
            <text class="review-section-label">绩效汇总</text>
            <view v-for="evalItem in completedEvals(perf)" :key="evalItem.manager_id" class="eval-summary">
              <text class="eval-mgr-name">{{ evalItem.manager_name }}</text>
              <text class="eval-mgr-score">{{ evalItem.total_score }} 分</text>
              <text class="eval-mgr-grade" :style="{ color: getGrade(evalItem.total_score)?.color }">
                {{ getGrade(evalItem.total_score)?.label }}
              </text>
            </view>
            <text class="review-final-score">最终得分: {{ perf.final_score }} · {{ getGrade(perf.final_score)?.label }}</text>
            <text class="review-comment-text" v-if="perf.calibration_comment">校准意见: {{ perf.calibration_comment }}</text>
          </view>

          <view class="review-comment-input">
            <text class="review-input-label">HR复核意见</text>
            <textarea
              v-model="hrReviewComments[perf.performance_id]"
              class="review-textarea"
              placeholder="请对绩效结果进行复核..."
            />
          </view>
          <view class="review-actions">
            <button class="btn-reject-sm" @click="handleHRReject(perf)">驳回复核</button>
            <button class="btn-confirm-sm" @click="handleHRApprove(perf)">复核通过</button>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="📋" title="暂无待HR复核" desc="部门负责人校准完成后，待复核的绩效将在此显示" />
    </view>

    <!-- 打分/校准抽屉 -->
    <ScoringDrawer
      :visible="drawerVisible"
      :performance="drawerPerformance"
      :mode="drawerMode"
      :existingScores="currentEvalScores"
      :existingComment="currentEvalComment"
      @close="drawerVisible = false"
      @save="handleSaveScore"
      @submit="handleSubmitScore"
    />
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.js'
import EmployeeListItem from '@/components/EmployeeListItem.vue'
import ScoringDrawer from '@/components/ScoringDrawer.vue'
import EmptyState from '@/components/EmptyState.vue'
import { getGrade } from '@/utils/constants.js'

const store = usePerformanceStore()

const activeTab = ref('eval')
const drawerVisible = ref(false)
const drawerPerformance = ref(null)
const drawerMode = ref('eval')
const rejectTargetId = ref('')
const rejectReason = ref('')
const indicatorReviewComments = ref({})
const calibrateRejectReasons = ref({})
const hrReviewComments = ref({})

uni.$on('teamEvalTab', (tab) => {
  if (tab) activeTab.value = tab
})

const tabs = computed(() => [
  { key: 'confirm', label: '待确认指标', count: store.pendingConfirmCount },
  { key: 'indicator_review', label: '待复核指标', count: store.pendingIndicatorReviewCount },
  { key: 'eval', label: '待打分', count: store.pendingEvalCount },
  { key: 'calibrate', label: '待校准', count: store.pendingCalibrateCount },
  { key: 'hrreview', label: '待HR复核', count: store.pendingHRReviewCount }
])

const currentEvalScores = computed(() => {
  if (!drawerPerformance.value) return {}
  const evalItem = drawerPerformance.value.manager_evaluations.find(
    m => m.manager_id === store.user.id
  )
  return evalItem?.indicator_scores || {}
})

const currentEvalComment = computed(() => {
  if (!drawerPerformance.value) return ''
  const evalItem = drawerPerformance.value.manager_evaluations.find(
    m => m.manager_id === store.user.id
  )
  return evalItem?.comment || ''
})

function completedEvals(perf) {
  return perf.manager_evaluations.filter(m => m.status === 'completed')
}

function primaryEvalComment(perf) {
  const primary = perf.manager_evaluations.find(m => m.is_primary_manager)
  return primary?.comment || ''
}

function openDrawer(perf, mode) {
  drawerPerformance.value = perf
  drawerMode.value = mode
  drawerVisible.value = true
}

function handleSaveScore({ scores, comment }) {
  store.saveManagerDraft(drawerPerformance.value.employee.id, scores, comment)
  uni.showToast({ title: '已保存草稿', icon: 'success' })
  drawerVisible.value = false
}

function handleSubmitScore({ scores, comment, grade }) {
  if (drawerMode.value === 'calibrate') {
    const evalUpdates = drawerPerformance.value.manager_evaluations.map(m => ({
      manager_id: m.manager_id,
      indicator_scores: scores
    }))
    store.submitCalibration(drawerPerformance.value.employee.id, evalUpdates, comment)
    uni.showToast({ title: '校准已提交', icon: 'success' })
  } else {
    store.submitManagerScore(drawerPerformance.value.employee.id, scores, comment)
    uni.showToast({ title: '评分已提交', icon: 'success' })
  }
  drawerVisible.value = false
}

// Phase 1: 指标确认
function handleConfirm(perf) {
  store.confirmIndicators(perf.employee.id)
  uni.showToast({ title: '指标已确认', icon: 'success' })
}

function handleReject(perf) {
  rejectTargetId.value = perf.performance_id
  rejectReason.value = ''
}

function submitReject(perf) {
  store.rejectIndicators(perf.employee.id, rejectReason.value)
  uni.showToast({ title: '指标已驳回', icon: 'none' })
  rejectTargetId.value = ''
  rejectReason.value = ''
}

// Phase 1: 指标复核（部门负责人）
function handleIndicatorReviewApprove(perf) {
  const comment = indicatorReviewComments.value[perf.performance_id] || ''
  store.approveIndicatorReview(perf.employee.id, comment)
  uni.showToast({ title: '复核通过', icon: 'success' })
}

function handleIndicatorReviewReject(perf) {
  const comment = indicatorReviewComments.value[perf.performance_id] || ''
  if (!comment) {
    uni.showToast({ title: '请填写复核意见', icon: 'none' })
    return
  }
  store.rejectIndicatorReview(perf.employee.id, comment)
  uni.showToast({ title: '指标已驳回', icon: 'none' })
}

// Phase 3: 校准
function handleCalibrationReject(perf) {
  const reason = calibrateRejectReasons.value[perf.performance_id] || ''
  if (!reason) {
    uni.showToast({ title: '请填写退回理由', icon: 'none' })
    return
  }
  store.rejectCalibration(perf.employee.id, reason)
  uni.showToast({ title: '已退回', icon: 'none' })
}

// Phase 3: HR复核
function handleHRApprove(perf) {
  const comment = hrReviewComments.value[perf.performance_id] || ''
  store.approveHRReview(perf.employee.id, comment)
  uni.showToast({ title: '复核通过', icon: 'success' })
}

function handleHRReject(perf) {
  const comment = hrReviewComments.value[perf.performance_id] || ''
  if (!comment) {
    uni.showToast({ title: '请填写复核意见', icon: 'none' })
    return
  }
  store.rejectHRReview(perf.employee.id, comment)
  uni.showToast({ title: '已驳回', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.team-eval-page {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1px solid $border-light;
  overflow-x: auto;
}

.tab-item {
  flex: 1;
  min-width: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 8rpx;
  position: relative;
}

.tab-active {
  border-bottom: 4rpx solid $color-primary;
}

.tab-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.tab-active .tab-text {
  color: $color-primary;
  font-weight: 600;
}

.tab-badge {
  font-size: 20rpx;
  color: #fff;
  background: $color-danger;
  border-radius: $radius-round;
  padding: 2rpx 10rpx;
  margin-left: 6rpx;
}

.tab-content {
  padding: 20rpx;
}

.confirm-card {
  margin-top: 12rpx;
  padding: 20rpx;
}

.confirm-actions-row {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid $border-light;
}

.indicator-detail {
  padding: 16rpx 0;
  border-top: 1px solid $border-light;
  border-bottom: 1px solid $border-light;
  margin: 16rpx 0;
}

.detail-label {
  font-size: $font-sm;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.detail-item {
  background: $bg-grey;
  border-radius: $radius-sm;
  padding: 14rpx 16rpx;
  margin-bottom: 10rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.detail-name {
  font-size: $font-sm;
  font-weight: 500;
  color: $text-primary;
}

.detail-weight {
  font-size: $font-xs;
  color: $color-primary;
  background: rgba(41,121,255,0.1);
  padding: 2rpx 10rpx;
  border-radius: $radius-sm;
}

.detail-row {
  display: flex;
  margin-top: 4rpx;
}

.detail-key {
  width: 80rpx;
  font-size: $font-xs;
  color: $text-hint;
}

.detail-val {
  font-size: $font-xs;
  color: $text-secondary;
  flex: 1;
}

.detail-score {
  font-size: $font-sm;
  font-weight: 600;
  color: $color-primary;
}

.btn-confirm-sm, .btn-reject-sm, .btn-ghost-sm, .btn-danger-sm, .btn-primary-sm {
  padding: 12rpx 28rpx;
  border-radius: $radius-sm;
  font-size: $font-sm;
  border: none;
}

.btn-confirm-sm { background: $color-success; color: #fff; }
.btn-reject-sm { background: $bg-grey; color: $color-danger; }
.btn-ghost-sm { background: $bg-grey; color: $text-secondary; }
.btn-danger-sm { background: $color-danger; color: #fff; }
.btn-primary-sm { background: $color-primary; color: #fff; }

.reject-input {
  margin-top: 16rpx;
}

.reject-textarea {
  width: 100%;
  height: 100rpx;
  border: 2rpx solid #ffcdd2;
  border-radius: $radius-sm;
  padding: 12rpx;
  font-size: $font-sm;
}

.reject-btns {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 12rpx;
}

.review-card {
  margin-top: 12rpx;
  padding: 20rpx;
}

.review-content {
  padding: 16rpx 0;
  border-top: 1px solid $border-light;
  border-bottom: 1px solid $border-light;
  margin: 16rpx 0;
}

.review-section-label {
  font-size: $font-sm;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.review-indicators {
  padding: 16rpx 0;
  border-top: 1px solid $border-light;
  border-bottom: 1px solid $border-light;
  margin: 16rpx 0;
}

.review-ind-item {
  background: $bg-grey;
  border-radius: $radius-sm;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.review-ind-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.review-ind-name {
  font-size: $font-sm;
  font-weight: 500;
  color: $text-primary;
}

.review-ind-weight {
  font-size: $font-xs;
  color: $color-primary;
  background: rgba(41,121,255,0.1);
  padding: 2rpx 10rpx;
  border-radius: $radius-sm;
}

.review-ind-row {
  display: flex;
  margin-top: 6rpx;
}

.review-ind-label {
  width: 80rpx;
  font-size: $font-xs;
  color: $text-hint;
}

.review-ind-val {
  font-size: $font-xs;
  color: $text-secondary;
  flex: 1;
}

.review-ind-score {
  font-size: $font-sm;
  font-weight: 600;
  color: $color-primary;
}

.eval-summary {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.eval-mgr-name {
  font-size: $font-sm;
  color: $text-primary;
  flex: 1;
}

.eval-mgr-score {
  font-size: $font-base;
  font-weight: 600;
  color: $color-primary;
  margin-right: 12rpx;
}

.eval-mgr-grade {
  font-size: $font-sm;
  font-weight: 600;
}

.review-final-score {
  font-size: $font-base;
  font-weight: 700;
  color: $text-primary;
  margin-top: 10rpx;
  display: block;
}

.review-comment-text {
  font-size: $font-xs;
  color: $text-secondary;
  margin-top: 8rpx;
  display: block;
  font-style: italic;
}

.review-comment-input {
  margin-top: 16rpx;
}

.review-input-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 8rpx;
  display: block;
}

.review-textarea {
  width: 100%;
  height: 120rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 12rpx;
  font-size: $font-sm;
  background: $bg-grey;
}

.review-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
  margin-top: 16rpx;
}

.calibrate-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid $border-light;
}
</style>
