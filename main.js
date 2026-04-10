/**
 * NEON MAZE - Game Logic
 */

const LEVELS = [
    {
        id: 1,
        walls: [
            { x: 0, y: 0, w: 100, h: 40 },
            { x: 0, y: 60, w: 100, h: 40 },
            { x: 20, y: 40, w: 60, h: 20 },
            { x: 0, y: 0, w: 5, h: 100 },
            { x: 95, y: 0, w: 5, h: 100 },
            { x: 0, y: 95, w: 100, h: 5 },
        ],
        start: { x: 5, y: 40, w: 15, h: 20 },
        end: { x: 80, y: 40, w: 15, h: 20 }
    },
    {
        id: 2,
        walls: [
            { x: 0, y: 0, w: 100, h: 10 },
            { x: 0, y: 90, w: 100, h: 10 },
            { x: 0, y: 10, w: 10, h: 80 },
            { x: 90, y: 10, w: 10, h: 80 },
            { x: 25, y: 10, w: 10, h: 60 },
            { x: 50, y: 30, w: 10, h: 60 },
            { x: 75, y: 10, w: 10, h: 60 },
        ],
        start: { x: 10, y: 10, w: 15, h: 15 },
        end: { x: 75, y: 70, w: 15, h: 20 }
    },
    {
        id: 3,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 },
            { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 },
            { x: 95, y: 5, w: 5, h: 90 },
            { x: 20, y: 5, w: 5, h: 70 },
            { x: 20, y: 75, w: 20, h: 5 },
            { x: 40, y: 20, w: 5, h: 60 },
            { x: 60, y: 5, w: 5, h: 70 },
            { x: 60, y: 75, w: 20, h: 5 },
            { x: 80, y: 20, w: 5, h: 60 },
        ],
        start: { x: 5, y: 5, w: 15, h: 15 },
        end: { x: 85, y: 80, w: 10, h: 15 }
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
        this.startBtn.addEventListener('click', () => {
            console.log("Start button clicked");
            this.startLevel();
        });
        this.mazeRenderer.addEventListener('mouseleave', () => {
            if (this.isPlaying && this.hasStartedLevel) {
                console.log("Mouse left game area");
                this.handleCollision(null);
            }
        });
        this.renderLevel();
        this.showOverlay('NEON MAZE', 'Navigate from START to END without touching walls.');
    }

    showOverlay(title, message, btnText = 'START') {
        console.log("Showing overlay:", title);
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.startBtn.textContent = btnText;
        this.overlay.classList.remove('hidden');
        this.isPlaying = false;
    }

    hideOverlay() {
        console.log("Hiding overlay");
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
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
