// main.js — handles search, API, favorites, dropdown, units

import { getJSONWeather, searchLocations } from "./api.js";
import {
  saveUnit,
  loadUnit,
  getFavorites,
  saveCityTile,
  removeCityTile
} from "./storage.js";

import {
  renderWeatherCard,
  clearResults,
  renderHourlyForecast,
  renderWeeklyForecast
} from "./ui.js";

console.info("Atmos loaded.");

// DOM References
const form = document.querySelector("#weather-form");
const cityInput = document.querySelector("#city");
const cityError = document.querySelector("#city-error");
const unitToggle = document.querySelector("#unit-toggle-input");
const resultsWrap = document.querySelector(".weather-results");
const favDropdownMenu = document.getElementById("fav-dropdown-menu");
const favDropdownBtn = document.getElementById("fav-dropdown-btn");
const suggestionsList = document.getElementById("city-suggestions");
const hamburgerMenu = document.getElementById("hamburger-menu");
const navContainer = document.getElementById("nav-container");

/* --------------------------
   HAMBURGER MENU TOGGLE
-------------------------- */
if (hamburgerMenu && navContainer) {
  hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("active");
    navContainer.classList.toggle("active");
    hamburgerMenu.setAttribute("aria-expanded", hamburgerMenu.classList.contains("active"));
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      hamburgerMenu.classList.remove("active");
      navContainer.classList.remove("active");
      hamburgerMenu.setAttribute("aria-expanded", "false");
    });
  });
}

/* --------------------------
   CITY INPUT VALIDATION
-------------------------- */
function validateCityInput() {
  if (!cityError) return false;
  cityError.textContent = "";

  if (!cityInput.value.trim()) {
    cityError.textContent = "Please enter a city or ZIP.";
    return false;
  }

  return true;
}

/* --------------------------
   AUTOCOMPLETE SEARCH
-------------------------- */
if (cityInput && suggestionsList) {
  cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();

    if (!query) {
      suggestionsList.classList.remove("show");
      suggestionsList.innerHTML = "";
      return;
    }

    try {
      const results = await searchLocations(query);
      suggestionsList.innerHTML = "";

      if (!results.length) {
        suggestionsList.classList.remove("show");
        return;
      }

      results.forEach((place) => {
        const name = `${place.name}, ${place.region || place.country}`;

        const li = document.createElement("li");
        li.textContent = name;

        // ⬅⬅ INSTANT SEARCH FIX HERE
        li.addEventListener("click", async () => {
          cityInput.value = name;
          suggestionsList.classList.remove("show");

          await fetchAndDisplayWeather(name, getCurrentUnit());
        });

        suggestionsList.appendChild(li);
      });

      suggestionsList.classList.add("show");
    } catch (err) {
      console.error(err);
    }
  });
}

/* --------------------------
   SEARCH FORM SUBMIT
-------------------------- */
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateCityInput()) return;

    await fetchAndDisplayWeather(cityInput.value.trim(), getCurrentUnit());
  });
}

/* --------------------------
   FETCH + DISPLAY WEATHER
-------------------------- */
async function fetchAndDisplayWeather(city, unit) {
  clearResults();
  if (suggestionsList) {
    suggestionsList.classList.remove("show");
  }

  try {
    const data = await getJSONWeather(city);

    const cityDisplay =
      data.location.region && data.location.region.length > 0
        ? `${data.location.name}, ${data.location.region}`
        : `${data.location.name}, ${data.location.country}`;

    renderWeatherCard(data, unit, getFavorites().includes(cityDisplay));
    renderHourlyForecast(data, unit);
    renderWeeklyForecast(data, unit);

    const searchSection = document.querySelector(".search-section");
    if (searchSection) {
      searchSection.style.display = "none";
    }

    wireUpWeatherButtons();
  } catch (err) {
    if (cityError) {
      cityError.textContent = err.message;
    }
  }
}

/* --------------------------
   NEW SEARCH + FAVORITES
-------------------------- */
function wireUpWeatherButtons() {
  const newSearchBtn = document.getElementById("new-search-btn");
  const saveBtn = document.querySelector(".save-btn");

  if (newSearchBtn) {
    newSearchBtn.addEventListener("click", () => {
      clearResults();
      const searchSection = document.querySelector(".search-section");
      if (searchSection) {
        searchSection.style.display = "block";
      }
      if (cityInput) {
        cityInput.value = "";
        cityInput.focus();
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const city = saveBtn.dataset.city;
      saveCityTile(city);
      refreshFavoritesDropdown();
      saveBtn.style.display = "none";
    });
  }
}

/* --------------------------
   UNIT TOGGLE
-------------------------- */
function getCurrentUnit() {
  return unitToggle.checked ? "metric" : "imperial";
}

if (unitToggle) {
  unitToggle.checked = loadUnit() === "metric";

  unitToggle.addEventListener("change", () => {
    saveUnit(getCurrentUnit());

    const cardLink = document.querySelector(".weather-card .city-name .card-link");
    if (cardLink && cityInput) {
      const city = new URL(cardLink.href).searchParams.get("city");
      fetchAndDisplayWeather(city, getCurrentUnit());
    }
  });
}

/* --------------------------
   FAVORITES DROPDOWN
-------------------------- */
function refreshFavoritesDropdown() {
  if (!favDropdownMenu) return; // Exit if element doesn't exist
  
  const favorites = getFavorites();
  favDropdownMenu.innerHTML = "";

  if (!favorites.length) {
    favDropdownMenu.innerHTML = `<li class="empty-msg">No Favorites Yet</li>`;
    return;
  }

  favorites.forEach((city) => {
    const li = document.createElement("li");
    li.dataset.city = city;

    li.innerHTML = `
      <button class="fav-delete-btn">🗑</button>
      <span>${city}</span>
    `;

    favDropdownMenu.appendChild(li);
  });
}

refreshFavoritesDropdown();

// Toggle open
if (favDropdownBtn) {
  favDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    favDropdownMenu.classList.toggle("show");
  });
}

// Inside menu click
if (favDropdownMenu) {
  favDropdownMenu.addEventListener("click", (e) => {
    const li = e.target.closest("li");

    if (!li || li.classList.contains("empty-msg")) return;

    if (e.target.classList.contains("fav-delete-btn")) {
      removeCityTile(li.dataset.city);
      refreshFavoritesDropdown();
      return;
    }

    window.location.href = `index.html?city=${encodeURIComponent(li.dataset.city)}`;
  });
}

// Close when clicking outside
document.addEventListener("click", () => {
  if (favDropdownMenu) {
    favDropdownMenu.classList.remove("show");
  }
});

/* --------------------------
   URL PARAM AUTO-LOAD
-------------------------- */
const params = new URLSearchParams(window.location.search);
if (params.get("city") && cityInput) {
  cityInput.value = params.get("city");
  fetchAndDisplayWeather(cityInput.value, getCurrentUnit());
}
