import { generateMaze, drawMaze } from './maze.js';
import { Player } from './player.js';
import { Virus } from './virus.js';
import { placePatchesInMaze, drawPatches, isPatchAt } from './patch.js';
import { initAudio, playSoundEffect, playBackgroundMusic, stopBackgroundMusic } from './audio.js';
import { gameTexts, getRandomMessage, formatMessage } from './texts.js';
import { getNewTip } from './security_tips.js';
import { gameAssets, loadAllImages, getImage } from './assets.js';
import { TouchControls } from './touch_controls.js';

// Game state
let gameState = {
  level: 1,
  maze: null,
  player: null,
  virus: null,
  patches: [],
  patchesCollected: 0,
  totalPatches: 0,
  isGameRunning: false,
  isGameOver: false,
  isLevelComplete: false,
  mazeSize: { rows: 7, cols: 7 },
  cellSize: 0,
  statusMessage: 'Pronto',
  startTime: 0,
  currentTime: 0,
  lastVirusDistance: 0,
  lastVirusWarning: 0,
  isPaused: false,
  gameLoopId: null,
  assetsLoaded: false,
  touchControls: null,
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const patchCounter = document.getElementById('patchCounter');
const levelDisplay = document.getElementById('levelDisplay');
const statusDisplay = document.getElementById('statusDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const gameOverlay = document.getElementById('gameOverlay');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const finalScore = document.getElementById('finalScore');
const storyText = document.getElementById('storyText');
const instructionsText = document.getElementById('instructionsText');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteMessage = document.getElementById('levelCompleteMessage');
const securityTip = document.getElementById('securityTip');
const securityTipPopup = document.getElementById('securityTipPopup');
const tipContent = securityTipPopup.querySelector('.tip-content');
const pauseOverlay = document.getElementById('pauseOverlay');
const continueButton = securityTipPopup.querySelector('.continue-button');

// Variáveis para controle do pop-up
let tipTimeout = null;
const TIP_DISPLAY_TIME = 5000; // 5 segundos

// Initialize game texts
function initGameTexts() {
  // Set story text
  storyText.innerHTML = gameTexts.story.background.map(text => `<p>${text}</p>`).join('');
  
  // Set instructions
  const instructions = [
    ...gameTexts.instructions.objective,
    ...gameTexts.instructions.controls,
    ...gameTexts.instructions.goal
  ];
  instructionsText.innerHTML = `<ul>${instructions.map(text => `<li>${text}</li>`).join('')}</ul>`;
  
  // Set labels
  document.getElementById('levelLabel').textContent = gameTexts.hud.level;
  document.getElementById('hashesLabel').textContent = gameTexts.hud.hashes;
  document.getElementById('timeLabel').textContent = gameTexts.hud.time.split(':')[0];
}

// Game initialization
async function initGame() {
  // Calculate cell size based on canvas dimensions and maze size
  gameState.cellSize = Math.floor(Math.min(
    canvas.width / gameState.mazeSize.cols,
    canvas.height / gameState.mazeSize.rows
  ));

  // Generate maze
  gameState.maze = generateMaze(gameState.mazeSize.rows, gameState.mazeSize.cols);
  
  // Place patches in maze dead-ends
  const patchesInfo = placePatchesInMaze(gameState.maze);
  gameState.patches = patchesInfo.patches;
  gameState.totalPatches = patchesInfo.totalPatches;
  gameState.patchesCollected = 0;
  
  // Create player and virus
  gameState.player = new Player(1, 1, gameState.cellSize);
  gameState.virus = new Virus(
    gameState.mazeSize.rows - 2, 
    gameState.mazeSize.cols - 2, 
    gameState.cellSize
  );
  
  // Reset game state
  gameState.isGameOver = false;
  gameState.isLevelComplete = false;
  gameState.statusMessage = 'Ativo';
  gameState.startTime = Date.now();
  gameState.currentTime = 0;
  gameState.lastVirusDistance = 0;
  gameState.lastVirusWarning = 0;
  
  // Reset pause state
  gameState.isPaused = false;
  pauseOverlay.classList.remove('show');
  securityTipPopup.classList.remove('show');
  
  // Limpa o pop-up de dicas
  if (tipTimeout) {
    clearTimeout(tipTimeout);
    tipTimeout = null;
  }
  
  // Update UI
  updateUI();
  
  // Start game loop
  if (!gameState.isGameRunning) {
    gameState.isGameRunning = true;
    gameLoop();
  }

  // Carregar imagens
  try {
    await loadAllImages();
    gameState.assetsLoaded = true;
  } catch (error) {
    console.error('Error loading game assets:', error);
    // Continuar com formas geométricas como fallback
  }

  // Initialize touch controls if on mobile
  if (gameState.touchControls) {
    gameState.touchControls.destroy();
  }
  gameState.touchControls = new TouchControls(canvas, handleTouchMove);
}

// UI updates
function updateUI() {
  // Update counters
  patchCounter.textContent = `${gameState.patchesCollected}/${gameState.totalPatches}`;
  levelDisplay.textContent = gameState.level;
  statusDisplay.textContent = gameState.statusMessage;
  
  // Update time
  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  timeDisplay.textContent = `${minutes}:${seconds}`;
  
  // Update virus distance warning
  const virusDistance = calculateVirusDistance();
  if (virusDistance !== gameState.lastVirusDistance) {
    gameState.lastVirusDistance = virusDistance;
    if (virusDistance <= 5) {
      const warningMessage = getRandomMessage(gameTexts.feedback.virusWarning);
      statusDisplay.textContent = warningMessage;
      if (Date.now() - gameState.lastVirusWarning > 3000) {
        gameState.lastVirusWarning = Date.now();
        playSoundEffect('alarm');
      }
    }
  }
}

// Calculate distance between player and virus
function calculateVirusDistance() {
  const dx = gameState.player.col - gameState.virus.col;
  const dy = gameState.player.row - gameState.virus.row;
  return Math.floor(Math.sqrt(dx * dx + dy * dy));
}

// Função para pausar o jogo
function pauseGame() {
  gameState.isPaused = true;
  gameState.isGameRunning = false;
  pauseOverlay.classList.add('show');
  if (gameState.gameLoopId) {
    cancelAnimationFrame(gameState.gameLoopId);
    gameState.gameLoopId = null;
  }
  // Esconde o joystick quando o jogo está pausado
  if (gameState.touchControls) {
    gameState.touchControls.setVisible(false);
  }
}

// Função para continuar o jogo
function continueGame() {
  gameState.isPaused = false;
  gameState.isGameRunning = true;
  pauseOverlay.classList.remove('show');
  securityTipPopup.classList.remove('show');
  // Mostra o joystick quando o jogo continua
  if (gameState.touchControls) {
    gameState.touchControls.setVisible(true);
  }
  gameLoop();
}

// Função para mostrar uma dica de segurança
function showSecurityTip() {
  // Pausa o jogo
  pauseGame();
  
  // Obtém uma nova dica
  const tip = getNewTip();
  
  // Atualiza o conteúdo do pop-up
  tipContent.textContent = tip;
  
  // Mostra o pop-up
  securityTipPopup.classList.add('show');
  
  // Esconde o joystick quando mostra a dica
  if (gameState.touchControls) {
    gameState.touchControls.setVisible(false);
  }
}

// Check if player collected a patch
function checkPatchCollection() {
  const playerRow = gameState.player.row;
  const playerCol = gameState.player.col;
  
  if (isPatchAt(gameState.patches, playerRow, playerCol)) {
    // Remove the patch
    gameState.patches = gameState.patches.filter(patch => 
      !(patch.row === playerRow && patch.col === playerCol)
    );
    
    // Update counters
    gameState.patchesCollected++;
    
    // Play sound and show message
    playSoundEffect('collect');
    statusDisplay.textContent = getRandomMessage(gameTexts.feedback.hashCollected);
    
    // Mostra uma dica de segurança
    showSecurityTip();
    
    // Update UI
    updateUI();
    
    // Check if all patches are collected
    if (gameState.patchesCollected >= gameState.totalPatches) {
      levelComplete();
    }
  }
}

// Game over
function gameOver(reason) {
  gameState.isGameRunning = false;
  gameState.isGameOver = true;
  gameState.statusMessage = 'Falha';
  
  // Update UI
  updateUI();
  finalScore.textContent = `${gameState.patchesCollected}/${gameState.totalPatches}`;
  
  // Set game over message
  gameOverTitle.textContent = gameTexts.gameOver.title;
  gameOverMessage.textContent = getRandomMessage(gameTexts.gameOver.messages);
  
  // Mostra o popup de game over
  securityTipPopup.classList.add('show');
  tipContent.textContent = `${gameTexts.gameOver.title}\n\n${getRandomMessage(gameTexts.gameOver.messages)}\n\nPontuação: ${gameState.patchesCollected}/${gameState.totalPatches}`;
  
  // Esconde o joystick no game over
  if (gameState.touchControls) {
    gameState.touchControls.setVisible(false);
  }
  
  // Play game over sound
  playSoundEffect('gameOver');
  stopBackgroundMusic();
}

// Level complete
function levelComplete() {
  gameState.isGameRunning = false;
  gameState.isLevelComplete = true;
  gameState.statusMessage = 'Seguro';
  
  // Update UI
  updateUI();
  
  // Set level complete message
  levelCompleteTitle.textContent = gameTexts.levelComplete.title;
  levelCompleteMessage.textContent = getRandomMessage(gameTexts.levelComplete.progress);
  
  // Set security tip
  const tip = gameTexts.levelTips[gameState.level] || getRandomMessage(gameTexts.levelComplete.securityTips);
  securityTip.textContent = tip;
  
  // Show level complete screen
  gameOverlay.classList.remove('hidden');
  levelCompleteScreen.classList.remove('hidden');
  
  // Play level complete sound
  playSoundEffect('levelComplete');
}

// Start next level
function nextLevel() {
  // Increase level and maze size
  gameState.level++;
  gameState.mazeSize.rows += 1;
  gameState.mazeSize.cols += 1;
  
  // Hide level complete screen
  gameOverlay.classList.add('hidden');
  levelCompleteScreen.classList.add('hidden');
  
  // Reset game state
  gameState.isGameRunning = true;
  gameState.isGameOver = false;
  gameState.isLevelComplete = false;
  gameState.patchesCollected = 0;
  gameState.statusMessage = 'Ativo';
  gameState.startTime = Date.now();
  gameState.currentTime = 0;
  gameState.lastVirusDistance = 0;
  gameState.lastVirusWarning = 0;
  
  // Calculate new cell size based on updated maze dimensions
  gameState.cellSize = Math.floor(Math.min(
    canvas.width / gameState.mazeSize.cols,
    canvas.height / gameState.mazeSize.rows
  ));

  // Generate new maze with updated size
  gameState.maze = generateMaze(gameState.mazeSize.rows, gameState.mazeSize.cols);
  
  // Place new patches in the new maze
  const patchesInfo = placePatchesInMaze(gameState.maze);
  gameState.patches = patchesInfo.patches;
  gameState.totalPatches = patchesInfo.totalPatches;
  
  // Create new player and virus instances with updated cell size
  gameState.player = new Player(1, 1, gameState.cellSize);
  gameState.virus = new Virus(
    gameState.mazeSize.rows - 2,
    gameState.mazeSize.cols - 2,
    gameState.cellSize
  );
  
  // Update UI
  updateUI();
  
  // Start game loop if not already running
  if (!gameState.gameLoopId) {
    gameLoop();
  }
}

// Event Listeners
window.addEventListener('load', () => {
  gameOverlay.classList.add('hidden');
  startScreen.classList.add('hidden');
  initAudio();
  playBackgroundMusic();
  initGame();
});

retryButton.addEventListener('click', () => {
  securityTipPopup.classList.remove('show');
  gameState.level = 1;
  gameState.mazeSize = { rows: 7, cols: 7 };
  playBackgroundMusic();
  initGame();
});

nextLevelButton.addEventListener('click', () => {
  nextLevel();
});

continueButton.addEventListener('click', () => {
  if (gameState.isGameOver) {
    // Se estiver em game over, reinicia o jogo
    securityTipPopup.classList.remove('show');
    gameState.level = 1;
    gameState.mazeSize = { rows: 7, cols: 7 };
    playBackgroundMusic();
    initGame();
  } else {
    // Se não estiver em game over, apenas continua o jogo normalmente
    continueGame();
  }
});

// Initialize game texts when the page loads
document.addEventListener('DOMContentLoaded', initGameTexts);

// Keyboard input
document.addEventListener('keydown', (e) => {
  if (!gameState.isGameRunning) return;
  
  let moved = false;
  
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      moved = gameState.player.move('up', gameState.maze);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      moved = gameState.player.move('down', gameState.maze);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      moved = gameState.player.move('left', gameState.maze);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      moved = gameState.player.move('right', gameState.maze);
      break;
  }
  
  // Prevent default scrolling behavior
  if (moved) {
    e.preventDefault();
  }
});

// Handle touch movement
function handleTouchMove(direction) {
  if (!gameState.isGameRunning || !direction) return;
  
  gameState.player.move(direction, gameState.maze);
}

// Handle resize
window.addEventListener('resize', () => {
  if (gameState.maze) {
    gameState.cellSize = Math.floor(Math.min(
      canvas.width / gameState.mazeSize.cols,
      canvas.height / gameState.mazeSize.rows
    ));
    gameState.player.updateCellSize(gameState.cellSize);
    gameState.virus.updateCellSize(gameState.cellSize);
    
    // Update touch controls if they exist
    if (gameState.touchControls) {
      gameState.touchControls.destroy();
      gameState.touchControls = new TouchControls(canvas, handleTouchMove);
    }
  }
});

// Game loop
function gameLoop() {
  if (!gameState.isGameRunning) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw maze
  drawMaze(ctx, gameState.maze, gameState.cellSize);
  
  // Draw patches
  drawPatches(ctx, gameState.patches, gameState.cellSize);
  
  // Draw player and virus
  drawGame();
  
  // Check for patch collection
  checkPatchCollection();
  
  // Check for win/lose conditions
  checkGameConditions();
  
  // Continue game loop
  if (!gameState.isGameOver && !gameState.isLevelComplete && !gameState.isPaused) {
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
  }
}

// Check win/lose conditions
function checkGameConditions() {
  const virusRow = gameState.virus.row;
  const virusCol = gameState.virus.col;
  const playerRow = gameState.player.row;
  const playerCol = gameState.player.col;
  
  // Check if virus caught player
  if (virusRow === playerRow && virusCol === playerCol) {
    gameOver('Virus reached you');
    return;
  }
  
  // Move virus every other frame for slower movement
  if (Math.random() < 0.5) {
    gameState.virus.move(gameState.maze, gameState.patches, playerRow, playerCol);
  }
}

// Função auxiliar para desenhar objetos padrão
function drawDefaultObject(ctx, x, y, cellSize, type) {
  const centerX = x + cellSize / 2;
  const centerY = y + cellSize / 2;
  const radius = cellSize / 3;

  switch(type) {
    case 'player':
      // Desenhar jogador (círculo verde com detalhes)
      ctx.fillStyle = '#7eff00';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Detalhes do jogador (escudo)
      ctx.fillStyle = '#004d00';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'virus':
      // Desenhar vírus (círculo vermelho com detalhes)
      ctx.fillStyle = '#ff3a3a';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Detalhes do vírus (X)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - radius/2, centerY - radius/2);
      ctx.lineTo(centerX + radius/2, centerY + radius/2);
      ctx.moveTo(centerX + radius/2, centerY - radius/2);
      ctx.lineTo(centerX - radius/2, centerY + radius/2);
      ctx.stroke();
      break;

    case 'hash':
      // Desenhar hash (quadrado azul com #)
      ctx.fillStyle = '#0066ff';
      ctx.fillRect(x + cellSize/4, y + cellSize/4, cellSize/2, cellSize/2);
      
      // Desenhar # no centro
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const hashSize = cellSize/4;
      ctx.beginPath();
      // Linha horizontal superior
      ctx.moveTo(centerX - hashSize, centerY - hashSize/2);
      ctx.lineTo(centerX + hashSize, centerY - hashSize/2);
      // Linha horizontal inferior
      ctx.moveTo(centerX - hashSize, centerY + hashSize/2);
      ctx.lineTo(centerX + hashSize, centerY + hashSize/2);
      // Linha vertical esquerda
      ctx.moveTo(centerX - hashSize/2, centerY - hashSize);
      ctx.lineTo(centerX - hashSize/2, centerY + hashSize);
      // Linha vertical direita
      ctx.moveTo(centerX + hashSize/2, centerY - hashSize);
      ctx.lineTo(centerX + hashSize/2, centerY + hashSize);
      ctx.stroke();
      break;
  }
}

// Modificar a função drawGame
function drawGame() {
  // Desenhar elementos do jogo
  if (gameState.assetsLoaded) {
    // Desenhar jogador
    const playerImg = getImage(gameAssets.images.player.path);
    if (playerImg) {
      ctx.drawImage(
        playerImg,
        gameState.player.col * gameState.cellSize + (gameState.cellSize - gameAssets.images.player.width) / 2,
        gameState.player.row * gameState.cellSize + (gameState.cellSize - gameAssets.images.player.height) / 2,
        gameAssets.images.player.width,
        gameAssets.images.player.height
      );
    } else {
      drawDefaultObject(
        ctx,
        gameState.player.col * gameState.cellSize,
        gameState.player.row * gameState.cellSize,
        gameState.cellSize,
        'player'
      );
    }

    // Desenhar vírus
    const virusImg = getImage(gameAssets.images.virus.path);
    if (virusImg) {
      ctx.drawImage(
        virusImg,
        gameState.virus.col * gameState.cellSize + (gameState.cellSize - gameAssets.images.virus.width) / 2,
        gameState.virus.row * gameState.cellSize + (gameState.cellSize - gameAssets.images.virus.height) / 2,
        gameAssets.images.virus.width,
        gameAssets.images.virus.height
      );
    } else {
      drawDefaultObject(
        ctx,
        gameState.virus.col * gameState.cellSize,
        gameState.virus.row * gameState.cellSize,
        gameState.cellSize,
        'virus'
      );
    }

    // Desenhar hashes
    const hashImg = getImage(gameAssets.images.hash.path);
    if (hashImg) {
      gameState.patches.forEach(patch => {
        ctx.drawImage(
          hashImg,
          patch.col * gameState.cellSize + (gameState.cellSize - gameAssets.images.hash.width) / 2,
          patch.row * gameState.cellSize + (gameState.cellSize - gameAssets.images.hash.height) / 2,
          gameAssets.images.hash.width,
          gameAssets.images.hash.height
        );
      });
    } else {
      gameState.patches.forEach(patch => {
        drawDefaultObject(
          ctx,
          patch.col * gameState.cellSize,
          patch.row * gameState.cellSize,
          gameState.cellSize,
          'hash'
        );
      });
    }
  } else {
    // Fallback para todas as formas geométricas quando assets não estão carregados
    // Desenhar jogador
    drawDefaultObject(
      ctx,
      gameState.player.col * gameState.cellSize,
      gameState.player.row * gameState.cellSize,
      gameState.cellSize,
      'player'
    );

    // Desenhar vírus
    drawDefaultObject(
      ctx,
      gameState.virus.col * gameState.cellSize,
      gameState.virus.row * gameState.cellSize,
      gameState.cellSize,
      'virus'
    );

    // Desenhar hashes
    gameState.patches.forEach(patch => {
      drawDefaultObject(
        ctx,
        patch.col * gameState.cellSize,
        patch.row * gameState.cellSize,
        gameState.cellSize,
        'hash'
      );
    });
  }
}