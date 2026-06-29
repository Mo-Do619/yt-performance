<template>
  <view class="dashboard">
    <!-- 绩效状态卡片 -->
    <StatusCard
      :cycle="myPerformance?.cycle || '2026 Q3'"
      :currentNode="myPerformance?.current_node || 'goal_setting'"
      :deadline="currentDeadline"
      :currentStep="store.currentStep"
    />

    <!-- 待办列表 -->
    <TodoList
      :role="store.user.role"
      :currentNode="myPerformance?.current_node || ''"
      :indicatorConfirmStatus="myPerformance?.indicator_confirm_status || ''"
      :pendingEvalCount="store.pendingEvalCount"
      :pendingConfirmCount="store.pendingConfirmCount"
      :pendingCalibrateCount="store.pendingCalibrateCount"
      @navigate="handleNavigate"
    />

    <!-- 角色切换（Demo用） -->
    <view class="role-switcher">
      <text class="switcher-label">切换角色体验：</text>
      <view class="switcher-btns">
        <button
          v-for="r in roles"
          :key="r.value"
          class="switcher-btn"
          :class="{ 'switcher-active': store.user.role === r.value }"
          @click="store.switchRole(r.value)"
        >{{ r.label }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.js'
import StatusCard from '@/components/StatusCard.vue'
import TodoList from '@/components/TodoList.vue'

const store = usePerformanceStore()

const myPerformance = computed(() => store.myPerformance)

const currentDeadline = computed(() => {
  const perf = myPerformance.value
  if (!perf?.deadlines || !perf?.current_node) return ''
  return perf.deadlines[perf.current_node] || ''
})

const roles = [
  { value: 'employee', label: '员工' },
  { value: 'manager', label: '主管' },
  { value: 'admin', label: '管理员' }
]

function handleNavigate(page, tab) {
  if (page === 'my-eval') {
    uni.switchTab({ url: '/pages/performance/my-eval' })
  } else if (page === 'team-eval') {
    uni.switchTab({ url: '/pages/performance/team-eval' })
  } else if (page === 'admin') {
    uni.switchTab({ url: '/pages/admin/config' })
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.role-switcher {
  margin: 40rpx 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: $radius-lg;
  text-align: center;
}

.switcher-label {
  font-size: $font-sm;
  color: $text-hint;
  margin-bottom: 16rpx;
  display: block;
}

.switcher-btns {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}

.switcher-btn {
  padding: 10rpx 28rpx;
  border-radius: $radius-round;
  font-size: $font-sm;
  background: $bg-grey;
  color: $text-secondary;
  border: 2rpx solid transparent;
}

.switcher-active {
  background: $color-primary;
  color: #fff;
}
</style>
