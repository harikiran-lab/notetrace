import { writable } from 'svelte/store';
import { settingPrefix, settingScope } from './setting-key.js';

// Local to this browser/device and account; never synced to the server.
export function createNotificationHistory({ storage, scope, now = Date.now, limit = 50 }) {
  const store = writable([]);
  let key;
  let entries = [];
  function load(force = false) {
    const next = scope();
    if (key === next && !force) return;
    key = next;
    try {
      const saved = JSON.parse(storage.getItem(key) || '[]');
      entries = Array.isArray(saved) ? saved.filter(e => e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.body === 'string' && Number.isFinite(e.time)).slice(0, limit) : [];
    } catch { entries = []; }
    store.set(entries);
  }
  function save() {
    try { storage.setItem(key, JSON.stringify(entries)); } catch { /* memory still works */ }
    store.set(entries);
  }
  return {
    subscribe: store.subscribe,
    load,
    add(event) {
      load();
      entries = [{ ...event, time: now(), read: false }, ...entries.filter(e => e.id !== event.id)].slice(0, limit);
      save();
    },
    markRead(id) { load(); entries = entries.map(e => !id || e.id === id ? { ...e, read: true } : e); save(); },
    clear() { load(); entries = []; save(); },
    reset() {
      // Drop the previous account's local history on sign-out/account change.
      try { if (key) storage.removeItem(key); } catch {}
      key = undefined; entries = []; store.set(entries);
    },
  };
}

export const notificationHistory = createNotificationHistory({
  storage: {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: key => localStorage.removeItem(key),
  },
  scope: () => `${settingScope()}:${settingPrefix()}notificationHistory`,
});
