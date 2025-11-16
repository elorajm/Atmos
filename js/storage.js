// storage.js
// Keys we plan to use
const UNIT_KEY = 'atmos:unit';
const FAV_KEY = 'atmos:favorites';

// TODO (Unit 4): Wire these into UI events
export function saveUnit(unit){
  try { localStorage.setItem(UNIT_KEY, unit); } catch(_) {}
}
export function loadUnit(){
  try { return localStorage.getItem(UNIT_KEY) || 'imperial'; } catch(_) { return 'imperial'; }
}

export function getFavorites(){
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(_) { return []; }
}
export function saveFavorites(list){
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch(_) {}
}

export function saveCityTile(){
console.log("Save City Tile button clicked");
}

export function removeCityTile(){
console.log("Remove City Tile button clicked");
}

