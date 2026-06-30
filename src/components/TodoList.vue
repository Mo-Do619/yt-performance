<template>
  <view class="todo-list">
    <view class="section-title" v-if="title">
      <text>{{ title }}</text>
    </view>

    <!-- 员工：指标填报待办 -->
    <view
      v-if="showIndicatorTodo"
      class="todo-card card"
      @click="$emit('navigate', 'my-eval')"
    >
      <view class="todo-left">
        <text class="todo-icon">📌</text>
        <view class="todo-info">
          <text class="todo-title">请完成指标填报</text>
          <text class="todo-desc">{{ indicatorTodoText }}</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 员工：数据填报待办 -->
    <view
      v-if="showDataEntryTodo"
      class="todo-card card"
      @click="$emit('navigate', 'my-eval')"
    >
      <view class="todo-left">
        <text class="todo-icon">📝</text>
        <view class="todo-info">
          <text class="todo-title">请完成数据填报与自评</text>
          <text class="todo-desc">填写月度绩效完成情况并提交自评</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 直属领导：待确认指标 -->
    <view
      v-if="showConfirmTodo && pendingConfirmCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'confirm')"
    >
      <view class="todo-left">
        <text class="todo-icon">🔒</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingConfirmCount }} 份指标待确认</text>
          <text class="todo-desc">作为直属领导，请确认下属的绩效指标</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 部门负责人：待复核指标 -->
    <view
      v-if="showIndicatorReviewTodo && pendingIndicatorReviewCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'indicator_review')"
    >
      <view class="todo-left">
        <text class="todo-icon">🔍</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingIndicatorReviewCount }} 份指标待复核</text>
          <text class="todo-desc">直属领导已确认，请复核指标设定</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 直属领导：待打分 -->
    <view
      v-if="showEvalTodo && pendingEvalCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'eval')"
    >
      <view class="todo-left">
        <text class="todo-icon">⚠</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingEvalCount }} 份绩效待评分</text>
          <text class="todo-desc">数据填报已完成，请进行打分</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 部门负责人：待校准 -->
    <view
      v-if="showCalibrateTodo && pendingCalibrateCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'calibrate')"
    >
      <view class="todo-left">
        <text class="todo-icon">🎯</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingCalibrateCount }} 份绩效待校准</text>
          <text class="todo-desc">直属领导已完成评分，请进行绩效校准</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- HR：待复核 -->
    <view
      v-if="showHRReviewTodo && pendingHRReviewCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'hrreview')"
    >
      <view class="todo-left">
        <text class="todo-icon">📋</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingHRReviewCount }} 份绩效待复核</text>
          <text class="todo-desc">部门负责人已校准，请复核绩效结果</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 管理员：催办 -->
    <view
      v-if="showReminder"
      class="todo-card card"
      @click="$emit('navigate', 'admin')"
    >
      <view class="todo-left">
        <text class="todo-icon">🔔</text>
        <view class="todo-info">
          <text class="todo-title">催办管理</text>
          <text class="todo-desc">查看超时人员并发送提醒</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <EmptyState
      v-if="!hasAnyTodo"
      icon="🎉"
      title="暂无待办"
      desc="一切就绪，干得不错！"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  title: { type: String, default: '待办事项' },
  role: { type: String, default: 'employee' },
  currentNode: { type: String, default: '' },
  indicatorConfirmStatus: { type: String, default: '' },
  pendingEvalCount: { type: Number, default: 0 },
  pendingConfirmCount: { type: Number, default: 0 },
  pendingIndicatorReviewCount: { type: Number, default: 0 },
  pendingCalibrateCount: { type: Number, default: 0 },
  pendingHRReviewCount: { type: Number, default: 0 }
})

defineEmits(['navigate'])

// 员工：指标填报（Phase 1）
const showIndicatorTodo = computed(() =>
  props.role === 'employee' &&
  (props.currentNode === 'goal_setting' || props.indicatorConfirmStatus === 'rejected')
)

const indicatorTodoText = computed(() =>
  props.indicatorConfirmStatus === 'rejected' ? '指标已被驳回，请重新编辑提交' : '完成指标填报后提交直属领导确认'
)

// 员工：数据填报（Phase 2）
const showDataEntryTodo = computed(() =>
  props.role === 'employee' && props.currentNode === 'self_evaluating'
)

// 直属领导：待确认指标
const showConfirmTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingConfirmCount > 0
)

// 部门负责人：待复核指标
const showIndicatorReviewTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingIndicatorReviewCount > 0
)

// 直属领导：待打分
const showEvalTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingEvalCount > 0
)

// 部门负责人：待校准
const showCalibrateTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingCalibrateCount > 0
)

// HR：待复核
const showHRReviewTodo = computed(() =>
  (props.role === 'hr' || props.role === 'admin') && props.pendingHRReviewCount > 0
)

const showReminder = computed(() => props.role === 'admin')

const hasAnyTodo = computed(() =>
  showIndicatorTodo.value || showDataEntryTodo.value ||
  showConfirmTodo.value || showIndicatorReviewTodo.value ||
  showEvalTodo.value || showCalibrateTodo.value || showHRReviewTodo.value ||
  showReminder.value
)
</script>

<style lang="scss" scoped>
.todo-list {
  padding: 0 20rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  padding: 20rpx 10rpx 10rpx;
}

.todo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-top: 12rpx;
}

.todo-important {
  border-left: 6rpx solid $color-primary;
}

.todo-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.todo-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.todo-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.todo-title {
  font-size: $font-base;
  color: $text-primary;
  font-weight: 500;
}

.todo-desc {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 4rpx;
}

.todo-arrow {
  font-size: 32rpx;
  color: $text-hint;
}
</style>
