interface GameEngineOptions {
  onGameStateChange: (state: {
    level: number;
    hashes: number;
    totalHashes: number;
    status: string;
    time: string;
  }) => void;
  onGameOver: (message: string) => void;
  onLevelComplete: (message: string, tip: string) => void;
  onSecurityTip: (tip: string) => void;
  onHashCollected?: () => void;
}

interface Maze {
  grid: number[][];
  walls: boolean[][][];
  rows: number;
  cols: number;
}

function generateMaze(rows: number, cols: number): Maze {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(0));
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const walls = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => [true, true, true, true])
  );
  const directions = [
    [-1, 0, 0, 2],  // Norte
    [0, 1, 1, 3],   // Leste
    [1, 0, 2, 0],   // Sul
    [0, -1, 3, 1]   // Oeste
  ];
  const startRow = 1;
  const startCol = 1;
  const stack = [{ row: startRow, col: startCol }];
  visited[startRow][startCol] = true;
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisitedNeighbors = [];
    for (const [rowOffset, colOffset, wallIndex, oppositeWallIndex] of directions) {
      const newRow = current.row + rowOffset;
      const newCol = current.col + colOffset;
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol]
      ) {
        unvisitedNeighbors.push({
          row: newRow,
          col: newCol,
          wallIndex,
          oppositeWallIndex
        });
      }
    }
    if (unvisitedNeighbors.length > 0) {
      const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
      const neighbor = unvisitedNeighbors[randomIndex];
      walls[current.row][current.col][neighbor.wallIndex] = false;
      walls[neighbor.row][neighbor.col][neighbor.oppositeWallIndex] = false;
      visited[neighbor.row][neighbor.col] = true;
      stack.push({ row: neighbor.row, col: neighbor.col });
    } else {
      stack.pop();
    }
  }
  return { grid, walls, rows, cols };
}

function drawMaze(ctx: CanvasRenderingContext2D, maze: Maze, cellSize: number) {
  const { rows, cols, walls } = maze;
  // Fundo com gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, rows * cellSize);
  gradient.addColorStop(0, 'rgba(2, 28, 56, 0.1)');
  gradient.addColorStop(1, 'rgba(33, 0, 63, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
  // Padrão sutil nas células
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      ctx.strokeStyle = 'rgba(26, 136, 255, 0.1)';
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
  // Paredes
  ctx.lineWidth = cellSize * 0.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(26, 136, 255, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const wallGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      wallGradient.addColorStop(0, '#00f294');
      wallGradient.addColorStop(0.5, '#501363');
      wallGradient.addColorStop(1, 'rgba(26, 136, 255, 0.8)');
      ctx.strokeStyle = wallGradient;
      if (walls[row][col][0]) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize * 0.1, y);
        ctx.lineTo(x + cellSize * 0.9, y);
        ctx.stroke();
      }
      if (walls[row][col][1]) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y + cellSize * 0.1);
        ctx.lineTo(x + cellSize, y + cellSize * 0.9);
        ctx.stroke();
      }
      if (walls[row][col][2]) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize * 0.1, y + cellSize);
        ctx.lineTo(x + cellSize * 0.9, y + cellSize);
        ctx.stroke();
      }
      if (walls[row][col][3]) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize * 0.1);
        ctx.lineTo(x, y + cellSize * 0.9);
        ctx.stroke();
      }
    }
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(0, 24, 49, 0.2)';
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
  ctx.globalCompositeOperation = 'source-over';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GameEngineOptions;
  private gameLoop: number | null = null;
  private lastTime = 0;
  private gameTime = 0;
  private maze: Maze | null = null;
  private playerPos = { row: 1, col: 1 };
  private virusPos = { row: 0, col: 0 };
  private hashPositions: { row: number, col: number }[] = [];
  private collectedHashes = 0;
  private totalHashes = 0;
  private level = 1;
  private mazeRows = 6;
  private mazeCols = 6;
  private virusHistory: string[] = [];
  private lastMoveTime = 0;
  private moveInterval = 700; // ms (velocidade do vírus)
  private keyQueue: string[] = [];
  private onNextLevel: (() => void) | null = null;
  private paused = false;
  private virusPosHistory: { row: number, col: number }[] = [];
  private playerImg: HTMLImageElement | undefined;
private virusImg:  HTMLImageElement | undefined;
private hashImg:   HTMLImageElement | undefined;
private spritesReady = false;

  constructor(canvas: HTMLCanvasElement, options: GameEngineOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = options;
    this.loadSprites().then(() => {
  this.spritesReady = true;
  this.init();              // só inicia o jogo depois que as imagens carregarem
});
    this.init();
  }
  loadSprites() {
    throw new Error("Method not implemented.");
  }

  private loadSprites(): Promise<void> {
  const load = (src: string) =>
    new Promise<HTMLImageElement>(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });

  return Promise.all([
    load('./public/assets/images/old/player.png'),
    load('./public/assets/images/old/virus.png'),
    load('./public/assets/images/old/hash.png')
  ]).then(([p, v, h]) => {
    this.playerImg = p;
    this.virusImg  = v;
    this.hashImg   = h;
  });
}
  private init() {
    // Inicializar o jogo
    this.mazeRows = 6 + (this.level - 1);
    this.mazeCols = 6 + (this.level - 1);
    this.maze = generateMaze(this.mazeRows, this.mazeCols);
    // Definir posições iniciais
    this.playerPos = { row: 1, col: 1 };
    this.virusPos = { row: this.mazeRows - 2, col: this.mazeCols - 2 };
    this.generateHashes();
    this.collectedHashes = 0;
    this.totalHashes = this.hashPositions.length;
    this.virusHistory = [];
    this.lastMoveTime = 0;
    this.keyQueue = [];
    this.setupEventListeners();
    this.startGameLoop();
  }

  private generateHashes() {
    // Gera hashes em dead-ends ou posições aleatórias, evitando player e vírus
    const minHashes = 4;
    const hashes = minHashes + (this.level - 1); // 4, 5, 6, ...
    const positions: { row: number, col: number }[] = [];
    const forbidden = [JSON.stringify(this.playerPos), JSON.stringify(this.virusPos)];
    while (positions.length < hashes) {
      const row = Math.floor(Math.random() * this.mazeRows);
      const col = Math.floor(Math.random() * this.mazeCols);
      const posStr = JSON.stringify({ row, col });
      if (
        !forbidden.includes(posStr) &&
        !positions.some(p => p.row === row && p.col === col) &&
        !(row === 0 || col === 0 || row === this.mazeRows - 1 || col === this.mazeCols - 1)
      ) {
        positions.push({ row, col });
      }
    }
    this.hashPositions = positions;
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "w", "arrowdown", "s", "arrowleft", "a", "arrowright", "d"].includes(key)) {
      event.preventDefault();
      this.keyQueue.push(key);
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    // Não é necessário para movimentação simples
  };

  private movePlayer(direction: string) {
    if (!this.maze) return;
    const { row, col } = this.playerPos;
    let newRow = row, newCol = col;
    if ((direction === 'arrowup' || direction === 'w') && !this.maze.walls[row][col][0]) newRow--;
    if ((direction === 'arrowdown' || direction === 's') && !this.maze.walls[row][col][2]) newRow++;
    if ((direction === 'arrowleft' || direction === 'a') && !this.maze.walls[row][col][3]) newCol--;
    if ((direction === 'arrowright' || direction === 'd') && !this.maze.walls[row][col][1]) newCol++;
    // Verifica se a nova posição é válida
    if (newRow >= 0 && newRow < this.mazeRows && newCol >= 0 && newCol < this.mazeCols) {
      this.playerPos = { row: newRow, col: newCol };
      this.checkHashCollection();
    }
  }

  private checkHashCollection() {
    const idx = this.hashPositions.findIndex(h => h.row === this.playerPos.row && h.col === this.playerPos.col);
    if (idx !== -1) {
      this.hashPositions.splice(idx, 1);
      this.collectedHashes++;
      if (this.options.onHashCollected) this.options.onHashCollected();
      this.pause(); // Pausa ao mostrar dica
      if (this.collectedHashes >= this.totalHashes) {
        // Fase completa
        if (this.onNextLevel) this.onNextLevel();
      }
    }
  }

  private moveVirus() {
    if (!this.maze) return;
    const { row, col } = this.virusPos;
    const directions = [
      { dr: -1, dc: 0, wall: 0, name: 'up' },
      { dr: 1, dc: 0, wall: 2, name: 'down' },
      { dr: 0, dc: -1, wall: 3, name: 'left' },
      { dr: 0, dc: 1, wall: 1, name: 'right' }
    ];
    // Histórico de posições
    if (!this.virusPosHistory.length || this.virusPosHistory[0].row !== row || this.virusPosHistory[0].col !== col) {
      this.virusPosHistory.unshift({ row, col });
      if (this.virusPosHistory.length > 6) this.virusPosHistory.pop();
    }
    // Filtra movimentos possíveis que não voltam para as últimas 6 posições
    let filtered = directions.filter(d => {
      const next = { row: row + d.dr, col: col + d.dc };
      return !this.maze!.walls[row][col][d.wall] && !this.virusPosHistory.some(h => h.row === next.row && h.col === next.col);
    });
    if (filtered.length === 0) {
      // Se não houver opção, pode ir para qualquer célula possível
      filtered = directions.filter(d => !this.maze!.walls[row][col][d.wall]);
    }
    // Prioriza aproximação do player
    const playerRow = this.playerPos.row;
    const playerCol = this.playerPos.col;
    filtered.sort((a, b) => {
      const distA = Math.abs((row + a.dr) - playerRow) + Math.abs((col + a.dc) - playerCol);
      const distB = Math.abs((row + b.dr) - playerRow) + Math.abs((col + b.dc) - playerCol);
      return distA - distB;
    });
    // 60% de chance de escolher o melhor movimento, 40% aleatório
    let move;
    if (Math.random() < 0.6) {
      move = filtered[0];
    } else {
      move = filtered[Math.floor(Math.random() * filtered.length)];
    }
    this.virusPos = { row: row + move.dr, col: col + move.dc };
  }

  private checkPlayerCaught() {
    if (this.playerPos.row === this.virusPos.row && this.playerPos.col === this.virusPos.col) {
      // Game over
      this.options.onGameOver('O vírus pegou você!');
    }
  }

  private startGameLoop() {
    const gameLoop = (timestamp: number) => {
      if (this.paused) {
        this.gameLoop = requestAnimationFrame(gameLoop);
        return;
      }
      if (!this.lastTime) this.lastTime = timestamp;
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      // Movimentação do player
      if (this.keyQueue.length > 0) {
        this.movePlayer(this.keyQueue.shift()!);
      }
      // Movimentação do vírus
      this.lastMoveTime += deltaTime;
      if (this.lastMoveTime > this.moveInterval) {
        this.moveVirus();
        this.lastMoveTime = 0;
      }
      this.update(deltaTime);
      this.render();
      this.checkPlayerCaught();
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    this.gameLoop = requestAnimationFrame(gameLoop);
  }

  private update(deltaTime: number) {
    // Atualizar estado do jogo
    this.gameTime += deltaTime;
    this.updateGameState();
  }

  private render() {
    // Limpar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Desenhar o labirinto
    if (this.maze) {
      const cellSize = this.canvas.width / this.maze.cols;
      drawMaze(this.ctx, this.maze, cellSize);
      // Player
this.ctx.drawImage(
  this.playerImg,
  this.playerPos.col * cellSize + cellSize * 0.1,
  this.playerPos.row * cellSize + cellSize * 0.1,
  cellSize * 0.8,
  cellSize * 0.8
);
      this.ctx.fill();
      // Hashes
for (const hash of this.hashPositions) {
  this.ctx.drawImage(
    this.hashImg,
    hash.col * cellSize + cellSize * 0.2,
    hash.row * cellSize + cellSize * 0.2,
    cellSize * 0.6,
    cellSize * 0.6
  );
}
      // Vírus
this.ctx.drawImage(
  this.virusImg,
  this.virusPos.col * cellSize + cellSize * 0.1,
  this.virusPos.row * cellSize + cellSize * 0.1,
  cellSize * 0.8,
  cellSize * 0.8
);
      this.ctx.fill();
    }
    // Aqui você pode desenhar outros elementos do jogo.
  }

  private updateGameState() {
    this.options.onGameStateChange({
      level: this.level,
      hashes: this.collectedHashes,
      totalHashes: this.totalHashes,
      status: 'Jogando',
      time: this.formatTime(this.gameTime)
    });
  }

  private formatTime(time: number): string {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  public cleanup() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  // Função para avançar de fase
  public nextLevel() {
    this.level++;
    this.cleanup();
    this.init();
  }

  // Permitir integração do botão de próxima fase
  public setOnNextLevel(fn: () => void) {
    this.onNextLevel = fn;
  }

  // Para integração com controles virtuais (mobile)
  public movePlayerExternally(direction: string) {
    this.movePlayer(direction);
  }

  public pause() {
    this.paused = true;
  }
  public resume() {
    this.paused = false;
  }
} 