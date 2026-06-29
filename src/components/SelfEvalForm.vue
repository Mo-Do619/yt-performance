<template>
  <view class="self-eval-form">
    <view class="section-title">目标与自评</view>

    <!-- 只读模式 -->
    <view v-if="!editable" class="eval-readonly">
      <view class="readonly-content">
        <text class="readonly-label">核心事项总结</text>
        <text class="readonly-text">{{ content || '暂无自评内容' }}</text>
      </view>
      <view class="readonly-score">
        <text class="readonly-label">综合自评分数</text>
        <text class="readonly-num">{{ score ?? '--' }}</text>
      </view>
    </view>

    <!-- 编辑模式 -->
    <view v-else class="eval-edit">
      <view class="edit-field">
        <text class="field-label">核心事项总结</text>
        <textarea
          v-model="localContent"
          class="edit-textarea"
          placeholder="请总结本周期完成的核心事项与工作成果..."
          :maxlength="1000"
          auto-height
        />
        <text class="char-count">{{ localContent.length }}/1000</text>
      </view>

      <!-- 自动计算的综合自评分数 -->
      <view class="edit-field">
        <text class="field-label">综合自评分数（自动计算）</text>
        <view class="auto-score-card">
          <text class="auto-score-num">{{ autoScore }}</text>
          <text class="auto-score-unit">分</text>
        </view>
        <text class="calc-detail">= {{ calcDetails }}</text>
        <ScoringHints :hint="hintText" />
      </view>

      <view class="form-actions">
        <button class="btn-primary" @click="handleSave">保存总结</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ScoringHints from './ScoringHints.vue'
import { SCORING_HINTS } from '@/utils/constants.js'

const props = defineProps({
  content: { type: String, default: '' },
  score: { type: Number, default: null },
  editable: { type: Boolean, default: false },
  indicators: { type: Array, default: () => [] }
})

const emit = defineEmits(['save'])

const localContent = ref('')
const hintText = SCORING_HINTS.self

watch(() => props.content, (v) => { localContent.value = v || '' }, { immediate: true })

// 根据指标自评分数和权重自动计算综合分
const autoScore = computed(() => {
  const inds = props.indicators
  if (!inds || inds.length === 0) return '--'
  const total = inds.reduce((sum, ind) => {
    return sum + (ind.self_score || 0) * (ind.weight || 0)
  }, 0)
  return total.toFixed(1)
})

const calcDetails = computed(() => {
  const inds = props.indicators
  if (!inds || inds.length === 0) return ''
  return inds.map(ind => {
    const s = ind.self_score || 0
    const w = ((ind.weight || 0) * 100).toFixed(0)
    return `${s}×${w}%`
  }).join(' + ')
})

function handleSave() {
  emit('save', { content: localContent.value })
}
</script>

<style lang="scss" scoped>
.self-eval-form {
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

.readonly-content, .readonly-score {
  margin-bottom: 20rpx;
}

.readonly-label, .field-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 10rpx;
  display: block;
}

.readonly-text {
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
  white-space: pre-wrap;
}

.readonly-num {
  font-size: 56rpx;
  font-weight: 700;
  color: $color-primary;
}

.edit-field {
  margin-bottom: 24rpx;
}

.edit-textarea {
  width: 100%;
  min-height: 200rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 20rpx;
  font-size: $font-base;
  background: $bg-grey;
}

.char-count {
  text-align: right;
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 6rpx;
}

.auto-score-card {
  display: flex;
  align-items: baseline;
  justify-content: center;
  padding: 24rpx;
  background: linear-gradient(135deg, rgba(41,121,255,0.06), rgba(41,121,255,0.02));
  border-radius: $radius-base;
  border: 2rpx solid #d6e4ff;
}

.auto-score-num {
  font-size: 64rpx;
  font-weight: 700;
  color: $color-primary;
}

.auto-score-unit {
  font-size: $font-lg;
  color: $color-primary;
  margin-left: 8rpx;
}

.calc-detail {
  display: block;
  text-align: center;
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 10rpx;
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
