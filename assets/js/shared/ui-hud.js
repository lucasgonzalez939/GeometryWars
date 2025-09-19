// ui-hud.js - small helpers for drawing HUD elements
const UIHud = {
  drawScore: function(ctx, x, y, score) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, x, y);
  },
  drawTargetIcon: function(ctx, x, y, shape, size) {
    const ts = size || 20;
    switch (shape) {
      case 'square':
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(x, y, ts, ts);
        break;
      case 'circle':
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2, ts / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.fillStyle = '#6bc1ff';
        ctx.beginPath();
        ctx.moveTo(x + ts / 2, y);
        ctx.lineTo(x + ts, y + ts);
        ctx.lineTo(x, y + ts);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
};
