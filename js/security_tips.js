// Array de dicas de segurança
export const securityTips = [
  // Senhas e Autenticação
  "Use senhas longas e aleatórias para maior segurança.",
  "Nunca reutilize a mesma senha em várias contas.",
  "Ative sempre a autenticação em dois fatores (2FA).",
  "Use um gerenciador de senhas para gerar e armazenar credenciais.",
  "Evite usar informações pessoais em suas senhas.",
  "Altere suas senhas periodicamente, especialmente após vazamentos.",
  
  // Atualizações e Manutenção
  "Mantenha seu sistema operacional sempre atualizado.",
  "Atualize regularmente seus aplicativos e navegadores.",
  "Execute varreduras periódicas de malware no seu dispositivo.",
  "Mantenha seu antivírus atualizado e ativo.",
  "Faça backup regular dos seus dados importantes.",
  
  // Navegação Segura
  "Verifique sempre o certificado HTTPS de sites sensíveis.",
  "Desconfie de e-mails com urgência excessiva ou ofertas muito boas.",
  "Evite clicar em links encurtados de remetentes desconhecidos.",
  "Use uma VPN ao acessar redes Wi-Fi públicas.",
  "Verifique a URL dos sites antes de inserir dados sensíveis.",
  
  // Proteção de Dados
  "Criptografe seus dados sensíveis quando possível.",
  "Não compartilhe informações pessoais em redes sociais.",
  "Use conexões seguras (HTTPS) para transações online.",
  "Mantenha backups em diferentes locais (nuvem e local).",
  "Revise regularmente as permissões dos seus aplicativos.",
  
  // Conscientização
  "Desconfie de mensagens pedindo informações pessoais.",
  "Verifique a autenticidade de sites antes de fazer downloads.",
  "Mantenha seus dispositivos físicos seguros e protegidos.",
  "Use bloqueio de tela em todos os seus dispositivos.",
  "Eduque sua família sobre práticas de segurança digital.",
  
  // Redes e Conexões
  "Configure seu roteador com senha forte e criptografia WPA3.",
  "Desative recursos de rede não utilizados (Bluetooth, Wi-Fi).",
  "Use firewalls para proteger sua rede doméstica.",
  "Monitore regularmente as conexões ativas em sua rede.",
  "Evite usar redes Wi-Fi públicas para transações sensíveis.",
  
  // Privacidade
  "Revise regularmente as configurações de privacidade das suas contas.",
  "Use navegadores com proteção contra rastreamento.",
  "Limpe regularmente o cache e cookies do navegador.",
  "Considere usar buscadores que priorizam a privacidade.",
  "Seja seletivo ao compartilhar sua localização com apps.",
  
  // Dispositivos Móveis
  "Ative a localização remota do seu dispositivo.",
  "Configure o apagamento remoto em caso de perda.",
  "Mantenha o GPS desativado quando não estiver em uso.",
  "Use PIN ou biometria para desbloquear seu dispositivo.",
  "Revise as permissões dos aplicativos instalados."
];

// Função para obter uma dica aleatória
export function getRandomTip() {
  return securityTips[Math.floor(Math.random() * securityTips.length)];
}

// Função para obter uma dica que ainda não foi mostrada
let shownTips = new Set();

export function getNewTip() {
  // Se todas as dicas já foram mostradas, limpa o histórico
  if (shownTips.size >= securityTips.length) {
    shownTips.clear();
  }
  
  // Encontra uma dica que ainda não foi mostrada
  let tip;
  do {
    tip = getRandomTip();
  } while (shownTips.has(tip));
  
  // Adiciona a dica ao conjunto de dicas mostradas
  shownTips.add(tip);
  
  return tip;
} 