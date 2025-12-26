
export const deDE = {
  name: "Deutsch",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "System Aktiv v3.1",
    statusCardCore: "Kern",
    statusCardMemory: "Speicher",
    monitorTitle: "Bus-Monitor",
    waitingPulse: "Warten auf kognitiven Puls...",
    settingsTitle: "OSAI Zentrale",
    settingsSub: "Privatsphäre & Hardware",
    saveChanges: "Speichern",
    clearMemory: "Speicher löschen",
    clearLogs: "Logs löschen",
    hardwareCheck: "Berechtigungen prüfen",
    checking: "Prüfung...",
    ready: "Aktiv / Bereit",
    denied: "Abgelehnt",
    voiceSensors: "Stimm-Sensoren",
    deviceAccess: "Gerätezugriff",
    securityAccessibility: "Sicherheit & Bedienungshilfen",
    confirmTotalAccess: "Vollzugriff bestätigen",
    riskWarning: "Warnung: Hohes Risiko",
    riskDescription: "Durch die Aktivierung erlauben Sie dem Assistenten, in Ihrem Namen im gesamten System Tipp- und Eingabevorgänge zu simulieren.",
    latency: "Latenz 12ms",
    localCognition: "Lokale Kognition",
    overlayActive: "Neutrale Overlay Aktiv",
    online: "Synchronisierung reaktiviert.",
    offline: "Eingeschränkter lokaler Modus (Offline).",
    reqCognitive: "Kognitive Anfrage: ",
    policyRejection: "Richtlinien-Ablehnung: ",
    malformed: "Fehlerhafte Provider-Antwort.",
    busFail: "Bus-Fehler: ",
    doubleConfirmReq: "L2-Bestätigung: Erforderlich.",
    payload: "Nutzlast: ",
    success: "Erfolg: "
  },
  ai: {
    status: {
      IDLE: "Bereit",
      ANALYZING: "Analyse...",
      READY: "Bestätigen?",
      DOUBLE_CONFIRMATION: "Bestätigung Stufe 2",
      EXECUTING: "Ausführung...",
      ERROR: "Fehler",
      OFFLINE: "Offline"
    },
    responses: {
      wake: "Ja? Wie kann ich helfen?",
      confirm: "Soll ich fortfahren?",
      denied: "Abgebrochen.",
      muted: "Nur Text",
      listening: "Ich höre zu"
    }
  },
  permissions: {
    aiMic: { label: "KI-Mikrofon", desc: "Hören auf 'Wake Word'." },
    userMic: { label: "Benutzermikrofon", desc: "Manuelle Sprachtaste." },
    passive: { label: "Passives Hören", desc: "Hintergrundanalyse." },
    tts: { label: "Sprachantwort (TTS)", desc: "KI spricht Antworten." },
    camera: { label: "Kamerazugriff", desc: "Visuelle Analyse & QR." },
    location: { label: "Standort", desc: "Hilfe basierend auf Position." },
    screen: { label: "Bildschirmlesen", desc: "KI sieht den Bildschirm." },
    web: { label: "Web-Browsing", desc: "Echtzeit-Websuche." },
    accessibility: { label: "Bedienungshilfen", desc: "Interaktion mit Apps." }
  },
  boot: [
    "> OSAI KERNEL v3.1.0-STABIL",
    "> INITIALISIERUNG COGNITIVE_CORE...",
    "> LADEN NEURONALER NETZE: GEMINI-3-PRO",
    "> PRÜFEN SYSTEM_POLICY: SECURE_ENCLAVE",
    "> AUTHENTIFIZIERUNG HARDWARE_ABSTRACTION_LAYER",
    "> ETABLIEREN OVERLAY_Z_INDEX: 999",
    "> MIKROFON_ARRAY: ONLINE",
    "> SCREEN_READER_MODUL: AKTIV",
    "> ZUGRIFFSSTEUERUNGSLISTE: AKTUALISIERT",
    "> BEREIT."
  ]
};
