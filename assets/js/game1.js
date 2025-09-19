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
    spawnInterval: 1.0, // seconds

    update: function(deltaTime) {
        // Handle keyboard input
        if (Engine.keys['ArrowLeft'] && this.train.x > 0) {
            this.train.x -= this.train.speed * deltaTime;
        }
        if (Engine.keys['ArrowRight'] && this.train.x < Engine.canvas.width - this.train.width) {
            this.train.x += this.train.speed * deltaTime;
        }

        // Handle touch input
        if (Engine.isTouchDevice && Engine.touch.isDown) {
            const touchX = Engine.touch.x;
            const trainCenter = this.train.x + this.train.width / 2;

            if (touchX < trainCenter && this.train.x > 0) {
                this.train.x -= this.train.speed * deltaTime;
            } else if (touchX > trainCenter && this.train.x < Engine.canvas.width - this.train.width) {
                this.train.x += this.train.speed * deltaTime;
            }
        }

        // Spawn shapes over time
        this.spawnTimer += deltaTime;
        while (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            this.spawnShape();
        }

        // Update falling shapes
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const s = this.shapes[i];
            s.y += s.vy * deltaTime;

            // Check catch (simple bounding box approximation)
            const caught = s.y + s.size >= this.train.y &&
                s.x < this.train.x + this.train.width &&
                s.x + s.size > this.train.x;

            if (caught) {
                if (s.type === this.targetShape) {
                    this.score += 1;
                } else {
                    this.score = Math.max(0, this.score - 1);
                }
                this.shapes.splice(i, 1);
                continue;
            }

            // Remove shapes that fall past the bottom
            if (s.y - s.size > Engine.canvas.height) {
                this.shapes.splice(i, 1);
            }
        }
    },

    spawnShape: function() {
        const types = ['square', 'circle', 'triangle'];
        const type = types[Math.floor(Math.random() * types.length)];
        const size = 24 + Math.floor(Math.random() * 32); // 24-55 px
        const x = Math.floor(Math.random() * Math.max(1, (Engine.canvas.width - size)));
        const y = -size;
        const vy = 80 + Math.random() * 160; // fall speed

        this.shapes.push({ type, x, y, size, vy });
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
        const ts = 20; // icon size
        const tx = this.train.x + this.train.width / 2 - ts / 2;
        const ty = this.train.y + this.train.height / 2 - ts / 2;
        ctx.save();
        switch (this.targetShape) {
            case 'square':
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(tx, ty, ts, ts);
                break;
            case 'circle':
                ctx.fillStyle = '#ffd93d';
                ctx.beginPath();
                ctx.arc(tx + ts / 2, ty + ts / 2, ts / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.fillStyle = '#6bc1ff';
                ctx.beginPath();
                ctx.moveTo(tx + ts / 2, ty);
                ctx.lineTo(tx + ts, ty + ts);
                ctx.lineTo(tx, ty + ts);
                ctx.closePath();
                ctx.fill();
                break;
        }
        ctx.restore();

        // Draw falling shapes
        for (const s of this.shapes) {
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
        }

        // Draw the score and target shape
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Score: ' + this.score, 10, 30);
        ctx.fillText('Catch the ' + this.targetShape + '!', 10, 60);
    }
};
