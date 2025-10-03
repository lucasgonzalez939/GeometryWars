// game-manager.js
const GameManager = {
    // Registry of available games. Each entry points to a script and the global scene name
    games: [
        { id: 'game1', title: 'Shape Sorter Express', script: 'assets/js/games/game1.js', global: 'Game1' },
        { id: 'game2', title: 'Shape Detective', script: 'assets/js/games/game2.js', global: 'Game2' },
    { id: 'game3', title: 'Block Builder Challenge', script: 'assets/js/games/game3.js', global: 'Game3' },
    { id: 'game4', title: 'Shooter Sweep', script: 'assets/js/games/game4.js', global: 'Game4' },
        { id: 'game5', title: 'Polygon Platformer', script: 'assets/js/games/game5.js', global: 'Game5' },
        { id: 'game6', title: 'Galactic Geometry Blaster', script: 'assets/js/games/game6.js', global: 'Game6' },
        { id: 'game7', title: 'Tangram Master', script: 'assets/js/games/game7.js', global: 'Game7' }
    ],

    currentGameId: null,
    currentLevel: 1,

    // Return to main menu from any game
    returnToMenu: function() {
        this.currentGameId = null;
        this.currentLevel = 1;
        Engine.clearInput && Engine.clearInput();
        Engine.setScene(this.MenuScene);
    },

    // Start next level for current game
    startNextLevel: function() {
        if (this.currentGameId) {
            this.currentLevel++;
            this.startGame(this.currentGameId, { level: this.currentLevel });
        }
    },

    // Restart current level
    restartLevel: function() {
        if (this.currentGameId) {
            this.startGame(this.currentGameId, { level: this.currentLevel });
        }
    },

    // Main menu scene
    MenuScene: {
        selectedIndex: 0,
        touchWasDown: false,
        // per-card animation state (0..1) where 1 means fully selected
        _cardAnims: null,
        // navigation timing to prevent instant wrapping when holding keys
        _navState: {
            lastNavTime: 0,
            initialDelay: 200, // ms before repeat
            repeatDelay: 80,   // ms between repeats when held
            holdingKey: null
        },

        onEnter: function() {
            this.selectedIndex = 0;
            this.touchWasDown = false;
            // init per-card animation values
            this._cardAnims = new Array(GameManager.games.length).fill(0);
        },

        update: function(dt) {
            // Update game mode modal first
            if (GameModeModal.isVisible) {
                GameModeModal.update(dt);
                return; // Don't process menu input while modal is open
            }

            // navigate menu with ArrowUp / ArrowDown using timing to avoid immediate wrap
            const now = performance.now();
            const nav = this._navState;
            const up = Engine.codes['ArrowUp'] || Engine.keys['ArrowUp'];
            const down = Engine.codes['ArrowDown'] || Engine.keys['ArrowDown'];

            function doNav(dir) {
                if (dir === -1) this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                else if (dir === 1) this.selectedIndex = Math.min(GameManager.games.length - 1, this.selectedIndex + 1);
            }

            if (up || down) {
                const key = up ? 'ArrowUp' : 'ArrowDown';
                if (nav.holdingKey !== key) {
                    // new press
                    nav.holdingKey = key;
                    nav.lastNavTime = now;
                    doNav.call(this, up ? -1 : 1);
                } else {
                    // held: check delays
                    const elapsed = now - nav.lastNavTime;
                    const delay = elapsed > nav.initialDelay ? nav.repeatDelay : nav.initialDelay;
                    if (elapsed >= delay) {
                        nav.lastNavTime = now;
                        doNav.call(this, up ? -1 : 1);
                    }
                }
            } else {
                // no nav key held
                nav.holdingKey = null;
                nav.lastNavTime = 0;
            }

            // Start on Enter/Space or pointer/tap (use normalized codes)
            if (Engine.codes['Enter'] || Engine.codes['Space']) {
                const gameId = GameManager.games[this.selectedIndex].id;
                GameManager.startGame(gameId);
                // clear to avoid repeated triggers
                Engine.codes['Enter'] = false; Engine.codes['Space'] = false;
                Engine.keys['Enter'] = false; Engine.keys[' '] = false;
            }

            // Touch start -> start selected
            // Touch/click handling: act on release and support card Start button hit tests
            if (!Engine.touch.isDown && this.touchWasDown) {
                // on release: check if we have card rects and hit any Start buttons
                if (this._cardRects) {
                    const tx = Engine.touch.x, ty = Engine.touch.y;
                    for (let i = 0; i < this._cardRects.length; i++) {
                        const r = this._cardRects[i];
                        if (tx >= r.btnX && tx <= r.btnX + r.btnW && ty >= r.btnY && ty <= r.btnY + r.btnH) {
                            const gameId = GameManager.games[i].id; GameManager.startGame(gameId); break;
                        }
                        // allow tapping card body to select it
                        if (tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h) { this.selectedIndex = i; }
                    }
                }
            }
            // update touchWasDown state
            this.touchWasDown = Engine.touch.isDown;
            if (!Engine.touch.isDown) this.touchWasDown = false;

            // advance card animations toward selectedIndex
            if (!this._cardAnims || this._cardAnims.length !== GameManager.games.length) this._cardAnims = new Array(GameManager.games.length).fill(0);
            for (let i = 0; i < this._cardAnims.length; i++) {
                const target = (i === this.selectedIndex) ? 1 : 0;
                // simple eased approach
                const v = this._cardAnims[i];
                const speed = 6; // higher = snappier
                this._cardAnims[i] = v + (target - v) * Math.min(1, (dt/1000) * speed);
            }
        },

        render: function(ctx) {
            // Card-style menu
            ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
            
            // Set dark background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.font = '28px Arial';
            ctx.fillText('Geometry Games', 32, 54);

            // layout cards
            const cols = Math.min(3, GameManager.games.length);
            const cardW = Math.floor((Engine.canvas.width - 80 - (cols-1)*20) / cols);
            const cardH = 120;
            const startX = 40;
            const startY = 100;

            for (let i = 0; i < GameManager.games.length; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = startX + col * (cardW + 20);
                const y = startY + row * (cardH + 18);
                const g = GameManager.games[i];
                // animated scale based on _cardAnims
                const anim = (this._cardAnims && this._cardAnims[i]) ? this._cardAnims[i] : (i === this.selectedIndex ? 1 : 0);
                const scale = 1 + 0.06 * anim; // slight pop when selected
                const cx = x + cardW/2, cy = y + cardH/2;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(scale, scale);
                ctx.translate(-cx, -cy);

                // background
                ctx.fillStyle = (i === this.selectedIndex) ? '#173e58' : '#0f2432';
                ctx.fillRect(x, y, cardW, cardH);
                ctx.strokeStyle = '#255a78'; ctx.strokeRect(x, y, cardW, cardH);

                // title: render up to 2 lines and ellipsize if too long
                const px = x + 12, py = y + 24;
                ctx.fillStyle = 'white'; ctx.font = '16px Arial'; ctx.textAlign = 'left';
                this._drawWrappedTitle(ctx, g.title, px, py, cardW - 24, 2);

                // subtitle/id
                ctx.fillStyle = '#cfe8fa'; ctx.font = '12px Arial'; ctx.fillText(g.id || g.title, x + 12, y + 64);

                // start button on card
                const btnW = 76, btnH = 28; const bx = x + cardW - btnW - 12, by = y + cardH - btnH - 12;
                ctx.fillStyle = '#2b9cff'; ctx.fillRect(bx, by, btnW, btnH);
                ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '14px Arial'; ctx.fillText('Play', bx + btnW/2, by + btnH/2 + 5);

                ctx.restore();

                // store last card rect for hit testing on the scene object so update() can use it
                if (!this._cardRects) this._cardRects = [];
                this._cardRects[i] = { x, y, w: cardW, h: cardH, btnX: bx, btnY: by, btnW, btnH };
            }

            // small hint
            ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.fillText('Use Arrow keys or Tap cards to start', Engine.canvas.width / 2, Engine.canvas.height - 28);
            
            // Render game mode modal on top if visible
            GameModeModal.render(ctx);
        },

        // helper: draw wrapped title with maxLines and ellipsis
        _drawWrappedTitle: function(ctx, text, x, y, maxWidth, maxLines) {
            // quick split by spaces and greedy fit
            const words = text.split(' ');
            const lines = [];
            let cur = '';
            for (let i = 0; i < words.length; i++) {
                const test = cur ? (cur + ' ' + words[i]) : words[i];
                const w = ctx.measureText(test).width;
                if (w <= maxWidth) cur = test;
                else {
                    if (cur) lines.push(cur);
                    cur = words[i];
                    if (lines.length >= maxLines) break;
                }
            }
            if (cur && lines.length < maxLines) lines.push(cur);

            // if more than maxLines, ellipsize last line
            if (lines.length > maxLines) lines.length = maxLines;
            if (lines.length === maxLines) {
                // check if original text fits; if not, ellipsize last
                const lastIdx = lines.length - 1;
                let last = lines[lastIdx];
                while (ctx.measureText(last + '…').width > maxWidth && last.length > 0) {
                    last = last.slice(0, -1);
                }
                lines[lastIdx] = last + (last.length < words.join(' ').length ? '…' : '');
            }

            // render lines
            for (let i = 0; i < lines.length && i < maxLines; i++) {
                ctx.fillText(lines[i], x, y + i * 20);
            }
        },
    },

    init: function() {
        // Initialize engine with the main menu
        Engine.init('gameCanvas', this.MenuScene);
    },

    // Dynamically load a script if needed, resolve when the global is present
    _loadScriptIfNeeded: function(game) {
        return new Promise((resolve, reject) => {
            if (window[game.global]) return resolve();
            // check if a script tag for this src already exists
            const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.indexOf(game.script) !== -1);
            if (existing) {
                // wait a bit for global to appear
                const timeout = setInterval(() => {
                    if (window[game.global]) { clearInterval(timeout); resolve(); }
                }, 50);
                setTimeout(() => { clearInterval(timeout); reject(new Error('Timed out loading ' + game.script)); }, 5000);
                return;
            }

            const tag = document.createElement('script');
            tag.src = game.script;
            tag.onload = () => {
                // give it a frame to initialize globals
                setTimeout(() => {
                    if (window[game.global]) resolve();
                    else reject(new Error('Loaded script but global ' + game.global + ' not found'));
                }, 10);
            };
            tag.onerror = (e) => reject(e);
            document.body.appendChild(tag);
        });
    },

    startGame: async function(gameId, params) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return console.error('Unknown gameId', gameId);
        this.currentGameId = gameId;
        
        // Set level tracking
        if (params && params.level) {
            this.currentLevel = params.level;
        } else {
            this.currentLevel = 1;
        }

        // Check if this game supports multiple modes
        const gamesWithModes = ['game1', 'game4', 'game6'];
        if (gamesWithModes.includes(gameId) && !params?.mode) {
            // Show mode selection modal
            GameModeModal.show((selectedMode) => {
                // Start the game with selected mode
                this.startGame(gameId, { ...params, mode: selectedMode });
            });
            return;
        }

        try {
            await this._loadScriptIfNeeded(game);

            // Game-specific pre-start hooks
            if (gameId === 'game1' && window.Game1) {
                const types = ['square', 'circle', 'triangle'];
                window.Game1.targetShape = types[Math.floor(Math.random() * types.length)];
            }

            // Switch scene with level parameter
            const scene = window[game.global];
            if (scene) {
                const gameParams = { 
                    level: this.currentLevel,
                    ...(params || {})
                };
                Engine.setScene(scene, gameParams);
            } else {
                console.error('Scene not found after loading', game.global);
            }
        } catch (e) {
            console.error('Failed to load game', gameId, e);
        }
    }
};

