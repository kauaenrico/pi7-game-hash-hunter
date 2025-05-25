import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/engine/GameEngine';
import { GameStatus } from './GameStatus';
import { GameOverlay } from './GameOverlay';
import { SecurityTipPopup } from './SecurityTipPopup';
import { PauseOverlay } from './PauseOverlay';
import './Game.css';

let gameEngine: GameEngine | null = null;

// Dicas de segurança (copiado de js/security_tips.js)
const securityTips = [
  "Use senhas longas e aleatórias para maior segurança.",
  "Nunca reutilize a mesma senha em várias contas.",
  "Ative sempre a autenticação em dois fatores (2FA).",
  "Use um gerenciador de senhas para gerar e armazenar credenciais.",
  "Evite usar informações pessoais em suas senhas.",
  "Altere suas senhas periodicamente, especialmente após vazamentos.",
  "Mantenha seu sistema operacional sempre atualizado.",
  "Atualize regularmente seus aplicativos e navegadores.",
  "Execute varreduras periódicas de malware no seu dispositivo.",
  "Mantenha seu antivírus atualizado e ativo.",
  "Faça backup regular dos seus dados importantes.",
  "Verifique sempre o certificado HTTPS de sites sensíveis.",
  "Desconfie de e-mails com urgência excessiva ou ofertas muito boas.",
  "Evite clicar em links encurtados de remetentes desconhecidos.",
  "Use uma VPN ao acessar redes Wi-Fi públicas.",
  "Verifique a URL dos sites antes de inserir dados sensíveis.",
  "Criptografe seus dados sensíveis quando possível.",
  "Não compartilhe informações pessoais em redes sociais.",
  "Use conexões seguras (HTTPS) para transações online.",
  "Mantenha backups em diferentes locais (nuvem e local).",
  "Revise regularmente as permissões dos seus aplicativos.",
  "Desconfie de mensagens pedindo informações pessoais.",
  "Verifique a autenticidade de sites antes de fazer downloads.",
  "Mantenha seus dispositivos físicos seguros e protegidos.",
  "Use bloqueio de tela em todos os seus dispositivos.",
  "Eduque sua família sobre práticas de segurança digital.",
  "Configure seu roteador com senha forte e criptografia WPA3.",
  "Desative recursos de rede não utilizados (Bluetooth, Wi-Fi).",
  "Use firewalls para proteger sua rede doméstica.",
  "Monitore regularmente as conexões ativas em sua rede.",
  "Evite usar redes Wi-Fi públicas para transações sensíveis.",
  "Revise regularmente as configurações de privacidade das suas contas.",
  "Use navegadores com proteção contra rastreamento.",
  "Limpe regularmente o cache e cookies do navegador.",
  "Considere usar buscadores que priorizam a privacidade.",
  "Seja seletivo ao compartilhar sua localização com apps.",
  "Ative a localização remota do seu dispositivo.",
  "Configure o apagamento remoto em caso de perda.",
  "Mantenha o GPS desativado quando não estiver em uso.",
  "Use PIN ou biometria para desbloquear seu dispositivo.",
  "Revise as permissões dos aplicativos instalados."
];
function getRandomTip() {
  return securityTips[Math.floor(Math.random() * securityTips.length)];
}

// Textos de feedback (copiado de js/texts.js)
const gameOverMessages = [
  "Virus0x te alcançou! A rede falhou.",
  "Segurança comprometida! Tente novamente.",
  "O invasor venceu desta vez. Reforce suas defesas!"
];
const levelCompleteMessages = [
  "Firewall erguido com sucesso!",
  "Sistema protegido.",
  "Hashes 100% validados."
];
const levelCompleteTips = [
  "DICA: Use senhas longas e aleatórias.",
  "DICA: Ative autenticação em dois fatores.",
  "DICA: Nunca reutilize a mesma senha em várias contas."
];
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState({
    level: 1,
    hashes: 0,
    totalHashes: 0,
    status: 'Pronto',
    time: '00:00'
  });
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [levelCompleteMessage, setLevelCompleteMessage] = useState('');
  const [securityTip, setSecurityTip] = useState('');
  const [showSecurityTip, setShowSecurityTip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState(600);
  const [showTipPopup, setShowTipPopup] = useState(false);
  const [tipPopupText, setTipPopupText] = useState('');
  const [gameReady, setGameReady] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    // Responsividade do canvas
    function handleResize() {
      const min = Math.min(window.innerWidth, window.innerHeight) - (isMobile ? 32 : 64);
      setCanvasSize(Math.max(240, Math.min(600, min)));
      setIsMobile(window.innerWidth < 700);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    // Bloquear scroll e zoom no mobile
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', e => e.preventDefault());
      document.removeEventListener('gesturestart', e => e.preventDefault());
      document.removeEventListener('dblclick', e => e.preventDefault());
    };
  }, []);

  useEffect(() => {
    if (!gameReady || !canvasRef.current) return;
    gameEngine = new GameEngine(canvasRef.current, {
      onGameStateChange: setGameState,
      onGameOver: (message) => {
        setGameOverMessage(getRandom(gameOverMessages));
        setShowGameOver(true);
      },
      onLevelComplete: (message, tip) => {
        setLevelCompleteMessage(getRandom(levelCompleteMessages));
        setSecurityTip(getRandom(levelCompleteTips));
        setShowLevelComplete(true);
      },
      onSecurityTip: (tip) => {
        setSecurityTip(tip);
        setShowSecurityTip(true);
      },
      onHashCollected: showHashTip
    });
    gameEngine.setOnNextLevel(() => {
      setShowLevelComplete(true);
    });
    return () => {
      gameEngine?.cleanup();
    };
  }, [gameReady, canvasSize]);

  const handleStartGame = () => {
    setShowStartScreen(false);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setGameReady(true);
  };

  const handleRetry = () => {
    setShowGameOver(false);
    setShowLevelComplete(false);
    setGameReady(false);
    setTimeout(() => setGameReady(true), 50);
  };

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    gameEngine?.nextLevel();
  };

  function showHashTip() {
    setTipPopupText(getRandomTip());
    setShowTipPopup(true);
    gameEngine?.pause();
  }
  function handleContinueTip() {
    setShowTipPopup(false);
    setTimeout(() => gameEngine?.resume(), 100);
  }

  // Setas virtuais estilo anterior
  const VirtualArrows: React.FC<{ onMove: (dir: string) => void }> = ({ onMove }) => (
    <div className="virtual-arrows-row">
      <div className="virtual-arrows-old">
        <button className="arrow-old up" onPointerDown={() => onMove('arrowup')}>▲</button>
        <div>
          <button className="arrow-old left" onPointerDown={() => onMove('arrowleft')}>◀</button>
          <button className="arrow-old down" onPointerDown={() => onMove('arrowdown')}>▼</button>
          <button className="arrow-old right" onPointerDown={() => onMove('arrowright')}>▶</button>
        </div>
      </div>
    </div>
  );

  // Página inicial customizada
  if (showStartScreen) {
    return (
      <div className="game-container font-tech">
        <div className="start-menu">
          <h1 className="start-title">Hash Hunter</h1>
          <p className="start-desc">Proteja a rede, colete os hashes e fuja do vírus!</p>
          <button className="start-btn" onClick={handleStartGame}>INICIAR MISSÃO</button>
          <button className="credits-btn" onClick={() => setShowCredits(true)}>CRÉDITOS</button>
        </div>
        {showCredits && (
          <div className="credits-popup">
            <div className="credits-content">
              <h2>Créditos</h2>
              <p>Jogo desenvolvido para fins educacionais.<br />Inspirado em temas de segurança da informação.<br />Desenvolvedor: Seu Nome Aqui</p>
              <button className="continue-button" onClick={() => setShowCredits(false)}>VOLTAR</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-container font-tech">
      <h1 id="gameTitle">Hash Hunter</h1>
      <div className={`canvas-container center-mobile${isMobile ? ' mobile-stack' : ''}`}>
        <canvas ref={canvasRef} width={canvasSize} height={canvasSize} style={{ width: canvasSize, height: canvasSize, display: gameReady ? 'block' : 'none' }} />
        <GameOverlay
          showStartScreen={false}
          showGameOver={showGameOver}
          showLevelComplete={showLevelComplete}
          gameOverMessage={gameOverMessage}
          levelCompleteMessage={levelCompleteMessage}
          onStart={handleStartGame}
          onRetry={handleRetry}
          onNextLevel={handleNextLevel}
        />
        {showTipPopup && (
          <div className="security-tip-popup show">
            <span className="tip-icon">🛡️</span>
            <span className="tip-content">{tipPopupText}</span>
            <button className="continue-button" onClick={handleContinueTip}>CONTINUAR</button>
          </div>
        )}
      </div>
      {isMobile && gameReady && (
        <VirtualArrows onMove={dir => gameEngine?.movePlayerExternally(dir)} />
      )}
      <GameStatus {...gameState} />
      <PauseOverlay />
      <SecurityTipPopup
        show={showSecurityTip}
        tip={securityTip}
        onClose={() => setShowSecurityTip(false)}
      />
    </div>
  );
}; 