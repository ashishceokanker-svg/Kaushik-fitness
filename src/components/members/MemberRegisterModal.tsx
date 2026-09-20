import React, { useState, useEffect } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Gender, FitnessGoal, MembershipDuration, PTPackageDuration, PaymentMethod, Member } from '../../types';
import { MEMBERSHIP_PRICING, PT_PRICING, formatINR, calculateExpiryDate } from '../../utils/formatters';
import { X, UserPlus, Sparkles, Dumbbell, ShieldCheck, Tag, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemberRegisterModalProps {
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
}

export const MemberRegisterModal: React.FC<MemberRegisterModalProps> = ({ onClose, onSuccess }) => {
  const { staff, addMember } = useGymData();
  const trainers = staff.filter((s) => s.staffType === 'instructor' && s.status === 'active');

  // Form states
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(75);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('muscle_building');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [workoutSlot, setWorkoutSlot] = useState<string>('06:00 AM - 07:00 AM');
  const [pin, setPin] = useState<string>(() => String(Math.floor(1000 + Math.random() * 9000)));

  const handleGeneratePin = () => {
    setPin(String(Math.floor(1000 + Math.random() * 9000)));
  };

  // Membership & PT
  const [duration, setDuration] = useState<MembershipDuration>('3_months');
  const [hasPT, setHasPT] = useState<boolean>(false);
  const [ptDuration, setPtDuration] = useState<PTPackageDuration>('3_months');
  const [assignedTrainerId, setAssignedTrainerId] = useState<string>(trainers[0]?.id || '');

  // Financials & Discounts
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'due'>('full');
  const [customPaidAmount, setCustomPaidAmount] = useState<number>(0);

  // Calculations
  const baseFee = MEMBERSHIP_PRICING[duration].price;
  const ptFee = hasPT ? PT_PRICING[ptDuration].price : 0;
  const subtotal = baseFee + ptFee;

  const calculatedDiscount =
    discountType === 'percentage'
      ? Math.round((subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);

  const totalPayable = Math.max(0, subtotal - calculatedDiscount);

  const paidAmount =
    paymentType === 'full'
      ? totalPayable
      : paymentType === 'due'
      ? 0
      : Math.min(totalPayable, customPaidAmount);

  const dueAmount = Math.max(0, totalPayable - paidAmount);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('फ़ोटो का आकार 3MB से कम होना चाहिए।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const joiningDate = new Date().toISOString().split('T')[0];
    const expiryDate = calculateExpiryDate(joiningDate, duration);
    const assignedTrainer = trainers.find((t) => t.id === assignedTrainerId);

    const newMember = addMember({
      name,
      phone,
      email: email || `${phone}@kaushikfitness.com`,
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      emergencyContact,
      joiningDate,
      membershipDuration: duration,
      expiryDate,
      personalTraining: hasPT,
      ptDuration: hasPT ? ptDuration : undefined,
      assignedTrainerId: hasPT ? assignedTrainerId : undefined,
      assignedTrainerName: hasPT ? assignedTrainer?.name : undefined,
      baseFee,
      ptFee,
      discountType,
      discountValue,
      totalPayable,
      paidAmount,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due',
      paymentMethod,
      lastPaymentDate: paidAmount > 0 ? joiningDate : '',
      fitnessGoal,
      activityLevel: 'moderate',
      medicalConditions,
      workoutSlot,
      active: true,
      avatarUrl,
      pin: pin.trim().length === 4 ? pin.trim() : undefined,
    });

    // Fire Confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }

    onSuccess(newMember);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-14 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto sm:my-0 text-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                नया सदस्य पंजीकरण (New Member Registration)
              </h3>
              <p className="text-xs text-slate-500">
                कौशिक फिटनेस कांकेर - एडमिशन फॉर्म, पैकेज व फीस विवरण
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 shadow-xs transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>बंद करें</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Upload Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-cyan-50/70 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Member Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-7 h-7 mb-1 text-slate-400" />
                  <span className="text-[10px] font-bold">फ़ोटो</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  सदस्य का फ़ोटो (Member Profile Photo)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  वैकल्पिक (Optional)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                फ़ोटो अपलोड करें जो लॉगिन करने पर डैशबोर्ड, आईडी कार्ड व मोबाइल ऐप में दिखाई देगी।
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>{avatarUrl ? 'फ़ोटो बदलें (Change)' : 'फ़ोटो चुनें / खींचें (Upload Photo)'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl(undefined);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer transition-all"
                  >
                    हटाएं
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200 inline-block">
              1. सदस्य की व्यक्तिगत जानकारी (Personal Information)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल शर्मा"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">मोबाइल नंबर (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 98261XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ईमेल पता (Email)</label>
                <input
                  type="email"
                  placeholder="उदा. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">उम्र (Age)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">लिंग (Gender)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PIN Generation & Customization Box */}
            <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div>
                  <label className="block text-xs font-bold text-amber-950">
                    सदस्य ऐप लॉगिन व अटेंडेंस 4-अंक पिन (Member Security PIN) *
                  </label>
                  <p className="text-[11px] text-amber-800">
                    सदस्य मोबाइल ऐप लॉगिन और जिम अटेंडेंस के लिए इसी 4-अंक पिन का उपयोग करेंगे।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  नया पिन बनाएं
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="उदा. 7784"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(val);
                  }}
                  className="w-32 bg-white border-2 border-amber-500/60 rounded-xl px-3 py-1.5 text-center text-lg font-mono font-black text-amber-950 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600 shadow-inner"
                />
                <div className="text-xs">
                  {pin.length === 4 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      ✓ 4 अंकों का पिन मान्य है
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      ⚠️ कृपया 4 अंकों का पिन दर्ज करें ({pin.length}/4)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ऊंचाई (Height cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">वर्तमान वजन (Wt kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">लक्ष्य वजन (Target kg)</label>
                <input
                  type="number"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">फिटनेस लक्ष्य</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="muscle_building">मसल गेन (Muscle Build)</option>
                  <option value="weight_loss">फैट लॉस (Weight Loss)</option>
                  <option value="lean_bulk">लीन बल्क (Lean Bulk)</option>
                  <option value="general_fitness">सामान्य फिटनेस (Fitness)</option>
                  <option value="endurance">स्टैमिना (Endurance)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">आपातकालीन संपर्क (Emergency Contact)</label>
                <input
                  type="text"
                  placeholder="उदा. 9826199999 (पिताजी)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">चिकित्सा स्थिति / चोट (Medical Info)</label>
                <input
                  type="text"
                  placeholder="उदा. कोई नहीं / कमर दर्द"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* 1-Hour Schedule Slot: Morning 5-10 AM, Evening 4-10 PM */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                वर्कआउट समय / 1 घंटा शेड्यूल बैच (Gym Workout Slot) *
              </label>
              <select
                value={workoutSlot}
                onChange={(e) => setWorkoutSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
              >
                <optgroup label="🌅 सुबह का समय (Morning Slots: 5:00 AM - 10:00 AM)">
                  <option value="05:00 AM - 06:00 AM">05:00 AM - 06:00 AM (सुबह 5 से 6)</option>
                  <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM (सुबह 6 से 7)</option>
                  <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM (सुबह 7 से 8)</option>
                  <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (सुबह 8 से 9)</option>
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (सुबह 9 से 10)</option>
                </optgroup>
                <optgroup label="🌆 शाम का समय (Evening Slots: 4:00 PM - 10:00 PM)">
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (शाम 4 से 5)</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM (शाम 5 से 6)</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM (शाम 6 से 7)</option>
                  <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM (शाम 7 से 8)</option>
                  <option value="08:00 PM - 09:00 PM">08:00 PM - 09:00 PM (शाम 8 से 9)</option>
                  <option value="09:00 PM - 10:00 PM">09:00 PM - 10:00 PM (शाम 9 से 10)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Step 2: Membership Duration Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
              2. सदस्यता पैकेज अवधि (Membership Duration Plan)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(MEMBERSHIP_PRICING) as MembershipDuration[]).map((key) => {
                const plan = MEMBERSHIP_PRICING[key];
                const isSelected = duration === key;
                return (
                  <div
                    key={key}
                    onClick={() => setDuration(key)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center relative ${
                      isSelected
                        ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{plan.badge}</span>
                    <div className="font-bold text-sm text-slate-900 mt-1">{plan.label}</div>
                    <div className="text-base font-black text-amber-700 font-mono mt-1">{formatINR(plan.price)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Personal Training (PT) Add-on */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200 inline-block">
                3. पर्सनल ट्रेनिंग (PT Coach Add-on)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPT}
                  onChange={(e) => setHasPT(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {hasPT ? 'PT कोच शामिल है' : 'PT शामिल नहीं'}
                </span>
              </label>
            </div>

            {hasPT && (
              <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PT पैकेज अवधि</label>
                    <select
                      value={ptDuration}
                      onChange={(e) => setPtDuration(e.target.value as PTPackageDuration)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {Object.entries(PT_PRICING)
                        .filter(([k]) => k !== 'none')
                        .map(([k, pkg]) => (
                          <option key={k} value={k}>
                            {pkg.label} ({formatINR(pkg.price)})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">असाइन ट्रेनर / कोच (Assign Trainer)</label>
                    <select
                      value={assignedTrainerId}
                      onChange={(e) => setAssignedTrainerId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Fees, Discounts & Payment */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
              4. फीस, छूट व भुगतान विवरण (Financials & Payment)
            </span>

            {/* Discount Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">छूट का प्रकार (Discount Type)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      discountType === 'flat' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Flat (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      discountType === 'percentage' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  छूट राशि {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान का तरीका (Payment Mode)</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">नकद काउंटर (Cash)</option>
                  <option value="card">डेबिट / क्रेडिट कार्ड</option>
                  <option value="netbanking">नेट बैंकिंग</option>
                </select>
              </div>
            </div>

            {/* Payment Status Option */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान स्थिति (Payment Status)</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="full">पूर्ण भुगतान (Paid in Full)</option>
                  <option value="partial">आंशिक भुगतान (Partial Payment)</option>
                  <option value="due">पूर्ण बकाया (Pay Later / Due)</option>
                </select>
              </div>

              {paymentType === 'partial' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">आज जमा राशि (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={totalPayable}
                    value={customPaidAmount}
                    onChange={(e) => setCustomPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Total Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>बेस सदस्यता ({MEMBERSHIP_PRICING[duration].label}):</span>
                <span className="font-mono font-bold text-slate-800">{formatINR(baseFee)}</span>
              </div>
              {hasPT && (
                <div className="flex justify-between text-cyan-800 font-semibold">
                  <span>पर्सनल ट्रेनिंग ({PT_PRICING[ptDuration].label}):</span>
                  <span className="font-mono">{formatINR(ptFee)}</span>
                </div>
              )}
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>छूट ({discountType === 'percentage' ? `${discountValue}% Discount` : 'Flat Discount'}):</span>
                  <span className="font-mono">- {formatINR(calculatedDiscount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>कुल देय शुल्क (Total Payable):</span>
                <span className="font-mono text-base text-amber-700">{formatINR(totalPayable)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-700">
                <span>आज जमा राशि (Paid Today):</span>
                <span className="font-mono">{formatINR(paidAmount)}</span>
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>शेष बकाया (Remaining Due):</span>
                  <span className="font-mono">{formatINR(dueAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>पंजीकरण पूर्ण करें व रसीद बनाएं</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
