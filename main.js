/**
 * NEON MAZE - Game Logic (Extreme Inversion Edition)
 */

const LEVELS = [
    {
        id: 1,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            { x: 5, y: 20, w: 70, h: 5 }, { x: 25, y: 40, w: 70, h: 5 },
            { x: 5, y: 60, w: 70, h: 5 }, { x: 25, y: 80, w: 70, h: 5 },
        ],
        start: { x: 10, y: 10, w: 10, h: 10 },
        end: { x: 80, y: 85, w: 10, h: 10 }
    },
    {
        id: 2,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            // Grid obstacles
            { x: 20, y: 20, w: 15, h: 15 }, { x: 45, y: 20, w: 15, h: 15 }, { x: 70, y: 20, w: 15, h: 15 },
            { x: 20, y: 45, w: 15, h: 15 }, { x: 45, y: 45, w: 15, h: 15 }, { x: 70, y: 45, w: 15, h: 15 },
            { x: 20, y: 70, w: 15, h: 15 }, { x: 45, y: 70, w: 15, h: 15 }, { x: 70, y: 70, w: 15, h: 15 },
            // Extra thin walls
            { x: 35, y: 5, w: 2, h: 40 }, { x: 60, y: 55, w: 2, h: 40 }
        ],
        start: { x: 5, y: 5, w: 10, h: 10 },
        end: { x: 85, y: 85, w: 10, h: 10 }
    },
    {
        id: 3,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            // The Maze
            { x: 15, y: 5, w: 5, h: 30 }, { x: 15, y: 45, w: 5, h: 50 },
            { x: 30, y: 15, w: 5, h: 70 }, { x: 45, y: 5, w: 5, h: 40 },
            { x: 45, y: 55, w: 5, h: 40 }, { x: 60, y: 15, w: 5, h: 70 },
            { x: 75, y: 5, w: 5, h: 30 }, { x: 75, y: 45, w: 5, h: 50 },
            // Horizontal caps
            { x: 20, y: 15, w: 10, h: 5 }, { x: 35, y: 35, w: 10, h: 5 },
            { x: 50, y: 55, w: 10, h: 5 }, { x: 65, y: 75, w: 10, h: 5 }
        ],
        start: { x: 5, y: 85, w: 10, h: 10 },
        end: { x: 85, y: 5, w: 10, h: 10 }
    }
];

class Game {
    constructor() {
        this.currentLevelIndex = 0;
        this.deaths = 0;
        this.timer = 0;
        this.isPlaying = false;
        this.hasStartedLevel = false;

        this.fakeCursorPos = { x: 50, y: 50 };
        this.isMouseInStart = false;

        this.mazeRenderer = document.getElementById('maze-renderer');
        this.overlay = document.getElementById('overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.gameWarning = document.getElementById('game-warning');
        this.fakeCursor = document.getElementById('fake-cursor');
        
        this.levelDisplay = document.getElementById('current-level');
        this.timerDisplay = document.getElementById('timer');
        this.deathsDisplay = document.getElementById('deaths');

        this.init();
    }

    init() {
        // Space to start
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.overlay.classList.contains('hidden')) {
                this.startLevel();
            }
        });

        // Mouse Move logic
        const container = document.getElementById('game-container');
        container.addEventListener('mousemove', (e) => this.updateCursor(e));

        this.renderLevel();
        this.showOverlay('INVERTED NEON MAZE', 'Vertical controls are reversed.\nPress SPACE to begin.');
    }

    updateCursor(e) {
        const rect = document.getElementById('game-container').getBoundingClientRect();
        
        // Native relative coords
        const nativeX = e.clientX - rect.left;
        const nativeY = e.clientY - rect.top;

        // INVERSION LOGIC: Y is flipped
        const invertedY = rect.height - nativeY;
        
        // Update fake cursor visual
        this.fakeCursor.style.left = `${nativeX}px`;
        this.fakeCursor.style.top = `${invertedY}px`;
        
        // Store for logic
        this.fakeCursorPos = { x: nativeX, y: invertedY };

        // COLLISION DETECTION using document.elementFromPoint
        // We use the coordinates of the FAKE cursor
        this.checkCollisions(e.clientX, rect.top + invertedY);
    }

    checkCollisions(screenX, screenY) {
        if (!this.isPlaying) return;

        const el = document.elementFromPoint(screenX, screenY);
        if (!el) return;

        // Check if cursor is in start zone
        if (el.classList.contains('start-zone')) {
            this.isMouseInStart = true;
            if (!this.hasStartedLevel) this.beginMovement();
        } else {
            this.isMouseInStart = false;
        }

        // Check for wall hits
        if (this.hasStartedLevel && el.classList.contains('maze-wall')) {
            this.handleCollision(el);
        }

        // Check for victory
        if (this.hasStartedLevel && el.classList.contains('end-zone')) {
            this.completeLevel();
        }
    }

    renderLevel() {
        const level = LEVELS[this.currentLevelIndex];
        this.mazeRenderer.innerHTML = '';
        this.levelDisplay.textContent = level.id;

        level.walls.forEach(wall => {
            const el = document.createElement('div');
            el.className = 'maze-wall';
            el.style.left = `${wall.x}%`;
            el.style.top = `${wall.y}%`;
            el.style.width = `${wall.w}%`;
            el.style.height = `${wall.h}%`;
            this.mazeRenderer.appendChild(el);
        });

        const start = document.createElement('div');
        start.className = 'zone start-zone';
        start.textContent = 'Start';
        start.style.left = `${level.start.x}%`;
        start.style.top = `${level.start.y}%`;
        start.style.width = `${level.start.w}%`;
        start.style.height = `${level.start.h}%`;
        this.mazeRenderer.appendChild(start);

        const end = document.createElement('div');
        end.className = 'zone end-zone';
        end.textContent = 'End';
        end.style.left = `${level.end.x}%`;
        end.style.top = `${level.end.y}%`;
        end.style.width = `${level.end.w}%`;
        end.style.height = `${level.end.h}%`;
        this.mazeRenderer.appendChild(end);
    }

    showOverlay(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');
        this.gameWarning.classList.add('hidden');
        this.isPlaying = false;
    }

    hideOverlay() {
        this.overlay.classList.add('hidden');
        this.fakeCursor.classList.remove('hidden');
        this.isPlaying = true;
    }

    startLevel() {
        this.hideOverlay();
        this.hasStartedLevel = false;
        this.timer = 0;
        this.timerDisplay.textContent = '0.0';
        
        // Initial check for start zone
        if (!this.isMouseInStart) {
            this.gameWarning.classList.remove('hidden');
        }
    }

    beginMovement() {
        if (this.hasStartedLevel) return;
        this.hasStartedLevel = true;
        this.gameWarning.classList.add('hidden');
        this.startTimer();
    }

    handleCollision(wallEl) {
        this.deaths++;
        this.deathsDisplay.textContent = this.deaths;
        this.stopTimer();
        this.isPlaying = false;
        
        wallEl.classList.add('hit');
        setTimeout(() => {
            this.showOverlay('CRASHED!', 'Focus. Inversion is active.');
        }, 500);
    }

    completeLevel() {
        this.stopTimer();
        this.isPlaying = false;
        
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.currentLevelIndex++;
            this.showOverlay('LEVEL CLEAR!', `Time: ${this.timer.toFixed(1)}s`);
            this.renderLevel();
        } else {
            this.showOverlay('LEGENDARY!', `Finished with ${this.deaths} deaths.`);
            this.currentLevelIndex = 0;
            this.deaths = 0;
            this.deathsDisplay.textContent = '0';
            this.renderLevel();
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer += 0.1;
            this.timerDisplay.textContent = this.timer.toFixed(1);
        }, 100);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }
}

new Game();
