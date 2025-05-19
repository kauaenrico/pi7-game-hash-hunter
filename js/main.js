import { generateMaze, drawMaze } from './maze.js';
import { Player } from './player.js';
import { Virus } from './virus.js';
import { placePatchesInMaze, drawPatches, isPatchAt } from './patch.js';
import { initAudio, playSoundEffect, playBackgroundMusic, stopBackgroundMusic } from './audio.js';
import { gameTexts, getRandomMessage, formatMessage } from './texts.js';
import { getNewTip } from './security_tips.js';

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
  lastVirusWarning: 0
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
function initGame() {
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
  
  // Limpa o pop-up de dicas
  if (tipTimeout) {
    clearTimeout(tipTimeout);
    tipTimeout = null;
  }
  securityTipPopup.classList.remove('show');
  
  // Update UI
  updateUI();
  
  // Start game loop
  if (!gameState.isGameRunning) {
    gameState.isGameRunning = true;
    gameLoop();
  }
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

// Função para mostrar uma dica de segurança
function showSecurityTip() {
  // Limpa qualquer timeout existente
  if (tipTimeout) {
    clearTimeout(tipTimeout);
  }
  
  // Obtém uma nova dica
  const tip = getNewTip();
  
  // Atualiza o conteúdo do pop-up
  tipContent.textContent = tip;
  
  // Mostra o pop-up
  securityTipPopup.classList.add('show');
  
  // Define o timeout para esconder o pop-up
  tipTimeout = setTimeout(() => {
    securityTipPopup.classList.remove('show');
  }, TIP_DISPLAY_TIME);
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
  
  // Show game over screen
  gameOverlay.classList.remove('hidden');
  gameOverScreen.classList.remove('hidden');
  
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
  
  // Initialize new level
  initGame();
}

// Event Listeners
startButton.addEventListener('click', () => {
  gameOverlay.classList.add('hidden');
  startScreen.classList.add('hidden');
  initAudio();
  playBackgroundMusic();
  initGame();
});

retryButton.addEventListener('click', () => {
  gameOverlay.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  gameState.level = 1;
  gameState.mazeSize = { rows: 7, cols: 7 };
  playBackgroundMusic();
  initGame();
});

nextLevelButton.addEventListener('click', () => {
  nextLevel();
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

// Handle resize
window.addEventListener('resize', () => {
  if (gameState.maze) {
    gameState.cellSize = Math.floor(Math.min(
      canvas.width / gameState.mazeSize.cols,
      canvas.height / gameState.mazeSize.rows
    ));
    gameState.player.updateCellSize(gameState.cellSize);
    gameState.virus.updateCellSize(gameState.cellSize);
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
  gameState.player.draw(ctx);
  gameState.virus.draw(ctx);
  
  // Check for patch collection
  checkPatchCollection();
  
  // Check for win/lose conditions
  checkGameConditions();
  
  // Continue game loop
  if (!gameState.isGameOver && !gameState.isLevelComplete) {
    requestAnimationFrame(gameLoop);
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
  
  // Check if virus reached the center (network core)
  const coreRow = Math.floor(gameState.mazeSize.rows / 2);
  const coreCol = Math.floor(gameState.mazeSize.cols / 2);
  if (virusRow === coreRow && virusCol === coreCol) {
    gameOver('Virus reached network core');
    return;
  }
  
  // Move virus every other frame for slower movement
  if (Math.random() < 0.5) {
    gameState.virus.move(gameState.maze, gameState.patches, playerRow, playerCol);
  }
}