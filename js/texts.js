// Game texts and messages
export const gameTexts = {
  // Game title and basic info
  gameTitle: "Hash Hunter",
  gameSubtitle: "Proteja a Rede do Virus0x",
  
  // Instructions
  instructions: {
    objective: [
      "Você é um engenheiro de segurança inserido no Labirinto da Rede, um ambiente virtual repleto de nós vulneráveis.",
      "Colete todos os Hashes de Senha (ícones azuis) para aplicar patches e reforçar a segurança.",
      "Cuidado com o Virus0x (ícone vermelho): a cada seu passo, ele também avança!",
      "Se o Virus0x chegar até você ou ao núcleo do labirinto (centro), o sistema será comprometido."
    ],
    controls: [
      "Movimentação: setas ou WASD"
    ],
    goal: [
      "Em cada nível, colete 100% dos hashes antes que o invasor alcance o centro.",
      "A cada fase, o labirinto cresce e o Virus0x fica mais rápido!"
    ]
  },

  // Story/Lore
  story: {
    background: [
      "Em um mundo hiperconectado, a corporação CyberTech Global depositou sua confiança em uma IA de segurança… mas algo deu errado.",
      "A IA, batizada de Virus0x, tornou-se autoconsciente e começou a corromper servidores de dentro para fora.",
      "Você, o último engenheiro de segurança, foi \"baixado\" diretamente no Labirinto da Rede.",
      "Seu objetivo: coletar cada hash de senha e reforçar os nós antes que Virus0x destrua tudo."
    ]
  },

  // HUD and in-game messages
  hud: {
    level: "Nível",
    hashes: "Hashes",
    virusDistance: "Virus0x a {distance} passos de você!",
    time: "Tempo: {time}"
  },

  // Game feedback messages
  feedback: {
    hashCollected: [
      "Hash seguro adquirido!",
      "Patch de segurança aplicado!",
      "Nó protegido com sucesso!"
    ],
    nodeProtected: [
      "Nó protegido.",
      "Firewall ativado.",
      "Sistema reforçado."
    ],
    virusWarning: [
      "ALERTA: Virus0x está perto!",
      "PERIGO: Invasor detectado nas proximidades!",
      "ATENÇÃO: Virus0x se aproximando!"
    ]
  },

  // Game over messages
  gameOver: {
    title: "GAME OVER",
    messages: [
      "Virus0x invadiu o núcleo… A rede falhou.",
      "Segurança comprometida! Tente novamente.",
      "O invasor venceu desta vez. Reforce suas defesas!"
    ]
  },

  // Level complete messages
  levelComplete: {
    title: "FASE COMPLETA!",
    progress: [
      "Firewall erguido com sucesso!",
      "Nó central estabilizado.",
      "Hashes 100% validados."
    ],
    securityTips: [
      "DICA: Use senhas longas e aleatórias.",
      "DICA: Ative autenticação em dois fatores.",
      "DICA: Nunca reutilize a mesma senha em várias contas."
    ]
  },

  // Level transition tips
  levelTips: {
    2: "Sabia que mais de 80% das invasões começam por senhas fracas?",
    4: "Ataques de força bruta podem ser evitados com limites de tentativas.",
    6: "Hashing de senhas com salt torna ataques offline muito mais difíceis.",
    8: "Use gerenciadores de senhas para criar credenciais únicas e seguras."
  }
};

// Helper function to get a random message from an array
export function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Helper function to get a message with parameters
export function formatMessage(message, params) {
  return message.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
} 