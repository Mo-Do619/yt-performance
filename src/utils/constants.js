// 绩效管理系统常量配置

// ===== 流程状态枚举 =====
export const NODE_STATUS = {
  GOAL_SETTING: 'goal_setting',
  GOAL_CONFIRMING: 'goal_confirming',
  INDICATOR_REVIEWING: 'indicator_reviewing',
  SELF_EVALUATING: 'self_evaluating',
  MANAGER_EVALUATING: 'manager_evaluating',
  CALIBRATING: 'calibrating',
  HR_REVIEWING: 'hr_reviewing',
  RESULT_VISIBLE: 'result_visible',
  ARCHIVED: 'archived'
}

// ===== 流程状态映射 =====
export const NODE_MAP = {
  goal_setting: { label: '指标制定', color: '#2979ff', step: 0 },
  goal_confirming: { label: '指标确认', color: '#ff9900', step: 1 },
  indicator_reviewing: { label: '指标复核', color: '#ff6b00', step: 2 },
  self_evaluating: { label: '数据填报', color: '#19be6b', step: 3 },
  manager_evaluating: { label: '直属领导评分', color: '#722ed1', step: 4 },
  calibrating: { label: '绩效校准', color: '#ff6b00', step: 5 },
  hr_reviewing: { label: 'HR复核', color: '#ff9900', step: 6 },
  result_visible: { label: '结果查看', color: '#19be6b', step: 7 },
  archived: { label: '归档', color: '#909399', step: 8 }
}

// ===== 步骤条顺序 =====
export const STEPS = [
  { key: 'goal_setting', label: '指标制定' },
  { key: 'goal_confirming', label: '指标确认' },
  { key: 'indicator_reviewing', label: '指标复核' },
  { key: 'self_evaluating', label: '数据填报' },
  { key: 'manager_evaluating', label: '直属领导评分' },
  { key: 'calibrating', label: '绩效校准' },
  { key: 'hr_reviewing', label: 'HR复核' },
  { key: 'result_visible', label: '结果查看' },
  { key: 'archived', label: '归档' }
]

// ===== 指标确认状态 =====
export const INDICATOR_CONFIRM_STATUS = {
  DRAFT: 'draft',
  PENDING_CONFIRM: 'pending_confirm',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected'
}

export const INDICATOR_CONFIRM_MAP = {
  draft: { label: '草稿', color: '#909399' },
  pending_confirm: { label: '待确认', color: '#ff9900' },
  confirmed: { label: '已确认', color: '#19be6b' },
  rejected: { label: '已驳回', color: '#fa3534' }
}

// ===== 绩效等级映射 =====
export const GRADE_MAP = [
  { min: 90, grade: 'S', label: '卓越', color: '#ff6b00' },
  { min: 80, grade: 'A', label: '优秀', color: '#19be6b' },
  { min: 70, grade: 'B', label: '良好', color: '#2979ff' },
  { min: 60, grade: 'C', label: '待改进', color: '#ff9900' },
  { min: 0, grade: 'D', label: '不合格', color: '#fa3534' }
]

// ===== 评估单项状态 =====
export const EVAL_STATUS_MAP = {
  completed: { label: '已完成', color: '#19be6b' },
  pending: { label: '待评估', color: '#ff9900' },
  draft: { label: '草稿', color: '#909399' }
}

// ===== 截止时间状态 =====
export const DEADLINE_STATUS = {
  NORMAL: 'normal',
  APPROACHING: 'approaching',
  OVERDUE: 'overdue'
}

export const DEADLINE_MAP = {
  normal: { label: '正常', color: '#19be6b' },
  approaching: { label: '临近截止', color: '#ff9900' },
  overdue: { label: '已超时', color: '#fa3534' }
}

// ===== 当前考核周期 =====
export const CURRENT_CYCLE = '2026 Q3'

// ===== 角色 =====
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

// ===== 评分提示文案 =====
export const SCORING_HINTS = {
  self: '请基于各项指标的完成情况综合打分，客观评价本周期工作成果',
  manager: '请根据员工各项指标的实际完成情况逐项打分，90分以上需附详细说明',
  calibrate: '校准阶段可直接调整各指标分值，绩效等级将自动联动更新'
}

// 根据分数获取等级
export function getGrade(score) {
  if (score === null || score === undefined) return null
  for (const g of GRADE_MAP) {
    if (score >= g.min) return g
  }
  return GRADE_MAP[GRADE_MAP.length - 1]
}

// 获取截止时间状态
export function getDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return DEADLINE_STATUS.NORMAL
  const now = new Date()
  const deadline = new Date(deadlineStr)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return DEADLINE_STATUS.OVERDUE
  if (diffDays <= 3) return DEADLINE_STATUS.APPROACHING
  return DEADLINE_STATUS.NORMAL
}

// 获取剩余天数文案
export function getDeadlineText(deadlineStr) {
  if (!deadlineStr) return ''
  const now = new Date()
  const deadline = new Date(deadlineStr)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `已超时 ${Math.abs(diffDays)} 天`
  if (diffDays === 0) return '今日截止'
  return `剩余 ${diffDays} 天`
}
