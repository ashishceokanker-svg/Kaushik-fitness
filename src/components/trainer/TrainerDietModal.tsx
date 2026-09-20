import React, { useState } from 'react';
import { CustomDietPlan, MealItem, FitnessGoal } from '../../types';
import { generateAutomaticCustomDiet } from '../../utils/fitnessCalculator';
import {
  Utensils,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Apple,
  Drumstick,
  Egg,
} from 'lucide-react';

interface TrainerDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  trainerId: string;
  trainerName: string;
  memberStats?: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: 'male' | 'female';
    goal: FitnessGoal;
    bmi?: number;
  };
  existingDiet?: CustomDietPlan;
  onSave: (diet: CustomDietPlan) => void;
}

export const TrainerDietModal: React.FC<TrainerDietModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  trainerId,
  trainerName,
  memberStats,
  existingDiet,
  onSave,
}) => {
  if (!isOpen) return null;

  const defaultMeals: MealItem[] = [
    {
      mealName: '1. Power Breakfast (सुबह का नाश्ता)',
      description: 'High Protein Oats & Sprouted Salad',
      calories: 550,
      proteinGrams: 35,
      carbsGrams: 65,
      fatsGrams: 12,
      items: ['5 Boiled Egg Whites / 100g Paneer', '80g Rolled Oats with Milk', '10 Almonds', '1 Banana'],
    },
    {
      mealName: '2. High Energy Lunch (दोपहर का भोजन)',
      description: 'Chicken Breast / Paneer Rice Thali',
      calories: 650,
      proteinGrams: 45,
      carbsGrams: 75,
      fatsGrams: 15,
      items: ['150g Grilled Chicken OR 120g Paneer', '1.5 Cup Rice / 2 Rotis', '1 Bowl Dal', 'Curd & Salad'],
    },
    {
      mealName: '3. Pre-Workout Fuel (वर्कआउट से पूर्व)',
      description: 'Clean Carb & Energy Ignition',
      calories: 320,
      proteinGrams: 12,
      carbsGrams: 45,
      fatsGrams: 10,
      items: ['2 Brown Bread with Peanut Butter', '1 Black Coffee', '1 Banana'],
    },
    {
      mealName: '4. Post-Workout Recovery (वर्कआउट बाद)',
      description: 'Rapid Muscle Protein Synthesis',
      calories: 220,
      proteinGrams: 32,
      carbsGrams: 4,
      fatsGrams: 2,
      items: ['1 Scoop Whey Protein with water', '3 Boiled Egg Whites / Soya Snack'],
    },
    {
      mealName: '5. Lean Dinner (रात्रि भोजन)',
      description: 'Light Satiety & Recovery',
      calories: 450,
      proteinGrams: 28,
      carbsGrams: 55,
      fatsGrams: 10,
      items: ['2 Wheat Rotis', 'Mixed Vegetables', '100g Soya chunks / Dal', 'Warm Turmeric Milk'],
    },
  ];

  const [meals, setMeals] = useState<MealItem[]>(existingDiet?.meals || defaultMeals);
  const [targetCalories, setTargetCalories] = useState<number>(existingDiet?.targetCalories || 2500);
  const [targetProtein, setTargetProtein] = useState<number>(existingDiet?.targetProtein || 150);
  const [targetCarbs, setTargetCarbs] = useState<number>(existingDiet?.targetCarbs || 280);
  const [targetFats, setTargetFats] = useState<number>(existingDiet?.targetFats || 65);
  const [selectedDietType, setSelectedDietType] = useState<'veg' | 'non_veg' | 'eggitarian'>(existingDiet?.dietType || 'veg');
  const [autoNotice, setAutoNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(
    existingDiet?.notes || 'Follow strictly. Drink 3.5 Liters of water daily. No outside junk food.'
  );

  // Auto Generate Diet based on Member's Body Mass & Selected Preference
  const handleAutoGenerate = (type: 'veg' | 'non_veg' | 'eggitarian') => {
    setSelectedDietType(type);
    const stats = memberStats || {
      weightKg: 78,
      heightCm: 175,
      age: 26,
      gender: 'male' as const,
      goal: 'muscle_building' as const,
    };

    const generated = generateAutomaticCustomDiet({
      weightKg: stats.weightKg,
      heightCm: stats.heightCm,
      age: stats.age,
      gender: stats.gender,
      goal: stats.goal,
      dietType: type,
      memberId,
      memberName,
      trainerId,
      trainerName,
    });

    setMeals(generated.meals);
    setTargetCalories(generated.targetCalories);
    setTargetProtein(generated.targetProtein);
    setTargetCarbs(generated.targetCarbs);
    setTargetFats(generated.targetFats);
    if (generated.notes) setNotes(generated.notes);

    const typeLabel = type === 'veg' ? 'शाकाहारी (Pure Veg)' : type === 'non_veg' ? 'मांसाहारी (Non-Veg)' : 'अंडे के साथ (Eggitarian)';
    setAutoNotice(`✨ ${typeLabel} डाइट चार्ट सदस्य के शरीर भार (${stats.weightKg} kg) व लक्ष्य अनुसार तैयार हो गया! आप नीचे कोई भी बदलाव कर सकते हैं।`);
    setTimeout(() => setAutoNotice(null), 6000);
  };

  // Meal editing helpers
  const handleUpdateMeal = (idx: number, field: keyof MealItem, value: any) => {
    const updated = [...meals];
    updated[idx] = { ...updated[idx], [field]: value };
    setMeals(updated);
  };

  const handleAddItemToMeal = (mealIdx: number, itemText: string) => {
    if (!itemText.trim()) return;
    const updated = [...meals];
    updated[mealIdx].items.push(itemText.trim());
    setMeals(updated);
  };

  const handleRemoveItemFromMeal = (mealIdx: number, itemIdx: number) => {
    const updated = [...meals];
    updated[mealIdx].items.splice(itemIdx, 1);
    setMeals(updated);
  };

  const handleAddNewMeal = () => {
    const newMeal: MealItem = {
      mealName: `${meals.length + 1}. Additional Meal (अतिरिक्त भोजन)`,
      description: 'Balanced Nutrition',
      calories: 300,
      proteinGrams: 20,
      carbsGrams: 35,
      fatsGrams: 8,
      items: ['Healthy Snack / Protein Shake'],
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMeal = (idx: number) => {
    if (meals.length <= 1) {
      alert('A diet plan must contain at least one meal.');
      return;
    }
    const updated = [...meals];
    updated.splice(idx, 1);
    setMeals(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: CustomDietPlan = {
      id: existingDiet?.id || `diet-${memberId}`,
      memberId,
      memberName,
      trainerId,
      trainerName,
      updatedAt: new Date().toISOString(),
      dietType: selectedDietType,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      meals,
      notes,
    };
    onSave(plan);
    onClose();
  };

  const totalMealCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalMealProtein = meals.reduce((sum, m) => sum + Number(m.proteinGrams || 0), 0);
  const totalMealCarbs = meals.reduce((sum, m) => sum + Number(m.carbsGrams || 0), 0);
  const totalMealFats = meals.reduce((sum, m) => sum + Number(m.fatsGrams || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fade-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              Coach Smart Diet Engine
            </div>
            <h2 className="text-lg font-black tracking-wide">
              {memberName} के लिए कस्टमाइज़्ड डाइट प्लान (Diet Chart)
            </h2>
            <p className="text-xs text-slate-300">
              ट्रेनर: Coach {trainerName} • बॉडी मास अनुसार वेज / नॉन-वेज चुनें या संशोधित करें
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* AUTO DIET GENERATION TOOLBAR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50/80 via-amber-50/80 to-emerald-50/80 border border-slate-200 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-xs text-slate-900 uppercase">
                    बॉडी मास आधार पर ऑटोमैटिक डाइट बनाएं (Auto Diet Generator)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  सदस्य भार: <strong className="text-slate-900">{memberStats?.weightKg || 78} kg</strong> • लंबाई: <strong className="text-slate-900">{memberStats?.heightCm || 175} cm</strong> • लक्ष्य: <strong className="text-amber-700 capitalize">{memberStats?.goal?.replace('_', ' ') || 'Muscle Building'}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoGenerate('veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedDietType === 'veg'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>🥗 शाकाहारी (Veg)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoGenerate('non_veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedDietType === 'non_veg'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  <Drumstick className="w-3.5 h-3.5" />
                  <span>🍗 मांसाहारी (Non-Veg)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoGenerate('eggitarian')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedDietType === 'eggitarian'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  <Egg className="w-3.5 h-3.5" />
                  <span>🥚 अंडा (Eggitarian)</span>
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

          {/* Target Nutrition Overview */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>दैनिक पोषण लक्ष्य (Daily Target Macros)</span>
              <span className="text-[11px] text-amber-700 font-mono">
                मील्स का योग: {totalMealCalories} kcal | P: {totalMealProtein}g | C: {totalMealCarbs}g | F: {totalMealFats}g
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Target Calories (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  required
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-red-600 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  required
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Healthy Fats (g)
                </label>
                <input
                  type="number"
                  required
                  value={targetFats}
                  onChange={(e) => setTargetFats(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-cyan-600 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Meals Configuration List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-cyan-600" />
                <span>मील्स व खाद्य सामग्री (Meals Schedule - {meals.length} Meals)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddNewMeal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नई मील जोड़ें</span>
              </button>
            </div>

            <div className="space-y-4">
              {meals.map((meal, mIdx) => (
                <div
                  key={mIdx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        required
                        value={meal.mealName}
                        onChange={(e) => handleUpdateMeal(mIdx, 'mealName', e.target.value)}
                        placeholder="Meal Name (e.g. 1. Breakfast)"
                        className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-cyan-500 focus:outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span>Cal:</span>
                        <input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => handleUpdateMeal(mIdx, 'calories', Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-slate-800"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(mIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete this meal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meal Macros */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-sans">Prot:</span>
                      <input
                        type="number"
                        value={meal.proteinGrams}
                        onChange={(e) => handleUpdateMeal(mIdx, 'proteinGrams', Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-slate-300 rounded font-bold text-red-600 bg-white"
                      />
                      <span>g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-sans">Carb:</span>
                      <input
                        type="number"
                        value={meal.carbsGrams}
                        onChange={(e) => handleUpdateMeal(mIdx, 'carbsGrams', Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-slate-300 rounded font-bold text-amber-600 bg-white"
                      />
                      <span>g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-sans">Fat:</span>
                      <input
                        type="number"
                        value={meal.fatsGrams}
                        onChange={(e) => handleUpdateMeal(mIdx, 'fatsGrams', Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-slate-300 rounded font-bold text-cyan-600 bg-white"
                      />
                      <span>g</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={meal.description || ''}
                        onChange={(e) => handleUpdateMeal(mIdx, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-[11px] text-slate-700 bg-white font-sans"
                      />
                    </div>
                  </div>

                  {/* Food Items List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      खाद्य सामग्री (Food Items & Portions):
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {meal.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center justify-between group bg-slate-50 px-2.5 py-1 rounded-lg">
                          <span>• {item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromMeal(mIdx, iIdx)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Quick Add Item Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="+ नया आइटम जोड़ें (e.g. 100g Paneer Bhurji / 3 Boiled Eggs)"
                        id={`input-add-item-${mIdx}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            handleAddItemToMeal(mIdx, val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const inputEl = document.getElementById(`input-add-item-${mIdx}`) as HTMLInputElement;
                          if (inputEl && inputEl.value) {
                            handleAddItemToMeal(mIdx, inputEl.value);
                            inputEl.value = '';
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        + जोड़ें
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trainer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ट्रेनर गाइडलाइन व विशेष निर्देश (Trainer Guidelines & Hydration Notes)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drink 4L water daily, take multivitamin with breakfast, no sugar."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Last saved: {existingDiet?.updatedAt ? new Date(existingDiet.updatedAt).toLocaleDateString('en-IN') : 'New Diet'}
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
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>डाइट प्लान सेव करें (Save & Assign)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
