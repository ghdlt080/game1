/**
 * NEON MAZE - Game Logic
 */

const LEVELS = [
    {
        id: 1,
        walls: [
            { x: 0, y: 0, w: 100, h: 20 },    // Top border
            { x: 0, y: 80, w: 100, h: 20 },   // Bottom border
            { x: 0, y: 20, w: 5, h: 60 },     // Left border
            { x: 95, y: 20, w: 5, h: 60 },    // Right border
            { x: 20, y: 20, w: 10, h: 40 },   // Block 1
            { x: 50, y: 40, w: 10, h: 40 },   // Block 2
            { x: 70, y: 20, w: 10, h: 40 },   // Block 3
        ],
        start: { x: 5, y: 25, w: 10, h: 10 },
        end: { x: 85, y: 65, w: 10, h: 10 }
    },
    {
        id: 2,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 },     // Top border
            { x: 0, y: 95, w: 100, h: 5 },    // Bottom border
            { x: 0, y: 5, w: 5, h: 90 },     // Left border
            { x: 95, y: 5, w: 5, h: 90 },    // Right border
            // Spiral-like walls
            { x: 20, y: 20, w: 60, h: 5 },
            { x: 20, y: 25, w: 5, h: 50 },
            { x: 25, y: 70, w: 50, h: 5 },
            { x: 75, y: 40, w: 5, h: 35 },
            { x: 40, y: 40, w: 40, h: 5 },
        ],
        start: { x: 5, y: 5, w: 10, h: 10 },
        end: { x: 50, y: 50, w: 10, h: 10 }
    },
    {
        id: 3,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 },
            { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 },
            { x: 95, y: 5, w: 5, h: 90 },
            // Checkerboard obstacles
            { x: 20, y: 5, w: 5, h: 40 },
            { x: 20, y: 55, w: 5, h: 40 },
            { x: 40, y: 20, w: 5, h: 40 },
            { x: 40, y: 70, w: 5, h: 25 },
            { x: 60, y: 5, w: 5, h: 25 },
            { x: 60, y: 40, w: 5, h: 55 },
            { x: 80, y: 20, w: 5, h: 55 },
        ],
        start: { x: 5, y: 45, w: 10, h: 10 },
        end: { x: 85, y: 45, w: 10, h: 10 }
    }
];

class Game {
    constructor() {
        this.currentLevelIndex = 0;
        this.deaths = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPlaying = false;
        this.hasStartedLevel = false;

        // DOM Elements
        this.mazeRenderer = document.getElementById('maze-renderer');
        this.overlay = document.getElementById('overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.startBtn = document.getElementById('start-btn');
        this.levelDisplay = document.getElementById('current-level');
        this.timerDisplay = document.getElementById('timer');
        this.deathsDisplay = document.getElementById('deaths');

        this.init();
    }

    init() {
        console.log("Game initialized");
        this.startBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent trigger from global click
            this.startLevel();
        });
        
        // GLOBAL INPUT LISTENERS
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.overlay.classList.contains('hidden')) {
                this.startLevel();
            }
        });
        
        // Document click should also advance if overlay is visible
        this.overlay.addEventListener('click', () => {
            if (!this.overlay.classList.contains('hidden')) {
                this.startLevel();
            }
        });

        this.mazeRenderer.addEventListener('mouseleave', () => {
            if (this.isPlaying && this.hasStartedLevel) {
                console.log("Mouse left game area");
                this.handleCollision(null);
            }
        });
        this.renderLevel();
        this.showOverlay('NEON MAZE', 'Avoid the walls. Reach the portal.\n(Press SPACE or Click to start)');
    }

    showOverlay(title, message, btnText = 'START') {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.startBtn.textContent = btnText;
        
        const content = document.querySelector('.overlay-content');
        
        // Standard full-screen layout
        content.style.position = 'relative';
        content.style.left = 'auto';
        content.style.top = 'auto';
        content.style.transform = 'none';
        
        // Show overlay
        this.overlay.classList.remove('hidden');
        this.isPlaying = false;
        
        // After showing content, position the start button specifically for alignment
        // This makes the transition feel more deliberate.
        if (btnText === 'START' || btnText === 'RETRY' || btnText === 'NEXT LEVEL') {
            const level = LEVELS[this.currentLevelIndex];
            this.startBtn.classList.add('aligned');
            this.startBtn.style.left = `${level.start.x + level.start.w/2}%`;
            this.startBtn.style.top = `${level.start.y + level.start.h/2}%`;
            this.startBtn.style.transform = 'translate(-50%, -50%)';
            // Move button into maze container for percentage alignment
            this.mazeRenderer.appendChild(this.startBtn);
        } else {
            this.startBtn.classList.remove('aligned');
            this.startBtn.style.position = 'relative';
            this.startBtn.style.left = 'auto';
            this.startBtn.style.top = 'auto';
            this.startBtn.style.transform = 'none';
            content.appendChild(this.startBtn);
        }
    }

    hideOverlay() {
        this.overlay.classList.add('hidden');
        this.isPlaying = true;
    }

    renderLevel() {
        const level = LEVELS[this.currentLevelIndex];
        this.mazeRenderer.innerHTML = '';
        this.levelDisplay.textContent = level.id;

        // Render Walls
        level.walls.forEach(wall => {
            const el = document.createElement('div');
            el.className = 'maze-wall';
            el.style.left = `${wall.x}%`;
            el.style.top = `${wall.y}%`;
            el.style.width = `${wall.w}%`;
            el.style.height = `${wall.h}%`;
            
            el.addEventListener('mouseenter', () => this.handleCollision(el));
            this.mazeRenderer.appendChild(el);
        });

        // Render Start Zone
        const start = document.createElement('div');
        start.className = 'zone start-zone';
        start.textContent = 'Start';
        start.style.left = `${level.start.x}%`;
        start.style.top = `${level.start.y}%`;
        start.style.width = `${level.start.w}%`;
        start.style.height = `${level.start.h}%`;
        start.addEventListener('mouseenter', () => this.beginMovement());
        this.mazeRenderer.appendChild(start);

        // Render End Zone
        const end = document.createElement('div');
        end.className = 'zone end-zone';
        end.textContent = 'End';
        end.style.left = `${level.end.x}%`;
        end.style.top = `${level.end.y}%`;
        end.style.width = `${level.end.w}%`;
        end.style.height = `${level.end.h}%`;
        end.addEventListener('mouseenter', () => this.completeLevel());
        this.mazeRenderer.appendChild(end);
    }

    startLevel() {
        this.hideOverlay();
        this.hasStartedLevel = false;
        this.resetTimer();
    }

    beginMovement() {
        if (!this.isPlaying || this.hasStartedLevel) return;
        this.hasStartedLevel = true;
        this.startTimer();
    }

    handleCollision(wallEl) {
        if (!this.isPlaying || !this.hasStartedLevel) return;
        
        this.deaths++;
        this.deathsDisplay.textContent = this.deaths;
        this.stopTimer();
        
        if (wallEl && wallEl.classList) {
            wallEl.classList.add('hit');
            setTimeout(() => wallEl.classList.remove('hit'), 500);
        }
        
        this.isPlaying = false;
        this.showOverlay('CRASHED!', 'Try again. Stay within the path.', 'RETRY');
    }

    completeLevel() {
        if (!this.isPlaying || !this.hasStartedLevel) return;
        
        this.stopTimer();
        this.isPlaying = false;
        
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.currentLevelIndex++;
            this.showOverlay('LEVEL CLEAR!', `Time: ${this.timer.toFixed(1)}s`, 'NEXT LEVEL');
            this.renderLevel();
        } else {
            this.showOverlay('VICTORY!', `You escaped the Neon Maze with ${this.deaths} deaths!`, 'PLAY AGAIN');
            this.currentLevelIndex = 0;
            this.deaths = 0;
            this.deathsDisplay.textContent = '0';
            this.renderLevel();
        }
    }

    startTimer() {
        this.resetTimer();
        this.timerInterval = setInterval(() => {
            this.timer += 0.1;
            this.timerDisplay.textContent = this.timer.toFixed(1);
        }, 100);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.timerDisplay.textContent = '0.0';
    }
}

// Start Game
new Game();
