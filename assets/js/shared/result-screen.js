// shared/result-screen.js - Unified result screen for all games
const ResultScreen = {
  show: function(ctx, options) {
    const {
      title = 'Result',
      message = '',
      score = null,
      level = null,
      showNextLevel = false,
      onRestart = null,
      onNextLevel = null,
      onMainMenu = null,
      touchHandler = null
    } = options;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '36px Arial';
    ctx.fillText(title, Engine.canvas.width/2, Engine.canvas.height/2 - 60);
    
    // Message
    if (message) {
      ctx.font = '24px Arial';
      ctx.fillText(message, Engine.canvas.width/2, Engine.canvas.height/2 - 25);
    }
    
    // Score and level info
    let yOffset = 5;
    if (score !== null) {
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, Engine.canvas.width/2, Engine.canvas.height/2 + yOffset);
      yOffset += 25;
    }
    if (level !== null) {
      ctx.font = '20px Arial';
      ctx.fillText(`Level: ${level}`, Engine.canvas.width/2, Engine.canvas.height/2 + yOffset);
      yOffset += 25;
    }
    
    // Buttons
    const btnW = 140, btnH = 48;
    const cx = Math.floor(Engine.canvas.width/2);
    const by = Math.floor(Engine.canvas.height/2) + 40;
    
    let buttonCount = 2; // Restart + Main Menu
    if (showNextLevel) buttonCount = 3;
    
    const totalWidth = buttonCount * btnW + (buttonCount - 1) * 15;
    const startX = cx - totalWidth / 2;
    
    let btnIndex = 0;
    
    // Restart button
    const restartX = startX + btnIndex * (btnW + 15);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(restartX, by, btnW, btnH);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Restart', restartX + btnW/2, by + btnH/2 + 6);
    btnIndex++;
    
    // Next Level button (if applicable)
    let nextLevelX = null;
    if (showNextLevel) {
      nextLevelX = startX + btnIndex * (btnW + 15);
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(nextLevelX, by, btnW, btnH);
      ctx.fillStyle = 'white';
      ctx.fillText('Next Level', nextLevelX + btnW/2, by + btnH/2 + 6);
      btnIndex++;
    }
    
    // Main Menu button
    const menuX = startX + btnIndex * (btnW + 15);
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(menuX, by, btnW, btnH);
    ctx.fillStyle = 'white';
    ctx.fillText('Main Menu', menuX + btnW/2, by + btnH/2 + 6);
    
    // Controls hint
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('R: Restart | M: Menu' + (showNextLevel ? ' | N: Next Level' : ''), 
                 Engine.canvas.width/2, Engine.canvas.height - 20);
    
    ctx.restore();
    
    // Return button rectangles for touch handling
    return {
      restart: { x: restartX, y: by, w: btnW, h: btnH },
      nextLevel: nextLevelX ? { x: nextLevelX, y: by, w: btnW, h: btnH } : null,
      menu: { x: menuX, y: by, w: btnW, h: btnH }
    };
  },

  handleInput: function(x, y, buttonRects, callbacks) {
    const { onRestart, onNextLevel, onMainMenu } = callbacks;
    
    if (buttonRects.restart && 
        x >= buttonRects.restart.x && x <= buttonRects.restart.x + buttonRects.restart.w &&
        y >= buttonRects.restart.y && y <= buttonRects.restart.y + buttonRects.restart.h) {
      onRestart && onRestart();
      return true;
    }
    
    if (buttonRects.nextLevel && 
        x >= buttonRects.nextLevel.x && x <= buttonRects.nextLevel.x + buttonRects.nextLevel.w &&
        y >= buttonRects.nextLevel.y && y <= buttonRects.nextLevel.y + buttonRects.nextLevel.h) {
      onNextLevel && onNextLevel();
      return true;
    }
    
    if (buttonRects.menu && 
        x >= buttonRects.menu.x && x <= buttonRects.menu.x + buttonRects.menu.w &&
        y >= buttonRects.menu.y && y <= buttonRects.menu.y + buttonRects.menu.h) {
      onMainMenu && onMainMenu();
      return true;
    }
    
    return false;
  }
};
