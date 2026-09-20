import React, { useState } from 'react';
import { HumanAthlete3DCanvas } from './HumanAthlete3DCanvas';
import { Anatomy3DCanvas } from './Anatomy3DCanvas';
import {
  Dumbbell,
  Zap,
  Flame,
  ShieldCheck,
  Award,
  Play,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Mail,
  ChevronRight,
  Star,
  Sparkles,
  Users,
  Activity,
  KeyRound,
  Shield,
  X
} from 'lucide-react';

interface ClemusHomePageProps {
  onNavigateToPortal: (tab?: string) => void;
  onOpenEnquiry: (goal?: any) => void;
  onOpenLogin: () => void;
  onOpenPinKiosk: () => void;
}

interface TrainingClass {
  id: string;
  category: 'strength' | 'cardio' | 'wellness' | 'special';
  title: string;
  titleHi: string;
  subtitle: string;
  duration: string;
  intensity: 'High' | 'Extreme' | 'Moderate';
  caloriesBurn: string;
  badge: string;
  description: string;
  highlights: string[];
}

const CLASSES_DATA: TrainingClass[] = [
  {
    id: 'hypertrophy',
    category: 'strength',
    title: 'HYPERTROPHY & BODYBUILDING',
    titleHi: 'बॉडीबिल्डिंग व मसल गेन',
    subtitle: 'Max Muscle Mass & Aesthetic V-Taper Sculpting',
    duration: '60 - 75 Mins',
    intensity: 'High',
    caloriesBurn: '520 kcal',
    badge: '01 / STRENGTH',
    description: 'Targeted progressive overload protocols utilizing calibrated Olympic free weights, Hammer Strength machines, and drop-set isolation movements for peak hypertrophy.',
    highlights: ['Progressive Overload Protocols', 'Custom Muscle Split Routines', 'Posing & Symmetry Optimization'],
  },
  {
    id: 'crossfit',
    category: 'special',
    title: 'FUNCTIONAL CROSSFIT & HIIT',
    titleHi: 'क्रॉसफ़िट व हाई-इंटेंसिटी',
    subtitle: 'Explosive Stamina, Agility & Athletic Conditioning',
    duration: '45 - 55 Mins',
    intensity: 'Extreme',
    caloriesBurn: '680 kcal',
    badge: '02 / CONDITIONING',
    description: 'High-octane metabolic circuits combining battle ropes, plyo boxes, tyre flips, kettlebells, and barbell thrusters designed to incinerate fat and forge raw conditioning.',
    highlights: ['WOD (Workout of the Day)', 'Athletic Speed & Agility', 'High Caloric Afterburn (EPOC)'],
  },
  {
    id: 'powerlifting',
    category: 'strength',
    title: 'POWERLIFTING & MAX STRENGTH',
    titleHi: 'पावरलिफ्टिंग (स्क्वॉट, बेंच, डेडलिफ्ट)',
    subtitle: 'Big 3 Mastery: Squat, Bench Press, Deadlift',
    duration: '75 - 90 Mins',
    intensity: 'Extreme',
    caloriesBurn: '480 kcal',
    badge: '03 / POWER',
    description: 'Scientific CNS recruitment training with certified coaches. Perfect your hip-hinge biomechanics, bracing techniques, and smash personal strength records safely.',
    highlights: ['Calibrated Competition Plates', 'Spine & Joint Bracing Drills', '1RM Strength Periodization'],
  },
  {
    id: 'fatloss',
    category: 'cardio',
    title: 'EXTREME FAT LOSS & SHRED',
    titleHi: 'वज़न घटाना व कैलोरी बर्न',
    subtitle: 'Rapid Visceral Fat Reduction & Lean Definition',
    duration: '50 Mins',
    intensity: 'High',
    caloriesBurn: '620 kcal',
    badge: '04 / CARDIO',
    description: 'Science-backed heart-rate zone training combining curved treadmills, air bikes, sled pushes, and core circuits tailored for accelerated stubborn fat loss.',
    highlights: ['Targeted Heart Rate Zones', 'Low-Impact Joint Protection', 'Weekly Body Index Scans'],
  },
  {
    id: 'pt',
    category: 'special',
    title: '1-ON-1 ELITE PERSONAL TRAINING',
    titleHi: 'पर्सनल ट्रेनिंग (1-on-1 PT)',
    subtitle: 'Dedicated Master Coach & Guaranteed Results',
    duration: '60 Mins',
    intensity: 'High',
    caloriesBurn: '550 kcal',
    badge: '05 / EXCLUSIVE',
    description: 'Private 1-on-1 coaching with customized nutrition plans, biometric tracking, form correction on every repetition, and daily accountability for maximum results.',
    highlights: ['1-on-1 Dedicated Trainer', 'Tailored Macro Diet Chart', 'WhatsApp Progress Check-ins'],
  },
  {
    id: 'aerobics',
    category: 'cardio',
    title: 'AEROBICS & ZUMBA FITNESS',
    titleHi: 'एरोबिक्स व जुम्बा डांस',
    subtitle: 'Rhythm, Cardio Dance & Full-Body Energy',
    duration: '50 Mins',
    intensity: 'Moderate',
    caloriesBurn: '450 kcal',
    badge: '06 / AEROBIC',
    description: 'High-energy musical group workouts designed for cardiovascular endurance, flexibility, mood boosting, and burning calories in a motivating group environment.',
    highlights: ['Dynamic Choreography', 'All Fitness Levels Welcome', 'Upbeat High-BPM Sound System'],
  },
  {
    id: 'yoga',
    category: 'wellness',
    title: 'YOGA & MOBILITY RECOVERY',
    titleHi: 'योग, स्ट्रेचिंग व रिकवरी',
    subtitle: 'Joint Decompression, Flexibility & Core Alignment',
    duration: '60 Mins',
    intensity: 'Moderate',
    caloriesBurn: '280 kcal',
    badge: '07 / WELLNESS',
    description: 'Holistic restorative sessions focusing on myofascial release, hamstrings and hip mobility, spine decompression, and mindful pranayama breathing.',
    highlights: ['Injury Prevention & Rehab', 'Deep Tissue Mobility', 'Posture & Spinal Alignment'],
  },
  {
    id: 'women',
    category: 'special',
    title: "WOMEN'S STRENGTH & TONING",
    titleHi: 'महिला फिटनेस व बॉडी शेपिंग',
    subtitle: 'Booty Sculpting, Core Tightening & Hormone Balance',
    duration: '55 Mins',
    intensity: 'High',
    caloriesBurn: '460 kcal',
    badge: '08 / WOMEN',
    description: 'Empowering strength sessions tailored for female biomechanics — focusing on glutes, core tightening, upper body tone, and metabolic conditioning in a safe environment.',
    highlights: ['Dedicated Morning/Evening Batches', 'PCOS & Thyroid Fitness Support', 'Glute & Hamstring Specialization'],
  },
];

const PRICING_PLANS = [
  {
    id: '1_month',
    name: '1 MONTH BRONZE PASS',
    nameHi: '1 माह पास',
    price: '₹1,200',
    duration: 'per month',
    tagline: 'Ideal for beginners starting their journey',
    features: [
      'Full Gym & Free Weight Arena Access',
      'Cardio Deck & CrossFit Zone',
      'General Workout Routine & Orientation',
      'Locker & Shower Facility',
      'Free 4-Digit PIN Attendance Pass',
    ],
    popular: false,
    badge: 'FLEXIBLE',
  },
  {
    id: '3_months',
    name: '3 MONTHS TRANSFORMATION',
    nameHi: '3 माह ट्रांसफॉर्मेशन',
    price: '₹3,200',
    duration: 'for 3 months',
    savings: 'Save ₹400',
    tagline: 'Visible body transformation & habit building',
    features: [
      'Everything in 1 Month Pass',
      'Bi-Weekly 3D Body Index Assessments',
      'Customized Diet & Calorie Macro Guide',
      'Form Correction & Spotting Assistance',
      'Access to Member Portal & Progress Chart',
    ],
    popular: false,
    badge: 'POPULAR',
  },
  {
    id: '6_months',
    name: '6 MONTHS GOLD CHAMPION',
    nameHi: '6 माह गोल्ड प्लान',
    price: '₹5,800',
    duration: 'for 6 months',
    savings: 'Save ₹1,400',
    tagline: 'Our most sought-after transformation package',
    features: [
      'Everything in 3 Months Plan',
      'Personalized Advanced Workout Splits',
      'Monthly Body Composition Scans',
      'Nutrition & Supplement Guidance',
      'Priority Locker & Free Steam Bath Pass',
      'Kaushik Gym Official Workout Shaker',
    ],
    popular: true,
    badge: 'MOST POPULAR',
  },
  {
    id: '12_months',
    name: '12 MONTHS PLATINUM ELITE',
    nameHi: '12 माह प्लेटिनम (वार्षिक)',
    price: '₹10,500',
    duration: 'for 1 full year',
    savings: 'Save ₹3,900',
    tagline: 'Unbeatable value for committed fitness athletes',
    features: [
      'Full 365-Day VIP Gym Floor Access',
      '2 Free 1-on-1 Personal Training Sessions',
      'Complete Personalized Diet & Meal Plans',
      'Free Gym Kit (Gym Bag + Shaker + T-shirt)',
      'Freeze Membership for up to 30 days',
      'Complimentary Guest Passes (2/month)',
    ],
    popular: false,
    badge: 'BEST VALUE',
  },
];

const TRAINERS = [
  {
    name: 'Vikram Sahu',
    role: 'Head Coach & IFBB Athlete',
    experience: '8+ Years Exp',
    specialty: 'Hypertrophy, Powerlifting & Biomechanics',
    phone: '9876543210',
    whatsappMessage: 'Hello Vikram Sir, I want to inquire about Personal Training at Kaushik Fitness Kanker.',
    avatarBg: 'from-[#EF233C] to-[#8D99AE]/20',
    stats: '150+ Athletes Transformed',
    certifications: 'ISSA Certified • CPR/AED • State Powerlifting Champion',
  },
  {
    name: 'Vaibhav Kaushik',
    role: 'Founder & Head of Conditioning',
    experience: '10+ Years Exp',
    specialty: 'Fat Loss, Metabolic Conditioning & Nutrition',
    phone: '9826189001',
    whatsappMessage: 'Hello Vaibhav Sir, I want to inquire about joining Kaushik Fitness Kanker.',
    avatarBg: 'from-[#D90429] to-[#2B2D42]',
    stats: '500+ Active Members',
    certifications: 'Gold Medalist Conditioning Coach • Sports Nutritionist',
  },
  {
    name: 'Priya Verma',
    role: 'Master Trainer & Women Specialist',
    experience: '6+ Years Exp',
    specialty: 'Functional Fitness, Yoga & Women Hypertrophy',
    phone: '9876543210',
    whatsappMessage: 'Hello Priya Maam, I want to inquire about Women Fitness batches at Kaushik Fitness Kanker.',
    avatarBg: 'from-[#EF233C]/80 to-[#11131C]',
    stats: '120+ Women Transformed',
    certifications: 'ACE Certified Personal Trainer • Advanced Yoga Practitioner',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    age: 26,
    profession: 'Software Engineer',
    achievement: '-14 KG FAT LOSS IN 90 DAYS',
    text: 'Before joining Kaushik Fitness, I struggled with low energy and excess weight due to long desk hours. Vikram Sir created a custom split and diet plan that fit my busy schedule. The 3D tracking showed exact fat reduction every month!',
    stats: { before: '88 kg', after: '74 kg', duration: '3 Months' },
    stars: 5,
  },
  {
    name: 'Amit Dewangan',
    age: 23,
    profession: 'College Student',
    achievement: '+12 KG LEAN MUSCLE & PR BENCH 110KG',
    text: 'Best gym in Kanker without a doubt! Olympic standard barbells, bumper plates, and a real motivating lifting culture. The coaches ensure your form is 100% correct before adding weight. My deadlift hit 170kg last week!',
    stats: { before: '62 kg', after: '74 kg', duration: '6 Months' },
    stars: 5,
  },
  {
    name: 'Sneha Jain',
    age: 29,
    profession: 'School Teacher',
    achievement: 'PCOS REVERSED & +40% STAMINA',
    text: 'The women training environment here is respectful, safe, and immensely encouraging. Coach Priya helped me manage PCOS through strength training and wholesome Indian food. I have never felt this confident and energetic!',
    stats: { before: '72 kg', after: '61 kg', duration: '5 Months' },
    stars: 5,
  },
];

export const ClemusHomePage: React.FC<ClemusHomePageProps> = ({
  onNavigateToPortal,
  onOpenEnquiry,
  onOpenLogin,
  onOpenPinKiosk,
}) => {
  const [selectedClassCategory, setSelectedClassCategory] = useState<string>('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Interactive BMI Calculator
  const [calcHeight, setCalcHeight] = useState<string>('172');
  const [calcWeight, setCalcWeight] = useState<string>('72');
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(24.3);

  const handleCalculateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(calcHeight);
    const w = parseFloat(calcWeight);
    if (h > 50 && w > 20) {
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);
      setCalculatedBmi(Math.round(bmi * 10) / 10);
    }
  };

  const filteredClasses = selectedClassCategory === 'all'
    ? CLASSES_DATA
    : CLASSES_DATA.filter((c) => c.category === selectedClassCategory);

  return (
    <div className="bg-[#0F111A] text-[#EDF2F4] min-h-screen font-sans selection:bg-[#EF233C] selection:text-white">

      {/* 1. TOP ANNOUNCEMENT BAR (Clemus Crimson Banner) */}
      <div className="bg-[#EF233C] text-white py-2 px-4 text-center text-xs font-exo font-black tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-white" />
        <span>LIMITED ADMISSIONS OPEN: GET 3-DAY FREE VIP TRIAL PASS IN KANKER</span>
        <button
          onClick={() => onOpenEnquiry()}
          className="ml-2 underline font-extrabold hover:text-black transition-colors"
        >
          CLAIM PASS →
        </button>
      </div>

      {/* Main Website Navigation Bar (Clemus Header Style) */}
      <header className="sticky top-0 z-50 bg-[#0F111A]/95 backdrop-blur-xl border-b border-[#2B2F48] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Clemus Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EF233C] flex items-center justify-center text-white font-exo font-black text-2xl shadow-lg shadow-[#EF233C]/30 hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-exo font-black text-xl sm:text-2xl tracking-tight text-white uppercase">
                  KAUSHIK <span className="text-[#EF233C]">FITNESS</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-exo font-black uppercase tracking-wider bg-[#2B2D42] text-[#EDF2F4]">
                  KANKER
                </span>
              </div>
              <p className="text-[10px] text-[#8D99AE] font-mono tracking-wide">
                ESTD. KANKER, CG • SINCE 2020
              </p>
            </div>
          </div>

          {/* Center Links (Clemus Nav) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-exo font-bold uppercase tracking-wider text-[#8D99AE]">
            <a href="#hero" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#classes" className="hover:text-white transition-colors">Classes</a>
            <a href="#hero" className="text-[#EF233C] hover:text-[#D90429] flex items-center gap-1 transition-colors">
              <Flame className="w-3.5 h-3.5 fill-[#EF233C]" />
              3D Athlete
            </a>
            <a href="#anatomy-lab" className="hover:text-white transition-colors">Anatomy Lab</a>
            <a href="#trainers" className="hover:text-white transition-colors">Trainers</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenPinKiosk}
              title="Attendance PIN Kiosk"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#8D99AE] hover:border-[#EF233C] hover:text-white text-xs font-exo font-bold transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#EF233C]" />
              <span>PIN Kiosk</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] hover:border-[#8D99AE] text-[#EDF2F4] text-xs font-exo font-bold transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-[#EF233C]" />
              <span>Sign In</span>
            </button>

            {/* Clemus Red Pill Button */}
            <button
              onClick={() => onNavigateToPortal('dashboard')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#EF233C]/30"
            >
              <span>Gym Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH AUTHENTIC CLEMUS TYPOGRAPHY & REAL 3D HUMAN ATHLETE */}
      <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#0F111A] via-[#141824] to-[#0F111A]">
        
        {/* Subtle Clemus Crimson Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EF233C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#2B2D42]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Clemus Typography */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Since 2020 Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#EF233C] animate-ping" />
              <span>SINCE 2020 • KANKER CHHATTISGARH</span>
            </div>

            {/* Clemus Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-exo font-black uppercase tracking-tight text-white leading-[1.05]">
                TRAIN INSANE OR <br />
                <span className="text-[#EF233C]">REMAIN THE SAME!</span>
                <br />
                <span className="text-slate-100">START TODAY!</span>
              </h1>
              <div className="w-20 h-1 bg-[#EF233C] rounded-full" />
            </div>

            {/* Paragraph */}
            <p className="text-[#8D99AE] text-sm sm:text-base leading-relaxed max-w-xl">
              Kanker's premier high-performance strength and physique transformation facility. Certified IFBB master trainers, Olympic free weights, bio-mechanical equipment, and live 3D athletic movement tracking.
            </p>

            {/* Clemus CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenEnquiry()}
                className="px-8 py-4 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#EF233C]/30 flex items-center gap-2"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Get 3-Day Free Pass</span>
              </button>

              <a
                href="#classes"
                className="px-8 py-4 rounded-full bg-transparent border-2 border-[#EDF2F4]/40 hover:border-[#EF233C] text-[#EDF2F4] hover:text-white font-exo font-bold text-sm uppercase tracking-wider transition-all"
              >
                Explore Classes
              </a>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="px-5 py-4 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EDF2F4] hover:text-white font-exo font-bold text-sm transition-all flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-[#EF233C]/20 text-[#EF233C] flex items-center justify-center">
                  <Play className="w-3 h-3 fill-[#EF233C]" />
                </div>
                <span>Watch Tour</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-[#2B2F48] flex flex-wrap items-center gap-6 text-xs text-[#8D99AE]">
              <div className="flex items-center gap-2">
                <div className="flex text-[#EF233C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#EF233C]" />
                  ))}
                </div>
                <span className="font-bold text-white font-mono">4.9 / 5</span>
                <span>(500+ Athletes)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#EF233C]" />
                <span>Certified IFBB & NSCA</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#EF233C]" />
                <span>100% Guaranteed Transformation</span>
              </div>
            </div>

          </div>

          {/* Right Column: REAL 3D HUMAN ATHLETE WITH LIVE WORKOUT KINEMATICS */}
          <div className="lg:col-span-6 relative">
            <HumanAthlete3DCanvas />
          </div>

        </div>
      </section>

      {/* 3. CLEMUS 4-COLUMN FEATURE HIGHLIGHTS */}
      <section className="py-14 px-4 sm:px-8 border-y border-[#2B2F48] bg-[#11131C]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="group p-6 rounded-2xl bg-[#1A1D2E]/80 border border-[#2B2F48] hover:border-[#EF233C]/60 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF233C]/10 border border-[#EF233C]/30 flex items-center justify-center text-[#EF233C]">
                <Users className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#8D99AE] group-hover:text-[#EF233C] transition-colors">
                [ 01 ]
              </span>
            </div>
            <h3 className="text-lg font-exo font-black uppercase text-white mb-1">PERSONAL TRAINER</h3>
            <p className="text-xs text-[#EF233C] font-semibold mb-2">व्यक्तिगत ट्रेनर व कोच</p>
            <p className="text-xs text-[#8D99AE] leading-relaxed">
              Certified IFBB & NSCA fitness experts dedicated to correcting your form, optimizing repetitions, and keeping you accountable daily.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-[#1A1D2E]/80 border border-[#2B2F48] hover:border-[#EF233C]/60 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF233C]/10 border border-[#EF233C]/30 flex items-center justify-center text-[#EF233C]">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#8D99AE] group-hover:text-[#EF233C] transition-colors">
                [ 02 ]
              </span>
            </div>
            <h3 className="text-lg font-exo font-black uppercase text-white mb-1">LATEST EQUIPMENT</h3>
            <p className="text-xs text-[#EF233C] font-semibold mb-2">आधुनिक बायो-मैकेनिकल मशीनें</p>
            <p className="text-xs text-[#8D99AE] leading-relaxed">
              5,000 sq.ft. fully air-conditioned floor loaded with Olympic calibrated barbells, squat racks, cable crossover towers, and dumbells up to 50kg.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-[#1A1D2E]/80 border border-[#2B2F48] hover:border-[#EF233C]/60 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF233C]/10 border border-[#EF233C]/30 flex items-center justify-center text-[#EF233C]">
                <Flame className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#8D99AE] group-hover:text-[#EF233C] transition-colors">
                [ 03 ]
              </span>
            </div>
            <h3 className="text-lg font-exo font-black uppercase text-white mb-1">DIET & NUTRITION</h3>
            <p className="text-xs text-[#EF233C] font-semibold mb-2">कस्टम आहार व पोषण योजना</p>
            <p className="text-xs text-[#8D99AE] leading-relaxed">
              No crash diets. High-protein meal schedules tailored for Indian vegetarian and non-vegetarian palates to fuel recovery and lean gains.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-[#1A1D2E]/80 border border-[#2B2F48] hover:border-[#EF233C]/60 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF233C]/10 border border-[#EF233C]/30 flex items-center justify-center text-[#EF233C]">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#8D99AE] group-hover:text-[#EF233C] transition-colors">
                [ 04 ]
              </span>
            </div>
            <h3 className="text-lg font-exo font-black uppercase text-white mb-1">3D BODY TRACKING</h3>
            <p className="text-xs text-[#EF233C] font-semibold mb-2">3D बॉडी इंडेक्स व बदलाव</p>
            <p className="text-xs text-[#8D99AE] leading-relaxed">
              Track muscle gain, body fat percentage drop, and circumference changes visually via our proprietary smart digital fitness system.
            </p>
          </div>

        </div>
      </section>

      {/* 4. CLEMUS MILESTONES & LIVE COUNTERS (Clemus Charcoal & Crimson) */}
      <section className="py-12 px-4 sm:px-8 bg-[#2B2D42] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          <div className="pt-4 md:pt-0">
            <div className="text-4xl sm:text-5xl font-exo font-black tracking-tight text-[#EF233C]">+850K+</div>
            <p className="text-xs font-exo font-black uppercase tracking-widest mt-1 text-white">Burned Calories</p>
            <p className="text-[11px] text-[#8D99AE]">सदस्यों द्वारा बर्न कैलोरी</p>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-4xl sm:text-5xl font-exo font-black tracking-tight text-[#EF233C]">+250K+</div>
            <p className="text-xs font-exo font-black uppercase tracking-widest mt-1 text-white">Weights Lifted (KG)</p>
            <p className="text-[11px] text-[#8D99AE]">कुल लिफ्टेड वजन</p>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-4xl sm:text-5xl font-exo font-black tracking-tight text-[#EF233C]">+1,200+</div>
            <p className="text-xs font-exo font-black uppercase tracking-widest mt-1 text-white">Happy Clients</p>
            <p className="text-[11px] text-[#8D99AE]">सफल फिटनेस परिणाम</p>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-4xl sm:text-5xl font-exo font-black tracking-tight text-[#EF233C]">99.2%</div>
            <p className="text-xs font-exo font-black uppercase tracking-widest mt-1 text-white">Success Rate</p>
            <p className="text-[11px] text-[#8D99AE]">संतुष्ट सदस्य दर</p>
          </div>

        </div>
      </section>

      {/* 5. ABOUT SECTION & FACILITY TOUR PREVIEW */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#2B2F48] bg-[#11131C] shadow-2xl group">
              <div className="h-96 w-full bg-gradient-to-br from-[#1A1D2E] via-[#11131C] to-[#2B2D42]/40 flex flex-col items-center justify-center p-8 text-center relative">
                <div className="w-20 h-20 rounded-full bg-[#EF233C]/20 border-2 border-[#EF233C] flex items-center justify-center text-[#EF233C] mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-[#EF233C]/30">
                  <Dumbbell className="w-10 h-10" />
                </div>

                <span className="px-4 py-1 rounded-full bg-[#EF233C] text-white text-xs font-exo font-black uppercase tracking-widest mb-2">
                  5,000 SQ.FT. ARENA
                </span>
                
                <h4 className="text-xl font-exo font-black uppercase text-white tracking-wide">
                  KAUSHIK FITNESS FACILITY
                </h4>
                <p className="text-xs text-[#8D99AE] mt-2 max-w-xs">
                  Near Collectorate Chowk / Bus Stand Road, Kanker, Chhattisgarh
                </p>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="mt-6 px-6 py-3 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#EF233C]/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Click to Watch Facility Tour</span>
                </button>
              </div>

              <div className="p-3 bg-[#11131C] border-t border-[#2B2F48] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#8D99AE]">
                  <Clock className="w-4 h-4 text-[#EF233C]" />
                  <span>5:30 AM – 10:30 AM & 4:30 PM – 9:30 PM</span>
                </div>
                <span className="text-[#EF233C] font-bold">Open Mon-Sun</span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider">
              <span>About Us • Since 2020</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight leading-tight">
              SUCCESS USUALLY COMES TO <br />
              <span className="text-[#EF233C]">THOSE WHO ARE TOO BUSY</span> <br />
              TO BE LOOKING FOR IT.
            </h2>

            <div className="w-16 h-1 bg-[#EF233C] rounded-full" />

            <p className="text-[#8D99AE] text-sm sm:text-base leading-relaxed">
              Founded with the vision to bring international bodybuilding and fitness standards to Kanker, Kaushik Fitness is engineered for tangible results. Whether you want to shed stubborn fat, build dense muscle, or set personal lifting records, our gym provides the coaching, equipment, and community to get you there.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-semibold text-white">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1A1D2E] border border-[#2B2F48]">
                <CheckCircle2 className="w-4 h-4 text-[#EF233C] shrink-0" />
                <span>Heavy Free Weights up to 50KG Dumbbells</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1A1D2E] border border-[#2B2F48]">
                <CheckCircle2 className="w-4 h-4 text-[#EF233C] shrink-0" />
                <span>Dedicated Powerlifting Squat & Deadlift Racks</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1A1D2E] border border-[#2B2F48]">
                <CheckCircle2 className="w-4 h-4 text-[#EF233C] shrink-0" />
                <span>Aerobic Dance, Zumba & Yoga Batches</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1A1D2E] border border-[#2B2F48]">
                <CheckCircle2 className="w-4 h-4 text-[#EF233C] shrink-0" />
                <span>Modern Clean Lockers, Changing Rooms & Steam</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1D2E] border-l-4 border-[#EF233C] text-xs text-[#EDF2F4] space-y-1">
              <p className="italic">
                "हमारा लक्ष्य कांकेर के हर युवा और परिवार को एक स्वस्थ, शक्तिशाली और अनुशासित जीवन शैली देना है। मेहनत आपकी, दिशा हमारी!"
              </p>
              <div className="font-exo font-bold text-[#EF233C] uppercase pt-1">
                — Vaibhav Kaushik & Vikram Sahu (Founders)
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. POPULAR TRAINING PROGRAMS / CLASSES (CLEMUS 8-CARD GRID) */}
      <section id="classes" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#11131C] border-y border-[#2B2F48]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider mb-2">
                <span>Popular Classes</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight">
                WHETHER YOU THINK YOU CAN, OR YOU THINK YOU CAN’T, <br />
                <span className="text-[#EF233C]">YOU’RE RIGHT.</span>
              </h2>
              <p className="text-[#8D99AE] text-xs sm:text-sm mt-1">
                Choose the discipline that aligns with your athletic and physique targets.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Classes (8)' },
                { id: 'strength', label: 'Strength & Muscle' },
                { id: 'cardio', label: 'Fat Loss & Cardio' },
                { id: 'special', label: 'CrossFit & PT' },
                { id: 'wellness', label: 'Yoga & Recovery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedClassCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-exo font-bold uppercase tracking-wider transition-all ${
                    selectedClassCategory === tab.id
                      ? 'bg-[#EF233C] text-white shadow-lg shadow-[#EF233C]/30'
                      : 'bg-[#1A1D2E] border border-[#2B2F48] text-[#8D99AE] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Class Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClasses.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-[#1A1D2E] border border-[#2B2F48] hover:border-[#EF233C] p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#11131C] text-[#EF233C] font-bold border border-[#2B2F48]">
                      {item.badge}
                    </span>
                    <span className="text-[#EF233C] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-[#EF233C]" /> {item.caloriesBurn}
                    </span>
                  </div>

                  <h3 className="text-lg font-exo font-black uppercase text-white group-hover:text-[#EF233C] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8D99AE] font-medium mb-3">{item.titleHi}</p>

                  <p className="text-xs text-[#EDF2F4]/80 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 py-3 border-y border-[#2B2F48] text-[11px] text-[#8D99AE]">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs mt-3">
                  <div className="text-[#8D99AE] font-mono">
                    <span>{item.duration}</span>
                  </div>
                  <button
                    onClick={() => onOpenEnquiry()}
                    className="px-4 py-2 rounded-full bg-[#EF233C]/10 hover:bg-[#EF233C] text-[#EF233C] hover:text-white font-exo font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. DEDICATED 3D ANATOMY LAB SECTION */}
      <section id="anatomy-lab" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-[#EF233C]" />
              <span>Interactive Biomechanics WebGL Experience</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight">
              INTERACTIVE <span className="text-[#EF233C]">3D MUSCLE</span> LAB
            </h2>
            <p className="text-[#8D99AE] text-xs sm:text-sm">
              Click any muscle group to visualize targeted activation, recommended gym exercises, and calorie expenditure in 3D space.
            </p>
          </div>

          <div className="border border-[#2B2F48] rounded-3xl overflow-hidden shadow-2xl bg-[#11131C] p-2 sm:p-4">
            <Anatomy3DCanvas />
          </div>

        </div>
      </section>

      {/* 8. INTERACTIVE BMI & FITNESS CALCULATOR */}
      <section className="py-14 px-4 sm:px-8 bg-[#11131C] border-y border-[#2B2F48]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-bold uppercase tracking-wider">
              <span>Instant Health Diagnostic</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-exo font-black uppercase text-white">
              CALCULATE YOUR <span className="text-[#EF233C]">BMI & FITNESS</span> INDEX
            </h3>
            <p className="text-xs sm:text-sm text-[#8D99AE] leading-relaxed">
              Find out your current Body Mass Index (BMI) and discover what training approach matches your goals.
            </p>
            
            <form onSubmit={handleCalculateBmi} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-exo font-bold uppercase tracking-wider text-[#8D99AE] mb-1">
                    Height (CM)
                  </label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full bg-[#1A1D2E] border border-[#2B2F48] rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#EF233C] outline-none"
                    placeholder="e.g. 172"
                  />
                </div>
                <div>
                  <label className="block text-xs font-exo font-bold uppercase tracking-wider text-[#8D99AE] mb-1">
                    Weight (KG)
                  </label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full bg-[#1A1D2E] border border-[#2B2F48] rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#EF233C] outline-none"
                    placeholder="e.g. 72"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#EF233C]/20"
              >
                Calculate My Score
              </button>
            </form>
          </div>

          <div className="md:col-span-6">
            <div className="p-6 rounded-3xl bg-[#1A1D2E] border border-[#2B2F48] text-center space-y-4 shadow-xl">
              <span className="text-xs font-mono uppercase text-[#8D99AE]">Your Diagnostic Result</span>
              
              {calculatedBmi ? (
                <div>
                  <div className="text-5xl font-exo font-black font-mono text-[#EF233C]">
                    {calculatedBmi}
                  </div>
                  <div className="text-sm font-exo font-bold uppercase tracking-wider mt-1 text-white">
                    {calculatedBmi < 18.5
                      ? 'Underweight (मसल गेन और पोषण की आवश्यकता)'
                      : calculatedBmi < 25
                      ? 'Normal & Fit (शानदार स्थिति - लीन स्ट्रेंथ मेंटेन करें)'
                      : calculatedBmi < 30
                      ? 'Overweight (फैट लॉस व कार्डियो प्रोग्राम उपयुक्त)'
                      : 'High Body Fat (श्रेड व मेटाबॉलिक कंडीशनिंग की आवश्यकता)'}
                  </div>
                  <div className="mt-4 p-3 rounded-2xl bg-[#11131C] border border-[#2B2F48] text-xs text-[#EDF2F4]">
                    💡 <strong>Kaushik Coach Recommendation:</strong> Join our 3-Month Transformation program to align body fat and build functional muscle.
                  </div>
                  <button
                    onClick={() => onOpenEnquiry()}
                    className="mt-4 px-8 py-3 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#EF233C]/20"
                  >
                    Consult Head Coach Vikram →
                  </button>
                </div>
              ) : (
                <div className="text-xs text-[#8D99AE] py-8">
                  Enter height and weight to view score.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 9. SCULPTED TRAINERS SHOWCASE (CLEMUS MASTER COACHES) */}
      <section id="trainers" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider">
              <span>Sculpted Trainers</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight">
              MOTIVATION GETS YOU STARTED, <br />
              <span className="text-[#EF233C]">HABIT KEEPS YOU GOING.</span>
            </h2>
            <p className="text-[#8D99AE] text-xs sm:text-sm">
              Certified professionals dedicated to your transformation, safety, and personal athletic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRAINERS.map((t, index) => (
              <div
                key={index}
                className="rounded-3xl bg-[#1A1D2E] border border-[#2B2F48] overflow-hidden hover:border-[#EF233C] transition-all hover:-translate-y-1.5 shadow-xl group"
              >
                <div className={`h-48 bg-gradient-to-br ${t.avatarBg} flex flex-col items-center justify-center p-6 text-center relative`}>
                  <div className="w-20 h-20 rounded-full bg-black/40 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-exo font-black shadow-lg">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-[#EF233C]">
                    {t.experience}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-exo font-black uppercase text-white">{t.name}</h3>
                    <p className="text-xs text-[#EF233C] font-bold">{t.role}</p>
                    <p className="text-xs text-[#8D99AE] mt-1">{t.specialty}</p>
                  </div>

                  <div className="py-2.5 px-3 rounded-2xl bg-[#11131C] border border-[#2B2F48] text-[11px] text-[#EDF2F4] space-y-1">
                    <div>🏆 <strong>Credentials:</strong> {t.certifications}</div>
                    <div>🔥 <strong>Track Record:</strong> {t.stats}</div>
                  </div>

                  <a
                    href={`https://wa.me/91${t.phone}?text=${encodeURIComponent(t.whatsappMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-exo font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. MEMBERSHIP PRICING TABLES */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#11131C] border-y border-[#2B2F48]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider">
              <span>Membership</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight">
              TRANSPARENT <span className="text-[#EF233C]">PRICING PLANS</span>
            </h2>
            <p className="text-[#8D99AE] text-xs sm:text-sm">
              No hidden fees. Premium gym floor access with flexible duration options in Kanker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 relative ${
                  plan.popular
                    ? 'bg-[#1A1D2E] border-2 border-[#EF233C] shadow-2xl shadow-[#EF233C]/20'
                    : 'bg-[#1A1D2E]/70 border border-[#2B2F48]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#EF233C] text-white text-[10px] font-exo font-black uppercase tracking-widest shadow-md">
                    ★ MOST POPULAR ★
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#8D99AE] font-bold">{plan.badge}</span>
                    {plan.savings && (
                      <span className="text-[#EF233C] font-bold bg-[#EF233C]/10 px-2.5 py-0.5 rounded-full border border-[#EF233C]/30">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-exo font-black uppercase text-white">{plan.name}</h3>
                  <p className="text-xs text-[#8D99AE] mb-4">{plan.tagline}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-exo font-black font-mono text-white">{plan.price}</span>
                    <span className="text-xs text-[#8D99AE] ml-1.5">{plan.duration}</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-[#EDF2F4] py-4 border-t border-[#2B2F48]">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-[#EF233C]' : 'text-[#8D99AE]'}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onOpenEnquiry()}
                    className={`w-full py-3.5 rounded-full font-exo font-black text-xs uppercase tracking-wider transition-all ${
                      plan.popular
                        ? 'bg-[#EF233C] hover:bg-[#D90429] text-white shadow-lg shadow-[#EF233C]/30'
                        : 'bg-[#2B2D42] hover:bg-[#3d405b] text-white'
                    }`}
                  >
                    Select {plan.nameHi}
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Personal Training Banner */}
          <div className="p-6 rounded-3xl bg-[#1A1D2E] border border-[#EF233C]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-[#EF233C]" />
                <span className="text-xs font-exo font-black uppercase tracking-wider text-[#EF233C]">
                  EXCLUSIVE 1-ON-1 PERSONAL TRAINING
                </span>
              </div>
              <h4 className="text-xl font-exo font-black text-white">WANT A DEDICATED COACH BY YOUR SIDE?</h4>
              <p className="text-xs text-[#8D99AE] max-w-xl">
                Get individualized workouts, form correction on every set, WhatsApp dietary accountability, and accelerated fat loss / hypertrophy results at ₹3,000 / month.
              </p>
            </div>
            <button
              onClick={() => onOpenEnquiry('bodybuilding')}
              className="px-8 py-3.5 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-xs uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-[#EF233C]/25"
            >
              Inquire for Personal Training
            </button>
          </div>

        </div>
      </section>

      {/* 11. MEMBER TRANSFORMATION REVIEWS */}
      <section id="reviews" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] text-xs font-exo font-black uppercase tracking-wider">
              <span>Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-exo font-black uppercase text-white tracking-tight">
              MEMBER <span className="text-[#EF233C]">TRANSFORMATIONS</span>
            </h2>
            <p className="text-[#8D99AE] text-xs sm:text-sm">
              See what our members from Kanker achieved through consistency and coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((rev, index) => (
              <div
                key={index}
                className="rounded-3xl bg-[#1A1D2E] border border-[#2B2F48] p-6 flex flex-col justify-between hover:border-[#EF233C] transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#EF233C]">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#EF233C]" />
                    ))}
                  </div>

                  <div className="px-3 py-1 rounded-full bg-[#EF233C]/10 border border-[#EF233C]/30 text-[#EF233C] text-xs font-exo font-black uppercase w-fit">
                    {rev.achievement}
                  </div>

                  <p className="text-xs sm:text-sm text-[#EDF2F4]/80 leading-relaxed italic">
                    "{rev.text}"
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#11131C] border border-[#2B2F48] text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#8D99AE] block">BEFORE</span>
                      <span className="text-red-400 font-bold">{rev.stats.before}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8D99AE] block">AFTER</span>
                      <span className="text-[#EF233C] font-bold">{rev.stats.after}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8D99AE] block">TIME</span>
                      <span className="text-white font-bold">{rev.stats.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#2B2F48] flex items-center justify-between mt-4">
                  <div>
                    <h4 className="text-sm font-exo font-bold text-white">{rev.name}</h4>
                    <p className="text-[11px] text-[#8D99AE]">{rev.profession}, Kanker</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#EF233C] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. FACILITY TOUR VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1D2E] border border-[#2B2F48] rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#2B2F48]">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#EF233C]" />
                <h3 className="text-base font-exo font-black uppercase text-white">Kaushik Fitness Facility Tour</h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-full bg-[#11131C] text-[#8D99AE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 rounded-2xl bg-black aspect-video flex flex-col items-center justify-center text-center p-6 border border-[#2B2F48] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EF233C]/20 border-2 border-[#EF233C] flex items-center justify-center text-[#EF233C] mx-auto animate-pulse">
                  <Play className="w-8 h-8 fill-[#EF233C] ml-1" />
                </div>
                <h4 className="text-lg font-exo font-black uppercase text-white">
                  5,000 SQ.FT. ARENA • HIGH PERFORMANCE GEAR
                </h4>
                <p className="text-xs text-[#8D99AE] max-w-md mx-auto">
                  Equipped with calibrated plates, heavy dumbbells, cable stations, cardio theatre, and certified trainers in Kanker, Chhattisgarh.
                </p>
                <button
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    onOpenEnquiry();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#EF233C] hover:bg-[#D90429] text-white font-exo font-black text-xs uppercase tracking-wider transition-all"
                >
                  Book In-Person Walkthrough Visit
                </button>
              </div>
            </div>

            <div className="text-xs text-[#8D99AE] text-center">
              Visit us directly: Collectorate Chowk / Bus Stand Road, Kanker (Mon-Sat 5:30 AM - 9:30 PM)
            </div>
          </div>
        </div>
      )}

      {/* 13. CLEMUS DARK FOOTER */}
      <footer id="contact" className="bg-[#0B0D14] border-t border-[#2B2F48] text-[#8D99AE] pt-16 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            
            {/* Brand Col */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EF233C] flex items-center justify-center text-white font-exo font-black shadow-lg shadow-[#EF233C]/20">
                  C
                </div>
                <span className="font-exo font-black text-xl tracking-wider text-white uppercase">
                  KAUSHIK <span className="text-[#EF233C]">FITNESS</span>
                </span>
              </div>
              <p className="text-xs text-[#8D99AE] leading-relaxed">
                Kanker's ultimate fitness community. Dedicated to helping you shatter personal limits through scientific training, bio-mechanical equipment, and proper nutritional protocols.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => onNavigateToPortal('dashboard')}
                  className="px-4 py-2 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-white hover:border-[#EF233C] font-exo font-bold"
                >
                  Member & Staff Login
                </button>
                <button
                  onClick={onOpenPinKiosk}
                  className="px-4 py-2 rounded-full bg-[#1A1D2E] border border-[#2B2F48] text-[#EF233C] hover:text-white font-exo font-bold"
                >
                  PIN Attendance Pass
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-exo font-black uppercase tracking-wider text-white">Programs</h4>
              <ul className="space-y-2 text-xs font-exo">
                <li><a href="#classes" className="hover:text-[#EF233C] transition-colors">Hypertrophy</a></li>
                <li><a href="#classes" className="hover:text-[#EF233C] transition-colors">CrossFit & HIIT</a></li>
                <li><a href="#classes" className="hover:text-[#EF233C] transition-colors">Powerlifting</a></li>
                <li><a href="#classes" className="hover:text-[#EF233C] transition-colors">1-on-1 Personal Training</a></li>
                <li><a href="#classes" className="hover:text-[#EF233C] transition-colors">Women's Fitness Batches</a></li>
              </ul>
            </div>

            {/* Quick Links 2 */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-exo font-black uppercase tracking-wider text-white">Quick Portal</h4>
              <ul className="space-y-2 text-xs font-exo">
                <li>
                  <button onClick={() => onNavigateToPortal('dashboard')} className="hover:text-[#EF233C] transition-colors">
                    Admin / Staff Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateToPortal('body_index')} className="hover:text-[#EF233C] transition-colors">
                    Body Index Tracker
                  </button>
                </li>
                <li>
                  <button onClick={onOpenPinKiosk} className="hover:text-[#EF233C] transition-colors">
                    4-Digit PIN Pass
                  </button>
                </li>
                <li>
                  <a href="#anatomy-lab" className="hover:text-[#EF233C] transition-colors">
                    3D Anatomy Explorer
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#EF233C] transition-colors">
                    Fees & Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Location & Hours */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-exo font-black uppercase tracking-wider text-white">Visit The Gym</h4>
              <div className="space-y-2 text-xs text-[#EDF2F4]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#EF233C] shrink-0 mt-0.5" />
                  <span>Main Road, Near Bus Stand & Collectorate Chowk, Kanker, Chhattisgarh — 494334</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#EF233C] shrink-0" />
                  <span>Morning: 5:30 AM – 10:30 AM | Evening: 4:30 PM – 9:30 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#EF233C] shrink-0" />
                  <span>+91 98765 43210 / +91 94252 XXXXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#EF233C] shrink-0" />
                  <span>kaushikfitnesskanker@gmail.com</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-[#1C2033] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8D99AE]">
            <div>
              © {new Date().getFullYear()} Kaushik Fitness Kanker. Clemus High-Performance Theme.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span className="text-[#EF233C] font-mono">Original 3D Human Kinetic Engine</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
