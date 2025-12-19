(function() {
  const sonicImage = new Image();

  // Primary source: hosted URL
  sonicImage.src = "https://img.sanishtech.com/u/c3b956ea084c41e06a7f1557ed7ae57d.png";

  // Fallback: local packaged icon.png if URL fails
  sonicImage.onerror = function() {
    console.warn("Failed to load Sonic from URL, using local icon.png instead.");
    sonicImage.src = chrome.runtime.getURL("icon.png");
  };

  const FRAME_WIDTH = 64;
  const FRAME_HEIGHT = 64;
  const TOTAL_FRAMES = 6;
  const FRAME_ROW = 0;

  let currentFrame = 0;
  let lastUpdateTime = 0;
  const FRAME_INTERVAL = 100;

  function getRunner() {
    return window.Runner && window.Runner.instance_;
  }

  function initCanvas() {
    const runner = getRunner();
    if (!runner) return null;
    return runner.canvas.getContext("2d");
  }

  function getPosition() {
    const runner = getRunner();
    if (!runner) return { x: 0, y: 0 };
    return { x: runner.tRex.xPos, y: runner.tRex.yPos };
  }

  function clearArea(ctx, pos) {
    ctx.clearRect(pos.x, pos.y, FRAME_WIDTH, FRAME_HEIGHT);
  }

  function drawFrame(ctx, pos) {
    ctx.drawImage(
      sonicImage,
      currentFrame * FRAME_WIDTH, FRAME_ROW, FRAME_WIDTH, FRAME_HEIGHT,
      pos.x, pos.y, FRAME_WIDTH, FRAME_HEIGHT
    );
  }

  function updateFrame(timestamp) {
    if (timestamp - lastUpdateTime > FRAME_INTERVAL) {
      currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
      lastUpdateTime = timestamp;
    }
  }

  function animate(timestamp) {
    const ctx = initCanvas();
    const pos = getPosition();
    if (!ctx) {
      requestAnimationFrame(animate);
      return;
    }
    clearArea(ctx, pos);
    drawFrame(ctx, pos);
    updateFrame(timestamp);
    requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (getRunner()) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(startAnimation, 500);
    }
  }

  sonicImage.onload = function() {
    startAnimation();
  };
})();
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