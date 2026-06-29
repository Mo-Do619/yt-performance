<template>
  <view class="admin-page">
    <!-- 周期设置 -->
    <view class="config-section card">
      <text class="section-title">周期绩效活动设置</text>
      <view class="config-row">
        <text class="config-label">当前周期</text>
        <text class="config-value">{{ adminStore.cycleConfig.cycle_name }}</text>
      </view>
      <view class="config-row">
        <text class="config-label">人员锁定节点</text>
        <text class="config-value">{{ adminStore.cycleConfig.personnel_lock_date }}</text>
      </view>
      <view class="config-row">
        <text class="config-label">自动同步异动人员</text>
        <switch
          :checked="adminStore.cycleConfig.auto_sync_personnel"
          @change="adminStore.toggleAutoSync(!adminStore.cycleConfig.auto_sync_personnel)"
        />
      </view>
      <view class="config-row">
        <text class="config-label">当前考核人数</text>
        <text class="config-value">156 人</text>
      </view>
      <view class="config-row">
        <text class="config-label">锁定后异动人员</text>
        <text class="config-value" style="color: #fa3534">3 人（待处理）</text>
      </view>
    </view>

    <!-- 流程时效配置 -->
    <view class="config-section card">
      <text class="section-title">流程时效配置</text>
      <view
        v-for="stage in adminStore.cycleConfig.stages"
        :key="stage.key"
        class="config-row"
      >
        <text class="config-label">{{ stage.name }}</text>
        <view class="deadline-config">
          <text class="deadline-val">{{ stage.deadline_days }}</text>
          <text class="deadline-unit">个工作日</text>
        </view>
      </view>
    </view>

    <!-- 绩效等级映射 -->
    <view class="config-section card">
      <text class="section-title">绩效等级映射</text>
      <view v-for="g in gradeMap" :key="g.grade" class="grade-row">
        <text class="grade-char" :style="{ color: g.color }">{{ g.grade }}</text>
        <text class="grade-label">{{ g.label }}</text>
        <text class="grade-range">{{ g.min }}-{{ g.max || 100 }}</text>
      </view>
    </view>

    <!-- 催办管理 -->
    <view class="config-section card">
      <text class="section-title">催办管理</text>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ adminStore.overdueStats.self_evaluating }}</text>
          <text class="stat-label">自评超时</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ adminStore.overdueStats.manager_evaluating }}</text>
          <text class="stat-label">评估超时</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ adminStore.overdueStats.calibrating }}</text>
          <text class="stat-label">校准超时</text>
        </view>
      </view>
      <view class="reminder-actions">
        <ReminderButton
          label="一键催办自评"
          stage="self_evaluating"
          @remind="handleRemind"
        />
        <ReminderButton
          label="一键催办评估"
          stage="manager_evaluating"
          @remind="handleRemind"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { useAdminStore } from '@/stores/admin.js'
import { GRADE_MAP } from '@/utils/constants.js'
import ReminderButton from '@/components/ReminderButton.vue'

const adminStore = useAdminStore()

const gradeMap = GRADE_MAP.map((g, i) => ({
  ...g,
  max: i > 0 ? GRADE_MAP[i - 1].min - 1 : 100
}))

function handleRemind(stage) {
  adminStore.sendReminder(stage)
  uni.showToast({ title: `已向${stage}阶段超时人员发送催办`, icon: 'success' })
}
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.config-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid $border-light;
  display: block;
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid $border-light;
}

.config-row:last-child {
  border-bottom: none;
}

.config-label {
  font-size: $font-base;
  color: $text-secondary;
}

.config-value {
  font-size: $font-base;
  color: $text-primary;
  font-weight: 500;
}

.deadline-config {
  display: flex;
  align-items: baseline;
}

.deadline-val {
  font-size: $font-xl;
  font-weight: 700;
  color: $color-primary;
}

.deadline-unit {
  font-size: $font-xs;
  color: $text-hint;
  margin-left: 4rpx;
}

.grade-row {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
}

.grade-char {
  font-size: $font-lg;
  font-weight: 700;
  width: 60rpx;
}

.grade-label {
  font-size: $font-base;
  color: $text-primary;
  flex: 1;
}

.grade-range {
  font-size: $font-sm;
  color: $text-hint;
}

.stats-row {
  display: flex;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 700;
  color: $color-danger;
  display: block;
}

.stat-label {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 4rpx;
}

.reminder-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}
</style>
