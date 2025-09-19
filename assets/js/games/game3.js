
// Game 3: Block Builder Challenge
// Drag blocks from the palette onto the grid. Snap to grid and avoid overlaps. Win when all pieces are placed.
const Game3 = {
  gridCols: 8,
  gridRows: 6,
  cellSize: 64,
  palette: [], // blocks available to place
  placed: [], // placed blocks on grid
  dragging: null,
  dragOffset: {x:0,y:0},
  selectedIndex: 0,
  _keyState: {},
  ended: false,
  resultMessage: '',
  _resultTouchDown: false,

  onEnter: function(params) {
    // compute cellSize to fit grid nicely
    const w = Engine.canvas.width, h = Engine.canvas.height - 120;
    this.cellSize = Math.min(Math.floor(w / this.gridCols), Math.floor(h / this.gridRows));
    this.palette = [];
    this.placed = [];
    this.ended = false; this.resultMessage = ''; this._resultTouchDown = false;
    this._touchWasDown = false;
    this._ghost = null; // ghost preview while dragging

    // level handling: if levels provided externally, show selector; otherwise try to load the levels file
    this.levels = window.Game3Levels || null;
    this.levelSelectMode = false;
    this.selectedLevelIndex = 0;

    const defaultPalette = [ {w:3,h:1}, {w:2,h:2}, {w:1,h:3}, {w:2,h:1}, {w:1,h:1} ];

    if (params && typeof params.levelIndex === 'number') {
      // start with a specific level if provided
      this._initPaletteFromDefs((window.Game3Levels && window.Game3Levels[params.levelIndex] && window.Game3Levels[params.levelIndex].palette) || defaultPalette);
    } else if (this.levels && this.levels.length > 0) {
      // show level selector overlay
      this.levelSelectMode = true; this.selectedLevelIndex = 0;
    } else {
      // attempt to dynamically load the levels file; fall back to default palette on error
      const tag = document.createElement('script');
      tag.src = 'assets/js/games/game3-levels.js';
      tag.onload = () => {
        this.levels = window.Game3Levels || null;
        if (this.levels && this.levels.length > 0) { this.levelSelectMode = true; this.selectedLevelIndex = 0; }
        else { this._initPaletteFromDefs(defaultPalette); }
      };
      tag.onerror = () => { this._initPaletteFromDefs(defaultPalette); };
      document.body.appendChild(tag);
      // temporary init with default so UI is responsive until levels load
      this._initPaletteFromDefs(defaultPalette);
    }
  },

  _initPaletteFromDefs: function(paletteDefs){
    this.palette = [];
    this.placed = [];
    let px = 24, py = Engine.canvas.height - 80;
    for (let i=0;i<paletteDefs.length;i++){
      const d = paletteDefs[i];
      const block = { id: 'p'+i, w:d.w, h:d.h, x: px, y: py - d.h*this.cellSize, placed:false, rotated:!!d.rotated };
      block.renderX = block.x; block.renderY = block.y;
      // animation state for smooth returns
      block._returning = false; block._returnStart = 0; block._returnDuration = 240; block._startX = block.x; block._startY = block.y;
      this.palette.push(block);
      px += (d.w*this.cellSize) + 16;
    }
  },

  onExit: function() {},

  _screenToGrid: function(x,y){ const gridX = Math.floor(x / this.cellSize); const gridY = Math.floor(y / this.cellSize); return { gx:gridX, gy:gridY }; },

  _fitsAt: function(block, gx, gy){ if (gx<0||gy<0) return false; if (gx+block.w > this.gridCols || gy+block.h > this.gridRows) return false; // check overlap with placed
    // compute effective sizes (respect rotation)
    const bw = block.rotated ? block.h : block.w;
    const bh = block.rotated ? block.w : block.h;
    for (const p of this.placed) {
      if (p === block) continue;
      const pw = (p.ew || p.w);
      const ph = (p.eh || p.h);
      if (gx < p.gx + pw && gx + bw > p.gx && gy < p.gy + ph && gy + bh > p.gy) return false;
    }
    return true;
  },

  _snapAndPlace: function(block){ // attempt to snap block to grid based on its renderX/renderY
    const gx = Math.round(block.renderX / this.cellSize);
    const gy = Math.round(block.renderY / this.cellSize);
    // effective size
    const ew = block.rotated ? block.h : block.w;
    const eh = block.rotated ? block.w : block.h;
    if (this._fitsAt(block,gx,gy)){
      // mark as placed (store effective extents separately)
      block.gx = gx; block.gy = gy; block.placed = true; block.ew = ew; block.eh = eh; ParticleSystem.spawnBurst((gx+ew/2)*this.cellSize, (gy+eh/2)*this.cellSize, 'square'); Sound.play('success');
      this.placed.push(block);
      // remove from palette list
      this.palette = this.palette.filter(b=>b!==block);
      return true;
    }
    return false;
  },

  _checkWin: function(){ if (this.palette.length === 0) { this.ended = true; this.resultMessage = 'Level Complete!'; } },

  update: function(dt){
    if (this.ended){
      if (Engine.touch.isDown && !this._resultTouchDown){ this._resultTouchDown = true; const x=Engine.touch.x, y=Engine.touch.y; if (x!=null) this._handleResultInput(x,y); }
      if (!Engine.touch.isDown) this._resultTouchDown = false;
      if (Engine.keys['m']||Engine.keys['M']){ Engine.clearInput && Engine.clearInput(); Engine.setScene(GameManager.MenuScene); }
      if (Engine.keys['r']||Engine.keys['R']){ Engine.clearInput && Engine.clearInput(); Engine.setScene(Game3); }
      return;
    }

    // handle dragging via Engine.touch
    if (Engine.touch.isDown) {
      const tx = Engine.touch.x, ty = Engine.touch.y;
      if (this.dragging) {
        this.dragging.renderX = tx - this.dragOffset.x; this.dragging.renderY = ty - this.dragOffset.y;
      } else {
        // start drag if touch hits a palette block
        for (let i=this.palette.length-1;i>=0;i--){ const b = this.palette[i]; const bx=b.renderX, by=b.renderY, bw=b.w*this.cellSize, bh=b.h*this.cellSize; if (tx>=bx && tx<=bx+bw && ty>=by && ty<=by+bh){ this.dragging = b; this.dragOffset.x = tx - b.renderX; this.dragOffset.y = ty - b.renderY; break; } }
      }
    } else {
      // touch released
      if (this.dragging){ const placed = this._snapAndPlace(this.dragging); if (!placed){ // animate back to palette origin using lerp timing
          this.dragging._returning = true; this.dragging._returnStart = performance.now(); this.dragging._startX = this.dragging.renderX; this.dragging._startY = this.dragging.renderY; Sound.play('miss');
        }
        this.dragging = null; this._checkWin();
      }
    }
    // keyboard/mouse support: selection + pickup + move + rotate
    // helper for key edge detection
    const isKeyDown = (k) => !!(Engine.keys[k] || Engine.codes[k]);
    const isKeyJustPressed = (k) => { const down = isKeyDown(k); const prev = !!this._keyState[k]; this._keyState[k] = down; return down && !prev; };

    // selection navigation when not dragging
    if (!this.dragging){
      if (isKeyJustPressed('ArrowRight') || isKeyJustPressed('Tab')){ this.selectedIndex = Math.min(this.palette.length-1, this.selectedIndex+1); }
      if (isKeyJustPressed('ArrowLeft')){ this.selectedIndex = Math.max(0, this.selectedIndex-1); }
      // pick up selected with Enter/Space
      if (this.palette[this.selectedIndex] && (isKeyJustPressed('Enter') || isKeyJustPressed(' '))) {
        this.dragging = this.palette[this.selectedIndex];
        // center dragOffset so keyboard movement moves around center
        this.dragOffset.x = (this.dragging.w*this.cellSize)/2;
        this.dragOffset.y = (this.dragging.h*this.cellSize)/2;
        // ensure render coords are set
        this.dragging.renderX = this.dragging.renderX || this.dragging.x; this.dragging.renderY = this.dragging.renderY || this.dragging.y;
      }
      // rotate selected before picking up
      if (this.palette[this.selectedIndex] && isKeyJustPressed('r')){
        this.palette[this.selectedIndex].rotated = !this.palette[this.selectedIndex].rotated;
      }
    } else {
      // moving with keyboard when dragging
      const moveSpeed = 220; // px/sec
      if (isKeyDown('ArrowLeft')) this.dragging.renderX -= moveSpeed * dt;
      if (isKeyDown('ArrowRight')) this.dragging.renderX += moveSpeed * dt;
      if (isKeyDown('ArrowUp')) this.dragging.renderY -= moveSpeed * dt;
      if (isKeyDown('ArrowDown')) this.dragging.renderY += moveSpeed * dt;
      // rotate while dragging
      if (isKeyJustPressed('r')){ this.dragging.rotated = !this.dragging.rotated; }
      // place with Enter/Space
      if (isKeyJustPressed('Enter') || isKeyJustPressed(' ')){
        const placed = this._snapAndPlace(this.dragging);
        if (!placed){ this.dragging._returning = true; this.dragging._returnStart = performance.now(); this.dragging._startX = this.dragging.renderX; this.dragging._startY = this.dragging.renderY; Sound.play('miss'); }
        this.dragging = null; this._checkWin();
      }
      // cancel with Escape
      if (isKeyJustPressed('Escape')){ this.dragging._returning = true; this.dragging._returnStart = performance.now(); this.dragging._startX = this.dragging.renderX; this.dragging._startY = this.dragging.renderY; this.dragging = null; Sound.play('miss'); }
    }

    // animate returning palette items
    const now = performance.now();
    for (const b of this.palette){ if (b._returning){ const t = Math.min(1, (now - b._returnStart)/b._returnDuration); const ease = 1 - Math.pow(1 - t, 3); b.renderX = b._startX + (b.x - b._startX) * ease; b.renderY = b._startY + (b.y - b._startY) * ease; if (t>=1){ b._returning = false; b.renderX = b.x; b.renderY = b.y; } } }

    // ghost preview: update based on dragging position
    if (this.dragging){ const gx = Math.round(this.dragging.renderX / this.cellSize); const gy = Math.round(this.dragging.renderY / this.cellSize); const ew = this.dragging.rotated ? this.dragging.h : this.dragging.w; const eh = this.dragging.rotated ? this.dragging.w : this.dragging.h; this._ghost = { gx, gy, ew, eh, valid: this._fitsAt(this.dragging, gx, gy) }; } else { this._ghost = null; }
    // If in level select mode, handle selection via touch/keys
    if (this.levelSelectMode){
      // keyboard selection
      if (isKeyJustPressed('ArrowDown')) this.selectedLevelIndex = Math.min(this.levels.length-1, this.selectedLevelIndex+1);
      if (isKeyJustPressed('ArrowUp')) this.selectedLevelIndex = Math.max(0, this.selectedLevelIndex-1);
      if (isKeyJustPressed('Enter') || isKeyJustPressed(' ')){
        this.levelSelectMode = false; this._initPaletteFromDefs(this.levels[this.selectedLevelIndex].palette); Engine.clearInput && Engine.clearInput();
      }
      // touch selection: act on release for consistency
      if (!Engine.touch.isDown && this._touchWasDown){ const tx = Engine.touch.x, ty = Engine.touch.y;
        // compute card layout same as render
        const cols = Math.min(3, this.levels.length);
        const cardW = Math.floor(Math.min(380, Engine.canvas.width - 120) / cols);
        const cardH = 160;
        const startX = Math.floor((Engine.canvas.width - (cardW*cols + (cols-1)*20))/2);
        for (let i=0;i<this.levels.length;i++){
          const col = i % cols; const row = Math.floor(i / cols);
          const x = startX + col*(cardW+20); const y = 100 + row*(cardH+16);
          const bx = x + cardW - 80 - 12, byBtn = y + cardH - 28 - 12;
          if (tx >= x && tx <= x+cardW && ty >= y && ty <= y+cardH){
            // if tapped on Start area
            if (tx >= bx && tx <= bx+80 && ty >= byBtn && ty <= byBtn+28){ this.selectedLevelIndex = i; this.levelSelectMode = false; this._initPaletteFromDefs(this.levels[this.selectedLevelIndex].palette); Engine.clearInput && Engine.clearInput(); break; }
            // otherwise select this card
            this.selectedLevelIndex = i; break;
          }
        }
      }
      this._touchWasDown = Engine.touch.isDown;
      return; // skip other update logic while selecting level
    }

      // handle rotate button tap (touch)
      const btnW = 80, btnH = 40; const bx = Engine.canvas.width - btnW - 16, by = Engine.canvas.height - btnH - 16;
      if (!Engine.touch.isDown && this._touchWasDown){ // a tap/release just occurred
        const tx = Engine.touch.x, ty = Engine.touch.y;
        if (tx!=null && tx >= bx && tx <= bx + btnW && ty >= by && ty <= by + btnH){ // rotate action
          if (this.dragging) { this.dragging.rotated = !this.dragging.rotated; Engine.clearInput && Engine.clearInput(); }
          else if (this.palette[this.selectedIndex]) { this.palette[this.selectedIndex].rotated = !this.palette[this.selectedIndex].rotated; Engine.clearInput && Engine.clearInput(); }
        }
      }
  },

  _handleResultInput: function(x,y){ const w=Engine.canvas.width,h=Engine.canvas.height,btnW=160,btnH=48,cx=Math.floor(w/2),by=Math.floor(h/2)+30; const restartRect={x:cx-btnW-10,y:by,w:btnW,h:btnH}; const menuRect={x:cx+10,y:by,w:btnW,h:btnH}; if (x>=restartRect.x&&x<=restartRect.x+restartRect.w&&y>=restartRect.y&&y<=restartRect.y+restartRect.h){ this.ended=false; this._resultTouchDown=false; Engine.clearInput&&Engine.clearInput(); Engine.setScene(Game3); return true;} if (x>=menuRect.x&&x<=menuRect.x+menuRect.w&&y>=menuRect.y&&y<=menuRect.y+menuRect.h){ this.ended=false; this._resultTouchDown=false; Engine.clearInput&&Engine.clearInput(); Engine.setScene(GameManager.MenuScene); return true;} return false; },

  render: function(ctx){ ctx.clearRect(0,0,Engine.canvas.width,Engine.canvas.height); ctx.fillStyle='#0a1b2a'; ctx.fillRect(0,0,Engine.canvas.width,Engine.canvas.height);
    // draw grid
    ctx.strokeStyle='#20465b'; for (let gx=0; gx<=this.gridCols; gx++){ ctx.beginPath(); ctx.moveTo(gx*this.cellSize,0); ctx.lineTo(gx*this.cellSize,this.gridRows*this.cellSize); ctx.stroke(); }
    for (let gy=0; gy<=this.gridRows; gy++){ ctx.beginPath(); ctx.moveTo(0,gy*this.cellSize); ctx.lineTo(this.gridCols*this.cellSize,gy*this.cellSize); ctx.stroke(); }

  // draw placed blocks (respect effective size / rotation)
  for (const p of this.placed){ const pw = (p.ew||p.w)*this.cellSize; const ph = (p.eh||p.h)*this.cellSize; ctx.fillStyle='#6ad1ff'; ctx.fillRect(p.gx*this.cellSize, p.gy*this.cellSize, pw, ph); ctx.strokeStyle='#0b3b4a'; ctx.strokeRect(p.gx*this.cellSize, p.gy*this.cellSize, pw, ph); }

  // draw palette (respect rotation)
  for (const b of this.palette){ const bx = b.renderX, by = b.renderY, bw = (b.rotated ? b.h : b.w)*this.cellSize, bh = (b.rotated ? b.w : b.h)*this.cellSize; ctx.fillStyle=(this.palette.indexOf(b)===this.selectedIndex? '#ffd88a':'#ffd166'); ctx.fillRect(bx,by,bw,bh); ctx.strokeStyle='#bb7a00'; ctx.strokeRect(bx,by,bw,bh); }

  // draw ghost preview (grid-aligned rectangle showing placement validity)
  if (this._ghost){ const gx = this._ghost.gx, gy = this._ghost.gy, ew = this._ghost.ew, eh = this._ghost.eh; const gxPx = gx*this.cellSize, gyPx = gy*this.cellSize, wPx = ew*this.cellSize, hPx = eh*this.cellSize; ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = this._ghost.valid ? '#4CAF50' : '#ff4d4d'; ctx.fillRect(gxPx, gyPx, wPx, hPx); ctx.restore(); }

  // draw dragging piece on top (if any)
  if (this.dragging){ const d = this.dragging; const dbw = (d.rotated ? d.h : d.w)*this.cellSize; const dbh = (d.rotated ? d.w : d.h)*this.cellSize; ctx.fillStyle='rgba(255,209,102,0.95)'; ctx.fillRect(d.renderX, d.renderY, dbw, dbh); ctx.strokeStyle='#bb7a00'; ctx.strokeRect(d.renderX, d.renderY, dbw, dbh); }

  // touch-friendly rotate button in bottom-right
  const btnW = 80, btnH = 40; const bx = Engine.canvas.width - btnW - 16, by = Engine.canvas.height - btnH - 16; ctx.fillStyle='#2b9cff'; ctx.fillRect(bx, by, btnW, btnH); ctx.fillStyle='white'; ctx.textAlign='center'; ctx.font='18px Arial'; ctx.fillText('Rotate', bx + btnW/2, by + btnH/2 + 6);

    // overlay hints
    ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText('Drag blocks into the grid. Place all to win.', Engine.canvas.width/2, Engine.canvas.height-20); ctx.textAlign='left';

    // result overlay
    if (this.ended){ ctx.save(); ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,Engine.canvas.width,Engine.canvas.height); ctx.fillStyle='white'; ctx.textAlign='center'; ctx.font='36px Arial'; ctx.fillText(this.resultMessage||'Result',Engine.canvas.width/2,Engine.canvas.height/2-20); const btnW=160,btnH=48,cx=Math.floor(Engine.canvas.width/2),by=Math.floor(Engine.canvas.height/2)+30; ctx.fillStyle='#4CAF50'; ctx.fillRect(cx-btnW-10,by,btnW,btnH); ctx.fillStyle='white'; ctx.font='20px Arial'; ctx.fillText('Restart',cx-btnW/2-10,by+btnH/2+6); ctx.fillStyle='#2196F3'; ctx.fillRect(cx+10,by,btnW,btnH); ctx.fillStyle='white'; ctx.fillText('Main Menu',cx+btnW/2+10,by+btnH/2+6); ctx.restore(); }

  // level selector overlay
  if (this.levelSelectMode){ ctx.save(); ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,Engine.canvas.width,Engine.canvas.height); ctx.fillStyle='white'; ctx.textAlign='center'; ctx.font='28px Arial'; ctx.fillText('Select Level', Engine.canvas.width/2, 120); ctx.font='20px Arial'; for (let i=0;i<this.levels.length;i++){ const y = 180 + i*40; ctx.fillStyle = (i===this.selectedLevelIndex)? '#2b9cff' : 'white'; ctx.fillText(this.levels[i].title, Engine.canvas.width/2, y); } ctx.font='16px Arial'; ctx.fillStyle='white'; ctx.fillText('Use Arrow keys / Tap to choose, Enter to start', Engine.canvas.width/2, Engine.canvas.height-80); ctx.restore(); }
    if (this.levelSelectMode){
      // card layout
      ctx.save(); ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,Engine.canvas.width,Engine.canvas.height);
      const cols = Math.min(3, this.levels.length);
      const cardW = Math.floor(Math.min(380, Engine.canvas.width - 120) / cols);
      const cardH = 160;
      const startX = Math.floor((Engine.canvas.width - (cardW*cols + (cols-1)*20))/2);
      ctx.textAlign='left'; ctx.fillStyle='white'; ctx.font='24px Arial'; ctx.fillText('Select Level', 40, 60);
      for (let i=0;i<this.levels.length;i++){
        const col = i % cols; const row = Math.floor(i / cols);
        const x = startX + col*(cardW+20); const y = 100 + row*(cardH+16);
        // card background
        ctx.fillStyle = (i===this.selectedLevelIndex)? '#173e58' : '#0f2432'; ctx.fillRect(x,y,cardW,cardH); ctx.strokeStyle='#255a78'; ctx.strokeRect(x,y,cardW,cardH);
        // title
        ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(this.levels[i].title, x+12, y+28);
        // description
        ctx.fillStyle='#cfe8fa'; ctx.font='12px Arial'; ctx.fillText(this.levels[i].description, x+12, y+48);
        // small preview grid on left of card
        const cell = 10; const previewX = x+12; const previewY = y+64;
        const palette = this.levels[i].palette || [];
        let px = previewX; for (let p=0;p<Math.min(palette.length,5);p++){ const def = palette[p]; const pw = def.w*cell, ph = def.h*cell; ctx.fillStyle='#ffd166'; ctx.fillRect(px, previewY, pw, ph); ctx.strokeStyle='#bb7a00'; ctx.strokeRect(px, previewY, pw, ph); px += pw + 6; }
        // Start button
        const btnW = 80, btnH = 28; const bx = x + cardW - btnW - 12, byBtn = y + cardH - btnH - 12; ctx.fillStyle = '#2b9cff'; ctx.fillRect(bx, byBtn, btnW, btnH); ctx.fillStyle='white'; ctx.textAlign='center'; ctx.font='14px Arial'; ctx.fillText('Start', bx+btnW/2, byBtn+btnH/2+5);
      }
      ctx.restore();
    }
  }
};
window.Game3 = Game3;

