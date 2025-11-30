const choices = document.querySelectorAll('.choice');
const userChoiceEl = document.getElementById('user-choice');
const computerChoiceEl = document.getElementById('computer-choice');
const resultEl = document.getElementById('result');
const userScoreEl = document.getElementById('user-score');
const computerScoreEl = document.getElementById('computer-score');
const resetBtn = document.getElementById('reset-btn');
const roundEl = document.getElementById('round');
const themeSwitch = document.getElementById('theme-switch');

// 🔊 Sound FX
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');
const tieSound = document.getElementById('tie-sound');

// 🎤 Voice Announcer FX
const voiceResult = document.getElementById('voice-result');
const voiceFlawless = document.getElementById('voice-flawless');

// 🎬 Animation elements
const playerHand = document.getElementById('player-hand');
const cpuHand = document.getElementById('cpu-hand');
const versusText = document.getElementById('versus');
const gameContainer = document.querySelector('.game-container');

// --- GAME UPGRADE START ---
// New elements
const setupPanel = document.querySelector('.setup-panel');
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const displayPlayerName = document.getElementById('display-player-name');
const modeSelect = document.getElementById('mode-select');
const maxRoundEl = document.getElementById('max-round');
const timerEl = document.getElementById('timer');
const muteBtn = document.getElementById('mute-btn');
const bgMusic = document.getElementById('bg-music');
const confettiCanvas = document.getElementById('confetti-canvas');
const summaryModal = document.getElementById('summary-modal');
const summaryTitle = document.getElementById('summary-title');
const summaryDetails = document.getElementById('summary-details');
const closeSummary = document.getElementById('close-summary');
const pauseBtn = document.getElementById('pause-btn');
const timerProgress = document.getElementById('timer-progress');
const loaderOverlay = document.getElementById('loader-overlay');
const loaderFallback = document.querySelector('.loader-fallback');
const remapButtons = document.querySelectorAll('.remap-btn');

let maxRounds = 5; // Default max rounds
const initialTimer = 10; // seconds per round
let timer = initialTimer;
let timerInterval = null;
let isMuted = false;
let playerName = '';
let gameActive = false;
let userScore = 0;
let computerScore = 0;
let round = 1;
let paused = false;
let awaitingRemap = null; // choice string we're remapping
let keyMap = {}; // choice -> key

function emoji(choice) {
  return choice === 'rock' ? '✊' :
         choice === 'paper' ? '✋' :
         choice === 'scissors' ? '✌' :
         choice === 'lizard' ? '🦎' :
         choice === 'spock' ? '🖖' : '❓';
}

function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function getResult(user, comp) {
  if (user === comp) return "It's a Tie 😐";
  // RPSLS rules
  if (
    (user === 'rock' && (comp === 'scissors' || comp === 'lizard')) ||
    (user === 'paper' && (comp === 'rock' || comp === 'spock')) ||
    (user === 'scissors' && (comp === 'paper' || comp === 'lizard')) ||
    (user === 'lizard' && (comp === 'spock' || comp === 'paper')) ||
    (user === 'spock' && (comp === 'scissors' || comp === 'rock'))
  ) {
    return "You Win! 🎉";
  } else {
    return "You Lose 😭";
  }
}

function startTimer() {
  clearInterval(timerInterval);
  // start timer from current `timer` value if set, otherwise initial
  timer = (typeof timer === 'number' && timer > 0) ? timer : initialTimer;
  timerEl.textContent = timer;
  updateTimerProgress();
  timerInterval = setInterval(() => {
    if (paused) return;
    timer--;
    timerEl.textContent = timer;
    updateTimerProgress();
    if (timer <= 0) {
      clearInterval(timerInterval);
      autoPick();
    }
  }, 1000);
}

function updateTimerProgress() {
  if (!timerProgress) return;
  const pct = Math.max(0, Math.min(100, (timer / initialTimer) * 100));
  timerProgress.style.width = pct + '%';
}

function pauseGame() {
  if (paused) return;
  paused = true;
  pauseBtn.textContent = '▶️ Resume';
  pauseBtn.setAttribute('aria-pressed', 'true');
  clearInterval(timerInterval);
  try { bgMusic.pause(); } catch(e) {}
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  pauseBtn.textContent = '⏸️ Pause';
  pauseBtn.setAttribute('aria-pressed', 'false');
  // resume timer from current value
  startTimer();
  try { if (!isMuted) bgMusic.play().catch(() => {}); } catch(e) {}
}

pauseBtn && pauseBtn.addEventListener('click', () => {
  if (!gameActive) return;
  if (paused) resumeGame(); else pauseGame();
});

function autoPick() {
  // Pick a random choice for the user if time runs out
  const enabledChoices = Array.from(choices).filter(btn => !btn.disabled);
  if (enabledChoices.length > 0) {
    enabledChoices[Math.floor(Math.random() * enabledChoices.length)].click();
  }
}

function showConfetti() {
  // Simple confetti effect
  confettiCanvas.style.display = 'block';
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  let confetti = [];
  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      r: Math.random() * 8 + 4,
      d: Math.random() * 40 + 10,
      color: `hsl(${Math.random()*360},100%,60%)`,
      tilt: Math.random() * 10 - 10
    });
  }
  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    angle += 0.01;
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      c.y += (Math.cos(angle + c.d) + 3 + c.r/2) / 2;
      c.x += Math.sin(angle);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
    }
    confetti = confetti.filter(c => c.y < confettiCanvas.height + 20);
    if (confetti.length > 0) {
      requestAnimationFrame(draw);
    } else {
      confettiCanvas.style.display = 'none';
    }
  }
  draw();
}

function showSummary() {
  summaryTitle.textContent = 'Game Over';
  summaryDetails.innerHTML = `${playerName ? playerName + ', ' : ''}Final Score:<br>You: ${userScore} | Computer: ${computerScore}`;
  // Save player name and update leaderboard
  try { localStorage.setItem('rps_playerName', playerName); } catch (e) {}
  try { updateLeaderboard(playerName || 'Player', userScore); } catch (e) {}
  summaryModal.style.display = 'flex';
}

closeSummary.addEventListener('click', () => {
  summaryModal.style.display = 'none';
  setupPanel.style.display = 'flex';
  gameContainer.style.display = 'none';
});

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  [clickSound, winSound, loseSound, tieSound, voiceResult, voiceFlawless, bgMusic].forEach(a => { if(a) a.muted = isMuted; });
  muteBtn.classList.toggle('muted', isMuted);
  muteBtn.textContent = isMuted ? '🔈 Unmute' : '🔇 Mute';
});

// --- IMPROVEMENTS START ---
// 1. Add Enter key support for player name input
playerNameInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    startBtn.click();
  }
});

// 2. Prevent multiple games from running at once
startBtn.addEventListener('click', () => {
  if (gameActive) return; // Prevent double start
  playerName = playerNameInput.value.trim() || 'Player';
  displayPlayerName.textContent = playerName;
  maxRounds = parseInt(modeSelect.value, 10);
  maxRoundEl.textContent = maxRounds;
  setupPanel.style.display = 'none';
  gameContainer.style.display = 'block';
  userScore = 0;
  computerScore = 0;
  round = 1;
  userScoreEl.textContent = '0';
  computerScoreEl.textContent = '0';
  roundEl.textContent = '1';
  resultEl.textContent = 'Result: 🤔';
  userChoiceEl.textContent = '❓';
  computerChoiceEl.textContent = '❓';
  bgMusic.currentTime = 0;
  bgMusic.play();
  gameActive = true;
  startTimer();
});

// 3. Reset disables gameActive
resetBtn.addEventListener('click', () => {
  userScore = 0;
  computerScore = 0;
  round = 1;
  userChoiceEl.textContent = '❓';
  computerChoiceEl.textContent = '❓';
  resultEl.textContent = 'Result: 🤔';
  userScoreEl.textContent = '0';
  computerScoreEl.textContent = '0';
  roundEl.textContent = '1';
  bgMusic.currentTime = 0;
  bgMusic.play();
  gameActive = false;
  // clear any running timers and reset timer display
  clearInterval(timerInterval);
  timer = initialTimer;
  timerEl.textContent = timer;
  // clear fists/animations
  playerHand.textContent = '';
  cpuHand.textContent = '';
  startTimer();
});

// Allow clicking loader to enable audio if browser blocked autoplay
document.addEventListener('click', () => {
  if (loaderOverlay && loaderOverlay.style.display !== 'none') {
    try { if (!isMuted) bgMusic.play().catch(() => {}); } catch(e) {}
    if (loaderOverlay) loaderOverlay.style.display = 'none';
  }
});

// 4. Show confetti on win
function checkForWin() {
  if (userScore > Math.floor(maxRounds / 2)) {
    showConfetti();
  }
}

// 5. Add focus to player name input on load
window.addEventListener('DOMContentLoaded', () => {
  playerNameInput.focus();
});
// Load saved player name and render leaderboard
window.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('rps_playerName');
    if (saved) playerNameInput.value = saved;
  } catch (e) {}
  renderLeaderboard();
  // load key map
  try {
    const km = JSON.parse(localStorage.getItem('rps_keyMap') || '{}');
    keyMap = km || {};
  } catch (e) { keyMap = {}; }
  // add key hint spans to choice buttons
  choices.forEach(btn => {
    const hint = document.createElement('span');
    hint.className = 'key-hint';
    const choice = btn.dataset.choice;
    const defaultKey = btn.dataset.key || btn.getAttribute('data-key') || '';
    hint.textContent = keyMap[choice] || defaultKey || '';
    hint.style.fontSize = '0.6rem';
    hint.style.display = 'block';
    hint.style.marginTop = '6px';
    btn.appendChild(hint);
  });
  updateKeyHints();
  // remap button handlers
  document.querySelectorAll('.remap-btn').forEach(b => {
    b.addEventListener('click', (ev) => {
      const choice = b.dataset.choice;
      awaitingRemap = choice;
      b.textContent = 'Press a key...';
      setTimeout(() => { b.textContent = 'Remap'; }, 3000);
    });
  });
  // loader: wait for audio to be ready or timeout
  const audios = [clickSound, winSound, loseSound, tieSound, bgMusic, voiceFlawless];
  const audioPromises = audios.map(a => new Promise((res) => {
    if (!a) return res(true);
    const onReady = () => { a.removeEventListener('canplaythrough', onReady); res(true); };
    a.addEventListener('canplaythrough', onReady);
    // also handle error
    a.addEventListener('error', () => { res(false); });
  }));
  Promise.race([Promise.all(audioPromises), new Promise(r => setTimeout(() => r('timeout'), 2500))])
    .then((v) => {
      if (loaderOverlay) loaderOverlay.style.display = 'none';
      // if timeout or some failed, show fallback hint
      if (v === 'timeout') {
        if (loaderFallback) loaderFallback.style.display = 'block';
      }
    });
});

// Sync mode select to display
modeSelect.addEventListener('change', () => {
  maxRounds = parseInt(modeSelect.value, 10) || 5;
  if (maxRoundEl) maxRoundEl.textContent = maxRounds;
});

// Keyboard shortcuts: 1-5 map to choices when game is active
// Global key handler supports remapping and gameplay shortcuts
document.addEventListener('keydown', (e) => {
  // if remapping mode active, assign mapping
  if (awaitingRemap) {
    const newKey = e.key;
    keyMap[awaitingRemap] = newKey;
    try { localStorage.setItem('rps_keyMap', JSON.stringify(keyMap)); } catch (er) {}
    updateKeyHints();
    awaitingRemap = null;
    // restore focus
    return;
  }
  if (!gameActive) return;
  const key = e.key;
  // find mapped choice for this key
  for (const btn of choices) {
    const choice = btn.dataset.choice;
    const mapped = keyMap[choice] || btn.dataset.key;
    if (mapped == key && !btn.disabled) {
      btn.click();
      break;
    }
  }
});

// Leaderboard helpers (store top 5)
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('rps_leaderboard') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(lb) {
  try {
    localStorage.setItem('rps_leaderboard', JSON.stringify(lb));
  } catch (e) {}
}

function updateLeaderboard(name, score) {
  if (!name) name = 'Player';
  const lb = getLeaderboard();
  lb.push({ name, score });
  lb.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = lb.slice(0, 5);
  saveLeaderboard(top);
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  const lb = getLeaderboard();
  list.innerHTML = '';
  if (!lb || lb.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No scores yet';
    list.appendChild(li);
    return;
  }
  lb.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}
// --- IMPROVEMENTS END ---

function startGame() {
  playerName = playerNameInput.value.trim() || 'Player';
  displayPlayerName.textContent = playerName;
  maxRounds = parseInt(modeSelect.value, 10);
  maxRoundEl.textContent = maxRounds;
  setupPanel.style.display = 'none';
  gameContainer.style.display = 'block';
  userScore = 0;
  computerScore = 0;
  round = 1;
  userScoreEl.textContent = '0';
  computerScoreEl.textContent = '0';
  roundEl.textContent = '1';
  resultEl.textContent = 'Result: 🤔';
  userChoiceEl.textContent = '❓';
  computerChoiceEl.textContent = '❓';
  bgMusic.currentTime = 0;
  bgMusic.play();
  gameActive = true;
  startTimer();
}

function resetGame() {
  userScore = 0;
  computerScore = 0;
  round = 1;
  userChoiceEl.textContent = '❓';
  computerChoiceEl.textContent = '❓';
  resultEl.textContent = 'Result: 🤔';
  userScoreEl.textContent = '0';
  computerScoreEl.textContent = '0';
  roundEl.textContent = '1';
  bgMusic.currentTime = 0;
  bgMusic.play();
  gameActive = false;
  startTimer();
}

// Add a round animation element to the DOM
document.addEventListener('DOMContentLoaded', () => {
  const roundAnim = document.createElement('div');
  roundAnim.id = 'round-animation';
  roundAnim.style.position = 'fixed';
  roundAnim.style.top = '50%';
  roundAnim.style.left = '50%';
  roundAnim.style.transform = 'translate(-50%, -50%)';
  roundAnim.style.fontSize = '3rem';
  roundAnim.style.fontWeight = 'bold';
  roundAnim.style.color = '#00f7ff';
  roundAnim.style.textShadow = '0 0 20px #00f7ff, 0 0 40px #ff006e';
  roundAnim.style.background = 'rgba(0,0,0,0.7)';
  roundAnim.style.padding = '30px 60px';
  roundAnim.style.borderRadius = '20px';
  roundAnim.style.zIndex = '1000';
  roundAnim.style.display = 'none';
  roundAnim.style.transition = 'opacity 0.5s, transform 0.5s';
  document.body.appendChild(roundAnim);
});

function showRoundAnimation(round) {
  const roundAnim = document.getElementById('round-animation');
  if (!roundAnim) return;
  roundAnim.textContent = `Round ${round}`;
  roundAnim.style.opacity = '1';
  roundAnim.style.display = 'block';
  roundAnim.style.transform = 'translate(-50%, -50%) scale(1.2)';
  setTimeout(() => {
    roundAnim.style.transform = 'translate(-50%, -50%) scale(1)';
    roundAnim.style.opacity = '0';
  }, 1200);
  setTimeout(() => {
    roundAnim.style.display = 'none';
  }, 1700);
}

choices.forEach(choice => {
  choice.addEventListener('click', () => {
    if (round > maxRounds) return;

    if (clickSound) clickSound.play().catch(() => {});

    // Show round animation before match starts
    showRoundAnimation(round);

    // Disable choices during animation
    choices.forEach(btn => btn.disabled = true);
    setTimeout(() => {
      // Determine choices and result after animation
      const userChoice = choice.dataset.choice;
      const computerChoice = getComputerChoice();
      const result = getResult(userChoice, computerChoice);

      // 👊 Show battle fists
      playerHand.textContent = emoji(userChoice);
      cpuHand.textContent = emoji(computerChoice);
      playerHand.classList.add('slide-in');
      cpuHand.classList.add('slide-in');
      versusText.classList.add('active');

      setTimeout(() => {
        playerHand.classList.remove('slide-in');
        cpuHand.classList.remove('slide-in');
        versusText.classList.remove('active');
      }, 800);

      // 🧠 Update emoji results
      userChoiceEl.textContent = emoji(userChoice);
      computerChoiceEl.textContent = emoji(computerChoice);

      // 💥 Animate result text
      resultEl.textContent = "Result: " + result;
      resultEl.classList.remove('flash');
      resultEl.offsetHeight; // reflow
      resultEl.classList.add('flash');

      // 😵 Screen shake
      gameContainer.classList.add('shake');
      setTimeout(() => {
        gameContainer.classList.remove('shake');
      }, 400);

      // 🎯 Scoring + Result voice
      let resultSound, resultVoice;
      if (result === "You Win! 🎉") {
        resultSound = winSound;
        resultVoice = 'sounds/voices/win.mp3';
        userScore++;
      } else if (result === "You Lose 😭") {
        resultSound = loseSound;
        resultVoice = 'sounds/voices/lose.mp3';
        computerScore++;
      } else {
        resultSound = tieSound;
        resultVoice = 'sounds/voices/tie.mp3';
      }
      // Fix: Remove previous handlers and play only once
      if (resultSound) {
        resultSound.pause();
        resultSound.currentTime = 0;
        resultSound.onended = null;
        resultSound.onerror = null;
        resultSound.onended = () => {
          voiceResult.src = resultVoice;
          voiceResult.currentTime = 0;
          voiceResult.play().catch(() => {});
          resultSound.onended = null;
        };
        resultSound.onerror = () => {
          voiceResult.src = resultVoice;
          voiceResult.currentTime = 0;
          voiceResult.play().catch(() => {});
          resultSound.onerror = null;
        };
        resultSound.play().catch(() => {});
      } else {
        voiceResult.src = resultVoice;
        voiceResult.currentTime = 0;
        voiceResult.play().catch(() => {});
      }

      // 📊 Update scores
      userScoreEl.textContent = userScore;
      computerScoreEl.textContent = computerScore;

      // 🔁 Next round
      round++;
      // If rounds exceeded, end game
      if (round > maxRounds) {
        roundEl.textContent = 'Game Over';
        gameActive = false;
        clearInterval(timerInterval);
        // Disable further choices
        choices.forEach(btn => btn.disabled = true);
        // Show summary shortly after animations
        setTimeout(() => {
          showSummary();
          try { bgMusic.pause(); } catch(e) {}
        }, 900);
        // 💀 FLAWLESS VICTORY voice (won all rounds without losing any)
        if (computerScore === 0 && userScore > Math.floor(maxRounds / 2)) {
          setTimeout(() => {
            voiceFlawless.currentTime = 0;
            voiceFlawless.play().catch(() => {});
          }, 1200);
        }
      } else {
        roundEl.textContent = round;
        // restart timer for next round
        startTimer();
      }
      // Re-enable choices after everything
      setTimeout(() => {
        choices.forEach(btn => btn.disabled = false);
      }, 2000);
      // update key hints (if we show per-choice)
      updateKeyHints();
    }, 1700); // Wait for round animation to finish
  });
});

function updateKeyHints() {
  choices.forEach(btn => {
    const choice = btn.dataset.choice;
    const mapped = keyMap[choice];
    const hint = btn.querySelector('.key-hint');
    if (hint) hint.textContent = mapped || btn.dataset.key || '';
    // also update remap display
    const remEl = document.querySelector(`.remap-key[data-choice="${choice}"]`);
    if (remEl) remEl.textContent = mapped || btn.dataset.key || '';
  });
}



themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light');
});

// Custom validation for player name input
playerNameInput.addEventListener('input', function() {
  // Only allow letters, spaces, and up to 16 chars
  let val = this.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 16);
  if (val !== this.value) {
    this.value = val;
  }
  // Optional: Capitalize first letter of each word
  this.value = this.value.replace(/\b\w/g, c => c.toUpperCase());
});
