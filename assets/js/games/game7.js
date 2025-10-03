// Game 7: Tangram Master
const Game7 = {
  // Tangram pieces - 7 traditional pieces
  pieces: [],
  placedPieces: [],
  targetShape: null,
  dragging: null,
  dragOffset: { x: 0, y: 0 },
  
  // Game state
  level: 1,
  score: 0,
  ended: false,
  resultMessage: '',
  canAdvanceLevel: false,
  _resultTouchDown: false,
  _resultButtonRects: null,
  
  // Snap settings
  snapDistance: 25,
  gridSize: 20,
  
  // Touch/drag state
  _touchWasDown: false,
  _selectedPiece: null,
  _rotateLeftDown: false,
  _rotateRightDown: false,
  
  // Available tangram puzzles - 30 levels for primary school kids
  puzzles: [
    // LEVEL 1-5: Simple shapes (Easy)
    {
      id: 'square_simple',
      name: 'Big Square',
      targetPoints: [
        { x: 350, y: 200 }, { x: 450, y: 200 },
        { x: 450, y: 300 }, { x: 350, y: 300 }
      ],
      difficulty: 1
    },
    {
      id: 'triangle_simple',
      name: 'Triangle',
      targetPoints: [
        { x: 400, y: 180 }, { x: 320, y: 320 }, { x: 480, y: 320 }
      ],
      difficulty: 1
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      targetPoints: [
        { x: 320, y: 220 }, { x: 480, y: 220 },
        { x: 480, y: 280 }, { x: 320, y: 280 }
      ],
      difficulty: 1
    },
    {
      id: 'diamond',
      name: 'Diamond',
      targetPoints: [
        { x: 400, y: 180 }, { x: 460, y: 240 },
        { x: 400, y: 300 }, { x: 340, y: 240 }
      ],
      difficulty: 1
    },
    {
      id: 'arrow_up',
      name: 'Arrow Up',
      targetPoints: [
        { x: 400, y: 160 }, { x: 440, y: 200 }, { x: 420, y: 200 },
        { x: 420, y: 280 }, { x: 380, y: 280 }, { x: 380, y: 200 }, { x: 360, y: 200 }
      ],
      difficulty: 2
    },

    // LEVEL 6-10: Basic animals (Easy-Medium)
    {
      id: 'fish',
      name: 'Fish',
      targetPoints: [
        { x: 280, y: 240 }, { x: 360, y: 200 }, { x: 440, y: 220 },
        { x: 480, y: 240 }, { x: 440, y: 260 }, { x: 360, y: 280 }
      ],
      difficulty: 2
    },
    {
      id: 'bird_simple',
      name: 'Little Bird',
      targetPoints: [
        { x: 320, y: 200 }, { x: 380, y: 180 }, { x: 420, y: 200 },
        { x: 400, y: 240 }, { x: 360, y: 260 }, { x: 340, y: 230 }
      ],
      difficulty: 2
    },
    {
      id: 'cat_sitting',
      name: 'Sitting Cat',
      targetPoints: [
        { x: 350, y: 180 }, { x: 370, y: 160 }, { x: 390, y: 180 },
        { x: 420, y: 200 }, { x: 420, y: 280 }, { x: 320, y: 280 }, { x: 320, y: 200 }
      ],
      difficulty: 2
    },
    {
      id: 'dog_head',
      name: 'Dog Head',
      targetPoints: [
        { x: 320, y: 180 }, { x: 360, y: 160 }, { x: 400, y: 180 },
        { x: 440, y: 200 }, { x: 420, y: 260 }, { x: 380, y: 280 }, { x: 340, y: 260 }, { x: 300, y: 200 }
      ],
      difficulty: 2
    },
    {
      id: 'rabbit',
      name: 'Rabbit',
      targetPoints: [
        { x: 360, y: 140 }, { x: 380, y: 120 }, { x: 400, y: 140 },
        { x: 440, y: 180 }, { x: 420, y: 240 }, { x: 380, y: 260 }, { x: 340, y: 240 }, { x: 320, y: 180 }
      ],
      difficulty: 3
    },

    // LEVEL 11-15: Objects & vehicles (Medium)
    {
      id: 'house_simple',
      name: 'Little House',
      targetPoints: [
        { x: 340, y: 200 }, { x: 400, y: 160 }, { x: 460, y: 200 },
        { x: 460, y: 280 }, { x: 340, y: 280 }
      ],
      difficulty: 2
    },
    {
      id: 'tree',
      name: 'Tree',
      targetPoints: [
        { x: 380, y: 160 }, { x: 420, y: 200 }, { x: 440, y: 220 },
        { x: 420, y: 240 }, { x: 410, y: 240 }, { x: 410, y: 300 },
        { x: 390, y: 300 }, { x: 390, y: 240 }, { x: 380, y: 240 }, { x: 360, y: 220 }
      ],
      difficulty: 3
    },
    {
      id: 'boat',
      name: 'Sailboat',
      targetPoints: [
        { x: 350, y: 180 }, { x: 380, y: 160 }, { x: 400, y: 180 },
        { x: 450, y: 220 }, { x: 420, y: 260 }, { x: 320, y: 260 }, { x: 330, y: 220 }
      ],
      difficulty: 3
    },
    {
      id: 'car',
      name: 'Car',
      targetPoints: [
        { x: 300, y: 220 }, { x: 340, y: 200 }, { x: 460, y: 200 },
        { x: 500, y: 220 }, { x: 480, y: 260 }, { x: 440, y: 280 },
        { x: 360, y: 280 }, { x: 320, y: 260 }
      ],
      difficulty: 3
    },
    {
      id: 'rocket',
      name: 'Rocket',
      targetPoints: [
        { x: 400, y: 140 }, { x: 420, y: 180 }, { x: 430, y: 220 },
        { x: 420, y: 260 }, { x: 400, y: 280 }, { x: 380, y: 260 },
        { x: 370, y: 220 }, { x: 380, y: 180 }
      ],
      difficulty: 3
    },

    // LEVEL 16-20: Complex animals (Medium-Hard)
    {
      id: 'swan',
      name: 'Swan',
      targetPoints: [
        { x: 300, y: 200 }, { x: 340, y: 180 }, { x: 380, y: 200 },
        { x: 420, y: 180 }, { x: 460, y: 220 }, { x: 440, y: 260 },
        { x: 400, y: 280 }, { x: 360, y: 260 }, { x: 320, y: 240 }
      ],
      difficulty: 4
    },
    {
      id: 'elephant',
      name: 'Elephant',
      targetPoints: [
        { x: 280, y: 200 }, { x: 320, y: 180 }, { x: 360, y: 160 },
        { x: 420, y: 180 }, { x: 460, y: 220 }, { x: 440, y: 280 },
        { x: 400, y: 300 }, { x: 340, y: 300 }, { x: 300, y: 280 }, { x: 260, y: 240 }
      ],
      difficulty: 4
    },
    {
      id: 'giraffe',
      name: 'Giraffe',
      targetPoints: [
        { x: 380, y: 120 }, { x: 400, y: 140 }, { x: 390, y: 180 },
        { x: 420, y: 220 }, { x: 450, y: 260 }, { x: 430, y: 300 },
        { x: 390, y: 320 }, { x: 370, y: 280 }, { x: 360, y: 240 }, { x: 370, y: 200 }
      ],
      difficulty: 4
    },
    {
      id: 'horse',
      name: 'Horse',
      targetPoints: [
        { x: 300, y: 180 }, { x: 340, y: 160 }, { x: 380, y: 180 },
        { x: 420, y: 200 }, { x: 460, y: 240 }, { x: 440, y: 300 },
        { x: 400, y: 320 }, { x: 360, y: 300 }, { x: 320, y: 280 }, { x: 280, y: 220 }
      ],
      difficulty: 4
    },
    {
      id: 'penguin',
      name: 'Penguin',
      targetPoints: [
        { x: 380, y: 160 }, { x: 420, y: 180 }, { x: 440, y: 220 },
        { x: 430, y: 280 }, { x: 400, y: 320 }, { x: 380, y: 300 },
        { x: 360, y: 280 }, { x: 350, y: 220 }, { x: 360, y: 180 }
      ],
      difficulty: 4
    },

    // LEVEL 21-25: Advanced shapes (Hard)
    {
      id: 'castle',
      name: 'Castle',
      targetPoints: [
        { x: 300, y: 180 }, { x: 320, y: 160 }, { x: 340, y: 180 },
        { x: 360, y: 160 }, { x: 380, y: 180 }, { x: 400, y: 160 },
        { x: 420, y: 180 }, { x: 440, y: 160 }, { x: 460, y: 180 },
        { x: 480, y: 200 }, { x: 480, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 200 }
      ],
      difficulty: 5
    },
    {
      id: 'airplane',
      name: 'Airplane',
      targetPoints: [
        { x: 320, y: 220 }, { x: 380, y: 200 }, { x: 440, y: 180 },
        { x: 500, y: 200 }, { x: 480, y: 240 }, { x: 420, y: 260 },
        { x: 380, y: 280 }, { x: 340, y: 260 }, { x: 300, y: 240 }
      ],
      difficulty: 5
    },
    {
      id: 'butterfly',
      name: 'Butterfly',
      targetPoints: [
        { x: 340, y: 180 }, { x: 380, y: 160 }, { x: 420, y: 180 },
        { x: 460, y: 200 }, { x: 440, y: 240 }, { x: 420, y: 260 },
        { x: 400, y: 280 }, { x: 380, y: 260 }, { x: 360, y: 240 },
        { x: 340, y: 200 }
      ],
      difficulty: 5
    },
    {
      id: 'flower',
      name: 'Flower',
      targetPoints: [
        { x: 380, y: 160 }, { x: 420, y: 180 }, { x: 440, y: 220 },
        { x: 420, y: 260 }, { x: 380, y: 280 }, { x: 340, y: 260 },
        { x: 320, y: 220 }, { x: 340, y: 180 }, { x: 390, y: 280 },
        { x: 410, y: 320 }, { x: 390, y: 320 }
      ],
      difficulty: 5
    },
    {
      id: 'lighthouse',
      name: 'Lighthouse',
      targetPoints: [
        { x: 380, y: 140 }, { x: 420, y: 160 }, { x: 430, y: 200 },
        { x: 420, y: 240 }, { x: 410, y: 280 }, { x: 430, y: 300 },
        { x: 370, y: 300 }, { x: 390, y: 280 }, { x: 380, y: 240 },
        { x: 370, y: 200 }, { x: 380, y: 160 }
      ],
      difficulty: 5
    },

    // LEVEL 26-30: Expert challenges (Very Hard)
    {
      id: 'dragon',
      name: 'Dragon',
      targetPoints: [
        { x: 280, y: 200 }, { x: 320, y: 160 }, { x: 380, y: 140 },
        { x: 440, y: 160 }, { x: 500, y: 200 }, { x: 480, y: 260 },
        { x: 420, y: 300 }, { x: 360, y: 320 }, { x: 300, y: 300 },
        { x: 240, y: 260 }, { x: 260, y: 220 }
      ],
      difficulty: 6
    },
    {
      id: 'windmill',
      name: 'Windmill',
      targetPoints: [
        { x: 350, y: 160 }, { x: 400, y: 140 }, { x: 450, y: 160 },
        { x: 470, y: 210 }, { x: 450, y: 260 }, { x: 400, y: 280 },
        { x: 350, y: 260 }, { x: 330, y: 210 }, { x: 390, y: 280 },
        { x: 410, y: 320 }, { x: 390, y: 320 }
      ],
      difficulty: 6
    },
    {
      id: 'peacock',
      name: 'Peacock',
      targetPoints: [
        { x: 300, y: 180 }, { x: 340, y: 160 }, { x: 380, y: 140 },
        { x: 420, y: 160 }, { x: 460, y: 180 }, { x: 480, y: 220 },
        { x: 460, y: 260 }, { x: 420, y: 280 }, { x: 380, y: 300 },
        { x: 340, y: 280 }, { x: 300, y: 260 }, { x: 280, y: 220 }
      ],
      difficulty: 6
    },
    {
      id: 'robot',
      name: 'Robot',
      targetPoints: [
        { x: 340, y: 160 }, { x: 380, y: 140 }, { x: 420, y: 160 },
        { x: 460, y: 180 }, { x: 440, y: 220 }, { x: 460, y: 260 },
        { x: 440, y: 300 }, { x: 400, y: 320 }, { x: 360, y: 300 },
        { x: 340, y: 260 }, { x: 360, y: 220 }, { x: 340, y: 180 }
      ],
      difficulty: 6
    },
    {
      id: 'spaceship',
      name: 'Spaceship',
      targetPoints: [
        { x: 350, y: 140 }, { x: 400, y: 120 }, { x: 450, y: 140 },
        { x: 480, y: 180 }, { x: 460, y: 220 }, { x: 440, y: 260 },
        { x: 400, y: 300 }, { x: 360, y: 260 }, { x: 340, y: 220 },
        { x: 320, y: 180 }
      ],
      difficulty: 6
    }
  ],

  onEnter: function(params) {
    this.level = (params && params.level) || 1;
    this.score = 0;
    this.ended = false;
    this.resultMessage = '';
    this.canAdvanceLevel = false;
    this._resultTouchDown = false;
    this.dragging = null;
    this._selectedPiece = null;
    this.hoveredPiece = null; // Initialize hover tracking
    
    this.initializePieces();
    this.selectTargetShape();
  },

  onExit: function() {
    this.pieces = [];
    this.placedPieces = [];
    this.targetShape = null;
  },

  initializePieces: function() {
    this.pieces = [];
    this.placedPieces = [];
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    const pieceSize = 40;
    
    // Traditional tangram pieces
    const tangramShapes = [
      // Large triangle 1
      {
        id: 'large_tri_1',
        points: [{ x: 0, y: 0 }, { x: pieceSize * 2, y: 0 }, { x: pieceSize, y: pieceSize }],
        color: colors[0],
        rotation: 0
      },
      // Large triangle 2
      {
        id: 'large_tri_2',
        points: [{ x: 0, y: 0 }, { x: pieceSize * 2, y: 0 }, { x: pieceSize, y: pieceSize }],
        color: colors[1],
        rotation: 0
      },
      // Medium triangle
      {
        id: 'medium_tri',
        points: [{ x: 0, y: 0 }, { x: pieceSize * 1.4, y: 0 }, { x: pieceSize * 0.7, y: pieceSize * 0.7 }],
        color: colors[2],
        rotation: 0
      },
      // Small triangle 1
      {
        id: 'small_tri_1',
        points: [{ x: 0, y: 0 }, { x: pieceSize, y: 0 }, { x: pieceSize * 0.5, y: pieceSize * 0.5 }],
        color: colors[3],
        rotation: 0
      },
      // Small triangle 2
      {
        id: 'small_tri_2',
        points: [{ x: 0, y: 0 }, { x: pieceSize, y: 0 }, { x: pieceSize * 0.5, y: pieceSize * 0.5 }],
        color: colors[4],
        rotation: 0
      },
      // Square
      {
        id: 'square',
        points: [
          { x: 0, y: 0 }, { x: pieceSize * 0.7, y: 0 },
          { x: pieceSize * 0.7, y: pieceSize * 0.7 }, { x: 0, y: pieceSize * 0.7 }
        ],
        color: colors[5],
        rotation: 0
      },
      // Parallelogram
      {
        id: 'parallelogram',
        points: [
          { x: 0, y: 0 }, { x: pieceSize, y: 0 },
          { x: pieceSize * 1.5, y: pieceSize * 0.5 }, { x: pieceSize * 0.5, y: pieceSize * 0.5 }
        ],
        color: colors[6],
        rotation: 0
      }
    ];

    // Position pieces in palette area (left side)
    for (let i = 0; i < tangramShapes.length; i++) {
      const shape = tangramShapes[i];
      this.pieces.push({
        ...shape,
        x: 50,
        y: 80 + i * 70,
        placed: false,
        originalX: 50,
        originalY: 80 + i * 70,
        // Animation properties
        _returning: false,
        _returnStart: 0,
        _returnDuration: 300,
        _startX: 0,
        _startY: 0
      });
    }
  },

  selectTargetShape: function() {
    const puzzleIndex = Math.min(this.puzzles.length - 1, this.level - 1);
    this.targetShape = this.puzzles[puzzleIndex];
  },

  update: function(deltaTime) {
    if (this.ended) {
      // Handle keyboard shortcuts
      if (Engine.keys['r'] || Engine.keys['R'] || Engine.codes['KeyR']) {
        this._onRestart();
        return;
      }
      if (Engine.keys['m'] || Engine.keys['M'] || Engine.codes['KeyM']) {
        this._onMainMenu();
        return;
      }
      if ((Engine.keys['n'] || Engine.keys['N'] || Engine.codes['KeyN']) && this.canAdvanceLevel) {
        this._onNextLevel();
        return;
      }
      
      // Handle touch input
      if (Engine.touch.isDown && !this._resultTouchDown) {
        this._resultTouchDown = true;
        const x = Engine.touch.x, y = Engine.touch.y;
        if (x != null && this._resultButtonRects) {
          ResultScreen.handleInput(x, y, this._resultButtonRects, {
            onRestart: () => this._onRestart(),
            onNextLevel: this.canAdvanceLevel ? () => this._onNextLevel() : null,
            onMainMenu: () => this._onMainMenu()
          });
        }
      }
      if (!Engine.touch.isDown) this._resultTouchDown = false;
      return;
    }

    // Escape key to return to menu
    if (Engine.keys['Escape'] || Engine.codes['Escape']) {
      this._onMainMenu();
      return;
    }

    // Update hover tracking for visual feedback
    this.updateHover();

    // Handle dragging
    this.handleDragAndDrop(deltaTime);
    
    // Handle rotation with R key or arrow keys
    if ((Engine.keys['r'] || Engine.keys['ArrowLeft'] || Engine.codes['ArrowLeft']) && !this._rotateLeftDown) {
      this._rotateLeftDown = true;
      if (this._selectedPiece) {
        this.rotatePiece(this._selectedPiece, -1); // Counter-clockwise
      }
    }
    if (!Engine.keys['r'] && !Engine.keys['ArrowLeft'] && !Engine.codes['ArrowLeft']) this._rotateLeftDown = false;

    if ((Engine.keys['ArrowRight'] || Engine.codes['ArrowRight']) && !this._rotateRightDown) {
      this._rotateRightDown = true;
      if (this._selectedPiece) {
        this.rotatePiece(this._selectedPiece, 1); // Clockwise
      }
    }
    if (!Engine.keys['ArrowRight'] && !Engine.codes['ArrowRight']) this._rotateRightDown = false;

    // Update piece animations
    this.updatePieceAnimations(deltaTime);
    
    // Check win condition
    this.checkWinCondition();
  },

  updateHover: function() {
    // Reset hover state
    this.hoveredPiece = null;
    
    // Only check hover when not dragging
    if (!this.dragging && Engine.touch.x != null && Engine.touch.y != null) {
      const tx = Engine.touch.x, ty = Engine.touch.y;
      
      // Check pieces from top to bottom for hover
      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const piece = this.pieces[i];
        if (this.isPointInPiece(tx, ty, piece)) {
          this.hoveredPiece = piece;
          break;
        }
      }
    }
  },

  handleDragAndDrop: function(deltaTime) {
    if (Engine.touch.isDown) {
      const tx = Engine.touch.x, ty = Engine.touch.y;
      
      if (this.dragging) {
        // Update dragging piece position
        this.dragging.x = tx - this.dragOffset.x;
        this.dragging.y = ty - this.dragOffset.y;
      } else if (!this._touchWasDown) {
        // Start dragging - find piece under touch
        this.startDrag(tx, ty);
      }
      this._touchWasDown = true;
    } else {
      // Touch released
      if (this.dragging) {
        this.endDrag();
      }
      this._touchWasDown = false;
    }
  },

  startDrag: function(x, y) {
    // Check pieces from top to bottom (reverse order for proper layering)
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const piece = this.pieces[i];
      if (this.isPointInPiece(x, y, piece)) {
        this.dragging = piece;
        this._selectedPiece = piece;
        this.dragOffset.x = x - piece.x;
        this.dragOffset.y = y - piece.y;
        
        // Move to end of array for proper rendering order
        this.pieces.splice(i, 1);
        this.pieces.push(piece);
        break;
      }
    }
  },

  endDrag: function() {
    if (!this.dragging) return;
    
    const piece = this.dragging;
    const snapResult = this.findSnapPosition(piece);
    
    if (snapResult) {
      // Snap to position
      piece.x = snapResult.x;
      piece.y = snapResult.y;
      piece.placed = true;
      this.score += 10;
      ParticleSystem.spawnBurst(piece.x + 20, piece.y + 20, 'square');
      Sound.play('success');
    } else {
      // Return to original position with animation
      this.returnPieceToOrigin(piece);
      Sound.play('miss');
    }
    
    this.dragging = null;
  },

  findSnapPosition: function(piece) {
    // Check if piece is in puzzle area (right side of screen)
    const puzzleAreaX = Engine.canvas.width * 0.4;
    if (piece.x < puzzleAreaX) return null;
    
    // Enhanced snapping - try multiple snap positions
    const snapTargets = [];
    
    // 1. Target shape edge snapping (highest priority)
    if (this.targetShape && this.targetShape.targetPoints) {
      // Snap to vertices
      for (const point of this.targetShape.targetPoints) {
        const dx = piece.x - point.x;
        const dy = piece.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.snapDistance * 1.5) {
          snapTargets.push({ x: point.x, y: point.y, priority: 10 });
        }
      }
      
      // Snap to edges
      for (let i = 0; i < this.targetShape.targetPoints.length; i++) {
        const p1 = this.targetShape.targetPoints[i];
        const p2 = this.targetShape.targetPoints[(i + 1) % this.targetShape.targetPoints.length];
        
        // Find closest point on the edge to the piece
        const closestPoint = this.getClosestPointOnLine(piece.x, piece.y, p1.x, p1.y, p2.x, p2.y);
        const dx = piece.x - closestPoint.x;
        const dy = piece.y - closestPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.snapDistance) {
          snapTargets.push({ x: closestPoint.x, y: closestPoint.y, priority: 8 });
        }
      }
    }
    
    // 2. Grid-based snapping (medium priority)
    const gridX = Math.round((piece.x - puzzleAreaX) / this.gridSize) * this.gridSize + puzzleAreaX;
    const gridY = Math.round(piece.y / this.gridSize) * this.gridSize;
    snapTargets.push({ x: gridX, y: gridY, priority: 3 });
    
    // 3. Edge-to-edge snapping with other pieces (lower priority)
    for (const other of this.pieces) {
      if (other !== piece && other.placed) {
        // Try snapping to adjacent positions
        const adjacentPositions = [
          { x: other.x + this.gridSize, y: other.y },
          { x: other.x - this.gridSize, y: other.y },
          { x: other.x, y: other.y + this.gridSize },
          { x: other.x, y: other.y - this.gridSize }
        ];
        
        for (const pos of adjacentPositions) {
          const dx = piece.x - pos.x;
          const dy = piece.y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < this.snapDistance * 1.2) {
            snapTargets.push({ x: pos.x, y: pos.y, priority: 5 });
          }
        }
      }
    }
    
    // Find best snap target
    let bestSnap = null;
    let bestScore = Infinity;
    
    for (const target of snapTargets) {
      if (this.isPositionValid(target.x, target.y, piece)) {
        const dx = piece.x - target.x;
        const dy = piece.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const score = distance - (target.priority * 5);
        
        if (score < bestScore) {
          bestScore = score;
          bestSnap = target;
        }
      }
    }
    
    return bestSnap;
  },

  // Helper function to find closest point on a line segment
  getClosestPointOnLine: function(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: x1, y: y1 };
    
    // Calculate parameter t for closest point
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    
    return {
      x: x1 + t * dx,
      y: y1 + t * dy
    };
  },

  // Helper to complete findSnapPosition function
  completeSnapLogic: function(snapTargets, piece) {
    // Find best snap target
    let bestSnap = null;
    let bestScore = Infinity;
    
    for (const target of snapTargets) {
      // Check if position is valid (not overlapping with other pieces)
      if (this.isPositionValid(target.x, target.y, piece)) {
        const dx = piece.x - target.x;
        const dy = piece.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const score = distance - (target.priority * 5); // Higher priority = better score
        
        if (score < bestScore) {
          bestScore = score;
          bestSnap = target;
        }
      }
    }
    
    return bestSnap;
  },

  isPositionValid: function(x, y, excludePiece) {
    // Check if position is valid (not too close to other placed pieces)
    for (const other of this.pieces) {
      if (other !== excludePiece && other.placed) {
        const dx = x - other.x;
        const dy = y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.snapDistance * 0.8) {
          return false; // Too close to another piece
        }
      }
    }
    return true;
  },

  returnPieceToOrigin: function(piece) {
    piece._returning = true;
    piece._returnStart = performance.now();
    piece._startX = piece.x;
    piece._startY = piece.y;
    piece.placed = false;
  },

  updatePieceAnimations: function(deltaTime) {
    const now = performance.now();
    
    for (const piece of this.pieces) {
      if (piece._returning) {
        const elapsed = now - piece._returnStart;
        const t = Math.min(1, elapsed / piece._returnDuration);
        const ease = 1 - Math.pow(1 - t, 3); // Ease out cubic
        
        piece.x = piece._startX + (piece.originalX - piece._startX) * ease;
        piece.y = piece._startY + (piece.originalY - piece._startY) * ease;
        
        if (t >= 1) {
          piece._returning = false;
          piece.x = piece.originalX;
          piece.y = piece.originalY;
        }
      }
    }
  },

  rotatePiece: function(piece, direction = 1) {
    // direction: 1 for clockwise, -1 for counter-clockwise
    const rotationAmount = direction * 45;
    piece.rotation = (piece.rotation + rotationAmount + 360) % 360;
    Sound.play('success');
  },

  isPointInPiece: function(x, y, piece) {
    // Simple bounding box check for now
    const bounds = this.getPieceBounds(piece);
    return x >= bounds.left && x <= bounds.right && 
           y >= bounds.top && y <= bounds.bottom;
  },

  getPieceBounds: function(piece) {
    const margin = 20;
    return {
      left: piece.x - margin,
      right: piece.x + 60 + margin,
      top: piece.y - margin,
      bottom: piece.y + 60 + margin
    };
  },

  checkWinCondition: function() {
    const placedCount = this.pieces.filter(p => p.placed).length;
    if (placedCount === this.pieces.length) {
      this._onLevelComplete();
    }
  },

  _onLevelComplete: function() {
    this.ended = true;
    this.canAdvanceLevel = this.level < this.puzzles.length;
    this.resultMessage = `${this.targetShape.name} Complete!`;
    this.score += 50; // Bonus for completion
    Scoring.saveHighScore('game7', 'Player', this.score);
  },

  _onRestart: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.restartLevel();
  },

  _onNextLevel: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.startNextLevel();
  },

  _onMainMenu: function() {
    Engine.clearInput && Engine.clearInput();
    GameManager.returnToMenu();
  },

  drawPiece: function(ctx, piece) {
    ctx.save();
    
    // Move to piece position
    ctx.translate(piece.x + 30, piece.y + 30); // Center point
    ctx.rotate((piece.rotation * Math.PI) / 180);
    
    // Draw piece
    ctx.fillStyle = piece.color;
    ctx.strokeStyle = piece === this._selectedPiece ? '#fff' : '#333';
    ctx.lineWidth = piece === this._selectedPiece ? 3 : 1;
    
    ctx.beginPath();
    ctx.moveTo(piece.points[0].x - 30, piece.points[0].y - 30);
    for (let i = 1; i < piece.points.length; i++) {
      ctx.lineTo(piece.points[i].x - 30, piece.points[i].y - 30);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  },

  drawTargetShape: function(ctx) {
    if (!this.targetShape) return;
    
    // Draw target silhouette
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(this.targetShape.targetPoints[0].x, this.targetShape.targetPoints[0].y);
    for (let i = 1; i < this.targetShape.targetPoints.length; i++) {
      ctx.lineTo(this.targetShape.targetPoints[i].x, this.targetShape.targetPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  },

  render: function(ctx) {
    ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, Engine.canvas.width, Engine.canvas.height);
    
    // Draw areas
    const paletteWidth = Engine.canvas.width * 0.35;
    
    // Palette area
    ctx.fillStyle = 'rgba(52, 73, 94, 0.7)';
    ctx.fillRect(0, 0, paletteWidth, Engine.canvas.height);
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, paletteWidth, Engine.canvas.height);
    
    // Puzzle area
    ctx.fillStyle = 'rgba(44, 62, 80, 0.3)';
    ctx.fillRect(paletteWidth, 0, Engine.canvas.width - paletteWidth, Engine.canvas.height);
    
    // Draw grid in puzzle area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = paletteWidth; x < Engine.canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, Engine.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < Engine.canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(paletteWidth, y);
      ctx.lineTo(Engine.canvas.width, y);
      ctx.stroke();
    }
    
    // Draw target shape
    this.drawTargetShape(ctx);
    
    // Draw pieces with enhanced feedback
    for (const piece of this.pieces) {
      if (piece !== this.dragging) {
        this.drawPieceWithEffects(ctx, piece);
      }
    }
    
    // Draw snap preview for dragging piece
    if (this.dragging) {
      const snapPos = this.findSnapPosition(this.dragging);
      if (snapPos) {
        // Draw snap preview
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        this.drawPiece(ctx, { 
          ...this.dragging, 
          x: snapPos.x, 
          y: snapPos.y,
          color: 'transparent'
        });
        ctx.setLineDash([]);
        ctx.restore();
        
        // Add a pulsing glow at snap position
        const pulseAlpha = 0.3 + 0.2 * Math.sin(Date.now() * 0.01);
        ctx.save();
        ctx.globalAlpha = pulseAlpha;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(snapPos.x, snapPos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Draw dragging piece on top with glow
      ctx.save();
      ctx.shadowColor = this.dragging.color;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.9;
      this.drawPiece(ctx, this.dragging);
      ctx.restore();
    }
    
    // Particles
    ParticleSystem.updateAndRender(ctx, 0.016);
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Tangram Master', 10, 30);
    ctx.font = '16px Arial';
    ctx.fillText(`Target: ${this.targetShape ? this.targetShape.name : 'Loading...'}`, 10, 55);
    
    // Difficulty stars for kids
    if (this.targetShape) {
      const difficulty = this.targetShape.difficulty;
      const starY = 75;
      ctx.fillStyle = 'gold';
      ctx.font = '16px Arial';
      ctx.fillText('Difficulty: ', 10, starY);
      
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i < difficulty ? 'gold' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('★', 90 + i * 15, starY);
      }
    }
    ctx.fillText(`Level: ${this.level} of 30`, 10, Engine.canvas.height - 60);
    ctx.fillText(`Score: ${this.score}`, 10, Engine.canvas.height - 40);
    
    // Progress bar for kids
    const progressBarX = 200;
    const progressBarY = Engine.canvas.height - 65;
    const progressBarWidth = 150;
    const progressBarHeight = 8;
    const progress = this.level / 30;
    
    // Progress bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // Progress bar fill
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
    
    // Progress bar border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // Instructions
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Drag pieces to puzzle area', 10, Engine.canvas.height - 105);
    if (this._selectedPiece) {
      ctx.fillText('Press ← → arrow keys or R to rotate', 10, Engine.canvas.height - 125);
    }
    ctx.fillText('Click a piece to select it', 10, Engine.canvas.height - 85);
    
    // Mobile controls hint
    if (Engine.isTouchDevice) {
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Drag pieces to build the shape', Engine.canvas.width/2, Engine.canvas.height - 10);
      ctx.textAlign = 'left';
    }
    
    // Result overlay
    if (this.ended) {
      this._resultButtonRects = ResultScreen.show(ctx, {
        title: this.canAdvanceLevel ? 'Puzzle Complete!' : 'All Puzzles Complete!',
        message: this.resultMessage,
        score: this.score,
        level: this.level,
        showNextLevel: this.canAdvanceLevel,
        onRestart: () => this._onRestart(),
        onNextLevel: this.canAdvanceLevel ? () => this._onNextLevel() : null,
        onMainMenu: () => this._onMainMenu()
      });
    }
  },

  drawPieceWithEffects: function(ctx, piece) {
    // Add hover glow effect
    if (this.hoveredPiece === piece) {
      ctx.save();
      ctx.shadowColor = piece.color;
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      this.drawPiece(ctx, piece);
      ctx.restore();
    } else {
      this.drawPiece(ctx, piece);
    }
    
    // Add selection indicator
    if (this._selectedPiece === piece) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.8;
      this.drawPiece(ctx, { ...piece, color: 'transparent' });
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
};

window.Game7 = Game7;
