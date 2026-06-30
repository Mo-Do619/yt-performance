// Mock 数据集 - 覆盖四阶段流程场景

// ===== 当前登录用户（可切换） =====
export const currentUser = {
  id: 'M001',
  name: '张总',
  department: '广州研发中心',
  role: 'manager',
  avatar: ''
}

// ===== 所有用户信息 =====
export const users = {
  'U001': { id: 'U001', name: '林xx', department: '广州研发中心', avatar: '' },
  'U002': { id: 'U002', name: '陈xx', department: '深圳研发中心', avatar: '' },
  'U003': { id: 'U003', name: '赵xx', department: '产品部', avatar: '' },
  'U004': { id: 'U004', name: '孙xx', department: '广州研发中心', avatar: '' },
  'M001': { id: 'M001', name: '张总', department: '广州研发中心', avatar: '' },
  'M002': { id: 'M002', name: '王工', department: '广州研发中心', avatar: '' },
  'M003': { id: 'M003', name: '李总', department: '广州研发中心', avatar: '' },
  'H001': { id: 'H001', name: '赵HR', department: '人力资源部', avatar: '' },
  'A001': { id: 'A001', name: '管理员', department: 'HR与管理中心', avatar: '' }
}

// ===== 绩效数据 =====
export const performances = [
  {
    // 阶段：指标制定（被评人填写目标）
    performance_id: 'P-2026-Q3-001',
    cycle: '2026 Q3',
    employee: { id: 'U001', name: '林xx', department: '广州研发中心', avatar: '' },
    indicators: [
      { id: 'I001', name: 'GeekOS 核心模块开发', weight: 0.4, target: '完成编译与单元测试，通过CI/CD流水线集成', self_score: 90 },
      { id: 'I002', name: '业务系统前后端联调', weight: 0.3, target: '推进完成内部业务系统的前后端联调工作', self_score: 88 },
      { id: 'I003', name: '团队协作与文档输出', weight: 0.3, target: '输出技术文档2篇，组织技术分享1次', self_score: 92 }
    ],
    indicator_confirm_status: 'draft',
    indicator_confirm_by: null,
    self_evaluation: {
      content: '',
      score: null,
      submitted_at: null
    },
    monthly_completion: '',
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '直属领导',
        is_primary_manager: true,
        weight: 1.0,
        indicator_scores: { I001: null, I002: null, I003: null },
        total_score: null,
        comment: '',
        status: 'pending'
      }
    ],
    current_node: 'goal_setting',
    indicator_reviewer_id: 'M003',
    indicator_review_status: 'pending',
    indicator_review_comment: '',
    calibrator_id: 'M003',
    calibration_status: 'pending',
    calibration_comment: '',
    hr_reviewer_id: 'H001',
    hr_review_status: 'pending',
    hr_review_comment: '',
    performance_grade: null,
    final_score: null,
    deadlines: {
      goal_setting: '2026-07-15',
      goal_confirming: '2026-07-22',
      indicator_reviewing: '2026-07-29',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
    // 阶段：直属领导评分中（指标已复核通过，被评人已完成数据填报）
    performance_id: 'P-2026-Q3-002',
    cycle: '2026 Q3',
    employee: { id: 'U002', name: '陈xx', department: '深圳研发中心', avatar: '' },
    indicators: [
      { id: 'I101', name: '数据中台建设', weight: 0.5, target: '完成数据中台V2版本架构升级', self_score: 80 },
      { id: 'I102', name: 'API 网关优化', weight: 0.5, target: '优化网关性能，P99延迟降低30%', self_score: 85 }
    ],
    indicator_confirm_status: 'confirmed',
    indicator_confirm_by: 'M001',
    self_evaluation: {
      content: '本季度重点完成了数据中台V2版本架构升级，系统已稳定运行。API网关性能优化方面，通过引入缓存层和连接池优化，P99延迟降低了35%，超额完成目标。',
      score: 82.5,
      submitted_at: '2026-09-12'
    },
    monthly_completion: '7月完成架构设计评审，8月完成核心模块开发，9月完成集成测试与上线。各月度均按计划推进，关键里程碑无延期。',
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '直属领导',
        is_primary_manager: true,
        weight: 1.0,
        indicator_scores: { I101: null, I102: null },
        total_score: null,
        comment: '',
        status: 'pending'
      }
    ],
    current_node: 'manager_evaluating',
    indicator_reviewer_id: 'M003',
    indicator_review_status: 'approved',
    indicator_review_comment: '指标设定合理，目标明确可衡量，同意按此执行。',
    calibrator_id: 'M003',
    calibration_status: 'pending',
    calibration_comment: '',
    hr_reviewer_id: 'H001',
    hr_review_status: 'pending',
    hr_review_comment: '',
    performance_grade: null,
    final_score: null,
    deadlines: {
      goal_setting: '2026-07-15',
      goal_confirming: '2026-07-22',
      indicator_reviewing: '2026-07-29',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
    // 阶段：绩效校准中（直属领导已打分，待部门负责人校准）
    performance_id: 'P-2026-Q3-003',
    cycle: '2026 Q3',
    employee: { id: 'U003', name: '赵xx', department: '产品部', avatar: '' },
    indicators: [
      { id: 'I201', name: '产品路线图规划', weight: 0.4, target: '完成2027年度产品路线图初稿', self_score: 95 },
      { id: 'I202', name: '用户调研', weight: 0.3, target: '完成深度用户访谈20场并输出分析报告', self_score: 92 },
      { id: 'I203', name: '竞品分析', weight: 0.3, target: '输出竞品分析报告3份', self_score: 88 }
    ],
    indicator_confirm_status: 'confirmed',
    indicator_confirm_by: 'M001',
    self_evaluation: {
      content: '完成了2027年度产品路线图规划，组织了20场用户深度访谈并输出详细分析报告，同时完成了3份竞品分析报告。各项指标均按时保质完成。',
      score: 92,
      submitted_at: '2026-09-10'
    },
    monthly_completion: '7月完成路线图框架，8月完成用户调研15场，9月完成剩余调研及竞品分析，整体进度正常。',
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '直属领导',
        is_primary_manager: true,
        weight: 1.0,
        indicator_scores: { I201: 93, I202: 90, I203: 86 },
        total_score: 90.1,
        comment: '产品规划能力强，用户调研深入，竞品分析全面。',
        status: 'completed'
      }
    ],
    current_node: 'calibrating',
    indicator_reviewer_id: 'M003',
    indicator_review_status: 'approved',
    indicator_review_comment: '指标全面覆盖产品核心工作，权重分配合理。',
    calibrator_id: 'M003',
    calibration_status: 'pending',
    calibration_comment: '',
    hr_reviewer_id: 'H001',
    hr_review_status: 'pending',
    hr_review_comment: '',
    performance_grade: 'A',
    final_score: 90.1,
    deadlines: {
      goal_setting: '2026-07-15',
      goal_confirming: '2026-07-22',
      indicator_reviewing: '2026-07-29',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
    // 阶段：指标被驳回，需重新编辑
    performance_id: 'P-2026-Q3-004',
    cycle: '2026 Q3',
    employee: { id: 'U004', name: '孙xx', department: '广州研发中心', avatar: '' },
    indicators: [
      { id: 'I301', name: '测试自动化建设', weight: 0.5, target: '搭建自动化测试框架，覆盖率达到80%', self_score: 70 },
      { id: 'I302', name: '性能测试平台', weight: 0.5, target: '完成性能测试平台POC', self_score: 75 }
    ],
    indicator_confirm_status: 'rejected',
    indicator_confirm_by: null,
    self_evaluation: {
      content: '',
      score: null,
      submitted_at: null
    },
    monthly_completion: '',
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '直属领导',
        is_primary_manager: true,
        weight: 1.0,
        indicator_scores: { I301: null, I302: null },
        total_score: null,
        comment: '',
        status: 'pending'
      }
    ],
    current_node: 'goal_setting',
    indicator_reviewer_id: 'M003',
    indicator_review_status: 'pending',
    indicator_review_comment: '',
    calibrator_id: 'M003',
    calibration_status: 'pending',
    calibration_comment: '',
    hr_reviewer_id: 'H001',
    hr_review_status: 'pending',
    hr_review_comment: '',
    performance_grade: null,
    final_score: null,
    _reject_reason: '指标目标值偏低，请重新制定更具挑战性的目标',
    deadlines: {
      goal_setting: '2026-07-15',
      goal_confirming: '2026-07-22',
      indicator_reviewing: '2026-07-29',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  }
]
