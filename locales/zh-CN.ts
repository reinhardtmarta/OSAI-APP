
export const zhCN = {
  name: "简体中文",
  ui: {
    coreTitle: "OSAI 核心",
    systemActive: "系统激活 v3.2",
    statusCardCore: "核心",
    statusCardMemory: "内存",
    monitorTitle: "总线监控",
    waitingPulse: "等待认知脉冲...",
    settingsTitle: "OSAI 控制中心",
    settingsSub: "隐私与硬件",
    saveChanges: "保存更改",
    clearMemory: "清除内存",
    clearLogs: "清除日志",
    hardwareCheck: "检查权限",
    checking: "正在检查...",
    ready: "激活 / 就绪",
    denied: "已拒绝",
    voiceSensors: "语音传感器",
    deviceAccess: "设备访问",
    securityAccessibility: "安全与辅助功能",
    confirmTotalAccess: "确认完全访问权限",
    riskWarning: "高风险协议提示",
    riskDescription: "启用后，你将允许助手代表你在整个操作系统中模拟点击和输入操作。",
    latency: "延迟 12ms",
    localCognition: "本地认知",
    overlayActive: "中性层激活",
    online: "同步已重新激活。",
    offline: "受限本地模式 (离线)。",
    reqCognitive: "认知请求: ",
    policyRejection: "策略拒绝: ",
    malformed: "提供商响应格式错误。",
    busFail: "总线故障: ",
    doubleConfirmReq: "L2 二次确认: 必需。",
    payload: "有效载荷: ",
    success: "成功: ",
    riskProtocol: "风险协议",
    systemLogs: "系统日志",
    executingFunction: "正在执行主动功能",
    sources: "搜索来源:",
    suggestions: "主动建议"
  },
  ai: {
    status: {
      IDLE: "就绪",
      ANALYZING: "正在分析...",
      READY: "确认？",
      DOUBLE_CONFIRMATION: "L2 二次确认",
      EXECUTING: "正在执行...",
      ERROR: "错误",
      OFFLINE: "离线",
      CALLING: "调用工具"
    },
    responses: {
      wake: "您好？有什么我可以帮您的？",
      confirm: "我该继续吗？",
      denied: "已取消。",
      muted: "仅限文本",
      listening: "正在倾听"
    }
  },
  permissions: {
    aiMic: { label: "AI 麦克风", desc: "持续监听唤醒词命令。" },
    userMic: { label: "用户麦克风", desc: "启用手动语音按钮。" },
    passive: { label: "被动监听", desc: "持续后台分析。" },
    tts: { label: "语音回复 (TTS)", desc: "AI 会为您朗读。" },
    camera: { label: "相机访问", desc: "允许视觉和二维码分析。" },
    location: { label: "位置信息", desc: "根据当前位置提供帮助。" },
    screen: { label: "屏幕阅读", desc: "AI 查看您的屏幕。" },
    web: { label: "网页浏览", desc: "实时互联网搜索。" },
    accessibility: { label: "辅助功能控制", desc: "允许 AI 与应用互动。" }
  },
  suggestions: {
    news: { label: "总结新闻", prompt: "今天最重要的新闻是什么？" },
    social: { label: "社交媒体", prompt: "总结我的社交媒体动态。" },
    youtube: { label: "YouTube 搜索", prompt: "在 YouTube 上搜索 AI 视频。" },
    write: { label: "写电子邮件", prompt: "帮我写一封专业的电子邮件。" }
  },
  boot: [
    "> OSAI 内核 v3.2.0-稳定版",
    "> 正在初始化...",
    "> 系统知识已加载",
    "> 主动工具已加载",
    "> 就绪。"
  ]
};
