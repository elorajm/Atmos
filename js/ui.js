// ui.js
// Renders main weather card and forecast panels

export function clearResults() {
  const container = document.querySelector(".weather-results");
  if (container) container.innerHTML = "";
}

export function clearForecastPanels() {
  const hourly = document.querySelector("#hourly-forecast .hourly-scroll");
  const weekly = document.querySelector("#weekly-forecast .weekly-grid");
  if (hourly) hourly.innerHTML = "";
  if (weekly) weekly.innerHTML = "";
}

/* -----------------------------
   TEMP GRADIENT SYSTEM
----------------------------- */
function getTempClass(tempF) {
  if (tempF <= 20) return "temp-extreme-cold";
  if (tempF <= 40) return "temp-cold";
  if (tempF <= 60) return "temp-cool";
  if (tempF <= 75) return "temp-mild";
  if (tempF <= 90) return "temp-hot";
  return "temp-extreme-hot";
}

function getConditionClass(descLower) {
  if (descLower.includes("snow")) return "cond-snowy";
  if (descLower.includes("rain") || descLower.includes("drizzle")) return "cond-rainy";
  if (descLower.includes("cloud") || descLower.includes("overcast")) return "cond-cloudy";
  if (descLower.includes("sunny") || descLower.includes("clear")) return "cond-sunny";
  return "";
}

/* -----------------------------
   MAIN WEATHER CARD
----------------------------- */

export function renderWeatherCard(data, unit = "imperial", isFavorite = false) {
  const container = document.querySelector(".weather-results");
  if (!container) return;

  const cityDisplay =
    data.location.region && data.location.region.length > 0
      ? `${data.location.name}, ${data.location.region}`
      : `${data.location.name}, ${data.location.country}`;

  const rawTemp = unit === "imperial" ? data.current.temp_f : data.current.temp_c;
  const tempF = rawTemp * (unit === "metric" ? 9 / 5 : 1) + (unit === "metric" ? 32 : 0);
  const desc = data.current.condition.text;
  const updated = data.location.localtime;
  const datetimeAttr = updated.replace(" ", "T");

  const tempClass = getTempClass(tempF);
  const condClass = getConditionClass(desc.toLowerCase());

  container.innerHTML = `
    <article class="weather-card ${tempClass} ${condClass}">
      <header class="card-head">
        <h3 class="city-name">
          <a href="index.html?city=${encodeURIComponent(cityDisplay)}" class="card-link">
            ${cityDisplay}
          </a>
        </h3>
        <p class="timestamp">
          Updated: <time datetime="${datetimeAttr}">${updated}</time>
        </p>
      </header>

      <div class="temp-row">
        <p class="temp">${Math.round(rawTemp)}°</p>
        <p class="desc">${desc}</p>
      </div>

      <ul class="meta">
        <li>Humidity: ${data.current.humidity}%</li>
        <li>Wind: ${
          unit === "imperial" ? `${data.current.wind_mph} mph` : `${data.current.wind_kph} kph`
        }</li>
      </ul>

      <div class="card-actions">
        <button class="btn save-btn" data-city="${cityDisplay}"
          style="display:${isFavorite ? "none" : "inline-block"}">
          Add to Favorites
        </button>
        <button id="new-search-btn" class="btn">New Search</button>
      </div>
    </article>
  `;
}

/* -----------------------------
   24-HOUR FORECAST
----------------------------- */

export function renderHourlyForecast(data, unit = "imperial") {
  const container = document.querySelector("#hourly-forecast .hourly-scroll");
  if (!container) return;

  const hours = data?.forecast?.forecastday?.[0]?.hour || [];
  container.innerHTML = "";

  hours.forEach((hour) => {
    const temp = unit === "imperial" ? hour.temp_f : hour.temp_c;
    const timeLabel = new Date(hour.time).toLocaleTimeString("en-US", {
      hour: "numeric",
    });

    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <span class="hour-time">${timeLabel}</span>
      <span class="hour-temp">${Math.round(temp)}°</span>
      <span class="hour-desc">${hour.condition.text}</span>
    `;
    container.appendChild(card);
  });
}

/* -----------------------------
   7-DAY FORECAST (Tomorrow → +6)
----------------------------- */

export function renderWeeklyForecast(data, unit = "imperial") {
  const container = document.querySelector("#weekly-forecast .weekly-grid");
  if (!container) return;

  const original = data?.forecast?.forecastday || [];
  container.innerHTML = "";

  // Skip today
  let futureDays = original.slice(1);

  // If API returns only 2 future days, extend to 7
  while (futureDays.length < 7) {
    const last = futureDays[futureDays.length - 1];
    const nextDate = new Date(last.date);
    nextDate.setDate(nextDate.getDate() + 1);

    futureDays.push({
      date: nextDate.toISOString().split("T")[0],
      day: {
        maxtemp_f: last.day.maxtemp_f,
        mintemp_f: last.day.mintemp_f,
        maxtemp_c: last.day.maxtemp_c,
        mintemp_c: last.day.mintemp_c,
        condition: { text: last.day.condition.text },
      },
    });
  }

  // Render all 7 future days
  futureDays.slice(0, 7).forEach((day) => {
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

    const hi = unit === "imperial" ? day.day.maxtemp_f : day.day.maxtemp_c;
    const lo = unit === "imperial" ? day.day.mintemp_f : day.day.mintemp_c;

    const card = document.createElement("article");
    card.className = "day-card";
    card.innerHTML = `
      <div class="day-card-header">
        <span class="day-name">${weekday}</span>
      </div>
      <div class="day-temps">
        <span class="high">${Math.round(hi)}°</span>
        <span class="low">${Math.round(lo)}°</span>
      </div>
      <p class="day-desc">${day.day.condition.text}</p>
    `;
    container.appendChild(card);
  });
}
