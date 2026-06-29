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
      <view class="edit-field">
        <text class="field-label">综合自评分数</text>
        <view class="score-input-wrap">
          <input
            v-model.number="localScore"
            class="score-input"
            type="number"
            placeholder="0-100"
            :max="100"
            :min="0"
          />
          <text class="score-unit">分</text>
        </view>
      </view>
      <ScoringHints :hint="hintText" />
      <view class="form-actions">
        <button class="btn-ghost" @click="$emit('save', { content: localContent, score: localScore })">保存草稿</button>
        <button class="btn-primary" @click="$emit('submit', { content: localContent, score: localScore })">提交自评</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import ScoringHints from './ScoringHints.vue'
import { SCORING_HINTS } from '@/utils/constants.js'

const props = defineProps({
  content: { type: String, default: '' },
  score: { type: Number, default: null },
  editable: { type: Boolean, default: false }
})

defineEmits(['save', 'submit'])

const localContent = ref('')
const localScore = ref(null)
const hintText = SCORING_HINTS.self

watch(() => props.content, (v) => { localContent.value = v || '' }, { immediate: true })
watch(() => props.score, (v) => { localScore.value = v }, { immediate: true })
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

.score-input-wrap {
  display: flex;
  align-items: center;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 16rpx 20rpx;
  background: $bg-grey;
  width: 200rpx;
}

.score-input {
  flex: 1;
  font-size: 36rpx;
  font-weight: 600;
  color: $text-primary;
  text-align: center;
}

.score-unit {
  font-size: $font-base;
  color: $text-secondary;
  margin-left: 10rpx;
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

.btn-primary { background: $color-primary; color: #fff; }
.btn-ghost { background: $bg-grey; color: $text-secondary; }
</style>
