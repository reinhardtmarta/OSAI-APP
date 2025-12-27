
export const esES = {
  name: "Español",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "Sistema Activo v3.1",
    statusCardCore: "Núcleo",
    statusCardMemory: "Memoria",
    monitorTitle: "Monitor de Bus",
    waitingPulse: "Esperando pulso cognitivo...",
    settingsTitle: "Central OSAI",
    settingsSub: "Privacidad y Hardware",
    saveChanges: "Guardar Cambios",
    clearMemory: "Limpiar Memoria",
    clearLogs: "Limpiar Logs",
    hardwareCheck: "Verificar Permisos",
    checking: "Verificando...",
    ready: "Activo / Listo",
    denied: "Denegado",
    voiceSensors: "Sensores de Voz",
    deviceAccess: "Acceso al Dispositivo",
    securityAccessibility: "Seguridad y Accesibilidad",
    confirmTotalAccess: "Confirmar Accesso Total",
    riskWarning: "Aviso de Riesgo Elevado",
    riskDescription: "Al activar, permites que el asistente simule toques y escritura en tu nombre en todo el sistema.",
    latency: "Latencia 12ms",
    localCognition: "Cognición Local",
    overlayActive: "Capa Neutra Ativa",
    online: "Sincronización reactivada.",
    offline: "Modo Local Restringido (Offline).",
    reqCognitive: "Petición cognitiva: ",
    policyRejection: "Rechazo de Política: ",
    malformed: "Respuesta malformada del proveedor.",
    busFail: "Fallo de bus: ",
    doubleConfirmReq: "Nivel de Confirmación 2: Requerido.",
    payload: "Carga Útil: ",
    success: "Éxito: ",
    riskProtocol: "Protocolo de Riesgo",
    systemLogs: "LOGS DEL SISTEMA"
  },
  ai: {
    status: {
      IDLE: "Listo",
      ANALYZING: "Analizando...",
      READY: "¿Confirmar?",
      DOUBLE_CONFIRMATION: "Confirmación N2",
      EXECUTING: "Actuando...",
      ERROR: "Error",
      OFFLINE: "Desconectado"
    },
    responses: {
      wake: "¿Sí? ¿Cómo puedo ayudar?",
      confirm: "¿Debo continuar?",
      denied: "Cancelado.",
      muted: "Solo Texto",
      listening: "Escuchando"
    }
  },
  permissions: {
    aiMic: { label: "Micrófono de IA", desc: "Escucha constante para comandos 'Wake Word'." },
    userMic: { label: "Micrófono de Usuario", desc: "Activa el botón de voz manual." },
    passive: { label: "Escucha Passiva", desc: "Análisis continuo en segundo plano." },
    tts: { label: "Respuesta por Voz (TTS)", desc: "La IA habla las respuestas por ti." },
    camera: { label: "Acceso a Cámara", desc: "Permite análisis visual y de códigos QR." },
    location: { label: "Ubicación", desc: "Ayuda basada en tu ubicación actual." },
    screen: { label: "Lectura de Pantalla", desc: "La IA ve lo que haces para ayudar." },
    web: { label: "Navegação Web", desc: "Búsquedas en tiempo real en internet." },
    accessibility: { label: "Control de Accesibilidad", desc: "Autoriza a la IA a interactuar con otras apps." }
  },
  boot: [
    "> NÚCLEO OSAI v3.1.0-ESTABLE",
    "> INICIALIZANDO CORE_COGNITIVO...",
    "> CARGANDO REDES_NEURONALES: GEMINI-3-PRO",
    "> COMPROBANDO POLÍTICA_SISTEMA: ENCLAVE_SEGURO",
    "> AUTENTICANDO CAPA_ABSTRACCIÓN_HARDWARE",
    "> ESTABLECIENDO Z-INDEX_OVERLAY: 999",
    "> MATRIZ_MICRÓFONO: ONLINE",
    "> MÓDULO_LECTURA_PANTALLA: ACTIVO",
    "> LISTA_CONTROL_ACCESO: ACTUALIZADA",
    "> LISTO."
  ]
};
