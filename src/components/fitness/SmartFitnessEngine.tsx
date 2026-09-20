import React, { useState } from 'react';
import { FitnessGoal, Gender } from '../../types';
import { calculateFitnessMetrics, generateWorkoutRoutine, generateDietPlan } from '../../utils/fitnessCalculator';
import {
  Flame,
  Activity,
  HeartPulse,
  Droplets,
  Scale,
  Dumbbell,
  Utensils,
  ChevronRight,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SmartFitnessEngineProps {
  initialMember?: {
    heightCm: number;
    weightKg: number;
    age: number;
    gender: Gender;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    fitnessGoal: FitnessGoal;
    name?: string;
  };
}

export const SmartFitnessEngine: React.FC<SmartFitnessEngineProps> = ({
  initialMember = {
    heightCm: 175,
    weightKg: 78,
    age: 26,
    gender: 'male',
    activityLevel: 'active',
    fitnessGoal: 'muscle_building',
    name: 'Rahul Sharma',
  },
}) => {
  const [heightCm, setHeightCm] = useState<number>(initialMember.heightCm);
  const [weightKg, setWeightKg] = useState<number>(initialMember.weightKg);
  const [age, setAge] = useState<number>(initialMember.age);
  const [gender, setGender] = useState<Gender>(initialMember.gender);
  const [activityLevel, setActivityLevel] = useState(initialMember.activityLevel);
  const [goal, setGoal] = useState<FitnessGoal>(initialMember.fitnessGoal);

  const [activeTab, setActiveTab] = useState<'overview' | 'workout' | 'diet'>('overview');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Compute live fitness metrics
  const assessment = calculateFitnessMetrics(weightKg, heightCm, age, gender, activityLevel, goal);
  const workoutPlan = generateWorkoutRoutine(goal);
  const dietPlan = generateDietPlan(goal, assessment.targetDailyCalories);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Fitness & Diet Intelligence Engine
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              Biometric Analysis & AI Workout/Diet Planner
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Real-time metabolic calculation (BMR, TDEE), macronutrient precision targets, and personalized weekly workout splits.
            </p>
          </div>

          {/* Quick Fitness Score Badge */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-amber-400 bg-white shadow-sm">
              <span className="text-xl font-black text-amber-700 font-mono">{assessment.fitnessScore}</span>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Fitness Level</div>
              <div className="text-base font-black text-slate-900 flex items-center gap-1.5">
                {assessment.fitnessLevel}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-cyan-700 font-medium">BMI {assessment.bmi} • {assessment.bmiCategory}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Adjuster Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-600" />
          Adjust Biometric & Training Parameters
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Height */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Math.max(100, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-mono font-semibold"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(30, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-mono font-semibold"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.max(12, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-mono font-semibold"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="sedentary">Sedentary (Office desk)</option>
              <option value="light">Light (1-2 days/week)</option>
              <option value="moderate">Moderate (3-4 days)</option>
              <option value="active">Active (5-6 days/week)</option>
              <option value="very_active">Very Active (Hard labor / athlete)</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-semibold"
            >
              <option value="muscle_building">Muscle Building 🏋️‍♂️</option>
              <option value="weight_loss">Weight / Fat Loss 🔥</option>
              <option value="lean_bulk">Lean Bulk 💪</option>
              <option value="general_fitness">General Fitness 🏃</option>
              <option value="endurance">Athletic Endurance ⚡</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-cyan-600 text-cyan-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Metabolic & Macro Metrics
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'workout'
              ? 'border-cyan-600 text-cyan-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Weekly Workout Routine
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'diet'
              ? 'border-cyan-600 text-cyan-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Indian & Regional Diet Plan
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Daily Target Calories */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase font-bold text-slate-500">Target Calories</span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
                {assessment.targetDailyCalories} <span className="text-sm font-normal text-slate-400">kcal/day</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                TDEE: {assessment.tdee} kcal • BMR: {assessment.bmr} kcal
              </div>
            </div>

            {/* Est Body Fat */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase font-bold text-slate-500">Est. Body Fat</span>
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
                {assessment.bodyFatPercentage}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Lean Body Mass: ~{(weightKg * (1 - assessment.bodyFatPercentage / 100)).toFixed(1)} kg
              </div>
            </div>

            {/* Hydration Target */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase font-bold text-slate-500">Daily Water Goal</span>
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono mt-2">
                {assessment.hydrationLiters} <span className="text-sm font-normal text-slate-400">Liters</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ~{Math.round(assessment.hydrationLiters * 4)} glasses / day
              </div>
            </div>

            {/* Ideal Weight Range */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase font-bold text-slate-500">Ideal Weight</span>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
                {assessment.idealWeightRange.min} - {assessment.idealWeightRange.max} <span className="text-sm font-normal text-slate-400">kg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                For {heightCm} cm stature (BMI 18.5-24.9)
              </div>
            </div>
          </div>

          {/* Macronutrient Distribution Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-cyan-600" />
              Target Daily Macronutrient Split
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Protein */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-rose-700 uppercase">
                  <span>Protein</span>
                  <span>{Math.round((assessment.macros.proteinGrams * 400) / assessment.targetDailyCalories)}%</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {assessment.macros.proteinGrams}g
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {(assessment.macros.proteinGrams / weightKg).toFixed(1)}g per kg bodyweight
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-amber-700 uppercase">
                  <span>Carbohydrates</span>
                  <span>{Math.round((assessment.macros.carbsGrams * 400) / assessment.targetDailyCalories)}%</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {assessment.macros.carbsGrams}g
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Complex fuel for high intensity gym sessions
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Healthy Fats */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-800 uppercase">
                  <span>Healthy Fats</span>
                  <span>{Math.round((assessment.macros.fatsGrams * 900) / assessment.targetDailyCalories)}%</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {assessment.macros.fatsGrams}g
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Essential for hormonal balance & joint health
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT PLAN */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          {/* Day Selector Pill Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {workoutPlan.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  selectedDayIndex === idx
                    ? 'bg-cyan-600 text-white shadow-sm font-black'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Day {idx + 1}
              </button>
            ))}
          </div>

          {/* Selected Day Routine Card */}
          {workoutPlan[selectedDayIndex] && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {workoutPlan[selectedDayIndex].dayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-cyan-700 font-semibold uppercase tracking-wider">
                      Focus: {workoutPlan[selectedDayIndex].focus}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {workoutPlan[selectedDayIndex].exercises.length} Exercises Planned
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Target: {goal.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Exercise Table */}
              <div className="divide-y divide-slate-100 mt-2">
                {workoutPlan[selectedDayIndex].exercises.map((ex, exIdx) => (
                  <div key={ex.id || exIdx} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0 mt-0.5">
                        {exIdx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          {ex.name}
                          <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {ex.targetMuscle}
                          </span>
                        </div>
                        {ex.notes && (
                          <div className="text-xs text-slate-500 mt-0.5">💡 {ex.notes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono ml-10 sm:ml-0">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">Sets: </span>
                        <strong className="text-slate-900">{ex.sets}</strong>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">Reps: </span>
                        <strong className="text-amber-700">{ex.reps}</strong>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">Rest: </span>
                        <strong className="text-cyan-700">{ex.restSeconds}s</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGIONAL DIET PLAN */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex items-center gap-3 shadow-sm">
            <Zap className="w-5 h-5 shrink-0 text-cyan-600" />
            <span>
              <strong>Regional Indian & Bastar Nutrition:</strong> Tailored with readily available high-protein foods like Rahar Dal, Moong Chilla, Fresh Paneer, Soya Chunks, Sprouts, Boiled Eggs & Chicken.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietPlan.map((meal, mIdx) => (
              <div key={mIdx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{meal.mealName}</h4>
                      <p className="text-xs text-cyan-700 font-medium">{meal.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-mono font-bold text-cyan-800">
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

                <div className="pt-3 border-t border-slate-100 flex justify-between text-[11px] font-mono text-slate-600">
                  <span>P: <strong className="text-rose-600">{meal.proteinGrams}g</strong></span>
                  <span>C: <strong className="text-amber-600">{meal.carbsGrams}g</strong></span>
                  <span>F: <strong className="text-cyan-700">{meal.fatsGrams}g</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
