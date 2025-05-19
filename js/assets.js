// Configuração dos assets do jogo
export const gameAssets = {
  // Imagens dos elementos do jogo
  images: {
    player: {
      path: 'assets/images/player.png',
      width: 32,
      height: 32
    },
    virus: {
      path: 'assets/images/virus.png',
      width: 32,
      height: 32
    },
    hash: {
      path: 'assets/images/hash.png',
      width: 24,
      height: 24
    }
  }
};

// Cache de imagens
const imageCache = new Map();

// Função para carregar uma imagem
export function loadImage(path) {
  return new Promise((resolve, reject) => {
    if (imageCache.has(path)) {
      resolve(imageCache.get(path));
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${path}`));
    };
    img.src = path;
  });
}

// Função para carregar todas as imagens
export async function loadAllImages() {
  const loadPromises = Object.values(gameAssets.images).map(asset => 
    loadImage(asset.path)
  );
  
  try {
    await Promise.all(loadPromises);
    console.log('All game images loaded successfully');
  } catch (error) {
    console.error('Error loading game images:', error);
  }
}

// Função para obter uma imagem do cache
export function getImage(path) {
  return imageCache.get(path);
} 