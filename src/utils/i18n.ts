export type Lang = 'en' | 'zh'

const translations = {
  en: {
    appName: 'TaskFlow',
    appTagline: 'Stay on top of every day',

    // Nav
    today: 'Today',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    templates: 'Templates',
    settings: 'Settings',

    // Filters
    filters: 'Filters',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    allPriorities: 'All Priorities',
    clearFilters: 'Clear Filters',

    // Status
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',

    // Not finished
    notFinished: 'Not Finished',
    notFinishedDesc: 'Incomplete tasks from previous days',
    notFinishedEmpty: 'No overdue tasks',

    // Backlog
    backlog: 'Someday / Goals',
    backlogDesc: 'No specific date — do it when the time is right',
    backlogEmpty: 'No goals yet. Add something you want to do someday.',
    addBacklog: 'Add Goal',
    scheduleTask: 'Schedule for a day',

    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',

    // Recurrence
    recurrence: 'Recurrence',
    none: 'One-time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    daysOfWeek: 'Repeat on',
    dayOfMonth: 'Day of month',
    endDate: 'End date',
    noEndDate: 'No end date',

    // Categories
    work: 'Work',
    personal: 'Personal',
    health: 'Health',
    learning: 'Learning',
    finance: 'Finance',

    // Actions
    addTask: 'Add Task',
    addTemplate: 'Add Template',
    editTask: 'Edit Task',
    editTemplate: 'Edit Template',
    deleteTask: 'Delete Task',
    deleteTemplate: 'Delete Template',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    archive: 'Archive',
    unarchive: 'Unarchive',
    duplicate: 'Duplicate',

    // Fields
    title: 'Title',
    description: 'Description',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    date: 'Date',
    notes: 'Notes',
    optional: 'optional',

    // Views
    noTasksDay: 'No tasks for this day',
    noTasksFilter: 'No tasks match your filters',
    addFirstTask: 'Add your first task to get started',
    tasksCompleted: 'tasks completed',
    tasksDue: 'tasks due',

    // Templates
    templatesTitle: 'Recurring Templates',
    templatesDesc: 'Templates generate daily task instances automatically.',
    noTemplates: 'No templates yet',
    addFirstTemplate: 'Create a template to auto-generate repeating tasks',
    activeTemplate: 'Active',
    archivedTemplate: 'Archived',
    showArchived: 'Show archived',

    // Storage
    storageUsage: 'Storage',
    storageWarning: 'Storage is getting full (>70%). Consider removing old completed tasks.',
    storageCritical: 'Storage almost full (>90%)! Please delete old tasks to avoid data loss.',
    clearOldTasks: 'Clear completed tasks older than 30 days',
    cleared: 'Cleared',

    // Confirm dialogs
    confirmDelete: 'Are you sure you want to delete this?',
    confirmDeleteTemplate: 'Delete this template? Existing task instances will not be removed.',
    confirmClearTasks: 'This will permanently delete all completed tasks older than 30 days.',

    // Days of week
    sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
    thu: 'Thu', fri: 'Fri', sat: 'Sat',

    // Date
    previous: 'Previous',
    next: 'Next',
    jumpToToday: 'Jump to Today',

    // Stats
    total: 'Total',
    progress: 'Progress',

    // Language
    language: 'Language',
    english: 'English',
    chinese: '中文',

    // Misc
    newCategory: 'New Category',
    categoryName: 'Category Name',
    categoryColor: 'Color',
    addCategory: 'Add Category',
    manageCategories: 'Manage Categories',
  },
  zh: {
    appName: 'TaskFlow',
    appTagline: '掌握每一天',

    today: '今天',
    day: '日',
    week: '週',
    month: '月',
    templates: '範本',
    settings: '設定',

    filters: '篩選',
    allCategories: '所有類別',
    allStatuses: '所有狀態',
    allPriorities: '所有優先級',
    clearFilters: '清除篩選',

    pending: '待處理',
    'in-progress': '進行中',
    completed: '已完成',

    // Not finished
    notFinished: '未完成',
    notFinishedDesc: '來自前幾天尚未完成的事項',
    notFinishedEmpty: '沒有逾期任務',

    // Backlog
    backlog: '未來目標',
    backlogDesc: '沒有特定日期，等時機到了再做',
    backlogEmpty: '還沒有目標，加一個想做的事吧',
    addBacklog: '新增目標',
    scheduleTask: '安排到某天',

    low: '低',
    medium: '中',
    high: '高',

    recurrence: '重複',
    none: '單次',
    daily: '每天',
    weekly: '每週',
    monthly: '每月',
    daysOfWeek: '重複於',
    dayOfMonth: '每月第幾天',
    endDate: '結束日期',
    noEndDate: '不設結束',

    work: '工作',
    personal: '個人',
    health: '健康',
    learning: '學習',
    finance: '財務',

    addTask: '新增任務',
    addTemplate: '新增範本',
    editTask: '編輯任務',
    editTemplate: '編輯範本',
    deleteTask: '刪除任務',
    deleteTemplate: '刪除範本',
    save: '儲存',
    cancel: '取消',
    delete: '刪除',
    confirm: '確認',
    archive: '封存',
    unarchive: '取消封存',
    duplicate: '複製',

    title: '標題',
    description: '描述',
    category: '類別',
    priority: '優先級',
    status: '狀態',
    date: '日期',
    notes: '備註',
    optional: '選填',

    noTasksDay: '這天沒有任務',
    noTasksFilter: '沒有符合篩選條件的任務',
    addFirstTask: '新增你的第一個任務',
    tasksCompleted: '個任務已完成',
    tasksDue: '個任務待完成',

    templatesTitle: '重複範本',
    templatesDesc: '範本會自動生成每日任務實例。',
    noTemplates: '尚無範本',
    addFirstTemplate: '建立範本以自動生成重複任務',
    activeTemplate: '啟用中',
    archivedTemplate: '已封存',
    showArchived: '顯示已封存',

    storageUsage: '儲存空間',
    storageWarning: '儲存空間快滿了（>70%），建議清理舊的已完成任務。',
    storageCritical: '儲存空間即將用盡（>90%）！請刪除舊任務以避免資料遺失。',
    clearOldTasks: '清除 30 天前的已完成任務',
    cleared: '已清除',

    confirmDelete: '確定要刪除嗎？',
    confirmDeleteTemplate: '刪除此範本？現有的任務實例不會被移除。',
    confirmClearTasks: '這將永久刪除所有 30 天前的已完成任務。',

    sun: '日', mon: '一', tue: '二', wed: '三',
    thu: '四', fri: '五', sat: '六',

    previous: '上一個',
    next: '下一個',
    jumpToToday: '回到今天',

    total: '總計',
    progress: '進度',

    language: '語言',
    english: 'English',
    chinese: '中文',

    newCategory: '新類別',
    categoryName: '類別名稱',
    categoryColor: '顏色',
    addCategory: '新增類別',
    manageCategories: '管理類別',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function t(lang: Lang, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key
}
