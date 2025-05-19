/**
 * Touch controls implementation with virtual joystick
 */

export class TouchControls {
  constructor(canvas, onMove) {
    this.canvas = canvas;
    this.onMove = onMove;
    this.isActive = false;
    this.joystickBase = null;
    this.joystickHandle = null;
    this.baseX = 0;
    this.baseY = 0;
    this.handleX = 0;
    this.handleY = 0;
    this.maxDistance = 50; // Maximum distance the joystick handle can move
    this.touchId = null;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (this.isMobile) {
      this.init();
    }
  }

  init() {
    // Create joystick elements
    this.joystickBase = document.createElement('div');
    this.joystickHandle = document.createElement('div');

    // Style joystick base
    this.joystickBase.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 30px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      display: none;
      z-index: 1000;
      touch-action: none;
    `;

    // Style joystick handle
    this.joystickHandle.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      touch-action: none;
    `;

    // Add handle to base
    this.joystickBase.appendChild(this.joystickHandle);
    document.body.appendChild(this.joystickBase);

    // Add touch event listeners
    this.joystickBase.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.joystickBase.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.joystickBase.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.joystickBase.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

    // Show joystick on mobile devices
    this.joystickBase.style.display = 'block';
  }

  handleTouchStart(e) {
    if (this.touchId !== null) return;
    
    const touch = e.touches[0];
    this.touchId = touch.identifier;
    this.isActive = true;

    // Get joystick base position
    const rect = this.joystickBase.getBoundingClientRect();
    this.baseX = rect.left + rect.width / 2;
    this.baseY = rect.top + rect.height / 2;

    // Update handle position
    this.updateHandlePosition(touch.clientX, touch.clientY);
  }

  handleTouchMove(e) {
    if (!this.isActive) return;

    // Find the touch that started the joystick movement
    const touch = Array.from(e.touches).find(t => t.identifier === this.touchId);
    if (!touch) return;

    // Update handle position
    this.updateHandlePosition(touch.clientX, touch.clientY);
  }

  handleTouchEnd(e) {
    if (!this.isActive) return;

    // Check if our touch ended
    const touch = Array.from(e.changedTouches).find(t => t.identifier === this.touchId);
    if (!touch) return;

    // Reset joystick
    this.isActive = false;
    this.touchId = null;
    this.handleX = 0;
    this.handleY = 0;
    this.joystickHandle.style.transform = 'translate(-50%, -50%)';
    
    // Notify movement stopped
    this.onMove(null);
  }

  updateHandlePosition(clientX, clientY) {
    // Calculate distance and angle
    const dx = clientX - this.baseX;
    const dy = clientY - this.baseY;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), this.maxDistance);
    const angle = Math.atan2(dy, dx);

    // Update handle position
    this.handleX = Math.cos(angle) * distance;
    this.handleY = Math.sin(angle) * distance;
    this.joystickHandle.style.transform = `translate(calc(-50% + ${this.handleX}px), calc(-50% + ${this.handleY}px))`;

    // Calculate direction based on angle
    let direction = null;
    if (distance > 10) { // Dead zone
      if (angle > -Math.PI/4 && angle <= Math.PI/4) {
        direction = 'right';
      } else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) {
        direction = 'down';
      } else if (angle > 3*Math.PI/4 || angle <= -3*Math.PI/4) {
        direction = 'left';
      } else {
        direction = 'up';
      }
    }

    // Notify movement
    this.onMove(direction);
  }

  destroy() {
    if (this.joystickBase) {
      this.joystickBase.remove();
    }
  }
} 