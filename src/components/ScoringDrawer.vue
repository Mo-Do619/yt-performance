<template>
  <view class="scoring-drawer-mask" v-if="visible" @click="close">
    <view class="scoring-drawer" @click.stop>
      <!-- 头部 -->
      <view class="drawer-header">
        <view class="header-left">
          <text class="header-title">{{ modeLabel }}</text>
          <text class="header-sub">{{ performance?.employee?.name }}</text>
        </view>
        <view class="header-right">
          <DeadlineBadge v-if="deadline" :deadline="deadline" />
          <text class="close-btn" @click="close">✕</text>
        </view>
      </view>

      <!-- 员工自评区（只读） -->
      <scroll-view class="drawer-body" scroll-y>
        <view class="readonly-section">
          <text class="section-label">员工指标与自评</text>
          <view v-for="ind in indicators" :key="ind.id" class="indicator-readonly">
            <view class="ind-readonly-header">
              <text class="ind-name">{{ ind.name }}</text>
              <text class="ind-weight">权重 {{ (ind.weight * 100).toFixed(0) }}%</text>
            </view>
            <view class="ind-readonly-row">
              <text class="ind-readonly-label">目标</text>
              <text class="ind-readonly-val">{{ ind.target }}</text>
            </view>
            <view class="ind-readonly-row">
              <text class="ind-readonly-label">自评</text>
              <text class="ind-readonly-score">{{ ind.self_score ?? '--' }}</text>
            </view>
          </view>

          <view v-if="performance?.self_evaluation?.content" class="self-eval-summary">
            <text class="section-label">员工自评总结</text>
            <text class="self-eval-text">{{ performance.self_evaluation.content }}</text>
            <text class="self-eval-score">综合自评分: {{ performance.self_evaluation.score }} 分</text>
          </view>
        </view>

        <!-- 打分区域 -->
        <view class="scoring-section">
          <text class="section-label">{{ scoringLabel }}</text>

          <view v-for="ind in indicators" :key="ind.id" class="scoring-row">
            <text class="scoring-ind-name">{{ ind.name }}</text>
            <view class="scoring-input-wrap">
              <input
                v-model.number="localScores[ind.id]"
                class="scoring-input"
                type="number"
                placeholder="0-100"
                :disabled="!canEdit"
              />
              <text class="scoring-unit">分</text>
            </view>
          </view>

          <!-- 计算中综合分 -->
          <view class="calc-row">
            <text class="calc-label">综合分（自动计算）</text>
            <text class="calc-val">{{ calculatedTotal }}</text>
          </view>

          <ScoringHints :hint="hintText" />

          <!-- 分数联动等级 -->
          <view class="linkage-wrap">
            <ScoreGradeLinkage
              :totalScore="calculatedTotalNum"
              :calibrateMode="isCalibrateMode"
            />
          </view>

          <!-- 评语 -->
          <view class="comment-field">
            <text class="field-label">评语</text>
            <textarea
              v-model="localComment"
              class="comment-textarea"
              placeholder="请输入评语..."
              :maxlength="300"
              :disabled="!canEdit"
            />
          </view>

          <!-- 校准模式：等级手动调整 -->
          <view v-if="isCalibrateMode" class="calibrate-grade">
            <text class="field-label">绩效等级（可手动调整）</text>
            <view class="grade-options">
              <view
                v-for="g in gradeOptions"
                :key="g.grade"
                class="grade-option"
                :class="{ 'grade-selected': selectedGrade === g.grade }"
                :style="selectedGrade === g.grade ? { borderColor: g.color, background: g.color + '1a' } : {}"
                @click="selectedGrade = g.grade"
              >
                <text class="grade-char" :style="{ color: g.color }">{{ g.grade }}</text>
                <text class="grade-label" :style="{ color: g.color }">{{ g.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view class="drawer-footer" v-if="canEdit">
        <button class="btn-ghost" @click="handleSave">保存草稿</button>
        <button class="btn-primary" @click="handleSubmit">{{ submitLabel }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DeadlineBadge from './DeadlineBadge.vue'
import ScoringHints from './ScoringHints.vue'
import ScoreGradeLinkage from './ScoreGradeLinkage.vue'
import { GRADE_MAP, SCORING_HINTS } from '@/utils/constants.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  performance: { type: Object, default: null },
  mode: { type: String, default: 'eval' },  // eval | calibrate
  existingScores: { type: Object, default: () => ({}) },
  existingComment: { type: String, default: '' }
})

const emit = defineEmits(['close', 'save', 'submit'])

const localScores = ref({})
const localComment = ref('')
const selectedGrade = ref('')

const isCalibrateMode = computed(() => props.mode === 'calibrate')
const canEdit = computed(() => true)

const modeLabel = computed(() => isCalibrateMode.value ? '绩效校准' : '绩效评估')
const scoringLabel = computed(() => isCalibrateMode.value ? '调整指标分值' : '逐项指标打分')
const submitLabel = computed(() => isCalibrateMode.value ? '提交校准' : '提交评估')
const hintText = computed(() => isCalibrateMode.value ? SCORING_HINTS.calibrate : SCORING_HINTS.manager)

const indicators = computed(() => props.performance?.indicators || [])
const gradeOptions = GRADE_MAP

const calculatedTotalNum = computed(() => {
  const total = indicators.value.reduce((sum, ind) => {
    const score = Number(localScores.value[ind.id]) || 0
    return sum + score * (ind.weight || 0)
  }, 0)
  return parseFloat(total.toFixed(1))
})

const calculatedTotal = computed(() => {
  return calculatedTotalNum.value || '--'
})

const deadline = computed(() => {
  const dl = props.performance?.deadlines
  const node = props.performance?.current_node
  if (!dl || !node) return ''
  return dl[node] || ''
})

// 重置表单
watch(() => props.visible, (v) => {
  if (v) {
    localScores.value = { ...props.existingScores }
    localComment.value = props.existingComment
    selectedGrade.value = props.performance?.performance_grade || ''
  }
})

function close() { emit('close') }
function handleSave() {
  emit('save', { scores: { ...localScores.value }, comment: localComment.value })
}
function handleSubmit() {
  emit('submit', {
    scores: { ...localScores.value },
    comment: localComment.value,
    grade: isCalibrateMode.value ? selectedGrade.value : undefined
  })
}
</script>

<style lang="scss" scoped>
.scoring-drawer-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.scoring-drawer {
  width: 85vw;
  max-width: 600rpx;
  height: 100vh;
  background: $bg-color;
  display: flex;
  flex-direction: column;
  box-shadow: $shadow-drawer;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1px solid $border-light;
}

.header-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
}

.header-sub {
  font-size: $font-sm;
  color: $text-hint;
  margin-top: 4rpx;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.close-btn {
  font-size: 36rpx;
  color: $text-hint;
  padding: 10rpx;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20rpx;
}

.readonly-section, .scoring-section {
  background: #fff;
  border-radius: $radius-base;
  padding: 24rpx;
  margin: 20rpx;
}

.section-label {
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
  padding-bottom: 12rpx;
  border-bottom: 1px solid $border-light;
}

.indicator-readonly {
  background: $bg-grey;
  border-radius: $radius-sm;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.ind-readonly-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.ind-name {
  font-size: $font-sm;
  font-weight: 500;
  color: $text-primary;
}

.ind-weight {
  font-size: $font-xs;
  color: $color-primary;
}

.ind-readonly-row {
  display: flex;
  align-items: center;
  margin-top: 6rpx;
}

.ind-readonly-label {
  width: 80rpx;
  font-size: $font-xs;
  color: $text-hint;
}

.ind-readonly-val {
  font-size: $font-xs;
  color: $text-secondary;
  flex: 1;
}

.ind-readonly-score {
  font-size: $font-sm;
  color: $color-primary;
  font-weight: 600;
}

.self-eval-summary {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid $border-light;
}

.self-eval-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
  white-space: pre-wrap;
}

.self-eval-score {
  font-size: $font-sm;
  font-weight: 600;
  color: $color-primary;
  margin-top: 10rpx;
}

.scoring-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid $border-light;
}

.scoring-ind-name {
  font-size: $font-sm;
  color: $text-primary;
  flex: 1;
  margin-right: 16rpx;
}

.scoring-input-wrap {
  display: flex;
  align-items: center;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 8rpx 12rpx;
  width: 140rpx;
  background: $bg-grey;
}

.scoring-input {
  flex: 1;
  font-size: $font-base;
  font-weight: 600;
  text-align: center;
}

.scoring-unit {
  font-size: $font-xs;
  color: $text-hint;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  margin-top: 8rpx;
}

.calc-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.calc-val {
  font-size: $font-xl;
  font-weight: 700;
  color: $color-primary;
}

.linkage-wrap {
  margin: 10rpx 0;
}

.comment-field {
  margin-top: 20rpx;
}

.field-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 10rpx;
  display: block;
}

.comment-textarea {
  width: 100%;
  height: 120rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 16rpx;
  font-size: $font-sm;
  background: $bg-grey;
}

.grade-options {
  display: flex;
  gap: 12rpx;
  margin-top: 10rpx;
}

.grade-option {
  flex: 1;
  padding: 12rpx 4rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-sm;
  text-align: center;
}

.grade-selected {
  border-width: 3rpx;
}

.grade-char {
  font-size: $font-lg;
  font-weight: 700;
  display: block;
}

.grade-label {
  font-size: $font-xs;
  display: block;
}

.drawer-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1px solid $border-light;
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
