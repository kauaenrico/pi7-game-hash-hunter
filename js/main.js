import { generateMaze, drawMaze } from './maze.js';
import { Player } from './player.js';
import { Virus } from './virus.js';
import { placePatchesInMaze, drawPatches, isPatchAt } from './patch.js';
import { initAudio, playSoundEffect, playBackgroundMusic, stopBackgroundMusic } from './audio.js';

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
  mazeSize: { rows: 15, cols: 15 },
  cellSize: 0,
  statusMessage: 'Ready'
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const patchCounter = document.getElementById('patchCounter');
const levelDisplay = document.getElementById('levelDisplay');
const statusDisplay = document.getElementById('statusDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const gameOverlay = document.getElementById('gameOverlay');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const finalScore = document.getElementById('finalScore');

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
  
  // Update UI
  updateUI();
  
  // Set game state
  gameState.isGameOver = false;
  gameState.isLevelComplete = false;
  gameState.statusMessage = 'Active';
  
  // Start game loop
  if (!gameState.isGameRunning) {
    gameState.isGameRunning = true;
    gameLoop();
  }
}

// UI updates
function updateUI() {
  patchCounter.textContent = `${gameState.patchesCollected}/${gameState.totalPatches}`;
  levelDisplay.textContent = gameState.level;
  statusDisplay.textContent = gameState.statusMessage;
}

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

// Check if player collected a patch
function checkPatchCollection() {
  const playerRow = gameState.player.row;
  const playerCol = gameState.player.col;
  
  // Check if there's a patch at player's position
  if (isPatchAt(gameState.patches, playerRow, playerCol)) {
    // Remove the patch
    gameState.patches = gameState.patches.filter(patch => 
      !(patch.row === playerRow && patch.col === playerCol)
    );
    
    // Update counters
    gameState.patchesCollected++;
    
    // Play sound effect
    playSoundEffect('collect');
    
    // Update UI
    updateUI();
    
    // Check if all patches are collected
    if (gameState.patchesCollected >= gameState.totalPatches) {
      levelComplete();
    }
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

// Game over
function gameOver(reason) {
  gameState.isGameRunning = false;
  gameState.isGameOver = true;
  gameState.statusMessage = 'Failed';
  
  // Update UI
  updateUI();
  finalScore.textContent = `${gameState.patchesCollected}/${gameState.totalPatches}`;
  
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
  gameState.statusMessage = 'Secured';
  
  // Update UI
  updateUI();
  
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
  gameState.mazeSize.rows += 2;
  gameState.mazeSize.cols += 2;
  
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
  gameState.mazeSize = { rows: 15, cols: 15 };
  playBackgroundMusic();
  initGame();
});

nextLevelButton.addEventListener('click', () => {
  nextLevel();
});

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