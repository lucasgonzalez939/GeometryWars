// Shared ParticleSystem
(function(){
  const particles = [];

  function colorForType(type) {
    switch(type) {
      case 'square': return '#ff6b6b';
      case 'circle': return '#ffd93d';
      case 'triangle': return '#6bc1ff';
      case 'danger': return '#ff3b3b';
      default: return '#ffffff';
    }
  }

  window.ParticleSystem = {
    spawnBurst: function(x, y, type) {
      const color = colorForType(type);
      for (let i=0;i<12;i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random()-0.5) * 200,
          vy: (Math.random()-0.8) * -120,
          life: 0.6 + Math.random()*0.6,
          age: 0,
          color: color,
          size: 2 + Math.random()*3
        });
      }
    },
    updateAndRender: function(ctx, dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) { particles.splice(i,1); continue; }
        p.vy += 300 * dt; // gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const alpha = Math.max(0, 1 - p.age / p.life);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        ctx.globalAlpha = 1;
      }
    }
  };
})();
