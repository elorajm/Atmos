// api.js
// Uses WeatherAPI.com to get current + forecast weather and search locations.

const API_KEY = 'a52499ff54b643158ec24459241607'; // your key

/**
 * Fetch current + forecast weather for a city or ZIP.
 * We request 8 days so we can show:
 *   - Today separately (current)
 *   - 7 future days (tomorrow + 6 more) in the weekly panel.
 */
export async function getJSONWeather(query) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&days=8&aqi=no&alerts=no`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Location not found. Please check the city or ZIP.');
    } else {
      throw new Error('Unable to load weather data right now.');
    }
  }

  return await response.json();
}

/**
 * Search for locations as user types (autocomplete)
 * @param {string} query
 */
export async function searchLocations(query) {
  if (!query) return [];

  const url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to search locations right now.');
  }
  return await response.json();
}
