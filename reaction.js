const targets = ['left', 'centre', 'right'];
const passPositions = { left: '20%', centre: '50%', right: '80%' };
const responseWindow = 3000;
const isTarget = (target) => targets.includes(target);
const titleCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Pure state functions make the timing rules testable without a browser.
export function createReactionState() {
  return { round: 1, results: [], phase: 'idle', activeTarget: null, readyAt: null };
}

function isState(state) {
  return state && Array.isArray(state.results) && state.results.length <= 5
    && Number.isInteger(state.round) && state.round >= 1 && state.round <= 5;
}

export function startReactionRound(state) {
  if (!isState(state) || !['idle', 'paused'].includes(state.phase)
    || state.results.length >= 5 || state.round !== state.results.length + 1) return state;
  return { ...state, phase: 'waiting', activeTarget: null, readyAt: null };
}

export function revealReactionTarget(state, target, now) {
  if (!isState(state) || state.phase !== 'waiting' || !isTarget(target)
    || !Number.isFinite(now) || now < 0) return state;
  return { ...state, phase: 'ready', activeTarget: target, readyAt: now };
}

function finishAttempt(state, outcome, reason, chosen, reactionMs = null) {
  if (state.results.length >= 5 || state.round !== state.results.length + 1) return state;
  const attempt = { round: state.round, outcome, reason, target: state.activeTarget, chosen, reactionMs };
  const results = [...state.results, attempt];
  return { ...state, results, phase: results.length === 5 ? 'complete' : 'result', readyAt: null };
}

export function passReactionBall(state, chosen, now) {
  if (!isState(state) || !isTarget(chosen)) return state;
  if (state.phase === 'waiting') return finishAttempt(state, 'miss', 'early', chosen);
  if (state.phase !== 'ready' || !Number.isFinite(now)
    || !Number.isFinite(state.readyAt) || now < state.readyAt) return state;
  const elapsed = now - state.readyAt;
  if (elapsed >= responseWindow) return finishAttempt(state, 'miss', 'timeout', chosen);
  if (chosen !== state.activeTarget) return finishAttempt(state, 'miss', 'wrong', chosen);
  return finishAttempt(state, 'hit', 'hit', chosen, Math.round(elapsed));
}

export function expireReactionRound(state, now) {
  if (!isState(state) || state.phase !== 'ready' || !Number.isFinite(now)
    || !Number.isFinite(state.readyAt) || now - state.readyAt < responseWindow) return state;
  return finishAttempt(state, 'miss', 'timeout', null);
}

export function advanceReactionRound(state) {
  if (!isState(state) || state.phase !== 'result' || state.results.length >= 5) return state;
  return { ...state, round: state.results.length + 1, phase: 'idle', activeTarget: null, readyAt: null };
}

export function pauseReactionRound(state) {
  if (!isState(state) || !['waiting', 'ready'].includes(state.phase)) return state;
  return { ...state, phase: 'paused', activeTarget: null, readyAt: null };
}

export function getReactionStats(state) {
  const results = isState(state) ? state.results : [];
  const times = results.filter((result) => result.outcome === 'hit'
    && Number.isFinite(result.reactionMs) && result.reactionMs >= 0).map((result) => result.reactionMs);
  return {
    attempts: results.length,
    hits: times.length,
    averageMs: times.length ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : null,
    bestMs: times.length ? Math.min(...times) : null
  };
}

function initialiseReactionGame() {
  const game = document.querySelector('#reaction-game');
  if (!game) return;
  const find = (id) => game.querySelector(`#${id}`);
  const roundLabel = find('reaction-round');
  const hitsLabel = find('reaction-hits');
  const averageLabel = find('reaction-average');
  const field = find('reaction-field');
  const ball = find('reaction-ball');
  const cue = find('reaction-cue');
  const history = find('reaction-history');
  const startButton = find('reaction-start');
  const nextButton = find('reaction-next');
  const restartButton = find('reaction-restart');
  const status = find('reaction-status');
  const summary = find('reaction-summary');
  const summaryTitle = find('reaction-summary-title');
  const summaryCopy = find('reaction-summary-copy');
  const targetButtons = [...game.querySelectorAll('button[data-reaction-target]')];
  if (![roundLabel, hitsLabel, averageLabel, field, ball, cue, history, startButton, nextButton,
    restartButton, status, summary, summaryTitle, summaryCopy].every(Boolean)
    || targetButtons.length !== 3) return;

  let state = createReactionState();
  let roundTimer = null;
  let generation = 0;

  function cancelTimer() {
    window.clearTimeout(roundTimer);
    roundTimer = null;
    // Even an already-queued callback belongs to the old generation after reset.
    generation += 1;
  }

  function attemptDescription(attempt) {
    if (attempt.outcome === 'hit') return `Hit: ${attempt.reactionMs} milliseconds.`;
    if (attempt.reason === 'early') return 'Miss: the pass was made before a teammate was ready.';
    if (attempt.reason === 'wrong') return `Miss: ${attempt.target} was ready, but the pass went ${attempt.chosen}.`;
    return 'Miss: no valid pass within three seconds.';
  }

  function render() {
    const stats = getReactionStats(state);
    const last = state.results.at(-1);
    roundLabel.textContent = String(state.round);
    hitsLabel.textContent = String(stats.hits);
    averageLabel.textContent = stats.averageMs === null ? '—' : `${stats.averageMs} ms`;

    field.classList.remove('is-waiting', 'is-ready', 'is-passing', 'is-miss');
    field.style.removeProperty('--pass-x');
    if (state.phase === 'waiting') field.classList.add('is-waiting');
    if (state.phase === 'ready') field.classList.add('is-ready');
    if (['result', 'complete'].includes(state.phase) && last) {
      field.classList.add(last.outcome === 'hit' ? 'is-passing' : 'is-miss');
      if (last.chosen) field.style.setProperty('--pass-x', passPositions[last.chosen]);
    }
    targetButtons.forEach((button) => {
      const direction = button.dataset.reactionTarget;
      const active = state.phase === 'ready' && direction === state.activeTarget;
      button.classList.toggle('is-active', active);
      button.disabled = !['waiting', 'ready'].includes(state.phase);
      button.setAttribute('aria-label', `${titleCase(direction)} teammate${active ? ' — pass now' : ''}`);
    });

    const feedback = last?.reason === 'early' ? 'Too early!' : last?.reason === 'wrong'
      ? 'Wrong teammate!' : last?.reason === 'timeout' ? 'Time’s up!' : 'Nice pass!';
    cue.textContent = state.phase === 'idle' ? 'Ready to pass?' : state.phase === 'waiting'
      ? 'Wait for green…' : state.phase === 'ready' ? `${titleCase(state.activeTarget)} is open!`
        : state.phase === 'paused' ? 'Round paused' : feedback;

    startButton.hidden = ['result', 'complete'].includes(state.phase);
    startButton.disabled = !['idle', 'paused'].includes(state.phase);
    startButton.textContent = state.phase === 'paused' ? 'Resume round' : state.phase === 'waiting'
      ? 'Waiting…' : state.phase === 'ready' ? 'Pass now!' : 'Start round';
    nextButton.hidden = state.phase !== 'result';
    nextButton.disabled = state.phase !== 'result';
    nextButton.textContent = 'Next pass →';
    restartButton.textContent = state.phase === 'complete' ? 'Play again' : 'Restart challenge';

    history.replaceChildren();
    for (let index = 0; index < 5; index += 1) {
      const result = state.results[index];
      const item = document.createElement('li');
      const current = !result && index + 1 === state.round;
      item.className = result ? result.outcome : `pending${current ? ' current' : ''}`;
      item.textContent = result ? (result.outcome === 'hit' ? '✓' : '×') : String(index + 1);
      const description = `Pass ${index + 1}. ${result ? attemptDescription(result) : current ? 'Current round.' : 'Not attempted.'}`;
      item.setAttribute('aria-label', description);
      item.title = description;
      history.append(item);
    }

    summary.hidden = state.phase !== 'complete';
    if (state.phase === 'complete') {
      summaryTitle.textContent = `${stats.hits} of 5 passes connected.`;
      summaryCopy.textContent = stats.hits
        ? `Average valid reaction: ${stats.averageMs} ms. Best valid reaction: ${stats.bestMs} ms. Only successful passes count towards these times.`
        : 'No valid reaction times this round. Wait for a teammate to turn green, then pass to that player. Try again for a fresh set of five.';
    }
  }

  function pauseIfActive() {
    const paused = pauseReactionRound(state);
    if (paused === state) return;
    cancelTimer();
    state = paused;
    render();
    status.textContent = `Round ${state.round} is paused. No miss was recorded. Choose Resume round when you are ready.`;
  }

  function finishPass(updated) {
    if (updated === state) return;
    cancelTimer();
    state = updated;
    render();
    const stats = getReactionStats(state);
    status.textContent = `${attemptDescription(state.results.at(-1))} ` + (state.phase === 'complete'
      ? `Five rounds complete: ${stats.hits} hits. Choose Play again to restart.`
      : `Choose Next pass for round ${state.round + 1}.`);
    (state.phase === 'complete' ? restartButton : nextButton).focus({ preventScroll: true });
  }

  function scheduleExpiry(thisGeneration) {
    const remaining = Math.max(0, responseWindow - (performance.now() - state.readyAt));
    roundTimer = window.setTimeout(() => {
      if (thisGeneration !== generation || state.phase !== 'ready') return;
      roundTimer = null;
      if (document.hidden) { pauseIfActive(); return; }
      const updated = expireReactionRound(state, performance.now());
      // A browser timer can wake slightly early; wait out the remaining fraction.
      if (updated === state) scheduleExpiry(thisGeneration);
      else finishPass(updated);
    }, remaining);
  }

  function beginRound() {
    if (document.hidden) return;
    const updated = startReactionRound(state);
    if (updated === state) return;
    cancelTimer();
    state = updated;
    const thisGeneration = generation;
    render();
    status.textContent = `Round ${state.round} of 5. Wait for one teammate to turn green. Passing early counts as a miss.`;
    const delay = 500 + Math.floor(Math.random() * 1001);
    roundTimer = window.setTimeout(() => {
      if (thisGeneration !== generation || state.phase !== 'waiting') return;
      roundTimer = null;
      if (document.hidden) { pauseIfActive(); return; }
      const direction = targets[Math.floor(Math.random() * targets.length)];
      state = revealReactionTarget(state, direction, performance.now());
      render();
      status.textContent = `${titleCase(direction)} teammate is ready. Pass now!`;
      scheduleExpiry(thisGeneration);
    }, delay);
    // A focused teammate also lets Enter or Space make a pass without a mouse.
    targetButtons[1].focus({ preventScroll: true });
  }

  function passTo(direction) {
    if (document.hidden) { pauseIfActive(); return; }
    finishPass(passReactionBall(state, direction, performance.now()));
  }

  targetButtons.forEach((button) => {
    button.addEventListener('click', () => passTo(button.dataset.reactionTarget));
  });
  startButton.addEventListener('click', beginRound);
  nextButton.addEventListener('click', () => {
    if (document.hidden) return;
    const updated = advanceReactionRound(state);
    if (updated === state) return;
    state = updated;
    beginRound();
  });
  restartButton.addEventListener('click', () => {
    cancelTimer();
    state = createReactionState();
    render();
    status.textContent = 'Challenge reset. Choose Start round, wait for green, then pass to the ready teammate.';
    startButton.focus({ preventScroll: true });
  });

  game.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
    if (!game.contains(document.activeElement)) return;
    const tagName = event.target?.tagName?.toLowerCase();
    if (['input', 'select', 'textarea'].includes(tagName) || event.target?.isContentEditable) return;
    const index = ['1', '2', '3'].indexOf(event.key);
    if (index < 0 || !['waiting', 'ready'].includes(state.phase)) return;
    event.preventDefault();
    passTo(targets[index]);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseIfActive();
  });
  window.addEventListener('pagehide', () => {
    pauseIfActive();
    cancelTimer();
  });
  render();
  status.textContent = 'Choose Start round. Wait for green, then pass left, centre, or right. Number keys 1, 2, and 3 work while this challenge has focus.';
}

if (typeof document !== 'undefined') initialiseReactionGame();
