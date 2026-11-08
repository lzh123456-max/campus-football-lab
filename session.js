import { drills } from './drill-data.js';

const focusNames = {
  mixed: 'Mixed skills',
  passing: 'Passing',
  dribbling: 'Dribbling',
  'first-touch': 'First touch',
  finishing: 'Finishing'
};

function chooseDrills(candidates, focus) {
  if (focus !== 'mixed') {
    // Focused drills come first. Supporting skills fill the remaining places.
    return [
      ...candidates.filter((drill) => drill.skill === focus),
      ...candidates.filter((drill) => drill.skill !== focus)
    ].slice(0, 3);
  }
  // Mixed sessions favour three different skills instead of the first three rows.
  const chosen = [];
  const skills = new Set();
  candidates.forEach((drill) => {
    if (!skills.has(drill.skill) && chosen.length < 3) {
      chosen.push(drill);
      skills.add(drill.skill);
    }
  });
  candidates.forEach((drill) => {
    if (chosen.length < 3 && !chosen.some((item) => item.id === drill.id)) chosen.push(drill);
  });
  return chosen;
}

export function createSessionPlan({ focus = 'mixed', minutes = 25, players = 'solo' } = {}) {
  const safeFocus = Object.hasOwn(focusNames, focus) ? focus : 'mixed';
  const totalMinutes = [15, 25, 40].includes(Number(minutes)) ? Number(minutes) : 25;
  const safePlayers = players === 'partner' ? 'partner' : 'solo';
  const compatible = drills.filter((drill) => safePlayers === 'partner' || drill.players === 'solo');
  const selected = chooseDrills(compatible, safeFocus);
  if (selected.length < 3) throw new Error('At least three compatible drills are needed to build a session.');

  // Reserve 3 minutes to warm up and 2 to finish. Divide every remaining minute.
  const practiceMinutes = totalMinutes - 5;
  const baseMinutes = Math.floor(practiceMinutes / 3);
  const remainder = practiceMinutes % 3;
  const mainBlocks = selected.map((drill, index) => ({
    kind: 'drill',
    id: drill.id,
    title: drill.title,
    minutes: baseMinutes + (index < remainder ? 1 : 0),
    equipment: drill.equipment,
    space: drill.space,
    intro: drill.intro,
    steps: [...drill.steps],
    cue: drill.cue,
    skill: drill.skill,
    players: drill.players
  }));
  const supportingSkills = safeFocus !== 'mixed' && selected.some((drill) => drill.skill !== safeFocus);
  const focusDescription = supportingSkills
    ? `${focusNames[safeFocus]} focus + supporting skills`
    : focusNames[safeFocus];
  const format = safePlayers === 'solo' ? 'Solo practice' : 'Partner practice';
  const supportNote = supportingSkills
    ? ' The library has fewer than three compatible drills for this focus, so supporting skills complete the plan.'
    : '';
  const partnerNote = safePlayers === 'partner'
    ? ' Solo drills can be practised side by side or in alternating turns.'
    : '';

  return {
    title: `Your ${totalMinutes}-minute session`,
    summary: `${focusDescription} · ${format} · 5 blocks · ${totalMinutes} minutes.${supportNote}${partnerNote}`,
    minutes: totalMinutes,
    focus: safeFocus,
    players: safePlayers,
    blocks: [
      {
        kind: 'warm-up', title: 'Get moving with the ball', minutes: 3,
        equipment: 'One football', space: 'A small clear area',
        intro: 'Begin with easy ball movement and gradually find a comfortable rhythm.',
        steps: ['Walk with the ball, using gentle inside-foot touches.', 'Change direction with both feet and keep the ball close.', 'Add a few short passes or light touches before the first drill.'],
        cue: 'Start slowly. Make each touch deliberate.'
      },
      ...mainBlocks,
      {
        kind: 'review', title: 'Walk, reset, and reflect', minutes: 2,
        equipment: 'One football', space: 'Your practice area',
        intro: 'Finish with an easy walk and a short review of what you practised.',
        steps: ['Walk around the practice area at an easy pace.', 'Recall one touch or movement that felt more controlled.', 'Choose one small thing to repeat in your next session.'],
        cue: 'Keep one useful observation for next time.'
      }
    ]
  };
}

function initialiseSessionBuilder() {
  const form = document.querySelector('#session-form');
  const focus = document.querySelector('#session-focus');
  const length = document.querySelector('#session-length');
  const players = document.querySelector('#session-players');
  const result = document.querySelector('#session-result');
  const title = document.querySelector('#plan-title');
  const summary = document.querySelector('#plan-summary');
  const steps = document.querySelector('#plan-steps');
  const status = document.querySelector('#plan-status');
  const progress = document.querySelector('#plan-progress');
  const completed = document.querySelector('#plan-completed');
  const reset = document.querySelector('#plan-reset');
  if (![form, focus, length, players, result, title, summary, steps, status, progress, completed, reset].every(Boolean)) return;

  // The current checklist belongs only to this page visit; no account or storage.
  let currentCheckboxes = [];

  function updateProgress(announce = true) {
    const checked = currentCheckboxes.filter((checkbox) => checkbox.checked).length;
    progress.max = currentCheckboxes.length;
    progress.value = checked;
    completed.textContent = `${checked} of ${currentCheckboxes.length} blocks complete`;
    if (!announce) return;
    status.textContent = checked === currentCheckboxes.length
      ? 'Session complete. Good work — keep one useful observation for your next practice.'
      : `${checked} of ${currentCheckboxes.length} blocks complete. Tick each block after you finish it.`;
  }

  function addText(parent, tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  }

  function renderBlock(block, index) {
    const item = document.createElement('li');
    item.className = 'plan-block';
    const label = document.createElement('label');
    label.className = 'plan-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `plan-block-${index + 1}`;
    label.htmlFor = checkbox.id;
    checkbox.addEventListener('change', () => updateProgress());
    currentCheckboxes.push(checkbox);
    label.append(checkbox);
    addText(label, 'span', `${block.title} · ${block.minutes} min`, 'plan-check-label');
    item.append(label);

    const body = document.createElement('div');
    body.className = 'plan-block-body';
    const category = block.kind === 'warm-up' ? 'Warm-up' : block.kind === 'review' ? 'Finish & review' : `Practice ${index}`;
    addText(body, 'p', `${String(index + 1).padStart(2, '0')} / ${category}`, 'plan-kicker');
    if (block.kind === 'drill') {
      const link = document.createElement('a');
      link.href = `drills.html#${encodeURIComponent(block.id)}`;
      link.className = 'plan-drill-link';
      link.textContent = 'See the full drill ↗';
      body.append(link);
    }
    addText(body, 'p', block.intro, 'plan-block-intro');
    const equipment = Array.isArray(block.equipment) ? block.equipment.join(', ') : block.equipment;
    addText(body, 'p', `Equipment: ${equipment}. Space: ${block.space}.`, 'plan-block-meta');
    const instructions = document.createElement('ol');
    instructions.className = 'plan-instructions';
    block.steps.forEach((step) => addText(instructions, 'li', step));
    body.append(instructions);
    addText(body, 'p', `Coaching cue: ${block.cue}`, 'plan-cue');
    item.append(body);
    return item;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let plan;
    try {
      plan = createSessionPlan({ focus: focus.value, minutes: length.value, players: players.value });
    } catch (error) {
      status.textContent = error.message;
      return;
    }
    title.textContent = plan.title;
    summary.textContent = plan.summary;
    currentCheckboxes = [];
    steps.replaceChildren();
    plan.blocks.forEach((block, index) => steps.append(renderBlock(block, index)));
    result.hidden = false;
    updateProgress(false);
    status.textContent = `Your ${plan.minutes}-minute plan is ready. Tick each of the five blocks as you finish.`;
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  reset.addEventListener('click', () => {
    currentCheckboxes.forEach((checkbox) => { checkbox.checked = false; });
    updateProgress(false);
    status.textContent = currentCheckboxes.length
      ? 'Checklist reset. Your current session plan is unchanged.'
      : 'Build a session first to begin your checklist.';
  });
}

if (typeof document !== 'undefined') initialiseSessionBuilder();
