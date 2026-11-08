// These are editable arrangements, not predictions about how a team will play.
const roleNames = {
  GK: 'Goalkeeper', LB: 'Left back', LCB: 'Left centre back', CB: 'Centre back',
  RCB: 'Right centre back', RB: 'Right back', LWB: 'Left wing back', RWB: 'Right wing back',
  LM: 'Left midfielder', LCM: 'Left central midfielder', CM: 'Central midfielder',
  RCM: 'Right central midfielder', RM: 'Right midfielder', LW: 'Left winger',
  RW: 'Right winger', ST: 'Striker', LS: 'Left striker', RS: 'Right striker'
};

function makePreset(rows) {
  return Object.freeze(rows.map(([role, x, y], index) => Object.freeze({ number: index + 1, role, x, y })));
}

export const FORMATION_PRESETS = Object.freeze({
  '4-3-3': makePreset([
    ['GK', 50, 88],
    ['LB', 18, 70], ['LCB', 39, 70], ['RCB', 61, 70], ['RB', 82, 70],
    ['LCM', 28, 48], ['CM', 50, 48], ['RCM', 72, 48],
    ['LW', 22, 22], ['ST', 50, 22], ['RW', 78, 22]
  ]),
  '4-4-2': makePreset([
    ['GK', 50, 88],
    ['LB', 18, 70], ['LCB', 39, 70], ['RCB', 61, 70], ['RB', 82, 70],
    ['LM', 18, 46], ['LCM', 39, 46], ['RCM', 61, 46], ['RM', 82, 46],
    ['LS', 36, 22], ['RS', 64, 22]
  ]),
  '3-5-2': makePreset([
    ['GK', 50, 88],
    ['LCB', 25, 70], ['CB', 50, 70], ['RCB', 75, 70],
    ['LWB', 14, 48], ['LCM', 32, 48], ['CM', 50, 48], ['RCM', 68, 48], ['RWB', 86, 48],
    ['LS', 35, 22], ['RS', 65, 22]
  ])
});

const hasPreset = (name) => typeof name === 'string' && Object.hasOwn(FORMATION_PRESETS, name);

export function clampFormationPosition(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  // A little room at each edge keeps the whole marker within the pitch.
  return {
    x: Math.round(Math.min(90, Math.max(10, x)) * 10) / 10,
    y: Math.round(Math.min(93, Math.max(7, y)) * 10) / 10
  };
}

export function createFormationState(formation = '4-3-3') {
  const preset = hasPreset(formation) ? formation : '4-3-3';
  return {
    formation: preset,
    selected: 1,
    players: FORMATION_PRESETS[preset].map((player) => ({ ...player }))
  };
}

function isFormationState(state) {
  return state && hasPreset(state.formation) && Array.isArray(state.players)
    && state.players.length === 11 && Number.isInteger(state.selected)
    && state.selected >= 1 && state.selected <= 11
    && new Set(state.players.map((player) => player?.number)).size === 11
    && state.players.every((player) => player && Number.isInteger(player.number)
      && player.number >= 1 && player.number <= 11 && Object.hasOwn(roleNames, player.role)
      && Number.isFinite(player.x) && player.x >= 10 && player.x <= 90
      && Number.isFinite(player.y) && player.y >= 7 && player.y <= 93);
}

export function selectFormationPlayer(state, number) {
  if (!isFormationState(state) || !Number.isInteger(number) || number < 1 || number > 11) return state;
  return { ...state, selected: number };
}

export function setFormationPlayerPosition(state, number, x, y) {
  const position = clampFormationPosition(x, y);
  if (!isFormationState(state) || !position || !Number.isInteger(number) || number < 1 || number > 11) return state;
  return {
    ...state,
    players: state.players.map((player) => player.number === number ? { ...player, ...position } : player)
  };
}

const moves = { up: [0, -1], left: [-1, 0], down: [0, 1], right: [1, 0] };

export function nudgeFormationPlayer(state, direction, step = 5) {
  if (!isFormationState(state) || !Object.hasOwn(moves, direction) || !Number.isFinite(step) || step <= 0) return state;
  const player = state.players.find((item) => item.number === state.selected);
  const [dx, dy] = moves[direction];
  return setFormationPlayerPosition(state, player.number, player.x + dx * step, player.y + dy * step);
}

export function changeFormationPreset(state, formation) {
  if (!isFormationState(state) || !hasPreset(formation)) return state;
  return createFormationState(formation);
}

export function resetFormationState(state) {
  return isFormationState(state) ? createFormationState(state.formation) : state;
}

function initialiseFormationBoard() {
  const board = document.querySelector('#formation-board');
  if (!board) return;
  const pitch = board.querySelector('#formation-pitch');
  const select = board.querySelector('#formation-player');
  const nameLabel = board.querySelector('#formation-name');
  const selectedLabel = board.querySelector('#formation-selected');
  const positionLabel = board.querySelector('#formation-position');
  const reset = board.querySelector('#formation-reset');
  const status = board.querySelector('#formation-status');
  const presets = [...board.querySelectorAll('button[data-formation]')];
  const moveButtons = [...board.querySelectorAll('button[data-move]')];
  if (![pitch, select, nameLabel, selectedLabel, positionLabel, reset, status].every(Boolean)) return;

  let state = createFormationState();
  let activeDrag = null;
  let dragVersion = 0;
  let suppressClick = null;
  const buttons = new Map();
  const options = new Map();

  function playerDescription(player) {
    return `Player ${player.number}, ${roleNames[player.role]}. Position: ${player.x}% across, ${player.y}% down.`;
  }

  function announce(prefix = '') {
    const player = state.players.find((item) => item.number === state.selected);
    status.textContent = `${prefix}${playerDescription(player)}`;
  }

  function render() {
    nameLabel.textContent = state.formation;
    select.value = String(state.selected);
    const selected = state.players.find((player) => player.number === state.selected);
    selectedLabel.textContent = `${selected.number} · ${roleNames[selected.role]}`;
    positionLabel.textContent = `${selected.x}% across · ${selected.y}% down`;
    presets.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.formation === state.formation)));
    state.players.forEach((player) => {
      const button = buttons.get(player.number);
      button.style.left = `${player.x}%`;
      button.style.top = `${player.y}%`;
      button.classList.toggle('is-selected', player.number === state.selected);
      button.setAttribute('aria-pressed', String(player.number === state.selected));
      button.setAttribute('aria-label', playerDescription(player));
      button.title = playerDescription(player);
      button.querySelector('.name').textContent = player.role;
      options.get(player.number).textContent = `${player.number} — ${roleNames[player.role]}`;
    });
  }

  function cancelDrag() {
    if (!activeDrag) return;
    const oldDrag = activeDrag;
    // Clear this first: releasing capture can itself fire lostpointercapture.
    activeDrag = null;
    dragVersion += 1;
    oldDrag.button.classList.remove('is-dragging');
    try {
      if (oldDrag.button.hasPointerCapture(oldDrag.pointerId)) oldDrag.button.releasePointerCapture(oldDrag.pointerId);
    } catch {
      // The browser may already have released a cancelled pointer.
    }
  }

  function updatePointer(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId || activeDrag.version !== dragVersion) return;
    const rect = pitch.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left - activeDrag.offsetX) / rect.width * 100;
    const y = (event.clientY - rect.top - activeDrag.offsetY) / rect.height * 100;
    state = setFormationPlayerPosition(state, activeDrag.number, x, y);
    render();
  }

  function finishDrag(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    if (event.type === 'pointerup') updatePointer(event);
    const button = activeDrag.button;
    suppressClick = { button, until: performance.now() + 350 };
    cancelDrag();
    render();
    // Dragging updates the visual coordinates; the live region speaks only now.
    announce('Position set. ');
  }

  // Create markers once. Moving a marker must not replace its captured DOM node.
  const fragment = document.createDocumentFragment();
  select.replaceChildren();
  state.players.forEach((player) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'formation-player';
    button.dataset.player = String(player.number);
    button.style.touchAction = 'none';
    const number = document.createElement('span');
    number.className = 'number player-number';
    number.textContent = String(player.number);
    const role = document.createElement('span');
    role.className = 'name player-role';
    button.append(number, role);
    buttons.set(player.number, button);
    fragment.append(button);

    const option = document.createElement('option');
    option.value = String(player.number);
    options.set(player.number, option);
    select.append(option);

    button.addEventListener('click', (event) => {
      // A completed pointer gesture already selected and announced this player.
      if (event.detail > 0 && suppressClick?.button === button && performance.now() < suppressClick.until) return;
      cancelDrag();
      state = selectFormationPlayer(state, player.number);
      render();
      announce('Selected. ');
    });

    button.addEventListener('keydown', (event) => {
      const direction = { ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right' }[event.key];
      if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      cancelDrag();
      state = nudgeFormationPlayer(selectFormationPlayer(state, player.number), direction);
      render();
      announce('Moved. ');
    });

    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.isPrimary === false || activeDrag) return;
      const rect = pitch.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      event.preventDefault();
      state = selectFormationPlayer(state, player.number);
      render();
      button.focus({ preventScroll: true });
      const current = state.players.find((item) => item.number === player.number);
      activeDrag = {
        pointerId: event.pointerId, number: player.number, button, version: ++dragVersion,
        offsetX: event.clientX - (rect.left + current.x / 100 * rect.width),
        offsetY: event.clientY - (rect.top + current.y / 100 * rect.height)
      };
      try {
        button.setPointerCapture(event.pointerId);
        button.classList.add('is-dragging');
      } catch {
        cancelDrag();
        announce('Selected. ');
      }
    });
    button.addEventListener('pointermove', updatePointer);
    button.addEventListener('pointerup', finishDrag);
    button.addEventListener('pointercancel', finishDrag);
    button.addEventListener('lostpointercapture', finishDrag);
  });
  pitch.append(fragment);

  select.addEventListener('change', () => {
    cancelDrag();
    state = selectFormationPlayer(state, Number(select.value));
    render();
    announce('Selected. ');
  });

  presets.forEach((button) => button.addEventListener('click', () => {
    cancelDrag();
    suppressClick = null;
    state = changeFormationPreset(state, button.dataset.formation);
    render();
    announce(`${state.formation} loaded. `);
  }));

  moveButtons.forEach((button) => button.addEventListener('click', () => {
    cancelDrag();
    state = nudgeFormationPlayer(state, button.dataset.move);
    render();
    announce('Moved. ');
  }));

  reset.addEventListener('click', () => {
    cancelDrag();
    suppressClick = null;
    state = resetFormationState(state);
    render();
    announce(`${state.formation} reset. `);
  });
  window.addEventListener('pagehide', cancelDrag);
  render();
  announce('Board ready. ');
}

if (typeof document !== 'undefined') initialiseFormationBoard();
