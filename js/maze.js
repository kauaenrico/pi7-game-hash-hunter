/**
 * Generates a maze using the Recursive Backtracker (DFS) algorithm.
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @returns {object} Maze object with cells and walls
 */
export function generateMaze(rows, cols) {
  // Initialize maze grid
  const grid = Array(rows).fill().map(() => Array(cols).fill(0));
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  
  // Define walls: 0 = north, 1 = east, 2 = south, 3 = west
  const walls = Array(rows).fill().map(() => 
    Array(cols).fill().map(() => [true, true, true, true])
  );
  
  // Directions: [row offset, col offset, wall index, opposite wall index]
  const directions = [
    [-1, 0, 0, 2],  // North
    [0, 1, 1, 3],   // East
    [1, 0, 2, 0],   // South
    [0, -1, 3, 1]   // West
  ];
  
  // Starting position
  const startRow = 1;
  const startCol = 1;
  
  // Stack for DFS
  const stack = [{row: startRow, col: startCol}];
  visited[startRow][startCol] = true;
  
  // DFS algorithm
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Check if all neighbors have been visited
    const unvisitedNeighbors = [];
    
    for (const [rowOffset, colOffset, wallIndex, oppositeWallIndex] of directions) {
      const newRow = current.row + rowOffset;
      const newCol = current.col + colOffset;
      
      // Check if neighbor is within bounds and not visited
      if (newRow >= 0 && newRow < rows && 
          newCol >= 0 && newCol < cols && 
          !visited[newRow][newCol]) {
        unvisitedNeighbors.push({
          row: newRow,
          col: newCol,
          wallIndex: wallIndex,
          oppositeWallIndex: oppositeWallIndex
        });
      }
    }
    
    if (unvisitedNeighbors.length > 0) {
      // Choose a random unvisited neighbor
      const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
      const neighbor = unvisitedNeighbors[randomIndex];
      
      // Remove walls between current cell and chosen neighbor
      walls[current.row][current.col][neighbor.wallIndex] = false;
      walls[neighbor.row][neighbor.col][neighbor.oppositeWallIndex] = false;
      
      // Mark neighbor as visited and add to stack
      visited[neighbor.row][neighbor.col] = true;
      stack.push({row: neighbor.row, col: neighbor.col});
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  return { grid, walls, rows, cols };
}

/**
 * Draws the maze on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} maze - Maze object with cells and walls
 * @param {number} cellSize - Size of each cell in pixels
 */
export function drawMaze(ctx, maze, cellSize) {
  const { rows, cols, walls } = maze;
  
  // Draw background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, rows * cellSize);
  gradient.addColorStop(0, 'rgba(26, 136, 255, 0.1)');   // Light blue at top
  gradient.addColorStop(1, 'rgba(0, 162, 255, 0.05)');   // Lighter blue at bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
  
  // Draw cell paths with subtle pattern
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      
      // Draw cell background with subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';  // Very subtle white
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      // Add subtle grid pattern
      ctx.strokeStyle = 'rgba(26, 136, 255, 0.1)';  // Light blue grid
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Draw walls with modern style
  ctx.lineWidth = cellSize * 0.15;  // Thicker walls
  ctx.lineCap = 'round';  // Rounded wall ends
  ctx.lineJoin = 'round'; // Rounded wall corners
  
  // Wall shadow
  ctx.shadowColor = 'rgba(26, 136, 255, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw walls with gradient
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      
      // Create wall gradient
      const wallGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      wallGradient.addColorStop(0, 'rgba(26, 136, 255, 0.8)');    // Blue
      wallGradient.addColorStop(0.5, 'rgba(0, 162, 255, 0.9)');   // Lighter blue
      wallGradient.addColorStop(1, 'rgba(26, 136, 255, 0.8)');    // Blue
      
      ctx.strokeStyle = wallGradient;
      
      // Draw each wall with rounded corners
      if (walls[row][col][0]) {  // North wall
        ctx.beginPath();
        ctx.moveTo(x + cellSize * 0.1, y);
        ctx.lineTo(x + cellSize * 0.9, y);
        ctx.stroke();
      }
      if (walls[row][col][1]) {  // East wall
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y + cellSize * 0.1);
        ctx.lineTo(x + cellSize, y + cellSize * 0.9);
        ctx.stroke();
      }
      if (walls[row][col][2]) {  // South wall
        ctx.beginPath();
        ctx.moveTo(x + cellSize * 0.1, y + cellSize);
        ctx.lineTo(x + cellSize * 0.9, y + cellSize);
        ctx.stroke();
      }
      if (walls[row][col][3]) {  // West wall
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize * 0.1);
        ctx.lineTo(x, y + cellSize * 0.9);
        ctx.stroke();
      }
    }
  }
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Add subtle glow effect to walls
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(26, 136, 255, 0.2)';  // Very subtle blue glow
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (walls[row][col][0] || walls[row][col][1] || walls[row][col][2] || walls[row][col][3]) {
        const x = col * cellSize;
        const y = row * cellSize;
        ctx.beginPath();
        ctx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Checks if a cell has a wall in a specific direction.
 * @param {object} maze - Maze object with cells and walls
 * @param {number} row - Row of the cell
 * @param {number} col - Column of the cell
 * @param {string} direction - Direction to check ('up', 'right', 'down', 'left')
 * @returns {boolean} - Whether there is a wall in that direction
 */
export function hasWall(maze, row, col, direction) {
  const directionMap = {
    'up': 0,    // North wall
    'right': 1, // East wall
    'down': 2,  // South wall
    'left': 3   // West wall
  };
  
  // Check if the cell is within the maze bounds
  if (row < 0 || row >= maze.rows || col < 0 || col >= maze.cols) {
    return true;
  }
  
  // Return whether the wall exists in the specified direction
  return maze.walls[row][col][directionMap[direction]];
}

/**
 * Find dead-end cells in the maze (cells with only one open path)
 * @param {object} maze - Maze object with cells and walls
 * @returns {Array} - Array of dead-end cells {row, col}
 */
export function findDeadEnds(maze) {
  const deadEnds = [];
  
  for (let row = 0; row < maze.rows; row++) {
    for (let col = 0; col < maze.cols; col++) {
      // Count walls around this cell
      let wallCount = 0;
      if (maze.walls[row][col][0]) wallCount++; // North
      if (maze.walls[row][col][1]) wallCount++; // East
      if (maze.walls[row][col][2]) wallCount++; // South
      if (maze.walls[row][col][3]) wallCount++; // West
      
      // If cell has 3 walls, it's a dead end
      if (wallCount === 3) {
        // Skip start position and center
        const isStart = (row === 1 && col === 1);
        const isCenter = (
          row === Math.floor(maze.rows / 2) && 
          col === Math.floor(maze.cols / 2)
        );
        
        if (!isStart && !isCenter) {
          deadEnds.push({ row, col });
        }
      }
    }
  }
  
  return deadEnds;
}