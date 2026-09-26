import React, { useState, useEffect, useRef } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Member, Gender, FitnessGoal } from '../../types';
import {
  X,
  Edit3,
  User,
  Phone,
  Mail,
  Calendar,
  KeyRound,
  CheckCircle2,
  Camera,
  Upload,
  Dumbbell,
  Clock,
  Heart,
  Activity,
  Award,
} from 'lucide-react';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';
import { calculateFitnessMetrics, generateAutomaticCustomDiet } from '../../utils/fitnessCalculator';
import { localDb } from '../../db/localDatabase';

interface EditMemberModalProps {
  member: Member;
  onClose: () => void;
}

const WORKOUT_SLOTS = [
  '05:00 AM - 06:00 AM',
  '06:00 AM - 07:00 AM',
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM',
  '09:00 PM - 10:00 PM',
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, onClose }) => {
  const { updateMember, staff } = useGymData();

  // Photo
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(member.avatarUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Basic Info
  const [name, setName] = useState(member.name || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [email, setEmail] = useState(member.email || '');
  const [pin, setPin] = useState(member.pin || '1234');
  const [emergencyContact, setEmergencyContact] = useState(member.emergencyContact || '');

  // Physical Attributes
  const [age, setAge] = useState<number>(member.age || 25);
  const [gender, setGender] = useState<Gender>(member.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(member.heightCm || 170);
  const [weightKg, setWeightKg] = useState<number>(member.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState<number | undefined>(member.targetWeightKg);

  // Fitness Preferences
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(member.fitnessGoal || 'muscle_building');
  const [dietPreference, setDietPreference] = useState<'veg' | 'non_veg'>(member.dietPreference || 'veg');
  const [workoutSlot, setWorkoutSlot] = useState(member.workoutSlot || '06:00 AM - 07:00 AM');
  const [medicalConditions, setMedicalConditions] = useState(member.medicalConditions || '');
  const [assignedTrainerId, setAssignedTrainerId] = useState(member.assignedTrainerId || '');
  const [active, setActive] = useState(member.active !== false);

  // Available Trainers
  const trainers = staff.filter(
    (s) =>
      s.role === 'trainer' ||
      s.staffType === 'instructor' ||
      (s.name && !s.name.toLowerCase().includes('vaibhav') && !s.name.toLowerCase().includes('ashish'))
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = name.trim() || member.name;
    const finalPhone = phone.trim() || member.phone;
    const finalPin = pin.trim().length === 4 ? pin.trim() : (member.pin || '1234');

    // Recalculate fitness metrics
    const metrics = calculateFitnessMetrics(weightKg, heightCm, age, gender, 'moderate', fitnessGoal);

    const selectedTrainer = trainers.find((t) => t.id === assignedTrainerId || t.userId === assignedTrainerId);

    updateMember(member.id, {
      name: finalName,
      phone: finalPhone,
      email: email.trim() || `${finalPhone}@kaushikfitness.com`,
      pin: finalPin,
      emergencyContact: emergencyContact.trim(),
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : undefined,
      fitnessGoal,
      dietPreference,
      workoutSlot,
      medicalConditions: medicalConditions.trim() || undefined,
      assignedTrainerId: assignedTrainerId || undefined,
      assignedTrainerName: selectedTrainer?.name || (assignedTrainerId ? member.assignedTrainerName : undefined),
      avatarUrl,
      active,
      fitnessLevel: metrics.fitnessLevel,
      fitnessScore: metrics.fitnessScore,
      bmi: metrics.bmi,
      bodyFatPercentage: metrics.bodyFatPercentage,
      targetDailyCalories: metrics.targetDailyCalories,
    });

    try {
      const autoDiet = generateAutomaticCustomDiet({
        memberId: member.id,
        memberName: finalName,
        goal: fitnessGoal,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        age: Number(age),
        gender,
        dietType: dietPreference,
        trainerId: assignedTrainerId || undefined,
        trainerName: selectedTrainer?.name || undefined,
      });
      localDb.saveMemberDiet(autoDiet);
      window.dispatchEvent(new CustomEvent('kf_body_index_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Could not auto-generate diet:', err);
    }

    alert(`✅ सदस्य ${finalName} (${member.memberCode}) की जानकारी सफलतापूर्वक अपडेट कर दी गई है!`);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-14 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto sm:my-0">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base leading-tight">
                  सदस्य विवरण संपादित करें (Edit Member)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                  {member.memberCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {member.name} - नाम, मोबाइल, पिन, बॉडी मेट्रिक्स व वर्कआउट स्लॉट अपडेट करें
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 font-bold">
                  <Camera className="w-7 h-7 mb-1 text-slate-400" />
                  <span className="text-[10px]">फ़ोटो</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-xs font-bold text-slate-800">सदस्य की फ़ोटो (Profile Photo)</div>
              <p className="text-[11px] text-slate-500">
                लाइव कैमरा से सदस्य की फोटो लें या डिवाइस से फ़ाइल चुनें
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>लाइव कैमरा</span>
                </button>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>फ़ाइल चुनें</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(undefined)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-all cursor-pointer"
                  >
                    हटाएं
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                सदस्य का नाम (Full Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-semibold"
              />
            </div>

            {/* PIN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                4-अंकीय एंट्री पिन (Member PIN) *
              </label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm font-mono font-bold text-indigo-950 focus:outline-none focus:border-indigo-500 text-center tracking-widest"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                मोबाइल नंबर (WhatsApp) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                ईमेल आईडी (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                आपातकालीन संपर्क (Emergency Contact)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="उदा. 98261XXXXX (Father)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            {/* Workout Slot */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                वर्कआउट टाइम स्लॉट (Workout Slot)
              </label>
              <select
                value={workoutSlot}
                onChange={(e) => setWorkoutSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {WORKOUT_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical Attributes Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600" />
              शारीरिक माप व लक्ष्य (Physical Metrics & Fitness Goal)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600">उम्र (Age)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">लिंग (Gender)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="male">पुरुष (Male)</option>
                  <option value="female">महिला (Female)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">कद (Height cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">वजन (Weight kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600">फिटनेस लक्ष्य (Goal)</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="muscle_building">मसल बिल्डिंग (Muscle Building)</option>
                  <option value="weight_loss">वजन घटाना (Weight Loss)</option>
                  <option value="strength">स्ट्रेंथ व पावर (Strength & Power)</option>
                  <option value="endurance">स्टैमिना व सहनशक्ति (Endurance)</option>
                  <option value="general_fitness">सामान्य फिटनेस (General Fitness)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">असाइन जिम ट्रेनर (Assigned Trainer)</label>
                <select
                  value={assignedTrainerId}
                  onChange={(e) => setAssignedTrainerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">कोई ट्रेनर असाइन नहीं (No Trainer)</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation || 'Coach'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diet Preference Selection (शाकाहारी / मांसाहारी) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                खानपान प्राथमिकता / डाइट प्लान (Diet Preference)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDietPreference('veg')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    dietPreference === 'veg'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🥗</span>
                  <span>शाकाहारी (Veg Diet)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietPreference('non_veg')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    dietPreference === 'non_veg'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🍗</span>
                  <span>मांसाहारी (Non-Veg Diet)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Status & Medical */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">अकाउंट स्टेटस (Account Active)</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="member-active-status"
                    checked={active === true}
                    onChange={() => setActive(true)}
                    className="text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-emerald-700">सक्रिय (Active & Unlocked)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="member-active-status"
                    checked={active === false}
                    onChange={() => setActive(false)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-700">निष्क्रिय (Inactive / Locked)</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">चिकित्सा स्थिति / चोट (Medical Conditions)</label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="उदा. None, BP, Knee pain"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>बदलाव सुरक्षित करें (Save Member)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Camera Modal */}
      {showCameraModal && (
        <LiveCameraModal
          isOpen={showCameraModal}
          title="सदस्य की लाइव फोटो लें"
          onCapture={(capturedBase64) => {
            setAvatarUrl(capturedBase64);
            setShowCameraModal(false);
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};
