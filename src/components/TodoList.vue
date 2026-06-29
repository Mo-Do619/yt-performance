<template>
  <view class="todo-list">
    <view class="section-title" v-if="title">
      <text>{{ title }}</text>
    </view>

    <!-- 员工：指标/自评待办 -->
    <view
      v-if="showSelfEvalTodo"
      class="todo-card card"
      @click="$emit('navigate', 'my-eval')"
    >
      <view class="todo-left">
        <text class="todo-icon">📝</text>
        <view class="todo-info">
          <text class="todo-title">{{ selfEvalTodoText }}</text>
          <text class="todo-desc">点击前往填写</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 指标确认待办（仅员工） -->
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

    <!-- 主管：待确认指标 -->
    <view
      v-if="showConfirmTodo && pendingConfirmCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'confirm')"
    >
      <view class="todo-left">
        <text class="todo-icon">🔒</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingConfirmCount }} 份指标待确认</text>
          <text class="todo-desc">作为直属主管，请确认下属指标</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 主管：待打分 -->
    <view
      v-if="showEvalTodo && pendingEvalCount > 0"
      class="todo-card card todo-important"
      @click="$emit('navigate', 'team-eval', 'eval')"
    >
      <view class="todo-left">
        <text class="todo-icon">⚠</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingEvalCount }} 份下属绩效待评估</text>
          <text class="todo-desc">点击查看详情</text>
        </view>
      </view>
      <text class="todo-arrow">→</text>
    </view>

    <!-- 主管：待校准 -->
    <view
      v-if="showCalibrateTodo && pendingCalibrateCount > 0"
      class="todo-card card"
      @click="$emit('navigate', 'team-eval', 'calibrate')"
    >
      <view class="todo-left">
        <text class="todo-icon">✅</text>
        <view class="todo-info">
          <text class="todo-title">您有 {{ pendingCalibrateCount }} 份绩效待校准</text>
          <text class="todo-desc">评估已完成，请进行绩效校准</text>
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

    <!-- 空状态 -->
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
  pendingCalibrateCount: { type: Number, default: 0 }
})

defineEmits(['navigate'])

// 员工侧待办
const showIndicatorTodo = computed(() =>
  props.role === 'employee' &&
  (props.currentNode === 'goal_setting' || props.indicatorConfirmStatus === 'rejected')
)

const indicatorTodoText = computed(() =>
  props.indicatorConfirmStatus === 'rejected' ? '指标已被驳回，请重新编辑提交' : '完成指标填报后提交直属主管确认'
)

const showSelfEvalTodo = computed(() =>
  props.role === 'employee' && props.currentNode === 'self_evaluating'
)

const selfEvalTodoText = computed(() =>
  '请填写本季度绩效自评'
)

// 主管侧待办
const showConfirmTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingConfirmCount > 0
)

const showEvalTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingEvalCount > 0
)

const showCalibrateTodo = computed(() =>
  (props.role === 'manager' || props.role === 'admin') && props.pendingCalibrateCount > 0
)

// 管理员催办
const showReminder = computed(() => props.role === 'admin')

const hasAnyTodo = computed(() =>
  showIndicatorTodo.value || showSelfEvalTodo.value ||
  showConfirmTodo.value || showEvalTodo.value || showCalibrateTodo.value ||
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
