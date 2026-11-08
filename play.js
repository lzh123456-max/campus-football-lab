const directions = ['left', 'centre', 'right'];
const positions = { left: '25%', centre: '50%', right: '75%' };
const keeperTilts = { left: '-25deg', centre: '0deg', right: '25deg' };

const isDirection = (direction) => directions.includes(direction);

// These functions return new state objects and do not touch the page or timers.
// Passing the keeper direction explicitly makes every possible shot testable.
export function createPenaltyState() {
  return { round: 1, score: 0, aim: 'centre', keeper: null, shots: [], phase: 'aiming' };
}

export function getShotOutcome(aim, keeper) {
  if (!isDirection(aim) || !isDirection(keeper)) return null;
  return aim === keeper ? 'saved' : 'goal';
}

function isGameState(state) {
  return state && Array.isArray(state.shots) && state.shots.length <= 5
    && Number.isInteger(state.round) && state.round >= 1 && state.round <= 5
    && Number.isInteger(state.score) && state.score >= 0 && state.score <= state.shots.length
    && isDirection(state.aim);
}

export function selectPenaltyAim(state, aim) {
  if (!isGameState(state) || state.phase !== 'aiming' || !isDirection(aim)) return state;
  return { ...state, aim };
}

export function beginPenaltyShot(state, keeper) {
  if (!isGameState(state) || state.phase !== 'aiming' || !isDirection(keeper)
    || state.shots.length >= 5 || state.round !== state.shots.length + 1) return state;
  return { ...state, keeper, phase: 'shooting' };
}

export function resolvePenaltyShot(state) {
  if (!isGameState(state) || state.phase !== 'shooting'
    || state.shots.length >= 5 || state.round !== state.shots.length + 1) return state;
  const outcome = getShotOutcome(state.aim, state.keeper);
  if (!outcome) return state;
  const shot = { round: state.round, aim: state.aim, keeper: state.keeper, outcome };
  const shots = [...state.shots, shot];
  return {
    ...state,
    shots,
    score: state.score + (outcome === 'goal' ? 1 : 0),
    phase: shots.length === 5 ? 'complete' : 'result'
  };
}

export function advancePenaltyRound(state) {
  if (!isGameState(state) || state.phase !== 'result' || state.shots.length >= 5) return state;
  return { ...state, round: state.shots.length + 1, keeper: null, phase: 'aiming' };
}

function initialisePenaltyGame() {
  const game = document.querySelector('#penalty-game');
  if (!game) return;
  const roundLabel = game.querySelector('#game-round');
  const scoreLabel = game.querySelector('#game-score');
  const history = game.querySelector('#shot-history');
  const field = game.querySelector('#penalty-field');
  const keeper = game.querySelector('#keeper');
  const ball = game.querySelector('#penalty-ball');
  const stamp = game.querySelector('#shot-stamp');
  const aimButtons = [...game.querySelectorAll('button[data-aim]')];
  const selectedAim = game.querySelector('#selected-aim');
  const shootButton = game.querySelector('#shoot-button');
  const nextButton = game.querySelector('#next-shot');
  const restartButton = game.querySelector('#restart-game');
  const status = game.querySelector('#game-status');
  const summary = game.querySelector('#game-summary');
  const summaryTitle = game.querySelector('#summary-title');
  const summaryCopy = game.querySelector('#summary-copy');
  if (![roundLabel, scoreLabel, history, field, keeper, ball, stamp, selectedAim,
    shootButton, nextButton, restartButton, status, summary, summaryTitle, summaryCopy].every(Boolean)
    || aimButtons.length !== 3) return;

  let state = createPenaltyState();
  let shotTimer = null;
  let animationVersion = 0;

  function resetField() {
    field.classList.remove('is-shooting', 'is-goal', 'is-save');
    field.style.removeProperty('--aim-x');
    field.style.removeProperty('--keeper-x');
    field.style.removeProperty('--keeper-tilt');
    stamp.hidden = true;
    stamp.textContent = '';
  }

  function renderHistory() {
    history.replaceChildren();
    for (let index = 0; index < 5; index += 1) {
      const shot = state.shots[index];
      const item = document.createElement('li');
      item.className = shot ? shot.outcome : 'pending';
      item.textContent = shot ? (shot.outcome === 'goal' ? '✓' : '×') : String(index + 1);
      const description = shot
        ? `Shot ${index + 1}: ${shot.outcome === 'goal' ? 'goal' : 'saved'}. Aimed ${shot.aim}; goalkeeper went ${shot.keeper}.`
        : `Shot ${index + 1}: ${index + 1 === state.round ? 'current shot' : 'not taken'}.`;
      item.setAttribute('aria-label', description);
      item.title = description;
      if (!shot && index + 1 === state.round) item.classList.add('is-current');
      history.append(item);
    }
  }

  function renderControls() {
    roundLabel.textContent = String(state.round);
    scoreLabel.textContent = String(state.score);
    selectedAim.textContent = state.aim.charAt(0).toUpperCase() + state.aim.slice(1);
    aimButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.aim === state.aim));
      button.disabled = state.phase !== 'aiming';
    });
    shootButton.disabled = state.phase !== 'aiming';
    shootButton.textContent = state.phase === 'shooting' ? 'Shooting…' : 'Shoot';
    nextButton.hidden = state.phase !== 'result';
    nextButton.disabled = state.phase !== 'result';
    nextButton.textContent = 'Next shot →';
    restartButton.textContent = state.phase === 'complete' ? 'Play again' : 'Restart game';
    summary.hidden = state.phase !== 'complete';
    if (state.phase === 'complete') {
      summaryTitle.textContent = state.score === 5 ? 'Five shots. Five goals.' : 'Full time!';
      const ending = state.score === 5 ? 'A perfect round.' : state.score >= 3
        ? 'More goals than saves. Nicely placed.' : 'The keeper had a good round. Try a new set of directions.';
      summaryCopy.textContent = `You scored ${state.score} ${state.score === 1 ? 'goal' : 'goals'} from 5 shots. ${ending}`;
    }
    renderHistory();
  }

  function restartGame() {
    // Clearing the timer and changing its version prevents an old shot scoring.
    window.clearTimeout(shotTimer);
    shotTimer = null;
    animationVersion += 1;
    state = createPenaltyState();
    resetField();
    renderControls();
    status.textContent = 'Choose left, centre, or right. Then take your first shot.';
  }

  aimButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const updated = selectPenaltyAim(state, button.dataset.aim);
      if (updated === state) return;
      state = updated;
      renderControls();
      status.textContent = `Aiming ${state.aim}. Ready for shot ${state.round} of 5.`;
    });
  });

  shootButton.addEventListener('click', () => {
    if (state.phase !== 'aiming') return;
    // The keeper chooses independently; the selected aim never affects this draw.
    const keeperDirection = directions[Math.floor(Math.random() * directions.length)];
    const updated = beginPenaltyShot(state, keeperDirection);
    if (updated === state) return;
    state = updated;
    const thisAnimation = ++animationVersion;
    field.style.setProperty('--aim-x', positions[state.aim]);
    field.style.setProperty('--keeper-x', positions[state.keeper]);
    field.style.setProperty('--keeper-tilt', keeperTilts[state.keeper]);
    field.classList.add('is-shooting');
    renderControls();
    status.textContent = `Shot ${state.round} is on its way…`;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    shotTimer = window.setTimeout(() => {
      if (thisAnimation !== animationVersion || state.phase !== 'shooting') return;
      shotTimer = null;
      state = resolvePenaltyShot(state);
      const shot = state.shots.at(-1);
      field.classList.add(shot.outcome === 'goal' ? 'is-goal' : 'is-save');
      stamp.textContent = shot.outcome === 'goal' ? 'GOAL!' : 'SAVED';
      stamp.hidden = false;
      renderControls();
      const resultText = shot.outcome === 'goal' ? 'Goal!' : 'Saved!';
      status.textContent = `${resultText} You aimed ${shot.aim}; the keeper went ${shot.keeper}. `
        + (state.phase === 'complete'
          ? `All 5 shots complete. Final score: ${state.score} of 5. Choose Play again for another round.`
          : `Score: ${state.score}. Choose Next shot to continue.`);
      // Keep keyboard users on an available action after disabling Shoot.
      (state.phase === 'complete' ? restartButton : nextButton).focus({ preventScroll: true });
    }, reducedMotion ? 60 : 650);
  });

  nextButton.addEventListener('click', () => {
    const updated = advancePenaltyRound(state);
    if (updated === state) return;
    state = updated;
    resetField();
    renderControls();
    status.textContent = `Shot ${state.round} of 5. Choose a direction, then shoot.`;
    aimButtons.find((button) => button.dataset.aim === state.aim)?.focus({ preventScroll: true });
  });

  restartButton.addEventListener('click', () => {
    restartGame();
    aimButtons.find((button) => button.dataset.aim === state.aim)?.focus({ preventScroll: true });
  });

  // Navigation cancels a pending shot too; a restored page starts a fresh game.
  window.addEventListener('pagehide', restartGame);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) restartGame();
  });
  restartGame();
}

if (typeof document !== 'undefined') initialisePenaltyGame();
