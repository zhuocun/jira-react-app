/**
 * 简体中文 (Simplified Chinese) translation of the central microcopy bundle.
 *
 * Keep the keys in lock-step with `src/constants/microcopy.ts` — the
 * `Dictionary` type below makes a missing key a compile error so we never
 * silently fall through to undefined at runtime.
 *
 * Brand names ("Pulse", "Copilot") and abbreviations ("AI") are intentionally
 * left in their native form — they read more naturally in product copy and
 * match how Chinese users encounter them in marketing.
 *
 * Token placeholders inside strings (e.g. `{name}`, `{seconds}`, `{origin}`)
 * must be preserved verbatim — call sites pass them through `String#replace`
 * after looking up the localized string.
 */
import type { Dictionary } from "../types";

const zhCN: Dictionary = {
    actions: {
        addColumn: "添加栏",
        apply: "应用",
        askCopilot: "询问 Copilot",
        cancel: "取消",
        clear: "清除",
        clearAiSearch: "清除 AI 搜索",
        close: "关闭",
        create: "创建",
        createProject: "创建项目",
        createTask: "创建任务",
        delete: "删除",
        draftWithAi: "使用 AI 起草",
        edit: "编辑",
        editProject: "编辑项目",
        editTask: "编辑任务",
        logIn: "登录",
        loggingIn: "登录中…",
        logOut: "退出登录",
        registerCta: "注册账号",
        loginCta: "登录账号",
        resetFilters: "重置筛选",
        retry: "重试",
        save: "保存",
        search: "搜索",
        send: "发送",
        showPassword: "显示密码",
        hidePassword: "隐藏密码",
        signUp: "注册",
        signingUp: "注册中…",
        stop: "停止",
        undo: "撤销"
    },
    validation: {
        emailRequired: "请输入邮箱",
        emailInvalid: "请输入有效的邮箱地址",
        passwordRequired: "请输入密码",
        passwordTooShort: "密码至少需要 8 个字符",
        usernameRequired: "请输入用户名",
        projectNameRequired: "请输入项目名称",
        organizationRequired: "请输入组织名称",
        managerRequired: "请选择负责人",
        coordinatorRequired: "请选择协调人",
        taskNameRequired: "请输入任务名称",
        taskTypeRequired: "请选择任务类型"
    },
    a11y: {
        capsLockOn: "大写锁定已开启",
        loadingProject: "正在加载项目",
        loadingProjectName: "正在加载项目名称",
        loadingBoard: "正在加载看板",
        accountMenu: "账户菜单",
        boardCopilot: "看板 Copilot",
        aiSuggestion: "AI 建议",
        aiBadge: "AI · 使用前请审核",
        useDarkMode: "切换到深色模式",
        useLightMode: "切换到浅色模式",
        goToProjects: "前往项目列表",
        members: "成员",
        viewTeamMembers: "查看团队成员"
    },
    labels: {
        members: "成员",
        teamMembers: "团队成员"
    },
    settings: {
        darkMode: "深色模式",
        toggleDarkMode: "切换深色模式",
        boardCopilot: "看板 Copilot",
        toggleBoardCopilot: "启用看板 Copilot 功能",
        language: "语言",
        changeLanguage: "切换语言"
    },
    fields: {
        coordinator: "协调人",
        email: "邮箱",
        epic: "史诗",
        manager: "负责人",
        notes: "备注",
        organization: "组织",
        password: "密码",
        projectName: "项目名称",
        storyPoints: "故事点",
        taskName: "任务名称",
        type: "类型",
        username: "用户名"
    },
    confirm: {
        deleteProject: {
            title: "确认删除该项目?",
            description: "此操作无法撤销。",
            confirmLabel: "删除项目"
        },
        deleteColumn: {
            title: "确认删除该列?",
            description: "此操作无法撤销。",
            confirmLabel: "删除列"
        },
        deleteTask: {
            title: "确认删除该任务?",
            description: "此操作无法撤销。",
            confirmLabel: "删除任务"
        }
    },
    feedback: {
        loadFailed: "加载失败,请重试。",
        saveFailed: "保存失败,请重试。",
        operationFailed: "操作失败",
        retryHint: "请检查网络连接后重试。",
        noManager: "暂无负责人",
        noDate: "暂无日期",
        renderFailed: "页面渲染失败。",
        renderFailedHint: "请重试,如问题持续请刷新页面。",
        reloadPage: "重新加载页面",
        networkError: "无法连接,请检查网络连接后重试。",
        optimisticReverted: "保存失败 — 您的更改已撤销。",
        projectDeleted: "项目已删除",
        taskDeleted: "任务已删除",
        likeFailed: "点赞更新失败,请重试。",
        taskSaved: "任务已保存",
        welcomeBack: "欢迎回来!"
    },
    greeting: "你好,{name}",
    empty: {
        projects: {
            title: "暂无项目",
            description: "创建您的第一个项目,开始追踪工作、负责人和进度。"
        },
        board: {
            title: "添加您的第一列",
            description:
                "看板将任务组织到不同的列中。可尝试:待办、进行中、已完成。"
        },
        members: {
            title: "暂无团队成员",
            description: "邀请同事一起协作此工作区。"
        },
        chat: {
            title: "向看板 Copilot 提问",
            description:
                "试试:「有什么风险?」或「谁的待办任务最多?」 — 答案来源于您的看板数据。"
        },
        filteredColumn: {
            title: "没有任务匹配当前筛选条件",
            cta: "重置筛选"
        },
        commandPalette: {
            loading: "加载中…",
            empty: "未找到匹配项。"
        },
        notFound: {
            title: "页面不存在",
            description: "找不到您要访问的页面,该页面可能已迁移或链接已过期。",
            cta: "返回项目列表"
        }
    },
    ai: {
        draftSuggestions: [
            "起草一项缺陷修复任务",
            "规划一项新功能",
            "创建一项研究探索"
        ],
        chatSuggestions: [
            "这个看板有哪些风险?",
            "谁的待办任务最多?",
            "总结一下这个看板"
        ],
        privacyTitle: "看板 Copilot 可以看到的信息",
        privacyDisclosure:
            "看板 Copilot 使用看板和项目名称、列、任务名称、类型、故事点、史诗、备注(如有),以及成员的用户名、邮箱或必要的用户 ID。",
        privacyDataScope: [
            "看板和项目名称,以及列标题",
            "任务名称、类型、故事点、史诗、备注(如有)以及所属列",
            "成员的用户名、邮箱以及必要的用户 ID"
        ],
        privacyExclusions: "附件不会包含在看板 Copilot 的请求中。",
        localProcessingDisclosure:
            "此版本使用本地确定性的看板 Copilot 规则,不会有外部 AI 服务处理这些请求。",
        remoteProcessingDisclosure:
            "请求由配置的 AI 服务处理。系统会转发您的登录令牌,以便代理服务对您的账户授权。",
        remoteProcessingDisclosureWithOrigin:
            "请求由位于 {origin} 的 AI 服务处理。系统会转发您的登录令牌,以便代理服务对您的账户授权。",
        processingModeLocalLabel: "本地引擎",
        processingModeRemoteLabel: "远程 AI 服务",
        engineCapabilityLocal:
            "此版本的看板 Copilot 在本地按确定性的项目规则运行 — 未配置外部语言模型。建议反映的是规则,而非语言模型。",
        engineCapabilityRemote:
            "看板 Copilot 已连接到配置的 AI 服务。输出可能包含生成的内容,使用前请审核。",
        privacyLink: "共享了哪些信息?",
        privacyAcknowledge: "我知道了",
        privacySuppress: "不再提醒",
        streaming: "正在阅读您的看板数据…",
        stopped: "已停止",
        retryLabel: "重试",
        regenerateLabel: "重新生成",
        undoLabel: "撤销",
        copiedConfirm: "已复制到剪贴板",
        feedbackThanks: "感谢您的反馈",
        feedbackImpactNotice:
            "反馈仅供产品团队复盘 — 不会改变本次回答,也不会用于训练模型。",
        feedbackThumbsDownTooltip:
            "回答没用?告诉我们原因。所选类别仅用于产品复盘,不会发送您的消息文本。",
        chatBusyError: "看板 Copilot 当前繁忙,请稍后再试。",
        feedbackPromptDownTitle: "哪里出了问题?",
        feedbackPromptDownHelper:
            "请至少选一项 — 这能帮助我们排查并优先修复,且不会发送您的消息文本。",
        feedbackCategories: {
            incorrect: "信息错误或编造",
            missingSource: "来源缺失或不准确",
            outdated: "使用了过期的看板数据",
            notActionable: "无法据此采取行动",
            unsafe: "建议存在风险",
            privacy: "隐私问题",
            other: "其他原因"
        },
        feedbackOptionalNote: "添加可选备注(不会发送您的消息文本)",
        feedbackSubmit: "发送反馈",
        feedbackSkip: "跳过",
        regeneratedBadge: "已重新生成的回答",
        regeneratedTooltip:
            "看板 Copilot 对同一问题生成了新的回答。先前的回答仍显示在上方供对比。",
        thinkingDefault: "正在阅读您的看板数据…",
        confidenceBands: {
            high: "高",
            moderate: "中",
            low: "低"
        },
        appliedSuggestion: "由 Copilot 建议",
        appliedSuggestionShort: "AI",
        suggestionPopover: "看板 Copilot 已为您填写。可编辑或恢复至原值。",
        revertToPrevious: "恢复至上一个值",
        showAlternatives: "查看其他选项",
        showRationale: "为什么?",
        applyAnyway: "仍然应用",
        emptyChatLead:
            "提问关于此看板、任务或您的项目。回答仅基于应用中的只读数据。",
        emptyBriefLead:
            "历史数据不足以分析趋势。随着看板的使用,简报会变得更智能。",
        emptyInbox: "目前没有提醒。看板 Copilot 每 15 分钟检查一次问题。",
        emptyHistory:
            "尚无 AI 操作记录。通过看板 Copilot 进行的更改会显示在此处。",
        rateLimit: "看板 Copilot 已达容量上限,请在 {seconds} 秒后重试。",
        projectDisabled: "此项目已关闭看板 Copilot。管理员可在设置中启用。",
        chatErrorRecovery:
            "未找到答案。请尝试换一种说法,或查看下方列出的来源。",
        chatNoSourcesCaveat:
            "本次回答未引用任何看板记录 — 采取行动前请先核实。",
        copilotLabel: "看板 Copilot",
        askCopilot: "询问看板 Copilot",
        findRelatedTasks: "查找相关任务",
        findRelatedProjects: "查找相关项目",
        findRelatedTasksAria: "用 AI 查找相关任务并筛选任务列表",
        findRelatedProjectsAria: "用 AI 查找相关项目并筛选项目列表",
        findRelatedTasksPlaceholder: "描述要查找的任务…",
        findRelatedProjectsPlaceholder: "描述要查找的项目…",
        findRelatedTasksHelper:
            "按任务名称、类型、史诗和备注匹配。仅筛选此列表 — 不会打开聊天。",
        findRelatedProjectsHelper:
            "按项目名称、组织和负责人匹配。仅筛选此列表 — 不会打开聊天。",
        searchMatchStrength: {
            strong: "强匹配",
            moderate: "部分匹配",
            weak: "弱匹配"
        },
        searchMatchStrengthAria: "AI 语义搜索的匹配强度:{strength}",
        searchSynonymExpanded:
            "已为「{original}」补充常见同义词({expansions})。",
        citationFlagAction: "举报来源不准确",
        citationFlagConfirm: "已收到 — 已标记待复盘",
        remoteConsentTitle: "提示:此版本会将数据发送到远程 AI",
        remoteConsentBody:
            "看板 Copilot 已连接到 {origin}。系统会将您的登录令牌、看板数据以及您打开的任何任务发送到该服务进行处理。输出可能包含生成的内容,使用前请审核。",
        remoteConsentBodyGeneric:
            "看板 Copilot 已连接到配置的 AI 服务。系统会将您的登录令牌、看板数据以及您打开的任何任务发送到该服务进行处理。输出可能包含生成的内容,使用前请审核。",
        remoteConsentAccept: "我已知悉",
        remoteConsentLearnMore: "共享了哪些信息?",
        newConversation: "新对话",
        stopResponse: "停止响应",
        characterCounterMax: 2000,
        characterCounterShowAfter: 500,
        breakdownAxes: {
            by_phase: {
                label: "按阶段",
                tooltip: "前端、后端、测试"
            },
            by_surface: {
                label: "按界面",
                tooltip: "界面、API、数据、基础设施"
            },
            by_risk: {
                label: "按风险",
                tooltip: "高风险优先,低风险靠后"
            },
            freeform: {
                label: "由 Copilot 决定",
                tooltip: "由智能助手挑选最合适的拆分方式"
            }
        },
        welcomeBannerTitle: "看板 Copilot 已就绪",
        welcomeBannerBody:
            "起草任务、估算工作量、总结看板、回答问题 — 全部基于您的看板数据。",
        welcomeBannerCta: "试试:总结这个看板",
        welcomeBannerDismiss: "关闭"
    }
};

export default zhCN;
