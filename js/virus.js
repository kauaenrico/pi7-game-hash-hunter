/**
 * Virus class for handling virus movement and rendering
 */
import { hasWall } from './maze.js';

export class Virus {
  /**
   * Create a new virus
   * @param {number} row - Starting row
   * @param {number} col - Starting column
   * @param {number} cellSize - Size of each cell in pixels
   */
  constructor(row, col, cellSize) {
    this.row = row;
    this.col = col;
    this.cellSize = cellSize;
    this.color = '#ff3a3a'; // Red
    this.glowColor = 'rgba(255, 58, 58, 0.5)';
    this.pulseValue = 0;
    this.pulseDirection = 0.05;
    this.visited = new Map(); // Track visited cells with count
    this.lastMoves = []; // Track last N moves
    this.maxMoveHistory = 15; // Increased move history
    this.moveCounter = 0; // Counter to control movement speed
    this.moveDelay = 4; // Increased delay between moves
    this.stuckCounter = 0; // Counter to detect when virus is stuck
    this.addVisited(row, col);
  }
  
  /**
   * Update the cell size (for responsive canvas)
   * @param {number} newCellSize - New cell size in pixels
   */
  updateCellSize(newCellSize) {
    this.cellSize = newCellSize;
  }
  
  /**
   * Add a cell to the visited map with count
   * @param {number} row - Row of the cell
   * @param {number} col - Column of the cell
   */
  addVisited(row, col) {
    const key = `${row},${col}`;
    const count = (this.visited.get(key) || 0) + 1;
    this.visited.set(key, count);
    
    this.lastMoves.push({ row, col });
    if (this.lastMoves.length > this.maxMoveHistory) {
      this.lastMoves.shift();
    }

    // Check if we're stuck in a small area
    if (this.lastMoves.length === this.maxMoveHistory) {
      const uniquePositions = new Set(
        this.lastMoves.map(move => `${move.row},${move.col}`)
      ).size;
      if (uniquePositions <= 3) { // If using 3 or fewer unique positions
        this.stuckCounter++;
      } else {
        this.stuckCounter = 0;
      }
    }
  }
  
  /**
   * Calculate visit score for a cell based on history
   * @param {number} row - Row of the cell
   * @param {number} col - Column of the cell
   * @returns {number} - Score indicating desirability (lower is better)
   */
  getVisitScore(row, col) {
    const key = `${row},${col}`;
    const visitCount = this.visited.get(key) || 0;
    
    // Calculate recency penalty
    const recencyPenalty = this.lastMoves.reduce((penalty, move, index) => {
      if (move.row === row && move.col === col) {
        // More recent moves get higher penalties
        return penalty + (this.maxMoveHistory - index);
      }
      return penalty;
    }, 0);
    
    // Calculate area congestion
    const areaCongestion = Array.from(this.visited.entries())
      .filter(([pos, _]) => {
        const [r, c] = pos.split(',').map(Number);
        const distance = Math.abs(r - row) + Math.abs(c - col);
        return distance <= 2; // Check cells within distance of 2
      })
      .reduce((sum, [_, count]) => sum + count, 0);
    
    return visitCount * 3 + recencyPenalty * 2 + areaCongestion;
  }
  
  /**
   * Move the virus in a procedural way towards the player or center
   * @param {object} maze - Maze object with walls
   * @param {Array} patches - Array of patch objects
   * @param {number} playerRow - Player's current row
   * @param {number} playerCol - Player's current column
   */
  move(maze, patches, playerRow, playerCol) {
    // Only move every N frames
    this.moveCounter++;
    if (this.moveCounter < this.moveDelay) {
      return;
    }
    this.moveCounter = 0;
    
    // Define possible directions
    const directions = ['up', 'right', 'down', 'left'];
    const dirMap = {
      'up': [-1, 0],
      'right': [0, 1],
      'down': [1, 0],
      'left': [0, -1]
    };
    
    // Find center of maze (alternative target)
    const centerRow = Math.floor(maze.rows / 2);
    const centerCol = Math.floor(maze.cols / 2);
    
    // Choose target based on various factors
    let targetRow, targetCol;
    const randomFactor = Math.random();
    
    if (this.stuckCounter >= 3) {
      // If stuck, prioritize moving to least visited area
      const leastVisitedCell = this.findLeastVisitedArea(maze);
      targetRow = leastVisitedCell.row;
      targetCol = leastVisitedCell.col;
    } else if (randomFactor < 0.4) { // Increased random exploration
      // Choose random target within maze bounds
      targetRow = Math.floor(Math.random() * maze.rows);
      targetCol = Math.floor(Math.random() * maze.cols);
    } else if (randomFactor < 0.7) { // Target player
      targetRow = playerRow;
      targetCol = playerCol;
    } else { // Target center
      targetRow = centerRow;
      targetCol = centerCol;
    }
    
    // Calculate scores for each direction
    const scores = {};
    let validMoves = [];
    
    for (const dir of directions) {
      if (!hasWall(maze, this.row, this.col, dir)) {
        const [rowOffset, colOffset] = dirMap[dir];
        const newRow = this.row + rowOffset;
        const newCol = this.col + colOffset;
        
        // Check if this cell has a patch (avoid patched cells)
        const hasPatch = patches.some(patch => 
          patch.row === newRow && patch.col === newCol
        );
        
        // Only consider unpatched cells
        if (!hasPatch) {
          // Calculate base score (distance to target)
          const distanceScore = Math.abs(newRow - targetRow) + Math.abs(newCol - targetCol);
          
          // Calculate visit penalty
          const visitPenalty = this.getVisitScore(newRow, newCol);
          
          // Final score combines distance and visit history
          scores[dir] = distanceScore + visitPenalty;
          validMoves.push(dir);
        }
      }
    }
    
    // If no valid moves, stay put
    if (validMoves.length === 0) return;
    
    let chosenDir;
    const moveRandomness = Math.random();
    
    if (this.stuckCounter >= 3 || moveRandomness < 0.4) {
      // When stuck or 40% chance: choose least visited direction
      chosenDir = validMoves.reduce((best, current) => 
        scores[current] < scores[best] ? current : best
      , validMoves[0]);
    } else if (moveRandomness < 0.8) {
      // 40% chance: weighted random from top half of moves
      validMoves.sort((a, b) => scores[a] - scores[b]);
      const topMoves = validMoves.slice(0, Math.ceil(validMoves.length / 2));
      const randomIndex = Math.floor(Math.random() * topMoves.length);
      chosenDir = topMoves[randomIndex];
    } else {
      // 20% chance: completely random move
      const randomIndex = Math.floor(Math.random() * validMoves.length);
      chosenDir = validMoves[randomIndex];
    }
    
    // Move virus
    const [rowOffset, colOffset] = dirMap[chosenDir];
    this.row += rowOffset;
    this.col += colOffset;
    
    // Add new position to visited cells
    this.addVisited(this.row, this.col);
  }
  
  /**
   * Find the least visited area in the maze
   * @param {object} maze - Maze object
   * @returns {object} - {row, col} of least visited area
   */
  findLeastVisitedArea(maze) {
    let leastVisited = { row: this.row, col: this.col };
    let minScore = Infinity;
    
    // Sample random positions in the maze
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(Math.random() * maze.rows);
      const col = Math.floor(Math.random() * maze.cols);
      const score = this.getVisitScore(row, col);
      
      if (score < minScore) {
        minScore = score;
        leastVisited = { row, col };
      }
    }
    
    return leastVisited;
  }
  
  /**
   * Draw the virus on the canvas
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
    
    // Draw virus glow
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
    
    // Draw virus body
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
    
    // Draw virus details (cross pattern)
    ctx.strokeStyle = '#800000';
    ctx.lineWidth = this.cellSize / 10;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x + this.cellSize / 3, y + this.cellSize / 2);
    ctx.lineTo(x + this.cellSize * 2/3, y + this.cellSize / 2);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x + this.cellSize / 2, y + this.cellSize / 3);
    ctx.lineTo(x + this.cellSize / 2, y + this.cellSize * 2/3);
    ctx.stroke();
  }
}