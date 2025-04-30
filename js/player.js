/**
 * Player class for handling player movement and rendering
 */
import { hasWall } from './maze.js';

export class Player {
  /**
   * Create a new player
   * @param {number} row - Starting row
   * @param {number} col - Starting column
   * @param {number} cellSize - Size of each cell in pixels
   */
  constructor(row, col, cellSize) {
    this.row = row;
    this.col = col;
    this.cellSize = cellSize;
    this.color = '#7eff00'; // Lime green
    this.glowColor = 'rgba(126, 255, 0, 0.5)';
    this.pulseValue = 0;
    this.pulseDirection = 0.05;
  }
  
  /**
   * Update the cell size (for responsive canvas)
   * @param {number} newCellSize - New cell size in pixels
   */
  updateCellSize(newCellSize) {
    this.cellSize = newCellSize;
  }
  
  /**
   * Move the player in a direction
   * @param {string} direction - Direction to move ('up', 'down', 'left', 'right')
   * @param {object} maze - Maze object with walls
   * @returns {boolean} - Whether the player moved successfully
   */
  move(direction, maze) {
    // Calculate new position based on direction
    let newRow = this.row;
    let newCol = this.col;
    
    switch(direction) {
      case 'up':
        newRow--;
        break;
      case 'down':
        newRow++;
        break;
      case 'left':
        newCol--;
        break;
      case 'right':
        newCol++;
        break;
    }
    
    // Check if there's a wall in the way
    if (hasWall(maze, this.row, this.col, direction)) {
      return false; // Can't move, there's a wall
    }
    
    // Update player position
    this.row = newRow;
    this.col = newCol;
    return true;
  }
  
  /**
   * Draw the player on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const x = this.col * this.cellSize;
    const y = this.row * this.cellSize;
    
    // Update pulse effect
    this.pulseValue += this.pulseDirection;
    if (this.pulseValue > 1 || this.pulseValue < 0) {
      this.pulseDirection *= -1;
    }
    
    // Draw player glow
    const glowRadius = this.cellSize * (0.5 + this.pulseValue * 0.1);
    ctx.beginPath();
    ctx.fillStyle = this.glowColor;
    ctx.arc(
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      glowRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw player
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      this.cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw player inner details (shield icon)
    ctx.beginPath();
    ctx.fillStyle = '#004d00';
    ctx.arc(
      x + this.cellSize / 2,
      y + this.cellSize / 2,
      this.cellSize / 6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}