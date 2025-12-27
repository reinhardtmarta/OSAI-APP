
export const ptBR = {
  name: "Português",
  ui: {
    coreTitle: "OSAI CORE",
    systemActive: "Sistema Ativo v3.2",
    statusCardCore: "Núcleo",
    statusCardMemory: "Memória",
    monitorTitle: "Monitor de Barramento",
    waitingPulse: "Aguardando pulso cognitivo...",
    settingsTitle: "Central OSAI",
    settingsSub: "Privacidade e Hardware",
    saveChanges: "Salvar Alterações",
    clearMemory: "Limpar Memória",
    clearLogs: "Limpar Logs",
    hardwareCheck: "Verificar Permissões",
    checking: "Verificando...",
    ready: "Ativo / Pronto",
    denied: "Negado",
    voiceSensors: "Sensores de Voz",
    deviceAccess: "Acesso ao Dispositivo",
    securityAccessibility: "Segurança e Acessibilidade",
    confirmTotalAccess: "Confirmar Acesso Total",
    riskWarning: "Aviso de Risco Elevado",
    riskDescription: "Ao ativar, você permite que o assistente simule toques e digitação em seu nome em todo o sistema operacional.",
    latency: "Latência 12ms",
    localCognition: "Cognição Local",
    overlayActive: "Camada Neutra Ativa",
    online: "Sincronização reativada.",
    offline: "Modo Local Restrito (Offline).",
    reqCognitive: "Requisição cognitiva: ",
    policyRejection: "Política Rejeitada: ",
    malformed: "Resposta malformada do provedor.",
    busFail: "Falha de barramento: ",
    doubleConfirmReq: "Nível de Confirmação 2: Requerido.",
    payload: "Carga Útil: ",
    success: "Sucesso: ",
    riskProtocol: "Protocolo de Risco",
    systemLogs: "LOGS DO SISTEMA",
    executingFunction: "Executando Função Ativa",
    sources: "Fontes de Pesquisa:",
    suggestions: "Sugestões Proativas"
  },
  ai: {
    status: {
      IDLE: "Pronto",
      ANALYZING: "Analisando...",
      READY: "Confirmar?",
      DOUBLE_CONFIRMATION: "Confirmação N2",
      EXECUTING: "Agindo...",
      ERROR: "Erro",
      OFFLINE: "Offline",
      CALLING: "Chamando Ferramenta"
    },
    responses: {
      wake: "Sim? Como posso ajudar?",
      confirm: "Devo prosseguir?",
      denied: "Cancelado.",
      muted: "Somente Texto",
      listening: "Estou ouvindo"
    }
  },
  permissions: {
    aiMic: { label: "Microfone da IA", desc: "Escuta constante para comandos 'Wake Word'." },
    userMic: { label: "Microfone do Usuário", desc: "Ativa o botão de voz manual no chat." },
    passive: { label: "Escuta Passiva", desc: "Análise contínua em segundo plano." },
    tts: { label: "Resposta por Voz (TTS)", desc: "IA fala as respostas para você." },
    camera: { label: "Acesso à Câmera", desc: "Permite análise visual e de QR Codes." },
    location: { label: "Localização", desc: "Ajuda baseada no seu local atual." },
    screen: { label: "Leitura de Tela", desc: "A IA vê o que você está fazendo para ajudar." },
    web: { label: "Navegação Web", desc: "Pesquisas em tempo real na internet." },
    accessibility: { label: "Controle de Acessibilidade", desc: "Autoriza a IA a interagir com outros apps." }
  },
  suggestions: {
    news: { label: "Resumir Notícias", prompt: "Quais as notícias mais importantes de hoje?" },
    social: { label: "Redes Sociais", prompt: "Resuma o que está acontecendo nas minhas redes sociais." },
    youtube: { label: "Busca YouTube", prompt: "Procure vídeos sobre IA no YouTube." },
    write: { label: "Escrever E-mail", prompt: "Me ajude a escrever um e-mail profissional." }
  },
  boot: [
    "> NÚCLEO OSAI v3.2.0-ESTÁVEL",
    "> INICIALIZANDO CORE_COGNITIVO...",
    "> CONHECIMENTO_SISTEMA: CARREGADO",
    "> CARREGANDO FERRAMENTAS_ATIVAS: 4 MÓDULOS",
    "> CARREGANDO REDES_NEURAIS: GEMINI-3-PRO",
    "> CHECANDO POLÍTICA_SISTEMA: ENCLAVE_SEGURO",
    "> AUTENTICANDO CAMADA_ABSTRAÇÃO_HARDWARE",
    "> ESTABELECENDO Z-INDEX_OVERLAY: 999",
    "> MATRIZ_MICROFONE: ONLINE",
    "> MÓDULO_LEITURA_TELA: ATIVO",
    "> PRONTO."
  ]
};
