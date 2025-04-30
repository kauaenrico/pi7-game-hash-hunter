import { findDeadEnds } from './maze.js';

/**
 * Place security patches in the maze
 * @param {object} maze - Maze object with cells and walls
 * @returns {object} - Object containing patches array and total patch count
 */
export function placePatchesInMaze(maze) {
  // Find dead ends in the maze (good places for patches)
  const deadEnds = findDeadEnds(maze);
  
  // Calculate number of patches (all dead ends + some junction cells)
  const totalPatches = deadEnds.length;
  
  // Create patches at dead ends
  const patches = [];
  
  for (let i = 0; i < deadEnds.length; i++) {
    patches.push({
      row: deadEnds[i].row,
      col: deadEnds[i].col,
      collected: false
    });
  }
  
  return {
    patches,
    totalPatches
  };
}

/**
 * Draw security patches on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} patches - Array of patch objects
 * @param {number} cellSize - Size of each cell in pixels
 */
export function drawPatches(ctx, patches, cellSize) {
  ctx.fillStyle = '#00a2ff'; // Blue
  
  // Draw each patch
  for (const patch of patches) {
    const x = patch.col * cellSize;
    const y = patch.row * cellSize;
    
    // Draw glow effect
    ctx.fillStyle = 'rgba(0, 162, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      x + cellSize / 2,
      y + cellSize / 2,
      cellSize / 2.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw patch
    ctx.fillStyle = '#00a2ff';
    ctx.beginPath();
    ctx.arc(
      x + cellSize / 2,
      y + cellSize / 2,
      cellSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw patch symbol (shield)
    ctx.fillStyle = '#005580';
    ctx.beginPath();
    
    // Shield shape
    const shieldWidth = cellSize / 5;
    const shieldHeight = cellSize / 4;
    
    ctx.moveTo(x + cellSize / 2, y + cellSize / 2 - shieldHeight / 2);
    ctx.lineTo(x + cellSize / 2 + shieldWidth / 2, y + cellSize / 2 - shieldHeight / 4);
    ctx.lineTo(x + cellSize / 2 + shieldWidth / 2, y + cellSize / 2 + shieldHeight / 4);
    ctx.lineTo(x + cellSize / 2, y + cellSize / 2 + shieldHeight / 2);
    ctx.lineTo(x + cellSize / 2 - shieldWidth / 2, y + cellSize / 2 + shieldHeight / 4);
    ctx.lineTo(x + cellSize / 2 - shieldWidth / 2, y + cellSize / 2 - shieldHeight / 4);
    ctx.closePath();
    
    ctx.fill();
  }
}

/**
 * Check if there is a patch at a specific position
 * @param {Array} patches - Array of patch objects
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @returns {boolean} - Whether there is a patch at this position
 */
export function isPatchAt(patches, row, col) {
  return patches.some(patch => patch.row === row && patch.col === col);
}