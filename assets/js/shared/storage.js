// storage.js - helper to save/load JSON to localStorage
const Storage = {
  save: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage.save failed', e);
      return false;
    }
  },
  load: function(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('Storage.load failed', e);
      return fallback;
    }
  }
};
