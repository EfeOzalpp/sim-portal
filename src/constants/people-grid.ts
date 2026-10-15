import { DEFAULT_CARDS_PER_ROW, MAX_CARDS_PER_ROW, MIN_CARDS_PER_ROW } from "@/constants/filters";

export const PEOPLE_GRID_PREFERENCES = {
	desktop: { key: "sim-people-cards-per-row-desktop", property: "--people-grid-columns-desktop", min: MIN_CARDS_PER_ROW, max: MAX_CARDS_PER_ROW, defaultValue: DEFAULT_CARDS_PER_ROW },
	mobile: { key: "sim-people-cards-per-row-mobile", property: "--people-grid-columns-mobile", min: 1, max: 3, defaultValue: 2 },
};

export function peopleGridColumns(value: string | null, device: keyof typeof PEOPLE_GRID_PREFERENCES) {
	const settings = PEOPLE_GRID_PREFERENCES[device];
	const count = Number(value);
	return Number.isInteger(count) && count >= settings.min && count <= settings.max ? count : settings.defaultValue;
}

// Runs in <head> so saved columns are available before either SSR or client navigation paints the grid.
export const peopleGridInitScript = `(() => {
  for (const settings of Object.values(${JSON.stringify(PEOPLE_GRID_PREFERENCES)})) {
    let value = settings.defaultValue;
    try {
      const saved = Number(localStorage.getItem(settings.key));
      if (Number.isInteger(saved) && saved >= settings.min && saved <= settings.max) value = saved;
    } catch {}
    document.documentElement.style.setProperty(settings.property, String(value));
  }
})();`;
