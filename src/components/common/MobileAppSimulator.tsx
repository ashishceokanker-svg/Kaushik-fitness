import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { Member } from '../../types';
import { formatINR, formatDate, MEMBERSHIP_PRICING, PT_PRICING } from '../../utils/formatters';
import { ExpirationCountdown } from './ExpirationCountdown';
import { SmartFitnessEngine } from '../fitness/SmartFitnessEngine';
import { InvoiceModal } from './InvoiceModal';
import { BodyIndexTracker } from '../members/BodyIndexTracker';
import { BodyPhotoTracker } from '../members/BodyPhotoTracker';
import { BodyVisualizer3D } from '../fitness/BodyVisualizer3D';
import { generateWorkoutRoutine, generateAutomaticCustomDiet } from '../../utils/fitnessCalculator';
import { localDb } from '../../db/localDatabase';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  Home,
  KeyRound,
  Activity,
  Dumbbell,
  User,
  Clock,
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
  Trash2,
  LogOut,
  HelpCircle,
  Eye,
  EyeOff,
  X,
  LayoutDashboard,
  FileSpreadsheet,
  Edit3,
  Scale,
  Ruler,
  Flame,
  Droplets,
  Trophy,
  Zap,
  Maximize2,
  Smartphone,
} from 'lucide-react';
import { AppHelpdeskModal } from '../member/AppHelpdeskModal';
import { TrainerDashboard } from '../dashboard/TrainerDashboard';
import { TrainerGoswaraReport } from '../trainer/TrainerGoswaraReport';
import { getEffectiveAvatar } from '../../utils/animatedAvatars';
import confetti from 'canvas-confetti';

interface MobileAppSimulatorProps {
  onExitMobileView: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({ onExitMobileView }) => {
  const { currentUser, role, logout, updateCurrentUserProfile } = useAuth();
  const { members, staff, isCloudSynced, updateMember, updateStaff, attendance, markAttendance } = useGymData();

  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';
  const [developerPhoto, setDeveloperPhoto] = useState<string>(() => {
    return localStorage.getItem('kf_developer_photo') || '';
  });
  const mobilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handleMobilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 720,
        maxHeight: 720,
        quality: 0.75,
      });
      setDeveloperPhoto(compressed);
      localStorage.setItem('kf_developer_photo', compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setDeveloperPhoto(base64);
          localStorage.setItem('kf_developer_photo', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileRemovePhoto = () => {
    setDeveloperPhoto('');
    localStorage.removeItem('kf_developer_photo');
    if (mobilePhotoInputRef.current) {
      mobilePhotoInputRef.current.value = '';
    }
  };

  const [isRealMobile, setIsRealMobile] = useState<boolean>(() => {
    return window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches;
  });

  // Desktop view mode: fit screen vs phone frame
  const [desktopViewMode, setDesktopViewMode] = useState<'fit_screen' | 'phone_frame'>('fit_screen');

  const [mobileTab, setMobileTab] = useState<'home' | 'pass' | 'photos' | 'body_index' | 'workout' | 'diet' | '3d' | 'profile' | 'developer'>('home');
  const [trainerTab, setTrainerTab] = useState<'dashboard' | 'reports' | 'fitness' | 'profile' | 'developer'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedInvoice, setSelectedInvoice] = useState(false);
  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const [formMode, setFormMode] = useState<'simple' | 'advanced'>(() => localDb.getFormMode());
  useEffect(() => {
    const handleModeChange = () => setFormMode(localDb.getFormMode());
    window.addEventListener('kf_form_mode_change', handleModeChange);
    window.addEventListener('storage', handleModeChange);
    return () => {
      window.removeEventListener('kf_form_mode_change', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
    };
  }, []);
  const isAdvanced = formMode === 'advanced';

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

  const allMembers = members && members.length > 0 ? members : localDb.getJoinedMembers();

  const fallbackMember: any = {
    id: currentUser?.memberId || 'mem-1',
    userId: currentUser?.id || 'usr-5',
    name: currentUser?.name || 'Rahul Sharma',
    phone: currentUser?.phone || '9826112345',
    email: currentUser?.email || 'member@kaushikfitness.com',
    memberCode: 'KF-2024-001',
    membershipPlan: 'gold',
    membershipDuration: '1_month',
    joinDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    fitnessGoal: 'muscle_building',
    gender: 'male',
    heightCm: 172,
    weightKg: 70,
    targetWeightKg: 75,
    bmi: 23.7,
    active: true,
    status: 'active',
    pin: currentUser?.pin || '2222',
    workoutSlot: '06:00 AM - 07:00 AM',
  };

  const member: any =
    (allMembers && allMembers.length > 0
      ? allMembers.find(
          (m) =>
            (currentUser?.memberId && m.id === currentUser.memberId) ||
            (currentUser?.id && (m.userId === currentUser.id || m.id === currentUser.id)) ||
            (currentUser?.phone && m.phone && m.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
            (currentUser?.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
        ) || allMembers[0]
      : null) || fallbackMember;

  const isMemberExpired =
    role === 'member' && member?.expiryDate
      ? new Date(member.expiryDate).getTime() < Date.now() || member.status === 'expired' || !member.active
      : false;

  const trainer: any =
    staff && staff.length > 0
      ? staff.find(
          (s) =>
            s.id === currentUser?.staffId ||
            s.id === currentUser?.id ||
            (s.userId && s.userId === currentUser?.id) ||
            (s.phone && s.phone === currentUser?.phone)
        ) ||
        staff.find((s) => s.role === 'trainer') ||
        staff[1] ||
        staff[0]
      : { id: 'usr-2', name: 'Vikram Sahu', designation: 'Head Coach', role: 'trainer' as const, gender: 'male' as const, phone: '9826189002', email: 'trainer@kaushikfitness.com', staffCode: 'KFS-002', avatarUrl: '' };

  const isMemberAssignedToTrainer = (m: any, t: any) => {
    if (!m || !t) return false;
    if (m.assignedTrainerId) {
      if (m.assignedTrainerId === t.id) return true;
      if (t.userId && m.assignedTrainerId === t.userId) return true;
    }
    if (m.assignedTrainerName && t.name) {
      const mName = m.assignedTrainerName.trim().toLowerCase();
      const tName = t.name.trim().toLowerCase();
      if (mName === tName) return true;
    }
    return false;
  };
  const trainerAssignedClients = allMembers.filter((m) => trainer && isMemberAssignedToTrainer(m, trainer));

  // Trainer photo upload in mobile app
  const trainerPhotoInputRef = useRef<HTMLInputElement>(null);
  const [trainerPhotoUploading, setTrainerPhotoUploading] = useState(false);

  const handleTrainerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !trainer?.id) return;
    setTrainerPhotoUploading(true);
    try {
      const compressed = await compressImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      updateStaff(trainer.id, { avatarUrl: compressed });
      updateCurrentUserProfile({ avatarUrl: compressed });
      localDb.updateStaff(trainer.id, { avatarUrl: compressed });
      alert('📸 आपकी कोच प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई!');
    } catch {
      alert('फ़ोटो अपलोड करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setTrainerPhotoUploading(false);
    }
  };

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<number>(0);
  const [dietTick, setDietTick] = useState(0);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayMemberAttendance = attendance?.find(
    (a) =>
      a.date === todayDate &&
      (a.userId === member?.id ||
        a.userId === member?.userId ||
        (member?.memberCode && a.memberCode?.toLowerCase() === member.memberCode?.toLowerCase()) ||
        (member?.name && a.userName?.toLowerCase() === member.name?.toLowerCase()))
  );
  const [mobileAttLoading, setMobileAttLoading] = useState(false);
  const [mobileAttMsg, setMobileAttMsg] = useState<string | null>(null);

  const handleMobileQuickCheckIn = async () => {
    if (isMemberExpired) {
      alert('सदस्यता समाप्त है। कृपया सदस्यता रिन्यू कराएं।');
      return;
    }
    setMobileAttLoading(true);
    try {
      const res = await markAttendance(member.pin || member.memberCode, 'pin');
      setMobileAttMsg(res.message);
      if (res.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } catch {
      setMobileAttMsg('हाजिरी दर्ज करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setMobileAttLoading(false);
      setTimeout(() => setMobileAttMsg(null), 4000);
    }
  };

  // Member photo upload in mobile app
  const memberPhotoInputRef = useRef<HTMLInputElement>(null);
  const [memberPhotoUploading, setMemberPhotoUploading] = useState(false);

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member?.id) return;
    setMemberPhotoUploading(true);
    try {
      const compressed = await compressImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      updateMember(member.id, { avatarUrl: compressed });
      updateCurrentUserProfile({ avatarUrl: compressed });
      alert('📸 आपकी प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई!');
    } catch {
      alert('फ़ोटो अपलोड करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setMemberPhotoUploading(false);
    }
  };

  // Monthly sessions calculation strictly for current month
  const nowMobile = new Date();
  const currentMonthPrefix = `${nowMobile.getFullYear()}-${String(nowMobile.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthHindi = nowMobile.toLocaleDateString('hi-IN', { month: 'long', year: 'numeric' });

  const monthlyAttendanceRecords = (attendance || []).filter((a) => {
    const isThisMember =
      (a.userId && (a.userId === member?.id || a.userId === member?.userId)) ||
      (a.memberCode && member?.memberCode && a.memberCode.toLowerCase() === member.memberCode.toLowerCase()) ||
      (a.userName && member?.name && a.userName.toLowerCase() === member.name.toLowerCase());
    return isThisMember && a.date && a.date.startsWith(currentMonthPrefix);
  });

  const uniqueMonthlyDates = Array.from(new Set(monthlyAttendanceRecords.map((a) => a.date)));
  const completedMonthSessions = uniqueMonthlyDates.length;
  const memberMonthlyQuota = member?.personalTraining
    ? (member.ptSessionsTotal ? (member.ptSessionsTotal % 24 === 0 && member.ptSessionsTotal >= 24 ? 24 : 12) : 12)
    : 24;
  const monthSessionPct = Math.min(100, Math.round((completedMonthSessions / memberMonthlyQuota) * 100));

  // Physical Stats Editing State
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
    setStatsSavedToast(`✅ शारीरिक माप (ऊंचाई: ${h}cm, वजन: ${w}kg, लक्ष्य: ${tw}kg) अपडेट हो गया!`);
    setTimeout(() => setStatsSavedToast(null), 4000);
  };

  // Water Tracker State
  const todayWaterKey = `kf_water_${member?.id || 'mem'}_${todayDate}`;
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(todayWaterKey);
    return saved ? parseInt(saved, 10) : 5;
  });

  const handleUpdateWater = (delta: number) => {
    const updated = Math.max(0, Math.min(16, waterGlasses + delta));
    setWaterGlasses(updated);
    localStorage.setItem(todayWaterKey, String(updated));
    if (updated === 8 && waterGlasses < 8) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // PR Records for Member
  const memberPrs = {
    bench: member?.weightKg ? Math.round(member.weightKg * 1.1) : 75,
    squat: member?.weightKg ? Math.round(member.weightKg * 1.4) : 95,
    deadlift: member?.weightKg ? Math.round(member.weightKg * 1.6) : 115,
    ohp: member?.weightKg ? Math.round(member.weightKg * 0.7) : 50,
  };

  useEffect(() => {
    const handleUpdate = () => setDietTick((t) => t + 1);
    window.addEventListener('kf_body_index_updated', handleUpdate);
    window.addEventListener('kf_attendance_marked', handleUpdate);
    window.addEventListener('kf_member_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kf_body_index_updated', handleUpdate);
      window.removeEventListener('kf_attendance_marked', handleUpdate);
      window.removeEventListener('kf_member_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const customWorkout = member?.id ? localDb.getMemberWorkout(member.id) : undefined;
  const workoutDays = customWorkout?.days?.length
    ? customWorkout.days
    : generateWorkoutRoutine(member?.fitnessGoal || 'muscle_building');

  const customDiet = member?.id ? localDb.getMemberDiet(member.id) : undefined;
  const activeDietType: 'veg' | 'non_veg' = (customDiet?.dietType === 'non_veg' || member?.dietPreference === 'non_veg') ? 'non_veg' : 'veg';
  
  const dietMeals = customDiet?.meals?.length
    ? customDiet.meals
    : generateAutomaticCustomDiet({
        memberId: member.id,
        memberName: member.name,
        weightKg: member.weightKg || 70,
        heightCm: member.heightCm || 172,
        age: member.age || 25,
        gender: member.gender || 'male',
        goal: member.fitnessGoal || 'muscle_building',
        dietType: activeDietType,
        trainerId: member.assignedTrainerId,
        trainerName: member.assignedTrainerName,
      }).meals;

  const handleSwitchDietType = (type: 'veg' | 'non_veg') => {
    const newDiet = generateAutomaticCustomDiet({
      memberId: member.id,
      memberName: member.name,
      weightKg: member.weightKg || 70,
      heightCm: member.heightCm || 172,
      age: member.age || 25,
      gender: member.gender || 'male',
      goal: member.fitnessGoal || 'muscle_building',
      dietType: type,
      trainerId: member.assignedTrainerId,
      trainerName: member.assignedTrainerName,
    });
    localDb.saveMemberDiet(newDiet);
    updateMember(member.id, { dietPreference: type });
    window.dispatchEvent(new Event('kf_body_index_updated'));
    setDietTick((t) => t + 1);
  };

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Change PIN State
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccessToast, setPinSuccessToast] = useState<string | null>(null);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const p1 = newPin.trim();
    const p2 = confirmPin.trim();

    if (!p1 || p1.length !== 4 || !/^\d{4}$/.test(p1)) {
      setPinError('कृपया ठीक 4 अंकों का संख्यात्मक पिन दर्ज करें (उदा. 3482)');
      return;
    }
    if (p1 !== p2) {
      setPinError('पुष्टि किया गया पिन मेल नहीं खाता। कृपया दोनों बॉक्स में एक ही पिन दर्ज करें।');
      return;
    }

    setIsSubmittingPin(true);
    try {
      if (member?.id) {
        updateMember(member.id, { pin: p1 });
      }
      const userId = member?.userId || currentUser?.id;
      if (userId) {
        localDb.updateUser(userId, { pin: p1 });
      }
      updateCurrentUserProfile({ pin: p1 });

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setPinSuccessToast(`✅ आपका 4-अंकीय पिन सफलतापूर्वक बदल गया है!`);
      setTimeout(() => {
        setIsChangePinModalOpen(false);
        setPinSuccessToast(null);
        setNewPin('');
        setConfirmPin('');
      }, 2000);
    } catch (err: any) {
      setPinError('पिन अपडेट करने में विफल: ' + (err?.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const renderDeveloperProfile = (onBack: () => void) => (
    <div className="space-y-3.5 w-full max-w-full overflow-x-hidden animate-in fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 rounded-3xl p-5 text-white border border-slate-700 shadow-lg text-center space-y-3">
        {/* Photo / Avatar */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 to-amber-500 p-0.5 shadow-md">
          {developerPhoto ? (
            <img
              src={developerPhoto}
              alt="Ashish Dey"
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-2">
              <Building2 className="w-8 h-8 text-cyan-400 mb-0.5" />
              <span className="text-[10px] font-black text-amber-300">Ashish Dey</span>
            </div>
          )}

          {isDeveloper ? (
            <>
              <input
                type="file"
                ref={mobilePhotoInputRef}
                accept="image/*"
                onChange={handleMobilePhotoUpload}
                className="hidden"
                id="mobile-dev-photo-upload"
              />
              <label
                htmlFor="mobile-dev-photo-upload"
                title="Upload Developer Photo"
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md cursor-pointer transition-all active:scale-90"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
            </>
          ) : (
            <div
              title="केवल डेवलपर फोटो बदल सकते हैं"
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed opacity-80"
            >
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            </div>
          )}
        </div>

        {isDeveloper && developerPhoto && (
          <button
            type="button"
            onClick={handleMobileRemovePhoto}
            className="text-[10px] text-rose-300 hover:text-rose-200 flex items-center justify-center gap-1 cursor-pointer transition-colors mx-auto pt-0.5"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove Photo</span>
          </button>
        )}

        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1">
            Developer & Leadership Profile
          </div>
          <h3 className="text-xl font-black text-white">Ashish Dey</h3>
          <div className="text-xs font-bold text-amber-400 mt-0.5">
            Chief Executive Officer
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            Janpad Panchayat Baderajpur
          </div>
          <div className="text-[10px] text-cyan-200 mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span>District Kondagaon (C.G.)</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10 text-left">
          Dedicated administrative leadership driven by modern digital governance, technological innovation, and public service. Committed to empowering communities and fostering an enduring culture of discipline and excellence.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="tel:9244249975"
            className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] uppercase flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
          <a
            href="https://wa.me/919244249975?text=Hello%20Sir,%20contacting%20regarding%20Kaushik%20Fitness%20mobile%20app."
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-[11px] uppercase flex items-center justify-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp</span>
          </a>
        </div>

        <button
          onClick={onBack}
          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </div>
  );

  const screenContent = (
    <div className="w-full max-w-full flex-1 flex flex-col justify-between overflow-x-hidden relative text-slate-900 bg-slate-100">
      {/* Sleek Native Mobile Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-300 flex items-center justify-between shrink-0 bg-white shadow-xs z-20">
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
          {/* Switch to Desktop Portal */}
          <button
            onClick={onExitMobileView}
            title="डेस्कटॉप पोर्टल में जाएं (Desktop Portal)"
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 border border-slate-300 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <span>🖥️</span>
            <span className="hidden xs:inline">वेब पोर्टल</span>
          </button>

          {isDeveloper && (
            isCloudSynced ? (
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
            )
          )}

          <button
            onClick={() => {
              if (role === 'trainer') {
                setTrainerTab(trainerTab === 'developer' ? 'dashboard' : 'developer');
              } else {
                setMobileTab(mobileTab === 'developer' ? 'home' : 'developer');
              }
            }}
            title="Developer Profile (Ashish Dey - CEO)"
            className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:bg-slate-800 cursor-pointer border border-cyan-500/40 active:scale-95"
          >
            <CodeXml className="w-3 h-3 text-cyan-400" />
            <span>Dev</span>
          </button>

          {role === 'trainer' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
              कोच
            </span>
          ) : isMemberExpired ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-rose-600" />
              <span>समाप्त</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              सक्रिय
            </span>
          )}

          {/* Quick Exit / Logout */}
          <button
            onClick={logout}
            title="Logout / बाहर निकलें"
            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-2.5 h-2.5 text-rose-600" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Scrollable Screen Content - strictly vertical scrolling, NO horizontal side-scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3 space-y-3.5 scrollbar-none w-full max-w-full box-border">
        {role === 'trainer' ? (
          trainerTab === 'dashboard' ? (
            <div className="w-full max-w-full overflow-x-hidden">
              <TrainerDashboard
                onNavigate={(tab) => {
                  if (tab === 'trainer_report' || tab === 'report') {
                    setTrainerTab('reports');
                  } else if (tab === 'fitness') {
                    setTrainerTab('fitness');
                  }
                }}
              />
            </div>
          ) : trainerTab === 'reports' ? (
            <div className="w-full max-w-full overflow-x-hidden">
              <TrainerGoswaraReport onBack={() => setTrainerTab('dashboard')} />
            </div>
          ) : trainerTab === 'fitness' ? (
            <div className="w-full max-w-full overflow-x-hidden">
              <SmartFitnessEngine />
            </div>
          ) : trainerTab === 'developer' ? (
            renderDeveloperProfile(() => setTrainerTab('profile'))
          ) : (
            /* TRAINER PROFILE SCREEN - NO HELPDESK */
            <div className="space-y-3.5 w-full max-w-full overflow-x-hidden">
              {/* Trainer Profile Hero Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-700" />
                <div className="relative pt-4 flex flex-col items-center">
                  <div className="relative group shrink-0 mb-2">
                    <img
                      src={getEffectiveAvatar(trainer.avatarUrl, (trainer as any)?.gender, trainer.name)}
                      alt={trainer.name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => trainerPhotoInputRef.current?.click()}
                      disabled={trainerPhotoUploading}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer active:scale-95 transition-transform"
                      title="कोच प्रोफ़ाइल फ़ोटो बदलें (Change Photo)"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={trainerPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTrainerPhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Award className="w-3 h-3 text-cyan-600" />
                    <span>हेड फिटनेस कोच • ID: {trainer.staffCode || trainer.id}</span>
                  </div>

                  <h2 className="text-base font-black text-slate-900">
                    Coach {trainer.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {trainer.designation || 'Head Fitness Coach & PT Lead'}
                  </p>

                  {/* Coach Details List */}
                  <div className="w-full mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">संपर्क मोबाइल:</span>
                      <span className="font-mono font-bold text-slate-900">{trainer.phone || '9826189002'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">ईमेल:</span>
                      <span className="font-mono font-bold text-slate-900 truncate max-w-[180px]">{trainer.email || 'trainer@kaushikfitness.com'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">फ्लोर शिफ्ट समय:</span>
                      <span className="font-bold text-slate-900">06:00 AM - 12:00 PM & 05:00 PM - 09:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">विशेषज्ञता:</span>
                      <span className="font-bold text-cyan-800">हाइपरट्रॉफी, बॉडीबिल्डिंग व पावरलिफ्टिंग</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">असाइन पीटी सदस्य:</span>
                      <span className="font-bold text-emerald-700">{trainerAssignedClients.length} सदस्य सक्रिय</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation to Reports & Fitness Engine */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTrainerTab('reports')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-start gap-1 text-left cursor-pointer hover:border-cyan-400 active:scale-95 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">गोशवारा रिपोर्ट</h4>
                  <p className="text-[10px] text-slate-500">Excel / PDF एक्सपोर्ट</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrainerTab('fitness')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-start gap-1 text-left cursor-pointer hover:border-amber-400 active:scale-95 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">स्मार्ट फिटनेस इंजन</h4>
                  <p className="text-[10px] text-slate-500">BMR / TDEE व डाइट</p>
                </button>
              </div>

              {/* Developer Profile Link Card */}
              <button
                onClick={() => setTrainerTab('developer')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 text-left flex items-center justify-between group shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <CodeXml className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      डेवलपर प्रोफ़ाइल (Ashish Dey)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Chief Executive Officer • जनपद पंचायत बड़ेराजपुर
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट करें (Sign Out)</span>
              </button>
            </div>
          )
        ) : isMemberExpired ? (
          /* EXPIRED MEMBER VIEW */
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
                  <span>सदस्यता समाप्त (Membership Expired)</span>
                  {isAdvanced && (
                    <span className="text-[10px] font-mono text-rose-700">({formatDate(member.expiryDate)})</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  आपकी सदस्यता समाप्त हो चुकी है। सुरक्षा व उपस्थिति नियमों के अनुसार फ्रंट डेस्क कियोस्क पर आपका <strong>4-अंकीय एंट्री पिन अक्षम (Disabled)</strong> कर दिया गया है एवं मोबाइल ऐप लॉक है।
                </p>
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
            </div>
          </div>
        ) : (
          /* ACTIVE MEMBER VIEW - COMPLETE DATA PARITY WITH WEB */
          <>
            {/* TAB 1: HOME */}
            {mobileTab === 'home' && (
              <div className="space-y-3.5 w-full max-w-full overflow-x-hidden">
                {/* Stats saved toast */}
                {statsSavedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
                    <span>{statsSavedToast}</span>
                    <button onClick={() => setStatsSavedToast(null)} className="text-emerald-700">✕</button>
                  </div>
                )}

                {/* Member Profile Hero Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <img
                        src={getEffectiveAvatar(member.avatarUrl, member.gender, member.name)}
                        alt={member.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0 bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => memberPhotoInputRef.current?.click()}
                        disabled={memberPhotoUploading}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border border-white cursor-pointer active:scale-95"
                        title="फ़ोटो बदलें"
                      >
                        <Camera className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                      <input
                        ref={memberPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMemberPhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="text-sm font-black text-slate-900 leading-snug truncate">{member.name}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setPinError(null);
                            setPinSuccessToast(null);
                            setNewPin('');
                            setConfirmPin('');
                            setIsChangePinModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                          title="अपना 4-अंकीय पिन बदलें"
                        >
                          <KeyRound className="w-3 h-3 text-slate-950" />
                          <span>पिन बदलें</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-cyan-800 font-mono font-bold">
                        Pass ID: {member.memberCode}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {MEMBERSHIP_PRICING[member.membershipDuration]?.label || 'Standard Membership'}
                      </div>
                    </div>
                  </div>

                  {/* Batch Slot & Status */}
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

                {/* Expiration Countdown Widget (Only in Advanced Mode) */}
                {isAdvanced && (
                  <div className="w-full max-w-full overflow-x-hidden">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      सदस्यता वैधता (Membership Countdown)
                    </div>
                    <ExpirationCountdown expiryDate={member.expiryDate} variant="card" />
                  </div>
                )}

                {/* Monthly Sessions Tracker Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                        {completedMonthSessions}
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-emerald-950 block leading-tight">
                          🎯 इस माह के सत्र ({currentMonthHindi})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {completedMonthSessions} / {memberMonthlyQuota} सत्र पूर्ण
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {monthSessionPct}% पूर्ण
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${monthSessionPct}%` }}
                    />
                  </div>
                </div>

                {/* PHYSICAL STATS CARDS & EDIT BUTTON (Full Parity with Web) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span className="font-black text-xs text-slate-900">शारीरिक माप व लक्ष्य (Physical Stats)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditStats}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3 h-3 text-slate-950" />
                      <span>माप बदलें</span>
                    </button>
                  </div>

                  {member.notes && (
                    <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-[11px] text-slate-700">
                      <strong className="text-cyan-900">ट्रेनर नोट: </strong>
                      <span className="italic">{member.notes}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Height */}
                    <div
                      onClick={handleOpenEditStats}
                      className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 cursor-pointer hover:border-cyan-400 transition-colors"
                    >
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>ऊंचाई (Height)</span>
                        <Ruler className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        {member.heightCm || 172} <span className="text-[10px] font-normal text-slate-400">cm</span>
                      </div>
                      <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">
                        ~{((member.heightCm || 172) / 30.48).toFixed(1)} Feet
                      </div>
                    </div>

                    {/* Current Weight */}
                    <div
                      onClick={handleOpenEditStats}
                      className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 cursor-pointer hover:border-amber-400 transition-colors"
                    >
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>वर्तमान वजन</span>
                        <Scale className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        {member.weightKg} <span className="text-[10px] font-normal text-slate-400">kg</span>
                      </div>
                      <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                        BMI: {member.bmi || (member.heightCm ? (member.weightKg / Math.pow(member.heightCm / 100, 2)).toFixed(1) : 24.6)}
                      </div>
                    </div>

                    {/* Target Weight */}
                    <div
                      onClick={handleOpenEditStats}
                      className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>लक्ष्य वजन</span>
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                        {member.targetWeightKg || 75} <span className="text-[10px] font-normal text-slate-400">kg</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                        {member.targetWeightKg
                          ? member.weightKg > member.targetWeightKg
                            ? `${(member.weightKg - member.targetWeightKg).toFixed(1)} kg घटाना है`
                            : member.weightKg < member.targetWeightKg
                            ? `${(member.targetWeightKg - member.weightKg).toFixed(1)} kg बढ़ाना है`
                            : 'लक्ष्य हासिल! 🎉'
                          : 'फिटनेस गोल'}
                      </div>
                    </div>

                    {/* Daily Calories */}
                    <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>दैनिक कैलोरी</span>
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <div className="text-lg font-black text-amber-600 font-mono mt-0.5">
                        {member.targetDailyCalories || 2850} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                        {member.fitnessGoal?.replace('_', ' ') || 'High Protein'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* WATER INTAKE TRACKER (Full Parity with Web) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50/50 to-white border border-sky-200 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-sky-600" />
                      <div>
                        <span className="font-black text-xs text-sky-950 block leading-tight">दैनिक जल सेवन (Water Tracker)</span>
                        <span className="text-[10px] text-slate-500">लक्ष्य: 8 गिलास (2 ली.) प्रतिदिन</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                      {waterGlasses} / 8 गिलास
                    </span>
                  </div>

                  {/* Water Visual Bar */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <div
                        key={g}
                        onClick={() => handleUpdateWater(g <= waterGlasses ? -1 : 1)}
                        className={`flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                          g <= waterGlasses
                            ? 'bg-sky-500 text-white shadow-xs scale-105'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                        title={`गिलास ${g}`}
                      >
                        💧
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-semibold text-slate-600">
                      {waterGlasses >= 8 ? '🎉 आज का जल लक्ष्य पूर्ण!' : `${8 - waterGlasses} गिलास बाकी है`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateWater(-1)}
                        disabled={waterGlasses <= 0}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateWater(1)}
                        disabled={waterGlasses >= 16}
                        className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center hover:bg-sky-500 disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* PR HALL OF FAME (Personal Records) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span className="font-black text-xs text-amber-950">व्यक्तिगत रिकॉर्ड (PR Hall of Fame)</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Strength
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Bench</div>
                      <div className="text-xs font-mono font-black text-amber-900 mt-0.5">{memberPrs.bench} kg</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Squat</div>
                      <div className="text-xs font-mono font-black text-amber-900 mt-0.5">{memberPrs.squat} kg</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Deadlift</div>
                      <div className="text-xs font-mono font-black text-amber-900 mt-0.5">{memberPrs.deadlift} kg</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">OHP</div>
                      <div className="text-xs font-mono font-black text-amber-900 mt-0.5">{memberPrs.ohp} kg</div>
                    </div>
                  </div>
                </div>

                {/* TODAY'S WORKOUT SNEAK PEEK */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-cyan-600" />
                      <span className="font-black text-xs text-slate-900">आज का वर्कआउट (Today's Routine)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileTab('workout')}
                      className="text-[10px] font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-0.5"
                    >
                      <span>पूरा देखें</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {workoutDays[0] && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{workoutDays[0].dayName}</div>
                        <div className="text-[10px] text-slate-500">फोकस: {workoutDays[0].focus}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200">
                        {workoutDays[0].exercises.length} व्यायाम
                      </span>
                    </div>
                  )}
                </div>

                {/* Trainer WhatsApp Direct Card */}
                {member.assignedTrainerName && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wide">जिम कोच (Trainer)</span>
                      <div className="text-xs font-black text-slate-900">{member.assignedTrainerName}</div>
                      <div className="text-[10px] text-slate-500">सहायता हेतु तुरंत संपर्क करें</div>
                    </div>

                    <a
                      href={`https://api.whatsapp.com/send?phone=919826189002&text=${encodeURIComponent(
                        `Namaste ${member.assignedTrainerName}! Mera naam ${member.name} hai (KF Code: ${member.memberCode}). Mujhe workout/diet ke baare me poochna hai.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Quick Navigation Action Grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    onClick={() => setMobileTab('pass')}
                    className="p-3 rounded-2xl bg-white hover:bg-cyan-50/40 border border-cyan-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-5 h-5 text-cyan-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">4-Digit PIN Pass</div>
                    <div className="text-[10px] text-slate-500">हाजिरी व कियोस्क पास</div>
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
                    <div className="font-black text-xs text-slate-900">Workout Routine</div>
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
                    onClick={() => setMobileTab('3d')}
                    className="p-3 rounded-2xl bg-white hover:bg-cyan-50/40 border border-cyan-200 text-left active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-cyan-600 mb-1.5" />
                    <div className="font-black text-xs text-slate-900">3D Body Avatar</div>
                    <div className="text-[10px] text-slate-500">3D शरीर का दृश्य</div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PASS (Official 4-Digit PIN Pass) */}
            {mobileTab === 'pass' && (
              <div className="space-y-3.5 text-center py-2 w-full max-w-full overflow-x-hidden">
                <div className="p-4 rounded-3xl bg-white border-2 border-cyan-400 shadow-sm space-y-3.5">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-800 text-[10px] font-black uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                    4-Digit PIN Attendance Pass
                  </div>

                  <div>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/10 mb-2">
                      <img
                        src={getEffectiveAvatar(member.avatarUrl, member.gender, member.name)}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-[14px] bg-slate-900"
                      />
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

                  {/* Attendance Check-in Status Card */}
                  {todayMemberAttendance ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-left text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-black">आज की हाजिरी दर्ज है</div>
                          <div className="text-[10px] text-emerald-800">In: {todayMemberAttendance.checkInTime} • {todayMemberAttendance.date}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        Present
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-left text-amber-950 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="text-xs font-bold">आज की उपस्थिति दर्ज करें:</div>
                      </div>
                      <button
                        type="button"
                        disabled={mobileAttLoading || isMemberExpired}
                        onClick={handleMobileQuickCheckIn}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{mobileAttLoading ? 'हाजिरी दर्ज हो रही है...' : 'अभी 1-Tap हाजिरी लगाएं'}</span>
                      </button>
                    </div>
                  )}

                  {mobileAttMsg && (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-bold animate-fade-in">
                      {mobileAttMsg}
                    </div>
                  )}

                  {/* High Contrast PIN Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-dashed border-cyan-300 text-center">
                    <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">
                      Gym Entry Security PIN
                    </span>
                    <div className="flex justify-center items-center gap-2 my-2">
                      {(member.pin || '1234').split('').map((char: string, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="w-10 h-12 rounded-xl bg-white border-2 border-cyan-500 flex items-center justify-center text-2xl font-mono font-black text-cyan-900 shadow-xs"
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Active Kanker Member
                    </span>

                    {/* Change PIN Action */}
                    <div className="pt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPinError(null);
                          setPinSuccessToast(null);
                          setNewPin('');
                          setConfirmPin('');
                          setIsChangePinModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer mx-auto active:scale-95"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>पिन बदलें (Change PIN)</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Front desk kiosk terminal par ye 4-digit PIN enter karke entrance karein ya upar diye button se turant attendance mark karein.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: 4-SIDE BODY PHOTOS */}
            {mobileTab === 'photos' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <BodyPhotoTracker member={member} canEdit={true} isCompact={true} />
              </div>
            )}

            {/* TAB 4: BODY INDEX */}
            {mobileTab === 'body_index' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <BodyIndexTracker member={member} canEdit={true} isCompact={true} />
              </div>
            )}

            {/* TAB 5: WORKOUT */}
            {mobileTab === 'workout' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                {/* 6-Day Week Navigation Pill Bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {workoutDays.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWorkoutDay(idx)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        selectedWorkoutDay === idx
                          ? 'bg-cyan-600 text-white shadow-xs font-black'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      Day {idx + 1}: {day.dayName.split(':')[0] || `Day ${idx + 1}`}
                    </button>
                  ))}
                </div>

                {/* Selected Day Workout Schedule */}
                {workoutDays[selectedWorkoutDay] && (
                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-cyan-800 font-black text-sm block">
                          {workoutDays[selectedWorkoutDay].dayName}
                        </span>
                        <span className="text-slate-500 text-[11px] font-medium">
                          Focus: {workoutDays[selectedWorkoutDay].focus}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                        {workoutDays[selectedWorkoutDay].exercises.length} Exercises
                      </span>
                    </div>

                    <div className="space-y-2">
                      {workoutDays[selectedWorkoutDay].exercises.map((ex, idx) => {
                        const isDone = completedExercises[ex.id];
                        return (
                          <div
                            key={ex.id || idx}
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
              </div>
            )}

            {/* TAB 6: DIET */}
            {mobileTab === 'diet' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="block font-black text-sm text-emerald-900">Aapka Daily Diet Chart:</strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-emerald-800 border border-emerald-200">
                      {activeDietType === 'non_veg' ? '🍗 मांसाहारी (Non-Veg)' : '🥗 शाकाहारी (Veg)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-800">
                    <span>Target: {member.targetDailyCalories || 2850} Calories</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSwitchDietType('veg')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          activeDietType === 'veg'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/80 text-emerald-900 hover:bg-white'
                        }`}
                      >
                        🥗 Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchDietType('non_veg')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          activeDietType === 'non_veg'
                            ? 'bg-orange-600 text-white'
                            : 'bg-white/80 text-orange-900 hover:bg-white'
                        }`}
                      >
                        🍗 Non-Veg
                      </button>
                    </div>
                  </div>
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
                        {meal.items.slice(0, 4).map((it, iIdx) => (
                          <li key={iIdx}>• {it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: 3D BODY VISUALIZER */}
            {mobileTab === '3d' && (
              <div className="space-y-3 w-full max-w-full overflow-x-hidden">
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

            {/* TAB 8: PROFILE & BILL */}
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
                    <strong className="text-amber-800 font-bold">{MEMBERSHIP_PRICING[member.membershipDuration]?.label || 'Standard'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Diet Preference:</span>
                    <strong className="text-emerald-700 font-bold">
                      {member.dietPreference === 'non_veg' ? '🍗 Non-Veg (मांसाहारी)' : '🥗 Veg (शाकाहारी)'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Workout Batch (समय):</span>
                    <strong className="text-slate-900 font-bold">{member.workoutSlot || '06:00 AM - 07:00 AM'}</strong>
                  </div>

                  {/* Fees & Bill Receipt Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-98"
                    >
                      <Receipt className="w-4 h-4 text-amber-700" />
                      <span>रसीद / इनवॉइस देखें (Fees Receipt)</span>
                    </button>
                  </div>

                  {/* Helpdesk & App User Guide Card */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-white border border-amber-200 shadow-2xs space-y-2 text-left">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-2xs shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-slate-900">सहायता केंद्र एवं ऐप गाइड</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-bold text-[9px] uppercase">
                            Helpdesk
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 mt-0.5 leading-snug">
                          कौशिक फिटनेस ऐप का कौन सा टैब क्या है और कैसे उपयोग करें? पूरी मार्गदर्शिका देखें।
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsHelpdeskOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>गाइड व सहायता केंद्र खोलें</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Developer Profile Link Card in Mobile App - Visible to ALL */}
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white border border-slate-700 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                          <CodeXml className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-white">Ashish Dey</div>
                          <div className="text-[10px] text-cyan-300 font-medium">Chief Executive Officer</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setMobileTab('developer')}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black cursor-pointer shadow-xs"
                      >
                        View Profile
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300 text-left">
                      Janpad Panchayat Baderajpur, District Kondagaon (C.G.)
                    </p>
                  </div>

                  {/* Member Logout Button */}
                  <div className="pt-2">
                    <button
                      onClick={logout}
                      className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Logout (लॉगआउट करें)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: DEVELOPER PROFILE (ASHISH DEY) */}
            {mobileTab === 'developer' && renderDeveloperProfile(() => setMobileTab('home'))}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      {isMemberExpired ? (
        <div className="px-4 py-3 bg-rose-50 border-t border-rose-200 text-center flex items-center justify-center gap-2 text-xs font-bold text-rose-800 shrink-0">
          <Lock className="w-4 h-4 text-rose-600 shrink-0" />
          <span>ऐप लॉक है • सदस्यता रिन्यू कराने पर खुलेगा</span>
        </div>
      ) : role === 'trainer' ? (
        <div className="px-2 py-2 bg-white/95 backdrop-blur-md border-t border-slate-300 flex items-center justify-around z-30 shrink-0 shadow-sm w-full">
          <button
            onClick={() => setTrainerTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              trainerTab === 'dashboard' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="truncate">Dashboard</span>
          </button>

          <button
            onClick={() => setTrainerTab('reports')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              trainerTab === 'reports' ? 'text-cyan-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="truncate">गोशवारा</span>
          </button>

          <button
            onClick={() => setTrainerTab('fitness')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              trainerTab === 'fitness' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="truncate">फिटनेस</span>
          </button>

          <button
            onClick={() => setTrainerTab('profile')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              trainerTab === 'profile' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="truncate">प्रोफ़ाइल</span>
          </button>
        </div>
      ) : (
        <div className="px-1 py-2 bg-white/95 backdrop-blur-md border-t border-slate-300 flex items-center justify-around z-30 shrink-0 shadow-sm w-full">
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'home' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="truncate">Home</span>
          </button>

          <button
            onClick={() => setMobileTab('pass')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'pass' ? 'text-cyan-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span className="truncate">Pass</span>
          </button>

          <button
            onClick={() => setMobileTab('photos')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'photos' ? 'text-cyan-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="truncate">Photos</span>
          </button>

          <button
            onClick={() => setMobileTab('body_index')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'body_index' ? 'text-purple-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="truncate">Index</span>
          </button>

          <button
            onClick={() => setMobileTab('workout')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'workout' ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="truncate">Workout</span>
          </button>

          <button
            onClick={() => setMobileTab('diet')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'diet' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span className="truncate">Diet</span>
          </button>

          <button
            onClick={() => setMobileTab('3d')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === '3d' ? 'text-cyan-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="truncate">3D</span>
          </button>

          <button
            onClick={() => setMobileTab('profile')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors flex-1 min-w-0 cursor-pointer ${
              mobileTab === 'profile' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="truncate">Profile</span>
          </button>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">नया 4-अंकीय पिन बनाएं</h3>
                  <p className="text-[10px] text-slate-500">कियोस्क एवं ऐप लॉगिन के लिए</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPin} className="space-y-3">
              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pinSuccessToast}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>नया 4-अंकीय पिन *</span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPin ? 'छुपाएं' : 'दिखाएं'}</span>
                  </button>
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.8em] text-2xl font-mono font-black py-2 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  नया पिन दोबारा दर्ज करें *
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.8em] text-2xl font-mono font-black py-2 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 shadow-inner"
                />
              </div>

              {/* Touch keypad for mobile */}
              <div className="pt-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => {
                        if (k === 'C') {
                          if (newPin.length < 4) setNewPin('');
                          else setConfirmPin('');
                        } else if (k === '⌫') {
                          if (confirmPin.length > 0) setConfirmPin((p) => p.slice(0, -1));
                          else setNewPin((p) => p.slice(0, -1));
                        } else {
                          if (newPin.length < 4) setNewPin((p) => p + k);
                          else if (confirmPin.length < 4) setConfirmPin((p) => p + k);
                        }
                      }}
                      className={`h-9 font-mono font-bold text-sm rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                        k === 'C'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                          : k === '⌫'
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPin || newPin.length !== 4 || confirmPin.length !== 4}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSubmittingPin ? 'सुरक्षित...' : 'पिन बदलें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stats Modal (Height, Weight, Target Weight) */}
      {isEditStatsModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">ऊंचाई व वजन अपडेट करें</h3>
                  <p className="text-[10px] text-slate-500">लाइव BMI व फिटनेस ट्रैकिंग हेतु</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStatsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberStats} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 flex justify-between">
                  <span>ऊंचाई (Height cm) *</span>
                  <span className="text-[10px] text-cyan-700 font-bold">~{((Number(editHeight) || 172) / 30.48).toFixed(1)} Feet</span>
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={250}
                  value={editHeight}
                  onChange={(e) => setEditHeight(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-500 font-bold text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 flex justify-between">
                  <span>वर्तमान वजन (Weight kg) *</span>
                  <span className="text-[10px] text-amber-700 font-bold">
                    BMI: {((Number(editWeight) || 70) / Math.pow((Number(editHeight) || 172) / 100, 2)).toFixed(1)}
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min={30}
                  max={250}
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-500 font-bold text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  लक्ष्य वजन (Target Weight kg) *
                </label>
                <input
                  type="number"
                  required
                  min={30}
                  max={250}
                  value={editTargetWeight}
                  onChange={(e) => setEditTargetWeight(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-500 font-bold text-sm text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditStatsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If running on actual mobile device or PWA: 100% full screen
  if (isRealMobile) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex flex-col justify-between relative text-slate-900 overflow-x-hidden">
        {screenContent}
        {selectedInvoice && (
          <InvoiceModal member={member} onClose={() => setSelectedInvoice(false)} />
        )}
        {isHelpdeskOpen && role === 'member' && (
          <AppHelpdeskModal
            isOpen={isHelpdeskOpen}
            onClose={() => setIsHelpdeskOpen(false)}
            onNavigateTab={(tab) => {
              setMobileTab(tab as any);
              setIsHelpdeskOpen(false);
            }}
            memberName={member?.name}
          />
        )}
      </div>
    );
  }

  // Desktop preview: user can toggle between Fit Screen and Phone Mockup
  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center relative">
      {/* Top Controls Bar */}
      <div className={`w-full ${desktopViewMode === 'fit_screen' ? 'max-w-2xl' : 'max-w-sm'} mb-4 flex items-center justify-between text-xs text-slate-300 transition-all`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">स्मार्टफोन ऐप व्यू (Light UI)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <button
            onClick={() => setDesktopViewMode(desktopViewMode === 'fit_screen' ? 'phone_frame' : 'fit_screen')}
            title="Toggle between Fit Screen and Phone Frame"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer transition-colors"
          >
            {desktopViewMode === 'fit_screen' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>फोन फ्रेम</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>फिट स्क्रीन</span>
              </>
            )}
          </button>

          <button
            onClick={onExitMobileView}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:brightness-110 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Desktop View</span>
            <span>🖥️</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {desktopViewMode === 'fit_screen' ? (
        <div className="relative w-full max-w-2xl min-h-[85vh] max-h-[92vh] bg-slate-100 rounded-3xl shadow-2xl ring-1 ring-slate-700 border border-slate-700 flex flex-col justify-between overflow-hidden">
          {screenContent}
        </div>
      ) : (
        <div className="relative w-[390px] h-[820px] bg-slate-950 rounded-[50px] p-3 shadow-2xl shadow-amber-500/10 ring-1 ring-slate-700 border-4 border-slate-700 flex flex-col justify-between overflow-hidden">
          {/* Hardware Silent Switch & Volume Rocker */}
          <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l-md" />
          <div className="absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l-md" />
          <div className="absolute -right-1 top-28 w-1 h-16 bg-slate-700 rounded-r-md" />

          {screenContent}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal member={member} onClose={() => setSelectedInvoice(false)} />
      )}

      {/* Helpdesk & App Guide Modal */}
      {isHelpdeskOpen && role === 'member' && (
        <AppHelpdeskModal
          isOpen={isHelpdeskOpen}
          onClose={() => setIsHelpdeskOpen(false)}
          onNavigateTab={(tab) => {
            setMobileTab(tab as any);
            setIsHelpdeskOpen(false);
          }}
          memberName={member?.name}
        />
      )}
    </div>
  );
};
