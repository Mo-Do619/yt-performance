<template>
  <view class="indicator-form">
    <view class="section-title">指标制定</view>

    <view
      v-for="(item, index) in localIndicators"
      :key="item.id"
      class="indicator-item"
    >
      <view class="indicator-header">
        <text class="indicator-name">指标{{ index + 1 }}: {{ item.name }}</text>
        <text class="indicator-weight">权重 {{ (item.weight * 100).toFixed(0) }}%</text>
      </view>

      <view class="indicator-field">
        <text class="field-label">目标描述</text>
        <input
          v-if="editable"
          class="field-input"
          v-model="item.target"
          placeholder="请描述该指标的预期目标"
          :disabled="locked"
        />
        <text v-else class="field-value">{{ item.target }}</text>
      </view>

      <view class="indicator-field">
        <text class="field-label">自评分数</text>
        <input
          v-if="editable"
          class="field-input field-num"
          v-model.number="item.self_score"
          type="number"
          placeholder="0-100"
          :disabled="locked"
        />
        <text v-else class="field-value">{{ item.self_score ?? '--' }}</text>
      </view>
    </view>

    <!-- 确认状态栏 -->
    <view v-if="confirmInfo" class="confirm-bar" :class="'confirm-' + confirmStatus">
      <text class="confirm-icon">{{ confirmIcon }}</text>
      <text class="confirm-text">{{ confirmInfo }}</text>
    </view>

    <!-- 驳回原因 -->
    <view v-if="rejectReason" class="reject-reason">
      <text class="reject-label">驳回原因：</text>
      <text class="reject-text">{{ rejectReason }}</text>
    </view>

    <!-- 操作按钮 -->
    <view v-if="editable && !locked" class="form-actions">
      <button class="btn-ghost" @click="$emit('save', localIndicators)">保存指标</button>
      <button class="btn-primary" @click="$emit('submit', localIndicators)">提交确认</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { INDICATOR_CONFIRM_MAP } from '@/utils/constants.js'

const props = defineProps({
  indicators: { type: Array, default: () => [] },
  confirmStatus: { type: String, default: 'draft' },
  rejectReason: { type: String, default: '' },
  editable: { type: Boolean, default: true }
})

defineEmits(['save', 'submit'])

const localIndicators = ref([])

watch(() => props.indicators, (val) => {
  localIndicators.value = JSON.parse(JSON.stringify(val || []))
}, { immediate: true, deep: true })

const confirmInfoMap = {
  draft: null,
  pending_confirm: '指标已提交，等待直属主管确认中...',
  confirmed: '指标已确认，已锁定不可编辑',
  rejected: '指标已被驳回，请重新编辑后提交'
}

const confirmIconMap = {
  draft: '',
  pending_confirm: '⏳',
  confirmed: '✅',
  rejected: '❌'
}

const confirmInfo = computed(() => confirmInfoMap[props.confirmStatus] || null)
const confirmIcon = computed(() => confirmIconMap[props.confirmStatus] || '')
const locked = computed(() => ['pending_confirm', 'confirmed'].includes(props.confirmStatus))
</script>

<style lang="scss" scoped>
.indicator-form {
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

.indicator-item {
  background: $bg-grey;
  border-radius: $radius-base;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.indicator-name {
  font-size: $font-base;
  font-weight: 500;
  color: $text-primary;
  flex: 1;
}

.indicator-weight {
  font-size: $font-sm;
  color: $color-primary;
  background: rgba(41,121,255,0.1);
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

.indicator-field {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.field-label {
  width: 140rpx;
  font-size: $font-sm;
  color: $text-secondary;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  height: 60rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 0 16rpx;
  font-size: $font-sm;
  background: #fff;
}

.field-num {
  width: 140rpx;
  flex: 0 0 auto;
}

.field-value {
  font-size: $font-sm;
  color: $text-primary;
}

.confirm-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-radius: $radius-sm;
  margin-top: 16rpx;
  font-size: $font-sm;
}

.confirm-pending_confirm {
  background: rgba(255,153,0,0.1);
  color: $color-warning;
}

.confirm-confirmed {
  background: rgba(25,190,107,0.1);
  color: $color-success;
}

.confirm-rejected {
  background: rgba(250,53,52,0.1);
  color: $color-danger;
}

.confirm-icon {
  margin-right: 10rpx;
}

.reject-reason {
  padding: 16rpx 20rpx;
  background: rgba(250,53,52,0.05);
  border-radius: $radius-sm;
  margin-top: 12rpx;
}

.reject-label {
  font-size: $font-sm;
  color: $color-danger;
  font-weight: 500;
}

.reject-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-primary, .btn-ghost {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: $radius-base;
  font-size: $font-base;
  text-align: center;
  border: none;
}

.btn-primary {
  background: $color-primary;
  color: #fff;
}

.btn-ghost {
  background: $bg-grey;
  color: $text-secondary;
}
</style>
