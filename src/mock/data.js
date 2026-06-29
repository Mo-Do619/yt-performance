// Mock 数据集 - 覆盖完整流程场景

// ===== 当前登录用户（可切换） =====
export const currentUser = {
  id: 'M001',
  name: '张总',
  department: '广州研发中心',
  role: 'manager',    // employee | manager | admin
  avatar: ''
}

// ===== 所有用户信息 =====
export const users = {
  'U001': { id: 'U001', name: '林xx', department: '广州研发中心', avatar: '' },
  'U002': { id: 'U002', name: '陈xx', department: '深圳研发中心', avatar: '' },
  'U003': { id: 'U003', name: '赵xx', department: '产品部', avatar: '' },
  'U004': { id: 'U004', name: '孙xx', department: '广州研发中心', avatar: '' },
  'M001': { id: 'M001', name: '张总', department: '广州研发中心', avatar: '' },
  'M002': { id: 'M002', name: '王工', department: '广州研发中心', avatar: '' }
}

// ===== 绩效数据 =====
export const performances = [
  {
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
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '行政主管',
        is_primary_manager: true,
        weight: 0.6,
        indicator_scores: { I001: null, I002: null, I003: null },
        total_score: null,
        comment: '',
        status: 'pending'
      },
      {
        manager_id: 'M002',
        manager_name: '王工',
        role_label: '项目主管',
        is_primary_manager: false,
        weight: 0.4,
        indicator_scores: { I001: null, I002: null, I003: null },
        total_score: null,
        comment: '',
        status: 'pending'
      }
    ],
    current_node: 'goal_setting',
    performance_grade: null,
    final_score: null,
    deadlines: {
      goal_setting: '2026-07-15',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
    performance_id: 'P-2026-Q3-002',
    cycle: '2026 Q3',
    employee: { id: 'U002', name: '陈xx', department: '深圳研发中心', avatar: '' },
    indicators: [
      { id: 'I101', name: '数据中台建设', weight: 0.5, target: '完成数据中台V2版本架构升级', self_score: 80 },
      { id: 'I102', name: 'API 网关优化', weight: 0.5, target: '优化网关性能，P99延迟降低30%', self_score: 85 }
    ],
    indicator_confirm_status: 'pending_confirm',
    indicator_confirm_by: null,
    self_evaluation: {
      content: '',
      score: null,
      submitted_at: null
    },
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '行政主管',
        is_primary_manager: true,
        weight: 0.7,
        indicator_scores: { I101: null, I102: null },
        total_score: null,
        comment: '',
        status: 'pending'
      }
    ],
    current_node: 'goal_confirming',
    performance_grade: null,
    final_score: null,
    deadlines: {
      goal_setting: '2026-07-15',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
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
    manager_evaluations: [
      {
        manager_id: 'M001',
        manager_name: '张总',
        role_label: '行政主管',
        is_primary_manager: true,
        weight: 0.6,
        indicator_scores: { I201: 93, I202: 90, I203: 86 },
        total_score: 90.6,
        comment: '产品规划能力强，用户调研深入，竞品分析全面。',
        status: 'completed'
      },
      {
        manager_id: 'M002',
        manager_name: '王工',
        role_label: '项目主管',
        is_primary_manager: false,
        weight: 0.4,
        indicator_scores: { I201: 90, I202: 88, I203: 85 },
        total_score: 87.7,
        comment: '沟通协调能力强，对技术理解到位。',
        status: 'completed'
      }
    ],
    current_node: 'calibrating',
    performance_grade: 'A',
    final_score: 89.44,
    deadlines: {
      goal_setting: '2026-07-15',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  },
  {
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
    manager_evaluations: [],
    current_node: 'goal_setting',
    performance_grade: null,
    final_score: null,
    deadlines: {
      goal_setting: '2026-07-15',
      self_evaluating: '2026-09-20',
      manager_evaluating: '2026-10-10',
      calibrating: '2026-10-20'
    }
  }
]
