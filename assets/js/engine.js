// engine.js
const Engine = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    deltaTime: 0,
    currentScene: null,
    keys: {},
    codes: {},
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    touch: {
        x: null,
        y: null,
        isDown: false
    },
    // logical size and scale for responsive rendering
    baseWidth: 800,
    baseHeight: 600,
    scale: 1,
    offsetX: 0,
    offsetY: 0,

    init: function(canvasId, initialScene) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentScene = initialScene;
        this.bindEvents();
        // Responsive setup
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Start the RAF loop so the first call receives a timestamp
        requestAnimationFrame(this.loop.bind(this));
    },

    bindEvents: function() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.code) this.codes[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            if (e.code) this.codes[e.code] = false;
        });

        // Mouse events (normalized to canvas logical coordinates)
        this.canvas.addEventListener('mousedown', (e) => {
            const p = this._screenToCanvas(e.clientX, e.clientY);
            this.touch.x = p.x; this.touch.y = p.y; this.touch.isDown = true;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const p = this._screenToCanvas(e.clientX, e.clientY);
            this.touch.x = p.x; this.touch.y = p.y;
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.touch.isDown = false;
        });

        // Touch events (map to same normalized touch state)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const p = e.touches[0];
            const pos = this._screenToCanvas(p.clientX, p.clientY);
            this.touch.x = pos.x; this.touch.y = pos.y; this.touch.isDown = true;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const p = e.touches[0];
            const pos = this._screenToCanvas(p.clientX, p.clientY);
            this.touch.x = pos.x; this.touch.y = pos.y;
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.isDown = false;
        }, { passive: false });
    },

    // Convert screen/client coordinates to logical canvas coordinates
    _screenToCanvas: function(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        // rect.width/height are the displayed size; map client coords back to logical canvas space
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        return { x, y };
    },

    // Resize canvas while keeping a logical coordinate system
    resize: function() {
        const containerW = window.innerWidth;
        const containerH = window.innerHeight;

        // Fit canvas inside the viewport while preserving aspect ratio
        const scaleX = containerW / this.baseWidth;
        const scaleY = containerH / this.baseHeight;
        this.scale = Math.min(scaleX, scaleY);

        const displayWidth = Math.floor(this.baseWidth * this.scale);
        const displayHeight = Math.floor(this.baseHeight * this.scale);

        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Centering offsets
        this.offsetX = Math.floor((containerW - displayWidth) / 2);
        this.offsetY = Math.floor((containerH - displayHeight) / 2);

        // Ensure actual drawing buffer size matches logical size
        if (this.canvas.width !== this.baseWidth || this.canvas.height !== this.baseHeight) {
            this.canvas.width = this.baseWidth;
            this.canvas.height = this.baseHeight;
        }
    },

    setScene: function(newScene, params) {
        if (this.currentScene && typeof this.currentScene.onExit === 'function') {
            try { this.currentScene.onExit(); } catch (e) { console.error(e); }
        }
        this.currentScene = newScene;
        if (this.currentScene && typeof this.currentScene.onEnter === 'function') {
            try { this.currentScene.onEnter(params); } catch (e) { console.error(e); }
        }
    },

    // Clear transient input state (used when switching scenes to avoid stale input)
    clearInput: function() {
        this.touch.x = null; this.touch.y = null; this.touch.isDown = false;
        // clear keys and codes
        for (const k in this.keys) if (Object.prototype.hasOwnProperty.call(this.keys, k)) this.keys[k] = false;
        for (const c in this.codes) if (Object.prototype.hasOwnProperty.call(this.codes, c)) this.codes[c] = false;
    },

    loop: function(timestamp) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.currentScene) {
            this.currentScene.update(this.deltaTime);
            this.currentScene.render(this.ctx);
        }

        requestAnimationFrame(this.loop.bind(this));
    }
};
