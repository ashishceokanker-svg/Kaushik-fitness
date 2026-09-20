import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'kf_firebase_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyCMRLlZKY7N6isz0sTgKpV8YJiYdzaEJHU',
  authDomain: 'kaushik-fitness.firebaseapp.com',
  projectId: 'kaushik-fitness',
  storageBucket: 'kaushik-fitness.firebasestorage.app',
  messagingSenderId: '356878663250',
  appId: '1:356878663250:web:f63daf925ab9caee29698b',
  measurementId: 'G-G0TW807GEL',
};

/**
 * Load Firebase configuration from localStorage, Vite environment variables, or default.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // Check localStorage first (user-entered via Admin Settings)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // invalid json
    }
  }

  // Fallback to Vite environment variables if defined
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const envKey = metaEnv.VITE_FIREBASE_API_KEY;
  const envProject = metaEnv.VITE_FIREBASE_PROJECT_ID;
  const envAppId = metaEnv.VITE_FIREBASE_APP_ID;

  if (envKey && envProject) {
    return {
      apiKey: envKey,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
      projectId: envProject,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || `${envProject}.firebasestorage.app`,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: envAppId || '',
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  // Return production verified configuration
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Parse raw string input (either JSON object or JS snippet like "const firebaseConfig = { ... }")
 */
export function parseFirebaseConfigSnippet(input: string): FirebaseConfig | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Attempt standard JSON
  try {
    const obj = JSON.parse(trimmed);
    if (obj.apiKey && obj.projectId) return obj;
  } catch {
    // try regex extraction
  }

  // Extract keys via regex if user pasted JS object
  try {
    const extract = (key: string): string => {
      const match = trimmed.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
      return match ? match[1] : '';
    };

    const apiKey = extract('apiKey');
    const projectId = extract('projectId');
    const appId = extract('appId');
    const authDomain = extract('authDomain');
    const storageBucket = extract('storageBucket');
    const messagingSenderId = extract('messagingSenderId');
    const measurementId = extract('measurementId');

    if (apiKey && projectId) {
      return {
        apiKey,
        projectId,
        appId: appId || '1:123456789:web:abcdef',
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        storageBucket: storageBucket || `${projectId}.appspot.com`,
        messagingSenderId,
        measurementId,
      };
    }
  } catch {
    return null;
  }

  return null;
}

let cachedDb: Firestore | null = null;
let cachedApp: FirebaseApp | null = null;

export function getFirebaseInstance(): { app: FirebaseApp | null; db: Firestore | null } {
  const config = getFirebaseConfig();
  if (!config) {
    return { app: null, db: null };
  }

  try {
    if (!cachedApp) {
      cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
    }
    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }
    return { app: cachedApp, db: cachedDb };
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
    return { app: null, db: null };
  }
}

export function isFirebaseConfigured(): boolean {
  return !!getFirebaseConfig();
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config, null, 2));
  // Reset cached instances so new config takes effect
  cachedApp = null;
  cachedDb = null;
}

export function removeFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedApp = null;
  cachedDb = null;
}

/**
 * Test connecting and reading from Firestore
 */
export async function testFirebaseConnection(configToTest?: FirebaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const cfg = configToTest || getFirebaseConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId) {
      return { success: false, message: 'Invalid or missing API Key / Project ID' };
    }

    const testApp = initializeApp(cfg, 'test-connection-' + Date.now());
    const testDb = getFirestore(testApp);

    // Attempt simple query
    const q = query(collection(testDb, 'kf_meta'), limit(1));
    await getDocs(q);

    return { success: true, message: `Successfully connected to Firebase Project "${cfg.projectId}"!` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('permission-denied')) {
      return {
        success: true,
        message: 'Connected to Firebase project! (Note: Configure Firestore rules in Firebase console to allow read/write).',
      };
    }
    return { success: false, message: errorMsg };
  }
}
