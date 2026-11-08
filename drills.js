import { drills } from './drill-data.js';

// All three filters are combined: a drill must match every active choice.
export function matchesDrill(drill, skill, players, search) {
  if (skill !== 'all' && drill.skill !== skill) return false;
  if (players !== 'all' && drill.players !== players) return false;
  const words = [drill.title, drill.intro, drill.cue, ...(drill.steps || [])]
    .join(' ')
    .toLocaleLowerCase();
  return words.includes(search.trim().toLocaleLowerCase());
}

function initialiseDrillFilters() {
  const form = document.querySelector('#drill-filters');
  const skill = document.querySelector('#skill-filter');
  const players = document.querySelector('#players-filter');
  const search = document.querySelector('#drill-search');
  const clear = document.querySelector('#clear-filters');
  const count = document.querySelector('#drill-count');
  const empty = document.querySelector('#drill-empty');
  const cards = [...document.querySelectorAll('[data-drill]')];
  if (!form || !skill || !players || !search || !clear || !count || !empty || !cards.length) return;

  const drillById = new Map(drills.map((drill) => [drill.id, drill]));

  function updateFilters() {
    let visible = 0;
    cards.forEach((card) => {
      const drill = drillById.get(card.dataset.id);
      // The fallback keeps an otherwise valid static card usable if data changes.
      const match = drill
        ? matchesDrill(drill, skill.value, players.value, search.value)
        : (skill.value === 'all' || card.dataset.skill === skill.value)
          && (players.value === 'all' || card.dataset.players === players.value)
          && card.textContent.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase());
      card.hidden = !match;
      if (match) visible += 1;
    });
    count.textContent = `${visible} of ${cards.length} drills`;
    empty.hidden = visible !== 0;
  }

  form.addEventListener('input', updateFilters);
  form.addEventListener('change', updateFilters);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateFilters();
  });
  // Reset events fire before native controls reset, so read them in a microtask.
  form.addEventListener('reset', () => queueMicrotask(updateFilters));
  clear.addEventListener('click', () => {
    skill.value = 'all';
    players.value = 'all';
    search.value = '';
    updateFilters();
    search.focus({ preventScroll: true });
  });
  updateFilters();
}

// A module may be imported by a source check without a browser document.
if (typeof document !== 'undefined') initialiseDrillFilters();
