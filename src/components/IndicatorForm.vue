<template>
  <view class="indicator-form">
    <view class="section-header">
      <text class="section-title">指标制定</text>
      <view v-if="editable" class="add-btn" @click="addIndicator">
        <text class="add-icon">+</text>
        <text class="add-text">添加指标</text>
      </view>
    </view>

    <view
      v-for="(item, index) in localIndicators"
      :key="item._key"
      class="indicator-item"
    >
      <!-- 删除按钮 -->
      <view v-if="editable && !locked" class="delete-btn" @click="removeIndicator(index)">
        <text>✕</text>
      </view>

      <!-- 指标标题行 -->
      <view class="indicator-title-row">
        <text class="indicator-title">指标{{ toChineseNum(index + 1) }}</text>
        <view class="weight-row">
          <text class="weight-label">权重</text>
          <template v-if="editable">
            <input
              class="weight-input"
              v-model.number="item._weight_pct"
              type="number"
              placeholder="0"
              @change="onWeightChange(item)"
            />
            <text class="weight-suffix">%</text>
          </template>
          <text v-else class="weight-value">{{ (item.weight * 100).toFixed(0) }}%</text>
        </view>
      </view>

      <!-- 指标名称 -->
      <view class="indicator-field">
        <text class="field-label">指标名称</text>
        <input
          v-if="editable && !locked"
          class="field-input"
          v-model="item.name"
          placeholder="请输入指标名称"
        />
        <text v-else class="field-value">{{ item.name || '--' }}</text>
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
        <text v-else class="field-value">{{ item.target || '--' }}</text>
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

    <!-- 空状态 -->
    <view v-if="localIndicators.length === 0 && editable && !locked" class="empty-hint">
      <text>暂无指标，点击上方"+ 添加指标"开始制定</text>
    </view>

    <!-- 权重合计提醒 -->
    <view v-if="weightSum !== 100 && localIndicators.length > 0" class="weight-warning">
      <text>⚠ 当前权重合计 {{ weightSum }}%，请调整为 100%</text>
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
      <button class="btn-ghost" @click="handleSave">保存指标</button>
      <button class="btn-primary" @click="handleSubmit">提交确认</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  indicators: { type: Array, default: () => [] },
  confirmStatus: { type: String, default: 'draft' },
  rejectReason: { type: String, default: '' },
  editable: { type: Boolean, default: true }
})

const emit = defineEmits(['save', 'submit'])

const localIndicators = ref([])
let nextKey = 100

watch(() => props.indicators, (val) => {
  const cloned = JSON.parse(JSON.stringify(val || []))
  // 将 weight (0-1) 转为展示用的百分比
  localIndicators.value = cloned.map((ind, i) => ({
    ...ind,
    _key: ind._key || 'ind_' + i,
    _weight_pct: Math.round((ind.weight || 0) * 100)
  }))
}, { immediate: true, deep: true })

const confirmInfoMap = {
  draft: null,
  pending_confirm: '指标已提交，等待直属主管确认中...',
  confirmed: '指标已确认，已锁定不可编辑',
  rejected: '指标已被驳回，请重新编辑后提交'
}
const confirmIconMap = { draft: '', pending_confirm: '⏳', confirmed: '✅', rejected: '❌' }

const confirmInfo = computed(() => confirmInfoMap[props.confirmStatus] || null)
const confirmIcon = computed(() => confirmIconMap[props.confirmStatus] || '')
const locked = computed(() => ['pending_confirm', 'confirmed'].includes(props.confirmStatus))
const weightSum = computed(() => {
  return localIndicators.value.reduce((s, ind) => s + (ind._weight_pct || 0), 0)
})

function onWeightChange(item) {
  item.weight = (item._weight_pct || 0) / 100
}

function addIndicator() {
  const newItem = {
    _key: 'new_' + (nextKey++),
    id: 'I' + Date.now(),
    name: '',
    weight: 0,
    _weight_pct: 0,
    target: '',
    self_score: null
  }
  localIndicators.value.push(newItem)
}

function removeIndicator(index) {
  localIndicators.value.splice(index, 1)
}

const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
function toChineseNum(n) {
  return chineseNums[n - 1] || String(n)
}

function normalizeData() {
  return localIndicators.value.map(ind => ({
    ...ind,
    weight: (ind._weight_pct || 0) / 100
  }))
}

function handleSave() {
  emit('save', normalizeData())
}

function handleSubmit() {
  emit('submit', normalizeData())
}
</script>

<style lang="scss" scoped>
.indicator-form {
  background: #fff;
  border-radius: $radius-lg;
  padding: 30rpx;
  margin: 0 20rpx 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid $border-light;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: rgba(41,121,255,0.08);
  border-radius: $radius-round;
  border: 2rpx dashed $color-primary;
}

.add-icon {
  font-size: 28rpx;
  color: $color-primary;
  margin-right: 6rpx;
  font-weight: 600;
}

.add-text {
  font-size: $font-sm;
  color: $color-primary;
}

.indicator-item {
  background: $bg-grey;
  border-radius: $radius-base;
  padding: 20rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.delete-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(250,53,52,0.12);
  color: $color-danger;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-xs;
}

.indicator-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-right: 32rpx;
}

.indicator-title {
  font-size: $font-base;
  font-weight: 700;
  color: $text-primary;
}

.weight-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.weight-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-right: 8rpx;
}

.weight-input {
  width: 80rpx;
  height: 56rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 0 8rpx;
  font-size: $font-sm;
  text-align: center;
  background: #fff;
}

.weight-suffix {
  font-size: $font-sm;
  color: $text-secondary;
  margin-left: 4rpx;
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

.empty-hint {
  text-align: center;
  padding: 40rpx 0;
  color: $text-hint;
  font-size: $font-sm;
}

.weight-warning {
  padding: 12rpx 20rpx;
  background: rgba(255,153,0,0.08);
  border-radius: $radius-sm;
  margin-top: 12rpx;
  font-size: $font-xs;
  color: $color-warning;
}

.confirm-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-radius: $radius-sm;
  margin-top: 16rpx;
  font-size: $font-sm;
}

.confirm-pending_confirm { background: rgba(255,153,0,0.1); color: $color-warning; }
.confirm-confirmed { background: rgba(25,190,107,0.1); color: $color-success; }
.confirm-rejected { background: rgba(250,53,52,0.1); color: $color-danger; }

.confirm-icon { margin-right: 10rpx; }

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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-base;
  font-size: $font-base;
  border: none;
}

.btn-primary { background: $color-primary; color: #fff; }
.btn-ghost { background: $bg-grey; color: $text-secondary; }
</style>
