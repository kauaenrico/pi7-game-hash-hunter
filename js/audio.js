// Audio elements
let backgroundMusic;
let collectSound;
let gameOverSound;
let levelCompleteSound;
let alarmSound;

// Audio initialized flag
let audioInitialized = false;

/**
 * Initialize audio elements
 */
export function initAudio() {
  if (audioInitialized) return;
  
  // Create audio elements
  backgroundMusic = new Audio();
  collectSound = new Audio();
  gameOverSound = new Audio();
  levelCompleteSound = new Audio();
  alarmSound = new Audio();
  
  // Set audio sources
  // Using placeholder URLs - replace with actual audio files
  backgroundMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-electronic-retro-block-272.mp3';
  collectSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3';
  gameOverSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3';
  levelCompleteSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-completion-of-a-level-2063.mp3';
  alarmSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3';
  
  // Set properties
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  
  // Mark as initialized
  audioInitialized = true;
}

/**
 * Play background music
 */
export function playBackgroundMusic() {
  if (!audioInitialized) return;
  
  // Ensure music is at the beginning
  backgroundMusic.currentTime = 0;
  
  // Play music
  backgroundMusic.play().catch(error => {
    console.log('Audio play failed:', error);
  });
}

/**
 * Stop background music
 */
export function stopBackgroundMusic() {
  if (!audioInitialized) return;
  
  // Pause music
  backgroundMusic.pause();
}

/**
 * Play a sound effect
 * @param {string} soundType - Type of sound ('collect', 'gameOver', 'levelComplete', 'alarm')
 */
export function playSoundEffect(soundType) {
  if (!audioInitialized) return;
  
  let sound;
  
  // Select sound based on type
  switch (soundType) {
    case 'collect':
      sound = collectSound;
      break;
    case 'gameOver':
      sound = gameOverSound;
      break;
    case 'levelComplete':
      sound = levelCompleteSound;
      break;
    case 'alarm':
      sound = alarmSound;
      break;
    default:
      return;
  }
  
  // Ensure sound is at the beginning
  sound.currentTime = 0;
  
  // Play sound
  sound.play().catch(error => {
    console.log('Sound effect play failed:', error);
  });
}

/**
 * Play alarm sound when virus is close to player
 * @param {number} distance - Distance between player and virus
 * @param {number} maxDistance - Maximum distance to consider
 */
export function playProximityAlarm(distance, maxDistance) {
  if (!audioInitialized) return;
  
  // Only play alarm if virus is within range
  if (distance <= maxDistance) {
    // Adjust volume based on distance (closer = louder)
    const volume = 1 - (distance / maxDistance);
    alarmSound.volume = Math.min(1, Math.max(0, volume));
    
    // Play alarm if not already playing
    if (alarmSound.paused) {
      alarmSound.play().catch(error => {
        console.log('Alarm sound play failed:', error);
      });
    }
  } else {
    // Stop alarm if virus is out of range
    alarmSound.pause();
  }
}