// Game 2: Shape Detective
// Tap to find all instances of the target shape in the scene.
const Game2 = {
  sceneShapes: [],
  targetType: 'circle',
  remaining: 0,
  score: 0,
  level: 1,
  touchDown: false,
  lastAction: null, // { text, color, expiresAt }
  // preview state: show all shapes for a short time at the start of the round
  showPreviewUntil: 0, // timestamp until when full shapes are visible before hiding
  // hint state kept for compatibility but disabled in this mode
  hintAvailable: false,
  showHintUntil: 0,

  onEnter: function(params) {
    this.level = params && params.level ? params.level : 1;
    this.score = 0;
    this.generateScene(this.level);
    this.touchDown = false;
    // show all shapes for a short preview at the start of the round
    this.showPreviewUntil = performance.now() + 2000; // 2s preview
    // ensure hints are disabled for now (no hint button)
    this.hintAvailable = false;
    this.showHintUntil = 0;
    // reset overlay state
    this.ended = false;
    this.resultIsWin = false;
    this.resultMessage = '';
    this._resultTouchDown = false;
  },

  onExit: function() {
    // cleanup if needed
    this.sceneShapes = [];
  },

  generateScene: function(level) {
    this.sceneShapes = [];
    const cols = Math.min(6, 3 + level);
    const rows = Math.min(5, 3 + Math.floor(level/2));
    const padding = 40;
    const areaW = Engine.canvas.width - padding * 2;
    const areaH = Engine.canvas.height - 160; // leave space for HUD
    const cellW = Math.floor(areaW / cols);
    const cellH = Math.floor(areaH / rows);

    const types = ['circle', 'square', 'triangle'];
    // choose a target type (weighted by level)
    this.targetType = types[Math.floor(Math.random() * types.length)];

    // populate grid with random shapes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellW + cellW/2;
        const y = 120 + r * cellH + cellH/2;
        const type = types[Math.random() < 0.5 ? 0 : (Math.random() < 0.6 ? 1 : 2)];
        const size = Math.min(cellW, cellH) * 0.35;
        this.sceneShapes.push({ x, y, type, size, found: false });
      }
    }

    // count remaining targets
    this.remaining = this.sceneShapes.filter(s => s.type === this.targetType).length;
  },

  handleInput: function(x, y) {
    // if preview is active, ignore input
    if (performance.now() < this.showPreviewUntil) return;
    // find top-most shape hit (iterate from end)
    for (let i = this.sceneShapes.length - 1; i >= 0; i--) {
      const s = this.sceneShapes[i];
      if (s.found) continue;
      // simple point-in-shape checks using Utils
      if (s.type === 'circle') {
        const dx = x - s.x, dy = y - s.y;
        if (dx*dx + dy*dy <= s.size*s.size) {
          this._onShapeTapped(s);
          return;
        }
      } else if (s.type === 'square') {
        if (Utils.pointInRect(x, y, s.x - s.size, s.y - s.size, s.size*2, s.size*2)) {
          this._onShapeTapped(s);
          return;
        }
      } else if (s.type === 'triangle') {
        // barycentric-ish test: bounding box then area test
        const bx = s.x, by = s.y - s.size;
        // build triangle points (pointing up)
        const p1 = {x: s.x, y: s.y - s.size};
        const p2 = {x: s.x - s.size, y: s.y + s.size};
        const p3 = {x: s.x + s.size, y: s.y + s.size};
        // area method
        function area(a,b,c){ return Math.abs((a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y))/2); }
        const A = area(p1,p2,p3);
        const A1 = area({x,y},p2,p3);
        const A2 = area(p1,{x,y},p3);
        const A3 = area(p1,p2,{x,y});
        if (Math.abs(A - (A1+A2+A3)) < 0.5) { this._onShapeTapped(s); return; }
      }
    }
    // miss
    this.score = Math.max(0, this.score - 1);
    this.lastAction = { text: 'Miss!', color: '#ff6b6b', expiresAt: performance.now() + 700 };
  },

  _useHint: function() {
    const now = performance.now();
    // must be within the initial hint window and hint must be available
    if (!this.hintAvailable || now > this.hintWindowUntil) {
      this.lastAction = { text: 'No hints', color: '#ccc', expiresAt: now + 700 };
      return;
    }
    // consume the single hint for this round
    this.hintAvailable = false;
    this.showHintUntil = now + 2000; // show silhouettes for 2s
    this.lastAction = { text: 'Hint!', color: '#6b9cff', expiresAt: now + 700 };
  },

  _onShapeTapped: function(s) {
    if (s.type === this.targetType) {
      s.found = true;
      this.remaining -= 1;
      this.score += 10;
      this.lastAction = { text: '+10', color: '#6bff8a', expiresAt: performance.now() + 700 };
    } else {
      // wrong shape
      s.found = true; // reveal it
      this.score = Math.max(0, this.score - 5);
      this.lastAction = { text: '-5', color: '#ffd56b', expiresAt: performance.now() + 700 };
    }

    if (this.remaining <= 0) {
      // level complete: show win overlay
      this.ended = true;
      this.resultIsWin = true;
      this.resultMessage = 'You Win!';
    }
  },

  // result overlay helpers
  _handleResultInput: function(x, y) {
    const w = Engine.canvas.width, h = Engine.canvas.height;
    const btnW = 160, btnH = 48;
    const cx = Math.floor(w/2);
    const by = Math.floor(h/2) + 30;
    const restartRect = { x: cx - btnW - 10, y: by, w: btnW, h: btnH };
    const menuRect = { x: cx + 10, y: by, w: btnW, h: btnH };
    if (x >= restartRect.x && x <= restartRect.x + restartRect.w && y >= restartRect.y && y <= restartRect.y + restartRect.h) {
      this.ended = false;
      this._resultTouchDown = false;
      Engine.clearInput && Engine.clearInput();
      Engine.setScene(Game2, { level: this.level });
      return true;
    }
    if (x >= menuRect.x && x <= menuRect.x + menuRect.w && y >= menuRect.y && y <= menuRect.y + menuRect.h) {
      this.ended = false;
      this._resultTouchDown = false;
      Engine.clearInput && Engine.clearInput();
      Engine.setScene(GameManager.MenuScene);
      return true;
    }
    return false;
  },

  update: function(deltaTime) {
    // handle pointer input mapped by Engine
    // Note: Engine already normalizes touch.x/y to logical canvas coords in event handlers,
    // so don't re-run _screenToCanvas here (that would double-convert).
    if (this.ended) {
      // overlay input handling
      if (Engine.touch.isDown && !this._resultTouchDown) { this._resultTouchDown = true; const x = Engine.touch.x, y = Engine.touch.y; if (x!=null) this._handleResultInput(x,y); }
      if (!Engine.touch.isDown) this._resultTouchDown = false;
  if (Engine.codes['Enter'] || Engine.codes['NumpadEnter'] || Engine.keys['r'] || Engine.keys['R']) { Engine.clearInput && Engine.clearInput(); Engine.setScene(Game2, { level: this.level }); }
  if (Engine.keys['m'] || Engine.keys['M']) { Engine.clearInput && Engine.clearInput(); Engine.setScene(GameManager.MenuScene); }
      return;
    }
    if (Engine.touch.isDown && !this.touchDown) {
      this.touchDown = true;
      const x = Engine.touch.x, y = Engine.touch.y;
      if (x != null && y != null) this.handleInput(x, y);
    }
    if (!Engine.touch.isDown) this.touchDown = false;
    // ignore hint key in this mode; consume the key state to avoid accidental triggers elsewhere
    if (Engine.codes['KeyH'] || Engine.keys['h'] || Engine.keys['H']) { this._hintKeyDown = true; } else this._hintKeyDown = false;
  },

  render: function(ctx) {
    ctx.clearRect(0,0,Engine.canvas.width, Engine.canvas.height);
    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    // draw target icon next to label
    ctx.fillText('Find: ' + this.targetType.toUpperCase(), 12, 28);
    // small icon
    const iconX = 12 + 160;
    const iconY = 18;
    this._drawSmallShape(ctx, this.targetType, iconX, iconY, 10);
    ctx.textAlign = 'right';
    ctx.fillText('Score: ' + this.score, Engine.canvas.width - 12, 28);
    // remaining
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
    ctx.fillText('Remaining: ' + this.remaining, Engine.canvas.width/2, 50);

    // draw shapes: if preview is active show full shapes; otherwise show hidden placeholders for unrevealed shapes
    const previewActive = performance.now() < this.showPreviewUntil;
    for (let i = 0; i < this.sceneShapes.length; i++) {
      const s = this.sceneShapes[i];
      if (previewActive || s.found) {
        // show full shape
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = s.type === 'circle' ? '#ff6b6b' : (s.type === 'square' ? '#6b9cff' : '#ffd56b');
        if (s.type === 'circle') {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
        } else if (s.type === 'square') {
          ctx.fillRect(s.x - s.size, s.y - s.size, s.size*2, s.size*2);
        } else if (s.type === 'triangle') {
          ctx.beginPath(); ctx.moveTo(s.x, s.y - s.size); ctx.lineTo(s.x - s.size, s.y + s.size); ctx.lineTo(s.x + s.size, s.y + s.size); ctx.closePath(); ctx.fill();
        }
        // if revealed and it's a target show a small glow
        if (s.found && s.type === this.targetType) {
          ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3;
          ctx.beginPath(); if (s.type === 'circle') ctx.arc(s.x, s.y, s.size + 6, 0, Math.PI*2); else if (s.type === 'square') ctx.rect(s.x - s.size - 6, s.y - s.size - 6, (s.size+6)*2, (s.size+6)*2); else { ctx.moveTo(s.x, s.y - s.size - 6); ctx.lineTo(s.x - s.size - 6, s.y + s.size + 6); ctx.lineTo(s.x + s.size + 6, s.y + s.size + 6); ctx.closePath(); } ctx.stroke();
        }
      } else {
        // placeholder: small dark blob with ? to indicate hidden
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(8, s.size * 0.6), 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.fillText('?', s.x, s.y + 6);
      }
    }

    // instruction and last action feedback
    ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.font = '14px Arial';
    ctx.fillText('Tap the tiles to reveal shapes. Find all ' + this.targetType + 's', Engine.canvas.width/2, Engine.canvas.height - 48);
    // transient feedback
    if (this.lastAction && performance.now() < this.lastAction.expiresAt) {
      ctx.fillStyle = this.lastAction.color;
      ctx.font = '20px Arial';
      ctx.fillText(this.lastAction.text, Engine.canvas.width/2, Engine.canvas.height - 20);
    }

    // no hint button shown; initial preview handled automatically

    // result overlay
    if (this.ended) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,Engine.canvas.width, Engine.canvas.height);
      ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '36px Arial';
      ctx.fillText(this.resultMessage || 'Result', Engine.canvas.width/2, Engine.canvas.height/2 - 20);
      const btnW = 160, btnH = 48;
      const cx = Math.floor(Engine.canvas.width/2);
      const by = Math.floor(Engine.canvas.height/2) + 30;
      ctx.fillStyle = '#4CAF50'; ctx.fillRect(cx - btnW - 10, by, btnW, btnH);
      ctx.fillStyle = 'white'; ctx.font = '20px Arial'; ctx.fillText('Restart', cx - btnW/2 - 10, by + btnH/2 + 6);
      ctx.fillStyle = '#2196F3'; ctx.fillRect(cx + 10, by, btnW, btnH);
      ctx.fillStyle = 'white'; ctx.fillText('Main Menu', cx + btnW/2 + 10, by + btnH/2 + 6);
      ctx.restore();
    }
  }
  ,

  _drawSmallShape: function(ctx, type, x, y, size) {
    ctx.save();
    ctx.translate(x, y + 8);
    ctx.fillStyle = type === 'circle' ? '#ff6b6b' : (type === 'square' ? '#6b9cff' : '#ffd56b');
    if (type === 'circle') { ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI*2); ctx.fill(); }
    else if (type === 'square') { ctx.fillRect(-size, -size, size*2, size*2); }
    else { ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(-size, size); ctx.lineTo(size, size); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
};
window.Game2 = Game2;
