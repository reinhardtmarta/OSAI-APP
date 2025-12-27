
export const jaJP = {
  name: "日本語",
  ui: {
    coreTitle: "OSAI コア",
    systemActive: "システム稼働中 v3.1",
    statusCardCore: "コア",
    statusCardMemory: "メモリ",
    monitorTitle: "バスモニター",
    waitingPulse: "認知パルスを待機中...",
    settingsTitle: "OSAI コントロール",
    settingsSub: "プライバシーとハードウェア",
    saveChanges: "保存",
    clearMemory: "メモリ消去",
    clearLogs: "ログ消去",
    hardwareCheck: "権限確認",
    checking: "確認中...",
    ready: "稼働中 / 完了",
    denied: "拒否されました",
    voiceSensors: "音声センサー",
    deviceAccess: "デバイスアクセス",
    securityAccessibility: "セキュリティとアクセシビリティ",
    confirmTotalAccess: "フルアクセスを確認",
    riskWarning: "高リスクプロトコルの警告",
    riskDescription: "有効にすると、アシスタントが OS 全体でユーザーに代わってタップや入力をシミュレートすることを許可します。",
    latency: "遅延 12ms",
    localCognition: "ローカル認知",
    overlayActive: "ニュートラル層アクティブ",
    online: "同期が再開されました。",
    offline: "制限付きローカルモード (オフライン)。",
    reqCognitive: "認知リクエスト: ",
    policyRejection: "ポリシー拒否: ",
    malformed: "プロバイダーの応答形式が正しくありません。",
    busFail: "バス障害: ",
    doubleConfirmReq: "L2 二次確認: 必須。",
    payload: "ペイロード: ",
    success: "成功: ",
    riskProtocol: "リスクプロトコル",
    systemLogs: "システムログ"
  },
  ai: {
    status: {
      IDLE: "準備完了",
      ANALYZING: "分析中...",
      READY: "確認しますか？",
      DOUBLE_CONFIRMATION: "L2 二次確認",
      EXECUTING: "実行中...",
      ERROR: "エラー",
      OFFLINE: "オフライン"
    },
    responses: {
      wake: "はい、何かお手伝いしましょうか？",
      confirm: "続行しますか？",
      denied: "キャンセルされました。",
      muted: "テキストのみ",
      listening: "聞いています"
    }
  },
  permissions: {
    aiMic: { label: "AI マイク", desc: "ウェイクワード常時待機。" },
    userMic: { label: "ユーザーマイク", desc: "手動音声ボタン有効。" },
    passive: { label: "パッシブリスニング", desc: "継続的なバックグラウンド分析。" },
    tts: { label: "音声応答 (TTS)", desc: "AI が回答を読み上げます。" },
    camera: { label: "カメラアクセス", desc: "視覚分析と QR コード。" },
    location: { label: "位置情報", desc: "現在地に基づいたサポート。" },
    screen: { label: "画面読み取り", desc: "AI が画面を確認します。" },
    web: { label: "ウェブ閲覧", desc: "リアルタイム検索。" },
    accessibility: { label: "アクセシビリティ", desc: "アプリとの連携。" }
  },
  boot: [
    "> OSAI カーネル v3.1.0-STABLE",
    "> 認知コアを初期化中...",
    "> ニューラルネットワークをロード中: GEMINI-3-PRO",
    "> システムポリシーを確認中: 安全なエンクレーブ",
    "> ハードウェア抽象化レイヤーを認証中",
    "> オーバーレイ Z-INDEX を設定中: 999",
    "> マイクアレイ: オンライン",
    "> スクリーンリーダーモジュール: アクティブ",
    "> アクセス制御リスト: 更新済み",
    "> 準備完了。"
  ]
};
