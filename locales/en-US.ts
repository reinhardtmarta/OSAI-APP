
export const enUS = {
  name: "English",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "System Active v3.1",
    statusCardCore: "Core",
    statusCardMemory: "Memory",
    monitorTitle: "Bus Monitor",
    waitingPulse: "Waiting for cognitive pulse...",
    settingsTitle: "OSAI Central",
    settingsSub: "Privacy & Hardware",
    saveChanges: "Save Changes",
    clearMemory: "Clear Memory",
    clearLogs: "Clear Logs",
    hardwareCheck: "Check Permissions",
    checking: "Checking...",
    ready: "Active / Ready",
    denied: "Denied",
    voiceSensors: "Voice Sensors",
    deviceAccess: "Device Access",
    securityAccessibility: "Security & Accessibility",
    confirmTotalAccess: "Confirm Full Access",
    riskWarning: "High Risk Protocol",
    riskDescription: "By enabling, you allow the assistant to simulate taps and typing on your behalf across the OS.",
    latency: "Latency 12ms",
    localCognition: "Local Cognition",
    overlayActive: "Neutral Overlay Active",
    online: "Sync reactivated.",
    offline: "Restricted Local Mode (Offline).",
    reqCognitive: "Cognitive request: ",
    policyRejection: "Policy Rejection: ",
    malformed: "Malformed provider response.",
    busFail: "Bus failure: ",
    doubleConfirmReq: "L2 Confirmation: Required.",
    payload: "Payload: ",
    success: "Success: ",
    riskProtocol: "Risk Protocol",
    systemLogs: "SYSTEM LOGS"
  },
  ai: {
    status: {
      IDLE: "Ready",
      ANALYZING: "Analyzing...",
      READY: "Confirm?",
      DOUBLE_CONFIRMATION: "L2 Confirmation",
      EXECUTING: "Acting...",
      ERROR: "Error",
      OFFLINE: "Offline"
    },
    responses: {
      wake: "Yes? How can I help?",
      confirm: "Proceed?",
      denied: "Cancelled.",
      muted: "Text Only",
      listening: "Listening"
    }
  },
  permissions: {
    aiMic: { label: "AI Microphone", desc: "Constant listening for Wake Word commands." },
    userMic: { label: "User Microphone", desc: "Enables manual voice button in chat." },
    passive: { label: "Passive Listening", desc: "Continuous background analysis." },
    tts: { label: "Voice Response (TTS)", desc: "AI speaks the answers to you." },
    camera: { label: "Camera Access", desc: "Allows visual and QR Code analysis." },
    location: { label: "Location", desc: "Help based on your current location." },
    screen: { label: "Screen Reading", desc: "AI sees what you're doing to help." },
    web: { label: "Web Browsing", desc: "Real-time internet searches." },
    accessibility: { label: "Accessibility Control", desc: "Allows AI to interact with other apps." }
  },
  boot: [
    "> OSAI KERNEL v3.1.0-STABLE",
    "> INITIALIZING COGNITIVE_CORE...",
    "> LOADING NEURAL_NETWORKS: GEMINI-3-PRO",
    "> CHECKING SYSTEM_POLICY: SECURE_ENCLAVE",
    "> AUTHENTICATING HARDWARE_ABSTRACTION_LAYER",
    "> ESTABLISHING OVERLAY_Z_INDEX: 999",
    "> MICROPHONE_ARRAY: ONLINE",
    "> SCREEN_READER_MODULE: ACTIVE",
    "> ACCESS_CONTROL_LIST: UPDATED",
    "> READY."
  ]
};
