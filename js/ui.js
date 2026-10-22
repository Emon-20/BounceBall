/**
 * Bounce Classic - UI & HUD Overlay Manager
 * Updates HUD score, coins, tool effect progress bar & timer,
 * level progress tracker, menus, dialogs, and high scores.
 */

export class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks; // onPlay, onSelectLevel, onRestart, onResume, onToggleAudio, onToggleTheme, onToggleScanlines

        // HUD Elements
        this.hud = document.getElementById('hud');
        this.scoreVal = document.getElementById('score-val');
        this.coinCount = document.getElementById('coin-count');
        this.levelName = document.getElementById('hud-level-name');
        this.progressBarFill = document.getElementById('progress-bar-fill');
        this.progressBallIcon = document.getElementById('progress-ball-icon');

        // Tool Timer HUD
        this.toolTimerContainer = document.getElementById('tool-timer-container');
        this.toolIcon = document.getElementById('tool-icon');
        this.toolName = document.getElementById('tool-name');
        this.toolBarFill = document.getElementById('tool-bar-fill');
        this.toolTimeText = document.getElementById('tool-time-text');

        // Screens
        this.screenMenu = document.getElementById('screen-menu');
        this.screenLevels = document.getElementById('screen-levels');
        this.screenPause = document.getElementById('screen-pause');
        this.screenCleared = document.getElementById('screen-cleared');
        this.screenGameOver = document.getElementById('screen-game-over');

        // Audio and Settings buttons
        this.btnAudio = document.getElementById('btn-audio');
        this.btnMusic = document.getElementById('btn-music');
        this.btnTheme = document.getElementById('btn-theme');
        this.btnScanlines = document.getElementById('btn-scanlines');

        // Stats elements
        this.clearedStats = document.getElementById('cleared-stats');
        this.gameOverStats = document.getElementById('game-over-stats');
        this.clearedStars = document.getElementById('cleared-stars');

        this.initEventListeners();
    }

    initEventListeners() {
        // Main Menu
        document.getElementById('btn-play')?.addEventListener('click', () => this.callbacks.onPlay(0));
        document.getElementById('btn-endless')?.addEventListener('click', () => this.callbacks.onPlayEndless());
        document.getElementById('btn-levels')?.addEventListener('click', () => this.showScreen('levels'));

        // Level Select Back
        document.getElementById('btn-back-menu')?.addEventListener('click', () => this.showScreen('menu'));

        // Pause Menu
        document.getElementById('btn-hud-pause')?.addEventListener('click', () => this.callbacks.onPause());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.callbacks.onResume());
        document.getElementById('btn-restart-pause')?.addEventListener('click', () => this.callbacks.onRestart());
        document.getElementById('btn-menu-pause')?.addEventListener('click', () => this.showScreen('menu'));

        // Level Cleared
        document.getElementById('btn-next-level')?.addEventListener('click', () => this.callbacks.onNextLevel());
        document.getElementById('btn-replay-cleared')?.addEventListener('click', () => this.callbacks.onRestart());
        document.getElementById('btn-menu-cleared')?.addEventListener('click', () => this.showScreen('menu'));

        // Game Over
        document.getElementById('btn-retry')?.addEventListener('click', () => this.callbacks.onRestart());
        document.getElementById('btn-menu-gameover')?.addEventListener('click', () => this.showScreen('menu'));

        // Settings
        this.btnAudio?.addEventListener('click', () => {
            const isMuted = this.callbacks.onToggleAudio();
            this.updateAudioButton(isMuted);
        });

        this.btnMusic?.addEventListener('click', () => {
            const isMusicMuted = this.callbacks.onToggleMusic();
            this.updateMusicButton(isMusicMuted);
        });

        this.btnTheme?.addEventListener('click', () => {
            const nextTheme = this.callbacks.onToggleTheme();
            this.updateThemeButton(nextTheme);
        });

        this.btnScanlines?.addEventListener('click', () => {
            const active = this.callbacks.onToggleScanlines();
            this.btnScanlines.classList.toggle('active', active);
        });
    }

    showScreen(screenId) {
        // Hide all screens
        this.screenMenu?.classList.add('hidden');
        this.screenLevels?.classList.add('hidden');
        this.screenPause?.classList.add('hidden');
        this.screenCleared?.classList.add('hidden');
        this.screenGameOver?.classList.add('hidden');

        if (screenId === 'none') {
            this.hud?.classList.remove('hidden');
            return;
        }

        this.hud?.classList.add('hidden');

        if (screenId === 'menu') {
            this.screenMenu?.classList.remove('hidden');
        } else if (screenId === 'levels') {
            this.screenLevels?.classList.remove('hidden');
            this.renderLevelGrid();
        } else if (screenId === 'pause') {
            this.screenPause?.classList.remove('hidden');
            this.hud?.classList.remove('hidden'); // keep hud visible in background
        } else if (screenId === 'cleared') {
            this.screenCleared?.classList.remove('hidden');
        } else if (screenId === 'gameover') {
            this.screenGameOver?.classList.remove('hidden');
        }
    }

    renderLevelGrid() {
        const grid = document.getElementById('level-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const totalLevels = this.callbacks.getTotalLevels();
        let unlocked = 1;
        try {
            unlocked = parseInt(localStorage.getItem('bounce_unlocked_level') || '1', 10);
        } catch (e) {}

        for (let i = 0; i < totalLevels; i++) {
            const lvlNum = i + 1;
            const isUnlocked = lvlNum <= unlocked;

            const card = document.createElement('button');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.disabled = !isUnlocked;

            // Retrieve saved stars
            let stars = 0;
            try {
                stars = parseInt(localStorage.getItem(`bounce_level_${lvlNum}_stars`) || '0', 10);
            } catch (e) {}

            let starHtml = '';
            for (let s = 1; s <= 3; s++) {
                starHtml += `<span class="star-icon ${s <= stars ? 'active' : ''}">★</span>`;
            }

            card.innerHTML = `
                <div class="level-num">${lvlNum}</div>
                <div class="level-card-title">${this.getLevelName(i)}</div>
                <div class="level-stars">${starHtml}</div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.callbacks.onPlay(i);
                });
            }

            grid.appendChild(card);
        }
    }

    getLevelName(index) {
        const names = ['Emerald Meadow', 'Brick Fortress', 'Tunnel Maze', 'Neon Overdrive'];
        return names[index] || `Level ${index + 1}`;
    }

    updateHUD(score, coins, progress, activeTool, toolTimer, toolDuration, levelInfo) {
        if (this.scoreVal) this.scoreVal.textContent = score;
        if (this.coinCount) this.coinCount.textContent = coins;
        if (this.levelName && levelInfo) {
            this.levelName.textContent = levelInfo.isEndless ? 'Endless Run' : levelInfo.name;
        }

        // Update Level Progress Bar
        const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
        if (this.progressBarFill) {
            this.progressBarFill.style.width = `${pct}%`;
        }
        if (this.progressBallIcon) {
            this.progressBallIcon.style.left = `${pct}%`;
        }

        // Update Tool Effect Timer HUD
        if (activeTool && toolTimer > 0) {
            this.toolTimerContainer?.classList.remove('hidden');
            const toolPct = Math.max(0, Math.min(100, (toolTimer / toolDuration) * 100));
            if (this.toolBarFill) {
                this.toolBarFill.style.width = `${toolPct}%`;
            }
            if (this.toolTimeText) {
                this.toolTimeText.textContent = `${toolTimer.toFixed(1)}s`;
            }

            // Warning blink when under 2.5 seconds
            if (toolTimer < 2.5) {
                this.toolTimerContainer?.classList.add('expiring');
            } else {
                this.toolTimerContainer?.classList.remove('expiring');
            }

            // Set tool styling & icons
            if (this.toolName && this.toolIcon) {
                if (activeTool === 'growth') {
                    this.toolName.textContent = 'GROWTH';
                    this.toolIcon.textContent = '▲';
                } else if (activeTool === 'shrink') {
                    this.toolName.textContent = 'SHRINK';
                    this.toolIcon.textContent = '▼';
                } else if (activeTool === 'superJump') {
                    this.toolName.textContent = 'SUPER JUMP';
                    this.toolIcon.textContent = '⚡';
                }
                this.toolTimerContainer?.setAttribute('data-tool', activeTool);
            }
        } else {
            this.toolTimerContainer?.classList.add('hidden');
            this.toolTimerContainer?.classList.remove('expiring');
        }
    }

    showLevelCleared(stats) {
        if (this.clearedStats) {
            this.clearedStats.innerHTML = `
                <div class="stat-row"><span>Coins:</span> <strong>${stats.coins}</strong></div>
                <div class="stat-row"><span>Time:</span> <strong>${stats.time}s</strong></div>
                <div class="stat-row"><span>Total Score:</span> <strong>${stats.score}</strong></div>
            `;
        }

        // Star calculation (1 to 3 stars)
        let stars = 1;
        if (stats.coins >= stats.totalCoins * 0.75) stars = 2;
        if (stats.coins === stats.totalCoins) stars = 3;

        // Save progress to localStorage
        try {
            const currentUnlocked = parseInt(localStorage.getItem('bounce_unlocked_level') || '1', 10);
            if (stats.levelIndex + 2 > currentUnlocked) {
                localStorage.setItem('bounce_unlocked_level', String(stats.levelIndex + 2));
            }
            const prevStars = parseInt(localStorage.getItem(`bounce_level_${stats.levelIndex + 1}_stars`) || '0', 10);
            if (stars > prevStars) {
                localStorage.setItem(`bounce_level_${stats.levelIndex + 1}_stars`, String(stars));
            }
        } catch (e) {}

        if (this.clearedStars) {
            let starHtml = '';
            for (let s = 1; s <= 3; s++) {
                starHtml += `<span class="star-icon ${s <= stars ? 'active pop' : ''}">★</span>`;
            }
            this.clearedStars.innerHTML = starHtml;
        }

        this.showScreen('cleared');
    }

    showGameOver(stats) {
        if (this.gameOverStats) {
            this.gameOverStats.innerHTML = `
                <div class="stat-row"><span>Coins Collected:</span> <strong>${stats.coins}</strong></div>
                <div class="stat-row"><span>Distance Reached:</span> <strong>${stats.distance}m</strong></div>
                <div class="stat-row"><span>Score:</span> <strong>${stats.score}</strong></div>
            `;
        }
        this.showScreen('gameover');
    }

    updateAudioButton(isMuted) {
        if (this.btnAudio) {
            this.btnAudio.innerHTML = isMuted ? '🔇 SFX Off' : '🔊 SFX On';
            this.btnAudio.classList.toggle('muted', isMuted);
        }
    }

    updateMusicButton(isMusicMuted) {
        if (this.btnMusic) {
            this.btnMusic.innerHTML = isMusicMuted ? '🎵 BGM Off' : '🎶 BGM On';
            this.btnMusic.classList.toggle('muted', isMusicMuted);
        }
    }

    updateThemeButton(theme) {
        if (this.btnTheme) {
            const labelMap = {
                'classic': '🎨 Arcade',
                'nokia': '📱 Nokia 3310',
                'cyber': '🌆 Cyber'
            };
            this.btnTheme.innerHTML = labelMap[theme] || 'Theme';
        }
    }
}
