
export const itIT = {
  name: "Italiano",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "Sistema Attivo v3.1",
    statusCardCore: "Nucleo",
    statusCardMemory: "Memoria",
    monitorTitle: "Monitor Bus",
    waitingPulse: "In attesa di impulso cognitivo...",
    settingsTitle: "Centro OSAI",
    settingsSub: "Privacy e Hardware",
    saveChanges: "Salva",
    clearMemory: "Cancella memória",
    clearLogs: "Cancella log",
    hardwareCheck: "Verifica permessi",
    checking: "Verifica...",
    ready: "Attivo / Pronto",
    denied: "Negato",
    voiceSensors: "Sensori Vocali",
    deviceAccess: "Accesso al Dispositivo",
    securityAccessibility: "Sicurezza e Accessibilità",
    confirmTotalAccess: "Conferma Accesso Totale",
    riskWarning: "Avviso di Alto Rischio",
    riskDescription: "Attivando, consenti all'assistente di simulare tocchi e digitazione a tuo nome in tutto il sistema.",
    latency: "Latenza 12ms",
    localCognition: "Cognizione Locale",
    overlayActive: "Overlay Neutro Attivo",
    online: "Sincronizzazione riattivata.",
    offline: "Modalità Locale Ristretta (Offline).",
    reqCognitive: "Richiesta cognitiva: ",
    policyRejection: "Rifiuto della Politica: ",
    malformed: "Risposta del provider malformata.",
    busFail: "Errore del bus: ",
    doubleConfirmReq: "Livello di Conferma 2: Richiesto.",
    payload: "Carico utile: ",
    success: "Successo: ",
    riskProtocol: "Protocollo di Rischio",
    systemLogs: "LOG DI SISTEMA"
  },
  ai: {
    status: {
      IDLE: "Pronto",
      ANALYZING: "Analisi...",
      READY: "Confermare?",
      DOUBLE_CONFIRMATION: "Conferma N2",
      EXECUTING: "Azione...",
      ERROR: "Errore",
      OFFLINE: "Offline"
    },
    responses: {
      wake: "Sì? Come posso aiutare?",
      confirm: "Devo procedere?",
      denied: "Annullato.",
      muted: "Solo Testo",
      listening: "Ascolto"
    }
  },
  permissions: {
    aiMic: { label: "Microfono IA", desc: "Ascolto costante 'Wake Word'." },
    userMic: { label: "Microfono Utente", desc: "Pulsante vocale manuale." },
    passive: { label: "Ascolto Passivo", desc: "Analisi in background." },
    tts: { label: "Risposta Vocale (TTS)", desc: "L'IA parla per te." },
    camera: { label: "Accesso Fotocamera", desc: "Analisi visiva e QR." },
    location: { label: "Posizione", desc: "Aiuto basato sulla posizione." },
    screen: { label: "Lettura Schermo", desc: "L'IA vede lo schermo." },
    web: { label: "Navigazione Web", desc: "Ricerche Web in tempo reale." },
    accessibility: { label: "Controllo Accesso", desc: "Interazione con le app." }
  },
  boot: [
    "> KERNEL OSAI v3.1.0-STABILE",
    "> INIZIALIZZAZIONE CORE_COGNITIVO...",
    "> CARICAMENTO RETI_NEURALI: GEMINI-3-PRO",
    "> CONTROLLO POLITICA_SISTEMA: ENCLAVE_SICURO",
    "> AUTENTICAZIONE LIVELLO_ASTRAZIONE_HARDWARE",
    "> STABILIMENTO Z-INDEX_OVERLAY: 999",
    "> MATRICE_MICROFONO: ONLINE",
    "> MODULO_LETTURA_SCHERMO: ATTIVO",
    "> ELENCO_CONTROLLO_ACCESSO: AGGIORNATO",
    "> PRONTO."
  ]
};
