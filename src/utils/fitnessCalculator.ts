import { FitnessGoal, Gender, WorkoutDay, MealItem, CustomDietPlan, CustomWorkoutPlan } from '../types';

export interface FitnessAssessment {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetDailyCalories: number;
  bodyFatPercentage: number;
  fitnessScore: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Athletic' | 'Elite';
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
  };
  hydrationLiters: number;
  idealWeightRange: { min: number; max: number };
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'female' ? -161 : 5));
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
): number {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
}

export function calculateFitnessMetrics(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate',
  goal: FitnessGoal = 'general_fitness'
): FitnessAssessment {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 24.9) bmiCategory = 'Normal weight';
  else if (bmi < 29.9) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Mifflin-St Jeor equation for BMR
  const bmr = calculateBMR(weightKg, heightCm, age, gender);

  const tdee = calculateTDEE(bmr, activityLevel);

  // Target Daily Calories according to Goal
  let targetDailyCalories = tdee;
  if (goal === 'weight_loss') targetDailyCalories = Math.max(1300, tdee - 500);
  else if (goal === 'muscle_building') targetDailyCalories = tdee + 350;
  else if (goal === 'lean_bulk') targetDailyCalories = tdee + 200;
  else if (goal === 'endurance') targetDailyCalories = tdee + 150;

  // Body Fat Percentage estimation (Deurenberg formula)
  const isFemale = gender === 'female';
  let bodyFatPercentage = Math.round(1.2 * bmi + 0.23 * age - (isFemale ? 5.4 : 16.2));
  if (bodyFatPercentage < 5) bodyFatPercentage = 8;
  if (bodyFatPercentage > 50) bodyFatPercentage = 45;

  // Macronutrient breakdown
  let proteinRatio = 0.25;
  let carbsRatio = 0.50;
  let fatsRatio = 0.25;

  if (goal === 'muscle_building' || goal === 'lean_bulk') {
    proteinRatio = 0.30;
    carbsRatio = 0.48;
    fatsRatio = 0.22;
  } else if (goal === 'weight_loss') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatsRatio = 0.30;
  }

  const proteinGrams = Math.round((targetDailyCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetDailyCalories * carbsRatio) / 4);
  const fatsGrams = Math.round((targetDailyCalories * fatsRatio) / 9);

  // Fitness Score calculation (0 - 100)
  let score = 50;
  // BMI deviation score
  const bmiDiff = Math.abs(bmi - 22.0);
  score += Math.max(-25, 25 - bmiDiff * 4);

  // Activity level addition
  if (activityLevel === 'very_active') score += 20;
  else if (activityLevel === 'active') score += 15;
  else if (activityLevel === 'moderate') score += 10;
  else if (activityLevel === 'light') score += 5;

  // Goal alignment factor
  if (goal === 'muscle_building' || goal === 'endurance') score += 5;

  score = Math.min(96, Math.max(25, Math.round(score)));

  let fitnessLevel: 'Beginner' | 'Intermediate' | 'Athletic' | 'Elite' = 'Beginner';
  if (score >= 85) fitnessLevel = 'Elite';
  else if (score >= 70) fitnessLevel = 'Athletic';
  else if (score >= 48) fitnessLevel = 'Intermediate';

  // Hydration recommendation (35-40 ml per kg + workout bonus)
  const hydrationLiters = parseFloat(((weightKg * 0.038) + 0.5).toFixed(1));

  // Ideal weight range for height
  const idealWeightRange = {
    min: Math.round(18.5 * heightM * heightM),
    max: Math.round(24.9 * heightM * heightM),
  };

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    targetDailyCalories,
    bodyFatPercentage,
    fitnessScore: score,
    fitnessLevel,
    macros: {
      proteinGrams,
      carbsGrams,
      fatsGrams,
    },
    hydrationLiters,
    idealWeightRange,
  };
}

export function generateWorkoutRoutine(goal: FitnessGoal): WorkoutDay[] {
  switch (goal) {
    case 'muscle_building':
    case 'lean_bulk':
      return [
        {
          dayName: 'Monday: Push (Chest, Shoulders & Triceps)',
          focus: 'Hypertrophy & Strength',
          exercises: [
            { id: 'ex-1', name: 'Barbell Flat Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8-10', restSeconds: 90, notes: 'Warm up thoroughly, progressive overload' },
            { id: 'ex-2', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Focus on squeeze at top' },
            { id: 'ex-3', name: 'Seated Dumbbell Shoulder Press', targetMuscle: 'Deltoids', sets: 4, reps: '8-12', restSeconds: 75, notes: 'Keep core tight, elbows 45°' },
            { id: 'ex-4', name: 'Dumbbell Lateral Raises', targetMuscle: 'Lateral Delts', sets: 4, reps: '12-15', restSeconds: 45, notes: 'Controlled eccentric phase' },
            { id: 'ex-5', name: 'Cable Triceps Rope Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Spread rope apart at bottom' },
            { id: 'ex-6', name: 'Dips / Diamond Push-ups', targetMuscle: 'Chest & Triceps', sets: 3, reps: 'To Failure', restSeconds: 60, notes: 'Bodyweight burnout' },
          ],
        },
        {
          dayName: 'Tuesday: Pull (Back & Biceps)',
          focus: 'V-Taper & Back Width',
          exercises: [
            { id: 'ex-7', name: 'Conventional Deadlift', targetMuscle: 'Lower Back & Posterior Chain', sets: 4, reps: '5-8', restSeconds: 120, notes: 'Maintain neutral spine' },
            { id: 'ex-8', name: 'Lat Pulldown / Weighted Pull-ups', targetMuscle: 'Lats', sets: 4, reps: '8-12', restSeconds: 75, notes: 'Pull with elbows down' },
            { id: 'ex-9', name: 'Seated Cable Row', targetMuscle: 'Mid-Back & Rhomboids', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Squeeze shoulder blades' },
            { id: 'ex-10', name: 'Barbell Bicep Curls', targetMuscle: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Strict form, no swinging' },
            { id: 'ex-11', name: 'Hammer Curls with Dumbbells', targetMuscle: 'Brachialis & Forearms', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Great for arm thickness' },
            { id: 'ex-12', name: 'Face Pulls with Cable', targetMuscle: 'Rear Delts & Rotators', sets: 4, reps: '15-20', restSeconds: 45, notes: 'Shoulder health and posture' },
          ],
        },
        {
          dayName: 'Wednesday: Legs & Abs',
          focus: 'Lower Body Power & Core',
          exercises: [
            { id: 'ex-13', name: 'Barbell Back Squat', targetMuscle: 'Quadriceps & Glutes', sets: 4, reps: '6-10', restSeconds: 120, notes: 'Parallel depth or below' },
            { id: 'ex-14', name: 'Leg Press', targetMuscle: 'Quads', sets: 3, reps: '12-15', restSeconds: 90, notes: 'Do not lock knees out at top' },
            { id: 'ex-15', name: 'Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings & Glutes', sets: 3, reps: '10-12', restSeconds: 75, notes: 'Hinge hips back, feel hamstring stretch' },
            { id: 'ex-16', name: 'Standing Calf Raises', targetMuscle: 'Calves', sets: 4, reps: '15-20', restSeconds: 45, notes: 'Hold at top contraction for 2s' },
            { id: 'ex-17', name: 'Hanging Leg Raises', targetMuscle: 'Lower Abdominals', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Control swing' },
            { id: 'ex-18', name: 'Plank Hold', targetMuscle: 'Core Stability', sets: 3, reps: '60s hold', restSeconds: 45, notes: 'Glutes and abs contracted' },
          ],
        },
        {
          dayName: 'Thursday: Active Recovery / Cardio & Mobility',
          focus: 'Flexibility & Cardiovascular Health',
          exercises: [
            { id: 'ex-19', name: 'Treadmill Incline Walking', targetMuscle: 'Cardiovascular', sets: 1, reps: '25 mins', restSeconds: 0, notes: 'Speed: 5.5 km/h, Incline: 10%' },
            { id: 'ex-20', name: 'Foam Rolling & Hip Mobility', targetMuscle: 'Mobility & Myofascial', sets: 1, reps: '15 mins', restSeconds: 0, notes: 'Hips, quads, thoracic spine' },
          ],
        },
        {
          dayName: 'Friday: Upper Body Strength Focus',
          focus: 'Density & Heavy Compound Lift',
          exercises: [
            { id: 'ex-21', name: 'Overhead Barbell Military Press', targetMuscle: 'Shoulders & Core', sets: 4, reps: '6-8', restSeconds: 90, notes: 'Explosive up, controlled down' },
            { id: 'ex-22', name: 'Chest Supported T-Bar Row', targetMuscle: 'Upper Back', sets: 4, reps: '8-10', restSeconds: 75, notes: 'Zero lower back strain' },
            { id: 'ex-23', name: 'Dumbbell Incline Flyes', targetMuscle: 'Chest Stretch', sets: 3, reps: '12-15', restSeconds: 60, notes: 'Deep stretch at bottom' },
            { id: 'ex-24', name: 'Overhead Tricep French Press', targetMuscle: 'Triceps Long Head', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Elbows tucked in' },
            { id: 'ex-25', name: 'Incline Dumbbell Bicep Curls', targetMuscle: 'Biceps Long Head', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Supinate at top' },
          ],
        },
        {
          dayName: 'Saturday: High Volume Legs & Conditioning',
          focus: 'Endurance, Hypertrophy & Calves',
          exercises: [
            { id: 'ex-26', name: 'Bulgarian Split Squats', targetMuscle: 'Quads & Glutes', sets: 3, reps: '10/leg', restSeconds: 75, notes: 'Keep torso slightly inclined forward' },
            { id: 'ex-27', name: 'Lying Hamstring Leg Curls', targetMuscle: 'Hamstrings', sets: 4, reps: '12-15', restSeconds: 60, notes: 'Slow negative' },
            { id: 'ex-28', name: 'Walking Lunges with Dumbbells', targetMuscle: 'Leg Burnout', sets: 3, reps: '20 paces', restSeconds: 60, notes: 'Continuous stride' },
            { id: 'ex-29', name: 'Seated Calf Raise Machine', targetMuscle: 'Soleus', sets: 4, reps: '15-20', restSeconds: 45, notes: 'Full range of motion' },
          ],
        },
      ];

    case 'weight_loss':
      return [
        {
          dayName: 'Monday: Metabolic HIIT & Full Body Circuit',
          focus: 'Caloric Burn & Elevated Heart Rate',
          exercises: [
            { id: 'ex-w1', name: 'Kettlebell Goblet Squats', targetMuscle: 'Full Body', sets: 4, reps: '15-18', restSeconds: 45, notes: 'Fast pace, full depth' },
            { id: 'ex-w2', name: 'Dumbbell Push-up to Renegade Row', targetMuscle: 'Chest & Back', sets: 3, reps: '10/side', restSeconds: 45, notes: 'Brace core firmly' },
            { id: 'ex-w3', name: 'Kettlebell Swings', targetMuscle: 'Posterior Chain & Cardio', sets: 4, reps: '20', restSeconds: 45, notes: 'Snap hips forward' },
            { id: 'ex-w4', name: 'Mountain Climbers', targetMuscle: 'Core & Cardio', sets: 4, reps: '40s burst', restSeconds: 30, notes: 'Drive knees fast' },
            { id: 'ex-w5', name: 'Treadmill HIIT Sprints', targetMuscle: 'Cardio', sets: 8, reps: '30s sprint / 30s rest', restSeconds: 30, notes: 'Speed 12-14 km/h' },
          ],
        },
        {
          dayName: 'Tuesday: Upper Body Strength & Core',
          focus: 'Muscle Retention During Deficit',
          exercises: [
            { id: 'ex-w6', name: 'Dumbbell Chest Press', targetMuscle: 'Chest', sets: 4, reps: '12', restSeconds: 60, notes: 'Controlled tempo' },
            { id: 'ex-w7', name: 'Seated Cable Row', targetMuscle: 'Back', sets: 4, reps: '12', restSeconds: 60, notes: 'Contract shoulder blades' },
            { id: 'ex-w8', name: 'Dumbbell Arnold Press', targetMuscle: 'Shoulders', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Full rotation' },
            { id: 'ex-w9', name: 'Plank Knee to Elbow', targetMuscle: 'Obliques', sets: 3, reps: '15/side', restSeconds: 30, notes: 'Feel the side crunch' },
            { id: 'ex-w10', name: 'Spin Bike Intervals', targetMuscle: 'Cardio', sets: 1, reps: '20 mins', restSeconds: 0, notes: 'Alternate 1 min high resistance / 1 min recovery' },
          ],
        },
        {
          dayName: 'Wednesday: Lower Body Burnout',
          focus: 'Glutes, Quads & Hamstrings Fat Burn',
          exercises: [
            { id: 'ex-w11', name: 'Dumbbell Romanian Deadlifts', targetMuscle: 'Hamstrings', sets: 4, reps: '12-15', restSeconds: 60, notes: 'Hip hinge' },
            { id: 'ex-w12', name: 'Step-ups on Bench with Dumbbells', targetMuscle: 'Quads & Glutes', sets: 3, reps: '12/leg', restSeconds: 45, notes: 'Drive through the heel' },
            { id: 'ex-w13', name: 'Leg Extension Machine', targetMuscle: 'Quads', sets: 3, reps: '15-20', restSeconds: 45, notes: 'Drop set on last round' },
            { id: 'ex-w14', name: 'Jump Squats', targetMuscle: 'Plyometrics', sets: 3, reps: '15', restSeconds: 45, notes: 'Soft landing on balls of feet' },
            { id: 'ex-w15', name: 'Rowing Machine Intervals', targetMuscle: 'Full Body Cardio', sets: 5, reps: '500m row', restSeconds: 60, notes: 'Target <2:00 split' },
          ],
        },
        {
          dayName: 'Thursday: Active Recovery & Flexibility',
          focus: 'Mobility & Fat-Oxidation Zone 2 Cardio',
          exercises: [
            { id: 'ex-w16', name: 'Brisk Walk on Incline (Zone 2)', targetMuscle: 'Aerobic Fat Burn', sets: 1, reps: '40 mins', restSeconds: 0, notes: 'Keep heart rate 120-135 BPM' },
            { id: 'ex-w17', name: 'Full Body Dynamic Stretching', targetMuscle: 'Mobility', sets: 1, reps: '20 mins', restSeconds: 0, notes: 'Focus on hamstrings, calves, spine' },
          ],
        },
        {
          dayName: 'Friday: Functional Upper & Battle Ropes',
          focus: 'High Afterburn Effect (EPOC)',
          exercises: [
            { id: 'ex-w18', name: 'Lat Pulldowns', targetMuscle: 'Back', sets: 4, reps: '12-15', restSeconds: 45, notes: 'Strict form' },
            { id: 'ex-w19', name: 'Push-ups', targetMuscle: 'Chest & Core', sets: 4, reps: '15-20', restSeconds: 45, notes: 'Solid chest to floor' },
            { id: 'ex-w20', name: 'Battle Ropes Alternating Waves', targetMuscle: 'Shoulders & Core', sets: 5, reps: '30s on / 30s off', restSeconds: 30, notes: 'Maximum intensity' },
            { id: 'ex-w21', name: 'Bicycle Crunches', targetMuscle: 'Abs', sets: 3, reps: '25/side', restSeconds: 30, notes: 'Controlled tempo' },
          ],
        },
        {
          dayName: 'Saturday: Weekend Cardio Blitz & Core',
          focus: 'Maximum Caloric Output',
          exercises: [
            { id: 'ex-w22', name: 'Box Jumps or Step-over Burpees', targetMuscle: 'Full Body Explosive', sets: 4, reps: '12', restSeconds: 45, notes: 'Safe landing' },
            { id: 'ex-w23', name: 'Medicine Ball Slams', targetMuscle: 'Full Body & Core', sets: 4, reps: '15', restSeconds: 30, notes: 'Slam with full force' },
            { id: 'ex-w24', name: 'Russian Twists with Plate', targetMuscle: 'Obliques', sets: 3, reps: '20/side', restSeconds: 30, notes: 'Keep feet off floor' },
            { id: 'ex-w25', name: 'StairMaster Climber', targetMuscle: 'Glutes & Calves', sets: 1, reps: '20 mins', restSeconds: 0, notes: 'Steady climbing rhythm' },
          ],
        },
      ];

    default: // general_fitness or endurance
      return [
        {
          dayName: 'Monday: Full Body Strength & Conditioning',
          focus: 'Functional Movement & Core',
          exercises: [
            { id: 'ex-g1', name: 'Goblet Squats', targetMuscle: 'Lower Body', sets: 3, reps: '12', restSeconds: 60, notes: 'Posture upright' },
            { id: 'ex-g2', name: 'Push-ups / Dumbbell Bench', targetMuscle: 'Chest & Arms', sets: 3, reps: '12-15', restSeconds: 60, notes: 'Core stable' },
            { id: 'ex-g3', name: 'Dumbbell One-Arm Row', targetMuscle: 'Back', sets: 3, reps: '12/arm', restSeconds: 60, notes: 'Support on flat bench' },
            { id: 'ex-g4', name: 'Plank Hold', targetMuscle: 'Core', sets: 3, reps: '45s', restSeconds: 45, notes: 'Breathe evenly' },
            { id: 'ex-g5', name: 'Elliptical Cardio', targetMuscle: 'Cardio', sets: 1, reps: '15 mins', restSeconds: 0, notes: 'Moderate pace' },
          ],
        },
        {
          dayName: 'Wednesday: Mobility, Balance & Core',
          focus: 'Joint Health, Agility & Stability',
          exercises: [
            { id: 'ex-g6', name: 'Walking Lunges with Light Weights', targetMuscle: 'Legs & Balance', sets: 3, reps: '12/leg', restSeconds: 45, notes: 'Stable knees' },
            { id: 'ex-g7', name: 'Dumbbell Overhead Press', targetMuscle: 'Shoulders', sets: 3, reps: '12', restSeconds: 60, notes: 'Smooth motion' },
            { id: 'ex-g8', name: 'Bird Dog & Cat-Cow', targetMuscle: 'Spinal Mobility', sets: 3, reps: '10/side', restSeconds: 30, notes: 'Slow deliberate stretch' },
            { id: 'ex-g9', name: 'Side Plank', targetMuscle: 'Obliques', sets: 3, reps: '30s/side', restSeconds: 30, notes: 'Keep body in straight line' },
          ],
        },
        {
          dayName: 'Friday: Circuit & Functional Endurance',
          focus: 'Heart Health & Stamina',
          exercises: [
            { id: 'ex-g10', name: 'Romanian Deadlifts with Dumbbells', targetMuscle: 'Hamstrings & Glutes', sets: 3, reps: '12', restSeconds: 60, notes: 'Flat back' },
            { id: 'ex-g11', name: 'Cable Face Pulls', targetMuscle: 'Upper Back & Posture', sets: 3, reps: '15', restSeconds: 45, notes: 'Strengthen rotator cuff' },
            { id: 'ex-g12', name: 'Farmer Walk with Heavy Dumbbells', targetMuscle: 'Grip & Core', sets: 3, reps: '40 meters', restSeconds: 60, notes: 'Tall upright posture' },
            { id: 'ex-g13', name: 'Stationary Cycling', targetMuscle: 'Cardio', sets: 1, reps: '20 mins', restSeconds: 0, notes: 'Steady pace' },
          ],
        },
      ];
  }
}

export function generateDietPlan(goal: FitnessGoal, targetCalories: number): MealItem[] {
  if (goal === 'weight_loss') {
    return [
      {
        mealName: 'Early Morning (6:30 AM)',
        description: 'Metabolism Kickstart & Hydration',
        items: ['500ml Warm water with lemon & chia seeds', '5 Soaked almonds + 2 walnuts', 'Black coffee or Green tea without sugar'],
        calories: 110,
        proteinGrams: 3,
        carbsGrams: 4,
        fatsGrams: 9,
      },
      {
        mealName: 'High Protein Breakfast (8:30 AM)',
        description: 'Lean Protein & Complex Carbs',
        items: ['Moong Dal & Vegetable Chilla (2 pcs) with mint chutney OR 3 Boiled Egg Whites + 1 whole egg omelette', '1 Multi-grain Roti or 40g Rolled Oats with cinnamon and almond milk', '1 Cup black tea / green tea'],
        calories: 380,
        proteinGrams: 28,
        carbsGrams: 38,
        fatsGrams: 10,
      },
      {
        mealName: 'Mid-Morning Snack (11:30 AM)',
        description: 'Fiber & Antioxidants',
        items: ['1 Bowl fresh Papaya or 1 Green Apple', '1 Cup Roasted Salted Chana (Bengal Gram)', 'Fresh coconut water (low sugar hydration)'],
        calories: 160,
        proteinGrams: 6,
        carbsGrams: 28,
        fatsGrams: 3,
      },
      {
        mealName: 'Energizing Lunch (1:30 PM)',
        description: 'Indian Balanced Plate - Local Chhattisgarh Style',
        items: ['150g Grilled Chicken Breast OR 150g Low-fat Paneer / Soya Chunks Curry', '1 Small bowl Yellow Dal / Rahar Dal', '1 Whole Wheat Roti or 1 small cup Brown Rice', 'Large cucumber, tomato & onion salad with lemon juice'],
        calories: 510,
        proteinGrams: 44,
        carbsGrams: 48,
        fatsGrams: 12,
      },
      {
        mealName: 'Pre-Workout & Evening Snack (5:00 PM)',
        description: 'Pre-Gym Clean Fuel',
        items: ['1 Banana or 1 slice whole wheat bread with 1 tsp Peanut Butter', 'Black coffee (pre-workout booster)', '1 Scoop Whey Protein with water (or sprouted moong salad)'],
        calories: 260,
        proteinGrams: 26,
        carbsGrams: 30,
        fatsGrams: 4,
      },
      {
        mealName: 'Lean Dinner (8:30 PM)',
        description: 'Light Digestible Dinner Before Sleep',
        items: ['Stir-fried seasonal vegetables (Broccoli, capsicum, beans, mushroom)', '120g Grilled Paneer / Tofu / Fish Curry with minimal oil', '1 Multigrain Roti or Clear Vegetable Chicken Soup', 'Small cup homemade probiotics curd (Dahi)'],
        calories: 390,
        proteinGrams: 32,
        carbsGrams: 32,
        fatsGrams: 11,
      },
    ];
  } else {
    // Muscle Building & Lean Bulk
    return [
      {
        mealName: 'Early Morning (6:30 AM)',
        description: 'Hydration & Brain Fuel',
        items: ['500ml water + 1 Spoon Honey & Himalayan pink salt', '7 Soaked Almonds + 3 Walnuts + 2 Medjool Dates'],
        calories: 180,
        proteinGrams: 4,
        carbsGrams: 24,
        fatsGrams: 10,
      },
      {
        mealName: 'Power Breakfast (8:30 AM)',
        description: 'High Calorie & Maximum Protein',
        items: ['60g Rolled Oats cooked in milk with 1 scoop Whey Protein, sliced banana & peanut butter', '3 Whole Boiled Eggs + 2 Egg Whites OR 100g Paneer Bhurji with 2 Rotis'],
        calories: 620,
        proteinGrams: 48,
        carbsGrams: 64,
        fatsGrams: 18,
      },
      {
        mealName: 'Mid-Morning Mass Snack (11:30 AM)',
        description: 'Clean Muscle Fuel',
        items: ['Sprouted Moong & Kala Chana chaat with paneer cubes and chaat masala', '1 Seasonal fruit (Apple / Banana / Orange)', 'Handful of roasted peanuts'],
        calories: 280,
        proteinGrams: 15,
        carbsGrams: 36,
        fatsGrams: 8,
      },
      {
        mealName: 'Gym Warrior Lunch (1:30 PM)',
        description: 'Heavy Compound Meal',
        items: ['200g Chicken Breast OR 150g Fresh Paneer Curry with ghee', '2 Bowls Arhar/Moong Dal', '2 Large Whole Wheat Rotis + 1 Cup Steamed Basmati Rice', 'Cucumber curd raita + mixed greens salad'],
        calories: 740,
        proteinGrams: 52,
        carbsGrams: 84,
        fatsGrams: 20,
      },
      {
        mealName: 'Pre-Workout Fuel (5:00 PM)',
        description: 'Nitric Oxide & Glycogen Loader',
        items: ['2 Bananas + 2 Slices brown bread with 20g natural Peanut Butter', '1 Cup Black Coffee or pre-workout drink'],
        calories: 350,
        proteinGrams: 10,
        carbsGrams: 56,
        fatsGrams: 10,
      },
      {
        mealName: 'Post-Workout Anabolic Window (7:30 PM)',
        description: 'Muscle Protein Synthesis Boost',
        items: ['1 Scoop Whey Protein Isolate in water or milk', '30g Dextrose / 1 ripe Banana or 5g Creatine Monohydrate with water'],
        calories: 220,
        proteinGrams: 27,
        carbsGrams: 24,
        fatsGrams: 2,
      },
      {
        mealName: 'Recovery Dinner (9:00 PM)',
        description: 'Sustained Amino Release for Overnight Growth',
        items: ['150g Grilled Fish / Chicken / Soya Chunks / Paneer', '1 Bowl Dal Palak / Green leafy vegetable sabzi', '2 Rotis with light ghee', 'Warm glass of Golden Turmeric Milk before bed'],
        calories: 520,
        proteinGrams: 42,
        carbsGrams: 45,
        fatsGrams: 15,
      },
    ];
  }
}

export interface AutoDietInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: FitnessGoal;
  dietType: 'veg' | 'non_veg' | 'eggitarian';
  memberId: string;
  memberName: string;
  trainerId?: string;
  trainerName?: string;
}

export function generateAutomaticCustomDiet(input: AutoDietInput): CustomDietPlan {
  const { weightKg, heightCm, age, gender, goal, dietType, memberId, memberName, trainerId = 'usr-2', trainerName = 'Coach Vikram Sahu' } = input;

  // 1. Calculate BMR (Mifflin-St Jeor)
  const isFemale = gender === 'female';
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (isFemale ? -161 : 5));
  const tdee = Math.round(bmr * 1.55); // moderate athletic training

  // 2. Target Calories based on Goal
  let targetCalories = tdee;
  if (goal === 'weight_loss') targetCalories = Math.max(1400, tdee - 500);
  else if (goal === 'muscle_building') targetCalories = tdee + 350;
  else if (goal === 'lean_bulk') targetCalories = tdee + 200;
  else if (goal === 'endurance') targetCalories = tdee + 150;

  // 3. Macronutrients calibrated to Body Mass (g / kg)
  let proteinPerKg = 2.0;
  if (goal === 'weight_loss') proteinPerKg = 2.2;
  else if (goal === 'general_fitness') proteinPerKg = 1.8;

  const targetProtein = Math.round(weightKg * proteinPerKg);
  const targetFats = Math.round((targetCalories * 0.22) / 9);
  const targetCarbs = Math.max(80, Math.round((targetCalories - (targetProtein * 4 + targetFats * 9)) / 4));

  // 4. Generate structured 5-meal plan
  let meals: MealItem[] = [];

  if (dietType === 'non_veg') {
    const isLoss = goal === 'weight_loss';
    meals = [
      {
        mealName: '1. Early Morning Ignition (सुबह 06:30 बजे)',
        description: 'Metabolic & Electrolyte Kickstart',
        calories: Math.round(targetCalories * 0.08),
        proteinGrams: 10,
        carbsGrams: 15,
        fatsGrams: 5,
        items: [
          '500ml गुनगुना पानी + 1 नींबू का रस व चिया सीड्स',
          '3 उबले अंडे की सफेदी (Boiled Egg Whites)',
          '5 भीगे हुए बादाम + 2 अखरोट',
          'बिना चीनी वाली ग्रीन टी / ब्लैक कॉफी',
        ],
      },
      {
        mealName: '2. High Protein Breakfast (सुबह 08:30 बजे)',
        description: 'Muscle Fuel & Sustained Glycogen',
        calories: Math.round(targetCalories * 0.25),
        proteinGrams: Math.round(targetProtein * 0.25),
        carbsGrams: Math.round(targetCarbs * 0.26),
        fatsGrams: Math.round(targetFats * 0.25),
        items: [
          '4 उबले अंडे (3 सफेदी + 1 पूरा अंडा) या आमलेट',
          isLoss ? '50g रोल्ड ओट्स पानी/कम फैट दूध में पके हुए' : '70g रोल्ड ओट्स दूध में + 1 केला व 1 चम्मच पीनट बटर',
          '1 मल्टीग्रेन ब्रेड टोस्ट (ब्राउन ब्रेड)',
          '1 कटोरी स्प्राउट्स (अंकुरित मूंग व चना)',
        ],
      },
      {
        mealName: '3. Anabolic Power Lunch (दोपहर 01:30 बजे)',
        description: 'Compound Recovery Meal (Lean Poultry / Fish)',
        calories: Math.round(targetCalories * 0.32),
        proteinGrams: Math.round(targetProtein * 0.35),
        carbsGrams: Math.round(targetCarbs * 0.32),
        fatsGrams: Math.round(targetFats * 0.30),
        items: [
          isLoss ? '180g ग्रिल्ड चिकन ब्रेस्ट (कम तेल/मसाले में)' : '220g चिकन ब्रेस्ट करी या रोस्टेड फिश',
          '1 कटोरी पीली अरहर/मूंग दाल (तड़का रहित)',
          isLoss ? '1 कप उबला ब्राउन राइस या 2 पतली फुल्का रोटी' : '1.5 कप बासमती राइस + 2 गेहूं की रोटियां',
          'बड़ी प्लेट हरी ककड़ी, खीरा, टमाटर, प्याज सलाद + 1 कटोरी ताजा दही',
        ],
      },
      {
        mealName: '4. Pre-Workout Booster (शाम 05:00 बजे)',
        description: 'Gym Energy & Nitric Oxide Pump',
        calories: Math.round(targetCalories * 0.12),
        proteinGrams: 12,
        carbsGrams: Math.round(targetCarbs * 0.18),
        fatsGrams: 6,
        items: [
          '1 मध्यम पका केला + 1 चम्मच प्राकृतिक पीनट बटर',
          '1 स्लाइस ब्राउन ब्रेड',
          '1 कप स्ट्रॉन्ग ब्लैक कॉफी (प्री-वर्कआउट पंप हेतु)',
          'पर्याप्त पानी (500ml)',
        ],
      },
      {
        mealName: '5. Post-Workout & Lean Dinner (रात्रि 08:30 बजे)',
        description: 'Muscle Protein Synthesis & Overnight Recovery',
        calories: Math.round(targetCalories * 0.23),
        proteinGrams: Math.round(targetProtein * 0.25),
        carbsGrams: Math.round(targetCarbs * 0.20),
        fatsGrams: Math.round(targetFats * 0.22),
        items: [
          '1 स्कूप व्हे प्रोटीन (वर्कआउट के 20 मिनट अंदर)',
          '150g ग्रिल्ड चिकन ब्रेस्ट या उबली फिश / 4 अंडे की सफेदी',
          '1 कटोरी हरी पत्तेदार सब्जी (पालक, मेथी, ब्रोकली, बीन्स)',
          '1-2 मल्टीग्रेन रोटी + 1 कटोरी दाल',
          'सोने से पहले 1 कप गुनगुना हल्दी वाला लो-फैट दूध',
        ],
      },
    ];
  } else if (dietType === 'eggitarian') {
    const isLoss = goal === 'weight_loss';
    meals = [
      {
        mealName: '1. Early Morning Starter (सुबह 06:30 बजे)',
        description: 'Alkaline Water & Good Fats',
        calories: Math.round(targetCalories * 0.08),
        proteinGrams: 8,
        carbsGrams: 14,
        fatsGrams: 5,
        items: [
          '500ml गुनगुना पानी + नींबू व चिया सीड्स',
          '2 उबले अंडे की सफेदी',
          '6 भीगे हुए बादाम + 2 अखरोट',
          '1 कप ग्रीन टी',
        ],
      },
      {
        mealName: '2. Egg & Oats Power Breakfast (सुबह 08:30 बजे)',
        description: 'High Bioavailability Protein',
        calories: Math.round(targetCalories * 0.25),
        proteinGrams: Math.round(targetProtein * 0.26),
        carbsGrams: Math.round(targetCarbs * 0.25),
        fatsGrams: Math.round(targetFats * 0.25),
        items: [
          '4 उबले अंडे (3 सफेदी + 1 पूरा अंडा) या वेजिटेबल एग भुर्जी',
          '50g रोल्ड ओट्स दूध में + 1 चम्मच कद्दू के बीज',
          '1 मल्टीग्रेन रोटी या टोस्ट',
          '1 कटोरी अंकुरित मूंग चाट',
        ],
      },
      {
        mealName: '3. Paneer & Egg Protein Lunch (दोपहर 01:30 बजे)',
        description: 'Dual Source Vegetarian & Egg Nutrition',
        calories: Math.round(targetCalories * 0.32),
        proteinGrams: Math.round(targetProtein * 0.34),
        carbsGrams: Math.round(targetCarbs * 0.32),
        fatsGrams: Math.round(targetFats * 0.30),
        items: [
          '120g लो-फैट ताजा पनीर भुर्जी + 2 उबले अंडे',
          '1 बड़ी कटोरी पीली मूंग/अरहर दाल',
          '2 गेहूं की फुल्का रोटी या 1 कप उबला ब्राउन राइस',
          'खीरा, ककड़ी, टमाटर, नींबू सलाद + 1 कप ताजा दही',
        ],
      },
      {
        mealName: '4. Pre-Workout Fuel (शाम 05:00 बजे)',
        description: 'Quick Carbohydrate Energy',
        calories: Math.round(targetCalories * 0.12),
        proteinGrams: 10,
        carbsGrams: Math.round(targetCarbs * 0.18),
        fatsGrams: 5,
        items: [
          '1 पका केला + 1 स्लाइस ब्राउन ब्रेड 1 चम्मच पीनट बटर',
          '1 कप ब्लैक कॉफी',
          'भुना हुआ चना (30g)',
        ],
      },
      {
        mealName: '5. Soya & Egg Recovery Dinner (रात्रि 08:30 बजे)',
        description: 'Tissue Repair & Deep Sleep Support',
        calories: Math.round(targetCalories * 0.23),
        proteinGrams: Math.round(targetProtein * 0.25),
        carbsGrams: Math.round(targetCarbs * 0.22),
        fatsGrams: Math.round(targetFats * 0.22),
        items: [
          '1 स्कूप व्हे प्रोटीन शेक',
          '70g उबले सोया चंक्स करी या 100g पनीर करी',
          '3 उबले अंडे की सफेदी',
          '1-2 मल्टीग्रेन रोटी + उबली हरी बीन्स, ब्रोकली, गाजर',
          'सोने से पूर्व 1 कप हल्दी दूध',
        ],
      },
    ];
  } else {
    // PURE VEG (शाकाहारी)
    const isLoss = goal === 'weight_loss';
    meals = [
      {
        mealName: '1. Early Morning Detox (सुबह 06:30 बजे)',
        description: 'Hydration & Digestive Health',
        calories: Math.round(targetCalories * 0.08),
        proteinGrams: 6,
        carbsGrams: 16,
        fatsGrams: 6,
        items: [
          '500ml गुनगुना जीरा/मेथी पानी + नींबू का रस',
          '1 चम्मच भीगे हुए चिया सीड्स (ओमेगा-3)',
          '7 भीगे बादाम + 2 अखरोट गिरी + 1 अंजीर',
          'बिना चीनी की ग्रीन टी या हर्बल काढ़ा',
        ],
      },
      {
        mealName: '2. High Protein Veg Breakfast (सुबह 08:30 बजे)',
        description: 'Plant & Dairy Muscle Fuel',
        calories: Math.round(targetCalories * 0.25),
        proteinGrams: Math.round(targetProtein * 0.25),
        carbsGrams: Math.round(targetCarbs * 0.26),
        fatsGrams: Math.round(targetFats * 0.25),
        items: [
          '2 बेसन व पनीर का चीला (कम तेल में) हरी पुदीना चटनी के साथ',
          'या 60g रोल्ड ओट्स लो-फैट दूध में + 1 स्कूप व्हे प्रोटीन + 1 कटा सेब/केला',
          '1 कटोरी अंकुरित हरी मूंग व काला चना चाट (नींबू व हल्के सेंधा नमक के साथ)',
          '1 मुट्ठी भुनी अलसी के बीज (Flax seeds)',
        ],
      },
      {
        mealName: '3. Full Protein Vegetarian Lunch (दोपहर 01:30 बजे)',
        description: 'Indian Balanced High-Protein Thali',
        calories: Math.round(targetCalories * 0.32),
        proteinGrams: Math.round(targetProtein * 0.35),
        carbsGrams: Math.round(targetCarbs * 0.32),
        fatsGrams: Math.round(targetFats * 0.28),
        items: [
          isLoss ? '150g लो-फैट पनीर या टोफू भुर्जी / करी' : '180g ताजा पनीर / सोयाबीन पनीर (टोफू) करी',
          '1 बड़ी कटोरी गाढ़ी पीली अरहर / मूंग / चना दाल',
          isLoss ? '1 कप उबला ब्राउन राइस या 2 पतली गेहूं की रोटियां' : '1.5 कप चावल + 2 शुद्ध देसी गेहूं की रोटियां',
          '1 कटोरी ताजा घर का बना लो-फैट दही (प्रोबायोटिक्स)',
          'बड़ी प्लेट खीरा, चुकंदर, ककड़ी, गाजर सलाद',
        ],
      },
      {
        mealName: '4. Pre-Workout Clean Carb (शाम 05:00 बजे)',
        description: 'Natural Gym Energy Booster',
        calories: Math.round(targetCalories * 0.12),
        proteinGrams: 10,
        carbsGrams: Math.round(targetCarbs * 0.18),
        fatsGrams: 6,
        items: [
          '1 मध्यम पका केला + 1 चम्मच प्राकृतिक 100% पीनट बटर',
          '1 मल्टीग्रेन ब्राउन ब्रेड स्लाइस',
          '1 कप स्ट्रॉन्ग ब्लैक कॉफी (प्री-वर्कआउट स्टैमिना बूस्टर)',
          '40g भुना हुआ चना (Roasted Chana)',
        ],
      },
      {
        mealName: '5. Soya Chunks & Paneer Dinner (रात्रि 08:30 बजे)',
        description: 'Fast Muscle Repair & Recovery',
        calories: Math.round(targetCalories * 0.23),
        proteinGrams: Math.round(targetProtein * 0.26),
        carbsGrams: Math.round(targetCarbs * 0.20),
        fatsGrams: Math.round(targetFats * 0.22),
        items: [
          '1 स्कूप व्हे प्रोटीन (वर्कआउट के बाद पानी में)',
          '80g उबले हुए सोया चंक्स करी (52% शुद्ध प्रोटीन) या 100g पनीर',
          '1 कटोरी दाल पालक या हरी पत्तेदार मौसमी सब्जी (मेथी, ब्रोकली, बीन्स)',
          '1-2 मल्टीग्रेन रोटी (कम तेल/घी)',
          'रात को सोने से पूर्व 1 कप गुनगुना हल्दी वाला गाय का दूध',
        ],
      },
    ];
  }

  const notes = `व्यक्तिगत ट्रेनर निर्देश (${trainerName}):\n• यह डाइट चार्ट सदस्य के सटीक वजन (${weightKg} kg), बीएमआई व फिटनेस लक्ष्य (${goal.replace('_', ' ')}) के आधार पर दैनिक ${targetCalories} kcal और ${targetProtein}g प्रोटीन हेतु स्वचालित रूप से तैयार किया गया है।\n• प्रतिदिन 3.5 से 4 लीटर पानी अवश्य पिएं।\n• वर्कआउट के तुरंत बाद व्हे प्रोटीन शेक अवश्य लें।`;

  return {
    id: `diet-${memberId}-${Date.now()}`,
    memberId,
    memberName,
    trainerId,
    trainerName,
    updatedAt: new Date().toISOString(),
    dietType,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    meals,
    notes,
  };
}

export interface AutoWorkoutInput {
  memberId: string;
  memberName: string;
  goal: FitnessGoal;
  level?: string;
  trainerId?: string;
  trainerName?: string;
}

export function generateAutomaticCustomWorkout(input: AutoWorkoutInput): CustomWorkoutPlan {
  const {
    memberId,
    memberName,
    goal,
    level = 'Intermediate',
    trainerId = 'usr-2',
    trainerName = 'Coach Vikram Sahu',
  } = input;

  const days = generateWorkoutRoutine(goal);

  const goalLabels: Record<FitnessGoal, string> = {
    muscle_building: 'मसल बिल्डिंग (Hypertrophy & Strength)',
    lean_bulk: 'लीन बल्क (Lean Muscle & Clean Bulk)',
    weight_loss: 'वेट लॉस व फैट बर्न (Fat Loss & HIIT)',
    endurance: 'स्टैमिना व एंड्योरेंस (Cardio & Stamina)',
    general_fitness: 'जनरल फिटनेस (Total Body Fitness)',
  };

  return {
    id: `workout-${memberId}-${Date.now()}`,
    memberId,
    memberName,
    trainerId,
    trainerName,
    updatedAt: new Date().toISOString(),
    goal,
    level,
    days,
    notes: `कोच ${trainerName} द्वारा स्वचालित निर्धारित साप्ताहिक वर्कआउट रूटीन (${goalLabels[goal] || goal})। प्रत्येक एक्सरसाइज से पूर्व 5-7 मिनट वार्म-अप व स्ट्रेचिंग अनिवार्य है। प्रोग्रेसिव ओवरलोड का पालन करें।`,
  };
}
