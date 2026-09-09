const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// Configuration for Firebase Realtime Database
const FIREBASE_CONFIG = {
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://stress-f5bf3-default-rtdb.firebaseio.com',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyATNQ5mvxoIDvyvGiLkd6g3LnYqW8h0bN0',
  projectId: process.env.FIREBASE_PROJECT_ID || 'stress-f5bf3',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'stress-f5bf3.firebaseapp.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'stress-f5bf3.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '609097876784',
  appId: process.env.FIREBASE_APP_ID || '1:609097876784:web:e30a0a9be6d27b65f634f5',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-QSTEQP5ZKB'
};

const LOCAL_STORE_PATH = path.join(__dirname, '..', 'firebase_local_store.json');

// Initial Realtime Database Node Structure
const initialTree = {
  users: {},
  students: {},
  mentors: {},
  checkins: {}, // checkins[studentId][date] = { id, mood, stress_level, private_note, created_at }
  stress_alerts: {}, // stress_alerts[alertId] = { id, student_id, start_date, end_date, ... }
  academic_periods: {}, // academic_periods[periodId] = { id, title, period_type, ... }
  notifications: {} // notifications[userId][notifId] = { id, title, message, ... }
};

let store = { ...initialTree };

// Load store from disk if exists
function loadStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORE_PATH, 'utf-8');
      store = JSON.parse(data);
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Failed to load local store:', err);
    store = { ...initialTree };
  }
}

function saveStore() {
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

loadStore();

/**
 * Check if Live Firebase Realtime DB URL is provided
 */
function isLiveFirebase() {
  return Boolean(FIREBASE_CONFIG.databaseURL && FIREBASE_CONFIG.databaseURL.trim().length > 0);
}

/**
 * Realtime Database Adapter API
 */
const db = {
  getStore: () => store,

  // Read data at a node path (e.g. 'users/123' or 'checkins')
  async get(nodePath) {
    // 1. Resolve from local memory store for instant responsiveness
    const parts = nodePath.split('/').filter(Boolean);
    let current = store;
    for (const p of parts) {
      if (!current || typeof current !== 'object') {
        current = null;
        break;
      }
      current = current[p];
    }

    if (current !== null && current !== undefined) {
      return JSON.parse(JSON.stringify(current));
    }

    // 2. If not in local store, fetch from live Firebase Realtime Database
    if (isLiveFirebase()) {
      try {
        const url = `${FIREBASE_CONFIG.databaseURL.replace(/\/$/, '')}/${nodePath}.json`;
        const res = await fetch(url);
        const remoteData = await res.json();
        if (remoteData !== null && remoteData !== undefined) {
          // Cache in local store
          let node = store;
          for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!node[p] || typeof node[p] !== 'object') node[p] = {};
            node = node[p];
          }
          if (parts.length > 0) {
            node[parts[parts.length - 1]] = remoteData;
            saveStore();
          }
          return remoteData;
        }
      } catch (e) {
        console.warn('Firebase live fetch failed:', e.message);
      }
    }

    return null;
  },

  // Set (overwrite) data at a node path
  async set(nodePath, data) {
    // 1. Update local cache immediately for zero latency
    const parts = nodePath.split('/').filter(Boolean);
    let current = store;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!current[p] || typeof current[p] !== 'object') {
        current[p] = {};
      }
      current = current[p];
    }
    const lastKey = parts[parts.length - 1];
    current[lastKey] = JSON.parse(JSON.stringify(data));
    saveStore();

    // 2. Push to remote Firebase Realtime Database
    if (isLiveFirebase()) {
      try {
        const url = `${FIREBASE_CONFIG.databaseURL.replace(/\/$/, '')}/${nodePath}.json`;
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.warn('Firebase Realtime DB sync warning:', e.message);
      }
    }

    return data;
  },

  // Update existing fields at a path
  async update(nodePath, partialData) {
    const existing = await this.get(nodePath) || {};
    const merged = { ...existing, ...partialData };
    return await this.set(nodePath, merged);
  },

  // Push a new record with generated UUID
  async push(nodePath, data) {
    const newId = randomUUID();
    const itemWithId = { id: newId, ...data };
    await this.set(`${nodePath}/${newId}`, itemWithId);
    return itemWithId;
  },

  // Remove data at a node path
  async remove(nodePath) {
    const parts = nodePath.split('/').filter(Boolean);
    let current = store;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!current[p]) return;
      current = current[p];
    }
    const lastKey = parts[parts.length - 1];
    delete current[lastKey];
    saveStore();
  },

  // Helper: Find all records in a collection matching a predicate
  async findMany(collection, predicate = () => true) {
    const node = await this.get(collection) || {};
    return Object.values(node).filter(predicate);
  },

  // Helper: Find single record in a collection
  async findOne(collection, predicate = () => true) {
    const node = await this.get(collection) || {};
    return Object.values(node).find(predicate) || null;
  },

  // Set Firebase configuration dynamically
  setFirebaseConfig(config) {
    Object.assign(FIREBASE_CONFIG, config);
    console.log('Firebase configuration updated:', {
      databaseURL: FIREBASE_CONFIG.databaseURL,
      hasApiKey: Boolean(FIREBASE_CONFIG.apiKey)
    });
  },

  getFirebaseConfig: () => ({ ...FIREBASE_CONFIG })
};

module.exports = db;
