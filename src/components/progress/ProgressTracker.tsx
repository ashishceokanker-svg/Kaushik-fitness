import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { formatDate } from '../../utils/formatters';
import { localDb } from '../../db/localDatabase';
import { ProgressLog } from '../../types';
import {
  Trophy,
  TrendingUp,
  Scale,
  PlusCircle,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  X,
  Dumbbell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MemberProgressChart } from './MemberProgressChart';

interface ProgressTrackerProps {
  memberId?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ memberId = 'mem-1' }) => {
  const { progressLogs, addProgressLog, members, updateMember } = useGymData();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const activeMember = members.find((m) => m.id === memberId || m.userId === memberId) || members[0];

  // Merge bodyIndexLogs from local database and progressLogs for activeMember
  const logs = React.useMemo(() => {
    if (!activeMember) return [];
    const bodyLogs = localDb.getBodyIndexLogs(activeMember.id);
    const allLogsMap = new Map<string, ProgressLog>();

    bodyLogs.forEach((b: any) => {
      allLogsMap.set(b.date, {
        id: b.id,
        memberId: b.memberId,
        date: b.date,
        weightKg: b.weightKg,
        chestInches: b.chestInches,
        waistInches: b.waistInches,
        bicepsInches: b.bicepsInches,
        thighsInches: b.thighsInches,
        hipsInches: b.hipsInches,
        bodyFatPercentage: b.bodyFatPercentage,
        bmi: b.bmi,
        benchPressPR: b.benchPressPR,
        squatPR: b.squatPR,
        deadliftPR: b.deadliftPR,
        notes: b.notes,
      });
    });

    progressLogs
      .filter((p) => p.memberId === activeMember.id)
      .forEach((p) => {
        allLogsMap.set(p.date, { ...allLogsMap.get(p.date), ...p });
      });

    return Array.from(allLogsMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [activeMember, progressLogs]);

  // Form states initialized to member's actual stats or empty
  const [weightKg, setWeightKg] = useState<string>(() => String(activeMember?.weightKg || ''));
  const [chestInches, setChestInches] = useState<string>(() => String(activeMember?.measurements?.chest || ''));
  const [waistInches, setWaistInches] = useState<string>(() => String(activeMember?.measurements?.waist || ''));
  const [bicepsInches, setBicepsInches] = useState<string>(() => String(activeMember?.measurements?.biceps || ''));
  const [benchPressPR, setBenchPressPR] = useState<string>('');
  const [squatPR, setSquatPR] = useState<string>('');
  const [deadliftPR, setDeadliftPR] = useState<string>('');
  const [notes, setNotes] = useState('');

  const latestLog = logs[logs.length - 1];
  const firstLog = logs[0];
  const weightChange = latestLog && firstLog ? latestLog.weightKg - firstLog.weightKg : 0;

  // Real member PR values (no fake 95, 125, 155 defaults)
  const benchPrs = logs.map((l) => l.benchPressPR).filter((v): v is number => Boolean(v && v > 0));
  const squatPrs = logs.map((l) => l.squatPR).filter((v): v is number => Boolean(v && v > 0));
  const deadliftPrs = logs.map((l) => l.deadliftPR).filter((v): v is number => Boolean(v && v > 0));

  const currentBenchPr = benchPrs.length > 0 ? benchPrs[benchPrs.length - 1] : undefined;
  const currentSquatPr = squatPrs.length > 0 ? squatPrs[squatPrs.length - 1] : undefined;
  const currentDeadliftPr = deadliftPrs.length > 0 ? deadliftPrs[deadliftPrs.length - 1] : undefined;

  const benchGain = benchPrs.length > 1 ? benchPrs[benchPrs.length - 1] - benchPrs[0] : 0;
  const squatGain = squatPrs.length > 1 ? squatPrs[squatPrs.length - 1] - squatPrs[0] : 0;
  const deadliftGain = deadliftPrs.length > 1 ? deadliftPrs[deadliftPrs.length - 1] - deadliftPrs[0] : 0;

  const latestChest = latestLog?.chestInches ?? (activeMember?.measurements?.chest || undefined);
  const initialChest = firstLog?.chestInches ?? (activeMember?.measurements?.chest || undefined);
  const chestDiff = latestChest && initialChest && logs.length > 1 ? Number((latestChest - initialChest).toFixed(1)) : 0;

  const latestBiceps = latestLog?.bicepsInches ?? (activeMember?.measurements?.biceps || undefined);
  const initialBiceps = firstLog?.bicepsInches ?? (activeMember?.measurements?.biceps || undefined);
  const bicepsDiff = latestBiceps && initialBiceps && logs.length > 1 ? Number((latestBiceps - initialBiceps).toFixed(1)) : 0;

  const latestWaist = latestLog?.waistInches ?? (activeMember?.measurements?.waist || undefined);
  const initialWaist = firstLog?.waistInches ?? (activeMember?.measurements?.waist || undefined);
  const waistDiff = latestWaist && initialWaist && logs.length > 1 ? Number((latestWaist - initialWaist).toFixed(1)) : 0;

  const latestThighs = latestLog?.thighsInches ?? (activeMember?.measurements?.thighs || undefined);
  const initialThighs = firstLog?.thighsInches ?? (activeMember?.measurements?.thighs || undefined);
  const thighsDiff = latestThighs && initialThighs && logs.length > 1 ? Number((latestThighs - initialThighs).toFixed(1)) : 0;

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;

    const wNum = Number(weightKg) || activeMember.weightKg || 70;
    const cNum = chestInches ? Number(chestInches) : undefined;
    const waNum = waistInches ? Number(waistInches) : undefined;
    const bNum = bicepsInches ? Number(bicepsInches) : undefined;
    const bpNum = benchPressPR ? Number(benchPressPR) : undefined;
    const sqNum = squatPR ? Number(squatPR) : undefined;
    const dlNum = deadliftPR ? Number(deadliftPR) : undefined;
    const dateStr = new Date().toISOString();

    addProgressLog({
      memberId: activeMember.id,
      date: dateStr,
      weightKg: wNum,
      chestInches: cNum,
      waistInches: waNum,
      bicepsInches: bNum,
      benchPressPR: bpNum,
      squatPR: sqNum,
      deadliftPR: dlNum,
      notes: notes || 'Member personal progression check-in.',
    });

    const hVal = activeMember.heightCm || 172;
    const bmiVal = Number((wNum / Math.pow(hVal / 100, 2)).toFixed(1));

    localDb.addBodyIndexLog({
      memberId: activeMember.id,
      date: dateStr,
      weightKg: wNum,
      heightCm: hVal,
      bmi: bmiVal,
      chestInches: cNum ?? (activeMember.measurements?.chest || 0),
      waistInches: waNum ?? (activeMember.measurements?.waist || 0),
      bicepsInches: bNum ?? (activeMember.measurements?.biceps || 0),
      thighsInches: activeMember.measurements?.thighs || 0,
      notes: notes || 'Member personal progression check-in.',
    });

    if (wNum || cNum || waNum || bNum) {
      updateMember(activeMember.id, {
        weightKg: wNum,
        measurements: {
          chest: cNum || activeMember.measurements?.chest || 0,
          waist: waNum || activeMember.measurements?.waist || 0,
          biceps: bNum || activeMember.measurements?.biceps || 0,
          thighs: activeMember.measurements?.thighs || 0,
        },
        notes: notes || activeMember.notes,
      });
    }

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    window.dispatchEvent(new Event('kf_body_index_updated'));
    window.dispatchEvent(new Event('storage'));
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Athlete Progress & PR Hall of Fame
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeMember?.name} का व्यक्तिगत शारीरिक रूपांतरण, माप व लिफ्ट पीआर (Personal Records):
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया माप / लिफ्ट PR दर्ज करें</span>
        </button>
      </div>

      {/* Visual Graphical Progress Charts */}
      <MemberProgressChart
        logs={logs}
        memberName={activeMember?.name || 'Member'}
        targetWeightKg={activeMember?.targetWeightKg || 80}
        onOpenLogModal={() => setIsLogModalOpen(true)}
      />

      {/* Lift PR Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Bench Press */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Bench Press PR</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {currentBenchPr ? (
              <>
                {currentBenchPr} <span className="text-sm font-normal text-slate-400">kg</span>
              </>
            ) : (
              <span className="text-sm text-slate-400 font-sans font-bold">दर्ज नहीं (No PR)</span>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {benchGain > 0 ? `+${benchGain} kg gained since start` : currentBenchPr ? 'वर्तमान पीआर' : 'माप दर्ज करें'}
          </div>
        </div>

        {/* Back Squat */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Back Squat PR</span>
            <Award className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {currentSquatPr ? (
              <>
                {currentSquatPr} <span className="text-sm font-normal text-slate-400">kg</span>
              </>
            ) : (
              <span className="text-sm text-slate-400 font-sans font-bold">दर्ज नहीं (No PR)</span>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {squatGain > 0 ? `+${squatGain} kg power gain` : currentSquatPr ? 'वर्तमान पीआर' : 'माप दर्ज करें'}
          </div>
        </div>

        {/* Deadlift */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Deadlift PR</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {currentDeadliftPr ? (
              <>
                {currentDeadliftPr} <span className="text-sm font-normal text-slate-400">kg</span>
              </>
            ) : (
              <span className="text-sm text-slate-400 font-sans font-bold">दर्ज नहीं (No PR)</span>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {deadliftGain > 0 ? `+${deadliftGain} kg power gain` : currentDeadliftPr ? 'वर्तमान पीआर' : 'माप दर्ज करें'}
          </div>
        </div>

        {/* Total Body Recomp */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Weight Trend</span>
            <Scale className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {latestLog?.weightKg || activeMember?.weightKg ? (
              <>
                {latestLog?.weightKg || activeMember?.weightKg} <span className="text-sm font-normal text-slate-400">kg</span>
              </>
            ) : (
              <span className="text-sm text-slate-400 font-sans font-bold">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {logs.length > 1
              ? (weightChange >= 0 ? `+${weightChange.toFixed(1)} kg बदलाव` : `${weightChange.toFixed(1)} kg वजन घटा`)
              : 'वर्तमान शरीर वजन'}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Measurements and Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Body Recomposition Checkpoints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-600" />
              Body Recomposition Checkpoints
            </h3>
            <span className="text-xs text-slate-500 font-mono">Inches (Tape)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Chest</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestChest ? `${latestChest}"` : '—'}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {logs.length > 1 && chestDiff !== 0
                  ? `${chestDiff > 0 ? `+${chestDiff}` : chestDiff}" बदलाव`
                  : latestChest ? 'माप दर्ज है' : 'दर्ज नहीं'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Arms (Biceps)</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestBiceps ? `${latestBiceps}"` : '—'}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {logs.length > 1 && bicepsDiff !== 0
                  ? `${bicepsDiff > 0 ? `+${bicepsDiff}` : bicepsDiff}" बदलाव`
                  : latestBiceps ? 'माप दर्ज है' : 'दर्ज नहीं'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Waist</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestWaist ? `${latestWaist}"` : '—'}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {logs.length > 1 && waistDiff !== 0
                  ? `${waistDiff > 0 ? `+${waistDiff}` : waistDiff}" बदलाव`
                  : latestWaist ? 'माप दर्ज है' : 'दर्ज नहीं'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Thighs</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestThighs ? `${latestThighs}"` : '—'}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {logs.length > 1 && thighsDiff !== 0
                  ? `${thighsDiff > 0 ? `+${thighsDiff}` : thighsDiff}" बदलाव`
                  : latestThighs ? 'माप दर्ज है' : 'दर्ज नहीं'}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Achievement Badges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Milestone Achievement Badges
          </h3>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-mono">
                {currentDeadliftPr ? `${currentDeadliftPr}k` : 'DL'}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {currentDeadliftPr ? `${currentDeadliftPr}kg Deadlift Personal Record` : 'Deadlift Record Goal'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentDeadliftPr
                    ? `सत्यापित व्यक्तिगत सर्वश्रेष्ठ लिफ्ट: ${currentDeadliftPr} kg`
                    : 'नया माप दर्ज कर अपना पहला डेडलिफ्ट पीआर अनलॉक करें'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
                {currentBenchPr ? `${currentBenchPr}k` : 'BP'}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {currentBenchPr ? `${currentBenchPr}kg Bench Press Personal Record` : 'Bench Press Record Goal'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentBenchPr
                    ? `सत्यापित व्यक्तिगत सर्वश्रेष्ठ बेंच प्रेस: ${currentBenchPr} kg`
                    : 'बेंच प्रेस PR दर्ज करें और अपनी ताकत का रिकॉर्ड बनाएं'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                {logs.length > 0 ? `${logs.length}x` : '0x'}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {logs.length > 0 ? `${logs.length} Consistency Checkpoints` : 'Consistency Journey'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {logs.length > 0
                    ? `कुल ${logs.length} बार शारीरिक माप व प्रोग्रेस रिकॉर्ड दर्ज की गई है`
                    : 'शारीरिक माप व प्रोग्रेस का नियमित रिकॉर्ड रखना शुरू करें'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Progress Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                Record Body Stats & Lift PR
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 72.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Bench PR (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 80"
                    value={benchPressPR}
                    onChange={(e) => setBenchPressPR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Squat PR (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={squatPR}
                    onChange={(e) => setSquatPR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Deadlift PR (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={deadliftPR}
                    onChange={(e) => setDeadliftPR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Chest (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 38"
                    value={chestInches}
                    onChange={(e) => setChestInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Waist (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 32"
                    value={waistInches}
                    onChange={(e) => setWaistInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Biceps (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14"
                    value={bicepsInches}
                    onChange={(e) => setBicepsInches(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Workout Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Strong session, felt light on bench"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Progression Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
