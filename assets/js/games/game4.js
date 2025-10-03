// Game 4: Shooter Sweep (moved from Game3)
const Game4 = {
  player: { x: 380, y: 540, w: 40, h: 20, speed: 360 },
  bullets: [],
  enemies: [],
  spawnTimer: 0,
  spawnInterval: 1.0,
  score: 0,
  lives: 3,
  targetScore: 50,
  timeLimit: 120, // 2 minutes for timed mode
  timeLeft: 120,
  mode: 'timed', // 'timed' or 'survival'
  survivalDifficulty: 0,
  ended: false,
  resultMessage: '',

  onEnter: function(params) {
    // Mode can be passed in params or default to timed
    this.mode = (params && params.mode) || 'timed';
    this.timeLimit = (params && params.timeLimit) || 120;
    this.timeLeft = this.timeLimit;
    this.survivalDifficulty = 0;
    
    this.bullets = [];
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
    this.score = 0;
    this.lives = 3;
    this.targetScore = (params && params.targetScore) || (this.mode === 'timed' ? 50 : 100);
    this.ended = false; 
    this.resultMessage = ''; 
    this._resultTouchDown = false;
  },

  onExit: function() {},

  update: function(dt) {
    if (this.ended) {
      if (Engine.touch.isDown && !this._resultTouchDown) { this._resultTouchDown = true; const x = Engine.touch.x, y = Engine.touch.y; if (x!=null) this._handleResultInput(x,y); }
      if (!Engine.touch.isDown) this._resultTouchDown = false;
      if (Engine.codes['Enter'] || Engine.codes['NumpadEnter'] || Engine.keys['r'] || Engine.keys['R']) { Engine.clearInput && Engine.clearInput(); Engine.setScene(Game4); }
      if (Engine.keys['m'] || Engine.keys['M']) { Engine.clearInput && Engine.clearInput(); Engine.setScene(GameManager.MenuScene); }
      return;
    }
    
    // Escape key to return to menu
    if (Engine.keys['Escape'] || Engine.codes['Escape']) {
      Engine.clearInput && Engine.clearInput();
      Engine.setScene(GameManager.MenuScene);
      return;
    }

    // Movement
    if (Engine.keys['ArrowLeft'] || Engine.keys['a'] || Engine.keys['A']) this.player.x = Math.max(0, this.player.x - this.player.speed * dt);
    if (Engine.keys['ArrowRight'] || Engine.keys['d'] || Engine.keys['D']) this.player.x = Math.min(Engine.canvas.width - this.player.w, this.player.x + this.player.speed * dt);
    // touch drag: move towards touch x
    if (Engine.touch.isDown) {
      const tx = Engine.touch.x; if (tx != null) {
        const center = this.player.x + this.player.w/2;
        if (Math.abs(tx - center) > 6) this.player.x += Math.sign(tx - center) * this.player.speed * dt;
      }
    }

    // shooting (space or touch tap)
    if ((Engine.keys[' '] || Engine.codes['Space']) && !this._spaceDown) { this._spaceDown = true; this._shoot(); }
    if (!(Engine.keys[' '] || Engine.codes['Space'])) this._spaceDown = false;
    if (Engine.touch.isDown && !this._touchShot) { this._touchShot = true; this._shoot(); }
    if (!Engine.touch.isDown) this._touchShot = false;

    // spawn enemies
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) { this.spawnTimer -= this.spawnInterval; this._spawnEnemy(); }

    // Handle mode-specific logic
    if (this.mode === 'timed') {
      // Countdown timer
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.timeLeft <= 0) {
        this._endGame(this.score >= this.targetScore, 
          this.score >= this.targetScore ? 'Mission Complete!' : 'Time\'s Up!');
        return;
      }
    } else if (this.mode === 'survival') {
      // Increase difficulty over time
      this.survivalDifficulty += dt * 0.1; // Difficulty increases slowly
      this.spawnInterval = Math.max(0.3, 1.0 - this.survivalDifficulty * 0.1);
    }

    // update bullets
    for (let i = this.bullets.length -1; i >=0; i--) {
      const b = this.bullets[i]; b.y -= b.vy * dt; if (b.y < -10) this.bullets.splice(i,1);
    }
    // update enemies and collisions
    for (let i = this.enemies.length -1; i >=0; i--) {
      const e = this.enemies[i]; e.y += e.vy * dt;
      // collision with player bottom -> lose life
      if (e.y > Engine.canvas.height + 20) { this.enemies.splice(i,1); this.lives -= 1; if (this.lives <=0) this._onLose(); continue; }
      // bullet collisions
      for (let j = this.bullets.length -1; j>=0; j--) {
        const b = this.bullets[j]; if (b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size) {
          this.bullets.splice(j,1); this.enemies.splice(i,1); this.score += 5; ParticleSystem.spawnBurst(e.x+e.size/2,e.y+e.size/2,'circle'); Sound.play('success'); break;
        }
      }
    }

    // Check win condition (only for timed mode)
    if (this.mode === 'timed' && this.score >= this.targetScore) {
      this._endGame(true, 'Mission Complete!');
    }
  },

  _endGame: function(isWin, message) {
    this.ended = true;
    this.resultMessage = message || (isWin ? 'You Win!' : 'Game Over');
  },

  _shoot: function(){ this.bullets.push({ x: this.player.x + this.player.w/2, y: this.player.y, vy: 480 }); Sound.play('success'); },
  _spawnEnemy: function(){ const size = 20 + Math.random()*28; const x = Math.random()*(Engine.canvas.width - size); const y = -size; const vy = 80 + Math.random()*160; this.enemies.push({ x, y, size, vy }); },

  _onWin: function(){ this._endGame(true, 'You Win!'); },
  _onLose: function(){ this._endGame(false, 'Game Over'); },

  _handleResultInput: function(x,y){ const w=Engine.canvas.width,h=Engine.canvas.height,btnW=160,btnH=48,cx=Math.floor(w/2),by=Math.floor(h/2)+30; const restartRect={x:cx-btnW-10,y:by,w:btnW,h:btnH}; const menuRect={x:cx+10,y:by,w:btnW,h:btnH}; if (x>=restartRect.x&&x<=restartRect.x+restartRect.w&&y>=restartRect.y&&y<=restartRect.y+restartRect.h){ this.ended=false; this._resultTouchDown=false; Engine.clearInput&&Engine.clearInput(); Engine.setScene(Game4); return true;} if (x>=menuRect.x&&x<=menuRect.x+menuRect.w&&y>=menuRect.y&&y<=menuRect.y+menuRect.h){ this.ended=false; this._resultTouchDown=false; Engine.clearInput&&Engine.clearInput(); Engine.setScene(GameManager.MenuScene); return true;} return false; },

  render: function(ctx) {
    ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    ctx.fillStyle = '#071227';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Player
    ctx.fillStyle = 'white';
    ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
    
    // Bullets
    ctx.fillStyle = 'yellow';
    for (const b of this.bullets) {
      ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    }
    
    // Enemies
    ctx.fillStyle = '#ff6b6b';
    for (const e of this.enemies) {
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
    
    // Particles
    ParticleSystem.updateAndRender(ctx, 0.016);
    
    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + this.score, 12, 22);
    ctx.fillText('Lives: ' + this.lives, Engine.canvas.width - 110, 22);
    
    // Mode-specific UI
    if (this.mode === 'timed') {
      ctx.fillText('Target: ' + this.targetScore, 12, 44);
      ctx.fillText('Time: ' + Math.ceil(this.timeLeft) + 's', Engine.canvas.width - 110, 44);
    } else {
      ctx.fillText('Survival Mode', 12, 44);
      ctx.fillText('Difficulty: ' + Math.floor(this.survivalDifficulty * 10) / 10, Engine.canvas.width - 150, 44);
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
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = '36px Arial';
      ctx.fillText(this.resultMessage || 'Result', Engine.canvas.width/2, Engine.canvas.height/2 - 20);
      
      const btnW = 160, btnH = 48;
      const cx = Math.floor(Engine.canvas.width/2);
      const by = Math.floor(Engine.canvas.height/2) + 30;
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(cx - btnW - 10, by, btnW, btnH);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Restart', cx - btnW/2 - 10, by + btnH/2 + 6);
      
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(cx + 10, by, btnW, btnH);
      ctx.fillStyle = 'white';
      ctx.fillText('Main Menu', cx + btnW/2 + 10, by + btnH/2 + 6);
      
      ctx.restore();
    }
  }
};
window.Game4 = Game4;
// (Tangram skeleton removed - this file now contains the Shooter Sweep scene)
