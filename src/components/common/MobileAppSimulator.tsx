import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { formatINR, formatDate, MEMBERSHIP_PRICING, PT_PRICING } from '../../utils/formatters';
import { ExpirationCountdown } from './ExpirationCountdown';
import { SmartFitnessEngine } from '../fitness/SmartFitnessEngine';
import { AttendanceScanner } from '../attendance/AttendanceScanner';
import { InvoiceModal } from './InvoiceModal';
import { BodyIndexTracker } from '../members/BodyIndexTracker';
import { BodyPhotoTracker } from '../members/BodyPhotoTracker';
import { generateWorkoutRoutine, generateDietPlan } from '../../utils/fitnessCalculator';
import { localDb } from '../../db/localDatabase';
import {
  Home,
  KeyRound,
  Activity,
  Dumbbell,
  User,
  Clock,
  Wifi,
  Battery,
  Signal,
  Sparkles,
  Receipt,
  MessageSquare,
  Camera,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Utensils,
  CheckCircle2,
  Phone,
  Check,
  Lock,
  AlertTriangle,
  CodeXml,
  Building2,
  MapPin,
  MessageCircle,
  Cloud,
} from 'lucide-react';

interface MobileAppSimulatorProps {
  onExitMobileView: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({ onExitMobileView }) => {
  const { currentUser, role, switchRole } = useAuth();
  const { members, staff, isCloudSynced } = useGymData();

  const [isRealMobile, setIsRealMobile] = useState<boolean>(() => {
    return window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches;
  });

  const [mobileTab, setMobileTab] = useState<'home' | 'pass' | 'photos' | 'body_index' | 'workout' | 'diet' | 'profile'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedInvoice, setSelectedInvoice] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleResize = () => {
      setIsRealMobile(window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const member = members.find((m) => m.id === currentUser?.memberId) || members[0];
  const isMemberExpired = new Date(member.expiryDate).getTime() < Date.now() || member.status === 'expired' || !member.active;
  const trainer = staff.find((s) => s.id === currentUser?.staffId) || staff[1];

  const customWorkout = localDb.getMemberWorkout(member.id);
  const workoutDays = customWorkout?.days?.length ? customWorkout.days : generateWorkoutRoutine(member.fitnessGoal);
  const customDiet = localDb.getMemberDiet(member.id);
  const dietMeals = customDiet?.meals?.length ? customDiet.meals : generateDietPlan(member.fitnessGoal, member.targetDailyCalories || 2600);

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const screenContent = (
    <div
      className={`w-full ${
        isRealMobile ? 'min-h-screen' : 'h-full rounded-[40px] border border-slate-200'
      } bg-slate-100 overflow-hidden flex flex-col justify-between relative text-slate-900`}
    >
      {/* iOS Status Bar & Dynamic Island */}
      <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[12px] font-bold text-slate-700 z-30 shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <span>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>

        {/* Dynamic Island Pill */}
        <div className="w-24 h-5 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[9px] font-mono text-white font-bold tracking-tight">Kaushik Gym</span>
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-1.5 text-slate-600">
          {isRealMobile && (
            <button
              onClick={onExitMobileView}
              title="Switch to Desktop Portal"
              className="text-[10px] font-bold text-slate-600 hover:text-slate-950 mr-1 px-2 py-0.5 rounded-lg bg-slate-200 cursor-pointer"
            >
              🖥️ Portal
            </button>
          )}
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

          {/* App Header */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-xs">
                KF
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-wider text-slate-900 block leading-tight">
                  Kaushik Fitness
                </span>
                <span className="text-[10px] text-amber-700 font-bold">कांकेर (Kanker)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isCloudSynced ? (
                <span
                  title="Firebase Firestore Live Connected"
                  className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </span>
              ) : (
                <span
                  title="Local Storage Mode"
                  className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <span>Local</span>
                </span>
              )}
              {isMemberExpired ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-rose-600" />
                  <span>सदस्यता समाप्त</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  सक्रिय सदस्य
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Screen Content - strictly vertical scrolling, NO horizontal side-scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3 space-y-3.5 scrollbar-none w-full max-w-full box-border">
            {isMemberExpired ? (
              <div className="space-y-3.5 w-full max-w-full overflow-x-hidden py-2 text-center">
                <div className="p-5 rounded-3xl bg-white border-2 border-rose-300 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-3 shadow-inner">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    ऐप लॉक • सदस्यता समाप्त
                  </span>

                  <h3 className="text-base font-black text-slate-900 mt-2">
                    {member.name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                    {member.memberCode}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 space-y-1.5 w-full">
                    <div className="font-bold flex items-center gap-1.5 text-rose-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>वैधता समाप्त तिथि: {formatDate(member.expiryDate)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      आपकी सदस्यता समाप्त हो चुकी है। सुरक्षा व उपस्थिति नियमों के अनुसार फ्रंट डेस्क कियोस्क पर आपका <strong>4-अंकीय एंट्री पिन अक्षम (Disabled)</strong> कर दिया गया है एवं मोबाइल ऐप लॉक है।
                    </p>
                  </div>

                  {/* Status List */}
                  <div className="w-full mt-3 space-y-2 text-left text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-700 font-semibold">4-अंकीय कियोस्क पिन:</span>
                      <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        अक्षम (PIN Disabled)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-700 font-semibold">वर्कआउट व डाइट प्लान:</span>
                      <span className="text-slate-500 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        लॉक्ड (Locked)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-700 font-semibold">4-Side बॉडी फोटोज:</span>
                      <span className="text-slate-500 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        अवरुद्ध (Restricted)
                      </span>
                    </div>
                  </div>

                  {/* Actions for Member */}
                  <div className="w-full mt-4 space-y-2">
                    <a
                      href={`https://wa.me/919826123456?text=${encodeURIComponent(
                        `नमस्ते कौशिक फिटनेस कांकेर, मेरी सदस्यता (${member.memberCode} - ${member.name}) समाप्त हो गई है। कृपया इसे रिन्यू एवं सक्रिय (Activate) करें।`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp पर रिन्यूअल संदेश भेजें</span>
                    </a>

                    <a
                      href="tel:+919826123456"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>रिसेप्शन पर कॉल करें (+91 98261 23456)</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2.5">
                    जिम एडमिन द्वारा सक्रिय (Activate) करते ही ऐप व पिन तुरंत अनलॉक हो जाएंगे।
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* TAB 1: HOME */}
            {mobileTab === 'home' && (
              <div className="space-y-3.5 w-full max-w-full overflow-x-hidden">
                {/* Member Profile Hero Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-black text-slate-900 leading-snug truncate">{member.name}</h2>
                      <div className="text-[11px] text-cyan-800 font-mono font-bold">
                        Pass ID: {member.memberCode}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {MEMBERSHIP_PRICING[member.membershipDuration]?.label}
                      </div>
                    </div>
                  </div>

                  {/* Workout Schedule Time Slot Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg truncate">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">बैच: {member.workoutSlot || '06:00 AM - 07:00 AM'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      सक्रिय (Active)
                    </span>
                  </div>
                </div>

                {/* Expiration Countdown Widget */}
                <div className="w-full max-w-full overflow-x-hidden">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    सदस्यता वैधता (Membership Countdown)
                  </div>
                  <ExpirationCountdown expiryDate={member.expiryDate} variant="card" />
                </div>

                {/* Quick Touch Action Buttons (Light Theme Grid) */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    onClick={() => setMobileTab('pass')}
                    className="p-3 rounded-2xl bg-white hover:bg-cyan-50/40 border border-cyan-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-5 h-5 text-cyan-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">4-Digit PIN Pass</div>
                    <div className="text-[10px] text-slate-500">
                      PIN: <span className="font-mono font-bold text-cyan-800">{member.pin}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMobileTab('photos')}
                    className="p-3 rounded-2xl bg-white hover:bg-cyan-50/40 border border-cyan-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-cyan-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">4-Side Photos</div>
                    <div className="text-[10px] text-slate-500">तुलना व बदलाव</div>
                  </button>

                  <button
                    onClick={() => setMobileTab('body_index')}
                    className="p-3 rounded-2xl bg-white hover:bg-purple-50/40 border border-purple-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Activity className="w-5 h-5 text-purple-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">Body Index</div>
                    <div className="text-[10px] text-slate-500">शारीरिक माप व BMI</div>
                  </button>

                  <button
                    onClick={() => setMobileTab('workout')}
                    className="p-3 rounded-2xl bg-white hover:bg-amber-50/40 border border-amber-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Dumbbell className="w-5 h-5 text-amber-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">Aaj Ka Workout</div>
                    <div className="text-[10px] text-slate-500">एक्सरसाइज व सेट्स</div>
                  </button>

                  <button
                    onClick={() => setMobileTab('diet')}
                    className="p-3 rounded-2xl bg-white hover:bg-emerald-50/40 border border-emerald-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Utensils className="w-5 h-5 text-emerald-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">Diet & Khana</div>
                    <div className="text-[10px] text-slate-500">डाइट चार्ट व कैलोरी</div>
                  </button>

                  <button
                    onClick={() => setMobileTab('profile')}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Receipt className="w-5 h-5 text-amber-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">Fees & Bill</div>
                    <div className="text-[10px] text-slate-500">रसीद / इनवॉइस</div>
                  </button>
                </div>

                {/* Trainer WhatsApp Direct Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wide">जिम कोच (Trainer)</span>
                    <div className="text-xs font-black text-slate-900">{member.assignedTrainerName || 'Coach Vikram Sahu'}</div>
                    <div className="text-[10px] text-slate-500">सहायता हेतु तुरंत संपर्क करें</div>
                  </div>

                  <a
                    href="https://api.whatsapp.com/send?phone=919826189002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: PASS (Official 4-Digit PIN Pass) */}
            {mobileTab === 'pass' && (
              <div className="space-y-4 text-center py-2 w-full max-w-full overflow-x-hidden">
                <div className="p-5 rounded-3xl bg-white border-2 border-cyan-400 shadow-sm space-y-4">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-800 text-[10px] font-black uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                    Official Gym PIN Pass
                  </div>

                  <div>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/10 mb-2">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-cyan-800">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900">{member.name}</div>
                    <div className="text-xs font-mono text-cyan-700 font-bold">{member.memberCode}</div>
                    {member.workoutSlot && (
                      <div className="mt-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>बैच: {member.workoutSlot}</span>
                      </div>
                    )}
                  </div>

                  {/* High Contrast PIN Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-cyan-300 text-center">
                    <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">
                      Gym Entry Security PIN
                    </span>
                    <div className="flex justify-center items-center gap-2 my-2.5">
                      {member.pin.split('').map((char, cIdx) => (
                        <div
                          key={cIdx}
                          className="w-11 h-13 rounded-xl bg-white border-2 border-cyan-500 flex items-center justify-center text-2xl font-mono font-black text-cyan-900 shadow-xs"
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Active Kanker Member
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Front desk kiosk terminal par ye 4-digit PIN enter karke direct entrance karein.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2.2: 4-SIDE BODY PHOTOS & COMPARISON */}
            {mobileTab === 'photos' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <BodyPhotoTracker member={member} canEdit={true} isCompact={true} />
              </div>
            )}

            {/* TAB 2.5: BODY INDEX & CHANGES */}
            {mobileTab === 'body_index' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <BodyIndexTracker member={member} canEdit={true} isCompact={true} />
              </div>
            )}

            {/* TAB 3: WORKOUT */}
            {mobileTab === 'workout' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs shadow-xs">
                  <span className="text-cyan-800 font-black text-sm block">{workoutDays[0]?.dayName}</span>
                  <span className="text-slate-500 text-[11px] font-medium">Focus: {workoutDays[0]?.focus}</span>
                </div>

                <div className="space-y-2">
                  {workoutDays[0]?.exercises.map((ex, idx) => {
                    const isDone = completedExercises[ex.id];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleExercise(ex.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all shadow-xs ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-amber-700'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {ex.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono font-medium">
                              {ex.sets} Sets • {ex.reps} Reps
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium shrink-0 ml-2">
                          {ex.targetMuscle}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: DIET */}
            {mobileTab === 'diet' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 shadow-xs">
                  <strong className="block font-black text-sm text-emerald-900">Aapka Daily Diet Chart:</strong>
                  <span className="text-emerald-800">Target: {member.targetDailyCalories || 2850} Calories (High Protein)</span>
                </div>

                <div className="space-y-2">
                  {dietMeals.map((meal, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{meal.mealName}</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                          {meal.calories} kcal
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-semibold">{meal.description}</p>
                      <ul className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                        {meal.items.slice(0, 3).map((it, iIdx) => (
                          <li key={iIdx}>• {it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PROFILE & BILL */}
            {mobileTab === 'profile' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-xs">
                  <h4 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                    Aapki Membership Details
                  </h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Member Name:</span>
                    <strong className="text-slate-900 font-bold">{member.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pass ID:</span>
                    <strong className="text-cyan-800 font-mono font-bold">{member.memberCode}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Plan:</span>
                    <strong className="text-amber-800 font-bold">{MEMBERSHIP_PRICING[member.membershipDuration]?.label}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Workout Batch (समय):</span>
                    <strong className="text-slate-900 font-bold">{member.workoutSlot || '06:00 AM - 07:00 AM'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Validity Date:</span>
                    <strong className="text-slate-900">{formatDate(member.expiryDate)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fees Status:</span>
                    <strong className="text-emerald-700 uppercase font-bold">Paid in Full (पूरा जमा)</strong>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(true)}
                    className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Tax Receipt / Bill Download
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          {isMemberExpired ? (
            <div className="px-4 py-3 bg-rose-50 border-t border-rose-200 text-center flex items-center justify-center gap-2 text-xs font-bold text-rose-800 shrink-0">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>ऐप लॉक है • सदस्यता रिन्यू कराने पर खुलेगा</span>
            </div>
          ) : (
            <div className="px-1 py-2 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-30 shrink-0 shadow-sm w-full">
              <button
                onClick={() => setMobileTab('home')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'home' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="truncate">Home</span>
              </button>

              <button
                onClick={() => setMobileTab('pass')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'pass' ? 'text-cyan-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span className="truncate">Pass</span>
              </button>

              <button
                onClick={() => setMobileTab('photos')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'photos' ? 'text-cyan-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="truncate">Photos</span>
              </button>

              <button
                onClick={() => setMobileTab('body_index')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'body_index' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="truncate">Index</span>
              </button>

              <button
                onClick={() => setMobileTab('workout')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'workout' ? 'text-amber-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span className="truncate">Workout</span>
              </button>

              <button
                onClick={() => setMobileTab('diet')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'diet' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="truncate">Diet</span>
              </button>

              <button
                onClick={() => setMobileTab('profile')}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
                  mobileTab === 'profile' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="truncate">Profile</span>
              </button>
            </div>
          )}

          {/* iOS Home Indicator Bar */}
          <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto my-1.5 z-30 shrink-0" />
    </div>
  );

  if (isRealMobile) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex flex-col justify-between relative text-slate-900 overflow-x-hidden">
        {screenContent}
        {selectedInvoice && (
          <InvoiceModal member={member} onClose={() => setSelectedInvoice(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center relative">
      {/* Top Controls Bar */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">स्मार्टफोन मोबाइल व्यू (Light UI)</span>
        </div>
        <button
          onClick={onExitMobileView}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:brightness-110 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <span>Desktop View</span>
          <span>🖥️</span>
        </button>
      </div>

      {/* Smartphone Device Frame */}
      <div className="relative w-[390px] h-[800px] bg-slate-950 rounded-[50px] p-3 shadow-2xl shadow-amber-500/10 ring-1 ring-slate-700 border-4 border-slate-700 flex flex-col justify-between overflow-hidden">
        {/* Hardware Silent Switch & Volume Rocker */}
        <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-1 top-28 w-1 h-16 bg-slate-700 rounded-r-md" />

        {screenContent}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal member={member} onClose={() => setSelectedInvoice(false)} />
      )}
    </div>
  );
};
