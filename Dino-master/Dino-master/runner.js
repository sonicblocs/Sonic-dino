(function() {
'use strict';

const FPS = 60;
const FRAME_INTERVAL = 100;
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;

class Runner {
  constructor(containerId) {
    this.containerEl = document.querySelector(containerId);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 150;
    this.containerEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.tRex = new Sonic(this.canvas);
    this.playing = false;
    this.crashed = false;

    this.startListening();
    this.update();
  }

  startListening() {
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.tRex.startJump();
      } else if (e.code === 'ArrowDown') {
        this.tRex.setDuck(true);
      }
    });
    document.addEventListener('keyup', e => {
      if (e.code === 'ArrowDown') {
        this.tRex.setDuck(false);
      }
    });
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.tRex.update();
    requestAnimationFrame(this.update.bind(this));
  }
}

class Sonic {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.image = new Image();
    this.image.src = 'sonic.png';

    this.x = 50;
    this.y = 100;
    this.jumping = false;
    this.ducking = false;
    this.crashed = false;

    this.currentFrame = 0;
    this.lastUpdateTime = 0;
  }

  startJump() {
    if (!this.jumping) {
      this.jumping = true;
      setTimeout(() => { this.jumping = false; }, 600);
    }
  }

  setDuck(state) {
    this.ducking = state;
  }

  update() {
    let startFrame = 1;
    let totalFrames = 1;

    if (this.crashed) {
      startFrame = 8; totalFrames = 2; // death frames
    } else if (this.jumping) {
      startFrame = 4; totalFrames = 2; // jump frames
    } else if (this.ducking) {
      startFrame = 6; totalFrames = 2; // duck frames
    } else {
      startFrame = 2; totalFrames = 2; // running frames
    }

    const now = performance.now();
    if (now - this.lastUpdateTime > FRAME_INTERVAL) {
      this.currentFrame = (this.currentFrame + 1) % totalFrames;
      this.lastUpdateTime = now;
    }

    const frameX = startFrame + this.currentFrame;
    this.ctx.drawImage(
      this.image,
      frameX * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT,
      this.x, this.y - FRAME_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT
    );
  }
}

// Start game
window.onload = () => {
  new Runner('#game-container');
};
})();
Trex.prototype.update = function(deltaTime) {
  this.timer += deltaTime;

  // Decide which action set Sonic should use
  let startFrame = 1;
  let totalFrames = 1;

  if (this.crashed) {
    // Death cycle: frames 8–9
    startFrame = 8;
    totalFrames = 2;
  } else if (this.jumping) {
    // Jump cycle: frames 4–5
    startFrame = 4;
    totalFrames = 2;
  } else if (this.ducking) {
    // Duck cycle: frames 6–7
    startFrame = 6;
    totalFrames = 2;
  } else if (this.playingIntro || this.playing) {
    // Running cycle: frames 2–3
    startFrame = 2;
    totalFrames = 2;
  } else {
    // Game start pose: frame 1
    startFrame = 1;
    totalFrames =