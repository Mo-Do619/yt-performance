import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CURRENT_CYCLE } from '@/utils/constants.js'

export const useAdminStore = defineStore('admin', () => {
  // ===== State =====
  const cycleConfig = ref({
    cycle_name: CURRENT_CYCLE,
    personnel_lock_date: '2026-07-20',
    stages: [
      { key: 'goal_setting', name: '目标制定', deadline_days: 5, reminders_sent: 0 },
      { key: 'self_evaluating', name: '自评提交', deadline_days: 5, reminders_sent: 1 },
      { key: 'manager_evaluating', name: '多方评估中', deadline_days: 5, reminders_sent: 0 },
      { key: 'calibrating', name: '绩效校准', deadline_days: 3, reminders_sent: 0 }
    ],
    auto_sync_personnel: true
  })

  const overdueStats = ref({
    self_evaluating: 8,
    manager_evaluating: 5,
    calibrating: 2
  })

  // ===== Actions =====
  function updateCycleConfig(config) {
    cycleConfig.value = { ...cycleConfig.value, ...config }
  }

  function updateStageDeadline(stageKey, days) {
    const stage = cycleConfig.value.stages.find(s => s.key === stageKey)
    if (stage) stage.deadline_days = days
  }

  function toggleAutoSync(enabled) {
    cycleConfig.value.auto_sync_personnel = enabled
  }

  function setPersonnelLockDate(date) {
    cycleConfig.value.personnel_lock_date = date
  }

  function sendReminder(stageKey) {
    const stage = cycleConfig.value.stages.find(s => s.key === stageKey)
    if (stage) stage.reminders_sent++
    if (overdueStats.value[stageKey]) {
      console.log(`[催办] 已向 ${overdueStats.value[stageKey]} 人发送催办提醒`)
    }
  }

  return {
    cycleConfig, overdueStats,
    updateCycleConfig, updateStageDeadline, toggleAutoSync,
    setPersonnelLockDate, sendReminder
  }
})
