import React, { useState, useEffect } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, PT_PRICING } from '../../utils/formatters';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import { MemberProgressChart } from '../progress/MemberProgressChart';
import { TrainerDietModal } from '../trainer/TrainerDietModal';
import { TrainerWorkoutModal } from '../trainer/TrainerWorkoutModal';
import { MemberRegisterModal } from '../members/MemberRegisterModal';
import { localDb } from '../../db/localDatabase';
import { CustomDietPlan, CustomWorkoutPlan, StaffDailyAttendance, WorkoutDay, Staff } from '../../types';
import { generateAutomaticCustomDiet, generateAutomaticCustomWorkout, generateWorkoutRoutine, calculateBMR, calculateTDEE } from '../../utils/fitnessCalculator';
import {
  Award,
  Users,
  Dumbbell,
  Clock,
  CheckCircle,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  Utensils,
  PlusCircle,
  Edit3,
  ClipboardList,
  Flame,
  ChevronRight,
  Sparkles,
  MapPin,
  LogOut,
  Scale,
  Activity,
  Apple,
  Drumstick,
  Egg,
  Plus,
  X,
  TrendingUp,
} from 'lucide-react';

interface TrainerDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    staff,
    members,
    updateMember,
    attendance,
    markAttendance,
    checkOutPerson,
    checkOutByUserId,
    progressLogs,
    addProgressLog,
    addBodyIndexLog,
  } = useGymData();

  // Find trainer info
  const trainer =
    staff.find((s) => s.id === currentUser?.staffId || s.id === currentUser?.id || (s.userId && s.userId === currentUser?.id) || (s.phone && s.phone === currentUser?.phone)) ||
    staff.find((s) => s.role === 'trainer' && s.staffType === 'instructor') ||
    staff.find((s) => s.role === 'trainer') ||
    staff[0];

  // Strictly check if member is assigned to this specific trainer
  const isMemberAssignedToTrainer = (m: any, t: Staff) => {
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

  // Strictly assigned clients for this specific trainer
  const displayClients = members.filter((m) => trainer && isMemberAssignedToTrainer(m, trainer));

  const [selectedClient, setSelectedClient] = useState<any>(displayClients[0] || null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isLogMeasurementModalOpen, setIsLogMeasurementModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [clientDiet, setClientDiet] = useState<CustomDietPlan | undefined>(undefined);
  const [clientWorkout, setClientWorkout] = useState<CustomWorkoutPlan | undefined>(undefined);
  const [activeWorkoutDayIdx, setActiveWorkoutDayIdx] = useState<number>(0);
  const [autoDietToast, setAutoDietToast] = useState<string | null>(null);

  // System Form Mode (Simple vs Advanced Toggle for Dev)
  const [isAdvanced, setIsAdvanced] = useState<boolean>(() => localDb.getFormMode() === 'advanced');

  useEffect(() => {
    const handleModeChange = () => {
      setIsAdvanced(localDb.getFormMode() === 'advanced');
    };
    window.addEventListener('kf_form_mode_change', handleModeChange);
    return () => window.removeEventListener('kf_form_mode_change', handleModeChange);
  }, []);

  const isDeveloper = currentUser?.email === 'admin@kaushikfitness.com' || currentUser?.phone === '9826189001' || currentUser?.id === 'usr-1' || currentUser?.role === 'admin' || (typeof window !== 'undefined' && localStorage.getItem('kf_dev_unlocked') === 'true');
  const showAllDietOptions = isDeveloper && isAdvanced;

  // Sync selected client if list updates
  useEffect(() => {
    if (!selectedClient && displayClients.length > 0) {
      setSelectedClient(displayClients[0]);
    } else if (selectedClient && !displayClients.some((c) => c.id === selectedClient.id)) {
      setSelectedClient(displayClients[0] || null);
    }
  }, [displayClients, selectedClient]);

  // Form for logging new body measurements
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    chestInches: '',
    waistInches: '',
    bicepsInches: '',
    thighsInches: '',
    hipsInches: '',
    bodyFatPercentage: '',
    benchPressPR: '',
    squatPR: '',
    deadliftPR: '',
    notes: '',
  });

  // Load client's diet and workout plan
  useEffect(() => {
    if (selectedClient) {
      const diet = localDb.getMemberDiet(selectedClient.id);
      setClientDiet(diet);
      const workout = localDb.getMemberWorkout(selectedClient.id);
      setClientWorkout(workout);
      setActiveWorkoutDayIdx(0);
    }
  }, [selectedClient]);

  const todayDate = new Date().toISOString().split('T')[0];
  const [trainerDailyAtt, setTrainerDailyAtt] = useState<StaffDailyAttendance | undefined>(() => {
    return localDb.getStaffDailyAttendance().find((a) => (a.staffId === trainer.id || a.staffId === 'usr-2') && a.date === todayDate);
  });
  const [attFeedback, setAttFeedback] = useState<string | null>(null);

  // Calendar month state for PT Attendance Calendar
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Filter attendance logs for selected client
  const clientAttendanceLogs = selectedClient
    ? attendance.filter((a) => {
        if (a.userId && (a.userId === selectedClient.id || a.userId === selectedClient.userId)) return true;
        if (a.memberCode && selectedClient.memberCode && a.memberCode.toLowerCase() === selectedClient.memberCode.toLowerCase()) return true;
        if (a.userName && selectedClient.name && a.userName.toLowerCase() === selectedClient.name.toLowerCase()) return true;
        return false;
      })
    : [];

  const attendedDatesMap = new Map<string, typeof clientAttendanceLogs[0]>();
  clientAttendanceLogs.forEach((l) => {
    if (l.date && !attendedDatesMap.has(l.date)) {
      attendedDatesMap.set(l.date, l);
    }
  });

  const attendedSessionsCount = attendedDatesMap.size;
  const ptMonthsTotal = selectedClient?.ptDuration === '3_months' ? 3 : selectedClient?.ptDuration === '2_months' ? 2 : 1;
  const ptMonthlyQuota = selectedClient?.ptSessionsTotal ? Math.round(selectedClient.ptSessionsTotal / ptMonthsTotal) : 12;
  const totalSessions = selectedClient?.ptSessionsTotal || (ptMonthlyQuota * ptMonthsTotal);
  const remainingSessions = Math.max(0, totalSessions - attendedSessionsCount);
  const sessionPct = Math.min(100, Math.round((attendedSessionsCount / totalSessions) * 100));

  const isClientAttendedToday = attendedDatesMap.has(todayDate);

  // Joining Date / Start Date of PT Cycle
  const clientJoiningDateStr = selectedClient?.joiningDate || selectedClient?.joinDate || todayDate;

  // Build Month 1, Month 2, Month 3 cycle periods from joining date
  const ptPeriods = Array.from({ length: ptMonthsTotal }).map((_, idx) => {
    const parts = (clientJoiningDateStr || todayDate).split('-').map(Number);
    const startYear = parts[0] || new Date().getFullYear();
    const startMonth = (parts[1] || (new Date().getMonth() + 1)) - 1;
    const startDay = parts[2] || new Date().getDate();

    const pStart = new Date(startYear, startMonth + idx, startDay);
    const pEnd = new Date(startYear, startMonth + idx + 1, startDay);
    pEnd.setDate(pEnd.getDate() - 1);

    const sStr = `${pStart.getFullYear()}-${String(pStart.getMonth() + 1).padStart(2, '0')}-${String(pStart.getDate()).padStart(2, '0')}`;
    const eStr = `${pEnd.getFullYear()}-${String(pEnd.getMonth() + 1).padStart(2, '0')}-${String(pEnd.getDate()).padStart(2, '0')}`;

    const attendedInPeriod = Array.from(attendedDatesMap.keys()).filter((date) => date >= sStr && date <= eStr);
    const count = attendedInPeriod.length;
    const remaining = Math.max(0, ptMonthlyQuota - count);
    const pct = Math.min(100, Math.round((count / ptMonthlyQuota) * 100));

    let status: 'completed' | 'in_progress' | 'upcoming' = 'upcoming';
    if (todayDate > eStr || count >= ptMonthlyQuota) {
      status = 'completed';
    } else if (todayDate >= sStr && todayDate <= eStr) {
      status = 'in_progress';
    }

    return {
      index: idx,
      label: `माह ${idx + 1} (Month ${idx + 1})`,
      startDateStr: sStr,
      endDateStr: eStr,
      startDateObj: pStart,
      endDateObj: pEnd,
      quota: ptMonthlyQuota,
      attendedDates: attendedInPeriod,
      attendedCount: count,
      remaining,
      pct,
      status,
    };
  });

  const [activePtTab, setActivePtTab] = useState<'0' | '1' | '2' | 'goswara'>('0');

  useEffect(() => {
    setActivePtTab('0');
    if (ptPeriods[0]?.startDateObj) {
      setCalendarMonth(new Date(ptPeriods[0].startDateObj));
    }
  }, [selectedClient?.id, ptMonthsTotal]);

  const selectedPeriodIdx = activePtTab === 'goswara' ? 0 : Math.min(Number(activePtTab), ptPeriods.length - 1);
  const activePeriod = ptPeriods[selectedPeriodIdx] || ptPeriods[0];

  const handleTrainerQuickMarkAttendance = async () => {
    if (!selectedClient) return;
    try {
      const res = await markAttendance(selectedClient.pin || selectedClient.memberCode || selectedClient.id, 'pin');
      setAutoDietToast(`✅ ${selectedClient.name} की उपस्थिति दर्ज: ${res.message}`);
      setTimeout(() => setAutoDietToast(null), 5000);
    } catch {
      alert('हाजिरी दर्ज करने में त्रुटि आई।');
    }
  };

  // Find active live gym floor occupancy record for this trainer
  const trainerFloorRecord = attendance.find(
    (a) =>
      (a.userId === trainer.id ||
        (trainer.userId && a.userId === trainer.userId) ||
        (trainer.staffCode && a.staffCode === trainer.staffCode) ||
        a.userName.trim().toLowerCase() === trainer.name.trim().toLowerCase() ||
        (trainer.id === 'usr-2' && a.id === 'att-2')) &&
      a.date === todayDate &&
      !a.checkOutTime
  );
  const isTrainerOnLiveFloor = !!trainerFloorRecord;

  const handleTrainerDutyAction = (action: 'login' | 'logout') => {
    const res = localDb.recordGeofencedAttendance(trainer.id, trainer.name, 'trainer', action);
    const updated = localDb.getStaffDailyAttendance().find((a) => (a.staffId === trainer.id || a.staffId === 'usr-2') && a.date === todayDate);
    setTrainerDailyAtt(updated);

    // Sync with Live Gym Floor Attendance
    if (action === 'logout') {
      if (trainerFloorRecord) {
        checkOutPerson(trainerFloorRecord.id);
      } else {
        checkOutByUserId(trainer.id);
        checkOutByUserId('usr-2');
        checkOutByUserId(trainer.name);
      }
    } else {
      // Clock in: Also ensure marked on gym floor if not yet present
      if (!trainerFloorRecord) {
        markAttendance(trainer.pin || trainer.staffCode || trainer.id);
      }
    }

    setAttFeedback(res.message);
    setTimeout(() => setAttFeedback(null), 5000);
  };

  // Find all progress logs for selected client across formats (mem-X or prof-X)
  const clientLogs = progressLogs.filter((p) => {
    if (!selectedClient) return false;
    if (p.memberId === selectedClient.id || p.memberId === selectedClient.userId) return true;
    const pNum = (p.memberId || '').replace('mem-', '').replace('prof-', '');
    const cNum = (selectedClient.id || '').replace('mem-', '').replace('prof-', '');
    return Boolean(pNum && cNum && pNum === cNum);
  });

  // Fallback to body index logs from database if progressLogs does not yet have entries
  const fallbackBodyLogs: typeof clientLogs = (localDb.getBodyIndexLogs(selectedClient?.id || '') || []).map((b, idx) => ({
    id: `fb-${b.id || idx}`,
    memberId: selectedClient?.id || '',
    date: b.date ? b.date.split('T')[0] : new Date().toISOString().split('T')[0],
    weightKg: b.weightKg,
    chestInches: b.chestInches,
    waistInches: b.waistInches,
    bicepsInches: b.bicepsInches,
    thighsInches: b.thighsInches,
    hipsInches: b.hipsInches,
    bodyFatPercentage: b.bodyFatPct,
    bmi: b.bmi,
    notes: b.notes,
  }));

  const effectiveClientLogs = clientLogs.length > 0 ? clientLogs : fallbackBodyLogs;

  // Client physical stats calculation
  const clientWeight = selectedClient?.weightKg || 75;
  const clientHeight = selectedClient?.heightCm || 175;
  const clientAge = selectedClient?.age || 26;
  const clientGender = (selectedClient?.gender === 'female' ? 'female' : 'male') as 'male' | 'female';
  const clientGoal = selectedClient?.fitnessGoal || 'muscle_building';
  const clientBmi = Number((clientWeight / Math.pow(clientHeight / 100, 2)).toFixed(1));
  const clientBmr = calculateBMR(clientWeight, clientHeight, clientAge, clientGender);
  const clientTdee = calculateTDEE(clientBmr, 'active');

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionNotes.trim()) return;
    setNoteSaved(true);
    setTimeout(() => {
      setNoteSaved(false);
      setSessionNotes('');
    }, 3000);
  };

  const handleDietSaved = (savedDiet: CustomDietPlan) => {
    localDb.saveMemberDiet(savedDiet);
    setClientDiet(savedDiet);
  };

  const handleWorkoutSaved = (savedWorkout: CustomWorkoutPlan) => {
    localDb.saveMemberWorkout(savedWorkout);
    setClientWorkout(savedWorkout);
    setAutoDietToast(
      `✅ ${selectedClient.name} का साप्ताहिक वर्कआउट रूटीन सफलतापूर्वक सुरक्षित व अपडेट हो गया!`
    );
    setTimeout(() => setAutoDietToast(null), 5000);
  };

  // 1-Click Auto Diet Generator based on member's body mass & goal
  const handleAutoGenerateDiet = (dietType: 'veg' | 'non_veg' | 'eggitarian') => {
    if (!selectedClient) return;

    const autoDiet = generateAutomaticCustomDiet({
      memberId: selectedClient.id,
      memberName: selectedClient.name,
      trainerId: trainer.id,
      trainerName: trainer.name,
      weightKg: clientWeight,
      heightCm: clientHeight,
      age: clientAge,
      gender: clientGender,
      goal: clientGoal,
      dietType,
    });

    localDb.saveMemberDiet(autoDiet);
    setClientDiet(autoDiet);

    const typeLabel =
      dietType === 'veg'
        ? 'शाकाहारी (Pure Veg)'
        : dietType === 'non_veg'
        ? 'मांसाहारी (Non-Veg)'
        : 'अंडे के साथ (Eggitarian)';

    setAutoDietToast(
      `✨ ${selectedClient.name} के लिए ${typeLabel} डाइट चार्ट (${autoDiet.targetCalories} kcal, ${autoDiet.targetProtein}g प्रोटीन) बॉडी मास के आधार पर स्वतः तैयार हो गया है!`
    );
    setTimeout(() => setAutoDietToast(null), 6000);
  };

  const handleOpenLogModal = () => {
    if (!selectedClient) return;
    setLogForm({
      date: new Date().toISOString().split('T')[0],
      weightKg: selectedClient.weightKg ? String(selectedClient.weightKg) : '',
      chestInches: selectedClient.measurements?.chest ? String(selectedClient.measurements.chest) : '',
      waistInches: selectedClient.measurements?.waist ? String(selectedClient.measurements.waist) : '',
      bicepsInches: selectedClient.measurements?.biceps ? String(selectedClient.measurements.biceps) : '',
      thighsInches: selectedClient.measurements?.thighs ? String(selectedClient.measurements.thighs) : '',
      hipsInches: selectedClient.measurements?.hips ? String(selectedClient.measurements.hips) : '',
      bodyFatPercentage: selectedClient.bodyFatPercentage ? String(selectedClient.bodyFatPercentage) : '',
      benchPressPR: '',
      squatPR: '',
      deadliftPR: '',
      notes: '',
    });
    setIsLogMeasurementModalOpen(true);
  };

  const handleSaveNewMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !logForm.weightKg) return;

    const weightNum = parseFloat(logForm.weightKg);
    const chestNum = logForm.chestInches ? parseFloat(logForm.chestInches) : undefined;
    const waistNum = logForm.waistInches ? parseFloat(logForm.waistInches) : undefined;
    const bicepsNum = logForm.bicepsInches ? parseFloat(logForm.bicepsInches) : undefined;
    const thighsNum = logForm.thighsInches ? parseFloat(logForm.thighsInches) : undefined;
    const hipsNum = logForm.hipsInches ? parseFloat(logForm.hipsInches) : undefined;
    const bfNum = logForm.bodyFatPercentage ? parseFloat(logForm.bodyFatPercentage) : undefined;
    const benchNum = logForm.benchPressPR ? parseFloat(logForm.benchPressPR) : undefined;
    const squatNum = logForm.squatPR ? parseFloat(logForm.squatPR) : undefined;
    const deadliftNum = logForm.deadliftPR ? parseFloat(logForm.deadliftPR) : undefined;

    const trainerNote = logForm.notes
      ? `ट्रेनर ${trainer.name}: ${logForm.notes}`
      : `Coach ${trainer.name} द्वारा मापा गया (${logForm.date})`;

    const newMeasurements = {
      chest: chestNum ?? (selectedClient.measurements?.chest || 0),
      waist: waistNum ?? (selectedClient.measurements?.waist || 0),
      biceps: bicepsNum ?? (selectedClient.measurements?.biceps || 0),
      thighs: thighsNum ?? (selectedClient.measurements?.thighs || 0),
      hips: hipsNum ?? (selectedClient.measurements?.hips || 0),
    };

    // 1. Add progress log
    addProgressLog({
      memberId: selectedClient.id,
      date: logForm.date,
      weightKg: weightNum,
      chestInches: chestNum,
      waistInches: waistNum,
      bicepsInches: bicepsNum,
      thighsInches: thighsNum,
      hipsInches: hipsNum,
      bodyFatPercentage: bfNum,
      benchPressPR: benchNum,
      squatPR: squatNum,
      deadliftPR: deadliftNum,
      notes: trainerNote,
    });

    // 2. Add body index log
    addBodyIndexLog({
      memberId: selectedClient.id,
      date: logForm.date,
      weightKg: weightNum,
      heightCm: clientHeight,
      bmi: Number((weightNum / Math.pow(clientHeight / 100, 2)).toFixed(1)),
      chestInches: newMeasurements.chest,
      waistInches: newMeasurements.waist,
      bicepsInches: newMeasurements.biceps,
      thighsInches: newMeasurements.thighs,
      hipsInches: hipsNum,
      bodyFatPct: bfNum,
      notes: trainerNote,
    });

    // 3. Update member's core record (including notes so member dashboard reflects update)
    updateMember(selectedClient.id, {
      weightKg: weightNum,
      bodyFatPercentage: bfNum || selectedClient.bodyFatPercentage,
      notes: trainerNote,
      measurements: newMeasurements,
    });

    // 4. Update custom workout & custom diet reflecting new weight/measurements
    const updatedWorkout = generateAutomaticCustomWorkout({
      memberId: selectedClient.id,
      memberName: selectedClient.name,
      goal: selectedClient.fitnessGoal || 'muscle_building',
      trainerId: trainer.id,
      trainerName: trainer.name,
    });
    localDb.saveMemberWorkout(updatedWorkout);

    const updatedDiet = generateAutomaticCustomDiet({
      memberId: selectedClient.id,
      memberName: selectedClient.name,
      weightKg: weightNum,
      heightCm: clientHeight,
      age: selectedClient.age || 25,
      gender: selectedClient.gender || 'male',
      goal: selectedClient.fitnessGoal || 'muscle_building',
      dietType: selectedClient.dietPreference || 'veg',
      trainerId: trainer.id,
      trainerName: trainer.name,
    });
    localDb.saveMemberDiet(updatedDiet);

    // Update selected client in local state
    setSelectedClient((prev: any) => ({
      ...prev,
      weightKg: weightNum,
      bodyFatPercentage: bfNum || prev.bodyFatPercentage,
      notes: trainerNote,
      measurements: newMeasurements,
    }));

    // 5. Broadcast real-time event for member instant view update
    window.dispatchEvent(new Event('kf_body_index_updated'));
    window.dispatchEvent(new Event('storage'));

    setIsLogMeasurementModalOpen(false);
    setAutoDietToast(
      `✅ ${selectedClient.name} का नया शारीरिक माप सफलतापूर्वक दर्ज हो गया! ट्रांसफॉर्मेशन चार्ट अपडेट हुआ।`
    );
    setTimeout(() => setAutoDietToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Trainer Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {trainer.avatarUrl ? (
              <img
                src={trainer.avatarUrl}
                alt={trainer.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-300 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center text-2xl font-black text-cyan-800 shadow-sm">
                {trainer.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Award className="w-3.5 h-3.5 text-cyan-600" />
                पर्सनल ट्रेनिंग व कोचिंग पोर्टल • कोच ID: {trainer.staffCode || trainer.id}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Coach {trainer.name}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {trainer.designation} • Specialization: {trainer.specialization?.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {/* Live Floor Status & 1-Click Floor Check-Out */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${
              isTrainerOnLiveFloor
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isTrainerOnLiveFloor ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`} />
                <span className="font-bold">
                  {isTrainerOnLiveFloor ? 'लाइव जिम फ्लोर: उपस्थित' : 'जिम फ्लोर: बाहर'}
                </span>
              </div>
              {isTrainerOnLiveFloor && (
                <button
                  type="button"
                  onClick={() => {
                    if (trainerFloorRecord) checkOutPerson(trainerFloorRecord.id);
                    else {
                      checkOutByUserId(trainer.id);
                      checkOutByUserId('usr-2');
                      checkOutByUserId(trainer.name);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  title="लाइव फ्लोर से चेक-आउट करें"
                >
                  <LogOut className="w-3 h-3" />
                  <span>फ्लोर से हटाएं</span>
                </button>
              )}
            </div>

            {/* Geofenced Duty Status Badge */}
            {isAdvanced && (
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">GPS Duty Status</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      trainerDailyAtt?.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : trainerDailyAtt?.status === 'absent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {trainerDailyAtt ? (trainerDailyAtt.status === 'present' ? 'P - उपस्थित' : 'A - परिधि से बाहर') : 'Off Duty'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {trainerDailyAtt?.checkInTime ? `In: ${trainerDailyAtt.checkInTime}` : 'Not Checked In'}
                    {trainerDailyAtt?.checkOutTime && ` • Out: ${trainerDailyAtt.checkOutTime}`}
                  </div>
                </div>

                {trainerDailyAtt?.checkInTime && !trainerDailyAtt?.checkOutTime ? (
                  <button
                    onClick={() => handleTrainerDutyAction('logout')}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Clock Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTrainerDutyAction('login')}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{trainerDailyAtt ? 'पुनः GPS In' : 'GPS Clock In'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {attFeedback && (
        <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>{attFeedback}</span>
        </div>
      )}

      {/* Trainer Stats Grid */}
      <div className={`grid grid-cols-2 ${isAdvanced ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Assigned PT Clients</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {displayClients.length} <span className="text-xs text-slate-400 font-normal">athletes</span>
          </div>
          <div className="text-[11px] text-cyan-700 font-medium mt-0.5">Personal training roster</div>
        </div>

        {isAdvanced && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase">Monthly Base Salary</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              ₹{trainer.salaryMonthly.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Salary disbursed by admin</div>
          </div>
        )}

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Client Diet Status</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {clientDiet ? 'Active Split' : 'Pending'}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Custom macros assigned</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Client Strength PRs</span>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">
            {clientLogs.length > 0 ? `${clientLogs[clientLogs.length - 1].benchPressPR || 0} kg` : 'Logged'}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">Bench Press current max</div>
        </div>
      </div>

      {/* Assigned PT Clients Selector Roster */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              <span>मेरे असाइन किए गए सदस्य ({trainer.name}'s Clients - {displayClients.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              कोच {trainer.name} के असाइन सदस्य: किसी भी सदस्य पर क्लिक करके उसकी शारीरिक प्रोग्रेस, ट्रांसफॉर्मेशन बदलाव और डाइट प्लान देखें व बदलें:
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>नया सदस्य जोड़ें (Add Member)</span>
          </button>
        </div>

        {displayClients.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              वर्तमान में कोच {trainer.name} को कोई सदस्य असाइन नहीं है।
            </div>
            <p className="text-xs text-slate-400">
              एडमिन द्वारा आपके नाम पर सदस्य असाइन किए जाने पर वे यहाँ दिखाई देंगे।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {displayClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-50/80 border-cyan-400 shadow-md ring-2 ring-cyan-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-slate-900 text-sm">{client.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{client.memberCode}</div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                        {client.ptDuration?.replace('_', ' ').toUpperCase() || 'PT CLIENT'}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                      <div>Goal: <strong className="text-amber-700 capitalize">{client.fitnessGoal?.replace('_', ' ')}</strong></div>
                      <div>Weight: <strong className="text-slate-800">{client.weightKg} kg</strong> (Target: {client.targetWeightKg || 80} kg)</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Status: Active</span>
                    <span className="text-cyan-700 font-bold flex items-center gap-0.5">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SELECTED CLIENT WORKSPACE */}
      {selectedClient && (
        <div className="space-y-6">
          {/* TOAST / FEEDBACK */}
          {autoDietToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">{autoDietToast}</div>
              <button
                type="button"
                onClick={() => setAutoDietToast(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. BODY MASS & AUTO DIET ENGINE BAR */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white p-5 rounded-2xl shadow-md border border-slate-700 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  बॉडी मास एवं ऑटो डाइट इंजन (Body Mass & Auto Diet)
                </div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{selectedClient.name} का बॉडी कम्पोज़ीशन व न्यूट्रिशन</span>
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  सदस्य के वजन ({clientWeight} kg) और लक्ष्य ({selectedClient.fitnessGoal?.replace('_', ' ')}) के अनुसार 1-क्लिक में पूर्ण भारतीय जिम डाइट तैयार करें:
                </p>
              </div>

              {/* Log Measurement Button */}
              <button
                type="button"
                onClick={handleOpenLogModal}
                className="self-start lg:self-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नया माप दर्ज करें (Log Body Index)</span>
              </button>
            </div>

            {/* Body Mass Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-3 border-t border-slate-700/70 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">वजन (Weight)</span>
                <span className="text-lg font-black text-white font-mono">{clientWeight} kg</span>
                <span className="text-[10px] text-cyan-300 block">लक्ष्य: {selectedClient.targetWeightKg || 80} kg</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">कद (Height)</span>
                <span className="text-lg font-black text-white font-mono">{clientHeight} cm</span>
                <span className="text-[10px] text-slate-300 block">{((clientHeight) / 30.48).toFixed(1)} feet</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">BMI इंडेक्स</span>
                <span className="text-lg font-black text-amber-400 font-mono">{clientBmi}</span>
                <span className="text-[10px] text-slate-300 block">
                  {clientBmi < 18.5 ? 'कम वजन' : clientBmi < 25 ? 'सामान्य' : 'अधिक वजन'}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">BMR (बेस कैलोरी)</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{clientBmr} kcal</span>
                <span className="text-[10px] text-slate-300 block">Resting Rate</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">TDEE (दैनिक ऊर्जा)</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{clientTdee} kcal</span>
                <span className="text-[10px] text-slate-300 block">Active Burn</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">फिटनेस लक्ष्य</span>
                <span className="text-sm font-black text-white capitalize block mt-0.5 truncate">
                  {selectedClient.fitnessGoal?.replace('_', ' ') || 'Muscle'}
                </span>
                <span className="text-[10px] text-cyan-300 block font-mono">
                  {selectedClient.gender === 'female' ? 'Female' : 'Male'}, {selectedClient.age || 26}y
                </span>
              </div>
            </div>

            {/* 1-Click Veg / Non-Veg Diet Selector Toolbar */}
            <div className="pt-3 border-t border-slate-700/70">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">बॉडी मास आधारित ऑटो डाइट चार्ट जनरेट करें (Select Diet Type):</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(showAllDietOptions || selectedClient.dietPreference !== 'non_veg') && (
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateDiet('veg')}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      title="पनीर, सोया, दाल, ओट्स, चना आधारित शाकाहारी डाइट"
                    >
                      <Apple className="w-3.5 h-3.5" />
                      <span>🥗 1-Click Pure Veg (शाकाहारी)</span>
                    </button>
                  )}

                  {(showAllDietOptions || selectedClient.dietPreference === 'non_veg') && (
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateDiet('non_veg')}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      title="चिकन, अंडे, मछली आधारित उच्च प्रोटीन डाइट"
                    >
                      <Drumstick className="w-3.5 h-3.5" />
                      <span>🍗 1-Click Non-Veg (मांसाहारी)</span>
                    </button>
                  )}

                  {showAllDietOptions && (
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateDiet('eggitarian')}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      title="उबले अंडे + शाकाहारी प्रोटीन युक्त डाइट"
                    >
                      <Egg className="w-3.5 h-3.5" />
                      <span>🥚 1-Click Eggitarian (अंडा युक्त)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsDietModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-700 hover:bg-slate-600 text-cyan-200 border border-slate-600 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="डाइट प्लान में कोई भी बदलाव या कस्टम भोजन जोड़ें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>✏️ एडिट / कस्टम डाइट</span>
                  </button>
                </div>
              </div>

              {clientDiet && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs bg-cyan-950/70 border border-cyan-800/70 px-3 py-1.5 rounded-xl text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    वर्तमान एक्टिव डाइट: <strong>{clientDiet.dietType === 'veg' ? '🥗 शाकाहारी (Pure Veg)' : clientDiet.dietType === 'non_veg' ? '🍗 मांसाहारी (Non-Veg)' : clientDiet.dietType === 'eggitarian' ? '🥚 अंडे के साथ (Eggitarian)' : 'कस्टम न्यूट्रिशन'}</strong> • {clientDiet.targetCalories} kcal • P: {clientDiet.targetProtein}g • C: {clientDiet.targetCarbs}g • F: {clientDiet.targetFats}g ({clientDiet.meals?.length || 0} मील्स)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. VISUAL PROGRESS & TRANSFORMATION CHANGE CHART */}
          <MemberProgressChart
            logs={effectiveClientLogs}
            memberName={selectedClient.name}
            targetWeightKg={selectedClient.targetWeightKg || 82}
            onOpenLogModal={handleOpenLogModal}
          />

          {/* 2.3. MEMBER PT ATTENDANCE CALENDAR & SESSIONS TRACKER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-bold uppercase tracking-wider">
                    <CalendarCheck className="w-3.5 h-3.5 text-cyan-600" />
                    PT Attendance & Session Tracker
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedClient.ptDuration?.replace('_', ' ').toUpperCase() || '1 MONTH'} • {totalSessions} SESSIONS ({ptMonthlyQuota} सत्र/माह)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    शुरुआत: {clientJoiningDateStr}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>{selectedClient.name} का हाजिरी कैलेंडर एवं पीटी सत्र</span>
                </h3>
                <p className="text-xs text-slate-500">
                  सदस्य द्वारा 4-अंकीय पिन से दर्ज की गई हाजिरी यहाँ कैलेंडर में रियल-टाइम ऑटो-अपडेट होती है।
                </p>
              </div>

              {/* Quick Today Mark / Status */}
              <div className="flex items-center gap-2">
                {isClientAttendedToday ? (
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>आज उपस्थित ({attendedDatesMap.get(todayDate)?.checkInTime})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleTrainerQuickMarkAttendance}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>आज की हाजिरी लगाएं</span>
                  </button>
                )}
              </div>
            </div>

            {/* PT Duration & Month Cycle Tabs (Month 1, Month 2, Month 3, and Goswara) */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {ptPeriods.map((p) => {
                const isSelected = activePtTab === String(p.index);
                return (
                  <button
                    key={p.index}
                    type="button"
                    onClick={() => {
                      setActivePtTab(String(p.index) as any);
                      setCalendarMonth(new Date(p.startDateObj));
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.attendedCount}/{p.quota}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActivePtTab('goswara')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ml-auto ${
                  activePtTab === 'goswara'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
                }`}
              >
                <span>📊 संपूर्ण गोशवारा (All Months Summary)</span>
              </button>
            </div>

            {/* IF GOSWARA VIEW SELECTED */}
            {activePtTab === 'goswara' ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-cyan-50/70 border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-amber-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                        📊 पीटी अटेंडेंस गोशवारा पत्रक (PT Attendance Goswara Abstract)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                        {selectedClient.ptDuration?.replace('_', ' ').toUpperCase()} • {totalSessions} कुल सत्र
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      शामिल होने की तिथि (Joining Date): <strong className="text-slate-900">{clientJoiningDateStr}</strong> से चक्र प्रारंभ
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">माह / चक्र</th>
                        <th className="py-2.5 px-3">दिनांक अवधि (Period)</th>
                        <th className="py-2.5 px-3 text-center">कुल सत्र कोटा</th>
                        <th className="py-2.5 px-3 text-center">उपस्थित सत्र</th>
                        <th className="py-2.5 px-3 text-center">शेष सत्र</th>
                        <th className="py-2.5 px-3 text-center">उपस्थिति %</th>
                        <th className="py-2.5 px-3 text-center">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {ptPeriods.map((p) => (
                        <tr key={p.index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span>{p.label}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {p.startDateStr} से {p.endDateStr}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                            {p.quota}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-emerald-700">
                            {p.attendedCount}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                            {p.remaining}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-cyan-800">
                            {p.pct}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              p.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : p.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {p.status === 'completed' ? 'पूर्ण' : p.status === 'in_progress' ? 'प्रगति पर' : 'आगामी'}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Summary Total Row */}
                      <tr className="bg-amber-100/70 font-black text-slate-950 border-t-2 border-amber-300">
                        <td className="py-3 px-3 uppercase text-amber-950">
                          कुल योग (Grand Total)
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {ptMonthsTotal} माह पैकेज
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black">
                          {ptMonthlyQuota * ptMonthsTotal} सत्र
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-emerald-800">
                          {ptPeriods.reduce((acc, curr) => acc + curr.attendedCount, 0)} सत्र
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-amber-800">
                          {ptPeriods.reduce((acc, curr) => acc + curr.remaining, 0)} सत्र
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-cyan-900">
                          {sessionPct}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[11px] font-bold text-slate-700 font-mono">
                            {attendedSessionsCount}/{totalSessions}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // CALENDAR VIEW FOR ACTIVE PERIOD
              <>
                {/* Active Period Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{activePeriod.label} कोटा</span>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                      {activePeriod.quota} <span className="text-xs font-normal text-slate-500">Sessions</span>
                    </div>
                    <div className="text-[10px] text-cyan-700 mt-0.5 font-mono truncate">{activePeriod.startDateStr} से {activePeriod.endDateStr}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">उपस्थित सत्र (Attended)</span>
                    <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                      {activePeriod.attendedCount} <span className="text-xs font-normal text-emerald-600">सत्र पूर्ण</span>
                    </div>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">{activePeriod.pct}% माह कोटा पूर्ण</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">बचे हुए सत्र (Remaining)</span>
                    <div className="text-xl font-black text-amber-700 font-mono mt-0.5">
                      {activePeriod.remaining} <span className="text-xs font-normal text-amber-600">सत्र शेष</span>
                    </div>
                    <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                      {activePeriod.status === 'completed' ? 'पूर्ण' : activePeriod.status === 'in_progress' ? 'सक्रिय माह' : 'आगामी माह'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200">
                    <span className="text-[10px] text-cyan-800 font-bold uppercase block">4-अंक पिन (Member PIN)</span>
                    <div className="text-xl font-black text-cyan-900 font-mono mt-0.5 tracking-wider">
                      {selectedClient.pin || '2222'}
                    </div>
                    <div className="text-[10px] text-cyan-800 mt-0.5">कियोस्क चेक-इन कोड</div>
                  </div>
                </div>

                {/* Progress Bar for Active Period */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{activePeriod.label} सत्र पूर्णता प्रगति ({activePeriod.startDateStr} से {activePeriod.endDateStr})</span>
                    <span className="font-mono text-cyan-800">{activePeriod.attendedCount} / {activePeriod.quota} सत्र ({activePeriod.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activePeriod.pct}%` }}
                    />
                  </div>
                </div>

                {/* Calendar Controls & Month Grid */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900 capitalize">
                        {calendarMonth.toLocaleDateString('hi-IN', { month: 'long', year: 'numeric' })}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(calendarMonth)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                        title="पिछला महीना"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(activePeriod.startDateObj))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs"
                      >
                        {activePeriod.label} प्रारंभ
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                        title="अगला महीना"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  {(() => {
                    const year = calendarMonth.getFullYear();
                    const month = calendarMonth.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDay = new Date(year, month, 1).getDay();
                    const offset = (firstDay + 6) % 7;
                    const weekdays = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];

                    return (
                      <div className="space-y-1">
                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                          {weekdays.map((w, wIdx) => (
                            <div key={wIdx} className={wIdx >= 5 ? 'text-amber-700' : ''}>
                              {w}
                            </div>
                          ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1 pt-1">
                          {Array.from({ length: offset }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-12 rounded-lg bg-slate-100/50" />
                          ))}

                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const isAttended = attendedDatesMap.has(dateStr);
                            const record = attendedDatesMap.get(dateStr);
                            const isToday = dateStr === todayDate;
                            const isInActivePeriod = dateStr >= activePeriod.startDateStr && dateStr <= activePeriod.endDateStr;

                            return (
                              <div
                                key={dateStr}
                                className={`min-h-12 p-1 rounded-lg border flex flex-col justify-between text-left transition-all ${
                                  isAttended
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                    : isToday
                                    ? 'bg-amber-50/60 border-amber-300 text-slate-900 ring-2 ring-amber-400/40'
                                    : isInActivePeriod
                                    ? 'bg-white border-cyan-300 text-slate-800'
                                    : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                                }`}
                              >
                                <div className="flex justify-between items-center text-[11px] leading-none">
                                  <span className={`font-mono font-bold ${isToday ? 'text-amber-700' : ''}`}>
                                    {dayNum}
                                  </span>
                                  {isAttended && (
                                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                                      ✓
                                    </span>
                                  )}
                                </div>

                                <div className="text-[9px] mt-0.5 truncate">
                                  {isAttended ? (
                                    <span className="text-emerald-700 font-semibold block truncate font-mono">
                                      {record?.checkInTime || 'Present'}
                                    </span>
                                  ) : isToday ? (
                                    <span className="text-amber-700 font-bold block">आज</span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Attendance Legend & Period indicators */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300 inline-block text-center text-[8px] font-bold text-emerald-800">✓</span>
                        <span>उपस्थित (Present)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300 inline-block text-center text-[8px] font-bold text-amber-800">•</span>
                        <span>आज (Today)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-white border border-cyan-300 inline-block"></span>
                        <span>{activePeriod.label} अवधि</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-cyan-800 font-mono font-medium">
                      अवधि: {activePeriod.startDateStr} से {activePeriod.endDateStr}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-cyan-800 font-semibold">
                कुल लॉग रिकॉर्ड: {clientAttendanceLogs.length} प्रविष्टियां
              </span>
              <span className="text-[11px] text-slate-400">
                4-Digit PIN Attendance Terminal द्वारा लाइव सिंक्रनाइज़्ड
              </span>
            </div>
          </div>

          {/* 2.5. CLIENT WEEKLY WORKOUT ROUTINE VIEWER & MODIFIER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                    <Dumbbell className="w-3 h-3 text-amber-600" />
                    Active Weekly Workout Split
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {clientWorkout?.goal ? clientWorkout.goal.replace('_', ' ') : selectedClient.fitnessGoal?.replace('_', ' ') || 'Muscle Building'}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedClient.name} का साप्ताहिक वर्कआउट प्लान (Weekly Workout Routine)
                </h3>
                <p className="text-xs text-slate-500">
                  {clientWorkout?.updatedAt
                    ? `अंतिम संशोधन: ${new Date(clientWorkout.updatedAt).toLocaleDateString('en-IN')}`
                    : 'ऑटो-जनरेटेड रूटीन सक्रिय है।'} • कोच: Coach {trainer.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>वर्कआउट रूटीन बदलें (Modify Workout Plan)</span>
                </button>
              </div>
            </div>

            {/* Day Tabs & Exercises */}
            {(() => {
              const workoutDaysList = clientWorkout?.days && clientWorkout.days.length > 0
                ? clientWorkout.days
                : generateWorkoutRoutine(selectedClient.fitnessGoal || 'muscle_building');
              const activeDay = workoutDaysList[activeWorkoutDayIdx] || workoutDaysList[0];

              return (
                <div className="space-y-3">
                  {/* Days pill buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {workoutDaysList.map((d, dIdx) => (
                      <button
                        key={dIdx}
                        type="button"
                        onClick={() => setActiveWorkoutDayIdx(dIdx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeWorkoutDayIdx === dIdx
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {d.dayName.split(':')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Day Content Card */}
                  {activeDay && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-slate-200 pb-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{activeDay.dayName}</h4>
                          <span className="text-xs text-amber-700 font-semibold">फोकस: {activeDay.focus}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {activeDay.exercises.length} Exercises
                        </span>
                      </div>

                      {/* Exercises Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {activeDay.exercises.map((ex, exIdx) => (
                          <div key={ex.id || exIdx} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-xs text-slate-900 leading-tight">
                                {exIdx + 1}. {ex.name}
                              </span>
                              <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 shrink-0">
                                {ex.targetMuscle}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                              <span>सेट्स: <strong className="text-slate-900">{ex.sets}</strong></span>
                              <span>रेप्स: <strong className="text-amber-700">{ex.reps}</strong></span>
                              <span>रेस्ट: <strong className="text-cyan-700">{ex.restSeconds}s</strong></span>
                            </div>
                            {ex.notes && (
                              <p className="text-[10px] text-slate-500 italic truncate">
                                • {ex.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {clientWorkout?.notes && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong>कोच निर्देश:</strong> {clientWorkout.notes}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 3. CLIENT DIET PLAN VIEWER & MODIFIER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    <Utensils className="w-3 h-3 text-emerald-600" />
                    Active Nutrition Plan
                  </div>
                  {clientDiet?.dietType && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      clientDiet.dietType === 'veg'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : clientDiet.dietType === 'non_veg'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {clientDiet.dietType === 'veg' ? '🥗 शाकाहारी (Pure Veg)' : clientDiet.dietType === 'non_veg' ? '🍗 मांसाहारी (Non-Veg)' : '🥚 अंडे के साथ (Eggitarian)'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedClient.name} का डाइट प्लान (Diet Routine)
                </h3>
                <p className="text-xs text-slate-500">
                  {clientDiet ? `अंतिम संशोधन: ${new Date(clientDiet.updatedAt).toLocaleDateString('en-IN')}` : 'डिफ़ॉल्ट पोषण प्लान सक्रिय है।'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDietModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Add / Modify Diet Plan (डाइट प्लान बदलें)</span>
                </button>
              </div>
            </div>

            {/* Diet Macros Pill Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs font-mono border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Daily Target Calories</span>
                <span className="text-base font-black text-slate-900">{clientDiet?.targetCalories || 2500} kcal</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Protein (प्रोटीन)</span>
                <span className="text-base font-black text-red-600">{clientDiet?.targetProtein || 150}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Carbohydrates (कार्ब्स)</span>
                <span className="text-base font-black text-amber-600">{clientDiet?.targetCarbs || 280}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Healthy Fats (फैट्स)</span>
                <span className="text-base font-black text-cyan-600">{clientDiet?.targetFats || 65}g</span>
              </div>
            </div>

            {/* Meals Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(clientDiet?.meals || []).map((meal, mIdx) => (
                <div key={mIdx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{meal.mealName}</h4>
                      <p className="text-[11px] text-slate-500">{meal.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-600 pt-1">
                    {meal.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>P: <strong className="text-red-600">{meal.proteinGrams}g</strong></span>
                    <span>C: <strong className="text-amber-600">{meal.carbsGrams}g</strong></span>
                    <span>F: <strong className="text-cyan-600">{meal.fatsGrams}g</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {clientDiet?.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                <strong>ट्रेनर गाइडलाइन:</strong> {clientDiet.notes}
              </div>
            )}
          </div>

          {/* 4. LOG SESSION NOTES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-600" />
              <span>Log Training Session Note for {selectedClient.name}</span>
            </h4>

            {noteSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Training note saved and synchronized with {selectedClient.name}'s profile!</span>
              </div>
            )}

            <form onSubmit={handleSaveNotes} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="e.g. Rahul hit 85kg on bench press today for 3 reps! Form was stable. Recommended adding 50g oats to post-workout."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />

              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Save Coach Session Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIET MODAL */}
      {selectedClient && (
        <TrainerDietModal
          isOpen={isDietModalOpen}
          onClose={() => setIsDietModalOpen(false)}
          memberId={selectedClient.id}
          memberName={selectedClient.name}
          trainerId={trainer.id}
          trainerName={trainer.name}
          dietPreference={selectedClient.dietPreference || 'veg'}
          isDeveloperMode={showAllDietOptions}
          memberStats={{
            weightKg: clientWeight,
            heightCm: clientHeight,
            age: clientAge,
            gender: clientGender,
            goal: clientGoal,
            bmi: clientBmi,
          }}
          existingDiet={clientDiet}
          onSave={handleDietSaved}
        />
      )}

      {/* WORKOUT MODAL */}
      {selectedClient && (
        <TrainerWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          memberId={selectedClient.id}
          memberName={selectedClient.name}
          trainerId={trainer.id}
          trainerName={trainer.name}
          memberStats={{
            weightKg: clientWeight,
            heightCm: clientHeight,
            goal: clientGoal,
          }}
          existingWorkout={clientWorkout}
          onSave={handleWorkoutSaved}
        />
      )}

      {/* MODAL: LOG NEW MEASUREMENTS & BODY INDEX */}
      {isLogMeasurementModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  Physical Transformation Entry
                </div>
                <h3 className="text-lg font-black text-white">
                  {selectedClient.name} का नया माप दर्ज करें (Log Body Measurements)
                </h3>
                <p className="text-xs text-slate-400">
                  वजन, चेस्ट, कमर, बाइसेप्स व लिफ्ट PRs दर्ज करें। यह सीधे प्रोग्रेस चार्ट में प्रदर्शित होगा।
                </p>
              </div>
              <button
                onClick={() => setIsLogMeasurementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewMeasurement} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    तारीख (Measurement Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Weight (kg) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    वर्तमान वजन (Weight in kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 78.5"
                    value={logForm.weightKg}
                    onChange={(e) => setLogForm({ ...logForm, weightKg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Chest */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सीना (Chest in inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 41.5"
                    value={logForm.chestInches}
                    onChange={(e) => setLogForm({ ...logForm, chestInches: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Waist */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कमर (Waist in inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 32.0"
                    value={logForm.waistInches}
                    onChange={(e) => setLogForm({ ...logForm, waistInches: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Biceps */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    डोले / बाइसेप्स (Biceps in inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={logForm.bicepsInches}
                    onChange={(e) => setLogForm({ ...logForm, bicepsInches: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Thighs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    जांघ (Thighs in inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 23.0"
                    value={logForm.thighsInches}
                    onChange={(e) => setLogForm({ ...logForm, thighsInches: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Hips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कूल्हे (Hips in inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 38.0"
                    value={logForm.hipsInches}
                    onChange={(e) => setLogForm({ ...logForm, hipsInches: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Body Fat % */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बॉडी फैट % (Body Fat Percentage)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 16.5"
                    value={logForm.bodyFatPercentage}
                    onChange={(e) => setLogForm({ ...logForm, bodyFatPercentage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Personal Records (PRs) */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  स्ट्रेंथ और लिफ्टिंग रिकॉर्ड्स (Personal Records - Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Bench Press PR (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 85"
                      value={logForm.benchPressPR}
                      onChange={(e) => setLogForm({ ...logForm, benchPressPR: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Squat PR (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 120"
                      value={logForm.squatPR}
                      onChange={(e) => setLogForm({ ...logForm, squatPR: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Deadlift PR (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 155"
                      value={logForm.deadliftPR}
                      onChange={(e) => setLogForm({ ...logForm, deadliftPR: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कोच रिमार्क / प्रोग्रेस नोट्स (Coach Remarks)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Great shoulder and arm definition. Bench press up by 5kg."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogMeasurementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>माप सेव करें (Save Measurement)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal for Trainer */}
      {isAddMemberModalOpen && (
        <MemberRegisterModal
          onClose={() => setIsAddMemberModalOpen(false)}
          lockedTrainerId={trainer.id}
          lockedTrainerName={trainer.name}
          onSuccess={(newMember) => {
            setIsAddMemberModalOpen(false);
            setSelectedClient(newMember);
            setAutoDietToast(`✅ नया सदस्य ${newMember.name} कोच ${trainer.name} के तहत सफलतापूर्वक जोड़ा गया!`);
            setTimeout(() => setAutoDietToast(null), 5000);
          }}
        />
      )}
    </div>
  );
};
