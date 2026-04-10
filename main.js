/**
 * NEON MAZE: INVERSION
 * Stage-based progression with conditional vertical inversion.
 */

const LEVELS = [
    {
        id: 1,
        name: "STAGED 01: ORIENTATION",
        isTutorial: true,
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            { x: 5, y: 40, w: 90, h: 20 }, // Path splits tutorial
        ],
        start: { x: 10, y: 15, w: 10, h: 10 },
        end: { x: 80, y: 70, w: 10, h: 15 },
        instructions: {
            initial: "MOVE TO THE [GREEN START ZONE]",
            started: "⚠️ VERTICAL MOVEMENT INVERTED! REACH THE [PURPLE END PORTAL]"
        }
    },
    {
        id: 2,
        name: "STAGED 02: THE WEAVE",
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            // Vertical Pillars
            { x: 20, y: 5, w: 5, h: 60 }, { x: 20, y: 75, w: 5, h: 20 },
            { x: 40, y: 5, w: 5, h: 20 }, { x: 40, y: 35, w: 5, h: 60 },
            { x: 60, y: 5, w: 5, h: 60 }, { x: 60, y: 75, w: 5, h: 20 },
            { x: 80, y: 5, w: 5, h: 20 }, { x: 80, y: 35, w: 5, h: 60 },
        ],
        start: { x: 7, y: 7, w: 8, h: 8 },
        end: { x: 87, y: 7, w: 8, h: 8 }
    },
    {
        id: 3,
        name: "STAGED 03: THE MATRIX",
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            // Dense Grid
            { x: 15, y: 15, w: 20, h: 5 }, { x: 45, y: 15, w: 40, h: 5 },
            { x: 15, y: 30, w: 40, h: 5 }, { x: 65, y: 30, w: 20, h: 5 },
            { x: 15, y: 45, w: 20, h: 5 }, { x: 45, y: 45, w: 40, h: 5 },
            { x: 15, y: 60, w: 40, h: 5 }, { x: 65, y: 60, w: 20, h: 5 },
            { x: 15, y: 75, w: 20, h: 5 }, { x: 45, y: 75, w: 40, h: 5 },
            // Thin vertical blocks
            { x: 35, y: 20, w: 5, h: 10 }, { x: 55, y: 35, w: 5, h: 10 },
            { x: 35, y: 50, w: 5, h: 10 }, { x: 55, y: 65, w: 5, h: 10 },
        ],
        start: { x: 45, y: 7, w: 10, h: 7 },
        end: { x: 45, y: 85, w: 10, h: 7 }
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
        this.isMouseInStart = false;

        // DOM Elements
        this.mazeRenderer = document.getElementById('maze-renderer');
        this.overlay = document.getElementById('overlay');
        this.overlayView = document.getElementById('overlay-view');
        this.gameWarning = document.getElementById('game-warning');
        this.fakeCursor = document.getElementById('fake-cursor');
        this.tutorialText = document.getElementById('tutorial-text');
        
        this.levelDisplay = document.getElementById('current-level');
        this.timerDisplay = document.getElementById('timer');
        this.deathsDisplay = document.getElementById('deaths');

        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.overlay.classList.contains('hidden')) {
                this.startLevel();
            }
        });

        const container = document.getElementById('game-container');
        container.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.renderLevel();
        // Initial Intro View
        this.showIntro();
    }

    handleMouseMove(e) {
        const rect = document.getElementById('game-container').getBoundingClientRect();
        const nativeX = e.clientX - rect.left;
        const nativeY = e.clientY - rect.top;

        let finalX = nativeX;
        let finalY = nativeY;

        // CONDITIONAL INVERSION LOGIC
        // Only invert Y if the level has actually started (cursor touched Start)
        if (this.hasStartedLevel) {
            finalY = rect.height - nativeY;
        }

        // Update fake cursor
        this.fakeCursor.style.left = `${finalX}px`;
        this.fakeCursor.style.top = `${finalY}px`;

        // Check collisions based on fake cursor screen position
        this.checkCollisions(rect.left + finalX, rect.top + finalY);
    }

    checkCollisions(screenX, screenY) {
        if (!this.isPlaying) return;

        const el = document.elementFromPoint(screenX, screenY);
        if (!el) return;

        // Check if cursor is in start zone
        if (el.classList.contains('start-zone')) {
            this.isMouseInStart = true;
            if (!this.hasStartedLevel) {
                this.beginSession();
            }
        } else {
            this.isMouseInStart = false;
        }

        // Check for wall hits
        if (this.hasStartedLevel && el.classList.contains('maze-wall')) {
            this.handleCrash(el);
        }

        // Check for victory
        if (this.hasStartedLevel && el.classList.contains('end-zone')) {
            this.handleVictory();
        }
    }

    showIntro() {
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');
        this.tutorialText.classList.add('hidden');
        this.gameWarning.classList.add('hidden');
        this.isPlaying = false;
        
        // Ensure intro content is visible
        this.overlayView.innerHTML = `
            <div class="logo">
                <span class="logo-main">NEON MAZE</span>
                <span class="logo-sub">INVERSION</span>
            </div>
            <p>Vertical controls will reverse upon entry.</p>
            <div class="controls-hint">
                <div class="key">SPACE</div>
                <span>TO BEGIN</span>
            </div>
        `;
    }

    showStatus(title, message, btnText = "SPACE TO CONTINUE") {
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');
        this.tutorialText.classList.add('hidden');
        this.isPlaying = false;
        
        this.overlayView.innerHTML = `
            <h2 style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;">${title}</h2>
            <p style="margin-bottom: 3rem; opacity: 0.8;">${message}</p>
            <div class="controls-hint">
                <div class="key">${btnText.split(' ')[0]}</div>
                <span>${btnText.split(' ').slice(1).join(' ')}</span>
            </div>
        `;
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

    startLevel() {
        this.overlay.classList.add('hidden');
        this.fakeCursor.classList.remove('hidden');
        this.isPlaying = true;
        this.hasStartedLevel = false;
        
        const level = LEVELS[this.currentLevelIndex];
        if (level.isTutorial) {
            this.updateTutorial(level.instructions.initial);
        } else {
            this.tutorialText.classList.add('hidden');
        }

        // Show start warning if not already in start zone
        if (!this.isMouseInStart) {
            this.gameWarning.classList.remove('hidden');
        }
    }

    beginSession() {
        this.hasStartedLevel = true;
        this.gameWarning.classList.add('hidden');
        
        const level = LEVELS[this.currentLevelIndex];
        if (level.isTutorial) {
            this.updateTutorial(level.instructions.started);
        }

        this.startTimer();
    }

    updateTutorial(text) {
        this.tutorialText.textContent = text;
        this.tutorialText.classList.remove('hidden');
    }

    handleCrash(wallEl) {
        this.deaths++;
        this.deathsDisplay.textContent = this.deaths;
        this.stopTimer();
        this.isPlaying = false;
        
        wallEl.classList.add('hit');
        setTimeout(() => {
            this.showStatus('CRASHED!', 'Your neural link failed. Try again.');
        }, 500);
    }

    handleVictory() {
        this.stopTimer();
        this.isPlaying = false;
        
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.currentLevelIndex++;
            this.showStatus('STAGE CLEAR!', `Connection stabilized in ${this.timer.toFixed(1)}s`);
            this.renderLevel();
        } else {
            this.showStatus('LEGENDARY!', `Simulation conquered with ${this.deaths} failures.`);
            this.currentLevelIndex = 0;
            this.deaths = 0;
            this.deathsDisplay.textContent = '0';
            this.renderLevel();
        }
    }

    startTimer() {
        this.timer = 0;
        this.timerDisplay.textContent = '0.0';
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
