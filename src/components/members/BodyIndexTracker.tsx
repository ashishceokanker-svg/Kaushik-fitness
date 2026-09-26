import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Member, BodyIndexLog } from '../../types';
import { localDb } from '../../db/localDatabase';
import { generateAutomaticCustomWorkout, generateAutomaticCustomDiet } from '../../utils/fitnessCalculator';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  Ruler, 
  Sparkles, 
  Scale, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Camera,
} from 'lucide-react';
import { BodyPhotoTracker } from './BodyPhotoTracker';

interface BodyIndexTrackerProps {
  member: Member;
  canEdit?: boolean;
  isCompact?: boolean;
}

export const BodyIndexTracker: React.FC<BodyIndexTrackerProps> = ({ member, canEdit = true, isCompact = false }) => {
  const { getBodyIndexLogs, addBodyIndexLog, bodyIndexLogs, updateMember } = useGymData();
  const [subTab, setSubTab] = useState<'photos' | 'measurements'>('photos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Real-time synchronization with trainer updates
  const [syncTick, setSyncTick] = useState(0);
  React.useEffect(() => {
    const handleSync = () => setSyncTick((t) => t + 1);
    window.addEventListener('kf_body_index_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('kf_body_index_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Form State - blank if not entered by member or trainer
  const [weightKg, setWeightKg] = useState<number | string>(member.weightKg || '');
  const [heightCm, setHeightCm] = useState<number | string>(member.heightCm || '');
  const [chestInches, setChestInches] = useState<number | string>(member.measurements?.chest || '');
  const [waistInches, setWaistInches] = useState<number | string>(member.measurements?.waist || '');
  const [bicepsInches, setBicepsInches] = useState<number | string>(member.measurements?.biceps || '');
  const [thighsInches, setThighsInches] = useState<number | string>(member.measurements?.thighs || '');
  const [hipsInches, setHipsInches] = useState<number | string>(member.measurements?.hips || '');
  const [bodyFatPct, setBodyFatPct] = useState<number | string>(member.bodyFatPercentage || '');
  const [notes, setNotes] = useState('');

  // Fetch logs for this member (reactive to context updates & events)
  const logs = React.useMemo(() => {
    return getBodyIndexLogs(member.id);
  }, [member.id, bodyIndexLogs, syncTick, getBodyIndexLogs]);

  // First record (Baseline) vs Latest record
  const baseline = logs.length > 0 ? logs[0] : null;
  const latest = logs.length > 0 ? logs[logs.length - 1] : null;

  // Calculate Deltas (Latest vs Baseline)
  const weightDelta = baseline && latest ? Math.round((latest.weightKg - baseline.weightKg) * 10) / 10 : 0;
  const chestDelta = baseline && latest ? Math.round((latest.chestInches - baseline.chestInches) * 10) / 10 : 0;
  const waistDelta = baseline && latest ? Math.round((latest.waistInches - baseline.waistInches) * 10) / 10 : 0;
  const bicepsDelta = baseline && latest ? Math.round((latest.bicepsInches - baseline.bicepsInches) * 10) / 10 : 0;
  const thighsDelta = baseline && latest ? Math.round((latest.thighsInches - baseline.thighsInches) * 10) / 10 : 0;
  const fatDelta = baseline?.bodyFatPct && latest?.bodyFatPct ? Math.round((latest.bodyFatPct - baseline.bodyFatPct) * 10) / 10 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = Number(weightKg) || member.weightKg || 70;
    const finalHeight = Number(heightCm) || member.heightCm || 170;
    const heightM = finalHeight / 100;
    const computedBmi = Math.round((finalWeight / (heightM * heightM)) * 10) / 10;
    const finalNote = notes.trim() || `सदस्य द्वारा शारीरिक माप दर्ज किया गया (${new Date().toLocaleDateString('hi-IN')})`;

    const newLog: Omit<BodyIndexLog, 'id'> = {
      memberId: member.id,
      date: new Date().toISOString(),
      weightKg: finalWeight,
      heightCm: finalHeight,
      bmi: computedBmi,
      chestInches: Number(chestInches) || 0,
      waistInches: Number(waistInches) || 0,
      bicepsInches: Number(bicepsInches) || 0,
      thighsInches: Number(thighsInches) || 0,
      hipsInches: hipsInches ? Number(hipsInches) : undefined,
      bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
      notes: finalNote,
    };

    addBodyIndexLog(newLog);

    // Update member's core record so notes and measurements stay in sync immediately
    updateMember(member.id, {
      weightKg: finalWeight,
      heightCm: finalHeight,
      bodyFatPercentage: bodyFatPct ? Number(bodyFatPct) : member.bodyFatPercentage,
      notes: finalNote,
      measurements: {
        chest: Number(chestInches) || 0,
        waist: Number(waistInches) || 0,
        biceps: Number(bicepsInches) || 0,
        thighs: Number(thighsInches) || 0,
        hips: hipsInches ? Number(hipsInches) : undefined,
      },
    });

    // Auto-update customized workout and diet plans in local database
    const updatedWorkout = generateAutomaticCustomWorkout({
      memberId: member.id,
      memberName: member.name,
      goal: member.fitnessGoal || 'muscle_building',
      trainerId: member.assignedTrainerId,
      trainerName: member.assignedTrainerName,
    });
    localDb.saveMemberWorkout(updatedWorkout);

    const updatedDiet = generateAutomaticCustomDiet({
      memberId: member.id,
      memberName: member.name,
      weightKg: finalWeight,
      heightCm: finalHeight,
      age: member.age || 25,
      gender: member.gender || 'male',
      goal: member.fitnessGoal || 'muscle_building',
      dietType: member.dietPreference || 'veg',
      trainerId: member.assignedTrainerId,
      trainerName: member.assignedTrainerName,
    });
    localDb.saveMemberDiet(updatedDiet);

    // Dispatch broadcast event for real-time reactivity
    window.dispatchEvent(new Event('kf_body_index_updated'));
    window.dispatchEvent(new Event('storage'));

    setShowAddForm(false);
    setNotes('');
    setSuccessMsg('✨ शारीरिक माप सुरक्षित! आपके नए भार व बीएमआई अनुसार साप्ताहिक वर्कआउट रूटीन व डाइट प्लान स्वतः अपडेट हो गया है! 🔥');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Body Index & Physical Transformation Tracker
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">
            शारीरिक बदलाव व बॉडी इंडेक्स (Physical Changes)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your body measurements, muscle growth, waist reduction & transformation timeline.
          </p>
        </div>

        {canEdit && subTab === 'measurements' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel Entry' : '+ Nayi Measurement Dalein'}
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation Bar: 4-Side Photos vs Measurements */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('photos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'photos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          📷 4-साइड फोटो व तुलना (4-Side Photos & Compare)
        </button>

        <button
          type="button"
          onClick={() => setSubTab('measurements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'measurements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Ruler className="w-4 h-4 text-amber-500" />
          📏 शारीरिक माप व बीएमआई (Body Measurements & BMI)
        </button>
      </div>

      {subTab === 'photos' ? (
        <BodyPhotoTracker member={member} canEdit={canEdit} isCompact={isCompact} />
      ) : (
        <div className="space-y-6">

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Add New Measurement Modal/Drawer */}
      {showAddForm && (
        <div className="bg-white border border-cyan-200 rounded-2xl p-6 shadow-md animate-fade-in space-y-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-cyan-600" />
                Nayi Body Measurements Dalein (Log Checkpoint)
              </h4>
              <p className="text-xs text-slate-500">
                Inches aur KG me apni taza naap darj karein:
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Date: {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Weight */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Weight (वजन kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="उदा. 70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">kg</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Height (ऊंचाई cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="उदा. 172"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">cm</span>
                </div>
              </div>

              {/* Chest */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Chest (सीना inches) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    required
                    placeholder="उदा. 38"
                    value={chestInches}
                    onChange={(e) => setChestInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              {/* Waist */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Waist (कमर inches) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    required
                    placeholder="उदा. 32"
                    value={waistInches}
                    onChange={(e) => setWaistInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              {/* Biceps */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Biceps (डोले inches) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    required
                    placeholder="उदा. 13.5"
                    value={bicepsInches}
                    onChange={(e) => setBicepsInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              {/* Thighs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Thighs (जांघ inches) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    required
                    placeholder="उदा. 21"
                    value={thighsInches}
                    onChange={(e) => setThighsInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              {/* Hips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Hips (inches)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    placeholder="उदा. 36"
                    value={hipsInches}
                    onChange={(e) => setHipsInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              {/* Body Fat */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Body Fat (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="उदा. 18"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">%</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Progress Note / Trainer Feedback (टिप्पणी / विवरण)
              </label>
              <input
                type="text"
                placeholder="उदा. आर्म्स में अच्छा पंप है, ट्रेनर मार्गदर्शन अनुसार कमर 1 इंच कम हुई..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase shadow-sm transition-all cursor-pointer"
              >
                Save Measurement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prominent Notes / Update Banner */}
      {latest?.notes && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border border-amber-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                नवीनतम शारीरिक माप एवं फिटनेस नोट (Latest Progress Note)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                दिनांक: {new Date(latest.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              "{latest.notes}"
            </p>
          </div>
        </div>
      )}

      {/* CASE 1: EMPTY STATE - No measurements entered yet */}
      {logs.length === 0 && !showAddForm && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mx-auto shadow-2xs">
            <Ruler className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wide">
              अभी कोई शारीरिक माप (Measurements) दर्ज नहीं है
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Biceps (डोले), Waist (कमर), Chest (सीना) और Thighs (जांघ) की माप जब आप या आपके जिम ट्रेनर दर्ज करेंगे, तभी यहाँ शारीरिक बदलाव और प्रगति दिखाई देगी।
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              + पहली शारीरिक माप दर्ज करें (Add First Measurement)
            </button>
          )}
        </div>
      )}

      {/* CASE 2: SINGLE CHECKPOINT - Only 1 measurement recorded (Baseline) */}
      {logs.length === 1 && latest && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span>पहला बेसलाइन माप (Day 1 Checkpoint Recorded)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold font-mono">
                    1 Checkpoint
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  दर्ज दिनांक: {new Date(latest.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-semibold">
              अगली नाप पर Before vs Now तुलना दिखेगी 📈
            </span>
          </div>

          <div className={`grid ${isCompact ? 'grid-cols-2 gap-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'}`}>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Scale className="w-3 h-3 text-cyan-600" />
                Weight (वजन)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[10px] text-cyan-700 font-semibold">दर्ज वजन</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-purple-600" />
                Biceps (डोले)
              </span>
              <div className="text-xl font-black font-mono text-purple-700 my-1">
                {latest.bicepsInches}"
              </div>
              <div className="text-[10px] text-slate-500">Day 1 नाप</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-600" />
                Waist (कमर)
              </span>
              <div className="text-xl font-black font-mono text-emerald-700 my-1">
                {latest.waistInches}"
              </div>
              <div className="text-[10px] text-slate-500">Day 1 नाप</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-500" />
                Chest (सीना)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.chestInches}"
              </div>
              <div className="text-[10px] text-slate-500">Day 1 नाप</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-cyan-600" />
                Thighs (जांघ)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.thighsInches}"
              </div>
              <div className="text-[10px] text-slate-500">Day 1 नाप</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                BMI
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.bmi}
              </div>
              <div className="text-[10px] text-slate-500">{latest.bodyFatPct ? `Fat: ${latest.bodyFatPct}%` : 'Normal'}</div>
            </div>
          </div>
        </div>
      )}

      {/* CASE 3: BEFORE VS NOW - 2 or more checkpoints recorded */}
      {logs.length >= 2 && baseline && latest && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  Before vs Now Transformation • पहले vs अब बदलाव
                </h4>
                <p className="text-xs text-slate-500">
                  Baseline (Day 1: {new Date(baseline.date).toLocaleDateString()}) se lekar taza checkpoint ({new Date(latest.date).toLocaleDateString()}) tak ka safar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-[11px]">
              <span className="text-slate-500">Total Checkpoints:</span>
              <span className="font-bold text-slate-900 font-mono">{logs.length} Recorded</span>
            </div>
          </div>

          {/* Key Delta Stat Tiles */}
          <div className={`grid ${isCompact ? 'grid-cols-2 gap-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'}`}>
            {/* Weight Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Scale className="w-3 h-3 text-cyan-600" />
                Weight (वजन)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.weightKg} kg</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                weightDelta > 0 ? 'text-amber-600' : (weightDelta < 0 ? 'text-emerald-600' : 'text-slate-500')
              }`}>
                {weightDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {weightDelta > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`}
              </div>
            </div>

            {/* Biceps Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-purple-600" />
                Biceps (डोले)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.bicepsInches}"
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.bicepsInches}"</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                bicepsDelta > 0 ? 'text-purple-600' : 'text-slate-500'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {bicepsDelta > 0 ? `+${bicepsDelta}" Gained` : `${bicepsDelta}"`}
              </div>
            </div>

            {/* Waist Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-600" />
                Waist (कमर)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.waistInches}"
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.waistInches}"</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                waistDelta < 0 ? 'text-emerald-600' : (waistDelta > 0 ? 'text-amber-600' : 'text-slate-500')
              }`}>
                {waistDelta <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {waistDelta < 0 ? `${waistDelta}" Reduced` : `+${waistDelta}"`}
              </div>
            </div>

            {/* Chest Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-500" />
                Chest (सीना)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.chestInches}"
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.chestInches}"</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                chestDelta > 0 ? 'text-amber-600' : 'text-slate-500'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {chestDelta > 0 ? `+${chestDelta}" Expanded` : `${chestDelta}"`}
              </div>
            </div>

            {/* Thighs Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-cyan-600" />
                Thighs (जांघ)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.thighsInches}"
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.thighsInches}"</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                thighsDelta > 0 ? 'text-cyan-700' : 'text-slate-500'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {thighsDelta > 0 ? `+${thighsDelta}"` : `${thighsDelta}"`}
              </div>
            </div>

            {/* Body Fat Delta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                Body Fat (%)
              </span>
              <div className="text-xl font-black font-mono text-slate-900 my-1">
                {latest.bodyFatPct || 17}%
              </div>
              <div className="text-[11px] text-slate-500">Day 1: {baseline.bodyFatPct || 22}%</div>
              <div className={`mt-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                fatDelta < 0 ? 'text-emerald-600' : 'text-orange-600'
              }`}>
                {fatDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {fatDelta < 0 ? `${fatDelta}% Fat Cut` : `+${fatDelta}%`}
              </div>
            </div>
          </div>

          {/* Simple Coach Highlight Quote */}
          <div className="mt-4 p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-center gap-3">
            <Info className="w-4 h-4 text-cyan-700 shrink-0" />
            <p className="text-xs text-slate-700">
              <strong className="text-cyan-800">Transformation Status: </strong>
              {waistDelta < 0 && bicepsDelta > 0 ? (
                <span>Kanker Coach report: <strong>Excellent Recomposition!</strong> Waist <strong>{Math.abs(waistDelta)}"</strong> kam hui hai aur bicep <strong>+{bicepsDelta}"</strong> bada hai.</span>
              ) : (
                <span>Consistent progress! Trainer guidelines aur high-protein diet follow karte rahein.</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Historical Measurement Checkpoints Table / Cards */}
      <div className={`bg-white border border-slate-200 rounded-2xl ${isCompact ? 'p-4' : 'p-6'} shadow-sm`}>
        <h4 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-cyan-600" />
          Body Index History & Checkpoint Logs ({logs.length})
        </h4>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Abhi koi measurement log nahi hai. Upar diye gaye "+ Nayi Measurement Dalein" button par click karke pehla checkpoint dalein.
          </div>
        ) : isCompact ? (
          /* Clean Mobile Cards View (Zero horizontal scroll) */
          <div className="space-y-3">
            {logs.slice().reverse().map((log, index) => (
              <div key={log.id || index} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {new Date(log.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                        LATEST
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-black text-slate-900 text-sm">{log.weightKg} kg</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Chest</span>
                    <span className="font-bold text-slate-800">{log.chestInches}"</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Waist</span>
                    <span className="font-bold text-slate-800">{log.waistInches}"</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Biceps</span>
                    <span className="font-bold text-purple-700">{log.bicepsInches}"</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Thighs</span>
                    <span className="font-bold text-slate-800">{log.thighsInches}"</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">BMI</span>
                    <span className="font-bold text-slate-800">{log.bmi}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Body Fat</span>
                    <span className="font-bold text-amber-700">{log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}</span>
                  </div>
                </div>

                {log.notes && (
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Wide Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Weight (kg)</th>
                  <th className="py-2.5 px-3">Chest (in)</th>
                  <th className="py-2.5 px-3">Waist (in)</th>
                  <th className="py-2.5 px-3">Biceps (in)</th>
                  <th className="py-2.5 px-3">Thighs (in)</th>
                  <th className="py-2.5 px-3">BMI</th>
                  <th className="py-2.5 px-3">Body Fat</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.slice().reverse().map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-800 font-semibold font-sans">
                      {new Date(log.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {index === 0 && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                          LATEST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-bold">{log.weightKg} kg</td>
                    <td className="py-3 px-3 text-slate-700">{log.chestInches}"</td>
                    <td className="py-3 px-3 text-slate-700">{log.waistInches}"</td>
                    <td className="py-3 px-3 text-purple-700 font-bold">{log.bicepsInches}"</td>
                    <td className="py-3 px-3 text-slate-700">{log.thighsInches}"</td>
                    <td className="py-3 px-3 text-slate-800">{log.bmi}</td>
                    <td className="py-3 px-3 text-amber-700">{log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}</td>
                    <td className="py-3 px-3 text-slate-600 font-sans text-[11px] max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
};
