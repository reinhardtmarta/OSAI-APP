
export const frFR = {
  name: "Français",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "Système Actif v3.1",
    statusCardCore: "Noyau",
    statusCardMemory: "Mémoire",
    monitorTitle: "Moniteur de Bus",
    waitingPulse: "Attente d'impulsion cognitive...",
    settingsTitle: "Central OSAI",
    settingsSub: "Confidentialité & Matériel",
    saveChanges: "Enregistrer",
    clearMemory: "Effacer la mémoire",
    clearLogs: "Effacer les logs",
    hardwareCheck: "Vérifier les permissions",
    checking: "Vérification...",
    ready: "Actif / Prêt",
    denied: "Refusé",
    voiceSensors: "Capteurs Vocaux",
    deviceAccess: "Accès à l'appareil",
    securityAccessibility: "Sécurité & Accessibilité",
    confirmTotalAccess: "Confirmer l'accès total",
    riskWarning: "Avis de Risque Élevé",
    riskDescription: "En activant, vous autorisez l'assistant à simuler des pressions et des saisies en votre nom dans tout le système.",
    latency: "Latence 12ms",
    localCognition: "Cognition Locale",
    overlayActive: "Couche Neutre Active",
    online: "Synchronisation réactivée.",
    offline: "Mode Local Restreint (Offline).",
    reqCognitive: "Requête cognitive: ",
    policyRejection: "Rejet de Politique: ",
    malformed: "Réponse du fournisseur malformée.",
    busFail: "Échec du bus: ",
    doubleConfirmReq: "Niveau de Confirmation 2: Requis.",
    payload: "Charge utile: ",
    success: "Succès: "
  },
  ai: {
    status: {
      IDLE: "Prêt",
      ANALYZING: "Analyse...",
      READY: "Confirmer ?",
      DOUBLE_CONFIRMATION: "Confirmation N2",
      EXECUTING: "Action...",
      ERROR: "Erreur",
      OFFLINE: "Hors ligne"
    },
    responses: {
      wake: "Oui ? Comment puis-je aider ?",
      confirm: "Dois-je continuer ?",
      denied: "Annulé.",
      muted: "Texte uniquement",
      listening: "J'écoute"
    }
  },
  permissions: {
    aiMic: { label: "Micro IA", desc: "Écoute constante pour 'Wake Word'." },
    userMic: { label: "Micro Utilisateur", desc: "Active le bouton vocal manuel." },
    passive: { label: "Écoute Passive", desc: "Analyse en arrière-plan." },
    tts: { label: "Réponse Vocale (TTS)", desc: "L'IA parle pour vous." },
    camera: { label: "Accès Caméra", desc: "Analyse visuelle et QR Codes." },
    location: { label: "Localisation", desc: "Aide basée sur votre position." },
    screen: { label: "Lecture d'Écran", desc: "L'IA voit votre écran pour aider." },
    web: { label: "Navigation Web", desc: "Recherches Web en temps réel." },
    accessibility: { label: "Contrôle d'Accessibilité", desc: "Interagir avec d'autres apps." }
  },
  boot: [
    "> NOYAU OSAI v3.1.0-STABLE",
    "> INITIALISATION CORE_COGNITIF...",
    "> CHARGEMENT RÉSEAUX_NEURONAUX: GEMINI-3-PRO",
    "> VÉRIFICATION POLITIQUE_SYSTÈME: ENCLAVE_SÉCURISÉE",
    "> AUTHENTIFICATION COUCHE_ABSTRACTION_MATÉRIEL",
    "> ÉTABLISSEMENT Z-INDEX_OVERLAY: 999",
    "> MATRICE_MICROPHONE: EN LIGNE",
    "> MODULE_LECTURE_ÉCRAN: ACTIF",
    "> LISTE_CONTRÔLE_ACCÈS: MISE À JOUR",
    "> PRÊT."
  ]
};
