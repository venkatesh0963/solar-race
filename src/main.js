import Game from './Game.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const startScreen = document.getElementById('start-screen');
  const hud = document.getElementById('hud');
  const gameOverScreen = document.getElementById('game-over-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const finalScoreText = document.getElementById('final-score');

  // Initialize Game instance
  const game = new Game();

  // Initial render (shows background before starting)
  game.renderer.render(game.scene, game.camera);

  // Event Listeners for UI
  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    game.start();
  });

  restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    game.start();
  });

  pauseBtn.addEventListener('click', () => {
    if (game.isRunning && !game.isPaused) {
      game.pause();
      hud.classList.add('hidden');
      pauseScreen.classList.remove('hidden');
    }
  });

  resumeBtn.addEventListener('click', () => {
    if (game.isRunning && game.isPaused) {
      game.resume();
      pauseScreen.classList.add('hidden');
      hud.classList.remove('hidden');
    }
  });

  const zoneAnnouncer = document.getElementById('zone-announcer');
  const zoneText = document.getElementById('zone-text');

  // Listen for Game Over event triggered by Game.js
  window.addEventListener('gameover', (e) => {
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreText.innerText = e.detail.score;
  });

  // Listen for Zone Change
  window.addEventListener('zonechange', (e) => {
    zoneText.innerText = e.detail.name;
    zoneAnnouncer.classList.remove('hidden');
    zoneText.classList.remove('zone-animate');
    
    // Trigger reflow to restart CSS animation
    void zoneText.offsetWidth; 
    
    zoneText.classList.add('zone-animate');
  });
});
