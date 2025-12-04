// api.js
// Uses WeatherAPI.com (same API as your ZipTemp app) to get current weather by city.

const API_KEY = 'a52499ff54b643158ec24459241607'; // From ZipTemp

/**
 * Fetch current weather for a city using WeatherAPI.com
 * @param {string} city - City name, e.g. "Rexburg"
 * @returns {Promise<object>} Weather API JSON response
 */
export async function getJSONWeather(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    city
  )}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('City not found. Please check the spelling.');
    } else if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Network response was not ok.');
    }
  }

  const data = await response.json();
  console.log('Weather API response:', data);
  return data;
}
