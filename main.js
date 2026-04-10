/**
 * NEON MAZE: INVERSION - Definitive Edition
 */

const LEVELS = [
    {
        id: 1, name: "TUTORIAL: ORIENTATION", isTutorial: true,
        walls: [
            { x: 0, y: 0, w: 100, h: 20 }, { x: 0, y: 80, w: 100, h: 20 },
            { x: 20, y: 20, w: 5, h: 40 }, { x: 40, y: 40, w: 5, h: 40 },
            { x: 60, y: 20, w: 5, h: 40 }, { x: 80, y: 40, w: 5, h: 40 },
        ],
        start: { x: 5, y: 45, w: 10, h: 10 },
        end: { x: 85, y: 45, w: 10, h: 10 },
        instructions: { initial: "FOLLOW THE NEON PATH", started: "⚠️ NEURAL FLIP ACTIVE! STAY CENTERED" }
    },
    {
        id: 2, name: "STAGE 01: THE GAUNTLET",
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            { x: 20, y: 20, w: 5, h: 5 }, { x: 25, y: 50, w: 5, h: 5 }, { x: 30, y: 80, w: 5, h: 5 },
            { x: 40, y: 35, w: 5, h: 5 }, { x: 45, y: 15, w: 5, h: 5 }, { x: 50, y: 65, w: 5, h: 5 },
            { x: 60, y: 45, w: 5, h: 5 }, { x: 65, y: 25, w: 5, h: 5 }, { x: 70, y: 75, w: 5, h: 5 },
            { x: 80, y: 10, w: 5, h: 5 }, { x: 85, y: 40, w: 5, h: 5 },
        ],
        start: { x: 5, y: 45, w: 10, h: 10 },
        end: { x: 85, y: 85, w: 10, h: 10 }
    },
    {
        id: 3, name: "STAGE 02: THE HOURGLASS",
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 0, y: 5, w: 5, h: 90 }, { x: 95, y: 5, w: 5, h: 90 },
            { x: 15, y: 5, w: 30, h: 35 }, { x: 15, y: 60, w: 30, h: 35 },
            { x: 55, y: 5, w: 30, h: 35 }, { x: 55, y: 60, w: 30, h: 35 },
            { x: 45, y: 5, w: 10, h: 42 }, { x: 45, y: 53, w: 10, h: 42 },
        ],
        start: { x: 7, y: 45, w: 10, h: 10 },
        end: { x: 85, y: 45, w: 10, h: 10 }
    },
    {
        id: 4, name: "STAGE 03: THE ZIG-ZAG",
        walls: [
            { x: 0, y: 0, w: 100, h: 5 }, { x: 0, y: 95, w: 100, h: 5 },
            { x: 5, y: 25, w: 80, h: 5 }, { x: 15, y: 45, w: 80, h: 5 },
            { x: 5, y: 65, w: 80, h: 5 },
            { x: 85, y: 5, w: 5, h: 25 }, { x: 5, y: 30, w: 5, h: 20 },
            { x: 90, y: 50, w: 5, h: 20 }, { x: 0, y: 70, w: 5, h: 25 }
        ],
        start: { x: 10, y: 10, w: 10, h: 10 },
        end: { x: 10, y: 80, w: 10, h: 10 }
    }
];

class Game {
    constructor() {
        this.currentLevelIndex = 0;
        this.deaths = 0;
        this.timer = 0;
        this.totalGameTime = 0; // Total time for non-tutorial levels
        this.timerInterval = null;
        this.isPlaying = false;
        this.hasStartedLevel = false;
        this.isMouseInStart = false;
        this.inversionOffset = 0;

        // Settings
        this.currentTheme = localStorage.getItem('theme') || 'cyan';
        this.currentCursor = localStorage.getItem('cursor') || 'dot';
        this.musicVolume = parseFloat(localStorage.getItem('volume') || '0.5');

        // DOM
        this.mazeRenderer = document.getElementById('maze-renderer');
        this.overlay = document.getElementById('overlay');
        this.overlayView = document.getElementById('overlay-view');
        this.gameWarning = document.getElementById('game-warning');
        this.fakeCursor = document.getElementById('fake-cursor');
        this.tutorialText = document.getElementById('tutorial-text');
        this.levelDisplay = document.getElementById('current-level');
        this.timerDisplay = document.getElementById('timer');
        this.deathsDisplay = document.getElementById('deaths');
        this.settingsBtn = document.getElementById('settings-btn');

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.applyCursor(this.currentCursor);
        this.initAudio();

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.overlay.classList.contains('hidden')) {
                // If in victory view, don't start level with space yet
                if (!document.getElementById('name-input')) this.startLevel();
            }
        });

        this.settingsBtn.addEventListener('click', () => this.showSettings());

        const container = document.getElementById('game-container');
        container.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.renderLevel();
        this.showIntro();
    }

    initAudio() {
        this.bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = this.musicVolume;
        
        // Browsers require user interaction to play audio
        document.addEventListener('click', () => {
            if (this.bgMusic.paused) this.bgMusic.play();
        }, { once: true });
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    applyCursor(shape) {
        this.fakeCursor.className = `fake-cursor shape-${shape}`;
        this.currentCursor = shape;
        localStorage.setItem('cursor', shape);
    }

    handleMouseMove(e) {
        const rect = document.getElementById('game-container').getBoundingClientRect();
        const nativeX = e.clientX - rect.left;
        const nativeY = e.clientY - rect.top;

        let finalX = nativeX;
        let finalY = nativeY;

        if (this.hasStartedLevel) {
            finalY = (rect.height - nativeY) + this.inversionOffset;
        }

        this.fakeCursor.style.left = `${finalX}px`;
        this.fakeCursor.style.top = `${finalY}px`;
        this.checkCollisions(rect.left + finalX, rect.top + finalY, nativeY, rect.height);
    }

    checkCollisions(screenX, screenY, nativeY, containerHeight) {
        if (!this.isPlaying) return;
        const el = document.elementFromPoint(screenX, screenY);
        if (!el) return;

        if (el.classList.contains('start-zone')) {
            this.isMouseInStart = true;
            if (!this.hasStartedLevel) this.beginSession(nativeY, containerHeight);
        } else {
            this.isMouseInStart = false;
        }

        if (this.hasStartedLevel && el.classList.contains('maze-wall')) this.handleCrash(el);
        if (this.hasStartedLevel && el.classList.contains('end-zone')) this.handleVictory();
    }

    showIntro() {
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');
        this.tutorialText.classList.add('hidden');
        this.gameWarning.classList.add('hidden');
        this.isPlaying = false;
        
        this.overlayView.innerHTML = `
            <div class="logo">
                <span class="logo-main">NEON MAZE</span>
                <span class="logo-sub">INVERSION</span>
            </div>
            <p>Neural sync orientation required.</p>
            <div class="controls-hint">
                <div class="key">SPACE</div>
                <span>TO BEGIN SIMULATION</span>
            </div>
        `;
    }

    showSettings() {
        this.isPlaying = false;
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');

        this.overlayView.innerHTML = `
            <h2 style="font-size: 2.5rem; color: var(--accent-color); margin-bottom: 2rem;">SYSTEM CONFIG</h2>
            <div class="menu-grid">
                <div class="menu-section">
                    <h3>Visual Theme</h3>
                    <div class="option-group">
                        <button class="choice-btn ${this.currentTheme==='cyan'?'active':''}" onclick="game.applyTheme('cyan')">Cyan</button>
                        <button class="choice-btn ${this.currentTheme==='inferno'?'active':''}" onclick="game.applyTheme('inferno')">Inferno</button>
                        <button class="choice-btn ${this.currentTheme==='toxic'?'active':''}" onclick="game.applyTheme('toxic')">Toxic</button>
                        <button class="choice-btn ${this.currentTheme==='matrix'?'active':''}" onclick="game.applyTheme('matrix')">Matrix</button>
                    </div>
                </div>
                <div class="menu-section">
                    <h3>Cursor Type</h3>
                    <div class="option-group">
                        <button class="choice-btn ${this.currentCursor==='dot'?'active':''}" onclick="game.applyCursor('dot')">Dot</button>
                        <button class="choice-btn ${this.currentCursor==='square'?'active':''}" onclick="game.applyCursor('square')">Square</button>
                        <button class="choice-btn ${this.currentCursor==='cross'?'active':''}" onclick="game.applyCursor('cross')">Cross</button>
                    </div>
                </div>
                <div class="menu-section" style="grid-column: span 2;">
                    <h3>Audio Output (Volume)</h3>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="${this.musicVolume}" 
                        oninput="game.setVolume(this.value)">
                </div>
            </div>
            <div class="controls-hint">
                <div class="key">SPACE</div>
                <span>BACK TO MISSION</span>
            </div>
        `;

        // Refresh active buttons on click
        this.overlayView.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showSettings());
        });
    }

    setVolume(val) {
        this.musicVolume = val;
        this.bgMusic.volume = val;
        localStorage.setItem('volume', val);
    }

    renderLevel() {
        const level = LEVELS[this.currentLevelIndex];
        this.mazeRenderer.innerHTML = '';
        this.levelDisplay.textContent = level.id;

        level.walls.forEach(wall => {
            const el = document.createElement('div');
            el.className = 'maze-wall';
            el.style.left = `${wall.x}%`; el.style.top = `${wall.y}%`;
            el.style.width = `${wall.w}%`; el.style.height = `${wall.h}%`;
            this.mazeRenderer.appendChild(el);
        });

        const start = document.createElement('div');
        start.className = 'zone start-zone';
        start.textContent = 'Start';
        start.style.left = `${level.start.x}%`; start.style.top = `${level.start.y}%`;
        start.style.width = `${level.start.w}%`; start.style.height = `${level.start.h}%`;
        this.mazeRenderer.appendChild(start);

        const end = document.createElement('div');
        end.className = 'zone end-zone';
        end.textContent = 'End';
        end.style.left = `${level.end.x}%`; end.style.top = `${level.end.y}%`;
        end.style.width = `${level.end.w}%`; end.style.height = `${level.end.h}%`;
        this.mazeRenderer.appendChild(end);
    }

    startLevel() {
        this.overlay.classList.add('hidden');
        this.fakeCursor.classList.remove('hidden');
        this.isPlaying = true;
        this.hasStartedLevel = false;
        this.inversionOffset = 0;
        
        const level = LEVELS[this.currentLevelIndex];
        if (level.isTutorial) {
            this.updateTutorial(level.instructions.initial);
        } else {
            this.tutorialText.classList.add('hidden');
        }

        if (!this.isMouseInStart) this.gameWarning.classList.remove('hidden');
    }

    beginSession(nativeY, containerHeight) {
        this.hasStartedLevel = true;
        this.gameWarning.classList.add('hidden');
        this.inversionOffset = (2 * nativeY) - containerHeight;

        const level = LEVELS[this.currentLevelIndex];
        if (level.isTutorial) this.updateTutorial(level.instructions.started);
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
        setTimeout(() => this.showStatus('SYNC LOST', 'Connection severed. Re-calibrating.'), 500);
    }

    handleVictory() {
        this.stopTimer();
        this.isPlaying = false;
        
        if (this.currentLevelIndex < LEVELS.length - 1) {
            // Track total time for competitive levels (ID > 1)
            if (LEVELS[this.currentLevelIndex].id > 1) {
                this.totalGameTime += this.timer;
            }
            this.currentLevelIndex++;
            this.showStatus('STAGE CLEAR', `Neural sync held for ${this.timer.toFixed(1)}s`);
            this.renderLevel();
        } else {
            this.totalGameTime += this.timer;
            this.showFinalVictory();
        }
    }

    showFinalVictory() {
        this.overlay.classList.remove('hidden');
        this.fakeCursor.classList.add('hidden');
        
        this.overlayView.innerHTML = `
            <h2 style="font-size: 3rem; color: var(--accent-color);">LEGENDARY</h2>
            <p>Total Sync Time: ${this.totalGameTime.toFixed(1)}s</p>
            <input type="text" id="name-input" class="name-input" placeholder="ENTER YOUR NAME" maxlength="15">
            <button class="choice-btn active" style="font-size: 1.5rem; width: 100%;" onclick="game.saveScore()">SUBMIT RECORD</button>
        `;
        
        document.getElementById('name-input').focus();
    }

    saveScore() {
        const name = document.getElementById('name-input').value || 'ANONYMOUS';
        const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        scores.push({ name, time: this.totalGameTime.toFixed(1) });
        scores.sort((a, b) => a.time - b.time);
        localStorage.setItem('leaderboard', JSON.stringify(scores.slice(0, 10)));
        this.showLeaderboard();
    }

    showLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        let listHtml = scores.map((s, i) => `
            <div class="leaderboard-item">
                <span>#${i+1}</span>
                <span>${s.name}</span>
                <span>${s.time}s</span>
            </div>
        `).join('');

        this.overlayView.innerHTML = `
            <h2 style="font-size: 2.5rem; color: var(--accent-color);">TOP OPERATORS</h2>
            <div class="leaderboard-list">
                ${listHtml || '<p style="text-align: center; opacity: 0.5;">No records yet.</p>'}
            </div>
            <div class="controls-hint">
                <div class="key">SPACE</div>
                <span>TO RESTART SIMULATION</span>
            </div>
        `;
        
        this.currentLevelIndex = 0;
        this.deaths = 0;
        this.totalGameTime = 0;
        this.deathsDisplay.textContent = '0';
        this.renderLevel();
    }

    showStatus(title, message) {
        this.overlay.classList.remove('hidden');
        this.overlayView.innerHTML = `
            <h2 style="font-size: 3rem; color: var(--accent-color);">${title}</h2>
            <p style="margin-bottom: 2rem;">${message}</p>
            <div class="controls-hint">
                <div class="key">SPACE</div>
                <span>CONTINUE</span>
            </div>
        `;
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

    stopTimer() { clearInterval(this.timerInterval); }
}

const game = new Game();
window.game = game; // Expose for HTML onclicks
