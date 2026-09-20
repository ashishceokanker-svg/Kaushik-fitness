import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseInstance, isFirebaseConfigured } from './firebase';
import { localDb } from '../db/localDatabase';
import { getSavedMembershipPlans, getSavedPTPlans } from '../utils/formatters';

export const FIRESTORE_COLLECTIONS = {
  USERS: 'kf_users',
  MEMBER_PROFILES: 'kf_member_profiles',
  MEMBERSHIPS: 'kf_memberships',
  FITNESS_PLANS: 'kf_fitness_plans',
  ATTENDANCE: 'kf_attendance',
  TRANSACTIONS: 'kf_transactions',
  CUSTOM_DIETS: 'kf_custom_diets',
  CUSTOM_WORKOUTS: 'kf_custom_workouts',
  BODY_INDEX_LOGS: 'kf_body_index_logs',
  ENQUIRIES: 'kf_enquiries',
  SUPPLEMENTS: 'kf_supplements',
  SUPPLEMENT_SALES: 'kf_supplement_sales',
  STAFF_DAILY_ATTENDANCE: 'kf_staff_daily_attendance',
  SALARY_PAYMENTS: 'kf_salary_payments',
  MEMBERSHIP_PLANS: 'kf_membership_plans',
  PT_PLANS: 'kf_pt_plans',
} as const;

/**
 * Push an individual document update to Firestore
 */
export async function syncDocToFirestore(
  collectionName: string,
  docId: string,
  data: unknown
): Promise<boolean> {
  const { db } = getFirebaseInstance();
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const cleanData = JSON.parse(JSON.stringify(data)); // remove undefined
    await setDoc(doc(db, collectionName, String(docId)), cleanData, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore sync failed for ${collectionName}/${docId}:`, err);
    return false;
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  docId: string
): Promise<boolean> {
  const { db } = getFirebaseInstance();
  if (!db || !isFirebaseConfigured()) return false;

  try {
    await deleteDoc(doc(db, collectionName, String(docId)));
    return true;
  } catch (err) {
    console.warn(`Firestore delete failed for ${collectionName}/${docId}:`, err);
    return false;
  }
}

/**
 * Subscribe to live changes in a collection with real-time onSnapshot
 */
export function subscribeToLiveCollection<T extends { id?: string }>(
  collectionName: string,
  onData: (items: T[]) => void
): Unsubscribe | null {
  const { db } = getFirebaseInstance();
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as T);
        });
        onData(items);
      },
      (error) => {
        console.warn(`Live listener error on ${collectionName}:`, error);
      }
    );
  } catch (err) {
    console.warn(`Failed to attach live listener on ${collectionName}:`, err);
    return null;
  }
}

/**
 * Push all local data from localStorage directly to Firestore in batches
 */
export async function pushAllLocalDataToFirestore(
  onProgress?: (status: string, percent: number) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  const { db } = getFirebaseInstance();
  if (!db || !isFirebaseConfigured()) {
    return { success: false, count: 0, error: 'Firebase is not configured.' };
  }

  try {
    let totalSynced = 0;
    const progress = (msg: string, pct: number) => {
      if (onProgress) onProgress(msg, Math.round(pct));
    };

    const rawAtt = localStorage.getItem('kf_attendance');
    const attList = rawAtt ? JSON.parse(rawAtt) : [];
    const rawTx = localStorage.getItem('kf_transactions');
    const txList = rawTx ? JSON.parse(rawTx) : [];
    const profiles = localDb.getMemberProfiles();
    const bodyLogs = profiles.flatMap((p) => localDb.getBodyIndexLogs(p.id));

    const collectionsToSync: Array<{
      colName: string;
      localData: Array<unknown>;
      label: string;
    }> = [
      { colName: FIRESTORE_COLLECTIONS.USERS, localData: localDb.getUsers(), label: 'Users & Staff' },
      { colName: FIRESTORE_COLLECTIONS.MEMBER_PROFILES, localData: profiles, label: 'Member Profiles' },
      { colName: FIRESTORE_COLLECTIONS.MEMBERSHIPS, localData: localDb.getMemberships(), label: 'Memberships' },
      { colName: FIRESTORE_COLLECTIONS.FITNESS_PLANS, localData: localDb.getFitnessPlans(), label: 'Fitness Plans' },
      { colName: FIRESTORE_COLLECTIONS.ATTENDANCE, localData: attList, label: 'Attendance' },
      { colName: FIRESTORE_COLLECTIONS.TRANSACTIONS, localData: txList, label: 'Transactions' },
      { colName: FIRESTORE_COLLECTIONS.CUSTOM_DIETS, localData: localDb.getCustomDietPlans(), label: 'Diets' },
      { colName: FIRESTORE_COLLECTIONS.CUSTOM_WORKOUTS, localData: localDb.getCustomWorkoutPlans(), label: 'Workouts' },
      { colName: FIRESTORE_COLLECTIONS.BODY_INDEX_LOGS, localData: bodyLogs, label: 'Body Metrics' },
      { colName: FIRESTORE_COLLECTIONS.ENQUIRIES, localData: localDb.getEnquiries(), label: 'Enquiries' },
      { colName: FIRESTORE_COLLECTIONS.SUPPLEMENTS, localData: localDb.getSupplements(), label: 'Supplements' },
      { colName: FIRESTORE_COLLECTIONS.SUPPLEMENT_SALES, localData: localDb.getSupplementSales(), label: 'POS Sales' },
      { colName: FIRESTORE_COLLECTIONS.STAFF_DAILY_ATTENDANCE, localData: localDb.getStaffDailyAttendance(), label: 'Staff Attendance' },
      { colName: FIRESTORE_COLLECTIONS.SALARY_PAYMENTS, localData: localDb.getSalaryPayments(), label: 'Salary Payments' },
      { colName: FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, localData: getSavedMembershipPlans(), label: 'Membership Plans' },
      { colName: FIRESTORE_COLLECTIONS.PT_PLANS, localData: getSavedPTPlans(), label: 'PT Packages' },
    ];

    const totalSteps = collectionsToSync.length;

    for (let i = 0; i < totalSteps; i++) {
      const target = collectionsToSync[i];
      const items = target.localData;
      progress(`Syncing ${target.label} (${items.length} records)...`, (i / totalSteps) * 100);

      if (items.length > 0) {
        // Chunk into groups of 300 to stay well under Firestore 500 batch limit
        const chunkSize = 300;
        for (let c = 0; c < items.length; c += chunkSize) {
          const chunk = items.slice(c, c + chunkSize);
          const batch = writeBatch(db);

          for (const rawItem of chunk) {
            const item = rawItem as Record<string, unknown>;
            const id = String(item.id || item.userId || item.memberId || `${Date.now()}-${Math.random()}`);
            const clean = JSON.parse(JSON.stringify(item));
            const docRef = doc(db, target.colName, id);
            batch.set(docRef, clean, { merge: true });
            totalSynced++;
          }
          await batch.commit();
        }
      }
    }

    progress('Cloud Sync complete! All records live on Firestore.', 100);
    return { success: true, count: totalSynced };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('pushAllLocalDataToFirestore error:', err);
    return { success: false, count: 0, error: errorMsg };
  }
}

/**
 * Pull all data from Firestore down into local database
 */
export async function pullAllFirestoreDataToLocal(
  onProgress?: (status: string, percent: number) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  const { db } = getFirebaseInstance();
  if (!db || !isFirebaseConfigured()) {
    return { success: false, count: 0, error: 'Firebase is not configured.' };
  }

  try {
    let totalPulled = 0;
    const progress = (msg: string, pct: number) => {
      if (onProgress) onProgress(msg, Math.round(pct));
    };

    const collectionsToPull: Array<{ colName: string; storageKey: string; label: string }> = [
      { colName: FIRESTORE_COLLECTIONS.USERS, storageKey: 'kf_db_users', label: 'Users' },
      { colName: FIRESTORE_COLLECTIONS.MEMBER_PROFILES, storageKey: 'kf_db_member_profiles', label: 'Profiles' },
      { colName: FIRESTORE_COLLECTIONS.MEMBERSHIPS, storageKey: 'kf_db_memberships', label: 'Memberships' },
      { colName: FIRESTORE_COLLECTIONS.FITNESS_PLANS, storageKey: 'kf_db_fitness_plans', label: 'Plans' },
      { colName: FIRESTORE_COLLECTIONS.ATTENDANCE, storageKey: 'kf_db_attendance', label: 'Attendance' },
      { colName: FIRESTORE_COLLECTIONS.TRANSACTIONS, storageKey: 'kf_db_transactions', label: 'Transactions' },
      { colName: FIRESTORE_COLLECTIONS.CUSTOM_DIETS, storageKey: 'kf_db_custom_diets', label: 'Diets' },
      { colName: FIRESTORE_COLLECTIONS.CUSTOM_WORKOUTS, storageKey: 'kf_db_custom_workouts', label: 'Workouts' },
      { colName: FIRESTORE_COLLECTIONS.BODY_INDEX_LOGS, storageKey: 'kf_db_body_index_logs', label: 'Body Metrics' },
      { colName: FIRESTORE_COLLECTIONS.ENQUIRIES, storageKey: 'kf_db_enquiries', label: 'Enquiries' },
      { colName: FIRESTORE_COLLECTIONS.SUPPLEMENTS, storageKey: 'kf_db_supplements', label: 'Supplements' },
      { colName: FIRESTORE_COLLECTIONS.SUPPLEMENT_SALES, storageKey: 'kf_db_supplement_sales', label: 'Sales' },
      { colName: FIRESTORE_COLLECTIONS.STAFF_DAILY_ATTENDANCE, storageKey: 'kf_db_staff_daily_attendance', label: 'Staff Attendance' },
      { colName: FIRESTORE_COLLECTIONS.SALARY_PAYMENTS, storageKey: 'kf_db_salary_payments', label: 'Salary Payments' },
      { colName: FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, storageKey: 'kf_membership_plans', label: 'Membership Plans' },
      { colName: FIRESTORE_COLLECTIONS.PT_PLANS, storageKey: 'kf_pt_plans', label: 'PT Packages' },
    ];

    const totalSteps = collectionsToPull.length;

    for (let i = 0; i < totalSteps; i++) {
      const target = collectionsToPull[i];
      progress(`Downloading ${target.label}...`, (i / totalSteps) * 100);

      const colRef = collection(db, target.colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const items: Array<Record<string, unknown>> = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() });
        });
        localStorage.setItem(target.storageKey, JSON.stringify(items));
        totalPulled += items.length;
      }
    }

    progress('Download complete! Local database refreshed.', 100);
    return { success: true, count: totalPulled };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('pullAllFirestoreDataToLocal error:', err);
    return { success: false, count: 0, error: errorMsg };
  }
}
