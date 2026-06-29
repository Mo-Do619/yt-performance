<template>
  <view class="confirm-bar" v-if="visible">
    <view class="confirm-info">
      <text class="confirm-label">指标确认</text>
      <text class="confirm-hint">作为直属主管，确认后指标将被锁定，员工不可再修改</text>
    </view>
    <view class="confirm-actions">
      <button class="btn-reject" @click="handleReject">驳回</button>
      <button class="btn-confirm" @click="handleConfirm">确认指标</button>
    </view>

    <!-- 驳回原因输入 -->
    <view v-if="showRejectInput" class="reject-input-wrap">
      <textarea
        v-model="rejectReason"
        class="reject-textarea"
        placeholder="请输入驳回原因..."
        :maxlength="200"
      />
      <view class="reject-input-actions">
        <button class="btn-ghost-sm" @click="showRejectInput = false">取消</button>
        <button class="btn-danger-sm" @click="submitReject">确认驳回</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  employeeId: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'reject'])

const showRejectInput = ref(false)
const rejectReason = ref('')

function handleConfirm() {
  emit('confirm', props.employeeId)
}

function handleReject() {
  showRejectInput.value = true
}

function submitReject() {
  emit('reject', { employeeId: props.employeeId, reason: rejectReason.value })
  showRejectInput.value = false
  rejectReason.value = ''
}
</script>

<style lang="scss" scoped>
.confirm-bar {
  background: #fff;
  border-radius: $radius-lg;
  padding: 24rpx 30rpx;
  margin: 0 20rpx 20rpx;
}

.confirm-info {
  margin-bottom: 20rpx;
}

.confirm-label {
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 6rpx;
}

.confirm-hint {
  font-size: $font-xs;
  color: $text-hint;
}

.confirm-actions {
  display: flex;
  gap: 20rpx;
}

.btn-confirm, .btn-reject {
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-base;
  font-size: $font-base;
  border: none;
}

.btn-confirm {
  background: $color-success;
  color: #fff;
}

.btn-reject {
  background: $bg-grey;
  color: $color-danger;
}

.reject-input-wrap {
  margin-top: 20rpx;
}

.reject-textarea {
  width: 100%;
  height: 120rpx;
  border: 2rpx solid #ffcdd2;
  border-radius: $radius-sm;
  padding: 16rpx;
  font-size: $font-sm;
  background: #fff;
}

.reject-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 12rpx;
}

.btn-ghost-sm, .btn-danger-sm {
  padding: 12rpx 30rpx;
  border-radius: $radius-sm;
  font-size: $font-sm;
  border: none;
}

.btn-ghost-sm {
  background: $bg-grey;
  color: $text-secondary;
}

.btn-danger-sm {
  background: $color-danger;
  color: #fff;
}
</style>
