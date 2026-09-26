import React, { useState, useEffect, useRef } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { Gender, FitnessGoal, Member } from '../../types';
import {
  X,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Camera,
  Upload,
  KeyRound,
  User,
  Phone,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  Scale,
  Ruler,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface MemberSelfRegisterModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const MemberSelfRegisterModal: React.FC<MemberSelfRegisterModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { addMember } = useGymData();
  const { loginWithCredentials } = useAuth();

  // Form states
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState<string>(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(68);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('muscle_building');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [workoutSlot, setWorkoutSlot] = useState<string>('06:00 AM - 07:00 AM');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGeneratePin = () => {
    setPin(String(Math.floor(1000 + Math.random() * 9000)));
  };

  // Escape key to close
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 720,
        maxHeight: 720,
        quality: 0.75,
      });
      setAvatarUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम दर्ज करें (Please enter your name)');
      return;
    }
    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMsg('कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit mobile number)');
      return;
    }
    if (!pin || pin.trim().length !== 4) {
      setErrorMsg('कृपया अपना 4-अंकीय सुरक्षा पिन सेट करें (Please enter a 4-digit PIN)');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const joiningDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const cleanPin = pin.trim();

      // 1. Add member to database
      addMember({
        name: name.trim(),
        phone: phone.trim(),
        email: `${phone.trim()}@kaushikfitness.com`,
        age,
        gender,
        heightCm: Number(heightCm) || 172,
        weightKg: Number(weightKg) || 70,
        targetWeightKg: Number(targetWeightKg) || 68,
        bmi: Number((Number(weightKg) / Math.pow((Number(heightCm) || 172) / 100, 2)).toFixed(1)),
        emergencyContact: emergencyContact.trim(),
        joiningDate,
        membershipDuration: '1_month',
        expiryDate,
        personalTraining: false,
        baseFee: 1200,
        ptFee: 0,
        discountType: 'flat',
        discountValue: 0,
        totalPayable: 1200,
        paidAmount: 1200,
        dueAmount: 0,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        lastPaymentDate: joiningDate,
        fitnessGoal,
        activityLevel: 'moderate',
        workoutSlot,
        active: true,
        avatarUrl,
        pin: cleanPin,
      });

      // 2. Fire Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {}

      // 3. Automatically log in using the newly created PIN!
      await loginWithCredentials(cleanPin);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg('पंजीकरण में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 pb-14 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-0 text-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-b border-amber-600/20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-950 text-base leading-tight">
                  नया सदस्य सेल्फ रजिस्ट्रेशन (Self-Registration)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono font-black text-[11px] shadow-2xs">
                  PIN: 1111
                </span>
              </div>
              <p className="text-xs text-slate-900/80 font-medium mt-0.5">
                कौशिक फिटनेस कांकेर - अपना विवरण भरें व खुद का 4-अंकीय पिन बनाएं
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>बंद करें</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
              <span>❌</span>
              <span>{errorMsg}</span>
            </div>
          )}

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
                  सदस्य फ़ोटो (Member Photo)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  वैकल्पिक (Optional)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                अपनी फोटो जोड़ें जो आपके मेंबर डैशबोर्ड व पास में दिखाई देगी।
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>कैमरा से फोटो खींचें</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>गैलरी से चुनें</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(undefined)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer transition-all"
                  >
                    हटाएं
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Essential Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पूरा नाम (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल शर्मा"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मोबाइल नंबर (WhatsApp Mobile Number) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="उदा. 98261XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          {/* High-Visibility Custom Personal PIN Section */}
          <div className="p-4 bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-transparent border-2 border-amber-400 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wide">
                  🔑 अपना 4-अंकीय व्यक्तिगत सुरक्षा पिन चुनें (Your 4-Digit PIN) *
                </label>
                <p className="text-[11px] text-amber-900 font-medium">
                  भविष्य में जिम लॉगिन और अटेंडेंस हेतु आप इसी 4-अंकीय पिन का इस्तेमाल करेंगे:
                </p>
              </div>
              <button
                type="button"
                onClick={handleGeneratePin}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>नया पिन बनाएं</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <KeyRound className="w-5 h-5 text-amber-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="4 अंक"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-36 bg-white border-2 border-amber-500 rounded-2xl pl-10 pr-3 py-2 text-center text-xl font-mono font-black text-amber-950 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>

              <div className="text-xs">
                {pin.length === 4 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>पिन सुरक्षित है (PIN Ready)</span>
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">
                    ⚠️ 4 अंकों का पिन दर्ज करें ({pin.length}/4)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Physical Measurements: Height, Current Weight, Target Weight */}
          <div className="p-4 bg-gradient-to-r from-amber-50/60 via-slate-50 to-cyan-50/60 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                शारीरिक माप (Physical Profile: Height & Weight)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Height cm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ऊंचाई (Height cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cm</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                  ~{((heightCm || 172) / 30.48).toFixed(1)} Feet
                </span>
              </div>

              {/* Current Weight kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  वर्तमान वजन (Wt kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">kg</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                  वर्तमान शरीर वजन
                </span>
              </div>

              {/* Target Weight kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  लक्ष्य वजन (Target kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    required
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">kg</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                  {Math.abs(weightKg - targetWeightKg).toFixed(1)} kg {weightKg > targetWeightKg ? 'कमी (Loss)' : 'बढ़ोतरी (Gain)'}
                </span>
              </div>
            </div>
          </div>

          {/* Fitness Goal & Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                फिटनेस लक्ष्य (Fitness Goal)
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="muscle_building">मसल गेन (Muscle Build)</option>
                <option value="weight_loss">फैट लॉस (Weight Loss)</option>
                <option value="lean_bulk">लीन बल्क (Lean Bulk)</option>
                <option value="general_fitness">सामान्य फिटनेस (Fitness)</option>
                <option value="endurance">स्टैमिना (Endurance)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                लिंग (Gender)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="male">पुरुष (Male)</option>
                <option value="female">महिला (Female)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                उम्र (Age)
              </label>
              <input
                type="number"
                min="12"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* 1-Hour Schedule Batch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              वर्कआउट समय / 1 घंटा बैच (Workout Time Slot)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={workoutSlot}
                onChange={(e) => setWorkoutSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono transition-all"
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

          {/* Submit Actions */}
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
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'पंजीकरण हो रहा है...' : 'पंजीकरण करें व तुरंत लॉगिन करें'}</span>
            </button>
          </div>
        </form>
      </div>

      <LiveCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(compressed) => {
          setAvatarUrl(compressed);
          setShowCameraModal(false);
        }}
        title="सदस्य प्रोफाइल फोटो (Live Camera)"
        guideType="face"
      />
    </div>
  );
};
