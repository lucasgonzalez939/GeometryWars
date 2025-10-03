// Game 6: Galactic Geometry Blaster
const Game6 = {
  playerShip: {
    x: 400,
    y: 500,
    width: 30,
    height: 30,
    speed: 300,
    shape: 'triangle',
    color: '#00FF00',
    health: 100,
    maxHealth: 100
  },
  enemies: [],
  projectiles: [],
  enemyProjectiles: [],
  powerups: [],
  score: 0,
  level: 1,
  lives: 3,
  timeLimit: 180, // 3 minutes for timed mode
  timeLeft: 180,
  mode: 'timed', // 'timed' or 'survival'
  survivalDifficulty: 0,
  targetScore: 500,
  ended: false,
  resultMessage: '',
  _resultTouchDown: false,
  
  // Spawn timers
  enemySpawnTimer: 0,
  enemySpawnInterval: 2.5,
  powerupSpawnTimer: 0,
  powerupSpawnInterval: 12.0,
  
  // Player weapon
  weaponCooldown: 0,
  weaponType: 'normal', // 'normal', 'spread', 'rapid'
  weaponDuration: 0,
  
  // Background stars
  stars: [],

  onEnter: function(params) {
    this.level = (params && params.level) || 1;
    this.mode = (params && params.mode) || 'timed';
    this.timeLimit = (params && params.timeLimit) || 180;
    this.timeLeft = this.timeLimit;
    this.survivalDifficulty = 0;
    this.targetScore = (params && params.targetScore) || (this.mode === 'timed' ? 500 : 1000);
    
    this.score = 0;
    this.lives = 3;
    this.ended = false;
    this.resultMessage = '';
    this._resultTouchDown = false;
    
    // Reset player
    this.playerShip.x = Engine.canvas.width / 2 - this.playerShip.width / 2;
    this.playerShip.y = Engine.canvas.height - 80;
    this.playerShip.health = this.playerShip.maxHealth;
    
    // Reset arrays
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.powerups = [];
    
    // Reset timers
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = Math.max(1.2, 2.5 - this.level * 0.15); // Slower spawn rate
    this.powerupSpawnTimer = 0;
    this.weaponCooldown = 0;
    this.weaponType = 'normal';
    this.weaponDuration = 0;
    
    // Generate background stars
    this.generateStars();
  },

  onExit: function() {
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.powerups = [];
    this.stars = [];
  },

  generateStars: function() {
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * Engine.canvas.width,
        y: Math.random() * Engine.canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 50 + 20
      });
    }
  },

  spawnEnemy: function() {
    const shapes = ['square', 'circle', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = 20 + Math.random() * 20;
    const speed = 80 + Math.random() * 60 + this.level * 10;
    
    let health, color, shootChance;
    switch(shape) {
      case 'square':
        health = 3;
        color = '#ff6b6b';
        shootChance = 0.3;
        break;
      case 'circle':
        health = 2;
        color = '#ffd93d';
        shootChance = 0.5;
        break;
      case 'triangle':
        health = 1;
        color = '#6bc1ff';
        shootChance = 0.7;
        break;
    }
    
    this.enemies.push({
      x: Math.random() * (Engine.canvas.width - size),
      y: -size,
      width: size,
      height: size,
      vx: (Math.random() - 0.5) * 100,
      vy: speed,
      shape: shape,
      color: color,
      health: health,
      maxHealth: health,
      shootTimer: Math.random() * 2,
      shootChance: shootChance
    });
  },

  spawnPowerup: function() {
    const types = ['health', 'spread', 'rapid'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color;
    switch(type) {
      case 'health': color = '#FF69B4'; break;
      case 'spread': color = '#9370DB'; break;
      case 'rapid': color = '#FF4500'; break;
    }
    
    this.powerups.push({
      x: Math.random() * (Engine.canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      vy: 120,
      type: type,
      color: color,
      shape: 'circle',
      bobOffset: Math.random() * Math.PI * 2
    });
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

    const player = this.playerShip;
    
    // Escape key to return to menu
    if (Engine.keys['Escape'] || Engine.codes['Escape']) {
      this._onMainMenu();
      return;
    }
    
    // Player movement
    if (Engine.keys['ArrowLeft'] || Engine.keys['a'] || Engine.keys['A']) {
      player.x = Math.max(0, player.x - player.speed * deltaTime);
    }
    if (Engine.keys['ArrowRight'] || Engine.keys['d'] || Engine.keys['D']) {
      player.x = Math.min(Engine.canvas.width - player.width, player.x + player.speed * deltaTime);
    }
    if (Engine.keys['ArrowUp'] || Engine.keys['w'] || Engine.keys['W']) {
      player.y = Math.max(0, player.y - player.speed * deltaTime);
    }
    if (Engine.keys['ArrowDown'] || Engine.keys['s'] || Engine.keys['S']) {
      player.y = Math.min(Engine.canvas.height - player.height, player.y + player.speed * deltaTime);
    }
    
    // Touch movement
    if (Engine.touch.isDown) {
      const tx = Engine.touch.x, ty = Engine.touch.y;
      if (tx != null && ty != null) {
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const dx = tx - centerX;
        const dy = ty - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          const moveSpeed = Math.min(player.speed, distance * 3);
          player.x += (dx / distance) * moveSpeed * deltaTime;
          player.y += (dy / distance) * moveSpeed * deltaTime;
          
          // Keep in bounds
          player.x = Math.max(0, Math.min(Engine.canvas.width - player.width, player.x));
          player.y = Math.max(0, Math.min(Engine.canvas.height - player.height, player.y));
        }
      }
    }
    
    // Weapon cooldown
    this.weaponCooldown = Math.max(0, this.weaponCooldown - deltaTime);
    this.weaponDuration = Math.max(0, this.weaponDuration - deltaTime);
    
    // Reset weapon type when duration expires
    if (this.weaponDuration <= 0 && this.weaponType !== 'normal') {
      this.weaponType = 'normal';
    }
    
    // Player shooting
    if ((Engine.keys[' '] || Engine.codes['Space'] || Engine.touch.isDown) && this.weaponCooldown <= 0) {
      this.shoot();
    }
    
    // Update background stars
    for (const star of this.stars) {
      star.y += star.speed * deltaTime;
      if (star.y > Engine.canvas.height) {
        star.y = -star.size;
        star.x = Math.random() * Engine.canvas.width;
      }
    }
    
    // Spawn enemies
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
    
    // Spawn powerups
    this.powerupSpawnTimer += deltaTime;
    if (this.powerupSpawnTimer >= this.powerupSpawnInterval) {
      this.spawnPowerup();
      this.powerupSpawnTimer = 0;
    }
    
    // Handle mode-specific logic
    if (this.mode === 'timed') {
      // Countdown timer
      this.timeLeft = Math.max(0, this.timeLeft - deltaTime);
      if (this.timeLeft <= 0) {
        this._endGame(this.score >= this.targetScore, 
          this.score >= this.targetScore ? 'Mission Complete!' : 'Time\'s Up!');
        return;
      }
    } else if (this.mode === 'survival') {
      // Increase difficulty over time
      this.survivalDifficulty += deltaTime * 0.05; // Slower difficulty increase
      this.enemySpawnInterval = Math.max(0.5, 2.5 - this.survivalDifficulty * 0.3);
      this.powerupSpawnInterval = Math.max(8.0, 12.0 - this.survivalDifficulty * 0.5);
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.y += proj.vy * deltaTime;
      
      if (proj.y < -10) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Update enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.y += proj.vy * deltaTime;
      
      if (proj.y > Engine.canvas.height + 10) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.x += enemy.vx * deltaTime;
      enemy.y += enemy.vy * deltaTime;
      
      // Bounce off sides
      if (enemy.x <= 0 || enemy.x >= Engine.canvas.width - enemy.width) {
        enemy.vx *= -1;
      }
      
      // Enemy shooting
      enemy.shootTimer -= deltaTime;
      if (enemy.shootTimer <= 0 && Math.random() < enemy.shootChance * deltaTime) {
        this.enemyProjectiles.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 8,
          vy: 200,
          color: '#FF0000'
        });
        enemy.shootTimer = 1 + Math.random();
      }
      
      // Remove enemies that went off screen
      if (enemy.y > Engine.canvas.height + 50) {
        this.enemies.splice(i, 1);
      }
    }
    
    // Update powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      powerup.y += powerup.vy * deltaTime;
      powerup.bobOffset += deltaTime * 4;
      
      if (powerup.y > Engine.canvas.height + 20) {
        this.powerups.splice(i, 1);
      }
    }
    
    // Check for level completion (score-based) - only in timed mode
    if (this.mode === 'timed') {
      const targetScore = this.targetScore || (50 + (this.level - 1) * 30); // 50, 80, 110, etc.
      if (this.score >= targetScore) {
        this._onLevelComplete();
        return;
      }
    }
    
    // Collision detection
    this.checkCollisions();
  },

  shoot: function() {
    const player = this.playerShip;
    const cooldownTime = this.weaponType === 'rapid' ? 0.1 : 0.2;
    
    switch(this.weaponType) {
      case 'normal':
        this.projectiles.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 10,
          vy: -400,
          color: '#00FF00'
        });
        break;
        
      case 'spread':
        for (let i = -1; i <= 1; i++) {
          this.projectiles.push({
            x: player.x + player.width / 2 - 2 + i * 10,
            y: player.y,
            width: 4,
            height: 8,
            vy: -350,
            vx: i * 50,
            color: '#9370DB'
          });
        }
        break;
        
      case 'rapid':
        this.projectiles.push({
          x: player.x + player.width / 2 - 1,
          y: player.y,
          width: 2,
          height: 8,
          vy: -500,
          color: '#FF4500'
        });
        break;
    }
    
    this.weaponCooldown = cooldownTime;
    Sound.play('success');
  },

  checkCollisions: function() {
    const player = this.playerShip;
    
    // Player projectiles vs enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.isColliding(proj, enemy)) {
          this.projectiles.splice(i, 1);
          enemy.health--;
          
          ParticleSystem.spawnBurst(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.shape);
          
          if (enemy.health <= 0) {
            this.enemies.splice(j, 1);
            this.score += 10;
            Sound.play('success');
          } else {
            Sound.play('wrong');
          }
          break;
        }
      }
    }
    
    // Enemy projectiles vs player
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      
      if (this.isColliding(proj, player)) {
        this.enemyProjectiles.splice(i, 1);
        player.health -= 8; // Reduced from 10
        
        ParticleSystem.spawnBurst(player.x + player.width/2, player.y + player.height/2, 'danger');
        Sound.play('wrong');
        
        if (player.health <= 0) {
          this.lives--;
          if (this.lives <= 0) {
            this._onGameOver();
          } else {
            player.health = player.maxHealth;
            // Brief invincibility could be added here
          }
        }
      }
    }
    
    // Player vs enemies (collision damage)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (this.isColliding(player, enemy)) {
        this.enemies.splice(i, 1);
        player.health -= 15; // Reduced from 20
        
        ParticleSystem.spawnBurst(player.x + player.width/2, player.y + player.height/2, 'danger');
        Sound.play('miss');
        
        if (player.health <= 0) {
          this.lives--;
          if (this.lives <= 0) {
            this._onGameOver();
          } else {
            player.health = player.maxHealth;
          }
        }
      }
    }
    
    // Player vs powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      
      if (this.isColliding(player, powerup)) {
        this.powerups.splice(i, 1);
        this.applyPowerup(powerup.type);
        ParticleSystem.spawnBurst(powerup.x + powerup.width/2, powerup.y + powerup.height/2, 'circle');
        Sound.play('success');
      }
    }
  },

  isColliding: function(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },

  applyPowerup: function(type) {
    switch(type) {
      case 'health':
        this.playerShip.health = Math.min(this.playerShip.maxHealth, this.playerShip.health + 30);
        break;
      case 'spread':
        this.weaponType = 'spread';
        this.weaponDuration = 10;
        break;
      case 'rapid':
        this.weaponType = 'rapid';
        this.weaponDuration = 8;
        break;
    }
  },

  _endGame: function(isWin, message) {
    this.ended = true;
    this.canAdvanceLevel = isWin && this.mode === 'timed';
    this.resultMessage = message || (isWin ? 'Success!' : 'Game Over');
    Scoring.saveHighScore('game6', 'Player', this.score);
  },

  _onLevelComplete: function() {
    this._endGame(true, `Level ${this.level} Complete!`);
  },

  _onGameOver: function() {
    this._endGame(false, 'Game Over');
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

  _handleResultInput: function(x, y) {
    const w = Engine.canvas.width, h = Engine.canvas.height;
    const btnW = 160, btnH = 48;
    const cx = Math.floor(w / 2), by = Math.floor(h / 2) + 30;
    
    const restartRect = { x: cx - btnW - 10, y: by, w: btnW, h: btnH };
    const menuRect = { x: cx + 10, y: by, w: btnW, h: btnH };
    
    if (x >= restartRect.x && x <= restartRect.x + restartRect.w &&
        y >= restartRect.y && y <= restartRect.y + restartRect.h) {
      this.ended = false;
      this._resultTouchDown = false;
      Engine.clearInput && Engine.clearInput();
      Engine.setScene(Game6, { level: this.level });
      return true;
    }
    
    if (x >= menuRect.x && x <= menuRect.x + menuRect.w &&
        y >= menuRect.y && y <= menuRect.y + menuRect.h) {
      this.ended = false;
      this._resultTouchDown = false;
      Engine.clearInput && Engine.clearInput();
      Engine.setScene(GameManager.MenuScene);
      return true;
    }
    
    return false;
  },

  _drawShape: function(ctx, shape, x, y, width, height, color) {
    ctx.fillStyle = color;
    switch (shape) {
      case 'square':
        ctx.fillRect(x, y, width, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        break;
    }
  },

  render: function(ctx) {
    ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Space background
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Background stars
    ctx.fillStyle = 'white';
    for (const star of this.stars) {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    
    // Player ship
    this._drawShape(ctx, this.playerShip.shape, this.playerShip.x, this.playerShip.y, 
                   this.playerShip.width, this.playerShip.height, this.playerShip.color);
    
    // Player projectiles
    for (const proj of this.projectiles) {
      ctx.fillStyle = proj.color;
      ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
    }
    
    // Enemy projectiles
    for (const proj of this.enemyProjectiles) {
      ctx.fillStyle = proj.color;
      ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
    }
    
    // Enemies
    for (const enemy of this.enemies) {
      this._drawShape(ctx, enemy.shape, enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
      
      // Enemy health bar
      if (enemy.health < enemy.maxHealth) {
        const barWidth = enemy.width;
        const barHeight = 4;
        const barX = enemy.x;
        const barY = enemy.y - 8;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(barX, barY, (enemy.health / enemy.maxHealth) * barWidth, barHeight);
      }
    }
    
    // Powerups
    for (const powerup of this.powerups) {
      const bobY = powerup.y + Math.sin(powerup.bobOffset) * 3;
      this._drawShape(ctx, powerup.shape, powerup.x, bobY, powerup.width, powerup.height, powerup.color);
    }
    
    // Particles
    ParticleSystem.updateAndRender(ctx, 0.016);
    
    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${this.score}`, 12, 22);
    ctx.fillText(`Lives: ${this.lives}`, 12, 44);
    
    // Mode-specific UI
    if (this.mode === 'timed') {
      ctx.fillText(`Target: ${this.targetScore}`, 12, 66);
      ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, Engine.canvas.width - 120, 22);
    } else {
      ctx.fillText(`Survival Mode`, 12, 66);
      ctx.fillText(`Difficulty: ${Math.floor(this.survivalDifficulty * 10) / 10}`, Engine.canvas.width - 160, 22);
    }
    
    // Player health bar
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthBarX = Engine.canvas.width - healthBarWidth - 12;
    const healthBarY = 12;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    ctx.fillStyle = this.playerShip.health > 30 ? '#00FF00' : '#FF0000';
    ctx.fillRect(healthBarX, healthBarY, (this.playerShip.health / this.playerShip.maxHealth) * healthBarWidth, healthBarHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Health', healthBarX, healthBarY - 4);
    
    // Weapon indicator
    if (this.weaponType !== 'normal') {
      ctx.fillStyle = 'yellow';
      ctx.font = '16px Arial';
      ctx.fillText(`${this.weaponType.toUpperCase()}: ${Math.ceil(this.weaponDuration)}s`, 12, Engine.canvas.height - 12);
    }
    
    // Touch controls hint
    if (Engine.isTouchDevice) {
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Touch to move and shoot', Engine.canvas.width/2, Engine.canvas.height - 10);
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

window.Game6 = Game6;
