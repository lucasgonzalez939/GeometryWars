// Game 5: Polygon Platformer
const Game5 = {
  player: {
    x: 100,
    y: 400,
    width: 24,
    height: 24,
    vx: 0,
    vy: 0,
    speed: 250,
    jumpPower: 400,
    onGround: false,
    shape: 'square', // can be 'square', 'circle', 'triangle'
    color: '#4CAF50'
  },
  platforms: [],
  collectibles: [],
  enemies: [],
  gravity: 900,
  level: 1,
  score: 0,
  lives: 3,
  ended: false,
  resultMessage: '',
  _resultTouchDown: false,
  _keyState: {},
  _leftPressed: false,
  _rightPressed: false,
  _jumpPressed: false,
  invulnerableTime: 0, // Add invincibility period

  onEnter: function(params) {
    this.level = (params && params.level) || 1;
    this.score = 0;
    this.lives = 3;
    this.ended = false;
    this.resultMessage = '';
    this._resultTouchDown = false;
    this._keyState = {};
    this._leftPressed = false;
    this._rightPressed = false;
    this._jumpPressed = false;
    this.invulnerableTime = 0;
    
    // Reset player - start above ground level
    this.player.x = 100;
    this.player.y = Engine.canvas.height - 100; // Start well above ground
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = false;
    
    this.generateLevel(this.level);
  },

  onExit: function() {
    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
  },

  generateLevel: function(level) {
    console.log('Generating level:', level); // Debug
    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
    
    const w = Engine.canvas.width;
    const h = Engine.canvas.height;
    
    // Always add ground platform
    this.platforms.push({
      x: 0,
      y: h - 20,
      width: w,
      height: 20,
      type: 'ground',
      color: '#8B4513'
    });

    // Level-specific designs (1-20)
    switch(level) {
      case 1: // Tutorial - Simple jumps
        this.addPlatform(200, h - 100, 120, 20);
        this.addPlatform(400, h - 160, 120, 20);
        this.addPlatform(600, h - 100, 120, 20);
        this.addCollectible(250, h - 125, 'square');
        this.addCollectible(450, h - 185, 'circle');
        break;

      case 2: // Stairs up
        this.addPlatform(150, h - 80, 100, 20);
        this.addPlatform(300, h - 130, 100, 20);
        this.addPlatform(450, h - 180, 100, 20);
        this.addPlatform(600, h - 230, 100, 20);
        this.addCollectible(175, h - 105, 'triangle');
        this.addCollectible(475, h - 205, 'square');
        this.addCollectible(625, h - 255, 'circle');
        break;

      case 3: // Gap jumping
        this.addPlatform(120, h - 120, 80, 20);
        this.addPlatform(280, h - 120, 80, 20);
        this.addPlatform(440, h - 120, 80, 20);
        this.addPlatform(600, h - 120, 80, 20);
        this.addCollectible(320, h - 145, 'square');
        this.addCollectible(480, h - 145, 'circle');
        break;

      case 4: // High tower
        this.addPlatform(350, h - 80, 100, 20);
        this.addPlatform(350, h - 140, 100, 20);
        this.addPlatform(350, h - 200, 100, 20);
        this.addPlatform(350, h - 260, 100, 20);
        this.addCollectible(375, h - 105, 'triangle');
        this.addCollectible(375, h - 285, 'circle');
        this.addEnemy(375, h - 165, 80, 'square');
        break;

      case 5: // Moving platforms concept (static for now)
        this.addPlatform(100, h - 100, 80, 20);
        this.addPlatform(250, h - 140, 60, 20);
        this.addPlatform(400, h - 120, 60, 20);
        this.addPlatform(550, h - 160, 80, 20);
        this.addPlatform(700, h - 100, 80, 20);
        this.addCollectible(280, h - 165, 'square');
        this.addCollectible(430, h - 145, 'triangle');
        this.addEnemy(130, h - 125, 60, 'circle');
        break;

      case 6: // Narrow gaps
        this.addPlatform(120, h - 120, 60, 20);
        this.addPlatform(220, h - 160, 50, 20);
        this.addPlatform(320, h - 140, 50, 20);
        this.addPlatform(420, h - 180, 50, 20);
        this.addPlatform(520, h - 120, 60, 20);
        this.addPlatform(650, h - 200, 80, 20);
        this.addCollectible(245, h - 185, 'circle');
        this.addCollectible(445, h - 205, 'triangle');
        this.addCollectible(675, h - 225, 'square');
        this.addEnemy(345, h - 165, 40, 'square');
        break;

      case 7: // Pyramid
        this.addPlatform(350, h - 80, 100, 20);
        this.addPlatform(300, h - 130, 80, 20);
        this.addPlatform(420, h - 130, 80, 20);
        this.addPlatform(250, h - 180, 60, 20);
        this.addPlatform(370, h - 180, 60, 20);
        this.addPlatform(490, h - 180, 60, 20);
        this.addPlatform(350, h - 230, 100, 20);
        this.addCollectible(375, h - 255, 'circle');
        this.addEnemy(325, h - 155, 60, 'triangle');
        this.addEnemy(445, h - 155, 60, 'triangle');
        break;

      case 8: // Long jumps
        this.addPlatform(100, h - 150, 80, 20);
        this.addPlatform(350, h - 180, 70, 20);
        this.addPlatform(600, h - 140, 80, 20);
        this.addCollectible(125, h - 175, 'square');
        this.addCollectible(375, h - 205, 'triangle');
        this.addCollectible(625, h - 165, 'circle');
        this.addEnemy(385, h - 205, 50, 'square');
        break;

      case 9: // Maze-like
        this.addPlatform(100, h - 100, 60, 20);
        this.addPlatform(200, h - 180, 60, 20);
        this.addPlatform(300, h - 120, 60, 20);
        this.addPlatform(400, h - 200, 60, 20);
        this.addPlatform(500, h - 140, 60, 20);
        this.addPlatform(600, h - 220, 60, 20);
        this.addPlatform(700, h - 160, 60, 20);
        this.addCollectible(225, h - 205, 'triangle');
        this.addCollectible(425, h - 225, 'square');
        this.addCollectible(625, h - 245, 'circle');
        this.addEnemy(325, h - 145, 50, 'circle');
        this.addEnemy(525, h - 165, 50, 'square');
        break;

      case 10: // Boss level - Central tower with enemies
        this.addPlatform(350, h - 80, 100, 20);
        this.addPlatform(320, h - 140, 60, 20);
        this.addPlatform(420, h - 140, 60, 20);
        this.addPlatform(350, h - 200, 100, 20);
        this.addPlatform(300, h - 260, 50, 20);
        this.addPlatform(450, h - 260, 50, 20);
        this.addPlatform(375, h - 320, 50, 20);
        this.addCollectible(375, h - 345, 'circle');
        this.addEnemy(345, h - 165, 70, 'triangle');
        this.addEnemy(425, h - 165, 70, 'triangle');
        this.addEnemy(325, h - 285, 40, 'square');
        this.addEnemy(475, h - 285, 40, 'square');
        break;

      case 11: // Precision jumps
        this.addPlatform(120, h - 120, 40, 20);
        this.addPlatform(200, h - 160, 35, 20);
        this.addPlatform(280, h - 140, 35, 20);
        this.addPlatform(360, h - 180, 35, 20);
        this.addPlatform(440, h - 160, 35, 20);
        this.addPlatform(520, h - 200, 40, 20);
        this.addPlatform(620, h - 140, 60, 20);
        this.addCollectible(217, h - 185, 'square');
        this.addCollectible(377, h - 205, 'triangle');
        this.addCollectible(650, h - 165, 'circle');
        this.addEnemy(457, h - 185, 30, 'circle');
        break;

      case 12: // Double tower
        this.addPlatform(200, h - 80, 80, 20);
        this.addPlatform(200, h - 140, 80, 20);
        this.addPlatform(200, h - 200, 80, 20);
        this.addPlatform(500, h - 100, 80, 20);
        this.addPlatform(500, h - 160, 80, 20);
        this.addPlatform(500, h - 220, 80, 20);
        this.addPlatform(350, h - 280, 100, 20);
        this.addCollectible(225, h - 225, 'square');
        this.addCollectible(525, h - 245, 'triangle');
        this.addCollectible(375, h - 305, 'circle');
        this.addEnemy(225, h - 165, 60, 'square');
        this.addEnemy(525, h - 185, 60, 'triangle');
        break;

      case 13: // Zigzag challenge
        this.addPlatform(100, h - 100, 60, 20);
        this.addPlatform(250, h - 160, 50, 20);
        this.addPlatform(150, h - 220, 50, 20);
        this.addPlatform(350, h - 280, 50, 20);
        this.addPlatform(200, h - 340, 50, 20);
        this.addPlatform(450, h - 400, 60, 20);
        this.addPlatform(600, h - 320, 80, 20);
        this.addCollectible(275, h - 185, 'triangle');
        this.addCollectible(175, h - 245, 'square');
        this.addCollectible(625, h - 345, 'circle');
        this.addEnemy(375, h - 305, 40, 'circle');
        this.addEnemy(225, h - 365, 40, 'square');
        break;

      case 14: // Speed run
        this.addPlatform(120, h - 80, 50, 20);
        this.addPlatform(220, h - 100, 50, 20);
        this.addPlatform(320, h - 120, 50, 20);
        this.addPlatform(420, h - 140, 50, 20);
        this.addPlatform(520, h - 160, 50, 20);
        this.addPlatform(620, h - 180, 50, 20);
        this.addPlatform(720, h - 140, 60, 20);
        this.addCollectible(245, h - 125, 'square');
        this.addCollectible(445, h - 165, 'triangle');
        this.addCollectible(645, h - 205, 'circle');
        this.addEnemy(345, h - 145, 40, 'circle');
        this.addEnemy(545, h - 185, 40, 'square');
        this.addEnemy(745, h - 165, 50, 'triangle');
        break;

      case 15: // Gauntlet
        this.addPlatform(100, h - 120, 60, 20);
        this.addPlatform(200, h - 180, 40, 20);
        this.addPlatform(300, h - 120, 40, 20);
        this.addPlatform(400, h - 200, 40, 20);
        this.addPlatform(500, h - 140, 40, 20);
        this.addPlatform(600, h - 220, 40, 20);
        this.addPlatform(700, h - 160, 60, 20);
        this.addCollectible(220, h - 205, 'triangle');
        this.addCollectible(420, h - 225, 'square');
        this.addCollectible(720, h - 185, 'circle');
        this.addEnemy(125, h - 145, 50, 'square');
        this.addEnemy(320, h - 145, 30, 'circle');
        this.addEnemy(520, h - 165, 30, 'triangle');
        this.addEnemy(620, h - 245, 30, 'square');
        break;

      case 16: // Spiral ascent
        this.addPlatform(150, h - 80, 80, 20);
        this.addPlatform(300, h - 120, 70, 20);
        this.addPlatform(500, h - 160, 70, 20);
        this.addPlatform(600, h - 220, 60, 20);
        this.addPlatform(450, h - 280, 60, 20);
        this.addPlatform(250, h - 340, 60, 20);
        this.addPlatform(100, h - 400, 70, 20);
        this.addPlatform(350, h - 460, 100, 20);
        this.addCollectible(175, h - 105, 'square');
        this.addCollectible(525, h - 185, 'triangle');
        this.addCollectible(275, h - 365, 'circle');
        this.addCollectible(375, h - 485, 'square');
        this.addEnemy(325, h - 145, 50, 'triangle');
        this.addEnemy(475, h - 305, 40, 'circle');
        this.addEnemy(125, h - 425, 50, 'square');
        break;

      case 17: // Micro platforms
        this.addPlatform(120, h - 100, 30, 20);
        this.addPlatform(180, h - 140, 25, 20);
        this.addPlatform(240, h - 180, 25, 20);
        this.addPlatform(300, h - 220, 25, 20);
        this.addPlatform(360, h - 180, 25, 20);
        this.addPlatform(420, h - 140, 25, 20);
        this.addPlatform(480, h - 180, 25, 20);
        this.addPlatform(540, h - 220, 25, 20);
        this.addPlatform(600, h - 260, 30, 20);
        this.addPlatform(700, h - 200, 60, 20);
        this.addCollectible(192, h - 165, 'square');
        this.addCollectible(312, h - 245, 'triangle');
        this.addCollectible(552, h - 245, 'circle');
        this.addCollectible(720, h - 225, 'square');
        this.addEnemy(252, h - 205, 20, 'circle');
        this.addEnemy(432, h - 165, 20, 'triangle');
        this.addEnemy(492, h - 205, 20, 'square');
        break;

      case 18: // Multi-level complex
        this.addPlatform(100, h - 80, 60, 20);
        this.addPlatform(200, h - 140, 50, 20);
        this.addPlatform(300, h - 200, 50, 20);
        this.addPlatform(450, h - 80, 60, 20);
        this.addPlatform(550, h - 140, 50, 20);
        this.addPlatform(650, h - 200, 50, 20);
        this.addPlatform(750, h - 260, 50, 20);
        this.addPlatform(400, h - 300, 100, 20);
        this.addPlatform(350, h - 380, 50, 20);
        this.addPlatform(450, h - 380, 50, 20);
        this.addPlatform(400, h - 460, 100, 20);
        this.addCollectible(225, h - 165, 'triangle');
        this.addCollectible(575, h - 165, 'square');
        this.addCollectible(375, h - 405, 'circle');
        this.addCollectible(425, h - 485, 'triangle');
        this.addEnemy(325, h - 225, 40, 'square');
        this.addEnemy(675, h - 225, 40, 'triangle');
        this.addEnemy(425, h - 325, 60, 'circle');
        this.addEnemy(475, h - 405, 30, 'square');
        break;

      case 19: // The climb
        this.addPlatform(350, h - 60, 100, 20);
        this.addPlatform(250, h - 120, 50, 20);
        this.addPlatform(450, h - 120, 50, 20);
        this.addPlatform(150, h - 180, 40, 20);
        this.addPlatform(350, h - 180, 40, 20);
        this.addPlatform(550, h - 180, 40, 20);
        this.addPlatform(300, h - 240, 40, 20);
        this.addPlatform(400, h - 240, 40, 20);
        this.addPlatform(200, h - 300, 35, 20);
        this.addPlatform(350, h - 300, 35, 20);
        this.addPlatform(500, h - 300, 35, 20);
        this.addPlatform(275, h - 360, 30, 20);
        this.addPlatform(425, h - 360, 30, 20);
        this.addPlatform(350, h - 420, 100, 20);
        this.addCollectible(275, h - 145, 'square');
        this.addCollectible(170, h - 205, 'triangle');
        this.addCollectible(320, h - 265, 'circle');
        this.addCollectible(290, h - 385, 'square');
        this.addCollectible(375, h - 445, 'triangle');
        this.addEnemy(375, h - 85, 70, 'triangle');
        this.addEnemy(370, h - 205, 30, 'circle');
        this.addEnemy(217, h - 325, 25, 'square');
        this.addEnemy(367, h - 325, 25, 'triangle');
        this.addEnemy(440, h - 385, 25, 'circle');
        break;

      case 20: // Final boss level
        this.addPlatform(350, h - 80, 100, 20);
        this.addPlatform(200, h - 140, 60, 20);
        this.addPlatform(500, h - 140, 60, 20);
        this.addPlatform(100, h - 200, 50, 20);
        this.addPlatform(350, h - 200, 50, 20);
        this.addPlatform(600, h - 200, 50, 20);
        this.addPlatform(250, h - 260, 40, 20);
        this.addPlatform(450, h - 260, 40, 20);
        this.addPlatform(350, h - 320, 60, 20);
        this.addPlatform(200, h - 380, 30, 20);
        this.addPlatform(400, h - 380, 30, 20);
        this.addPlatform(550, h - 380, 30, 20);
        this.addPlatform(350, h - 440, 80, 20);
        this.addPlatform(300, h - 500, 30, 20);
        this.addPlatform(420, h - 500, 30, 20);
        this.addPlatform(375, h - 560, 50, 20);
        this.addCollectible(225, h - 165, 'square');
        this.addCollectible(525, h - 165, 'triangle');
        this.addCollectible(125, h - 225, 'circle');
        this.addCollectible(270, h - 285, 'square');
        this.addCollectible(375, h - 345, 'triangle');
        this.addCollectible(215, h - 405, 'circle');
        this.addCollectible(375, h - 465, 'square');
        this.addCollectible(400, h - 585, 'circle');
        this.addEnemy(375, h - 105, 80, 'triangle');
        this.addEnemy(230, h - 165, 50, 'square');
        this.addEnemy(530, h - 165, 50, 'circle');
        this.addEnemy(370, h - 225, 40, 'triangle');
        this.addEnemy(270, h - 285, 30, 'square');
        this.addEnemy(470, h - 285, 30, 'circle');
        this.addEnemy(380, h - 345, 50, 'triangle');
        this.addEnemy(315, h - 525, 25, 'square');
        this.addEnemy(435, h - 525, 25, 'circle');
        break;

      default: // Fallback for levels beyond 20
        const platCount = Math.min(8, 4 + Math.floor(level / 3));
        for (let i = 0; i < platCount; i++) {
          const x = 100 + (i * (w - 200) / platCount);
          const y = h - 100 - Math.random() * 200;
          const width = 60 + Math.random() * 40;
          this.addPlatform(x, y, width, 20);
          if (Math.random() < 0.6) {
            this.addCollectible(x + width/2 - 10, y - 25, ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)]);
          }
          if (i > 0 && Math.random() < 0.4) {
            this.addEnemy(x + width/2 - 15, y - 25, 30 + Math.random() * 20, ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)]);
          }
        }
    }
  },

  addPlatform: function(x, y, width, height) {
    this.platforms.push({
      x: x,
      y: y,
      width: width,
      height: height,
      type: 'platform',
      color: '#666'
    });
  },

  addCollectible: function(x, y, shape) {
    const colors = { square: '#FFD700', circle: '#00CED1', triangle: '#FF6347' };
    this.collectibles.push({
      x: x,
      y: y,
      width: 20,
      height: 20,
      shape: shape,
      color: colors[shape],
      collected: false,
      bobOffset: Math.random() * Math.PI * 2
    });
  },

  addEnemy: function(x, y, platformWidth, shape) {
    const colors = { square: '#DC143C', circle: '#8B0000', triangle: '#B22222' };
    this.enemies.push({
      x: x,
      y: y,
      width: 20,
      height: 20,
      shape: shape,
      color: colors[shape],
      vx: 50 + Math.random() * 30, // Random speed between 50-80
      platformX: x - platformWidth/2 + 10,
      platformWidth: platformWidth - 20 // Keep some margin
    });
  },

  _isKeyDown: function(key) {
    return !!(Engine.keys[key] || Engine.codes[key]);
  },

  _isKeyJustPressed: function(key) {
    const down = this._isKeyDown(key);
    const prev = !!this._keyState[key];
    this._keyState[key] = down;
    return down && !prev;
  },

  update: function(deltaTime) {
    if (this.ended) {
      // Handle keyboard shortcuts
      if (Engine.keys['r'] || Engine.keys['R'] || Engine.codes['KeyR']) {
        this._onRestart();
        return;
      }
      if (Engine.keys['m'] || Engine.keys['M'] || Engine.codes['KeyM']) {
        this._onMainMenu();
        return;
      }
      if ((Engine.keys['n'] || Engine.keys['N'] || Engine.codes['KeyN']) && this.canAdvanceLevel) {
        this._onNextLevel();
        return;
      }
      
      // Handle touch input
      if (Engine.touch.isDown && !this._resultTouchDown) {
        this._resultTouchDown = true;
        const x = Engine.touch.x, y = Engine.touch.y;
        if (x != null && this._resultButtonRects) {
          ResultScreen.handleInput(x, y, this._resultButtonRects, {
            onRestart: () => this._onRestart(),
            onNextLevel: this.canAdvanceLevel ? () => this._onNextLevel() : null,
            onMainMenu: () => this._onMainMenu()
          });
        }
      }
      if (!Engine.touch.isDown) this._resultTouchDown = false;
      return;
    }

    const player = this.player;
    
    // Update invulnerability
    this.invulnerableTime = Math.max(0, this.invulnerableTime - deltaTime);
    
    // Escape key to return to menu
    if (Engine.keys['Escape'] || Engine.codes['Escape']) {
      this._onMainMenu();
      return;
    }
    
    // Input handling
    const leftDown = this._isKeyDown('ArrowLeft') || this._isKeyDown('KeyA');
    const rightDown = this._isKeyDown('ArrowRight') || this._isKeyDown('KeyD');
    const jumpJustPressed = this._isKeyJustPressed('Space') || this._isKeyJustPressed('ArrowUp');
    
    // Touch controls
    if (Engine.touch.isDown) {
      const tx = Engine.touch.x;
      const ty = Engine.touch.y;
      const centerX = Engine.canvas.width / 2;
      const jumpZone = Engine.canvas.height - 100;
      
      if (ty > jumpZone && !this._jumpPressed) {
        this._jumpPressed = true;
        if (player.onGround) {
          player.vy = -player.jumpPower;
          player.onGround = false;
          Sound.play('success');
        }
      }
      
      if (tx < centerX - 50) {
        this._leftPressed = true;
      } else if (tx > centerX + 50) {
        this._rightPressed = true;
      }
    } else {
      this._jumpPressed = false;
      this._leftPressed = false;
      this._rightPressed = false;
    }
    
    // Movement
    if (leftDown || this._leftPressed) {
      player.vx = -player.speed;
    } else if (rightDown || this._rightPressed) {
      player.vx = player.speed;
    } else {
      player.vx *= 0.8; // friction
    }
    
    // Jumping
    if (jumpJustPressed && player.onGround) {
      player.vy = -player.jumpPower;
      player.onGround = false;
      Sound.play('success');
    }
    
    // Apply gravity
    player.vy += this.gravity * deltaTime;
    
    // Limit fall speed to prevent tunneling
    const maxFallSpeed = 600;
    if (player.vy > maxFallSpeed) {
      player.vy = maxFallSpeed;
    }
    
    // Store previous position for collision detection
    const prevY = player.y;
    
    // Update position
    player.x += player.vx * deltaTime;
    player.y += player.vy * deltaTime;
    
    // Keep player in bounds horizontally
    player.x = Math.max(0, Math.min(Engine.canvas.width - player.width, player.x));
    
    // Platform collision - improved with better detection
    player.onGround = false;
    for (const platform of this.platforms) {
      // Check if player overlaps horizontally with platform
      if (player.x + player.width > platform.x && 
          player.x < platform.x + platform.width) {
        
        // Check vertical collision - landing on top
        if (player.vy >= 0 && // Player is falling
            prevY + player.height <= platform.y + 5 && // Was above platform (with small tolerance)
            player.y + player.height >= platform.y) { // Now intersecting or below
          
          // Place player exactly on top of platform
          player.y = platform.y - player.height;
          player.vy = 0;
          player.onGround = true;
          break; // Stop checking other platforms
        }
        
        // Additional safety check - if player is somehow inside platform, push them up
        if (player.y + player.height > platform.y && 
            player.y < platform.y + platform.height) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.onGround = true;
          break;
        }
      }
    }
    
    // Collectible collision
    for (const collectible of this.collectibles) {
      if (!collectible.collected &&
          player.x < collectible.x + collectible.width &&
          player.x + player.width > collectible.x &&
          player.y < collectible.y + collectible.height &&
          player.y + player.height > collectible.y) {
        
        collectible.collected = true;
        this.score += 10;
        ParticleSystem.spawnBurst(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.shape);
        Sound.play('success');
      }
    }
    
    // Enemy updates and collision
    for (const enemy of this.enemies) {
      enemy.x += enemy.vx * deltaTime;
      
      // Bounce off platform edges
      if (enemy.x <= enemy.platformX || enemy.x >= enemy.platformX + enemy.platformWidth - enemy.width) {
        enemy.vx *= -1;
      }
      
      // Player collision with enemy - only if not invulnerable
      if (this.invulnerableTime <= 0 &&
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y) {
        
        this.lives--;
        this.invulnerableTime = 2.0; // 2 seconds of invulnerability
        // Knockback
        player.vx = (player.x < enemy.x) ? -300 : 300;
        player.vy = -200;
        Sound.play('wrong');
        
        if (this.lives <= 0) {
          this._onGameOver();
          return;
        }
      }
    }
    
    // Update collectible animations
    for (const collectible of this.collectibles) {
      collectible.bobOffset += deltaTime * 3;
    }
    
    // Fall off screen = lose life
    if (player.y > Engine.canvas.height + 50) {
      this.lives--;
      this.invulnerableTime = 1.0; // Add invulnerability after respawn
      if (this.lives <= 0) {
        this._onGameOver();
      } else {
        // Reset player position to safe spawn point
        player.x = 100;
        player.y = Engine.canvas.height - 100; // Same as initial spawn
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
        Sound.play('miss');
      }
    }
    
    // Check win condition
    const allCollected = this.collectibles.every(c => c.collected);
    if (allCollected) {
      this._onLevelComplete();
    }
  },

  _onLevelComplete: function() {
    this.ended = true;
    this.canAdvanceLevel = true;
    this.resultMessage = `Level ${this.level} Complete!`;
    Scoring.saveHighScore('game5', 'Player', this.score);
  },

  _onGameOver: function() {
    this.ended = true;
    this.canAdvanceLevel = false;
    this.resultMessage = 'Game Over';
  },

  _onRestart: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.restartLevel();
  },

  _onNextLevel: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.startNextLevel();
  },

  _onMainMenu: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.returnToMenu();
  },

  _drawShape: function(ctx, shape, x, y, size, color) {
    ctx.fillStyle = color;
    switch (shape) {
      case 'square':
        ctx.fillRect(x, y, size, size);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
        break;
    }
  },

  render: function(ctx) {
    ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Platforms
    for (const platform of this.platforms) {
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Collectibles
    for (const collectible of this.collectibles) {
      if (!collectible.collected) {
        const bobY = collectible.y + Math.sin(collectible.bobOffset) * 3;
        this._drawShape(ctx, collectible.shape, collectible.x, bobY, collectible.width, collectible.color);
      }
    }
    
    // Enemies
    for (const enemy of this.enemies) {
      this._drawShape(ctx, enemy.shape, enemy.x, enemy.y, enemy.width, enemy.color);
    }
    
    // Player - flash during invulnerability
    if (this.invulnerableTime <= 0 || Math.floor(this.invulnerableTime * 8) % 2 === 0) {
      this._drawShape(ctx, this.player.shape, this.player.x, this.player.y, this.player.width, this.player.color);
    }
    
    // Particles
    ParticleSystem.updateAndRender(ctx, 0.016);
    
    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Level: ${this.level}`, 12, 22);
    ctx.fillText(`Score: ${this.score}`, 12, 44);
    ctx.fillText(`Lives: ${this.lives}`, Engine.canvas.width - 110, 22);
    
    // Debug info
    ctx.font = '12px Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Player: x=${Math.floor(this.player.x)}, y=${Math.floor(this.player.y)}, onGround=${this.player.onGround}`, 12, Engine.canvas.height - 55);
    ctx.fillText(`Ground Platform: y=${this.platforms[0] ? this.platforms[0].y : 'NONE'}`, 12, Engine.canvas.height - 40);
    ctx.fillText(`Platforms: ${this.platforms.length}, Player vy: ${Math.floor(this.player.vy)}`, 12, Engine.canvas.height - 25);
    
    // Touch controls hint
    if (Engine.isTouchDevice) {
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Tap left/right to move, bottom to jump', Engine.canvas.width/2, Engine.canvas.height - 10);
      ctx.textAlign = 'left';
    }
    
    // Result overlay
    if (this.ended) {
      this._resultButtonRects = ResultScreen.show(ctx, {
        title: this.canAdvanceLevel ? 'Level Complete!' : 'Game Over',
        message: this.resultMessage,
        score: this.score,
        level: this.level,
        showNextLevel: this.canAdvanceLevel,
        onRestart: () => this._onRestart(),
        onNextLevel: this.canAdvanceLevel ? () => this._onNextLevel() : null,
        onMainMenu: () => this._onMainMenu()
      });
    }
  }
};

window.Game5 = Game5;
