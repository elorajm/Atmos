// main.js (module)
// Hook up form logic, units, API calls, favorites, facts, and URL parameters.

import { getJSONWeather } from './api.js';
import {
  saveUnit,
  loadUnit,
  getFavorites,
  saveCityTile,
  removeCityTile,
} from './storage.js';
import { renderWeatherCard, clearResults } from './ui.js';

console.info('Atmos app loaded.');

// ------------------------------------------------------------
// WEATHER FACTS + FACT GENERATOR
// ------------------------------------------------------------

export const weatherFacts = [
  "The highest temperature ever recorded on Earth was 134°F in Death Valley.",
  "Raindrops can fall at speeds up to 22 mph.",
  "Snowflakes can come in 35 different shapes.",
  "Lightning is five times hotter than the sun’s surface.",
  "A rainbow is actually a full circle, but we only see half.",
  "The windiest place on Earth is Commonwealth Bay, Antarctica.",
  "Fog is just a cloud touching the ground.",
  "Hailstones can grow as large as grapefruits.",
  "The average cloud weighs over 1 million pounds.",
  "Earth experiences about 100 lightning bolts per second.",
  "Antarctica is the world's largest desert.",
  "Wind is silent until it hits something.",
  "The coldest temperature ever recorded was -144°F in Antarctica.",
  "Hurricanes release more energy than 10 atomic bombs per second.",
  "Some tornadoes can have winds over 300 mph."
];

export function getRandomWeatherFact() {
  return weatherFacts[Math.floor(Math.random() * weatherFacts.length)];
}

// ------------------------------------------------------------
// FLOATING “DID YOU KNOW?” BADGE
// ------------------------------------------------------------

function initFloatingBadge() {
  const badge = document.getElementById("didyouknow-badge");
  const badgeText = document.getElementById("didyouknow-text");

  if (!badge || !badgeText) return;

  // Set initial fact
  badgeText.textContent = getRandomWeatherFact();

  // Clicking badge shows new fact
  badge.addEventListener("click", () => {
    badgeText.textContent = getRandomWeatherFact();
    badge.classList.add("pop");

    setTimeout(() => badge.classList.remove("pop"), 350);
  });
}

document.addEventListener("DOMContentLoaded", initFloatingBadge);

// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const form = document.querySelector('#weather-form');
const cityInput = document.querySelector('#city');
const cityError = document.querySelector('#city-error');
const unitToggle = document.querySelector('#unit-toggle-input');
const resultsWrap = document.querySelector('.weather-results');
const favDropdownMenu = document.getElementById('fav-dropdown-menu');
const favDropdownBtn = document.getElementById('fav-dropdown-btn');

// ------------------------------------------------------------
// FAVORITES DROPDOWN
// ------------------------------------------------------------

function refreshFavoritesDropdown() {
  if (!favDropdownMenu) return;
  const favorites = getFavorites();

  favDropdownMenu.innerHTML = '';
  if (!favorites.length) {
    favDropdownMenu.innerHTML = '<li class="empty-msg">Your Favorites Are Empty</li>';
    return;
  }

  favorites.forEach((cityName) => {
    const li = document.createElement('li');
    li.dataset.city = cityName;
    li.innerHTML = `
      <button type="button" class="fav-delete-btn">🗑</button>
      <span class="fav-city-label">${cityName}</span>`;
    favDropdownMenu.appendChild(li);
  });
}

// ------------------------------------------------------------
// UNIT TOGGLE
// ------------------------------------------------------------

function getCurrentUnit() {
  return unitToggle && unitToggle.checked ? "metric" : "imperial";
}

if (unitToggle) {
  const savedUnit = loadUnit();
  unitToggle.checked = savedUnit === "metric";

  unitToggle.addEventListener("change", () => {
    const newUnit = getCurrentUnit();
    saveUnit(newUnit);

    let city = null;
    const currentCityLink = document.querySelector('.weather-card .city-name .card-link');

    if (currentCityLink) {
      const url = new URL(currentCityLink.href);
      city = url.searchParams.get('city');
    }

    if (!city && cityInput && cityInput.value.trim()) {
      city = cityInput.value.trim();
    }

    if (city) fetchAndDisplayWeather(city, newUnit);
  });
}

// ------------------------------------------------------------
// CITY VALIDATION
// ------------------------------------------------------------

function validateCityInput() {
  if (!cityInput || !cityError) return false;

  const value = cityInput.value.trim();
  cityError.textContent = '';

  if (!value) {
    cityError.textContent = 'Please enter a city or ZIP.';
    return false;
  }

  const pattern = /^[a-zA-Z0-9\s,\-]+$/;
  if (!pattern.test(value)) {
    cityError.textContent =
      'Only letters, numbers, spaces, commas, and hyphens allowed.';
    return false;
  }

  return true;
}

// ------------------------------------------------------------
// FORM SUBMIT
// ------------------------------------------------------------

if (form && cityInput) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateCityInput()) return;

    const city = cityInput.value.trim();
    const unit = getCurrentUnit();
    await fetchAndDisplayWeather(city, unit);
  });
}

// ------------------------------------------------------------
// FETCH + DISPLAY WEATHER
// ------------------------------------------------------------

async function fetchAndDisplayWeather(city, unit) {
  if (!resultsWrap) return;

  clearResults();
  if (cityError) cityError.textContent = '';

  try {
    const data = await getJSONWeather(city);

    const cityDisplay =
      data.location.region && data.location.region.length > 0
        ? `${data.location.name}, ${data.location.region}`
        : `${data.location.name}, ${data.location.country}`;

    const favorites = getFavorites();
    const isFavorite = favorites.includes(cityDisplay);

    renderWeatherCard(data, unit, isFavorite);
    const searchSection = document.querySelector('.search-section');
    if (searchSection) searchSection.style.display = 'none';

    wireUpCardButtons();

    // ------------------------------------------------------------
    // INSERT FUN WEATHER FACT PANEL
    // ------------------------------------------------------------
    const factSection = document.createElement("section");
    factSection.className = "fact-panel fade-in";

    const fact = getRandomWeatherFact();

    factSection.innerHTML = `
      <h2 class="fact-title">🌦️ Fun Weather Fact</h2>
      <p class="fact-text">${fact}</p>
      <button class="btn secondary fact-refresh">Another Fact</button>
    `;

    resultsWrap.appendChild(factSection);

    factSection.querySelector(".fact-refresh").addEventListener("click", () => {
      factSection.querySelector(".fact-text").textContent = getRandomWeatherFact();
    });

  } catch (err) {
    console.error(err);
    if (cityError) {
      cityError.textContent = err.message || 'Unable to load weather.';
    }
  }
}

// ------------------------------------------------------------
// SAVE / REMOVE FAVORITES (CARD BUTTONS)
// ------------------------------------------------------------

function wireUpCardButtons() {
  const saveBtn = document.querySelector('.weather-card .save-btn');
  if (!saveBtn) return;

  const cityName = saveBtn.dataset.city;

  const refreshButtons = () => {
    const favorites = getFavorites();
    const isFavorite = favorites.includes(cityName);
    saveBtn.style.display = isFavorite ? 'none' : 'inline-block';
  };

  saveBtn.addEventListener('click', () => {
    saveCityTile(cityName);
    refreshButtons();
    refreshFavoritesDropdown();
  });

  refreshButtons();
}

// ------------------------------------------------------------
// URL PARAM SUPPORT
// ------------------------------------------------------------

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cityParam = params.get('city');

  if (cityParam && cityInput) {
    cityInput.value = cityParam;
    const unit = getCurrentUnit();
    fetchAndDisplayWeather(cityParam, unit);
  }
}

initFromUrl();

// ------------------------------------------------------------
// FAVORITES PAGE
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const favList = document.querySelector('.fav-grid');
  if (!favList) return;

  const favorites = getFavorites();
  favList.innerHTML = '';

  if (!favorites.length) {
    favList.innerHTML = '<li>No favorite cities saved yet.</li>';
    return;
  }

  favorites.forEach((cityName) => {
    const li = document.createElement('li');
    li.classList.add('fav-card');

    li.innerHTML = `
      <a class="fav-link" href="index.html?city=${encodeURIComponent(cityName)}">
        ${cityName}
      </a>
      <button class="btn secondary remove-fav" data-city="${cityName}">
        Remove
      </button>
    `;

    favList.appendChild(li);
  });
});

// ------------------------------------------------------------
// DROPDOWN LOGIC
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  if (!favDropdownMenu) return;

  refreshFavoritesDropdown();

  if (favDropdownBtn) {
    favDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      favDropdownMenu.classList.toggle('show');
    });
  }

  favDropdownMenu.addEventListener('mouseleave', () => {
    favDropdownMenu.classList.remove('show');
  });

  favDropdownMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || li.classList.contains('empty-msg')) return;

    const deleteBtn = e.target.closest('.fav-delete-btn');
    if (deleteBtn) {
      const cityName = li.dataset.city;
      removeCityTile(cityName);
      refreshFavoritesDropdown();
      e.stopPropagation();
      return;
    }

    const cityName = li.dataset.city;
    window.location.href = `index.html?city=${encodeURIComponent(cityName)}`;
  });

  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('#fav-dropdown-btn') &&
      !e.target.closest('#fav-dropdown-menu')
    ) {
      favDropdownMenu.classList.remove('show');
    }
  });
});
