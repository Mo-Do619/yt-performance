import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currentUser, users, performances as mockPerformances } from '@/mock/data.js'
import { NODE_MAP, STEPS, GRADE_MAP, getGrade } from '@/utils/constants.js'

export const usePerformanceStore = defineStore('performance', () => {
  // ===== State =====
  const user = ref({ ...currentUser })
  const list = ref(JSON.parse(JSON.stringify(mockPerformances)))
  const viewingEmployeeId = ref(null)
  const selectedRole = ref('manager')  // 用于角色切换按钮高亮

  // ===== Getters =====

  // 当前用户的绩效记录
  const myPerformance = computed(() => {
    return list.value.find(p => p.employee.id === user.value.id)
  })

  // 当前查看的员工绩效
  const viewingPerformance = computed(() => {
    if (!viewingEmployeeId.value) return null
    return list.value.find(p => p.employee.id === viewingEmployeeId.value)
  })

  // 待当前用户打分的员工列表
  const pendingEvaluations = computed(() => {
    return list.value.filter(p =>
      p.manager_evaluations.some(m =>
        m.manager_id === user.value.id && m.status === 'pending'
      )
    )
  })

  // 待当前用户确认指标的员工列表（仅直属主管）
  const pendingIndicatorConfirms = computed(() => {
    return list.value.filter(p =>
      p.indicator_confirm_status === 'pending_confirm' &&
      p.manager_evaluations.some(m =>
        m.manager_id === user.value.id && m.is_primary_manager
      )
    )
  })

  // 待当前用户校准的列表
  const pendingCalibrations = computed(() => {
    return list.value.filter(p =>
      p.current_node === 'calibrating' &&
      p.manager_evaluations.some(m =>
        m.manager_id === user.value.id && m.is_primary_manager
      )
    )
  })

  // 待评估总数
  const pendingEvalCount = computed(() => pendingEvaluations.value.length)
  const pendingConfirmCount = computed(() => pendingIndicatorConfirms.value.length)
  const pendingCalibrateCount = computed(() => pendingCalibrations.value.length)

  // 待当前用户复核的列表（部门负责人）
  const pendingReviews = computed(() =>
    list.value.filter(p =>
      p.current_node === 'reviewing' && p.reviewer_id === user.value.id
    )
  )
  const pendingReviewCount = computed(() => pendingReviews.value.length)

  // 当前用户是否为管理者（含部门负责人/复核人）
  const isManager = computed(() =>
    list.value.some(p =>
      p.manager_evaluations.some(m => m.manager_id === user.value.id) ||
      p.reviewer_id === user.value.id
    )
  )

  // 当前用户是否为管理员
  const isAdmin = computed(() => user.value.role === 'admin')

  // 当前节点的步骤索引
  const currentStep = computed(() => {
    const perf = myPerformance.value
    if (!perf) return 0
    return NODE_MAP[perf.current_node]?.step || 0
  })

  // 当前绩效的步骤列表
  const currentSteps = computed(() => {
    return STEPS
  })

  // ===== Actions =====

  // 切换当前登录用户
  function switchUser(userId) {
    const u = users[userId]
    if (u) {
      user.value = { ...u, role: u.role || (userId.startsWith('M') ? 'manager' : 'employee') }
    }
  }

  // 切换角色
  function switchRole(role) {
    selectedRole.value = role
    user.value.role = role
    if (role === 'employee') {
      user.value = { ...users['U001'], role: 'employee' }
    } else if (role === 'manager') {
      user.value = { ...users['M001'], role: 'manager' }
    } else if (role === 'reviewer') {
      user.value = { ...users['M003'], role: 'manager' }
    } else if (role === 'admin') {
      user.value = { ...users['M001'], role: 'admin' }
    }
  }

  // 保存指标（草稿）
  function saveIndicators(indicators) {
    const perf = myPerformance.value
    if (perf) {
      perf.indicators = indicators.map(ind => ({
        ...ind,
        weight: ind.weight || (ind._weight_pct || 0) / 100
      }))
    }
  }

  // 提交指标确认
  function submitIndicatorsForConfirm() {
    const perf = myPerformance.value
    if (perf) {
      perf.indicator_confirm_status = 'pending_confirm'
      perf.current_node = 'goal_confirming'
      // 为新指标初始化上级的 indicator_scores
      const newIndicatorIds = perf.indicators.map(i => i.id)
      perf.manager_evaluations.forEach(m => {
        const updated = {}
        newIndicatorIds.forEach(id => {
          updated[id] = m.indicator_scores?.[id] ?? null
        })
        m.indicator_scores = updated
      })
    }
  }

  // 部门负责人复核通过
  function approveReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.review_status = 'approved'
      perf.review_comment = comment
      perf.current_node = 'manager_evaluating'
    }
  }

  // 部门负责人驳回复核
  function rejectReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.review_status = 'rejected'
      perf.review_comment = comment
      perf.current_node = 'goal_setting'
      perf.indicator_confirm_status = 'rejected'
    }
  }

  // 直属主管确认指标（锁定）
  function confirmIndicators(employeeId) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_confirm_status = 'confirmed'
      perf.indicator_confirm_by = user.value.id
      perf.current_node = 'reviewing'
    }
  }

  // 直属主管驳回指标
  function rejectIndicators(employeeId, reason) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_confirm_status = 'rejected'
      perf.indicator_confirm_by = null
      perf.current_node = 'goal_setting'
      // 存储驳回原因供前端展示
      perf._reject_reason = reason
    }
  }

  // 提交自评
  function submitSelfEval(content, score) {
    const perf = myPerformance.value
    if (perf) {
      perf.self_evaluation.content = content
      perf.self_evaluation.score = score
      perf.self_evaluation.submitted_at = new Date().toISOString().split('T')[0]
      perf.current_node = 'manager_evaluating'
    }
  }

  // 计算单个上级的综合分
  function calcManagerTotal(managerEval, indicators) {
    return parseFloat(indicators.reduce((sum, ind) => {
      const score = managerEval.indicator_scores[ind.id] || 0
      return sum + score * ind.weight
    }, 0).toFixed(1))
  }

  // 计算最终总分
  function calcFinalScore(managerEvaluations) {
    const completedEvals = managerEvaluations.filter(m => m.status === 'completed' && m.total_score !== null)
    if (completedEvals.length === 0) return null
    const totalWeight = completedEvals.reduce((sum, m) => sum + m.weight, 0)
    if (totalWeight === 0) return null
    return parseFloat(completedEvals.reduce((sum, m) => sum + m.total_score * m.weight, 0).toFixed(2))
  }

  // 保存主管打分（草稿）
  function saveManagerDraft(employeeId, indicatorScores, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (!perf) return
    const evalItem = perf.manager_evaluations.find(m => m.manager_id === user.value.id)
    if (evalItem) {
      evalItem.indicator_scores = { ...indicatorScores }
      evalItem.comment = comment
      evalItem.total_score = calcManagerTotal(evalItem, perf.indicators)
      evalItem.status = 'draft'
    }
  }

  // 提交主管评估
  function submitManagerScore(employeeId, indicatorScores, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (!perf) return
    const evalItem = perf.manager_evaluations.find(m => m.manager_id === user.value.id)
    if (evalItem) {
      evalItem.indicator_scores = { ...indicatorScores }
      evalItem.comment = comment
      evalItem.total_score = calcManagerTotal(evalItem, perf.indicators)
      evalItem.status = 'completed'

      // 检查是否所有上级都已完成评估，若是则进入校准阶段
      const allDone = perf.manager_evaluations.every(m => m.status === 'completed')
      if (allDone) {
        perf.current_node = 'calibrating'
        perf.final_score = calcFinalScore(perf.manager_evaluations)
        perf.performance_grade = perf.final_score !== null ? getGrade(perf.final_score)?.grade : null
      }
    }
  }

  // 校准 - 修改分值和等级
  function calibrateScore(employeeId, evalUpdates) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (!perf) return
    evalUpdates.forEach(update => {
      const evalItem = perf.manager_evaluations.find(m => m.manager_id === update.manager_id)
      if (evalItem) {
        if (update.indicator_scores) {
          evalItem.indicator_scores = { ...evalItem.indicator_scores, ...update.indicator_scores }
          evalItem.total_score = calcManagerTotal(evalItem, perf.indicators)
        }
        if (update.total_score !== undefined) {
          evalItem.total_score = update.total_score
        }
      }
    })
    perf.final_score = calcFinalScore(perf.manager_evaluations)
    const gradeInfo = getGrade(perf.final_score)
    perf.performance_grade = gradeInfo?.grade || null
  }

  // 归档
  function archivePerformance(employeeId) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.current_node = 'archived'
    }
  }

  // 催办提醒
  function sendReminder(stage) {
    console.log(`[催办] 已向 ${stage} 阶段的超时人员发送催办提醒`)
    // Demo: 仅打印日志
  }

  return {
    // State
    user, list, viewingEmployeeId, selectedRole,
    // Getters
    myPerformance, viewingPerformance,
    pendingEvaluations, pendingIndicatorConfirms, pendingCalibrations, pendingReviews,
    pendingEvalCount, pendingConfirmCount, pendingCalibrateCount, pendingReviewCount,
    isManager, isAdmin, currentStep, currentSteps,
    // Actions
    switchUser, switchRole,
    saveIndicators, submitIndicatorsForConfirm,
    confirmIndicators, rejectIndicators,
    approveReview, rejectReview,
    submitSelfEval,
    saveManagerDraft, submitManagerScore,
    calcManagerTotal, calcFinalScore,
    calibrateScore, archivePerformance, sendReminder
  }
})
