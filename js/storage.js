// storage.js
// Handles localStorage for units and favorite cities.

// Keys for localStorage
const UNIT_KEY = 'atmos:unit';
const FAV_KEY = 'atmos:favorites';

// ----- Units -----

/**
 * Save the currently selected unit ("imperial" or "metric") into localStorage.
 */
export function saveUnit(unit) {
  try {
    localStorage.setItem(UNIT_KEY, unit);
  } catch (_) {
    // Ignore storage errors (e.g., private mode)
  }
}

/**
 * Load the saved unit preference from localStorage.
 * Defaults to "imperial" if nothing is stored.
 */
export function loadUnit() {
  try {
    return localStorage.getItem(UNIT_KEY) || 'imperial';
  } catch (_) {
    return 'imperial';
  }
}

// ----- Favorites (array of strings like "Rexburg, ID") -----

/**
 * Return the list of favorite city names from localStorage.
 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

/**
 * Save the given list of favorites back to localStorage.
 */
export function saveFavorites(list) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch (_) {
    // Ignore errors
  }
}

/**
 * Add a city to the favorites list, if it isn't already in the list.
 */
export function saveCityTile(cityName) {
  if (!cityName) return;
  console.log('Save City Tile button clicked for', cityName);

  const favorites = getFavorites();
  if (!favorites.includes(cityName)) {
    favorites.push(cityName);
    saveFavorites(favorites);
  }
}

/**
 * Remove a city from the favorites list.
 */
export function removeCityTile(cityName) {
  if (!cityName) return;
  console.log('Remove City Tile button clicked for', cityName);

  let favorites = getFavorites();
  favorites = favorites.filter((c) => c !== cityName);
  saveFavorites(favorites);
}
