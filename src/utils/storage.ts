import { DateVibeItem } from '../types';
import { INITIAL_DISHES } from '../data/seedData';
import dishBarcelonaStewImg from '../assets/images/dish_barcelona_stew.png';

const LOCAL_STORAGE_KEY = '23_12_midnight_pot_dishes';
const DB_NAME = '23_12_MidnightPot_DB';
const DB_VERSION = 1;
const STORE_NAME = 'dishes_store';
const RECORD_KEY = 'saved_dishes_list';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Sanitize dishes to ensure all required fields are valid and updated
export function sanitizeDishes(raw: DateVibeItem[]): DateVibeItem[] {
  if (!Array.isArray(raw)) return INITIAL_DISHES;

  return raw.map((d: DateVibeItem) => {
    if (d.id === 'dish-8') {
      const resolvedImage =
        d.image && !d.image.startsWith('/assets/aistudio/') ? d.image : dishBarcelonaStewImg;
      return {
        ...d,
        cooked: true,
        image: resolvedImage,
        city: {
          ...d.city,
          name: 'Barcelona',
          country: 'Spain',
          location: d.city?.location || 'Barcelona, Spain',
        },
      };
    }
    return {
      ...d,
      image:
        d.image && !d.image.includes('images.unsplash.com') && !d.image.startsWith('/assets/aistudio/')
          ? d.image
          : '',
    };
  });
}

// Synchronously get initial dishes on component mount from localStorage, fallback to INITIAL_DISHES
export function getInitialDishes(): DateVibeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeDishes(parsed);
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return INITIAL_DISHES;
}

// Asynchronously load from IndexedDB (unlimited quota storage)
export async function loadDishesFromStorage(): Promise<DateVibeItem[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(RECORD_KEY);

    const result = await new Promise<DateVibeItem[] | undefined>((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return sanitizeDishes(result);
    }
  } catch (err) {
    console.warn('IndexedDB read fallback to localStorage:', err);
  }

  return getInitialDishes();
}

// Asynchronously save dishes to BOTH IndexedDB (unlimited quota) and localStorage (fast synchronous access)
export async function persistDishes(dishesToSave: DateVibeItem[]): Promise<void> {
  const sanitized = sanitizeDishes(dishesToSave);

  // 1. Save to IndexedDB (safe for high-resolution images & unlimited entries)
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(sanitized, RECORD_KEY);
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }

  // 2. Also save to localStorage as fast backup (if quota allows)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('localStorage quota reached, saved safely in IndexedDB:', err);
  }
}
