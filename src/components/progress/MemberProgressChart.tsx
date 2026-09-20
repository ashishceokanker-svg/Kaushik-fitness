import React, { useState } from 'react';
import { ProgressLog } from '../../types';
import {
  TrendingUp,
  Scale,
  Award,
  Activity,
  Calendar,
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PlusCircle,
  Dumbbell,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface MemberProgressChartProps {
  logs: ProgressLog[];
  memberName?: string;
  targetWeightKg?: number;
  onOpenLogModal?: () => void;
}

export const MemberProgressChart: React.FC<MemberProgressChartProps> = ({
  logs,
  memberName = 'Member',
  targetWeightKg = 82,
  onOpenLogModal,
}) => {
  const [activeChart, setActiveChart] = useState<'change' | 'weight' | 'prs' | 'measurements'>('change');

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <Activity className="w-10 h-10 mx-auto text-slate-300" />
        <p className="font-bold text-slate-700 text-sm">कोई प्रोग्रेस माप रिकॉर्ड नहीं है (No progress recorded)</p>
        <p className="text-xs text-slate-500">शारीरिक माप दर्ज करने के बाद यहाँ विजुअल चार्ट दिखेगा।</p>
        {onOpenLogModal && (
          <button
            onClick={onOpenLogModal}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>पहला माप दर्ज करें (Log Baseline Stats)</span>
          </button>
        )}
      </div>
    );
  }

  // Sort logs by date ascending
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstLog = sortedLogs[0];
  const latestLog = sortedLogs[sortedLogs.length - 1];

  // Calculate Net Differences ("Kitna change aaya hai")
  const weightDiff = latestLog.weightKg - firstLog.weightKg;
  const weightDiffPct = ((weightDiff / firstLog.weightKg) * 100).toFixed(1);

  const chestDiff = (latestLog.chestInches || 0) - (firstLog.chestInches || 0);
  const waistDiff = (latestLog.waistInches || 0) - (firstLog.waistInches || 0);
  const bicepsDiff = (latestLog.bicepsInches || 0) - (firstLog.bicepsInches || 0);
  const thighsDiff = (latestLog.thighsInches || 0) - (firstLog.thighsInches || 0);

  const benchGain = (latestLog.benchPressPR || 0) - (firstLog.benchPressPR || 0);
  const squatGain = (latestLog.squatPR || 0) - (firstLog.squatPR || 0);
  const deadliftGain = (latestLog.deadliftPR || 0) - (firstLog.deadliftPR || 0);

  const firstBmi = firstLog.bmi || parseFloat((firstLog.weightKg / (1.75 * 1.75)).toFixed(1));
  const latestBmi = latestLog.bmi || parseFloat((latestLog.weightKg / (1.75 * 1.75)).toFixed(1));
  const bmiDiff = parseFloat((latestBmi - firstBmi).toFixed(1));

  const firstFat = firstLog.bodyFatPercentage || 22.0;
  const latestFat = latestLog.bodyFatPercentage || (22.0 + weightDiff * 0.6);
  const fatDiff = parseFloat((latestFat - firstFat).toFixed(1));

  // SVG Chart Dimensions
  const svgWidth = 640;
  const svgHeight = 240;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Calculate scales for Weight Chart
  const weights = sortedLogs.map((l) => l.weightKg);
  const minWeight = Math.min(...weights, targetWeightKg) - 2;
  const maxWeight = Math.max(...weights, targetWeightKg) + 2;

  const getWeightX = (index: number) => {
    if (sortedLogs.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (sortedLogs.length - 1)) * graphWidth;
  };

  const getWeightY = (weight: number) => {
    return padding.top + graphHeight - ((weight - minWeight) / (maxWeight - minWeight)) * graphHeight;
  };

  const weightPoints = sortedLogs.map((l, i) => `${getWeightX(i)},${getWeightY(l.weightKg)}`).join(' ');
  const targetY = getWeightY(targetWeightKg);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Chart Header & Action Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-black uppercase tracking-wider mb-1">
            <TrendingUp className="w-3 h-3 text-cyan-600" />
            Athlete Progress & Transformation Analytics
          </div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>{memberName} का फिटनेस व शारीरिक बदलाव रिपोर्ट</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            शुरुआत: {new Date(firstLog.date).toLocaleDateString('en-IN')} • नवीनतम माप: {new Date(latestLog.date).toLocaleDateString('en-IN')} ({sortedLogs.length} कुल माप दर्ज)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenLogModal && (
            <button
              onClick={onOpenLogModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ नया माप दर्ज करें</span>
            </button>
          )}

          {/* Tab Controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveChart('change')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeChart === 'change'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>कितना बदलाव आया (Transformation)</span>
            </button>
            <button
              onClick={() => setActiveChart('weight')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeChart === 'weight'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Weight Curve</span>
            </button>
            <button
              onClick={() => setActiveChart('prs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeChart === 'prs'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-cyan-600" />
              <span>Strength PRs</span>
            </button>
            <button
              onClick={() => setActiveChart('measurements')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeChart === 'measurements'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Measurements</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK HIGHLIGHT METRICS (Across all tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Current Weight</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {latestLog.weightKg} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] font-bold mt-0.5 flex items-center gap-1">
            {weightDiff <= 0 ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowDownRight className="w-3 h-3" /> {weightDiff.toFixed(1)} kg घटा
              </span>
            ) : (
              <span className="text-cyan-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{weightDiff.toFixed(1)} kg बढ़ा
              </span>
            )}
            <span className="text-slate-400 font-normal text-[10px]">({weightDiffPct}%)</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Bench Press PR</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {latestLog.benchPressPR || 0} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
            +{benchGain} kg ताकत बढ़ी
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Waist Size (कमर)</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {latestLog.waistInches || 32} <span className="text-xs font-normal text-slate-500">inches</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
            {waistDiff <= 0 ? `${waistDiff.toFixed(1)}" इन-शेप` : `+${waistDiff.toFixed(1)}"`}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Biceps (डोले)</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {latestLog.bicepsInches || 14} <span className="text-xs font-normal text-slate-500">inches</span>
          </div>
          <div className="text-[11px] font-bold text-cyan-600 mt-0.5">
            +{bicepsDiff.toFixed(1)}" इंच गेन
          </div>
        </div>
      </div>

      {/* TAB 1: KITNA CHANGE AAYA HAI (TRANSFORMATION & COMPARATIVE BARS) */}
      {activeChart === 'change' && (
        <div className="space-y-6">
          {/* Top Transformation Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-emerald-500/10 border border-amber-200/60 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  शारीरिक रूपांतरण व कुल अंतर (Total Transformation Change)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  शुरुआत ({firstLog.date}) से लेकर आज ({latestLog.date}) तक के बदलाव का प्रत्यक्ष तुलनात्मक विश्लेषण
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>लक्ष्य: <strong className="text-slate-900">{targetWeightKg} kg</strong></span>
            </div>
          </div>

          {/* Comprehensive Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Card 1: Weight Change */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-500" /> वजन (Body Weight)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                  weightDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'
                }`}>
                  {weightDiff <= 0 ? `▼ ${Math.abs(weightDiff).toFixed(1)} kg घटा` : `▲ +${weightDiff.toFixed(1)} kg बढ़ा`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">आरंभ (Start)</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">{firstLog.weightKg} kg</span>
                </div>
                <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-amber-700 block font-bold">वर्तमान (Now)</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{latestLog.weightKg} kg</span>
                </div>
                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] text-emerald-700 block font-bold">लक्ष्य (Goal)</span>
                  <span className="font-bold text-emerald-800 font-mono text-sm">{targetWeightKg} kg</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>प्रोग्रेस प्रगति:</span>
                  <span className="font-bold text-slate-800 font-mono">{Math.abs(weightDiff).toFixed(1)} kg / {Math.abs(firstLog.weightKg - targetWeightKg).toFixed(1)} kg target</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, (Math.abs(weightDiff) / Math.max(1, Math.abs(firstLog.weightKg - targetWeightKg))) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Waist Change */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" /> कमर माप (Waistline)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                  waistDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {waistDiff <= 0 ? `▼ ${Math.abs(waistDiff).toFixed(1)}" इंच कम` : `▲ +${waistDiff.toFixed(1)}"`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">पहला माप (Baseline)</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">{firstLog.waistInches || 34.0}"</span>
                </div>
                <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] text-emerald-700 block font-bold">वर्तमान कमर (Current)</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{latestLog.waistInches || 31.5}"</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>पेट व कमर की चर्बी:</span>
                <span className="font-bold text-emerald-600">इन-शेप स्लिमिंग सक्रिय ✓</span>
              </div>
            </div>

            {/* Card 3: Biceps Muscle Growth */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-cyan-300 transition-all shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-cyan-500" /> बाइसेप्स माप (Arms Peak)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-cyan-100 text-cyan-800">
                  ▲ +{bicepsDiff.toFixed(1)}" इंच बढ़ा
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">पहला माप (Baseline)</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">{firstLog.bicepsInches || 13.0}"</span>
                </div>
                <div className="bg-cyan-50/70 p-2.5 rounded-xl border border-cyan-200/60">
                  <span className="text-[10px] text-cyan-700 block font-bold">वर्तमान साइज (Current)</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{latestLog.bicepsInches || 14.5}"</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>हाइपरट्रॉफी रिस्पॉन्स:</span>
                <span className="font-bold text-cyan-700">मसल ग्रोथ तेज ✓</span>
              </div>
            </div>

            {/* Card 4: Chest Expansion */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-500" /> चेस्ट माप (Chest Size)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-purple-100 text-purple-800">
                  ▲ +{chestDiff.toFixed(1)}" इंच चौड़ा
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">पहला माप (Baseline)</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">{firstLog.chestInches || 38.0}"</span>
                </div>
                <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/60">
                  <span className="text-[10px] text-purple-700 block font-bold">वर्तमान चेस्ट (Current)</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{latestLog.chestInches || 39.5}"</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>अपर बॉडी चौड़ाई:</span>
                <span className="font-bold text-purple-700">वी-टेपर आकार में वृद्धि ✓</span>
              </div>
            </div>

            {/* Card 5: Strength PR Gains */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-cyan-300 transition-all shadow-sm space-y-3 sm:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-500" /> स्ट्रेंथ PRs में सुधार (Power Lifts)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-100 text-emerald-800">
                  कुल ताकत में भारी वृद्धि
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">Bench Press</span>
                  <div className="font-black text-slate-900 font-mono text-sm mt-0.5">
                    {firstLog.benchPressPR || 60} &rarr; {latestLog.benchPressPR || 75} kg
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">+{benchGain} kg</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">Back Squat</span>
                  <div className="font-black text-slate-900 font-mono text-sm mt-0.5">
                    {firstLog.squatPR || 80} &rarr; {latestLog.squatPR || 105} kg
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">+{squatGain} kg</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">Deadlift</span>
                  <div className="font-black text-slate-900 font-mono text-sm mt-0.5">
                    {firstLog.deadliftPR || 100} &rarr; {latestLog.deadliftPR || 130} kg
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">+{deadliftGain} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Before vs Current Visual Progress Bars */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4.5 space-y-4">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>तुलनात्मक बार ग्राफ (Before vs After Comparative Bars)</span>
              <span className="text-[10px] font-normal text-slate-500 font-sans">
                शुरुआती माप (हल्का बार) vs वर्तमान माप (गहरा बार)
              </span>
            </h4>

            <div className="space-y-3 text-xs">
              {/* Weight Comparison */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">वजन (Weight)</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {firstLog.weightKg} kg &rarr; <strong className="text-slate-900">{latestLog.weightKg} kg</strong>
                    <span className="text-emerald-600 ml-1.5 font-bold">({weightDiff <= 0 ? `${weightDiff.toFixed(1)} kg` : `+${weightDiff.toFixed(1)} kg`})</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-400/50 h-full border-r border-white"
                    style={{ width: `${Math.min(100, (firstLog.weightKg / 100) * 100)}%` }}
                    title="Starting Weight"
                  />
                  <div
                    className="bg-amber-600 h-full"
                    style={{ width: `${Math.min(100, (latestLog.weightKg / 100) * 100)}%` }}
                    title="Current Weight"
                  />
                </div>
              </div>

              {/* Waist Comparison */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">कमर माप (Waist Inches)</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {firstLog.waistInches || 34}" &rarr; <strong className="text-slate-900">{latestLog.waistInches || 31.5}"</strong>
                    <span className="text-emerald-600 ml-1.5 font-bold">({waistDiff <= 0 ? `${waistDiff.toFixed(1)}"` : `+${waistDiff.toFixed(1)}"`})</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400/50 h-full border-r border-white"
                    style={{ width: `${Math.min(100, ((firstLog.waistInches || 34) / 45) * 100)}%` }}
                    title="Starting Waist"
                  />
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${Math.min(100, ((latestLog.waistInches || 31.5) / 45) * 100)}%` }}
                    title="Current Waist"
                  />
                </div>
              </div>

              {/* Biceps Comparison */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">बाइसेप्स (Biceps Peak)</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {firstLog.bicepsInches || 13}" &rarr; <strong className="text-slate-900">{latestLog.bicepsInches || 14.5}"</strong>
                    <span className="text-cyan-600 ml-1.5 font-bold">(+{bicepsDiff.toFixed(1)}")</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-400/50 h-full border-r border-white"
                    style={{ width: `${Math.min(100, ((firstLog.bicepsInches || 13) / 20) * 100)}%` }}
                    title="Starting Biceps"
                  />
                  <div
                    className="bg-cyan-600 h-full"
                    style={{ width: `${Math.min(100, ((latestLog.bicepsInches || 14.5) / 20) * 100)}%` }}
                    title="Current Biceps"
                  />
                </div>
              </div>

              {/* Bench Press Comparison */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">बेंच प्रेस स्ट्रेंथ (Bench Press Max)</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {firstLog.benchPressPR || 60} kg &rarr; <strong className="text-slate-900">{latestLog.benchPressPR || 75} kg</strong>
                    <span className="text-purple-600 ml-1.5 font-bold">(+{benchGain} kg)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-purple-400/50 h-full border-r border-white"
                    style={{ width: `${Math.min(100, ((firstLog.benchPressPR || 60) / 140) * 100)}%` }}
                    title="Starting Bench"
                  />
                  <div
                    className="bg-purple-600 h-full"
                    style={{ width: `${Math.min(100, ((latestLog.benchPressPR || 75) / 140) * 100)}%` }}
                    title="Current Bench"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Historical Log Records Table */}
          <div className="space-y-2">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
              तारीख-वार प्रगति रिकॉर्ड्स (Timeline Measurements History)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">तारीख (Date)</th>
                    <th className="py-2.5 px-3">वजन (Weight)</th>
                    <th className="py-2.5 px-3">कमर (Waist)</th>
                    <th className="py-2.5 px-3">बाइसेप्स (Arms)</th>
                    <th className="py-2.5 px-3">चेस्ट (Chest)</th>
                    <th className="py-2.5 px-3">बेंच प्रेस PR</th>
                    <th className="py-2.5 px-3">स्क्वाट PR</th>
                    <th className="py-2.5 px-3">नोट्स</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {sortedLogs.map((log, idx) => {
                    const prev = idx > 0 ? sortedLogs[idx - 1] : null;
                    const diff = prev ? log.weightKg - prev.weightKg : 0;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                          {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {log.weightKg} kg
                          {prev && (
                            <span className={`ml-1 text-[10px] ${diff <= 0 ? 'text-emerald-600' : 'text-cyan-600'}`}>
                              ({diff <= 0 ? `${diff.toFixed(1)}` : `+${diff.toFixed(1)}`})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{log.waistInches || '- '}"</td>
                        <td className="py-2.5 px-3 text-slate-700">{log.bicepsInches || '- '}"</td>
                        <td className="py-2.5 px-3 text-slate-700">{log.chestInches || '- '}"</td>
                        <td className="py-2.5 px-3 text-cyan-700 font-bold">{log.benchPressPR ? `${log.benchPressPR} kg` : '-'}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{log.squatPR ? `${log.squatPR} kg` : '-'}</td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-slate-500 max-w-[150px] truncate">{log.notes || 'सामान्य माप'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEIGHT EVOLUTION LINE GRAPH */}
      {activeChart === 'weight' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold">वजन प्रगति वक्र (Weight Progression Over Time)</span>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Recorded Weight (kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
                <span>Target Goal ({targetWeightKg} kg)</span>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto bg-slate-50/50 rounded-2xl border border-slate-200 p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[500px]"
              style={{ overflow: 'visible' }}
            >
              {/* Grid Horizontal Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + ratio * graphHeight;
                const val = (maxWeight - ratio * (maxWeight - minWeight)).toFixed(0);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val} kg
                    </text>
                  </g>
                );
              })}

              {/* Target Line */}
              <line
                x1={padding.left}
                y1={targetY}
                x2={svgWidth - padding.right}
                y2={targetY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              <text
                x={svgWidth - padding.right}
                y={targetY - 6}
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
                textAnchor="end"
              >
                Goal: {targetWeightKg} kg
              </text>

              {/* Weight Polyline Graph */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weightPoints}
              />

              {/* Data Point Circles and Date Labels */}
              {sortedLogs.map((l, i) => {
                const cx = getWeightX(i);
                const cy = getWeightY(l.weightKg);
                return (
                  <g key={l.id || i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#ffffff"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    {/* Weight Label above dot */}
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {l.weightKg}kg
                    </text>
                    {/* Date Label on X-Axis */}
                    <text
                      x={cx}
                      y={svgHeight - 12}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {new Date(l.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* TAB 3: STRENGTH PRS BAR GRAPH */}
      {activeChart === 'prs' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold">
            कंपाउंड लिफ्ट्स में स्ट्रेंथ प्रोग्रेशन (Powerlifting Maximum Lift PRs)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bench Press PR Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Bench Press 🏋️</span>
                <span className="text-purple-600 font-mono">{latestLog.benchPressPR || 0} kg</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((latestLog.benchPressPR || 0) / 140) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Start: {firstLog.benchPressPR || 0} kg</span>
                <span>Max Target: 140 kg</span>
              </div>
            </div>

            {/* Squat PR Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Back Squat 🦵</span>
                <span className="text-cyan-600 font-mono">{latestLog.squatPR || 0} kg</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((latestLog.squatPR || 0) / 180) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Start: {firstLog.squatPR || 0} kg</span>
                <span>Max Target: 180 kg</span>
              </div>
            </div>

            {/* Deadlift PR Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Deadlift ⚡</span>
                <span className="text-emerald-600 font-mono">{latestLog.deadliftPR || 0} kg</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((latestLog.deadliftPR || 0) / 220) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Start: {firstLog.deadliftPR || 0} kg</span>
                <span>Max Target: 220 kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BODY MEASUREMENTS TREND */}
      {activeChart === 'measurements' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold">
            शारीरिक माप परिवर्तन (Chest, Waist & Arms Transformation)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Chest (छाती)</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {latestLog.chestInches || 0} <span className="text-xs font-normal text-slate-400">inches</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                +{((latestLog.chestInches || 0) - (firstLog.chestInches || 0)).toFixed(1)} in gained
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Waist (कमर)</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {latestLog.waistInches || 0} <span className="text-xs font-normal text-slate-400">inches</span>
              </div>
              <div className="text-[11px] font-semibold text-cyan-600 mt-1">
                {((latestLog.waistInches || 0) - (firstLog.waistInches || 0)).toFixed(1)} in reduced
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Biceps (बाइसेप्स)</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {latestLog.bicepsInches || 0} <span className="text-xs font-normal text-slate-400">inches</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                +{((latestLog.bicepsInches || 0) - (firstLog.bicepsInches || 0)).toFixed(1)} in gained
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Thighs (जांघें)</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {latestLog.thighsInches || 21.0} <span className="text-xs font-normal text-slate-400">inches</span>
              </div>
              <div className="text-[11px] font-semibold text-purple-600 mt-1">
                +{thighsDiff.toFixed(1)} in gained
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
