import {
  DbUser,
  DbMemberProfile,
  DbMembership,
  DbFitnessPlan,
  Member,
  Staff,
  AttendanceRecord,
  FinancialTransaction,
  ProgressLog,
  MembershipDuration,
  PTPackageDuration,
  PaymentMethod,
  FitnessGoal,
  Gender,
  BodyIndexLog,
  BodyPhotoLog,
  GymEnquiry,
  StaffLoginLog,
  SalaryPayment,
  CustomDietPlan,
  CustomWorkoutPlan,
  GymGeofenceSettings,
  StaffAttendanceStatus,
  StaffDailyAttendance,
  SupplementItem,
  SupplementSaleTransaction,
} from '../types';
import { calculateFitnessMetrics, generateWorkoutRoutine, generateDietPlan, generateAutomaticCustomWorkout, generateAutomaticCustomDiet } from '../utils/fitnessCalculator';
import { calculateExpiryDate, MEMBERSHIP_PRICING, PT_PRICING } from '../utils/formatters';
import { INITIAL_SALARY_PAYMENTS, INITIAL_CUSTOM_DIETS, INITIAL_CUSTOM_WORKOUTS } from '../data/initialData';
import { DEFAULT_GYM_GEOFENCE, checkGeofence, getSimulationMode } from '../utils/geolocation';
import { getSeedBodyPhotoSvg } from '../utils/bodyPhotoSvgs';

// Storage Keys
const DB_KEYS = {
  USERS: 'kf_db_users',
  MEMBER_PROFILES: 'kf_db_member_profiles',
  MEMBERSHIPS: 'kf_db_memberships',
  FITNESS_PLANS: 'kf_db_fitness_plans',
  ATTENDANCE: 'kf_db_attendance',
  TRANSACTIONS: 'kf_db_transactions',
  PROGRESS_LOGS: 'kf_db_progress_logs',
  BODY_INDEX_LOGS: 'kf_db_body_index_logs',
  BODY_PHOTOS: 'kf_db_body_photos',
  ENQUIRIES: 'kf_db_enquiries',
  LOGIN_LOGS: 'kf_db_login_logs',
  SALARY_PAYMENTS: 'kf_db_salary_payments',
  CUSTOM_DIETS: 'kf_db_custom_diets',
  CUSTOM_WORKOUTS: 'kf_db_custom_workouts',
  GEOFENCE_SETTINGS: 'kf_db_geofence_settings',
  STAFF_DAILY_ATTENDANCE: 'kf_db_staff_daily_attendance',
  SUPPLEMENTS: 'kf_db_supplements',
  SUPPLEMENT_SALES: 'kf_db_supplement_sales',
  STAFF_PROFILES: 'kf_db_staff_profiles',
  VERSION: 'kf_db_version_v9_photos_auto_plans',
};

// ===============================================================
// INITIAL SEED DATA - 1 ADMIN, 1 TRAINER, 1 STAFF, 5 PT MEMBERS
// ===============================================================

const SEED_USERS: DbUser[] = [
  {
    id: 'usr-1',
    name: 'Vaibhav Kaushik',
    email: 'admin@kaushikfitness.com',
    phone: '9826189001',
    password_hash: '$2a$12$adminHashKanker2024',
    role: 'admin',
    created_at: '2022-01-01T00:00:00.000Z',
    pin: '2343',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334',
  },
  {
    id: 'usr-dev',
    name: 'Ashish Dey',
    email: 'developer@kaushikfitness.com',
    phone: '9244249975',
    password_hash: '$2a$12$devHashKondagaon2024',
    role: 'admin',
    created_at: '2022-01-01T00:00:00.000Z',
    pin: '9975',
    address: 'Janpad Panchayat Baderajpur, District Kondagaon (C.G.)',
  },
];

const SEED_MEMBER_PROFILES: DbMemberProfile[] = [];
const SEED_MEMBERSHIPS: DbMembership[] = [];
const SEED_BODY_INDEX_LOGS: BodyIndexLog[] = [];
const SEED_ENQUIRIES: GymEnquiry[] = [];
const SEED_BODY_PHOTO_LOGS: BodyPhotoLog[] = [];
const SEED_FITNESS_PLANS: DbFitnessPlan[] = [];
const SEED_LOGIN_LOGS: StaffLoginLog[] = [];

const INITIAL_STAFF_DAILY_ATTENDANCE: StaffDailyAttendance[] = [];

// ===============================================================
// SEED SUPPLEMENT INVENTORY & SALES
// ===============================================================

const SEED_SUPPLEMENTS: SupplementItem[] = [
  {
    id: 'sup-1',
    name: 'ON Gold Standard 100% Whey Protein (2 kg)',
    category: 'whey_protein',
    brand: 'Optimum Nutrition',
    costPrice: 5200,
    sellingPrice: 6500,
    stockQuantity: 12,
    unit: 'Tub',
    minStockAlert: 3,
    batchNumber: 'ON-2026-B89',
    expiryDate: '2027-11-30',
    flavor: 'Double Rich Chocolate',
    weightGrams: 2000,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-2',
    name: 'MuscleBlaze Micronized Creatine Monohydrate (250g)',
    category: 'creatine',
    brand: 'MuscleBlaze',
    costPrice: 850,
    sellingPrice: 1199,
    stockQuantity: 18,
    unit: 'Jar',
    minStockAlert: 4,
    batchNumber: 'MB-CR-554',
    expiryDate: '2028-02-28',
    flavor: 'Unflavored',
    weightGrams: 250,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-3',
    name: 'GAT Sport BCAA 7000mg + Glutamine (30 Servings)',
    category: 'bcaa',
    brand: 'GAT Sport',
    costPrice: 1600,
    sellingPrice: 2200,
    stockQuantity: 8,
    unit: 'Tub',
    minStockAlert: 2,
    batchNumber: 'GAT-BC-102',
    expiryDate: '2027-08-15',
    flavor: 'Watermelon',
    weightGrams: 390,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-4',
    name: 'Labrada Muscle Mass Gainer (3 kg)',
    category: 'mass_gainer',
    brand: 'Labrada',
    costPrice: 2800,
    sellingPrice: 3600,
    stockQuantity: 6,
    unit: 'Tub',
    minStockAlert: 2,
    batchNumber: 'LAB-MG-908',
    expiryDate: '2027-10-20',
    flavor: 'Chocolate Fudge',
    weightGrams: 3000,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-5',
    name: 'Cellucor C4 Original Pre-Workout (30 Servings)',
    category: 'pre_workout',
    brand: 'Cellucor',
    costPrice: 1900,
    sellingPrice: 2500,
    stockQuantity: 9,
    unit: 'Bottle',
    minStockAlert: 3,
    batchNumber: 'C4-PW-441',
    expiryDate: '2027-12-31',
    flavor: 'Icy Blue Razz',
    weightGrams: 195,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-6',
    name: 'MyFitness High Protein Peanut Butter Chocolate (1 kg)',
    category: 'peanut_butter',
    brand: 'MyFitness',
    costPrice: 420,
    sellingPrice: 599,
    stockQuantity: 24,
    unit: 'Jar',
    minStockAlert: 5,
    batchNumber: 'MYF-PB-778',
    expiryDate: '2027-06-30',
    flavor: 'Dark Chocolate Crunchy',
    weightGrams: 1000,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'sup-7',
    name: 'MuscleBlaze Daily Multivitamin with Ginseng (60 Tabs)',
    category: 'vitamins',
    brand: 'MuscleBlaze',
    costPrice: 450,
    sellingPrice: 699,
    stockQuantity: 15,
    unit: 'Bottle',
    minStockAlert: 4,
    batchNumber: 'MB-VIT-312',
    expiryDate: '2028-01-15',
    flavor: 'Tablets',
    weightGrams: 120,
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
];

const SEED_SUPPLEMENT_SALES: SupplementSaleTransaction[] = [];

// ===============================================================
// LOCAL DATABASE SERVICE CLASS
// ===============================================================

class LocalGymDatabase {
  constructor() {
    this.checkAndMigrate();
  }

  private checkAndMigrate() {
    try {
      const CLEAN_MIGRATION_KEY = 'kf_clean_v12_prod_only';
      if (localStorage.getItem(CLEAN_MIGRATION_KEY) !== 'true') {
        // 1. Purge all users except Admin (usr-1, 2343) and Developer (usr-dev, 9975)
        const cleanUsers: DbUser[] = [
          {
            id: 'usr-1',
            name: 'Vaibhav Kaushik',
            email: 'admin@kaushikfitness.com',
            phone: '9826189001',
            password_hash: '$2a$12$adminHashKanker2024',
            role: 'admin',
            created_at: '2022-01-01T00:00:00.000Z',
            pin: '2343',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            address: 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334',
          },
          {
            id: 'usr-dev',
            name: 'Ashish Dey',
            email: 'developer@kaushikfitness.com',
            phone: '9244249975',
            password_hash: '$2a$12$devHashKondagaon2024',
            role: 'admin',
            created_at: '2022-01-01T00:00:00.000Z',
            pin: '9975',
            address: 'Janpad Panchayat Baderajpur, District Kondagaon (C.G.)',
          },
        ];
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(cleanUsers));

        // 2. Wipe all demo records from localStorage
        localStorage.setItem(DB_KEYS.MEMBER_PROFILES, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.MEMBERSHIPS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.PROGRESS_LOGS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.BODY_INDEX_LOGS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.BODY_PHOTOS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.ENQUIRIES, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.LOGIN_LOGS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.SALARY_PAYMENTS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.CUSTOM_DIETS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.CUSTOM_WORKOUTS, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.STAFF_DAILY_ATTENDANCE, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.SUPPLEMENT_SALES, JSON.stringify([]));
        localStorage.setItem(DB_KEYS.STAFF_PROFILES, JSON.stringify([]));

        // Wipe legacy keys
        localStorage.removeItem('kf_members');
        localStorage.removeItem('kf_staff');
        localStorage.removeItem('kf_attendance');
        localStorage.removeItem('kf_transactions');
        localStorage.removeItem('kf_progress_logs');
        localStorage.removeItem('kf_enquiries');
        localStorage.removeItem('kf_active_shift');

        // Check active session: if logged in as a demo user (not usr-1 or usr-dev), logout
        try {
          const authUserRaw = localStorage.getItem('kf_auth_user');
          if (authUserRaw) {
            const authUser = JSON.parse(authUserRaw);
            if (authUser?.id !== 'usr-1' && authUser?.id !== 'usr-dev') {
              localStorage.removeItem('kf_auth_user');
              localStorage.removeItem('kf_current_user');
              localStorage.removeItem('kf_user_role');
              localStorage.removeItem('kf_user_token');
            }
          }
        } catch {}

        localStorage.setItem(CLEAN_MIGRATION_KEY, 'true');
      }

      // V13 MIGRATION: Sanitize any non-PT member who got Coach Vikram Sahu auto-assigned
      const CLEAN_MIGRATION_V13_KEY = 'kf_clean_v13_trainer_and_nav_fix';
      if (localStorage.getItem(CLEAN_MIGRATION_V13_KEY) !== 'true') {
        try {
          const membershipsRaw = localStorage.getItem(DB_KEYS.MEMBERSHIPS);
          if (membershipsRaw) {
            const memberships: DbMembership[] = JSON.parse(membershipsRaw);
            let changed = false;
            memberships.forEach((m) => {
              if (!m.is_personal_training) {
                if (m.trainer_id || m.trainer_name) {
                  m.trainer_id = undefined;
                  m.trainer_name = undefined;
                  changed = true;
                }
              }
            });
            if (changed) {
              localStorage.setItem(DB_KEYS.MEMBERSHIPS, JSON.stringify(memberships));
            }
          }
        } catch {}

        try {
          const workoutsRaw = localStorage.getItem(DB_KEYS.CUSTOM_WORKOUTS);
          if (workoutsRaw) {
            const workouts: any[] = JSON.parse(workoutsRaw);
            let changed = false;
            workouts.forEach((w) => {
              if (w.trainerName?.includes('Vikram') || w.trainerId === 'usr-2') {
                w.trainerName = undefined;
                w.trainerId = undefined;
                if (w.notes) {
                  w.notes = w.notes.replace(/कोच (Coach )?Vikram Sahu द्वारा (स्वचालित )?निर्धारित/, 'निर्धारित');
                }
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(DB_KEYS.CUSTOM_WORKOUTS, JSON.stringify(workouts));
            }
          }
        } catch {}

        try {
          const dietsRaw = localStorage.getItem(DB_KEYS.CUSTOM_DIETS);
          if (dietsRaw) {
            const diets: any[] = JSON.parse(dietsRaw);
            let changed = false;
            diets.forEach((d) => {
              if (d.trainerName?.includes('Vikram') || d.trainerId === 'usr-2') {
                d.trainerName = undefined;
                d.trainerId = undefined;
                if (d.notes) {
                  d.notes = d.notes.replace(/व्यक्तिगत ट्रेनर निर्देश \(.*?\):/, 'व्यक्तिगत पोषण निर्देश:');
                }
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(DB_KEYS.CUSTOM_DIETS, JSON.stringify(diets));
            }
          }
        } catch {}

        localStorage.setItem(CLEAN_MIGRATION_V13_KEY, 'true');
      }
    } catch (e) {
      console.warn('Local database migration notice:', e);
    }
  }

  // System Form Mode (Simple vs Advanced Toggle for Dev)
  getFormMode(): 'simple' | 'advanced' {
    try {
      const mode = localStorage.getItem('kf_system_form_mode');
      return mode === 'advanced' ? 'advanced' : 'simple';
    } catch {
      return 'simple';
    }
  }

  setFormMode(mode: 'simple' | 'advanced'): void {
    try {
      localStorage.setItem('kf_system_form_mode', mode);
      window.dispatchEvent(new CustomEvent('kf_form_mode_change', { detail: { mode } }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'kf_system_form_mode', newValue: mode }));
    } catch (e) {
      console.warn('Failed to save form mode:', e);
    }
  }

  private getTable<T>(key: string, seed: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(data);
    } catch {
      return seed;
    }
  }

  private setTable<T>(key: string, data: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`[LocalDatabase] Failed to setTable for ${key}:`, err);
    }
  }

  // Users
  getUsers(): DbUser[] {
    const list = this.getTable<DbUser>(DB_KEYS.USERS, SEED_USERS);
    let changed = false;
    list.forEach((u) => {
      if (u.id === 'usr-1' || u.phone === '9826189001' || u.email === 'admin@kaushikfitness.com') {
        if (u.pin !== '2343') {
          u.pin = '2343';
          changed = true;
        }
        if (u.name !== 'Vaibhav Kaushik') {
          u.name = 'Vaibhav Kaushik';
          changed = true;
        }
      }
      if (u.id === 'usr-dev' || u.phone === '9244249975') {
        if (u.pin !== '9975') {
          u.pin = '9975';
          changed = true;
        }
      }
    });

    const hasDev = list.some((u) => u.id === 'usr-dev' || u.pin === '9975');
    if (!hasDev) {
      list.push({
        id: 'usr-dev',
        name: 'Ashish Dey',
        email: 'developer@kaushikfitness.com',
        phone: '9244249975',
        password_hash: '$2a$12$devHashKondagaon2024',
        role: 'admin',
        created_at: '2022-01-01T00:00:00.000Z',
        pin: '9975',
        address: 'Janpad Panchayat Baderajpur, District Kondagaon (C.G.)',
      });
      changed = true;
    }

    if (changed) {
      this.setTable(DB_KEYS.USERS, list);
    }
    return list;
  }

  getUserById(id: string): DbUser | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  updateUser(id: string, updates: Partial<DbUser>): DbUser | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.setTable(DB_KEYS.USERS, users);
    return users[idx];
  }

  // Member Profiles
  getMemberProfiles(): DbMemberProfile[] {
    return this.getTable<DbMemberProfile>(DB_KEYS.MEMBER_PROFILES, SEED_MEMBER_PROFILES);
  }

  // Memberships
  getMemberships(): DbMembership[] {
    return this.getTable<DbMembership>(DB_KEYS.MEMBERSHIPS, SEED_MEMBERSHIPS);
  }

  // Fitness Plans
  getFitnessPlans(): DbFitnessPlan[] {
    return this.getTable<DbFitnessPlan>(DB_KEYS.FITNESS_PLANS, SEED_FITNESS_PLANS);
  }

  // ===============================================================
  // STAFF & TRAINER LOGIN AUTO-LOG REPORT
  // ===============================================================

  getStaffLoginLogs(): StaffLoginLog[] {
    return this.getTable<StaffLoginLog>(DB_KEYS.LOGIN_LOGS, SEED_LOGIN_LOGS).sort(
      (a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }

  recordStaffLogin(log: Omit<StaffLoginLog, 'id'>): StaffLoginLog {
    const logs = this.getStaffLoginLogs();
    const newLog: StaffLoginLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    logs.unshift(newLog);
    this.setTable(DB_KEYS.LOGIN_LOGS, logs);
    return newLog;
  }

  recordStaffLogout(userId: string): void {
    const logs = this.getStaffLoginLogs();
    const updated = logs.map((l) =>
      l.userId === userId && l.status === 'active'
        ? { ...l, status: 'logged_out' as const, logoutTime: new Date().toISOString() }
        : l
    );
    this.setTable(DB_KEYS.LOGIN_LOGS, updated);
  }

  // ===============================================================
  // BODY INDEX & PHYSICAL CHANGES TRACKER
  // ===============================================================

  getBodyIndexLogs(memberId: string): BodyIndexLog[] {
    const all = this.getTable<BodyIndexLog>(DB_KEYS.BODY_INDEX_LOGS, SEED_BODY_INDEX_LOGS);
    const cleanId = (memberId || '').replace('mem-', '').replace('prof-', '');
    return all
      .filter((l) => l.memberId === memberId || (cleanId && l.memberId.replace('mem-', '').replace('prof-', '') === cleanId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  addBodyIndexLog(log: Omit<BodyIndexLog, 'id'>): BodyIndexLog {
    const all = this.getTable<BodyIndexLog>(DB_KEYS.BODY_INDEX_LOGS, SEED_BODY_INDEX_LOGS);
    const newLog: BodyIndexLog = {
      ...log,
      id: `bi-${Date.now()}`,
    };
    all.push(newLog);
    this.setTable(DB_KEYS.BODY_INDEX_LOGS, all);

    const profiles = this.getMemberProfiles();
    const targetProf = profiles.find((p) => p.id === log.memberId);
    if (targetProf) {
      targetProf.weight = log.weightKg;
      targetProf.height = log.heightCm;
      targetProf.bmi = log.bmi;
      targetProf.measurements = {
        chest: log.chestInches,
        waist: log.waistInches,
        biceps: log.bicepsInches,
        thighs: log.thighsInches,
        hips: log.hipsInches,
      };
      if (log.bodyFatPct) targetProf.body_fat_percentage = log.bodyFatPct;
      this.setTable(DB_KEYS.MEMBER_PROFILES, profiles);
    }

    return newLog;
  }

  // ===============================================================
  // 4-SIDE BODY PHOTO PROGRESS & COMPARISON
  // ===============================================================
  // 4-SIDE BODY PHOTO TRACKER & COMPARISON
  // ===============================================================

  getAllBodyPhotoLogs(): BodyPhotoLog[] {
    return this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, SEED_BODY_PHOTO_LOGS);
  }

  getBodyPhotoLogs(memberId: string): BodyPhotoLog[] {
    const all = this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, SEED_BODY_PHOTO_LOGS);
    const cleanId = (memberId || '').replace('mem-', '').replace('prof-', '').replace('usr-', '');
    return all
      .filter((l) => {
        if (!l) return false;
        if (l.memberId === memberId) return true;
        const lClean = (l.memberId || '').replace('mem-', '').replace('prof-', '').replace('usr-', '');
        return cleanId && lClean && cleanId === lClean;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  saveBodyPhotoLog(log: Omit<BodyPhotoLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): BodyPhotoLog {
    const all = this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, SEED_BODY_PHOTO_LOGS);
    let savedEntry: BodyPhotoLog;
    if (log.id) {
      const idx = all.findIndex((item) => item.id === log.id);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          ...log,
          id: log.id,
        };
        savedEntry = all[idx];
      } else {
        savedEntry = {
          ...log,
          id: log.id,
          createdAt: log.createdAt || new Date().toISOString(),
        };
        all.push(savedEntry);
      }
    } else {
      savedEntry = {
        ...log,
        id: `bp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      all.push(savedEntry);
    }
    this.setTable(DB_KEYS.BODY_PHOTOS, all);
    return savedEntry;
  }

  deleteBodyPhotoLog(id: string): void {
    const all = this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, SEED_BODY_PHOTO_LOGS);
    const filtered = all.filter((l) => l.id !== id);
    this.setTable(DB_KEYS.BODY_PHOTOS, filtered);
  }

  // ===============================================================
  // GYM ENQUIRIES & LEADS MANAGEMENT
  // ===============================================================

  getEnquiries(): GymEnquiry[] {
    return this.getTable<GymEnquiry>(DB_KEYS.ENQUIRIES, SEED_ENQUIRIES).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addEnquiry(enquiry: Omit<GymEnquiry, 'id' | 'createdAt' | 'status'>): GymEnquiry {
    const all = this.getEnquiries();
    const newEnq: GymEnquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    all.unshift(newEnq);
    this.setTable(DB_KEYS.ENQUIRIES, all);
    return newEnq;
  }

  updateEnquiryStatus(id: string, status: GymEnquiry['status'], followUpNote?: string) {
    const all = this.getEnquiries();
    const updated = all.map((e) =>
      e.id === id ? { ...e, status, followUpNote: followUpNote || e.followUpNote } : e
    );
    this.setTable(DB_KEYS.ENQUIRIES, updated);
  }

  // ===============================================================
  // RELATIONAL JOINS
  // ===============================================================

  getJoinedMembers(): Member[] {
    const users = this.getUsers();
    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();

    return profiles.map((profile) => {
      const user = users.find((u) => u.id === profile.user_id) || {
        id: profile.user_id,
        name: 'Athlete',
        email: '',
        phone: '',
        pin: '1234',
        role: 'member' as const,
        created_at: new Date().toISOString(),
        password_hash: '',
      };

      const membership = memberships.find((m) => m.member_id === profile.id) || {
        id: `msh-${profile.id}`,
        member_id: profile.id,
        package_type: '1_month' as const,
        is_personal_training: false,
        joining_date: new Date().toISOString(),
        expiry_date: calculateExpiryDate(new Date().toISOString(), '1_month'),
        total_fee: 1200,
        base_fee: 1200,
        pt_fee: 0,
        discount_applied: 0,
        final_paid_fee: 1200,
        due_amount: 0,
        payment_status: 'paid' as const,
        payment_method: 'upi' as const,
        last_payment_date: new Date().toISOString(),
        active: true,
      };

      const savedStaff = this.getTable<Staff>(DB_KEYS.STAFF_PROFILES, []);
      const trainer =
        users.find((u) => u.id === membership.trainer_id) ||
        savedStaff.find((s) => s.id === membership.trainer_id || s.userId === membership.trainer_id);

      return {
        id: profile.id,
        userId: user.id,
        memberCode: profile.member_code,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.height,
        weightKg: profile.weight,
        targetWeightKg: profile.target_weight,
        emergencyContact: profile.emergency_contact,
        joiningDate: membership.joining_date,
        membershipDuration: membership.package_type,
        expiryDate: membership.expiry_date,
        personalTraining: membership.is_personal_training,
        ptDuration: membership.pt_duration,
        assignedTrainerId: membership.is_personal_training ? membership.trainer_id : undefined,
        assignedTrainerName: membership.is_personal_training ? (trainer ? trainer.name : membership.trainer_name) : undefined,
        baseFee: membership.base_fee || 1200,
        ptFee: membership.pt_fee || 0,
        discountType: membership.discount_type || 'flat',
        discountValue: membership.discount_value || membership.discount_applied,
        totalPayable: membership.total_fee,
        paidAmount: membership.final_paid_fee,
        dueAmount: membership.due_amount,
        paymentStatus: membership.payment_status,
        paymentMethod: membership.payment_method,
        lastPaymentDate: membership.last_payment_date,
        fitnessGoal: profile.fitness_goal,
        activityLevel: 'active',
        fitnessScore: profile.fitness_score,
        fitnessLevel: profile.fitness_level,
        bmi: profile.bmi,
        bodyFatPercentage: profile.body_fat_percentage,
        targetDailyCalories: profile.target_daily_calories,
        measurements: profile.measurements,
        pin: user.pin,
        medicalConditions: profile.medical_conditions,
        workoutSlot: profile.workout_slot || '06:00 AM - 07:00 AM',
        active: membership.active,
        avatarUrl: user.avatar_url,
      };
    });
  }

  getStaffMembers(): Staff[] {
    const users = this.getUsers().filter((u) => {
      const isStaffRole = u.role === 'trainer' || u.role === 'staff';
      const nameLower = (u.name || '').toLowerCase();
      const isExcluded =
        u.role === 'admin' ||
        u.id === 'usr-1' ||
        u.id === 'usr-dev' ||
        u.phone === '9826189001' ||
        u.phone === '9244249975' ||
        nameLower.includes('vaibhav') ||
        nameLower.includes('ashish dey');
      return isStaffRole && !isExcluded;
    });
    const memberships = this.getMemberships();
    const savedStaffProfiles = this.getTable<Staff>(DB_KEYS.STAFF_PROFILES, []);

    return users.map((u) => {
      const existingProfile = savedStaffProfiles.find((sp) => sp.id === u.id || sp.userId === u.id);
      const isInstructor = u.role === 'trainer';
      const assignedCount = memberships.filter((m) => {
        if (!m.is_personal_training && !m.trainer_id) return false;
        if (m.trainer_id) {
          if (m.trainer_id === u.id) return true;
          if (existingProfile && m.trainer_id === existingProfile.id) return true;
        }
        if (m.trainer_name && u.name) {
          return m.trainer_name.trim().toLowerCase() === u.name.trim().toLowerCase();
        }
        return false;
      }).length;

      if (existingProfile) {
        return {
          ...existingProfile,
          id: u.id,
          userId: u.id,
          name: u.name || existingProfile.name,
          phone: u.phone || existingProfile.phone,
          email: u.email || existingProfile.email,
          role: (u.role as 'admin' | 'trainer' | 'staff') || existingProfile.role,
          staffType: isInstructor ? 'instructor' : (existingProfile.staffType || 'regular'),
          pin: u.pin || existingProfile.pin,
          avatarUrl: u.avatar_url || existingProfile.avatarUrl,
          assignedClientsCount: assignedCount,
        };
      }

      return {
        id: u.id,
        userId: u.id,
        staffCode: `KFS-${u.id.replace('usr-', '').padStart(3, '0')}`,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role as 'admin' | 'trainer' | 'staff',
        staffType: isInstructor ? 'instructor' : 'regular',
        designation:
          u.id === 'usr-1'
            ? 'Gym Owner & Chief Director'
            : u.id === 'usr-2'
            ? 'Head Fitness Coach & PT Lead'
            : 'Front Desk & Fee Collection Executive',
        joiningDate: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        salaryMonthly: u.id === 'usr-1' ? 60000 : u.id === 'usr-2' ? 28000 : 18000,
        specialization:
          u.id === 'usr-2'
            ? ['Hypertrophy & Bodybuilding', 'Powerlifting', 'Kettlebell']
            : u.id === 'usr-3'
            ? ['Fee Management', 'Billing & Accounts', 'Desk Operations']
            : ['Gym Management', 'Operations'],
        assignedClientsCount: assignedCount,
        status: 'active',
        pin: u.pin,
        fatherName:
          u.id === 'usr-1'
            ? 'श्री लक्ष्मण कौशिक (Shri Laxman Kaushik)'
            : u.id === 'usr-2'
            ? 'श्री संतोष साहू (Shri Santosh Sahu)'
            : 'श्री दीनानाथ वर्मा (Shri Dinanath Verma)',
        dob:
          u.id === 'usr-1'
            ? '1990-05-12'
            : u.id === 'usr-2'
            ? '1994-08-14'
            : '1998-11-22',
        address:
          u.id === 'usr-1'
            ? (u.address || 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334')
            : u.id === 'usr-2'
            ? 'वार्ड क्र. 12, उपनगर कॉलोनी, स्टेडियम रोड, कांकेर (छ.ग.) - 494334'
            : 'शीतला पारा, पुराना बस डिपो, कांकेर (छ.ग.) - 494334',
        docType:
          u.id === 'usr-2'
            ? 'Master Trainer Certification & Aadhaar'
            : 'Aadhaar Card',
        docNumber:
          u.id === 'usr-1'
            ? 'XXXX-XXXX-9001'
            : u.id === 'usr-2'
            ? 'XXXX-XXXX-8902'
            : 'XXXX-XXXX-8903',
        docFileName:
          u.id === 'usr-1'
            ? 'aadhaar_vaibhav_kaushik.pdf'
            : u.id === 'usr-2'
            ? 'vikram_sahu_trainer_cert.pdf'
            : 'ramesh_verma_aadhaar_pan.pdf',
        avatarUrl: u.avatar_url,
      };
    });
  }

  addStaffUser(staffData: Omit<Staff, 'id' | 'staffCode' | 'pin' | 'userId'> & { id?: string; pin?: string }): Staff {
    const users = this.getUsers();
    const newId = staffData.id || `usr-${Date.now()}`;
    const staffCode = `KFS-${(users.filter(u => u.role === 'staff' || u.role === 'trainer').length + 1).toString().padStart(3, '0')}`;
    const pin = (staffData.pin && staffData.pin.trim().length === 4)
      ? staffData.pin.trim()
      : Math.floor(2000 + Math.random() * 8000).toString();

    const newUser: DbUser = {
      id: newId,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      password_hash: '$2a$12$defaultHashedPassword2024',
      role: staffData.role,
      created_at: new Date().toISOString(),
      pin,
      avatar_url: staffData.avatarUrl,
      address: staffData.address,
    };

    users.push(newUser);
    this.setTable(DB_KEYS.USERS, users);

    const fullStaff: Staff = {
      ...staffData,
      id: newId,
      userId: newId,
      staffCode,
      pin,
      avatarUrl: staffData.avatarUrl,
    };

    const staffProfiles = this.getTable<Staff>(DB_KEYS.STAFF_PROFILES, []);
    staffProfiles.push(fullStaff);
    this.setTable(DB_KEYS.STAFF_PROFILES, staffProfiles);

    return fullStaff;
  }

  registerMember(input: {
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    targetWeightKg?: number;
    emergencyContact: string;
    fitnessGoal: FitnessGoal;
    duration: MembershipDuration;
    hasPT: boolean;
    ptDuration?: PTPackageDuration;
    assignedTrainerId?: string;
    discountType: 'flat' | 'percentage';
    discountValue: number;
    initialPayment: number;
    paymentMethod: PaymentMethod;
    medicalConditions?: string;
    workoutSlot?: string;
    avatarUrl?: string;
    pin?: string;
  }): Member {
    const users = this.getUsers();
    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();

    const newUserId = `usr-${Date.now()}`;
    const newProfileId = `prof-${Date.now()}`;
    const newMembershipId = `msh-${Date.now()}`;

    const memberCodeNum = profiles.length + 1;
    const memberCode = `KF-2024-${String(memberCodeNum).padStart(3, '0')}`;
    const pin = (input.pin && input.pin.trim().length === 4) 
      ? input.pin.trim() 
      : String(Math.floor(1000 + Math.random() * 9000));

    const newUser: DbUser = {
      id: newUserId,
      name: input.name,
      email: input.email || `${input.phone}@kaushikfitness.com`,
      phone: input.phone,
      password_hash: '$2a$12$defaultHashedPassword2024',
      role: 'member',
      created_at: new Date().toISOString(),
      pin,
      avatar_url: input.avatarUrl,
    };
    users.unshift(newUser);
    this.setTable(DB_KEYS.USERS, users);

    const metrics = calculateFitnessMetrics(
      input.weightKg,
      input.heightCm,
      input.age,
      input.gender,
      'moderate',
      input.fitnessGoal
    );

    const newProfile: DbMemberProfile = {
      id: newProfileId,
      user_id: newUserId,
      member_code: memberCode,
      age: input.age,
      gender: input.gender,
      height: input.heightCm,
      weight: input.weightKg,
      target_weight: input.targetWeightKg,
      fitness_goal: input.fitnessGoal,
      fitness_level: metrics.fitnessLevel,
      fitness_score: metrics.fitnessScore,
      bmi: metrics.bmi,
      body_fat_percentage: metrics.bodyFatPercentage,
      target_daily_calories: metrics.targetDailyCalories,
      emergency_contact: input.emergencyContact,
      medical_conditions: input.medicalConditions,
      measurements: {
        chest: 38,
        waist: 32,
        biceps: 13,
        thighs: 21,
      },
      workout_slot: input.workoutSlot || '06:00 AM - 07:00 AM',
    };
    profiles.unshift(newProfile);
    this.setTable(DB_KEYS.MEMBER_PROFILES, profiles);

    const baseFee = MEMBERSHIP_PRICING[input.duration].price;
    const ptFee = input.hasPT && input.ptDuration && input.ptDuration !== 'none'
      ? PT_PRICING[input.ptDuration].price
      : 0;
    const subtotal = baseFee + ptFee;
    const discountApplied =
      input.discountType === 'percentage'
        ? Math.round((subtotal * input.discountValue) / 100)
        : input.discountValue;
    const totalFee = Math.max(0, subtotal - discountApplied);
    const finalPaid = Math.min(input.initialPayment, totalFee);
    const dueAmount = Math.max(0, totalFee - finalPaid);

    const joiningDate = new Date().toISOString();
    const expiryDate = calculateExpiryDate(joiningDate, input.duration);

    const assignedTrainer = users.find((u) => u.id === input.assignedTrainerId);

    const newMembership: DbMembership = {
      id: newMembershipId,
      member_id: newProfileId,
      package_type: input.duration,
      is_personal_training: input.hasPT,
      pt_duration: input.ptDuration,
      trainer_id: input.assignedTrainerId,
      trainer_name: assignedTrainer?.name,
      joining_date: joiningDate,
      expiry_date: expiryDate,
      total_fee: totalFee,
      base_fee: baseFee,
      pt_fee: ptFee,
      discount_applied: discountApplied,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      final_paid_fee: finalPaid,
      due_amount: dueAmount,
      payment_status: dueAmount === 0 ? 'paid' : (finalPaid > 0 ? 'partial' : 'pending'),
      payment_method: input.paymentMethod,
      last_payment_date: finalPaid > 0 ? joiningDate : '',
      active: true,
    };
    memberships.unshift(newMembership);
    this.setTable(DB_KEYS.MEMBERSHIPS, memberships);

    this.addBodyIndexLog({
      memberId: newProfileId,
      date: joiningDate,
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      bmi: metrics.bmi,
      chestInches: 38,
      waistInches: 32,
      bicepsInches: 13,
      thighsInches: 21,
      bodyFatPct: metrics.bodyFatPercentage,
      notes: 'Initial joining baseline stats recorded.',
    });

    // Auto-generate customized 6-day workout routine based on member body details & goal
    const autoWorkout = generateAutomaticCustomWorkout({
      memberId: newProfileId,
      memberName: input.name,
      goal: input.fitnessGoal,
      level: metrics.fitnessLevel,
      trainerId: input.assignedTrainerId,
      trainerName: assignedTrainer?.name,
    });
    this.saveMemberWorkout(autoWorkout);

    // Auto-generate customized 5-meal diet plan based on member body details & goal
    const autoDiet = generateAutomaticCustomDiet({
      memberId: newProfileId,
      memberName: input.name,
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      age: input.age,
      gender: input.gender,
      goal: input.fitnessGoal,
      dietType: 'veg',
      trainerId: input.assignedTrainerId,
      trainerName: assignedTrainer?.name,
    });
    this.saveMemberDiet(autoDiet);

    return {
      id: newProfileId,
      userId: newUserId,
      memberCode,
      name: input.name,
      phone: input.phone,
      email: newUser.email,
      age: input.age,
      gender: input.gender,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      emergencyContact: input.emergencyContact,
      joiningDate,
      membershipDuration: input.duration,
      expiryDate,
      personalTraining: input.hasPT,
      ptDuration: input.ptDuration,
      assignedTrainerId: input.assignedTrainerId,
      assignedTrainerName: assignedTrainer?.name,
      baseFee,
      ptFee,
      discountType: input.discountType,
      discountValue: input.discountValue,
      totalPayable: totalFee,
      paidAmount: finalPaid,
      dueAmount,
      paymentStatus: newMembership.payment_status,
      paymentMethod: input.paymentMethod,
      lastPaymentDate: joiningDate,
      fitnessGoal: input.fitnessGoal,
      activityLevel: 'active',
      fitnessScore: metrics.fitnessScore,
      fitnessLevel: metrics.fitnessLevel,
      bmi: metrics.bmi,
      bodyFatPercentage: metrics.bodyFatPercentage,
      targetDailyCalories: metrics.targetDailyCalories,
      pin,
      medicalConditions: input.medicalConditions,
      workoutSlot: input.workoutSlot || '06:00 AM - 07:00 AM',
      active: true,
      avatarUrl: input.avatarUrl,
    };
  }

  upsertUserFromCloud(cloudUser: Partial<DbUser> & { id: string; name?: string; phone?: string; pin?: string; avatarUrl?: string }): void {
    if (!cloudUser || !cloudUser.id) return;
    if (cloudUser.id === 'usr-1' || cloudUser.email === 'admin@kaushikfitness.com' || cloudUser.phone === '9826189001') {
      cloudUser.pin = '2343';
      cloudUser.name = 'Vaibhav Kaushik';
    }
    const users = this.getUsers();
    const existingIdx = users.findIndex(
      (u) =>
        u.id === cloudUser.id ||
        (cloudUser.phone && u.phone === cloudUser.phone) ||
        (cloudUser.pin && u.pin === cloudUser.pin && u.name.toLowerCase() === (cloudUser.name || '').toLowerCase())
    );
    const existing = existingIdx >= 0 ? users[existingIdx] : null;
    const updatedUser: DbUser = {
      id: cloudUser.id,
      name: cloudUser.name || (existing ? existing.name : 'Gym User'),
      email: cloudUser.email || (existing ? existing.email : `${cloudUser.phone || 'user'}@kaushikfitness.com`),
      phone: cloudUser.phone || (existing ? existing.phone : ''),
      password_hash: cloudUser.password_hash || (existing ? existing.password_hash : '$2a$12$defaultHashedPassword2024'),
      role: (cloudUser.role as any) || (existing ? existing.role : 'member'),
      created_at: cloudUser.created_at || (existing ? existing.created_at : new Date().toISOString()),
      pin: cloudUser.pin || (existing?.pin ? existing.pin : '1111'),
      avatar_url: cloudUser.avatar_url || cloudUser.avatarUrl || (existing ? existing.avatar_url : undefined),
      address: cloudUser.address || (existing ? existing.address : undefined),
    };
    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...updatedUser };
    } else {
      users.unshift(updatedUser);
    }
    this.setTable(DB_KEYS.USERS, users);
  }

  upsertMemberFromCloud(cloudMember: Partial<Member> & { id: string; name?: string; phone?: string; role?: string }): void {
    if (!cloudMember || !cloudMember.id) return;
    if (!cloudMember.name && !cloudMember.phone && !cloudMember.memberCode) return;

    const users = this.getUsers();
    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();

    const profileId = cloudMember.id;
    const existingProfile = profiles.find((p) => p.id === profileId || (cloudMember.memberCode && p.member_code === cloudMember.memberCode));
    const userId = cloudMember.userId || existingProfile?.user_id || (profileId.startsWith('usr-') ? profileId : `usr-${profileId.replace('prof-', '')}`);

    // 1. Upsert User
    const existingUserIdx = users.findIndex((u) => u.id === userId || (cloudMember.phone && u.phone === cloudMember.phone));
    const existingUser = existingUserIdx >= 0 ? users[existingUserIdx] : null;
    const updatedUser: DbUser = {
      id: userId,
      name: cloudMember.name || (existingUser ? existingUser.name : 'Athlete Member'),
      email: cloudMember.email || (existingUser ? existingUser.email : `${cloudMember.phone || 'member'}@kaushikfitness.com`),
      phone: cloudMember.phone || (existingUser ? existingUser.phone : ''),
      password_hash: '$2a$12$defaultHashedPassword2024',
      role: (cloudMember.role as any) || (existingUser ? existingUser.role : 'member'),
      created_at: cloudMember.joiningDate || (existingUser ? existingUser.created_at : new Date().toISOString()),
      pin: cloudMember.pin || (existingUser?.pin ? existingUser.pin : '1111'),
      avatar_url: cloudMember.avatarUrl || (existingUser ? existingUser.avatar_url : undefined),
    };
    if (existingUserIdx >= 0) {
      users[existingUserIdx] = { ...users[existingUserIdx], ...updatedUser };
    } else {
      users.unshift(updatedUser);
    }
    this.setTable(DB_KEYS.USERS, users);

    // 2. Upsert Member Profile
    const existingProfIdx = profiles.findIndex((p) => p.id === profileId);
    const updatedProfile: DbMemberProfile = {
      id: profileId,
      user_id: userId,
      member_code: cloudMember.memberCode || `KF-2024-${String(profiles.length + 1).padStart(3, '0')}`,
      age: cloudMember.age || 25,
      gender: cloudMember.gender || 'male',
      height: cloudMember.heightCm || 170,
      weight: cloudMember.weightKg || 70,
      target_weight: cloudMember.targetWeightKg,
      fitness_goal: cloudMember.fitnessGoal || 'muscle_building',
      fitness_level: cloudMember.fitnessLevel || 'Intermediate',
      fitness_score: cloudMember.fitnessScore || 80,
      bmi: cloudMember.bmi || 24,
      body_fat_percentage: cloudMember.bodyFatPercentage || 18,
      target_daily_calories: cloudMember.targetDailyCalories || 2600,
      emergency_contact: cloudMember.emergencyContact || '',
      medical_conditions: cloudMember.medicalConditions || '',
      measurements: { chest: 38, waist: 32, biceps: 13, thighs: 21 },
      workout_slot: cloudMember.workoutSlot || '06:00 AM - 07:00 AM',
    };
    if (existingProfIdx >= 0) {
      profiles[existingProfIdx] = { ...profiles[existingProfIdx], ...updatedProfile };
    } else {
      profiles.unshift(updatedProfile);
    }
    this.setTable(DB_KEYS.MEMBER_PROFILES, profiles);

    // 3. Upsert Membership
    const existingMshIdx = memberships.findIndex((m) => m.member_id === profileId);
    const updatedMembership: DbMembership = {
      id: existingMshIdx >= 0 ? memberships[existingMshIdx].id : `msh-${profileId}`,
      member_id: profileId,
      package_type: cloudMember.membershipDuration || '1_year',
      is_personal_training: !!cloudMember.personalTraining,
      pt_duration: cloudMember.ptDuration,
      trainer_id: cloudMember.assignedTrainerId,
      trainer_name: cloudMember.assignedTrainerName,
      joining_date: cloudMember.joiningDate || new Date().toISOString(),
      expiry_date: cloudMember.expiryDate || calculateExpiryDate(new Date().toISOString(), cloudMember.membershipDuration || '1_year'),
      total_fee: cloudMember.totalPayable || 9999,
      base_fee: cloudMember.baseFee || 9999,
      pt_fee: cloudMember.ptFee || 0,
      discount_applied: cloudMember.discountValue || 0,
      discount_type: cloudMember.discountType || 'flat',
      discount_value: cloudMember.discountValue || 0,
      final_paid_fee: cloudMember.paidAmount || 9999,
      due_amount: cloudMember.dueAmount || 0,
      payment_status: (cloudMember.paymentStatus as any) || 'paid',
      payment_method: cloudMember.paymentMethod || 'upi',
      last_payment_date: cloudMember.lastPaymentDate || cloudMember.joiningDate || new Date().toISOString(),
      active: cloudMember.active !== false,
    };
    if (existingMshIdx >= 0) {
      memberships[existingMshIdx] = { ...memberships[existingMshIdx], ...updatedMembership };
    } else {
      memberships.unshift(updatedMembership);
    }
    this.setTable(DB_KEYS.MEMBERSHIPS, memberships);
  }

  deleteMember(memberId: string): boolean {
    if (!memberId) return false;
    const cleanId = memberId.trim();

    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();
    const users = this.getUsers();

    // Match profile by id, or user_id, or member_code
    const targetProfile = profiles.find(
      (p) =>
        p.id === cleanId ||
        p.user_id === cleanId ||
        p.member_code === cleanId ||
        (cleanId.startsWith('prof-') && p.id === cleanId) ||
        (cleanId.startsWith('usr-') && p.user_id === cleanId) ||
        p.id.replace('prof-', '') === cleanId.replace('prof-', '').replace('mem-', '').replace('usr-', '')
    );

    const profileId = targetProfile ? targetProfile.id : cleanId;
    const userId = targetProfile ? targetProfile.user_id : (cleanId.startsWith('usr-') ? cleanId : null);

    // 1. Remove from profiles
    const updatedProfiles = profiles.filter(
      (p) =>
        p.id !== profileId &&
        p.id !== cleanId &&
        (userId ? p.user_id !== userId : true)
    );
    this.setTable(DB_KEYS.MEMBER_PROFILES, updatedProfiles);

    // 2. Remove from memberships
    const updatedMemberships = memberships.filter(
      (m) =>
        m.member_id !== profileId &&
        m.member_id !== cleanId &&
        m.id !== cleanId &&
        m.id !== `msh-${profileId}` &&
        m.id !== `msh-${cleanId}`
    );
    this.setTable(DB_KEYS.MEMBERSHIPS, updatedMemberships);

    // 3. Remove from users (NEVER delete admin or staff accounts)
    const updatedUsers = users.filter((u) => {
      if (
        u.id === 'usr-1' ||
        u.id === 'usr-dev' ||
        u.role === 'admin' ||
        u.role === 'trainer' ||
        u.role === 'staff'
      ) {
        return true;
      }
      if (userId && u.id === userId) return false;
      if (u.id === cleanId && u.role === 'member') return false;
      return true;
    });
    this.setTable(DB_KEYS.USERS, updatedUsers);

    // 4. Remove associated attendance
    const attendance = this.getTable<AttendanceRecord>(DB_KEYS.ATTENDANCE, []);
    this.setTable(
      DB_KEYS.ATTENDANCE,
      attendance.filter(
        (a: AttendanceRecord) =>
          a.userId !== profileId &&
          a.userId !== cleanId &&
          (!userId || a.userId !== userId) &&
          (!targetProfile?.member_code || a.memberCode !== targetProfile.member_code)
      )
    );

    // 5. Remove associated body logs, photos, and progress
    const bodyIndex = this.getTable<BodyIndexLog>(DB_KEYS.BODY_INDEX_LOGS, []);
    this.setTable(
      DB_KEYS.BODY_INDEX_LOGS,
      bodyIndex.filter(
        (b) =>
          b.memberId !== profileId &&
          b.memberId !== cleanId &&
          (!userId || b.memberId !== userId)
      )
    );

    const bodyPhotos = this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, []);
    this.setTable(
      DB_KEYS.BODY_PHOTOS,
      bodyPhotos.filter(
        (b) =>
          b.memberId !== profileId &&
          b.memberId !== cleanId &&
          (!userId || b.memberId !== userId)
      )
    );

    const progressLogs = this.getTable<ProgressLog>(DB_KEYS.PROGRESS_LOGS, []);
    this.setTable(
      DB_KEYS.PROGRESS_LOGS,
      progressLogs.filter(
        (p) =>
          p.memberId !== profileId &&
          p.memberId !== cleanId &&
          (!userId || p.memberId !== userId)
      )
    );

    return true;
  }

  updateStaff(id: string, staffData: Partial<Staff>): Staff | null {
    if (!id) return null;
    const cleanId = id.trim();

    const users = this.getUsers();
    const staffProfiles = this.getTable<Staff>(DB_KEYS.STAFF_PROFILES, []);

    // Find staff profile and user
    let profIdx = staffProfiles.findIndex((s) => s.id === cleanId || s.userId === cleanId);
    let userIdx = users.findIndex(
      (u) => u.id === cleanId || (profIdx >= 0 && u.id === staffProfiles[profIdx].userId)
    );

    if (userIdx < 0 && staffData.userId) {
      userIdx = users.findIndex((u) => u.id === staffData.userId);
    }
    if (userIdx < 0 && staffData.phone) {
      userIdx = users.findIndex((u) => u.phone === staffData.phone);
    }

    const matchedUser = userIdx >= 0 ? users[userIdx] : null;

    // Check if founder/developer protection applies
    const isFounder =
      cleanId === 'usr-1' ||
      cleanId === 'usr-dev' ||
      matchedUser?.id === 'usr-1' ||
      matchedUser?.id === 'usr-dev';

    // 1. Update or create staff profile
    let currentStaff: Staff;
    if (profIdx >= 0) {
      currentStaff = { ...staffProfiles[profIdx], ...staffData };
      currentStaff.id = staffProfiles[profIdx].id;
      currentStaff.userId = staffProfiles[profIdx].userId || currentStaff.id;
      staffProfiles[profIdx] = currentStaff;
    } else {
      currentStaff = {
        id: matchedUser ? matchedUser.id : cleanId,
        userId: matchedUser ? matchedUser.id : cleanId,
        staffCode: `KFS-${(users.filter((u) => u.role === 'staff' || u.role === 'trainer').length || 1).toString().padStart(3, '0')}`,
        name: staffData.name || matchedUser?.name || 'Staff Member',
        phone: staffData.phone || matchedUser?.phone || '',
        email: staffData.email || matchedUser?.email || '',
        role: staffData.role || (matchedUser?.role as any) || 'trainer',
        staffType: staffData.staffType || (matchedUser?.role === 'trainer' ? 'instructor' : 'regular'),
        designation:
          staffData.designation ||
          (matchedUser?.role === 'trainer' ? 'Gym Instructor' : 'Front Desk Executive'),
        joiningDate:
          staffData.joiningDate ||
          (matchedUser?.created_at
            ? matchedUser.created_at.split('T')[0]
            : new Date().toISOString().split('T')[0]),
        salaryMonthly: staffData.salaryMonthly || 20000,
        specialization: staffData.specialization || ['Gym Management'],
        assignedClientsCount: staffData.assignedClientsCount || 0,
        status: staffData.status || 'active',
        pin: staffData.pin || matchedUser?.pin || '1234',
        fatherName: staffData.fatherName,
        dob: staffData.dob,
        address: staffData.address || matchedUser?.address,
        bio: staffData.bio,
        docType: staffData.docType,
        docNumber: staffData.docNumber,
        docFileName: staffData.docFileName,
        docFileUrl: staffData.docFileUrl,
        avatarUrl: staffData.avatarUrl || matchedUser?.avatar_url,
      };
      staffProfiles.push(currentStaff);
    }
    this.setTable(DB_KEYS.STAFF_PROFILES, staffProfiles);

    // 2. Update user table if found
    if (userIdx >= 0) {
      const u = users[userIdx];
      users[userIdx] = {
        ...u,
        name: staffData.name !== undefined ? staffData.name : u.name,
        phone: staffData.phone !== undefined ? staffData.phone : u.phone,
        email: staffData.email !== undefined ? staffData.email : u.email,
        address: staffData.address !== undefined ? staffData.address : u.address,
        avatar_url: staffData.avatarUrl !== undefined ? staffData.avatarUrl : u.avatar_url,
        pin: staffData.pin !== undefined ? staffData.pin : u.pin,
        role: isFounder
          ? u.role
          : staffData.role ||
            (staffData.staffType === 'instructor'
              ? 'trainer'
              : staffData.staffType === 'regular'
              ? 'staff'
              : u.role),
      };
      this.setTable(DB_KEYS.USERS, users);
    }

    // 3. If trainer name changed, update memberships referencing this trainer
    if (staffData.name && (currentStaff.staffType === 'instructor' || currentStaff.role === 'trainer')) {
      const memberships = this.getMemberships();
      let changed = false;
      const updatedMemberships = memberships.map((m) => {
        if (m.trainer_id === currentStaff.id || m.trainer_id === currentStaff.userId) {
          changed = true;
          return { ...m, trainer_name: staffData.name };
        }
        return m;
      });
      if (changed) {
        this.setTable(DB_KEYS.MEMBERSHIPS, updatedMemberships);
      }
    }

    return currentStaff;
  }

  deleteStaff(id: string): boolean {
    if (!id) return false;
    const cleanId = id.trim();

    // Protect Founders & Directors
    if (cleanId === 'usr-1' || cleanId === 'staff-1' || cleanId === 'usr-dev') {
      return false;
    }

    const users = this.getUsers();
    const user = users.find((u) => u.id === cleanId);
    if (user) {
      const nameLower = (user.name || '').toLowerCase();
      if (
        user.role === 'admin' ||
        user.id === 'usr-1' ||
        user.id === 'usr-dev' ||
        user.phone === '9826189001' ||
        user.phone === '9244249975' ||
        nameLower.includes('vaibhav') ||
        nameLower.includes('ashish dey')
      ) {
        return false;
      }
    }

    // 1. Remove from staff profiles
    const staffProfiles = this.getTable<Staff>(DB_KEYS.STAFF_PROFILES, []);
    const updatedProfiles = staffProfiles.filter((s) => s.id !== cleanId && s.userId !== cleanId);
    this.setTable(DB_KEYS.STAFF_PROFILES, updatedProfiles);

    // 2. Remove from users
    const updatedUsers = users.filter((u) => u.id !== cleanId);
    this.setTable(DB_KEYS.USERS, updatedUsers);

    // 3. Unassign from any members assigned to this trainer
    const memberships = this.getMemberships();
    let memChanged = false;
    const updatedMemberships = memberships.map((m) => {
      if (m.trainer_id === cleanId) {
        memChanged = true;
        return {
          ...m,
          trainer_id: undefined,
          trainer_name: undefined,
          is_personal_training: false,
        };
      }
      return m;
    });
    if (memChanged) {
      this.setTable(DB_KEYS.MEMBERSHIPS, updatedMemberships);
    }

    // 4. Remove daily attendance & login logs for this staff
    const staffAttendance = this.getTable<StaffDailyAttendance>(DB_KEYS.STAFF_DAILY_ATTENDANCE, []);
    this.setTable(
      DB_KEYS.STAFF_DAILY_ATTENDANCE,
      staffAttendance.filter((sa) => sa.staffId !== cleanId)
    );

    const loginLogs = this.getTable<StaffLoginLog>(DB_KEYS.LOGIN_LOGS, []);
    this.setTable(
      DB_KEYS.LOGIN_LOGS,
      loginLogs.filter((l) => l.userId !== cleanId)
    );

    return true;
  }

  resetDatabase() {
    this.setTable(DB_KEYS.USERS, SEED_USERS);
    this.setTable(DB_KEYS.MEMBER_PROFILES, SEED_MEMBER_PROFILES);
    this.setTable(DB_KEYS.MEMBERSHIPS, SEED_MEMBERSHIPS);
    this.setTable(DB_KEYS.FITNESS_PLANS, SEED_FITNESS_PLANS);
    this.setTable(DB_KEYS.BODY_INDEX_LOGS, SEED_BODY_INDEX_LOGS);
    this.setTable(DB_KEYS.ENQUIRIES, SEED_ENQUIRIES);
    this.setTable(DB_KEYS.LOGIN_LOGS, SEED_LOGIN_LOGS);
    this.setTable(DB_KEYS.SALARY_PAYMENTS, INITIAL_SALARY_PAYMENTS);
    this.setTable(DB_KEYS.CUSTOM_DIETS, INITIAL_CUSTOM_DIETS);
    this.setTable(DB_KEYS.CUSTOM_WORKOUTS, INITIAL_CUSTOM_WORKOUTS);
    this.setTable(DB_KEYS.STAFF_DAILY_ATTENDANCE, INITIAL_STAFF_DAILY_ATTENDANCE);
    this.setTable(DB_KEYS.STAFF_PROFILES, []);
    localStorage.setItem(DB_KEYS.GEOFENCE_SETTINGS, JSON.stringify(DEFAULT_GYM_GEOFENCE));
    localStorage.removeItem(DB_KEYS.ATTENDANCE);
    localStorage.removeItem(DB_KEYS.TRANSACTIONS);
    localStorage.removeItem(DB_KEYS.PROGRESS_LOGS);
  }

  // Geofence Settings
  getGeofenceSettings(): GymGeofenceSettings {
    const data = localStorage.getItem(DB_KEYS.GEOFENCE_SETTINGS);
    if (!data) {
      localStorage.setItem(DB_KEYS.GEOFENCE_SETTINGS, JSON.stringify(DEFAULT_GYM_GEOFENCE));
      return DEFAULT_GYM_GEOFENCE;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_GYM_GEOFENCE;
    }
  }

  saveGeofenceSettings(settings: GymGeofenceSettings): void {
    localStorage.setItem(DB_KEYS.GEOFENCE_SETTINGS, JSON.stringify(settings));
  }

  // Staff Daily Attendance Calendar
  getStaffDailyAttendance(): StaffDailyAttendance[] {
    return this.getTable<StaffDailyAttendance>(
      DB_KEYS.STAFF_DAILY_ATTENDANCE,
      INITIAL_STAFF_DAILY_ATTENDANCE
    );
  }

  getStaffMonthlyAttendance(staffId: string, month: string): StaffDailyAttendance[] {
    return this.getStaffDailyAttendance().filter(
      (a) => a.staffId === staffId && a.date.startsWith(month)
    );
  }

  saveStaffDailyAttendance(record: StaffDailyAttendance): void {
    const records = this.getStaffDailyAttendance();
    const filtered = records.filter(
      (r) => !(r.staffId === record.staffId && r.date === record.date)
    );
    this.setTable(DB_KEYS.STAFF_DAILY_ATTENDANCE, [record, ...filtered]);
  }

  setStaffAttendanceStatus(
    staffId: string,
    staffName: string,
    staffRole: 'trainer' | 'staff' | 'admin',
    date: string,
    status: StaffAttendanceStatus,
    leaveReason?: string,
    notes?: string
  ): StaffDailyAttendance {
    const existing = this.getStaffDailyAttendance().find(
      (r) => r.staffId === staffId && r.date === date
    );

    const record: StaffDailyAttendance = {
      id: existing ? existing.id : `att-${staffRole}-${date.replace(/-/g, '')}`,
      staffId,
      staffName,
      staffRole,
      date,
      status,
      checkInTime: status === 'present' ? existing?.checkInTime || '07:00 AM' : undefined,
      checkOutTime: status === 'present' ? existing?.checkOutTime || '02:00 PM' : undefined,
      leaveReason: status === 'leave' ? leaveReason || 'आकस्मिक अवकाश (Leave)' : undefined,
      isWithinRadius: status === 'present' ? true : false,
      distanceMeters: status === 'present' ? (existing?.distanceMeters || 45) : undefined,
      notes: notes || (status === 'present' ? 'एडमिन द्वारा सत्यापित' : status === 'leave' ? leaveReason : 'अनुपस्थित'),
    };

    this.saveStaffDailyAttendance(record);
    return record;
  }

  // Geofenced Attendance Recording on Login / Logout
  recordGeofencedAttendance(
    staffId: string,
    staffName: string,
    role: 'trainer' | 'staff' | 'admin',
    action: 'login' | 'logout' = 'login',
    customCoords?: { latitude: number; longitude: number }
  ): {
    isWithinRadius: boolean;
    distanceMeters: number;
    formattedDistance: string;
    status: StaffAttendanceStatus;
    message: string;
  } {
    const settings = this.getGeofenceSettings();
    let lat = settings.latitude + 0.0003;
    let lon = settings.longitude + 0.0002;

    if (customCoords) {
      lat = customCoords.latitude;
      lon = customCoords.longitude;
    } else {
      const mode = getSimulationMode();
      if (mode === 'outside') {
        lat = settings.latitude + 0.0215;
        lon = settings.longitude + 0.0185;
      }
    }

    const check = checkGeofence(lat, lon, settings);
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const existing = this.getStaffDailyAttendance().find(
      (a) => a.staffId === staffId && a.date === todayStr
    );

    const status: StaffAttendanceStatus = check.isWithinRadius ? 'present' : 'absent';

    if (action === 'login') {
      const record: StaffDailyAttendance = {
        id: existing ? existing.id : `att-${staffId}-${todayStr.replace(/-/g, '')}`,
        staffId,
        staffName,
        staffRole: role,
        date: todayStr,
        status,
        checkInTime: existing?.checkInTime || timeStr,
        checkOutTime: existing?.checkOutTime,
        latitude: lat,
        longitude: lon,
        distanceMeters: check.distanceMeters,
        isWithinRadius: check.isWithinRadius,
        notes: check.isWithinRadius
          ? `GPS सत्यापित: उपस्थित (${check.formattedDistance})`
          : `GPS परिधि से बाहर: अनुपस्थित दर्ज (${check.formattedDistance} दूर - सीमा ${settings.radiusMeters}m)`,
      };
      this.saveStaffDailyAttendance(record);
    } else {
      const record: StaffDailyAttendance = {
        id: existing ? existing.id : `att-${staffId}-${todayStr.replace(/-/g, '')}`,
        staffId,
        staffName,
        staffRole: role,
        date: todayStr,
        status: existing ? existing.status : status,
        checkInTime: existing?.checkInTime || '09:00 AM',
        checkOutTime: timeStr,
        latitude: lat,
        longitude: lon,
        distanceMeters: check.distanceMeters,
        isWithinRadius: check.isWithinRadius,
        notes: existing?.notes ? `${existing.notes} • चेक-आउट: ${timeStr}` : `ड्यूटी चेक-आउट: ${timeStr}`,
      };
      this.saveStaffDailyAttendance(record);
    }

    const message = check.isWithinRadius
      ? `✅ GPS सत्यापित: आप जिम परिधि के अंदर हैं (${check.formattedDistance})। उपस्थिति: 'उपस्थित (Present)' दर्ज!`
      : `⚠️ GPS परिधि से बाहर: आप जिम से ${check.formattedDistance} दूर हैं (अनुमत: ${settings.radiusMeters}m)। उपस्थिति: 'अनुपस्थित (Absent)' दर्ज!`;

    return {
      isWithinRadius: check.isWithinRadius,
      distanceMeters: check.distanceMeters,
      formattedDistance: check.formattedDistance,
      status,
      message,
    };
  }

  // Salary Payments & Payroll Management
  getSalaryPayments(): SalaryPayment[] {
    return this.getTable<SalaryPayment>(DB_KEYS.SALARY_PAYMENTS, INITIAL_SALARY_PAYMENTS);
  }

  payStaffSalary(payment: Omit<SalaryPayment, 'id' | 'slipNumber'>): SalaryPayment {
    const payments = this.getSalaryPayments();
    const slipNum = `PAY-${payment.month.replace('-', '')}-${String(payments.length + 1).padStart(3, '0')}`;
    const newRecord: SalaryPayment = {
      ...payment,
      id: `sal-${Date.now()}`,
      slipNumber: slipNum,
    };

    // Remove any previous pending record for this staff and month
    const filtered = payments.filter(
      (p) => !(p.staffId === payment.staffId && p.month === payment.month)
    );
    const updated = [newRecord, ...filtered];
    this.setTable(DB_KEYS.SALARY_PAYMENTS, updated);
    return newRecord;
  }

  // Custom Diet Plans
  getCustomDietPlans(): CustomDietPlan[] {
    return this.getTable<CustomDietPlan>(DB_KEYS.CUSTOM_DIETS, INITIAL_CUSTOM_DIETS);
  }

  getMemberDiet(memberId: string): CustomDietPlan | undefined {
    const cleanId = (memberId || '').replace('mem-', '').replace('prof-', '');
    return this.getCustomDietPlans().find(
      (d) => d.memberId === memberId || (cleanId && d.memberId.replace('mem-', '').replace('prof-', '') === cleanId)
    );
  }

  saveMemberDiet(diet: CustomDietPlan): void {
    const plans = this.getCustomDietPlans();
    const cleanId = (diet.memberId || '').replace('mem-', '').replace('prof-', '');
    const filtered = plans.filter(
      (d) => d.memberId !== diet.memberId && (!cleanId || d.memberId.replace('mem-', '').replace('prof-', '') !== cleanId)
    );
    this.setTable(DB_KEYS.CUSTOM_DIETS, [diet, ...filtered]);
  }

  // Custom Workout Plans
  getCustomWorkoutPlans(): CustomWorkoutPlan[] {
    return this.getTable<CustomWorkoutPlan>(DB_KEYS.CUSTOM_WORKOUTS, INITIAL_CUSTOM_WORKOUTS);
  }

  getMemberWorkout(memberId: string): CustomWorkoutPlan | undefined {
    const cleanId = (memberId || '').replace('mem-', '').replace('prof-', '');
    return this.getCustomWorkoutPlans().find(
      (w) => w.memberId === memberId || (cleanId && w.memberId.replace('mem-', '').replace('prof-', '') === cleanId)
    );
  }

  saveMemberWorkout(workout: CustomWorkoutPlan): void {
    const plans = this.getCustomWorkoutPlans();
    const cleanId = (workout.memberId || '').replace('mem-', '').replace('prof-', '');
    const filtered = plans.filter(
      (w) => w.memberId !== workout.memberId && (!cleanId || w.memberId.replace('mem-', '').replace('prof-', '') !== cleanId)
    );
    this.setTable(DB_KEYS.CUSTOM_WORKOUTS, [workout, ...filtered]);
  }

  // ===============================================================
  // SUPPLEMENT INVENTORY & POS SYSTEM
  // ===============================================================

  getSupplements(): SupplementItem[] {
    return this.getTable<SupplementItem>(DB_KEYS.SUPPLEMENTS, SEED_SUPPLEMENTS);
  }

  saveSupplement(item: SupplementItem): SupplementItem {
    const all = this.getSupplements();
    const idx = all.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      all[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      all.push({ ...item, updatedAt: new Date().toISOString() });
    }
    this.setTable(DB_KEYS.SUPPLEMENTS, all);
    return item;
  }

  addSupplementStock(id: string, qty: number, newCostPrice?: number): SupplementItem {
    const all = this.getSupplements();
    const item = all.find((s) => s.id === id);
    if (!item) throw new Error('Supplement not found');
    item.stockQuantity = Math.max(0, item.stockQuantity + qty);
    if (newCostPrice !== undefined && newCostPrice > 0) {
      item.costPrice = newCostPrice;
    }
    item.updatedAt = new Date().toISOString();
    this.setTable(DB_KEYS.SUPPLEMENTS, all);
    return item;
  }

  getSupplementSales(): SupplementSaleTransaction[] {
    return this.getTable<SupplementSaleTransaction>(DB_KEYS.SUPPLEMENT_SALES, SEED_SUPPLEMENT_SALES).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  recordSupplementSale(sale: Omit<SupplementSaleTransaction, 'id' | 'invoiceNumber'>): SupplementSaleTransaction {
    const sales = this.getSupplementSales();
    const supplements = this.getSupplements();
    const targetItem = supplements.find((s) => s.id === sale.supplementId);

    if (targetItem) {
      targetItem.stockQuantity = Math.max(0, targetItem.stockQuantity - sale.quantity);
      targetItem.updatedAt = new Date().toISOString();
      this.setTable(DB_KEYS.SUPPLEMENTS, supplements);
    }

    const saleNumber = sales.length + 1;
    const newSale: SupplementSaleTransaction = {
      ...sale,
      id: `sale-${Date.now()}`,
      invoiceNumber: `SUP-2026-${String(saleNumber).padStart(3, '0')}`,
    };

    sales.unshift(newSale);
    this.setTable(DB_KEYS.SUPPLEMENT_SALES, sales);
    return newSale;
  }

  // ===============================================================
  // UNIVERSAL PIN MANAGEMENT (Admin can change anyone's PIN)
  // ===============================================================

  updateUserPin(userIdOrMemberId: string, newPin: string): boolean {
    if (!newPin || newPin.trim().length !== 4) return false;
    const cleanPin = newPin.trim();

    // 1. Update in users table
    const users = this.getUsers();
    let targetUser = users.find((u) => u.id === userIdOrMemberId);

    if (!targetUser) {
      // Check if it's a member profile ID or member code
      const profiles = this.getMemberProfiles();
      const prof = profiles.find((p) => p.id === userIdOrMemberId || p.member_code === userIdOrMemberId);
      if (prof) {
        targetUser = users.find((u) => u.id === prof.user_id);
      }
    }

    if (targetUser) {
      targetUser.pin = cleanPin;
      this.setTable(DB_KEYS.USERS, users);
      return true;
    }

    return false;
  }

  // ===============================================================
  // MEMBER REACTIVATION / UNLOCK (Admin can reactivate expired members)
  // ===============================================================

  reactivateMember(memberId: string, duration: MembershipDuration, customExpiryDate?: string): Member {
    const memberships = this.getMemberships();
    const profiles = this.getMemberProfiles();
    const prof = profiles.find((p) => p.id === memberId);
    if (!prof) throw new Error('Member profile not found');

    const msh = memberships.find((m) => m.member_id === prof.id);
    const newExpiry = customExpiryDate || calculateExpiryDate(new Date().toISOString(), duration);

    if (msh) {
      msh.active = true;
      msh.package_type = duration;
      msh.expiry_date = newExpiry;
      msh.payment_status = 'paid';
      msh.due_amount = 0;
      msh.last_payment_date = new Date().toISOString();
      this.setTable(DB_KEYS.MEMBERSHIPS, memberships);
    }

    const members = this.getJoinedMembers();
    const updated = members.find((m) => m.id === memberId);
    if (!updated) throw new Error('Updated member not found');
    return updated;
  }

  exportJsonDump(): string {
    const data = {
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      database: 'kaushik_fitness_kanker_db',
      tables: {
        users: this.getUsers(),
        member_profiles: this.getMemberProfiles(),
        memberships: this.getMemberships(),
        fitness_plans: this.getFitnessPlans(),
        body_index_logs: this.getTable(DB_KEYS.BODY_INDEX_LOGS, SEED_BODY_INDEX_LOGS),
        enquiries: this.getEnquiries(),
        staff_login_logs: this.getStaffLoginLogs(),
      },
    };
    return JSON.stringify(data, null, 2);
  }

  exportSqlDump(): string {
    const now = new Date().toISOString();
    let sql = `-- ================================================================\n`;
    sql += `-- KAUSHIK FITNESS KANKER - LOCAL POSTGRESQL / MYSQL SCHEMA DUMP\n`;
    sql += `-- Exported at: ${now}\n`;
    sql += `-- Database Engine: Relational LocalStorage Engine\n`;
    sql += `-- ================================================================\n\n`;

    sql += `-- Table: users\n`;
    this.getUsers().forEach((u) => {
      sql += `INSERT INTO users (id, name, email, phone, role, pin, created_at) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.phone}', '${u.role}', '${u.pin}', '${u.created_at}');\n`;
    });

    sql += `\n-- Table: member_profiles\n`;
    this.getMemberProfiles().forEach((p) => {
      sql += `INSERT INTO member_profiles (id, user_id, member_code, age, gender, height, weight, target_weight, fitness_goal, bmi, body_fat_percentage) VALUES ('${p.id}', '${p.user_id}', '${p.member_code}', ${p.age}, '${p.gender}', ${p.height}, ${p.weight}, ${p.target_weight || 'NULL'}, '${p.fitness_goal}', ${p.bmi}, ${p.body_fat_percentage});\n`;
    });

    sql += `\n-- Table: memberships\n`;
    this.getMemberships().forEach((m) => {
      sql += `INSERT INTO memberships (id, member_id, package_type, is_personal_training, total_fee, final_paid_fee, due_amount, payment_status, joining_date, expiry_date) VALUES ('${m.id}', '${m.member_id}', '${m.package_type}', ${m.is_personal_training}, ${m.total_fee}, ${m.final_paid_fee}, ${m.due_amount}, '${m.payment_status}', '${m.joining_date}', '${m.expiry_date}');\n`;
    });

    sql += `\n-- Table: staff_login_logs\n`;
    this.getStaffLoginLogs().forEach((l) => {
      sql += `INSERT INTO staff_login_logs (id, user_id, user_name, role, login_time, login_method, status) VALUES ('${l.id}', '${l.userId}', '${l.userName.replace(/'/g, "''")}', '${l.role}', '${l.loginTime}', '${l.loginMethod}', '${l.status}');\n`;
    });

    return sql;
  }
}

export const localDb = new LocalGymDatabase();
