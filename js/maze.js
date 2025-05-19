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
  
  // Draw background (much lighter)
  ctx.fillStyle = '#eaffea'; // very light green
  ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
  
  // Draw grid lines (light gray, thicker)
  ctx.strokeStyle = '#b0ffb0';
  ctx.lineWidth = 2;
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(cols * cellSize, i * cellSize);
    ctx.stroke();
  }
  for (let j = 0; j <= cols; j++) {
    ctx.beginPath();
    ctx.moveTo(j * cellSize, 0);
    ctx.lineTo(j * cellSize, rows * cellSize);
    ctx.stroke();
  }

  // Draw paths (white, for high contrast)
  ctx.fillStyle = '#ffffff';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
    }
  }

  // Draw walls (bright green, much thicker)
  ctx.strokeStyle = '#00ff44';
  ctx.lineWidth = 6;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      if (walls[row][col][0]) {  // North
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (walls[row][col][1]) {  // East
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (walls[row][col][2]) {  // South
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (walls[row][col][3]) {  // West
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  }
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