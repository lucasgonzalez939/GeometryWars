// Game Mode Selection Modal
const GameModeModal = {
  // State
  isVisible: false,
  selectedMode: 'timed',
  onModeSelected: null,
  _touchWasDown: false,
  _buttonRects: [],

  show: function(onModeSelected) {
    this.isVisible = true;
    this.selectedMode = 'timed';
    this.onModeSelected = onModeSelected;
    this._touchWasDown = false;
    this._buttonRects = [];
  },

  hide: function() {
    this.isVisible = false;
    this.onModeSelected = null;
    this._buttonRects = [];
  },

  update: function(deltaTime) {
    if (!this.isVisible) return;

    // Handle keyboard navigation
    if (Engine.keys['ArrowLeft'] || Engine.keys['ArrowRight'] || Engine.keys['a'] || Engine.keys['d']) {
      this.selectedMode = this.selectedMode === 'timed' ? 'survival' : 'timed';
      // Prevent key repeat
      Engine.keys['ArrowLeft'] = false;
      Engine.keys['ArrowRight'] = false;
      Engine.keys['a'] = false;
      Engine.keys['d'] = false;
    }

    // Handle selection
    if (Engine.keys['Enter'] || Engine.keys[' ']) {
      this._selectMode();
      Engine.keys['Enter'] = false;
      Engine.keys[' '] = false;
    }

    // Handle touch/mouse input
    if (Engine.touch.isDown && !this._touchWasDown) {
      this._touchWasDown = true;
      this._handleTouch(Engine.touch.x, Engine.touch.y);
    } else if (!Engine.touch.isDown) {
      this._touchWasDown = false;
    }

    // Escape to return to menu
    if (Engine.keys['Escape']) {
      Engine.setScene(GameManager);
      Engine.keys['Escape'] = false;
    }
  },

  render: function(ctx) {
    if (!this.isVisible) return;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);

    // Modal background
    const modalW = 500;
    const modalH = 350;
    const modalX = (Engine.canvas.width - modalW) / 2;
    const modalY = (Engine.canvas.height - modalH) / 2;

    // Modal background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(modalX, modalY, modalW, modalH);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Choose Game Mode', modalX + modalW / 2, modalY + 60);

    // Mode descriptions
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ecf0f1';
    
    // Timed Mode
    const timedY = modalY + 120;
    ctx.fillText('⏱️ TIMED MODE', modalX + modalW / 2, timedY);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#95a5a6';
    ctx.fillText('Race against time! Complete objectives before time runs out.', modalX + modalW / 2, timedY + 25);
    ctx.fillText('Perfect for quick challenges and skill building.', modalX + modalW / 2, timedY + 45);

    // Survival Mode
    const survivalY = modalY + 200;
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('🛡️ SURVIVAL MODE', modalX + modalW / 2, survivalY);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#95a5a6';
    ctx.fillText('No time limits! Survive as long as possible and score high.', modalX + modalW / 2, survivalY + 25);
    ctx.fillText('Difficulty increases gradually over time.', modalX + modalW / 2, survivalY + 45);

    // Buttons
    const buttonW = 180;
    const buttonH = 45;
    const buttonSpacing = 50;
    const totalButtonWidth = buttonW * 2 + buttonSpacing;
    const buttonsStartX = modalX + (modalW - totalButtonWidth) / 2;
    const buttonY = modalY + modalH - 80;

    this._buttonRects = [];

    // Timed button
    const timedButton = { x: buttonsStartX, y: buttonY, w: buttonW, h: buttonH, mode: 'timed' };
    this._buttonRects.push(timedButton);
    
    ctx.fillStyle = this.selectedMode === 'timed' ? '#3498db' : '#34495e';
    ctx.fillRect(timedButton.x, timedButton.y, timedButton.w, timedButton.h);
    ctx.strokeStyle = this.selectedMode === 'timed' ? '#2980b9' : '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(timedButton.x, timedButton.y, timedButton.w, timedButton.h);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TIMED', timedButton.x + timedButton.w / 2, timedButton.y + timedButton.h / 2 + 6);

    // Survival button
    const survivalButton = { x: buttonsStartX + buttonW + buttonSpacing, y: buttonY, w: buttonW, h: buttonH, mode: 'survival' };
    this._buttonRects.push(survivalButton);
    
    ctx.fillStyle = this.selectedMode === 'survival' ? '#e74c3c' : '#34495e';
    ctx.fillRect(survivalButton.x, survivalButton.y, survivalButton.w, survivalButton.h);
    ctx.strokeStyle = this.selectedMode === 'survival' ? '#c0392b' : '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(survivalButton.x, survivalButton.y, survivalButton.w, survivalButton.h);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SURVIVAL', survivalButton.x + survivalButton.w / 2, survivalButton.y + survivalButton.h / 2 + 6);

    // Instructions
    ctx.font = '12px Arial';
    ctx.fillStyle = '#95a5a6';
    ctx.textAlign = 'center';
    ctx.fillText('Use arrow keys or click to select • Enter/Space to confirm • ESC for menu', modalX + modalW / 2, modalY + modalH - 15);
  },

  _handleTouch: function(x, y) {
    for (const button of this._buttonRects) {
      if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) {
        this.selectedMode = button.mode;
        this._selectMode();
        break;
      }
    }
  },

  _selectMode: function() {
    if (this.onModeSelected) {
      this.onModeSelected(this.selectedMode);
    }
    this.hide();
  }
};

window.GameModeModal = GameModeModal;
