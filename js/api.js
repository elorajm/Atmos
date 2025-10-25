// api.js
// TODO (Unit 4): Implement OpenWeatherMap fetch here.
// export async function getJSONWeather(city, units){ ... }

export async function getJSONWeather() {
  // Stub for Unit 3: return static shape example for dev
  return {
    name: 'Rexburg',
    sys: { country: 'US' },
    main: { temp: 72, humidity: 20 },
    wind: { speed: 5 },
    weather: [{ description: 'Sunny with light breeze' }],
    dt: Date.now()
  };
}
