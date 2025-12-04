// ui.js
// Responsible for rendering weather results into the DOM.

/**
 * Clear any existing weather results from the page.
 */
export function clearResults() {
  const container = document.querySelector('.weather-results');
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Render a single weather card using WeatherAPI data.
 * @param {object} data - WeatherAPI current.json response.
 * @param {"imperial"|"metric"} unit - Unit preference for temperature and wind.
 * @param {boolean} isFavorite - Whether this city is already in favorites.
 */
export function renderWeatherCard(data, unit = 'imperial', isFavorite = false) {
  const container = document.querySelector('.weather-results');
  if (!container) return;

  // Build a human-friendly city string like "Rexburg, ID" or "Tokyo, Japan"
  const cityDisplay =
    data.location.region && data.location.region.length > 0
      ? `${data.location.name}, ${data.location.region}`
      : `${data.location.name}, ${data.location.country}`;

  // Pick correct temp based on unit
  const temp =
    unit === 'imperial' ? `${data.current.temp_f}°` : `${data.current.temp_c}°`;

  const humidity = `${data.current.humidity}%`;
  const wind =
    unit === 'imperial'
      ? `${data.current.wind_mph} mph`
      : `${data.current.wind_kph} kph`;

  const desc = data.current.condition.text;
  const updated = data.location.localtime; // friendly enough for now

  // Choose background style class based on condition text
  const lower = desc.toLowerCase();
  let cardClass = 'sunny';
  if (lower.includes('cloud')) cardClass = 'cloudy';
  if (lower.includes('rain') || lower.includes('drizzle')) cardClass = 'rainy';
  if (lower.includes('snow') || lower.includes('blizzard')) cardClass = 'snowy';

  // Replace content in results container with a single card
  container.innerHTML = `
    <article class="weather-card ${cardClass}" tabindex="0">
      <header class="card-head">
        <h3 class="city-name">
          <!-- Link with URL parameter ?city=... so user can bookmark/share -->
          <a href="index.html?city=${encodeURIComponent(
            cityDisplay
          )}" class="card-link">
            ${cityDisplay}
          </a>
        </h3>
        <p class="timestamp">
          Updated: 
          <time datetime="${data.location.localtime.replace(' ', 'T')}">
            ${updated}
          </time>
        </p>
      </header>

      <div class="temp-row">
        <p class="temp">${temp}</p>
        <p class="desc">${desc}</p>
      </div>

      <ul class="meta">
        <li><span aria-label="Humidity">Humidity:</span> ${humidity}</li>
        <li><span aria-label="Wind">Wind:</span> ${wind}</li>
      </ul>

      <div class="card-actions">
        <button class="btn save-btn"
                type="button"
                data-city="${cityDisplay}"
                style="display:${isFavorite ? 'none' : 'inline-block'}">
          Add to Favorites
        </button>
        <button id="new-search-btn" 
                class="btn secondary">
        New Search
        </button>
      </div>
    </article>
  `;
}
