import React from 'react';

interface GameOverlayProps {
  showStartScreen: boolean;
  showGameOver: boolean;
  showLevelComplete: boolean;
  gameOverMessage: string;
  levelCompleteMessage: string;
  onStart: () => void;
  onRetry: () => void;
  onNextLevel: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  showStartScreen,
  showGameOver,
  showLevelComplete,
  gameOverMessage,
  levelCompleteMessage,
  onStart,
  onRetry,
  onNextLevel
}) => {
  return (
    <div id="gameOverlay">
      {showStartScreen && (
        <div id="startScreen" className="overlay-screen">
          <h2>Hash dasds</h2>
          <div id="storyText" className="story-text">
            Bem-vindo ao Hash Hunter! Sua missão é coletar todos os hashes enquanto evita o vírus.
          </div>
          <div id="instructionsText" className="instructions">
            Use as setas do teclado ou o joystick para se mover.
            Colete todos os hashes para completar cada nível.
            Evite o vírus ou será game over!
          </div>
          <button id="startButton" onClick={onStart}>
            INICIAR MISSÃO
          </button>
        </div>
      )}

      {showGameOver && (
        <div id="gameOverScreen" className="overlay-screen">
          <h2 id="gameOverTitle">GAME OVER</h2>
          <p id="gameOverMessage">{gameOverMessage}</p>
          <button className="retry-btn" id="retryButton" onClick={onRetry}>
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {showLevelComplete && (
        <div id="levelCompleteScreen" className="overlay-screen">
          <h2 id="levelCompleteTitle">FASE COMPLETA!</h2>
          <p id="levelCompleteMessage">{levelCompleteMessage}</p>
          <button id="nextLevelButton" onClick={onNextLevel}>
            PRÓXIMA FASE
          </button>
        </div>
      )}
    </div>
  );
}; 