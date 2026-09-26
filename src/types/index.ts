// Type definitions for Kaushik Fitness Kanker Gym Management System
// Structured according to the Technical Blueprint Schema

export type UserRole = 'admin' | 'trainer' | 'staff' | 'member';

export type StaffType = 'instructor' | 'regular';

export type MembershipDuration = '1_month' | '3_months' | '6_months' | '1_year' | (string & {});

export type PTPackageDuration = '1_month' | '3_months' | '6_months' | 'none' | (string & {});

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'due';

export type PaymentMethod = 'upi' | 'cash' | 'card' | 'netbanking';

export type Gender = 'male' | 'female' | 'other';

export type FitnessGoal = 'weight_loss' | 'muscle_building' | 'general_fitness' | 'lean_bulk' | 'endurance';

export type AttendanceType = 'member' | 'staff';

// ===============================================================
// CORE DATABASE SCHEMA TABLES (Matches Blueprint)
// ===============================================================

export interface DbUser {
  id: string; // Primary Key
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  avatar_url?: string;
  pin: string; // 4-digit PIN for entrance check-in (replaces QR)
  address?: string;
}

export interface DbMemberProfile {
  id: string; // Primary Key
  user_id: string; // Foreign Key referencing users.id
  member_code: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  target_weight?: number;
  fitness_goal: FitnessGoal;
  fitness_level: 'Beginner' | 'Intermediate' | 'Athletic' | 'Elite';
  fitness_score: number;
  bmi: number;
  body_fat_percentage?: number;
  target_daily_calories?: number;
  emergency_contact: string;
  medical_conditions?: string;
  measurements?: {
    chest: number;
    waist: number;
    biceps: number;
    thighs: number;
    hips?: number;
  };
  workout_slot?: string;
}

export interface DbMembership {
  id: string; // Primary Key
  member_id: string; // Foreign Key referencing member_profiles.id
  package_type: MembershipDuration;
  is_personal_training: boolean;
  pt_duration?: PTPackageDuration;
  trainer_id?: string;
  trainer_name?: string;
  joining_date: string;
  expiry_date: string;
  total_fee: number;
  base_fee: number;
  pt_fee: number;
  discount_applied: number;
  discount_type?: 'flat' | 'percentage';
  discount_value?: number;
  final_paid_fee: number;
  due_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  last_payment_date: string;
  active: boolean;
}

export interface DbFitnessPlan {
  id: string;
  goal_type: FitnessGoal;
  title: string;
  description: string;
  workout_chart: WorkoutDay[];
  diet_chart: MealItem[];
}

// ===============================================================
// GYM MEMBERSHIP PLANS & PERSONAL TRAINING PACKAGES (CRUD)
// ===============================================================

export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  badge?: string;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PTPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  badge?: string;
  sessionsPerWeek?: number;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===============================================================
// BODY INDEX & MEASUREMENT CHANGES
// ===============================================================

export interface BodyIndexLog {
  id: string;
  memberId: string;
  date: string; // ISO date
  weightKg: number;
  heightCm: number;
  bmi: number;
  chestInches: number;
  waistInches: number;
  bicepsInches: number;
  thighsInches: number;
  hipsInches?: number;
  bodyFatPct?: number;
  notes?: string;
}

// ===============================================================
// 4-SIDE BODY PHOTO PROGRESS & COMPARISON MODEL
// ===============================================================

export interface BodyPhotoLog {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  notes?: string;
  frontPhotoUrl?: string; // Base64 data URL or SVG/image URL
  backPhotoUrl?: string;
  leftPhotoUrl?: string;
  rightPhotoUrl?: string;
  createdAt: string;
}

// ===============================================================
// GYM ENQUIRY & LEADS MODEL
// ===============================================================

export type EnquiryStatus = 'new' | 'contacted' | 'trial_scheduled' | 'joined' | 'closed';

export interface GymEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fitnessGoal: FitnessGoal;
  interestedPackage: MembershipDuration;
  wantsPersonalTraining: boolean;
  preferredTiming: 'Morning (6:00 AM - 9:00 AM)' | 'Afternoon (11:00 AM - 3:00 PM)' | 'Evening (5:00 PM - 9:30 PM)';
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
  followUpNote?: string;
}

// ===============================================================
// APPLICATION & JOINED VIEW MODELS
// ===============================================================

export interface Member {
  id: string;
  userId?: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  emergencyContact: string;
  joiningDate: string;
  membershipDuration: MembershipDuration;
  expiryDate: string;
  personalTraining: boolean;
  ptDuration?: PTPackageDuration;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  workoutSlot?: string; // 1-hour schedule slot (e.g. '06:00 AM - 07:00 AM')
  
  // Financials
  baseFee: number;
  ptFee: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  totalPayable: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  lastPaymentDate: string;
  
  // Fitness Profile
  fitnessGoal: FitnessGoal;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessScore?: number;
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Athletic' | 'Elite';
  bmi?: number;
  bodyFatPercentage?: number;
  targetDailyCalories?: number;
  
  measurements?: {
    chest: number;
    waist: number;
    biceps: number;
    thighs: number;
    hips?: number;
  };
  
  pin: string; // 4-digit entry PIN
  notes?: string;
  medicalConditions?: string;
  active: boolean;
  status?: 'active' | 'expired' | 'pending' | 'expiring_soon';
  avatarUrl?: string;
}

export interface Staff {
  id: string;
  userId?: string;
  staffCode: string;
  name: string;
  phone: string;
  email: string;
  role: 'trainer' | 'staff' | 'admin';
  staffType: StaffType;
  designation: string;
  joiningDate: string;
  salaryMonthly: number;
  specialization?: string[];
  assignedClientsCount?: number;
  status: 'active' | 'on_leave' | 'inactive';
  pin: string; // 4-digit staff PIN
  bio?: string;
  fatherName?: string;
  dob?: string;
  address?: string;
  docType?: string;
  docNumber?: string;
  docFileUrl?: string;
  docFileName?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  memberId?: string;
  staffId?: string;
  token?: string;
  address?: string;
  pin?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userType: AttendanceType;
  memberCode?: string;
  staffCode?: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime?: string;
  method: 'pin'; // Purely PIN-based
}

export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: 'revenue' | 'expense';
  category: 'membership_fee' | 'pt_fee' | 'supplement_sale' | 'equipment_maintenance' | 'rent' | 'electricity' | 'staff_salary' | 'other';
  amount: number;
  memberId?: string;
  memberName?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'completed' | 'pending';
  description: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface MealItem {
  mealName: string;
  description: string;
  items: string[];
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface ProgressLog {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  chestInches?: number;
  waistInches?: number;
  bicepsInches?: number;
  thighsInches?: number;
  hipsInches?: number;
  bodyFatPercentage?: number;
  bmi?: number;
  benchPressPR?: number;
  squatPR?: number;
  deadliftPR?: number;
  notes?: string;
}

export interface StaffLoginLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  staffType?: StaffType;
  loginTime: string; // ISO string
  loginMethod: 'password' | 'pin' | 'quick_demo';
  deviceInfo?: string;
  status: 'active' | 'logged_out';
  logoutTime?: string;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: 'trainer' | 'staff' | 'admin';
  staffType?: StaffType;
  month: string; // YYYY-MM e.g. "2026-09"
  monthName: string; // e.g. "September 2026"
  baseSalary: number;
  bonusAmount?: number;
  deductions?: number;
  totalPaid: number;
  paymentDate: string; // ISO string
  paymentMethod: 'upi' | 'cash' | 'netbanking' | 'cheque';
  transactionRef?: string;
  status: 'paid' | 'pending';
  notes?: string;
  slipNumber: string;
}

export interface CustomDietPlan {
  id: string;
  memberId: string;
  memberName: string;
  trainerId: string;
  trainerName: string;
  updatedAt: string;
  dietType?: 'veg' | 'non_veg' | 'eggitarian';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: MealItem[];
  notes?: string;
}

export interface CustomWorkoutPlan {
  id: string;
  memberId: string;
  memberName: string;
  trainerId?: string;
  trainerName?: string;
  updatedAt: string;
  goal: FitnessGoal;
  level?: string;
  days: WorkoutDay[];
  notes?: string;
}

// ===============================================================
// GPS GEOFENCE & ATTENDANCE CALENDAR TYPES
// ===============================================================

export interface GymGeofenceSettings {
  latitude: number; // e.g. 20.2718 (Kanker)
  longitude: number; // e.g. 81.4932 (Kanker)
  radiusMeters: number; // Allowed boundary radius e.g. 150m
  gymAddress: string;
  isEnabled: boolean;
  allowManualSimulation: boolean; // For testing and PC browsers
}

export type StaffAttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday';

export interface StaffDailyAttendance {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: 'trainer' | 'staff' | 'admin';
  date: string; // YYYY-MM-DD
  status: StaffAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  isWithinRadius?: boolean;
  leaveReason?: string;
  notes?: string;
}

// 1-Hour Schedule Slots (Morning 5-10 AM & Evening 4-10 PM)
export const WORKOUT_SLOTS = {
  morning: [
    '05:00 AM - 06:00 AM',
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
  ],
  evening: [
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM',
    '09:00 PM - 10:00 PM',
  ],
} as const;

// ===============================================================
// SUPPLEMENTS & POS INVENTORY TYPES
// ===============================================================

export type SupplementCategory =
  | 'whey_protein'
  | 'creatine'
  | 'bcaa'
  | 'pre_workout'
  | 'mass_gainer'
  | 'vitamins'
  | 'peanut_butter'
  | 'other';

export interface SupplementItem {
  id: string;
  name: string;
  category: SupplementCategory;
  brand: string;
  costPrice: number; // ख़रीद मूल्य
  sellingPrice: number; // बिक्री मूल्य
  stockQuantity: number; // उपलब्ध स्टॉक
  unit: string; // e.g. 'Jar', 'Tub', 'Box', 'Bottle', 'Packet'
  minStockAlert: number; // चेतावनी स्तर e.g. 3
  batchNumber?: string;
  expiryDate?: string; // YYYY-MM-DD
  flavor?: string;
  weightGrams?: number;
  imageUrl?: string;
  updatedAt?: string;
}

export interface SupplementSaleTransaction {
  id: string;
  invoiceNumber: string;
  supplementId: string;
  supplementName: string;
  brand: string;
  category: SupplementCategory;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalAmount: number;
  profit: number;
  totalProfit?: number;
  date: string; // ISO string
  buyerType: 'member' | 'walk_in';
  buyerName: string;
  buyerMemberId?: string;
  buyerPhone?: string;
  paymentMethod: 'cash' | 'upi' | 'card';
  soldByStaffId: string;
  soldByStaffName: string;
  notes?: string;
}
