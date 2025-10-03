// game1.js
const Game1 = {
    train: {
        x: 350,
        y: 500,
        width: 100,
        height: 50,
        speed: 400 // Increased speed for mobile
    },
    shapes: [],
    score: 0,
    targetShape: 'square',

    // spawning
    spawnTimer: 0,
    spawnInterval: 1.0, // seconds (will scale with mode/difficulty)

    // modes: 'timed' or 'survival'
    mode: 'timed',
    timeLimit: 60,
    timeLeft: 60,
    survivalDifficulty: 0,

    // lifecycle
    onEnter: function(params) {
        // params can include { mode: 'timed'|'survival', timeLimit: number }
        this.shapes = [];
        this.score = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.0;
        this.survivalDifficulty = 0;
    this.mode = (params && params.mode) || 'timed';
    this.timeLimit = (params && params.timeLimit) || 60;
        this.timeLeft = this.timeLimit;
        // ensure there is a targetShape set (GameManager may set it)
        if (!this.targetShape) this.targetShape = ['square','circle','triangle'][Math.floor(Math.random()*3)];
        // reset end/result overlay state
        this.ended = false;
        this.resultIsWin = false;
        this.resultMessage = '';
        this._resultTouchDown = false;
    },

    onExit: function() {
        // cleanup if needed
    },

    update: function(deltaTime) {
        if (this.ended) {
            // handle input for overlay
            if (Engine.touch.isDown && !this._resultTouchDown) { this._resultTouchDown = true; const x = Engine.touch.x, y = Engine.touch.y; if (x!=null) this._handleResultInput(x,y); }
            if (!Engine.touch.isDown) this._resultTouchDown = false;
            // keyboard: R restart, M menu, Enter restart
            if (Engine.codes['Enter'] || Engine.codes['NumpadEnter'] || Engine.keys['r'] || Engine.keys['R']) {
                Engine.clearInput && Engine.clearInput();
                Engine.setScene(Game1, { mode: this.mode, timeLimit: this.timeLimit });
            }
            if (Engine.keys['m'] || Engine.keys['M']) {
                Engine.clearInput && Engine.clearInput();
                Engine.setScene(GameManager.MenuScene);
            }
            return;
        }
        
        // Escape key to return to menu
        if (Engine.keys['Escape'] || Engine.codes['Escape']) {
            Engine.clearInput && Engine.clearInput();
            Engine.setScene(GameManager.MenuScene);
            return;
        }
        
        // Handle keyboard input
        if (Engine.keys['ArrowLeft'] && this.train.x > 0) {
            this.train.x -= this.train.speed * deltaTime;
        }
        if (Engine.keys['ArrowRight'] && this.train.x < Engine.canvas.width - this.train.width) {
            this.train.x += this.train.speed * deltaTime;
        }

        // Handle touch input
        // Touch / on-screen controls: Engine.touch and local control buttons
        if (Engine.touch.isDown) {
            const touchX = Engine.touch.x;
            const trainCenter = this.train.x + this.train.width / 2;
            // If touching left control area, move left; right area, move right
            if (this._isTouchingLeftControl(touchX)) {
                this.train.x = Math.max(0, this.train.x - this.train.speed * deltaTime);
            } else if (this._isTouchingRightControl(touchX)) {
                this.train.x = Math.min(Engine.canvas.width - this.train.width, this.train.x + this.train.speed * deltaTime);
            } else {
                // general touch (drag to move)
                if (touchX < trainCenter) this.train.x = Math.max(0, this.train.x - this.train.speed * deltaTime);
                else this.train.x = Math.min(Engine.canvas.width - this.train.width, this.train.x + this.train.speed * deltaTime);
            }
        }

        // Update mode timers
        if (this.mode === 'timed') {
            this.timeLeft -= deltaTime;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.endGame();
                return;
            }
        } else if (this.mode === 'survival') {
            // increase difficulty slowly
            this.survivalDifficulty += deltaTime * 0.05;
            // ramp spawn speed
            this.spawnInterval = Math.max(0.3, 1.0 - this.survivalDifficulty * 0.1);
        }

        // Spawn shapes over time
        this.spawnTimer += deltaTime;
        while (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            this.spawnShape();
        }

        // Update shapes and handle collisions/misses
        this.updateShapes(deltaTime);
    },

    updateShapes: function(deltaTime) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const s = this.shapes[i];
            s.y += s.vy * deltaTime;

            // collision detection: simple AABB for now
            if (Utils.rectsOverlap(s.x, s.y, s.size, s.size, this.train.x, this.train.y, this.train.width, this.train.height)) {
                this.handleCatch(s);
                this.shapes.splice(i, 1);
                continue;
            }

            // missed (passed bottom)
            if (s.y - s.size > Engine.canvas.height) {
                this.handleMiss(s);
                this.shapes.splice(i, 1);
            }
        }
    },

    // Weighted spawn: higher chance of spawning the targetShape
    spawnShape: function() {
        const types = ['square', 'circle', 'triangle'];
        // weights: target 0.5, others split remaining
        const weights = types.map(t => t === this.targetShape ? 0.5 : 0.25);
        const r = Math.random();
        let acc = 0;
        let chosen = types[0];
        for (let i = 0; i < types.length; i++) {
            acc += weights[i];
            if (r <= acc) { chosen = types[i]; break; }
        }

        const size = 24 + Math.floor(Math.random() * 32); // 24-55 px
        const x = Math.floor(Math.random() * Math.max(1, (Engine.canvas.width - size)));
        const y = -size;
        // speed scales slightly with difficulty
        const vy = 100 + Math.random() * 180 + this.survivalDifficulty * 20;

        this.shapes.push({ type: chosen, x, y, size, vy });
    },

    handleCatch: function(shape) {
        if (shape.type === this.targetShape) {
            this.score += 1;
            // success feedback
            ParticleSystem.spawnBurst(shape.x + shape.size/2, shape.y + shape.size/2, shape.type);
            Sound.play('success');
        } else {
            // penalty for wrong catch
            this.score = Math.max(0, this.score - 1);
            ParticleSystem.spawnBurst(shape.x + shape.size/2, shape.y + shape.size/2, 'neutral');
            Sound.play('wrong');
        }
    },

    handleMiss: function(shape) {
        // missing the target may penalize in timed mode
        if (shape.type === this.targetShape) {
            // penalty or time reduction
            if (this.mode === 'timed') {
                this.timeLeft = Math.max(0, this.timeLeft - 2);
                ParticleSystem.spawnBurst(shape.x + shape.size/2, Engine.canvas.height - 20, 'danger');
                Sound.play('miss');
            } else if (this.mode === 'survival') {
                // survival: reduce score or speed up difficulty
                this.score = Math.max(0, this.score - 1);
                ParticleSystem.spawnBurst(shape.x + shape.size/2, Engine.canvas.height - 20, 'danger');
                Sound.play('miss');
            }
        } else {
            // no penalty for missing non-targets by default
        }
    },

    // helper to detect left/right control touch areas
    _isTouchingLeftControl: function(x) {
        // left control is the left 25% of the canvas
        return x <= Engine.baseWidth * 0.25;
    },
    _isTouchingRightControl: function(x) {
        // right control is the right 25% of the canvas
        return x >= Engine.baseWidth * 0.75;
    },

    endGame: function() {
        // record high score
        try {
            if (typeof Scoring !== 'undefined') Scoring.saveHighScore('game1', null, this.score);
        } catch (e) { /* ignore */ }

        // show result overlay instead of immediately leaving
        this.ended = true;
        this.resultIsWin = false; // treat time out as game over
        this.resultMessage = 'Game Over';
    },

    // result overlay helpers
    _handleResultInput: function(x, y) {
        // buttons centered
        const w = Engine.canvas.width, h = Engine.canvas.height;
        const btnW = 160, btnH = 48;
        const cx = Math.floor(w/2);
        const by = Math.floor(h/2) + 30;
        const restartRect = { x: cx - btnW - 10, y: by, w: btnW, h: btnH };
        const menuRect = { x: cx + 10, y: by, w: btnW, h: btnH };
        if (x >= restartRect.x && x <= restartRect.x + restartRect.w && y >= restartRect.y && y <= restartRect.y + restartRect.h) {
            // Restart: clear overlay and reset input, then set scene
            this.ended = false;
            this._resultTouchDown = false;
            // clear Engine input flags that may cause immediate menu navigation
            Engine.clearInput && Engine.clearInput();
            Engine.setScene(Game1, { mode: this.mode, timeLimit: this.timeLimit });
            return true;
        }
        if (x >= menuRect.x && x <= menuRect.x + menuRect.w && y >= menuRect.y && y <= menuRect.y + menuRect.h) {
            // Main Menu
            this.ended = false;
            this._resultTouchDown = false;
            Engine.clearInput && Engine.clearInput();
            Engine.setScene(GameManager.MenuScene);
            return true;
        }
        return false;
    },

    drawShape: function(ctx, s) {
        switch (s.type) {
            case 'square':
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(s.x, s.y, s.size, s.size);
                break;
            case 'circle':
                ctx.fillStyle = '#ffd93d';
                ctx.beginPath();
                ctx.arc(s.x + s.size / 2, s.y + s.size / 2, s.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.fillStyle = '#6bc1ff';
                ctx.beginPath();
                ctx.moveTo(s.x + s.size / 2, s.y);
                ctx.lineTo(s.x + s.size, s.y + s.size);
                ctx.lineTo(s.x, s.y + s.size);
                ctx.closePath();
                ctx.fill();
                break;
        }
    },

    render: function(ctx) {
        // Clear background
        ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);

        // Draw the train
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.train.x, this.train.y, this.train.width, this.train.height);

        // Draw the target shape on the train (centered)
        const trainIconSize = 20; // icon size
        const tx = this.train.x + this.train.width / 2 - trainIconSize / 2;
        const ty = this.train.y + this.train.height / 2 - trainIconSize / 2;
        ctx.save();
        switch (this.targetShape) {
            case 'square':
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(tx, ty, trainIconSize, trainIconSize);
                break;
            case 'circle':
                ctx.fillStyle = '#ffd93d';
                ctx.beginPath();
                ctx.arc(tx + trainIconSize / 2, ty + trainIconSize / 2, trainIconSize / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.fillStyle = '#6bc1ff';
                ctx.beginPath();
                ctx.moveTo(tx + trainIconSize / 2, ty);
                ctx.lineTo(tx + trainIconSize, ty + trainIconSize);
                ctx.lineTo(tx, ty + trainIconSize);
                ctx.closePath();
                ctx.fill();
                break;
        }
        ctx.restore();

        // Draw falling shapes
        for (const s of this.shapes) {
            this.drawShape(ctx, s);
        }

        // Compact HUD
        const margin = 12;
        // Score - top-left
        if (typeof UIHud !== 'undefined') {
            UIHud.drawScore(ctx, margin, margin + 18, this.score);
        } else {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Score: ' + this.score, margin, margin + 18);
        }

        // Target icon - top-center
        const targetIconSize = 22;
        const centerX = Math.floor(Engine.canvas.width / 2 - targetIconSize / 2);
        if (typeof UIHud !== 'undefined') {
            UIHud.drawTargetIcon(ctx, centerX, margin, this.targetShape, targetIconSize);
        } else {
            // fallback draw small icon
            const icon = { type: this.targetShape, x: centerX, y: margin, size: targetIconSize };
            this.drawShape(ctx, icon);
        }

        // Time - top-right (if timed mode)
        if (this.mode === 'timed') {
            ctx.fillStyle = 'white';
            ctx.font = '18px Arial';
            const timeStr = 'Time: ' + Math.ceil(this.timeLeft);
            const textW = ctx.measureText(timeStr).width;
            ctx.fillText(timeStr, Engine.canvas.width - margin - textW, margin + 18);
        }
        
        // Draw particles (over everything)
        ParticleSystem.updateAndRender(ctx, this.deltaTime || 0.016);

        // Draw on-screen controls (semi-transparent) for mobile
        this._renderControls(ctx);

        // Result overlay
        if (this.ended) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,Engine.canvas.width, Engine.canvas.height);
            ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '36px Arial';
            ctx.fillText(this.resultMessage || 'Game Over', Engine.canvas.width/2, Engine.canvas.height/2 - 20);
            // buttons
            const btnW = 160, btnH = 48;
            const cx = Math.floor(Engine.canvas.width/2);
            const by = Math.floor(Engine.canvas.height/2) + 30;
            // restart
            ctx.fillStyle = '#4CAF50'; ctx.fillRect(cx - btnW - 10, by, btnW, btnH);
            ctx.fillStyle = 'white'; ctx.font = '20px Arial'; ctx.fillText('Restart', cx - btnW/2 - 10, by + btnH/2 + 6);
            // menu
            ctx.fillStyle = '#2196F3'; ctx.fillRect(cx + 10, by, btnW, btnH);
            ctx.fillStyle = 'white'; ctx.fillText('Main Menu', cx + btnW/2 + 10, by + btnH/2 + 6);
            ctx.restore();
        }
    }
};
// expose as global for dynamic loader
window.Game1 = Game1;

// Simple particle system local to this game file
// ParticleSystem and Sound are provided by shared modules (assets/js/shared/particles.js and sound.js)

// add control rendering helpers to Game1
Game1._renderControls = function(ctx) {
    const w = Engine.baseWidth;
    const h = Engine.baseHeight;
    const btnW = Math.floor(w * 0.22);
    const btnH = Math.floor(h * 0.22);
    const margin = 14;
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000000';
    // left button
    ctx.fillRect(margin, h - btnH - margin, btnW, btnH);
    // right button
    ctx.fillRect(w - btnW - margin, h - btnH - margin, btnW, btnH);
    ctx.globalAlpha = 1;
    // arrows
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u25C0', margin + btnW/2, h - btnH/2 - margin); // left arrow
    ctx.fillText('\u25B6', w - btnW/2 - margin, h - btnH/2 - margin); // right arrow
    ctx.restore();
};

