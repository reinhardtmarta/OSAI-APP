
export const frFR = {
  name: "Français",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "Système Actif v3.2",
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
    success: "Succès: ",
    riskProtocol: "Protocole de Risque",
    systemLogs: "LOGS DU SYSTÈME",
    executingFunction: "Exécution de la Fonction Active",
    sources: "Sources de Recherche:",
    suggestions: "Suggestions Proactives"
  },
  ai: {
    status: {
      IDLE: "Prêt",
      ANALYZING: "Analyse...",
      READY: "Confirmer ?",
      DOUBLE_CONFIRMATION: "Confirmation N2",
      EXECUTING: "Action...",
      ERROR: "Erreur",
      OFFLINE: "Hors ligne",
      CALLING: "Appel de l'Outil"
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
    accessibility: { label: "Controle d'Accessibilité", desc: "Interagir avec d'autres apps." }
  },
  suggestions: {
    news: { label: "Résumer les Infos", prompt: "Quelles sont les nouvelles les plus importantes aujourd'hui ?" },
    social: { label: "Réseaux Sociaux", prompt: "Résume ce qui se passe sur mes réseaux sociaux." },
    youtube: { label: "Recherche YouTube", prompt: "Cherche des vidéos sur l'IA sur YouTube." },
    write: { label: "Écrire un Email", prompt: "Aide-moi à rédiger un e-mail professionnel." }
  },
  boot: [
    "> NOYAU OSAI v3.2.0-STABLE",
    "> INITIALISATION CORE_COGNITIF...",
    "> CONNAISSANCE_SYSTÈME: CHARGÉ",
    "> CHARGEMENT OUTILS_ACTIFS",
    "> PRÊT."
  ]
};
