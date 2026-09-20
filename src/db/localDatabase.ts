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
    pin: '1001',
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
  {
    id: 'usr-2',
    name: 'Vikram Sahu',
    email: 'trainer@kaushikfitness.com',
    phone: '9826189002',
    password_hash: '$2a$12$trainerHashKanker2024',
    role: 'trainer',
    created_at: '2022-06-15T00:00:00.000Z',
    pin: '2002',
    avatar_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-3',
    name: 'Ramesh Verma',
    email: 'staff@kaushikfitness.com',
    phone: '9826189003',
    password_hash: '$2a$12$staffHashKanker2024',
    role: 'staff',
    created_at: '2023-03-10T00:00:00.000Z',
    pin: '3003',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-5',
    name: 'Rahul Sharma',
    email: 'rahul@kaushikfitness.com',
    phone: '9826112345',
    password_hash: '$2a$12$memberHashKanker2024',
    role: 'member',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    pin: '1111',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-6',
    name: 'Priya Patel',
    email: 'priya@kaushikfitness.com',
    phone: '9826123456',
    password_hash: '$2a$12$memberHashKanker2024',
    role: 'member',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    pin: '2222',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-7',
    name: 'Amit Kumar Dewangan',
    email: 'amit@kaushikfitness.com',
    phone: '9826134567',
    password_hash: '$2a$12$memberHashKanker2024',
    role: 'member',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    pin: '3333',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-8',
    name: 'Neha Singh Rajput',
    email: 'neha@kaushikfitness.com',
    phone: '9826145678',
    password_hash: '$2a$12$memberHashKanker2024',
    role: 'member',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    pin: '4444',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-9',
    name: 'Rajesh Sahu',
    email: 'rajesh@kaushikfitness.com',
    phone: '9826156789',
    password_hash: '$2a$12$memberHashKanker2024',
    role: 'member',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    pin: '5555',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
];

const SEED_MEMBER_PROFILES: DbMemberProfile[] = [
  {
    id: 'prof-1',
    user_id: 'usr-5',
    member_code: 'KF-2024-001',
    age: 26,
    gender: 'male',
    height: 178,
    weight: 78,
    target_weight: 82,
    fitness_goal: 'muscle_building',
    fitness_level: 'Athletic',
    fitness_score: 78,
    bmi: 24.6,
    body_fat_percentage: 17,
    target_daily_calories: 2850,
    emergency_contact: '9826119999 (Father)',
    medical_conditions: 'None',
    measurements: { chest: 41, waist: 32, biceps: 15.5, thighs: 23, hips: 38 },
    workout_slot: '06:00 AM - 07:00 AM',
  },
  {
    id: 'prof-2',
    user_id: 'usr-6',
    member_code: 'KF-2024-002',
    age: 24,
    gender: 'female',
    height: 163,
    weight: 59,
    target_weight: 54,
    fitness_goal: 'weight_loss',
    fitness_level: 'Intermediate',
    fitness_score: 82,
    bmi: 22.2,
    body_fat_percentage: 22,
    target_daily_calories: 1650,
    emergency_contact: '9826129999 (Mother)',
    medical_conditions: 'None',
    measurements: { chest: 34, waist: 28.5, biceps: 11.0, thighs: 22, hips: 37 },
    workout_slot: '07:00 AM - 08:00 AM',
  },
  {
    id: 'prof-3',
    user_id: 'usr-7',
    member_code: 'KF-2024-003',
    age: 28,
    gender: 'male',
    height: 175,
    weight: 72,
    target_weight: 76,
    fitness_goal: 'lean_bulk',
    fitness_level: 'Athletic',
    fitness_score: 85,
    bmi: 23.5,
    body_fat_percentage: 14.5,
    target_daily_calories: 2750,
    emergency_contact: '9826139999 (Brother)',
    medical_conditions: 'None',
    measurements: { chest: 40.5, waist: 31, biceps: 15.0, thighs: 22.5, hips: 37 },
    workout_slot: '05:00 PM - 06:00 PM',
  },
  {
    id: 'prof-4',
    user_id: 'usr-8',
    member_code: 'KF-2024-004',
    age: 29,
    gender: 'female',
    height: 167,
    weight: 58,
    target_weight: 58,
    fitness_goal: 'general_fitness',
    fitness_level: 'Intermediate',
    fitness_score: 80,
    bmi: 20.8,
    body_fat_percentage: 21,
    target_daily_calories: 1850,
    emergency_contact: '9826149999 (Spouse)',
    medical_conditions: 'None',
    measurements: { chest: 34.5, waist: 27.5, biceps: 11.8, thighs: 21.5, hips: 36.5 },
    workout_slot: '06:00 PM - 07:00 PM',
  },
  {
    id: 'prof-5',
    user_id: 'usr-9',
    member_code: 'KF-2024-005',
    age: 34,
    gender: 'male',
    height: 172,
    weight: 84,
    target_weight: 75,
    fitness_goal: 'weight_loss',
    fitness_level: 'Intermediate',
    fitness_score: 72,
    bmi: 28.4,
    body_fat_percentage: 23,
    target_daily_calories: 2100,
    emergency_contact: '9826159999 (Wife)',
    medical_conditions: 'Mild Hypertension',
    measurements: { chest: 42, waist: 36, biceps: 14.8, thighs: 24, hips: 40 },
    workout_slot: '07:00 PM - 08:00 PM',
  },
];

const SEED_MEMBERSHIPS: DbMembership[] = [
  {
    id: 'msh-1',
    member_id: 'prof-1',
    package_type: '3_months',
    is_personal_training: true,
    pt_duration: '3_months',
    trainer_id: 'usr-2',
    trainer_name: 'Vikram Sahu',
    joining_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    total_fee: 9200,
    base_fee: 3200,
    pt_fee: 6500,
    discount_applied: 500,
    discount_type: 'flat',
    discount_value: 500,
    final_paid_fee: 9200,
    due_amount: 0,
    payment_status: 'paid',
    payment_method: 'upi',
    last_payment_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'msh-2',
    member_id: 'prof-2',
    package_type: '3_months',
    is_personal_training: true,
    pt_duration: '3_months',
    trainer_id: 'usr-2',
    trainer_name: 'Vikram Sahu',
    joining_date: new Date(Date.now() - 45 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    total_fee: 9000,
    base_fee: 3200,
    pt_fee: 6500,
    discount_applied: 700,
    discount_type: 'flat',
    discount_value: 700,
    final_paid_fee: 9000,
    due_amount: 0,
    payment_status: 'paid',
    payment_method: 'upi',
    last_payment_date: new Date(Date.now() - 45 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'msh-3',
    member_id: 'prof-3',
    package_type: '6_months',
    is_personal_training: true,
    pt_duration: '6_months',
    trainer_id: 'usr-2',
    trainer_name: 'Vikram Sahu',
    joining_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 140 * 86400000).toISOString(),
    total_fee: 16800,
    base_fee: 5800,
    pt_fee: 12000,
    discount_applied: 1000,
    discount_type: 'flat',
    discount_value: 1000,
    final_paid_fee: 16800,
    due_amount: 0,
    payment_status: 'paid',
    payment_method: 'cash',
    last_payment_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'msh-4',
    member_id: 'prof-4',
    package_type: '3_months',
    is_personal_training: true,
    pt_duration: '3_months',
    trainer_id: 'usr-2',
    trainer_name: 'Vikram Sahu',
    joining_date: new Date(Date.now() - 35 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 55 * 86400000).toISOString(),
    total_fee: 9200,
    base_fee: 3200,
    pt_fee: 6500,
    discount_applied: 500,
    discount_type: 'flat',
    discount_value: 500,
    final_paid_fee: 9200,
    due_amount: 0,
    payment_status: 'paid',
    payment_method: 'upi',
    last_payment_date: new Date(Date.now() - 35 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'msh-5',
    member_id: 'prof-5',
    package_type: '3_months',
    is_personal_training: true,
    pt_duration: '3_months',
    trainer_id: 'usr-2',
    trainer_name: 'Vikram Sahu',
    joining_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    total_fee: 9000,
    base_fee: 3200,
    pt_fee: 6500,
    discount_applied: 700,
    discount_type: 'flat',
    discount_value: 700,
    final_paid_fee: 9000,
    due_amount: 0,
    payment_status: 'paid',
    payment_method: 'cash',
    last_payment_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    active: true,
  },
];

const SEED_BODY_INDEX_LOGS: BodyIndexLog[] = [
  // Rahul Sharma (prof-1)
  {
    id: 'bi-1-1',
    memberId: 'prof-1',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    weightKg: 74,
    heightCm: 178,
    bmi: 23.4,
    chestInches: 39,
    waistInches: 34,
    bicepsInches: 14.0,
    thighsInches: 22,
    hipsInches: 39,
    bodyFatPct: 20.5,
    notes: 'प्रारंभिक बेसलाइन माप - कोच विक्रम साहू।',
  },
  {
    id: 'bi-1-2',
    memberId: 'prof-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    weightKg: 78,
    heightCm: 178,
    bmi: 24.6,
    chestInches: 41,
    waistInches: 32,
    bicepsInches: 15.5,
    thighsInches: 23,
    hipsInches: 38,
    bodyFatPct: 17,
    notes: 'कमर में 2" की कमी, डोले 1.5" बढ़े। लीन मसल गेन सफल।',
  },

  // Priya Patel (prof-2)
  {
    id: 'bi-2-1',
    memberId: 'prof-2',
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    weightKg: 66,
    heightCm: 163,
    bmi: 24.8,
    chestInches: 36,
    waistInches: 32,
    bicepsInches: 11.5,
    thighsInches: 24,
    hipsInches: 40,
    bodyFatPct: 28.5,
    notes: 'पहला दिन असेसमेंट - कोच विक्रम।',
  },
  {
    id: 'bi-2-2',
    memberId: 'prof-2',
    date: new Date(Date.now() - 20 * 86400000).toISOString(),
    weightKg: 62.5,
    heightCm: 163,
    bmi: 23.5,
    chestInches: 35,
    waistInches: 30,
    bicepsInches: 11.2,
    thighsInches: 23,
    hipsInches: 38.5,
    bodyFatPct: 25,
    notes: 'मिड चेक-इन: 3.5kg फैट लॉस।',
  },
  {
    id: 'bi-2-3',
    memberId: 'prof-2',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    weightKg: 59,
    heightCm: 163,
    bmi: 22.2,
    chestInches: 34,
    waistInches: 28.5,
    bicepsInches: 11.0,
    thighsInches: 22,
    hipsInches: 37,
    bodyFatPct: 22,
    notes: 'कुल 7kg वजन कम, कमर 32" से 28.5" (-3.5 इंच)। टोन्ड बॉडी।',
  },

  // Amit Kumar Dewangan (prof-3)
  {
    id: 'bi-3-1',
    memberId: 'prof-3',
    date: new Date(Date.now() - 40 * 86400000).toISOString(),
    weightKg: 67,
    heightCm: 175,
    bmi: 21.9,
    chestInches: 38,
    waistInches: 31.5,
    bicepsInches: 13.5,
    thighsInches: 21,
    hipsInches: 36,
    bodyFatPct: 16,
    notes: 'लीन बल्क प्रोग्राम प्रारंभ।',
  },
  {
    id: 'bi-3-2',
    memberId: 'prof-3',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    weightKg: 72,
    heightCm: 175,
    bmi: 23.5,
    chestInches: 40.5,
    waistInches: 31,
    bicepsInches: 15.0,
    thighsInches: 22.5,
    hipsInches: 37,
    bodyFatPct: 14.5,
    notes: '+5kg शुद्ध मसल मास, बाइसेप्स 15 इंच।',
  },

  // Neha Singh Rajput (prof-4)
  {
    id: 'bi-4-1',
    memberId: 'prof-4',
    date: new Date(Date.now() - 35 * 86400000).toISOString(),
    weightKg: 61,
    heightCm: 167,
    bmi: 21.9,
    chestInches: 35,
    waistInches: 29.5,
    bicepsInches: 11.2,
    thighsInches: 22.5,
    hipsInches: 38,
    bodyFatPct: 26,
    notes: 'स्ट्रेंथ व कंडीशनिंग प्रारंभ।',
  },
  {
    id: 'bi-4-2',
    memberId: 'prof-4',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    weightKg: 58,
    heightCm: 167,
    bmi: 20.8,
    chestInches: 34.5,
    waistInches: 27.5,
    bicepsInches: 11.8,
    thighsInches: 21.5,
    hipsInches: 36.5,
    bodyFatPct: 21,
    notes: 'कमर में 2" की कमी, स्क्वॉट में 20kg की प्रगति।',
  },

  // Rajesh Sahu (prof-5)
  {
    id: 'bi-5-1',
    memberId: 'prof-5',
    date: new Date(Date.now() - 60 * 86400000).toISOString(),
    weightKg: 93,
    heightCm: 172,
    bmi: 31.4,
    chestInches: 44,
    waistInches: 40,
    bicepsInches: 14.5,
    thighsInches: 25.5,
    hipsInches: 43,
    bodyFatPct: 29,
    notes: 'वेट लॉस व कार्डियो स्क्रीनिंग।',
  },
  {
    id: 'bi-5-2',
    memberId: 'prof-5',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    weightKg: 88,
    heightCm: 172,
    bmi: 29.7,
    chestInches: 43,
    waistInches: 38,
    bicepsInches: 14.5,
    thighsInches: 24.5,
    hipsInches: 41.5,
    bodyFatPct: 26,
    notes: 'पहला महीना: -5kg वजन कम।',
  },
  {
    id: 'bi-5-3',
    memberId: 'prof-5',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    weightKg: 84,
    heightCm: 172,
    bmi: 28.4,
    chestInches: 42,
    waistInches: 36,
    bicepsInches: 14.8,
    thighsInches: 24,
    hipsInches: 40,
    bodyFatPct: 23,
    notes: '-9kg कुल वजन कम (-4" कमर), फिटनेस में बड़ा बदलाव।',
  },
];

const SEED_ENQUIRIES: GymEnquiry[] = [
  {
    id: 'enq-1',
    name: 'Devendra Sinha',
    phone: '9826198888',
    email: 'devendra.kanker@gmail.com',
    fitnessGoal: 'weight_loss',
    interestedPackage: '3_months',
    wantsPersonalTraining: true,
    preferredTiming: 'Morning (6:00 AM - 9:00 AM)',
    message: 'Interested in joining gym for fat loss + personal coaching with Vikram Sir.',
    status: 'new',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_BODY_PHOTO_LOGS: BodyPhotoLog[] = [
  {
    id: 'bphoto-1-1',
    memberId: 'mem-1',
    date: '2026-07-01',
    weightKg: 78.5,
    notes: 'दिन 1 बेसलाइन: जिम जॉइनिंग की शुरुआत, फैट अधिक व मसल डेफिनेशन कम।',
    frontPhotoUrl: getSeedBodyPhotoSvg('front', 'before'),
    backPhotoUrl: getSeedBodyPhotoSvg('back', 'before'),
    leftPhotoUrl: getSeedBodyPhotoSvg('left', 'before'),
    rightPhotoUrl: getSeedBodyPhotoSvg('right', 'before'),
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'bphoto-1-2',
    memberId: 'mem-1',
    date: '2026-09-19',
    weightKg: 72.8,
    notes: 'दिन 80 प्रोग्रेस: 5.7 kg फैट लॉस, चेस्ट कटिंग, 6-पैक एब्स व वी-टेपर बैक साफ दिखाई दे रहा है।',
    frontPhotoUrl: getSeedBodyPhotoSvg('front', 'after'),
    backPhotoUrl: getSeedBodyPhotoSvg('back', 'after'),
    leftPhotoUrl: getSeedBodyPhotoSvg('left', 'after'),
    rightPhotoUrl: getSeedBodyPhotoSvg('right', 'after'),
    createdAt: '2026-09-19T10:00:00.000Z',
  },
];

const SEED_FITNESS_PLANS: DbFitnessPlan[] = [
  {
    id: 'plan-1',
    goal_type: 'muscle_building',
    title: 'Hypertrophy & Strength Split',
    description: 'Targeted progressive overload workout routine and high-protein nutrition.',
    workout_chart: generateWorkoutRoutine('muscle_building'),
    diet_chart: generateDietPlan('muscle_building', 2850),
  },
];

const SEED_LOGIN_LOGS: StaffLoginLog[] = [
  {
    id: 'log-1',
    userId: 'usr-2',
    userName: 'Vikram Sahu',
    userEmail: 'trainer@kaushikfitness.com',
    role: 'trainer',
    staffType: 'instructor',
    loginTime: new Date(Date.now() - 90 * 60000).toISOString(),
    loginMethod: 'pin',
    deviceInfo: 'Duty Kiosk (PIN: 2002)',
    status: 'active',
  },
  {
    id: 'log-2',
    userId: 'usr-1',
    userName: 'Vaibhav Kaushik',
    userEmail: 'admin@kaushikfitness.com',
    role: 'admin',
    staffType: 'regular',
    loginTime: new Date(Date.now() - 180 * 60000).toISOString(),
    loginMethod: 'password',
    deviceInfo: 'Admin Console (Windows Chrome)',
    status: 'active',
  },
];

const generateInitialStaffAttendance = (): StaffDailyAttendance[] => {
  const records: StaffDailyAttendance[] = [];
  const daysInSeptember = 19;

  for (let day = 1; day <= daysInSeptember; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `2026-09-${dayStr}`;
    const dayOfWeek = new Date(2026, 8, day).getDay(); // 0 is Sunday

    // Vikram Sahu (Trainer)
    if (dayOfWeek === 0) {
      records.push({
        id: `att-tr-202609${dayStr}`,
        staffId: 'usr-2',
        staffName: 'Vikram Sahu',
        staffRole: 'trainer',
        date: dateStr,
        status: 'holiday',
        notes: 'रविवार साप्ताहिक अवकाश (Weekly Off)',
      });
    } else if (day === 10) {
      records.push({
        id: `att-tr-202609${dayStr}`,
        staffId: 'usr-2',
        staffName: 'Vikram Sahu',
        staffRole: 'trainer',
        date: dateStr,
        status: 'leave',
        leaveReason: 'कैजुअल लीव (बुखार)',
        notes: 'Medical leave approved by Director',
      });
    } else {
      records.push({
        id: `att-tr-202609${dayStr}`,
        staffId: 'usr-2',
        staffName: 'Vikram Sahu',
        staffRole: 'trainer',
        date: dateStr,
        status: 'present',
        checkInTime: '06:30 AM',
        checkOutTime: '01:30 PM',
        latitude: 20.2721,
        longitude: 81.4934,
        distanceMeters: 45,
        isWithinRadius: true,
        notes: 'ड्यूटी सत्यापित (In-Radius 45m)',
      });
    }

    // Ramesh Verma (Staff)
    if (dayOfWeek === 0) {
      records.push({
        id: `att-st-202609${dayStr}`,
        staffId: 'usr-3',
        staffName: 'Ramesh Verma',
        staffRole: 'staff',
        date: dateStr,
        status: 'holiday',
        notes: 'रविवार साप्ताहिक अवकाश (Weekly Off)',
      });
    } else if (day === 15) {
      records.push({
        id: `att-st-202609${dayStr}`,
        staffId: 'usr-3',
        staffName: 'Ramesh Verma',
        staffRole: 'staff',
        date: dateStr,
        status: 'leave',
        leaveReason: 'पारिवारिक कार्य (Approved Leave)',
        notes: 'Approved family work leave',
      });
    } else {
      records.push({
        id: `att-st-202609${dayStr}`,
        staffId: 'usr-3',
        staffName: 'Ramesh Verma',
        staffRole: 'staff',
        date: dateStr,
        status: 'present',
        checkInTime: '08:00 AM',
        checkOutTime: '06:00 PM',
        latitude: 20.2720,
        longitude: 81.4933,
        distanceMeters: 35,
        isWithinRadius: true,
        notes: 'फ्रंट डेस्क काउंटर ड्यूटी सत्यापित (In-Radius 35m)',
      });
    }
  }

  return records;
};

const INITIAL_STAFF_DAILY_ATTENDANCE: StaffDailyAttendance[] = generateInitialStaffAttendance();

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

const SEED_SUPPLEMENT_SALES: SupplementSaleTransaction[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'SUP-2026-001',
    supplementId: 'sup-1',
    supplementName: 'ON Gold Standard 100% Whey Protein (2 kg)',
    brand: 'Optimum Nutrition',
    category: 'whey_protein',
    quantity: 1,
    unitPrice: 6500,
    costPrice: 5200,
    totalAmount: 6500,
    profit: 1300,
    date: '2026-09-17T11:30:00.000Z',
    buyerType: 'member',
    buyerName: 'Rahul Sharma',
    buyerMemberId: 'prof-1',
    buyerPhone: '9826112345',
    paymentMethod: 'upi',
    soldByStaffId: 'usr-3',
    soldByStaffName: 'Ramesh Verma',
    notes: 'Member purchase, paid via GooglePay UPI',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'SUP-2026-002',
    supplementId: 'sup-2',
    supplementName: 'MuscleBlaze Micronized Creatine Monohydrate (250g)',
    brand: 'MuscleBlaze',
    category: 'creatine',
    quantity: 1,
    unitPrice: 1199,
    costPrice: 850,
    totalAmount: 1199,
    profit: 349,
    date: '2026-09-18T16:45:00.000Z',
    buyerType: 'member',
    buyerName: 'Amit Verma',
    buyerMemberId: 'prof-3',
    buyerPhone: '9826139999',
    paymentMethod: 'cash',
    soldByStaffId: 'usr-3',
    soldByStaffName: 'Ramesh Verma',
    notes: 'PT Client direct purchase',
  },
  {
    id: 'sale-3',
    invoiceNumber: 'SUP-2026-003',
    supplementId: 'sup-6',
    supplementName: 'MyFitness High Protein Peanut Butter Chocolate (1 kg)',
    brand: 'MyFitness',
    category: 'peanut_butter',
    quantity: 2,
    unitPrice: 599,
    costPrice: 420,
    totalAmount: 1198,
    profit: 358,
    date: '2026-09-19T09:15:00.000Z',
    buyerType: 'walk_in',
    buyerName: 'Suresh Kumar Dewangan',
    buyerPhone: '9826198765',
    paymentMethod: 'upi',
    soldByStaffId: 'usr-3',
    soldByStaffName: 'Ramesh Verma',
    notes: 'Walk-in buyer from Kanker town',
  },
];

// ===============================================================
// LOCAL DATABASE SERVICE CLASS
// ===============================================================

class LocalGymDatabase {
  constructor() {
    this.checkAndMigrate();
  }

  private checkAndMigrate() {
    try {
      // Auto-migrate admin user name to Vaibhav Kaushik and add address
      const rawUsers = localStorage.getItem(DB_KEYS.USERS);
      if (rawUsers) {
        try {
          const users: DbUser[] = JSON.parse(rawUsers);
          let changed = false;
          users.forEach((u) => {
            if (u.id === 'usr-1' && (u.name === 'Koushik Patel' || !u.address)) {
              u.name = 'Vaibhav Kaushik';
              if (!u.address) u.address = 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334';
              changed = true;
            }
          });

          const hasDev = users.some((u) => u.id === 'usr-dev' || u.pin === '9975');
          if (!hasDev) {
            users.push({
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
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Local database migration notice:', e);
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
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users
  getUsers(): DbUser[] {
    return this.getTable<DbUser>(DB_KEYS.USERS, SEED_USERS);
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

  getBodyPhotoLogs(memberId: string): BodyPhotoLog[] {
    const all = this.getTable<BodyPhotoLog>(DB_KEYS.BODY_PHOTOS, SEED_BODY_PHOTO_LOGS);
    const cleanId = (memberId || '').replace('mem-', '').replace('prof-', '');
    return all
      .filter((l) => l.memberId === memberId || (cleanId && l.memberId.replace('mem-', '').replace('prof-', '') === cleanId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  saveBodyPhotoLog(log: Omit<BodyPhotoLog, 'id' | 'createdAt'> & { id?: string }): BodyPhotoLog {
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
          createdAt: new Date().toISOString(),
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

      const trainer = users.find((u) => u.id === membership.trainer_id);

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
        assignedTrainerId: membership.trainer_id,
        assignedTrainerName: trainer ? trainer.name : membership.trainer_name,
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
    const users = this.getUsers().filter((u) => u.role === 'admin' || u.role === 'trainer' || u.role === 'staff');
    const memberships = this.getMemberships();

    return users.map((u) => {
      const assignedCount = memberships.filter((m) => m.trainer_id === u.id).length;
      const isInstructor = u.role === 'trainer';

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
        joiningDate: u.created_at.split('T')[0],
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
    const pin = staffData.pin || Math.floor(2000 + Math.random() * 8000).toString();

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
    };

    users.push(newUser);
    this.setTable(DB_KEYS.USERS, users);

    return {
      ...staffData,
      id: newId,
      userId: newId,
      staffCode,
      pin,
      avatarUrl: staffData.avatarUrl,
    };
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
  }): Member {
    const users = this.getUsers();
    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();

    const newUserId = `usr-${Date.now()}`;
    const newProfileId = `prof-${Date.now()}`;
    const newMembershipId = `msh-${Date.now()}`;

    const memberCodeNum = profiles.length + 1;
    const memberCode = `KF-2024-${String(memberCodeNum).padStart(3, '0')}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));

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

  upsertMemberFromCloud(cloudMember: Partial<Member> & { id: string; name?: string; phone?: string }): void {
    if (!cloudMember || !cloudMember.id) return;
    if (!cloudMember.name && !cloudMember.phone && !cloudMember.memberCode) return;

    const users = this.getUsers();
    const profiles = this.getMemberProfiles();
    const memberships = this.getMemberships();

    const profileId = cloudMember.id;
    const existingProfile = profiles.find((p) => p.id === profileId || (cloudMember.memberCode && p.member_code === cloudMember.memberCode));
    const userId = cloudMember.userId || existingProfile?.user_id || `usr-${profileId.replace('prof-', '')}`;

    // 1. Upsert User
    const existingUserIdx = users.findIndex((u) => u.id === userId || (cloudMember.phone && u.phone === cloudMember.phone));
    const updatedUser: DbUser = {
      id: userId,
      name: cloudMember.name || 'Athlete Member',
      email: cloudMember.email || `${cloudMember.phone || 'member'}@kaushikfitness.com`,
      phone: cloudMember.phone || '',
      password_hash: '$2a$12$defaultHashedPassword2024',
      role: 'member',
      created_at: cloudMember.joiningDate || new Date().toISOString(),
      pin: cloudMember.pin || '1111',
      avatar_url: cloudMember.avatarUrl,
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
