// ui.js
// TODO (Unit 4): Build DOM nodes from live API data and inject into .weather-results

export function clearResults(){
  const container = document.querySelector('.weather-results');
  if (container) container.innerHTML = '';
}

export function renderWeatherCard(/* weather */){
  // For Unit 3 we rely on the static HTML in index.html.
  // In Unit 4+ you will:
  // 1) createElement('article')...
  // 2) fill in city, temp, etc
  // 3) append to .weather-results
}
