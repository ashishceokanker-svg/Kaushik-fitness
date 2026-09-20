import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { formatDate } from '../../utils/formatters';
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
  const { progressLogs, addProgressLog, members } = useGymData();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form states
  const [weightKg, setWeightKg] = useState<number>(78);
  const [chestInches, setChestInches] = useState<number>(41);
  const [waistInches, setWaistInches] = useState<number>(32);
  const [bicepsInches, setBicepsInches] = useState<number>(15.5);
  const [benchPressPR, setBenchPressPR] = useState<number>(95);
  const [squatPR, setSquatPR] = useState<number>(125);
  const [deadliftPR, setDeadliftPR] = useState<number>(155);
  const [notes, setNotes] = useState('');

  const activeMember = members.find((m) => m.id === memberId) || members[0];
  const logs = progressLogs.filter((p) => p.memberId === activeMember.id);

  const latestLog = logs[logs.length - 1];
  const firstLog = logs[0];
  const weightChange = latestLog && firstLog ? latestLog.weightKg - firstLog.weightKg : 0;

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    addProgressLog({
      memberId: activeMember.id,
      date: new Date().toISOString(),
      weightKg,
      chestInches,
      waistInches,
      bicepsInches,
      benchPressPR,
      squatPR,
      deadliftPR,
      notes: notes || 'Regular weekly weigh-in check.',
    });

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

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
            Tracking body recomposition, muscular measurements, and heavy lift PRs for {activeMember.name}
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Log New Body Stats / PR
        </button>
      </div>

      {/* Visual Graphical Progress Charts */}
      <MemberProgressChart
        logs={logs}
        memberName={activeMember.name}
        targetWeightKg={activeMember.targetWeightKg || 82}
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
            {latestLog?.benchPressPR || 95} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +30 kg gained since start
          </div>
        </div>

        {/* Back Squat */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Back Squat PR</span>
            <Award className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {latestLog?.squatPR || 125} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +45 kg power gain
          </div>
        </div>

        {/* Deadlift */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Deadlift PR</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {latestLog?.deadliftPR || 155} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            150kg Club Member 🏆
          </div>
        </div>

        {/* Total Body Recomp */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Weight Trend</span>
            <Scale className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {latestLog?.weightKg || 78} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {weightChange >= 0 ? `+${weightChange.toFixed(1)} kg lean bulk` : `${weightChange.toFixed(1)} kg fat loss`}
          </div>
        </div>
      </div>

      {/* Visual SVG Progression Graph Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Weight Progression Timeline (kg)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Weight: {activeMember.targetWeightKg || 82} kg
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-cyan-800 font-bold">
            {logs.length} weigh-in checkpoints
          </span>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="w-full h-48 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target weight dotted line */}
            <line
              x1="0"
              y1="50"
              x2="500"
              y2="50"
              stroke="#06B6D4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <text x="4" y="44" fill="#0891B2" fontSize="10" fontWeight="bold">
              Target: {activeMember.targetWeightKg || 82}kg
            </text>

            {/* Area under curve */}
            <path
              d="M 20 120 L 100 110 L 180 95 L 260 85 L 340 75 L 420 65 L 480 60 L 480 140 L 20 140 Z"
              fill="url(#chartGrad)"
            />

            {/* Line graph */}
            <path
              d="M 20 120 L 100 110 L 180 95 L 260 85 L 340 75 L 420 65 L 480 60"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data points */}
            {[
              { cx: 20, cy: 120, label: '70kg' },
              { cx: 100, cy: 110, label: '71.5kg' },
              { cx: 180, cy: 95, label: '73kg' },
              { cx: 260, cy: 85, label: '75kg' },
              { cx: 340, cy: 75, label: '76.5kg' },
              { cx: 420, cy: 65, label: '77.5kg' },
              { cx: 480, cy: 60, label: '78kg' },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.cx} cy={pt.cy} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                <text
                  x={pt.cx}
                  y={pt.cy - 10}
                  fill="#475569"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
          <span>Joined: May 2024 (70kg)</span>
          <span className="font-semibold text-emerald-600">Total Gain: +8.0 kg (Lean Mass Recomposition)</span>
          <span>Current: Today (78kg)</span>
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
              <span className="text-xs text-slate-500">Chest</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestLog?.chestInches || 41}"
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">+3.0" gained</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Arms (Biceps)</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestLog?.bicepsInches || 15.5}"
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">+2.0" peak expansion</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Waist</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {latestLog?.waistInches || 32}"
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">-1.0" lean taper</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Thighs</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">23"</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">+2.5" quad sweep</div>
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
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                150
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">150kg Deadlift Club</div>
                <div className="text-[11px] text-slate-500">Achieved 155kg heavy pull with Coach Vikram</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                30d
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Consistency Master</div>
                <div className="text-[11px] text-slate-500">Completed 30+ gym sessions in last 45 days</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                90kg
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Heavy Bench Milestone</div>
                <div className="text-[11px] text-slate-500">Pressed bodyweight + 17kg for 3 clean reps</div>
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
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Bench PR (kg)</label>
                  <input
                    type="number"
                    value={benchPressPR}
                    onChange={(e) => setBenchPressPR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Squat PR (kg)</label>
                  <input
                    type="number"
                    value={squatPR}
                    onChange={(e) => setSquatPR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Deadlift PR (kg)</label>
                  <input
                    type="number"
                    value={deadliftPR}
                    onChange={(e) => setDeadliftPR(Number(e.target.value))}
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
                    value={chestInches}
                    onChange={(e) => setChestInches(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Waist (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waistInches}
                    onChange={(e) => setWaistInches(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Biceps (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bicepsInches}
                    onChange={(e) => setBicepsInches(Number(e.target.value))}
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
