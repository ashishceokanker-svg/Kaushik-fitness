import React, { useState } from 'react';
import { CustomWorkoutPlan, WorkoutDay, WorkoutExercise, FitnessGoal } from '../../types';
import { generateWorkoutRoutine } from '../../utils/fitnessCalculator';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface TrainerWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  trainerId: string;
  trainerName: string;
  memberStats?: {
    goal: FitnessGoal;
    weightKg?: number;
    heightCm?: number;
  };
  existingWorkout?: CustomWorkoutPlan;
  onSave: (workout: CustomWorkoutPlan) => void;
}

export const TrainerWorkoutModal: React.FC<TrainerWorkoutModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  trainerId,
  trainerName,
  memberStats,
  existingWorkout,
  onSave,
}) => {
  if (!isOpen) return null;

  const initialDays: WorkoutDay[] =
    existingWorkout?.days && existingWorkout.days.length > 0
      ? existingWorkout.days
      : generateWorkoutRoutine(memberStats?.goal || 'muscle_building');

  const [days, setDays] = useState<WorkoutDay[]>(initialDays);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(
    existingWorkout?.goal || memberStats?.goal || 'muscle_building'
  );
  const [level, setLevel] = useState<string>(existingWorkout?.level || 'Intermediate');
  const [notes, setNotes] = useState<string>(
    existingWorkout?.notes ||
      `कोच ${trainerName} द्वारा व्यक्तिगत रूप से निर्धारित साप्ताहिक वर्कआउट रूटीन। फॉर्म और सुरक्षा का ध्यान रखें।`
  );
  const [autoNotice, setAutoNotice] = useState<string | null>(null);

  // Auto-generate fresh weekly workout split based on selected goal
  const handleAutoGenerate = (goal: FitnessGoal) => {
    setSelectedGoal(goal);
    const newRoutine = generateWorkoutRoutine(goal);
    setDays(newRoutine);
    setSelectedDayIdx(0);

    const goalLabels: Record<FitnessGoal, string> = {
      muscle_building: 'मसल बिल्डिंग (Hypertrophy)',
      lean_bulk: 'लीन बल्क (Lean Bulk)',
      weight_loss: 'वेट लॉस व फैट बर्न (Fat Loss)',
      endurance: 'स्टैमिना व एंड्योरेंस (Endurance)',
      general_fitness: 'जनरल फिटनेस (Fitness)',
    };

    setAutoNotice(
      `✨ ${goalLabels[goal] || goal} के लिए 6-दिवसीय वर्कआउट रूटीन स्वतः लोड हो गया है! आप नीचे किसी भी दिन या एक्सरसाइज को संशोधित कर सकते हैं।`
    );
    setTimeout(() => setAutoNotice(null), 6000);
  };

  // Day header editing
  const handleUpdateDay = (field: 'dayName' | 'focus', value: string) => {
    const updated = [...days];
    updated[selectedDayIdx] = { ...updated[selectedDayIdx], [field]: value };
    setDays(updated);
  };

  // Exercise updating
  const handleUpdateExercise = (exIdx: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...days];
    const currentExercises = [...updated[selectedDayIdx].exercises];
    currentExercises[exIdx] = { ...currentExercises[exIdx], [field]: value };
    updated[selectedDayIdx] = { ...updated[selectedDayIdx], exercises: currentExercises };
    setDays(updated);
  };

  // Add exercise to current day
  const handleAddExercise = () => {
    const updated = [...days];
    const newEx: WorkoutExercise = {
      id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: 'नई एक्सरसाइज (New Exercise)',
      targetMuscle: 'Target Muscle',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      notes: 'Strict form, controlled tempo',
    };
    updated[selectedDayIdx].exercises.push(newEx);
    setDays(updated);
  };

  // Remove exercise
  const handleRemoveExercise = (exIdx: number) => {
    const updated = [...days];
    if (updated[selectedDayIdx].exercises.length <= 1) {
      alert('प्रत्येक दिन में कम से कम एक एक्सरसाइज होनी चाहिए।');
      return;
    }
    updated[selectedDayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: CustomWorkoutPlan = {
      id: existingWorkout?.id || `workout-${memberId}-${Date.now()}`,
      memberId,
      memberName,
      trainerId,
      trainerName,
      updatedAt: new Date().toISOString(),
      goal: selectedGoal,
      level,
      days,
      notes,
    };
    onSave(plan);
    onClose();
  };

  const currentDay = days[selectedDayIdx] || days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              Coach Smart Workout Engine
            </div>
            <h2 className="text-lg font-black tracking-wide">
              {memberName} के लिए साप्ताहिक वर्कआउट रूटीन (Weekly Workout Plan)
            </h2>
            <p className="text-xs text-slate-300">
              कोच: Coach {trainerName} • 6-दिवसीय स्प्लिट में एक्सरसाइज, सेट्स, रेप्स व रेस्ट कस्टमाइज़ करें
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* AUTO WORKOUT SPLIT GENERATOR TOOLBAR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-cyan-50/90 border border-slate-200 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-xs text-slate-900 uppercase">
                    फिटनेस लक्ष्य अनुसार ऑटो रूटीन जनरेटर (Auto-Generate by Goal)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  सदस्य लक्ष्य: <strong className="text-amber-800 capitalize">{selectedGoal.replace('_', ' ')}</strong> • स्तर: <strong className="text-slate-800">{level}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoGenerate('muscle_building')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'muscle_building'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
                  }`}
                >
                  💪 मसल बिल्डिंग
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoGenerate('weight_loss')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'weight_loss'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white hover:bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  🔥 फैट लॉस / HIIT
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoGenerate('lean_bulk')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'lean_bulk'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-white hover:bg-cyan-50 text-cyan-900 border border-cyan-300'
                  }`}
                >
                  ⚡ लीन बल्क
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoGenerate('general_fitness')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'general_fitness'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  🏃 फिटनेस
                </button>
              </div>
            </div>

            {autoNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{autoNotice}</span>
              </div>
            )}
          </div>

          {/* DAY SELECTOR TABS (Monday to Saturday / Days) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-600" />
                साप्ताहिक दिन चुनें (Select Day of Week)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                दिन {selectedDayIdx + 1} of {days.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {days.map((d, dIdx) => {
                const isSelected = dIdx === selectedDayIdx;
                const shortTitle = d.dayName.split(':')[0] || `Day ${dIdx + 1}`;
                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setSelectedDayIdx(dIdx)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-500/50'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-black text-xs">{shortTitle}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                      {d.focus || 'Routine'}
                    </div>
                    <div className="text-[9px] font-mono opacity-80 mt-1">
                      {d.exercises.length} एक्सरसाइज
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CURRENT DAY EDITOR */}
          {currentDay && (
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 shadow-xs">
              {/* Day Header Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    दिन का शीर्षक (Day Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentDay.dayName}
                    onChange={(e) => handleUpdateDay('dayName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    टारगेट फोकस / मांसपेशी (Target Muscle Focus) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentDay.focus}
                    onChange={(e) => handleUpdateDay('focus', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Exercises Table / Cards */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-amber-600" />
                    <span>एक्सरसाइज सूची ({currentDay.exercises.length} Exercises)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ एक्सरसाइज जोड़ें</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentDay.exercises.map((ex, exIdx) => (
                    <div
                      key={ex.id || exIdx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {exIdx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Exercise Name (e.g. Incline Bench Press)"
                            value={ex.name}
                            onChange={(e) => handleUpdateExercise(exIdx, 'name', e.target.value)}
                            className="w-full font-bold text-xs text-slate-900 border-b border-dashed border-slate-300 focus:border-amber-500 focus:outline-none py-0.5"
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <input
                            type="text"
                            placeholder="Target Muscle"
                            value={ex.targetMuscle}
                            onChange={(e) => handleUpdateExercise(exIdx, 'targetMuscle', e.target.value)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 w-32 focus:outline-none focus:border-amber-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sets, Reps, Rest, Notes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">सेट्स (Sets)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            required
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(exIdx, 'sets', Number(e.target.value))}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">रेप्स (Reps)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 8-12"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(exIdx, 'reps', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-xs text-amber-700 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">आराम (Rest Sec)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="15"
                              value={ex.restSeconds}
                              onChange={(e) => handleUpdateExercise(exIdx, 'restSeconds', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-xs text-cyan-700 font-mono"
                            />
                            <span className="text-[10px] text-slate-400">s</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">कोच निर्देश (Cues)</label>
                          <input
                            type="text"
                            placeholder="e.g. Slow eccentric"
                            value={ex.notes || ''}
                            onChange={(e) => handleUpdateExercise(exIdx, 'notes', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trainer Instructions & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ट्रेनर गाइडलाइन व विशेष साप्ताहिक निर्देश (Trainer Guidelines & Recovery Notes)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Progressive overload on bench and squat. Warm up shoulders thoroughly. Foam roll on Thursdays."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Last saved: {existingWorkout?.updatedAt ? new Date(existingWorkout.updatedAt).toLocaleDateString('en-IN') : 'New Routine'}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>वर्कआउट रूटीन सेव करें (Save & Assign)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
