// main.js (module)
// Unit 3: No runtime logic required. Keep as scaffold for Unit 4+.

// TODO (Unit 4):
// - Validate #weather-form inputs (non-empty, safe characters).
// - Read unit select (#unit-select) and persist to localStorage.
// - On submit: fetch weather via api.js then render via ui.js.
// - Support URL parameter ?city=NAME to auto-load a city on page load.

import { getJSONWeather } from './api.js';
import { saveUnit, loadUnit, getFavorites } from './storage.js';
import { renderWeatherCard, clearResults } from './ui.js';

// NOTE: Code will be added in Unit 4. Keeping imports now documents module plan.
console.info('Atmos scaffold loaded (Unit 3 static prototype).');
