import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currentUser, users, performances as mockPerformances } from '@/mock/data.js'
import { NODE_MAP, STEPS, getGrade } from '@/utils/constants.js'

export const usePerformanceStore = defineStore('performance', () => {
  // ===== State =====
  const user = ref({ ...currentUser })
  const list = ref(JSON.parse(JSON.stringify(mockPerformances)))
  const viewingEmployeeId = ref(null)
  const selectedRole = ref('manager')

  // ===== Getters =====

  const myPerformance = computed(() =>
    list.value.find(p => p.employee.id === user.value.id)
  )

  const viewingPerformance = computed(() => {
    if (!viewingEmployeeId.value) return null
    return list.value.find(p => p.employee.id === viewingEmployeeId.value)
  })

  // Phase 1: 待直属领导确认指标
  const pendingIndicatorConfirms = computed(() => {
    if (user.value.role === 'admin') {
      return list.value.filter(p => p.current_node === 'goal_confirming')
    }
    return list.value.filter(p =>
      p.current_node === 'goal_confirming' &&
      p.manager_evaluations.some(m =>
        m.manager_id === user.value.id && m.is_primary_manager
      )
    )
  })

  // Phase 1: 待部门负责人复核指标
  const pendingIndicatorReviews = computed(() => {
    if (user.value.role === 'admin') {
      return list.value.filter(p => p.current_node === 'indicator_reviewing')
    }
    return list.value.filter(p =>
      p.current_node === 'indicator_reviewing' && p.indicator_reviewer_id === user.value.id
    )
  })

  // Phase 2: 待直属领导打分
  const pendingEvaluations = computed(() => {
    if (user.value.role === 'admin') {
      return list.value.filter(p =>
        p.current_node === 'manager_evaluating' &&
        p.manager_evaluations.some(m => m.status !== 'completed')
      )
    }
    return list.value.filter(p =>
      p.current_node === 'manager_evaluating' &&
      p.manager_evaluations.some(m =>
        m.manager_id === user.value.id && m.status !== 'completed'
      )
    )
  })

  // Phase 3: 待部门负责人校准
  const pendingCalibrations = computed(() => {
    if (user.value.role === 'admin') {
      return list.value.filter(p => p.current_node === 'calibrating')
    }
    return list.value.filter(p =>
      p.current_node === 'calibrating' && p.calibrator_id === user.value.id
    )
  })

  // Phase 3: 待HR复核
  const pendingHRReviews = computed(() => {
    if (user.value.role === 'admin') {
      return list.value.filter(p => p.current_node === 'hr_reviewing')
    }
    return list.value.filter(p =>
      p.current_node === 'hr_reviewing' && p.hr_reviewer_id === user.value.id
    )
  })

  const pendingConfirmCount = computed(() => pendingIndicatorConfirms.value.length)
  const pendingIndicatorReviewCount = computed(() => pendingIndicatorReviews.value.length)
  const pendingEvalCount = computed(() => pendingEvaluations.value.length)
  const pendingCalibrateCount = computed(() => pendingCalibrations.value.length)
  const pendingHRReviewCount = computed(() => pendingHRReviews.value.length)

  const isManager = computed(() =>
    list.value.some(p =>
      p.manager_evaluations.some(m => m.manager_id === user.value.id) ||
      p.indicator_reviewer_id === user.value.id ||
      p.calibrator_id === user.value.id ||
      p.hr_reviewer_id === user.value.id
    )
  )

  const isAdmin = computed(() => user.value.role === 'admin')

  const currentStep = computed(() => {
    const perf = myPerformance.value
    if (!perf) return 0
    return NODE_MAP[perf.current_node]?.step || 0
  })

  const currentSteps = computed(() => STEPS)

  // ===== Actions =====

  function switchUser(userId) {
    const u = users[userId]
    if (u) {
      user.value = { ...u, role: u.role || (userId.startsWith('M') ? 'manager' : userId.startsWith('H') ? 'hr' : 'employee') }
    }
  }

  function switchRole(role) {
    selectedRole.value = role
    if (role === 'employee') {
      user.value = { ...users['U001'], role: 'employee' }
    } else if (role === 'manager') {
      user.value = { ...users['M001'], role: 'manager' }
    } else if (role === 'reviewer') {
      user.value = { ...users['M003'], role: 'manager' }
    } else if (role === 'hr') {
      user.value = { ...users['H001'], role: 'hr' }
    } else if (role === 'admin') {
      user.value = { ...users['A001'], role: 'admin' }
    }
  }

  // ===== Phase 1: 指标制定环节 =====

  // 保存指标草稿
  function saveIndicators(indicators) {
    const perf = myPerformance.value
    if (perf) {
      perf.indicators = indicators.map(ind => ({
        ...ind,
        weight: ind.weight || (ind._weight_pct || 0) / 100
      }))
    }
  }

  // 被评人提交指标 → 直属领导确认
  function submitIndicatorsForConfirm() {
    const perf = myPerformance.value
    if (perf) {
      perf.indicator_confirm_status = 'pending_confirm'
      perf.current_node = 'goal_confirming'
      perf._reject_reason = ''
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

  // 直属领导确认指标 → 部门负责人复核指标
  function confirmIndicators(employeeId) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_confirm_status = 'confirmed'
      perf.indicator_confirm_by = user.value.id
      perf.current_node = 'indicator_reviewing'
    }
  }

  // 直属领导驳回指标 → 退回被评人
  function rejectIndicators(employeeId, reason) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_confirm_status = 'rejected'
      perf.indicator_confirm_by = null
      perf.current_node = 'goal_setting'
      perf._reject_reason = reason
    }
  }

  // 部门负责人复核通过指标 → 进入数据填报
  function approveIndicatorReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_review_status = 'approved'
      perf.indicator_review_comment = comment
      perf.current_node = 'self_evaluating'
    }
  }

  // 部门负责人驳回指标复核 → 退回被评人
  function rejectIndicatorReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.indicator_review_status = 'rejected'
      perf.indicator_review_comment = comment
      perf.current_node = 'goal_setting'
      perf.indicator_confirm_status = 'rejected'
      perf._reject_reason = comment
    }
  }

  // ===== Phase 2: 评分评级环节 =====

  // 被评人提交数据填报（月度完成情况 + 自评）
  function submitSelfEval(monthlyCompletion, content, score) {
    const perf = myPerformance.value
    if (perf) {
      perf.monthly_completion = monthlyCompletion
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

  // 保存主管打分草稿
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

  // 直属领导提交评分 → 进入绩效校准
  function submitManagerScore(employeeId, indicatorScores, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (!perf) return
    const evalItem = perf.manager_evaluations.find(m => m.manager_id === user.value.id)
    if (evalItem) {
      evalItem.indicator_scores = { ...indicatorScores }
      evalItem.comment = comment
      evalItem.total_score = calcManagerTotal(evalItem, perf.indicators)
      evalItem.status = 'completed'

      const allDone = perf.manager_evaluations.every(m => m.status === 'completed')
      if (allDone) {
        perf.final_score = calcFinalScore(perf.manager_evaluations)
        perf.performance_grade = perf.final_score !== null ? getGrade(perf.final_score)?.grade : null
        perf.calibration_status = 'pending'
        perf.calibration_comment = ''
        perf.current_node = 'calibrating'
      }
    }
  }

  // ===== Phase 3: 绩效校准环节 =====

  // 部门负责人校准 → 进入HR复核
  function submitCalibration(employeeId, evalUpdates, comment) {
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
    perf.performance_grade = perf.final_score !== null ? getGrade(perf.final_score)?.grade : null
    perf.calibration_status = 'completed'
    perf.calibration_comment = comment
    perf.current_node = 'hr_reviewing'
  }

  // 部门负责人驳回到直属领导重评
  function rejectCalibration(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.calibration_status = 'rejected'
      perf.calibration_comment = comment
      perf.current_node = 'manager_evaluating'
      // 重置评估状态，让主管能在待打分列表中看到并重新评分
      perf.manager_evaluations.forEach(m => {
        if (m.status === 'completed') m.status = 'draft'
      })
    }
  }

  // HR复核通过 → 结果可查看
  function approveHRReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.hr_review_status = 'approved'
      perf.hr_review_comment = comment
      perf.current_node = 'result_visible'
    }
  }

  // HR复核驳回 → 退回校准
  function rejectHRReview(employeeId, comment) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.hr_review_status = 'rejected'
      perf.hr_review_comment = comment
      perf.current_node = 'calibrating'
    }
  }

  // ===== Phase 4: 结果查看 =====

  function archivePerformance(employeeId) {
    const perf = list.value.find(p => p.employee.id === employeeId)
    if (perf) {
      perf.current_node = 'archived'
    }
  }

  function sendReminder(stage) {
    console.log(`[催办] 已向 ${stage} 阶段的超时人员发送催办提醒`)
  }

  return {
    // State
    user, list, viewingEmployeeId, selectedRole,
    // Getters
    myPerformance, viewingPerformance,
    pendingIndicatorConfirms, pendingIndicatorReviews,
    pendingEvaluations, pendingCalibrations, pendingHRReviews,
    pendingConfirmCount, pendingIndicatorReviewCount,
    pendingEvalCount, pendingCalibrateCount, pendingHRReviewCount,
    isManager, isAdmin, currentStep, currentSteps,
    // Actions — Role
    switchUser, switchRole,
    // Actions — Phase 1
    saveIndicators, submitIndicatorsForConfirm,
    confirmIndicators, rejectIndicators,
    approveIndicatorReview, rejectIndicatorReview,
    // Actions — Phase 2
    submitSelfEval, saveManagerDraft, submitManagerScore,
    calcManagerTotal, calcFinalScore,
    // Actions — Phase 3
    submitCalibration, rejectCalibration,
    approveHRReview, rejectHRReview,
    // Actions — Phase 4
    archivePerformance, sendReminder
  }
})
