<template>
  <view class="team-eval-page">
    <!-- Tab 切换 -->
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

    <!-- 待打分 Tab -->
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

    <!-- 待确认指标 Tab -->
    <view v-if="activeTab === 'confirm'" class="tab-content">
      <view v-if="store.pendingConfirmCount > 0">
        <view
          v-for="perf in store.pendingIndicatorConfirms"
          :key="perf.performance_id"
          class="card confirm-card"
        >
          <EmployeeListItem
            :performance="perf"
            tab="confirm"
            @click="viewIndicators(perf)"
          />
          <view class="confirm-actions-row">
            <button class="btn-reject-sm" @click="handleReject(perf)">驳回</button>
            <button class="btn-confirm-sm" @click="handleConfirm(perf)">确认指标</button>
          </view>

          <!-- 驳回原因 -->
          <view v-if="rejectTargetId === perf.performance_id" class="reject-input">
            <textarea v-model="rejectReason" placeholder="请输入驳回原因..." class="reject-textarea" />
            <view class="reject-btns">
              <button class="btn-ghost-sm" @click="rejectTargetId = ''">取消</button>
              <button class="btn-danger-sm" @click="submitReject(perf)">确认驳回</button>
            </view>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="📌" title="暂无待确认指标" desc="所有下属的指标已确认" />
    </view>

    <!-- 待校准 Tab -->
    <view v-if="activeTab === 'calibrate'" class="tab-content">
      <view v-if="store.pendingCalibrateCount > 0">
        <EmployeeListItem
          v-for="perf in store.pendingCalibrations"
          :key="perf.performance_id"
          :performance="perf"
          tab="calibrate"
          @click="openDrawer(perf, 'calibrate')"
        />
      </view>
      <EmptyState v-else icon="🎯" title="暂无待校准员工" desc="评估完成后的绩效将在此校准" />
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
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.js'
import EmployeeListItem from '@/components/EmployeeListItem.vue'
import ScoringDrawer from '@/components/ScoringDrawer.vue'
import EmptyState from '@/components/EmptyState.vue'

const store = usePerformanceStore()

const activeTab = ref('eval')
const drawerVisible = ref(false)
const drawerPerformance = ref(null)
const drawerMode = ref('eval')
const rejectTargetId = ref('')
const rejectReason = ref('')

const tabs = computed(() => [
  { key: 'eval', label: '待打分', count: store.pendingEvalCount },
  { key: 'confirm', label: '待确认指标', count: store.pendingConfirmCount },
  { key: 'calibrate', label: '校准中', count: store.pendingCalibrateCount }
])

// 当前要评估的记录中，该主管已有的打分数据
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
    const evalUpdates = store.pendingCalibrations
      .find(p => p.performance_id === drawerPerformance.value.performance_id)
      ?.manager_evaluations.map(m => ({
        manager_id: m.manager_id,
        indicator_scores: scores
      })) || []
    store.calibrateScore(drawerPerformance.value.employee.id, evalUpdates)
  } else {
    store.submitManagerScore(drawerPerformance.value.employee.id, scores, comment)
  }
  uni.showToast({ title: '评估已提交', icon: 'success' })
  drawerVisible.value = false
}

function handleConfirm(perf) {
  store.confirmIndicators(perf.employee.id)
  uni.showToast({ title: '指标已确认，已锁定', icon: 'success' })
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

function viewIndicators(perf) {
  // 查看指标详情，可在这里扩展跳转到指标详情页
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
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-active {
  border-bottom: 4rpx solid $color-primary;
}

.tab-text {
  font-size: $font-base;
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
  padding: 2rpx 12rpx;
  margin-left: 8rpx;
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

.btn-confirm-sm, .btn-reject-sm, .btn-ghost-sm, .btn-danger-sm {
  padding: 12rpx 28rpx;
  border-radius: $radius-sm;
  font-size: $font-sm;
  border: none;
}

.btn-confirm-sm { background: $color-success; color: #fff; }
.btn-reject-sm { background: $bg-grey; color: $color-danger; }
.btn-ghost-sm { background: $bg-grey; color: $text-secondary; }
.btn-danger-sm { background: $color-danger; color: #fff; }

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
</style>
