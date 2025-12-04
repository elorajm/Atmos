// main.js (module)
// Hook up form logic, units, API calls, favorites, and URL parameters.

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

// ----- DOM references that may or may not exist on each page -----
const form        = document.querySelector('#weather-form');
const cityInput   = document.querySelector('#city');
const cityError   = document.querySelector('#city-error');
const unitToggle = document.querySelector('#unit-toggle-input');
const resultsWrap = document.querySelector('.weather-results');
const favDropdownMenu = document.getElementById('fav-dropdown-menu');
const favDropdownBtn  = document.getElementById('fav-dropdown-btn');
// ----- Helpers for units -----

/* drop down menu for favorites */
  function refreshFavoritesDropdown() {
    if (!favDropdownMenu) return;
    const favorites = getFavorites();
    /*clear current items*/
    favDropdownMenu.innerHTML = '';
    if (!favorites.length) {
      favDropdownMenu.innerHTML = '<li class="empty-msg">Your Favorites Are Empty</li>';
      return;
    }
   /* favorites.forEach((cityName) => {
      const li = document.createElement('li');
      li.textContent = cityName;
      li.dataset.city = cityName;
      favDropdownMenu.appendChild(li); 
    }) ;*/
    
    favorites.forEach((cityName) => {
      const li = document.createElement('li');
      li.dataset.city = cityName;
      li.innerHTML = `
        <button 
          type="button" class="fav-delete-btn" aria-label="Remove ${cityName} from favorites">🗑</button>
          <span class="fav-city-label">${cityName}</span>`;
      favDropdownMenu.appendChild(li);
    })



  }

/**
 * Get select the unit type from a toggle switch */
function getCurrentUnit() {
  return unitToggle && unitToggle.checked ? "metric" : "imperial";
}

if (unitToggle) {
  const savedUnit = loadUnit();
  unitToggle.checked = savedUnit === "metric";

  unitToggle.addEventListener("change", () => {
    const newUnit = unitToggle.checked ? "metric" : "imperial";
    saveUnit(newUnit);
    let city = null;
if (unitToggle) {
  const savedUnit = loadUnit();
  unitToggle.checked = savedUnit === "metric";

// Try to figure out what city is currently in view
    // 1) If there is a weather card on the page, read city from its link (?city=...)
    // 2) Fallback: use whatever is in the input box
    // If we have a city, re-fetch with the new unit

  unitToggle.addEventListener("change", () => {
    const newUnit = unitToggle.checked ? "metric" : "imperial";
    saveUnit(newUnit);
    let city = null;
    const currentCityLink = document.querySelector('.weather-card .city-name .card-link');
    if (currentCityLink) {const url = new URL(currentCityLink.href); city = url.searchParams.get('city');} //use the city being displayed on the card
        if (city) {fetchAndDisplayWeather(city, newUnit);} //if there is a city loaded, it will reload the city with the new unit
  });
}
    // 1) If there is a weather card on the page, read city from its link (?city=...)
    const currentCityLink = document.querySelector('.weather-card .city-name .card-link');
    if (currentCityLink) {
      const url = new URL(currentCityLink.href);
      city = url.searchParams.get('city');
    }

    // 2) Fallback: use whatever is in the input box
    if (!city && cityInput && cityInput.value.trim()) {
      city = cityInput.value.trim();
    }

    // If we have a city, re-fetch with the new unit
    if (city) {
      fetchAndDisplayWeather(city, newUnit);
    }
  });
}
    

    

/**
 * Initialize unit dropdown from localStorage and listen for changes.
 
if (unitSelect) {
  const savedUnit = loadUnit();
  unitSelect.value = savedUnit;

  unitSelect.addEventListener('change', () => {
    saveUnit(unitSelect.value);
    // Optional: could re-fetch weather here if something is already displayed.
  });
}*/

// ----- Form validation for the city input -----

/**
 * Validate the city input field.
 * - Required
 * - Only letters, spaces, commas, and hyphens allowed
 */
function validateCityInput() {
  if (!cityInput || !cityError) return false;

  const value = cityInput.value.trim();
  cityError.textContent = '';

  if (!value) {
    cityError.textContent = 'Please enter a city name.';
    return false;
  }

  const pattern = /^[a-zA-Z\s,\-]+$/;
  if (!pattern.test(value)) {
    cityError.textContent =
      'City can only contain letters, spaces, commas, and hyphens.';
    return false;
  }

  return true;
}

// ----- Handle the search form submission -----

if (form && cityInput) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateCityInput()) {
      return;
    }

    const city = cityInput.value.trim();
    const unit = getCurrentUnit();
    await fetchAndDisplayWeather(city, unit);
  });
}

// ----- Fetch + render weather using WeatherAPI -----

/**
 * Fetch weather for a given city and render a card on the page.
 */
async function fetchAndDisplayWeather(city, unit) {
  if (!resultsWrap) return;

  clearResults();
  if (cityError) {
    cityError.textContent = '';
  }

  try {
    const data = await getJSONWeather(city);

    const cityDisplay =
      data.location.region && data.location.region.length > 0
        ? `${data.location.name}, ${data.location.region}`
        : `${data.location.name}, ${data.location.country}`;

    const favorites = getFavorites();
    const isFavorite = favorites.includes(cityDisplay);

    renderWeatherCard(data, unit, isFavorite);
    wireUpCardButtons();
  } catch (err) {
    console.error(err);
    if (cityError) {
      cityError.textContent =
        err.message || 'Unable to load weather right now.';
    }
  }
}

// ----- Save/Remove button behavior on the weather card -----

/**
 * Attach click handlers to Save/Remove buttons on the current weather card.
 */
function wireUpCardButtons() {
  const saveBtn   = document.querySelector('.weather-card .save-btn');
  const removeBtn = document.querySelector('.weather-card .remove-btn');

  if (!saveBtn || !removeBtn) return;

  const cityName = saveBtn.dataset.city;

  const refreshButtons = () => {
    const favorites = getFavorites();
    const isFavorite = favorites.includes(cityName);

    if (isFavorite) {
      saveBtn.style.display   = 'none';
      removeBtn.style.display = 'inline-block';
    } else {
      saveBtn.style.display   = 'inline-block';
      removeBtn.style.display = 'none';
    }
  };

  saveBtn.addEventListener('click', () => {
    saveCityTile(cityName);
    refreshButtons();
    refreshFavoritesDropdown();
  });

  removeBtn.addEventListener('click', () => {
    removeCityTile(cityName);
    refreshButtons();
    refreshFavoritesDropdown();
  });

  // Set initial visibility based on favorites
  refreshButtons();
}

// ----- URL parameter support (?city=...) -----

/**
 * If the URL contains ?city=..., automatically load weather for that city.
 */
function initFromUrl() {
  const params    = new URLSearchParams(window.location.search);
  const cityParam = params.get('city');

  if (cityParam && cityInput) {
    cityInput.value = cityParam;
    const unit = getCurrentUnit();
    fetchAndDisplayWeather(cityParam, unit);
  }
}

initFromUrl();

// ----- Favorites page support (build the favorites list) -----

document.addEventListener('DOMContentLoaded', () => {
  const favList = document.querySelector('.fav-grid');
  if (!favList) return; // Not on favorites.html, so nothing to do

  const favorites = getFavorites();
  favList.innerHTML = '';

  if (favorites.length === 0) {
    favList.innerHTML = '<li>No favorite cities saved yet.</li>';
    return;
  }

  favorites.forEach((cityName) => {
    const li = document.createElement('li');
    li.classList.add('fav-card');

    li.innerHTML = `
      <a class="fav-link" href="index.html?city=${encodeURIComponent(
        cityName
      )}">
        ${cityName}
      </a>
      <button class="btn secondary remove-fav"
              type="button"
              data-city="${cityName}">
        Remove
      </button>
    `;

    favList.appendChild(li);
    });
  });

  // Click handler for favorites dropdown menu
document.addEventListener('DOMContentLoaded', () => {
  if (!favDropdownMenu) return;

  // Build dropdown on page load
  refreshFavoritesDropdown();

  // Open/close dropdown on button click
  if (favDropdownBtn) {
    favDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      favDropdownMenu.classList.toggle('show');
    });
  }

  // Close dropdown when mouse leaves the menu
  favDropdownMenu.addEventListener('mouseleave', () => {
  favDropdownMenu.classList.remove('show');
});

// Close dropdown when clicking anywhere outside menu or button (for mobile + desktop)
document.addEventListener('click', (e) => {
  if (
    !e.target.closest('#fav-dropdown-btn') &&
    !e.target.closest('#fav-dropdown-menu')
  ) {
    favDropdownMenu.classList.remove('show');
  }
});

  // Click inside dropdown
  favDropdownMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || li.classList.contains('empty-msg')) return;

    // If we click the trash icon remove selected favorite only
    const deleteBtn = e.target.closest('.fav-delete-btn');
    if (deleteBtn) {
      const cityName = li.dataset.city;
      removeCityTile(cityName);
      refreshFavoritesDropdown();
      e.stopPropagation();
      return;
    }

    //Clicking the city name loads that favorite
    const cityName = li.dataset.city;
    window.location.href = `index.html?city=${encodeURIComponent(cityName)}`;
  });

  // Close dropdown if clicking outside of button or menu
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('#fav-dropdown-btn') &&
      !e.target.closest('#fav-dropdown-menu')
    ) {
      favDropdownMenu.classList.remove('show');
    }
  });
});
