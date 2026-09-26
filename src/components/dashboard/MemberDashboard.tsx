import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatDate, MEMBERSHIP_PRICING, PT_PRICING } from '../../utils/formatters';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import { InvoiceModal } from '../common/InvoiceModal';
import { BodyVisualizer3D } from '../fitness/BodyVisualizer3D';
import { BodyIndexTracker } from '../members/BodyIndexTracker';
import { generateWorkoutRoutine, generateDietPlan } from '../../utils/fitnessCalculator';
import { localDb } from '../../db/localDatabase';
import { CustomDietPlan } from '../../types';
import {
  User,
  Clock,
  KeyRound,
  Activity,
  Dumbbell,
  Utensils,
  Receipt,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  MessageSquare,
  Flame,
  Calendar,
  Phone,
  Scale,
  Zap,
  ChevronRight,
  Heart,
  Droplets,
  Check,
  Lock,
  Edit3,
  Ruler,
  X,
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigate: (tab: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { members, updateMember } = useGymData();

  const fallbackMember: any = {
    id: currentUser?.memberId || 'mem-1',
    userId: currentUser?.id || 'usr-5',
    name: currentUser?.name || 'Rahul Sharma',
    phone: currentUser?.phone || '9826112345',
    email: currentUser?.email || 'member@kaushikfitness.com',
    memberCode: 'KF-2024-001',
    membershipPlan: 'gold',
    joinDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    fitnessGoal: 'muscle_building',
    heightCm: 172,
    weightKg: 70,
    targetWeightKg: 75,
    bmi: 23.7,
    active: true,
    status: 'active',
  };

  // Find active member info
  const member =
    (members && members.length > 0
      ? members.find((m) => m.id === currentUser?.memberId) || members[0]
      : null) || fallbackMember;

  const isMemberExpired = member?.expiryDate
    ? new Date(member.expiryDate).getTime() < Date.now() || member.status === 'expired' || !member.active
    : false;

  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'diet' | 'pass' | 'body_index' | 'receipt' | '3d'>('home');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<number>(0);

  // Editable Physical Stats State (Height, Weight, Target Weight)
  const [isEditStatsModalOpen, setIsEditStatsModalOpen] = useState(false);
  const [editHeight, setEditHeight] = useState<number>(() => member?.heightCm || 172);
  const [editWeight, setEditWeight] = useState<number>(() => member?.weightKg || 70);
  const [editTargetWeight, setEditTargetWeight] = useState<number>(() => member?.targetWeightKg || 75);
  const [statsSavedToast, setStatsSavedToast] = useState<string | null>(null);

  const handleOpenEditStats = () => {
    setEditHeight(member?.heightCm || 172);
    setEditWeight(member?.weightKg || 70);
    setEditTargetWeight(member?.targetWeightKg || 75);
    setIsEditStatsModalOpen(true);
  };

  const handleSaveMemberStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.id) return;
    const h = Number(editHeight) || 172;
    const w = Number(editWeight) || 70;
    const tw = Number(editTargetWeight) || 75;
    const newBmi = Number((w / Math.pow(h / 100, 2)).toFixed(1));

    updateMember(member.id, {
      heightCm: h,
      weightKg: w,
      targetWeightKg: tw,
      bmi: newBmi,
    });

    setIsEditStatsModalOpen(false);
    setStatsSavedToast(`✅ शारीरिक माप (ऊंचाई: ${h}cm, वर्तमान वजन: ${w}kg, लक्ष्य वजन: ${tw}kg) सफलतापूर्वक अपडेट हो गया!`);
    setTimeout(() => setStatsSavedToast(null), 4500);
  };

  // Pre-generate custom workouts and diet
  const customWorkout = member?.id ? localDb.getMemberWorkout(member.id) : undefined;
  const workoutDays = customWorkout && customWorkout.days && customWorkout.days.length > 0
    ? customWorkout.days
    : generateWorkoutRoutine(member?.fitnessGoal || 'muscle_building');
  const customDiet = member?.id ? localDb.getMemberDiet(member.id) : undefined;
  const dietMeals = customDiet && customDiet.meals && customDiet.meals.length > 0
    ? customDiet.meals
    : generateDietPlan(member?.fitnessGoal || 'muscle_building', member?.targetDailyCalories || 2600);

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      {/* 0. EXPIRED NOTICE BANNER (if expired) */}
      {isMemberExpired && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-base">
                  आपकी सदस्यता समाप्त हो चुकी है (Membership Expired)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-mono">
                  वैधता तिथि: {formatDate(member.expiryDate)}
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                जिम सुरक्षा नियमों के अनुसार आपका <strong>4-अंकीय कियोस्क एंट्री पिन अक्षम (Disabled)</strong> कर दिया गया है। कृपया सदस्यता रिन्यू कराने हेतु संपर्क करें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <a
              href={`https://wa.me/919826123456?text=${encodeURIComponent(
                `नमस्ते एडमिन, मेरी सदस्यता (${member.memberCode} - ${member.name}) समाप्त हो गई है, कृपया मेरी सदस्यता रिन्यू एवं सक्रिय (Activate) करें।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp रिन्यूअल</span>
            </a>
          </div>
        </div>
      )}

      {/* 1. HERO BANNER: Member Profile & Active Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-300 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center text-2xl font-black text-cyan-800 shadow-sm">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                isMemberExpired ? 'bg-rose-500' : 'bg-emerald-500'
              }`}>
                {isMemberExpired ? <Lock className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white stroke-[3]" />}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isMemberExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
                    <Lock className="w-3 h-3 text-rose-600" />
                    सदस्यता समाप्त (Expired & Locked)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Member (सक्रिय सदस्य)
                  </span>
                )}
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {member.memberCode}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {member.name}
              </h1>

              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Plan: <strong className="text-slate-800">{MEMBERSHIP_PRICING[member.membershipDuration]?.label}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Goal: <strong className="text-cyan-700 capitalize">{member.fitnessGoal.replace('_', ' ')}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('pass')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Mera Gym PIN Pass
            </button>

            <button
              onClick={() => setActiveTab('body_index')}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase shadow-sm transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              4-साइड फोटो व नाप (Photos)
            </button>

            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-sm transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              Receipt / Bill
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME MEMBERSHIP EXPIRATION COUNTDOWN CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-cyan-600 animate-spin-slow" />
              Membership Expiry Countdown (सदस्यता समाप्ति उलटी गिनती)
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Valid until: <strong className="text-slate-800">{formatDate(member.expiryDate)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Full Access Unlocked
            </span>
          </div>
        </div>

        {/* Live Countdown Display */}
        <ExpirationCountdown expiryDate={member.expiryDate} variant="card" />
      </div>

      {/* 3. SIMPLIFIED TAB NAVIGATION */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none gap-1.5">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Dashboard (डैशबोर्ड)</span>
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'workout'
              ? 'bg-white text-cyan-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-cyan-600" />
          <span>Workout (व्यायाम)</span>
        </button>

        <button
          onClick={() => setActiveTab('diet')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diet'
              ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Utensils className="w-4 h-4 text-emerald-600" />
          <span>Diet Chart (डाइट)</span>
        </button>

        <button
          onClick={() => setActiveTab('pass')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pass'
              ? 'bg-white text-cyan-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <KeyRound className="w-4 h-4 text-cyan-600" />
          <span>PIN Pass (पिन)</span>
        </button>

        <button
          onClick={() => setActiveTab('body_index')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'body_index'
              ? 'bg-white text-purple-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-600" />
          <span>Body Index (बदलाव)</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'receipt'
              ? 'bg-white text-amber-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-600" />
          <span>Fees (फीस)</span>
        </button>

        <button
          onClick={() => setActiveTab('3d')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === '3d'
              ? 'bg-white text-cyan-800 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>3D Body (अवतार)</span>
        </button>
      </div>

      {/* TAB 1: HOME (Simple, Visual, Friendly) */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* TOAST ON MEASUREMENT UPDATE */}
          {statsSavedToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{statsSavedToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatsSavedToast(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* PHYSICAL MEASUREMENTS HERO BANNER & STATS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    शारीरिक माप एवं फिटनेस लक्ष्य (Physical Stats: Height, Weight & Target)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    आपकी ऊंचाई, वर्तमान वजन, लक्ष्य वजन और बीएमआई का लाइव व्यक्तिगत ट्रैकर
                  </p>
                </div>
              </div>

              {/* Edit Measurements Action Button */}
              <button
                type="button"
                onClick={handleOpenEditStats}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                <span>ऊंचाई व वजन बदलें / अपडेट करें</span>
              </button>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Height */}
              <div
                onClick={handleOpenEditStats}
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/60 to-white border border-cyan-200/80 shadow-xs flex flex-col justify-between hover:border-cyan-400 transition-all cursor-pointer group"
                title="ऊंचाई बदलने के लिए क्लिक करें"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase font-bold text-slate-500">ऊंचाई (Height)</span>
                  <Ruler className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                  {member.heightCm || 172} <span className="text-xs font-normal text-slate-400">cm</span>
                </div>
                <div className="text-[11px] text-cyan-700 mt-1 font-semibold flex items-center justify-between">
                  <span>~{((member.heightCm || 172) / 30.48).toFixed(1)} Feet</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-cyan-700">✏️ बदलें</span>
                </div>
              </div>

              {/* 2. Current Weight */}
              <div
                onClick={handleOpenEditStats}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all cursor-pointer group"
                title="वर्तमान वजन बदलने के लिए क्लिक करें"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase font-bold text-slate-500">वर्तमान वजन (Wt)</span>
                  <Scale className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                  {member.weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1 font-semibold flex items-center justify-between">
                  <span>BMI: {member.bmi || (member.heightCm ? (member.weightKg / Math.pow(member.heightCm / 100, 2)).toFixed(1) : 24.6)}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-amber-700">✏️ बदलें</span>
                </div>
              </div>

              {/* 3. Target Weight */}
              <div
                onClick={handleOpenEditStats}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all cursor-pointer group"
                title="लक्ष्य वजन बदलने के लिए क्लिक करें"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase font-bold text-slate-500">लक्ष्य वजन (Target)</span>
                  <Award className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">
                  {member.targetWeightKg || 75} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-semibold flex items-center justify-between">
                  <span>
                    {member.targetWeightKg
                      ? member.weightKg > member.targetWeightKg
                        ? `${(member.weightKg - member.targetWeightKg).toFixed(1)} kg घटाना है`
                        : member.weightKg < member.targetWeightKg
                        ? `${(member.targetWeightKg - member.weightKg).toFixed(1)} kg बढ़ाना है`
                        : 'लक्ष्य हासिल! 🎉'
                      : 'फिटनेस गोल'}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">✏️ बदलें</span>
                </div>
              </div>

              {/* 4. Daily Calories */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/60 to-white border border-orange-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase font-bold text-slate-500">दैनिक कैलोरी</span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono mt-1">
                  {member.targetDailyCalories || 2850} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  {member.fitnessGoal?.replace('_', ' ') || 'High Protein Plan'}
                </div>
              </div>
            </div>
          </div>

          {/* Trainer Card with WhatsApp Help */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50 via-white to-cyan-50/50 border border-cyan-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center font-black text-cyan-800 text-lg shadow-sm">
                PT
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">
                  Aapke Personal Gym Trainer (Coaching)
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {member.assignedTrainerName || 'Coach Vikram Sahu'}
                </h3>
                <p className="text-xs text-slate-500">
                  {member.personalTraining ? `Package: ${PT_PRICING[member.ptDuration || '3_months']?.label}` : 'Gym Floor Support Coach'}
                </p>
              </div>
            </div>

            <a
              href={`https://api.whatsapp.com/send?phone=919826189002&text=${encodeURIComponent(
                `Namaste Coach Vikram! Mera naam ${member.name} hai (KF Code: ${member.memberCode}). Mujhe workout/diet ke baare me poochna hai.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Par Coach Se Baat Karein
            </a>
          </div>

          {/* Today's Workout Sneak Peek */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Aaj Ka Schedule ({todayDayName})
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {workoutDays[0]?.dayName || 'Push Day: Chest, Shoulders & Triceps'}
                </h3>
              </div>

              <button
                onClick={() => setActiveTab('workout')}
                className="text-xs text-cyan-700 hover:text-cyan-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Pura Routine Dekhein &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workoutDays[0]?.exercises.slice(0, 3).map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleExercise(ex.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    completedExercises[ex.id]
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      completedExercises[ex.id] ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {completedExercises[ex.id] ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{ex.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ex.sets} Sets • {ex.reps} Reps
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {ex.targetMuscle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT (Simple & Clear Exercise List) */}
      {activeTab === 'workout' && (
        <div className="space-y-5">
          {/* Day Selector Pill Bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {workoutDays.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWorkoutDay(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  selectedWorkoutDay === idx
                    ? 'bg-cyan-600 text-white shadow-sm font-black'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Day {idx + 1}: {day.focus}
              </button>
            ))}
          </div>

          {/* Exercise Table with Complete/Tick functionality */}
          {workoutDays[selectedWorkoutDay] && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {workoutDays[selectedWorkoutDay].dayName}
                  </h3>
                  <p className="text-xs text-cyan-700 font-semibold">
                    Focus: {workoutDays[selectedWorkoutDay].focus}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {workoutDays[selectedWorkoutDay].exercises.length} Exercises
                </span>
              </div>

              <div className="space-y-2.5">
                {workoutDays[selectedWorkoutDay].exercises.map((ex, idx) => {
                  const isDone = completedExercises[ex.id];
                  return (
                    <div
                      key={ex.id || idx}
                      onClick={() => toggleExercise(ex.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className={`text-sm font-bold flex items-center gap-2 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {ex.name}
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                              {ex.targetMuscle}
                            </span>
                          </div>
                          {ex.notes && (
                            <div className="text-xs text-slate-500 mt-0.5">💡 {ex.notes}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono self-end sm:self-auto">
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                          {ex.sets} Sets
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-amber-700 font-bold">
                          {ex.reps} Reps
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-cyan-700">
                          {ex.restSeconds}s Rest
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIET (Meal-by-Meal High Protein Food) */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          {customDiet ? (
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-sm">
              <div>
                <div className="font-black text-sm text-cyan-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-600" />
                  पर्सनल ट्रेनर डाइट प्लान (Custom Coach Plan)
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  तैयारकर्ता: Coach {customDiet.trainerName} • {customDiet.notes || 'विशेष रूप से आपके लिए तैयार किया गया'}
                </div>
              </div>
              <div className="flex gap-2 text-xs font-mono">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-cyan-200 text-amber-700 font-bold">
                  {customDiet.targetCalories} kcal
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-cyan-200 text-rose-700 font-bold">
                  {customDiet.targetProtein}g Protein
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3 shadow-sm">
              <Zap className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>
                <strong>Kanker Local & High Protein Diet:</strong> Ghar ka taza khana jisme Dal, Paneer, Chana, Doodh, Anda/Chicken aur seasonal fal shaamil hain.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietMeals.map((meal, mIdx) => (
              <div
                key={mIdx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{meal.mealName}</h4>
                      <p className="text-xs text-cyan-700 font-semibold">{meal.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-mono font-bold text-cyan-800">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <ul className="space-y-1.5 my-3 text-xs text-slate-700">
                    {meal.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-mono text-slate-600">
                  <span>Protein: <strong className="text-rose-600">{meal.proteinGrams}g</strong></span>
                  <span>Carbs: <strong className="text-amber-600">{meal.carbsGrams}g</strong></span>
                  <span>Fat: <strong className="text-cyan-700">{meal.fatsGrams}g</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PASS (Official 4-Digit PIN Entry Pass) */}
      {activeTab === 'pass' && (
        <div className="max-w-md mx-auto py-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-widest">
              <KeyRound className="w-3.5 h-3.5" />
              Official Digital Entry Pass
            </div>

            {/* Member Profile Avatar & Info */}
            <div>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center text-3xl font-black text-cyan-800 shadow-sm mb-3">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-slate-900">{member.name}</h2>
              <div className="font-mono text-xs text-cyan-700 font-bold mt-0.5">
                Member ID: {member.memberCode}
              </div>
            </div>

            {/* Glowing 4-Digit PIN Pass Display */}
            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-cyan-300 text-center shadow-inner">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block">
                Gym Entrance Check-In PIN
              </span>
              <div className="flex justify-center items-center gap-3 my-3">
                {((member.pin || '1234') as string).split('').map((char: string, cIdx: number) => (
                  <div
                    key={cIdx}
                    className="w-12 h-14 rounded-xl bg-white border-2 border-cyan-500 flex items-center justify-center text-3xl font-mono font-black text-cyan-800 shadow-sm"
                  >
                    {char}
                  </div>
                ))}
              </div>
              {isMemberExpired ? (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>पिन अक्षम (PIN Disabled) • सदस्यता समाप्त है</span>
                </div>
              ) : (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Active Membership Pass
                </span>
              )}
            </div>

            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>
                Kaushik Fitness Kanker entrance par kiosk pad par apna <strong>4-digit PIN ({member.pin})</strong> enter karein.
              </p>
              <p className="text-[11px] text-slate-500">
                Attendance automatic mark ho jayegi. Kisi physical card ki jarurat nahi hai.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4.5: BODY INDEX & PHYSICAL CHANGES TRACKER */}
      {activeTab === 'body_index' && (
        <BodyIndexTracker member={member} canEdit={true} />
      )}

      {/* TAB 5: FEES & RECEIPT */}
      {activeTab === 'receipt' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-black text-lg text-slate-900">Fees & Payment Details (फीस का विवरण)</h3>
              <p className="text-xs text-slate-500">Kaushik Fitness Kanker official billing record</p>
            </div>

            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              Download Official Tax Receipt
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Total Plan Fee</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {formatINR(member.totalPayable)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Duration: {MEMBERSHIP_PRICING[member.membershipDuration]?.label}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Amount Paid (जमा की गई राशि)</span>
              <div className="text-xl font-black text-emerald-600 font-mono mt-1">
                {formatINR(member.paidAmount)}
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Mode: {member.paymentMethod.toUpperCase()}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Balance Due (बकाया राशि)</span>
              <div className="text-xl font-black font-mono mt-1">
                {member.dueAmount > 0 ? (
                  <span className="text-rose-600">{formatINR(member.dueAmount)}</span>
                ) : (
                  <span className="text-emerald-600">₹0 (No Dues / पूरा जमा)</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Status: {member.paymentStatus.toUpperCase()}</div>
            </div>
          </div>

          {member.discountValue > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
              <span className="text-emerald-900 font-bold">
                सदस्यता विशेष छूट (Special Discount): {member.discountType === 'percentage' ? `${member.discountValue}% Off` : 'Flat Discount'}
              </span>
              <span className="font-mono font-black text-emerald-700">
                - {member.discountType === 'percentage'
                  ? formatINR(Math.round(((member.baseFee + member.ptFee) * member.discountValue) / 100))
                  : formatINR(member.discountValue)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: 3D BODY TRANSFORMATION VISUALIZER */}
      {activeTab === '3d' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <BodyVisualizer3D
            currentStats={{
              heightCm: member.heightCm,
              weightKg: member.weightKg,
              bodyFatPercentage: member.bodyFatPercentage || 17,
              gender: member.gender,
              muscleLevel: member.fitnessScore && member.fitnessScore >= 70 ? 8 : 6,
            }}
          />
        </div>
      )}

      {/* Printable Receipt Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal member={member} onClose={() => setIsInvoiceOpen(false)} />
      )}

      {/* MEMBER EDIT STATS MODAL (Height, Current Wt, Target Wt) */}
      {isEditStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">शारीरिक माप अपडेट करें</h3>
                  <p className="text-xs text-slate-400">ऊंचाई, वर्तमान वजन एवं लक्ष्य वजन सेट करें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStatsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberStats} className="p-6 space-y-4">
              {/* Height cm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ऊंचाई (Height cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    required
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-semibold">cm</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  ~{((editHeight || 172) / 30.48).toFixed(1)} Feet
                </span>
              </div>

              {/* Current Weight kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  वर्तमान वजन (Current Weight kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    required
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-semibold">kg</span>
                </div>
              </div>

              {/* Target Weight kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  लक्ष्य वजन (Target Weight kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    required
                    value={editTargetWeight}
                    onChange={(e) => setEditTargetWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-semibold">kg</span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-2 font-medium">
                  {editWeight && editTargetWeight ? (
                    editWeight > editTargetWeight ? (
                      <span>🎯 <b>{(editWeight - editTargetWeight).toFixed(1)} kg</b> फैट लॉस / वजन घटाने का लक्ष्य</span>
                    ) : editWeight < editTargetWeight ? (
                      <span>🎯 <b>{(editTargetWeight - editWeight).toFixed(1)} kg</b> मसल गेन / वजन बढ़ाने का लक्ष्य</span>
                    ) : (
                      <span>🎯 आप बिल्कुल अपने लक्ष्य वजन पर हैं!</span>
                    )
                  ) : null}
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    अनुमानित बीएमआई (BMI): <b>{(editWeight / Math.pow(editHeight / 100, 2)).toFixed(1)}</b>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditStatsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>माप सेव करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
