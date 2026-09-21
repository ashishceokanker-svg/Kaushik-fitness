import React, { useState, useEffect, useRef } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Staff, StaffType } from '../../types';
import {
  X,
  Edit3,
  FileText,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Camera,
  Upload,
  KeyRound,
  RefreshCw,
  UploadCloud,
  Eye,
} from 'lucide-react';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface EditStaffModalProps {
  staffMember: Staff;
  onClose: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staffMember, onClose }) => {
  const { updateStaff } = useGymData();

  // Photo
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(staffMember.avatarUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Basic Information
  const [name, setName] = useState(staffMember.name || '');
  const [pin, setPin] = useState<string>(staffMember.pin || '1234');
  const [fatherName, setFatherName] = useState(staffMember.fatherName || '');
  const [dob, setDob] = useState(staffMember.dob || '');
  const [phone, setPhone] = useState(staffMember.phone || '');
  const [email, setEmail] = useState(staffMember.email || '');
  const [address, setAddress] = useState(staffMember.address || '');

  // Staff Category & Role
  const [staffType, setStaffType] = useState<StaffType>(
    staffMember.staffType || (staffMember.role === 'trainer' ? 'instructor' : 'regular')
  );
  const [designation, setDesignation] = useState(staffMember.designation || '');
  const [salaryMonthly, setSalaryMonthly] = useState<number>(staffMember.salaryMonthly || 20000);
  const [specializations, setSpecializations] = useState(
    Array.isArray(staffMember.specialization)
      ? staffMember.specialization.join(', ')
      : (staffMember.specialization || '')
  );
  const [bio, setBio] = useState(staffMember.bio || '');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>(staffMember.status || 'active');

  // Document Upload
  const [docType, setDocType] = useState(staffMember.docType || 'Aadhaar Card');
  const [docNumber, setDocNumber] = useState(staffMember.docNumber || '');
  const [docFileName, setDocFileName] = useState(staffMember.docFileName || '');
  const [docFileUrl, setDocFileUrl] = useState<string | undefined>(staffMember.docFileUrl);
  const [fileSizeStr, setFileSizeStr] = useState('');

  // Generate a random 4-digit PIN
  const handleGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(randomPin);
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

  // Handle document file upload (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('फ़ाइल का आकार 5MB से कम होना चाहिए।');
      return;
    }

    setDocFileName(file.name);
    setFileSizeStr((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDocFileUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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

    const finalName = name.trim() || staffMember.name;
    const finalPhone = phone.trim() || staffMember.phone;
    const finalPin = pin.trim().length === 4 ? pin.trim() : (staffMember.pin || '1234');
    const finalSalary = Number(salaryMonthly) > 0 ? Number(salaryMonthly) : staffMember.salaryMonthly;

    updateStaff(staffMember.id, {
      name: finalName,
      fatherName: fatherName.trim() || undefined,
      dob: dob || undefined,
      phone: finalPhone,
      email: email.trim() || staffMember.email,
      address: address.trim() || undefined,
      role: staffType === 'instructor' ? 'trainer' : 'staff',
      staffType,
      designation: designation.trim() || staffMember.designation,
      salaryMonthly: finalSalary,
      specialization: specializations.split(',').map((s) => s.trim()).filter(Boolean),
      status,
      bio: bio.trim() || undefined,
      docType,
      docNumber: docNumber.trim() || undefined,
      docFileName: docFileName || undefined,
      docFileUrl,
      avatarUrl,
      pin: finalPin,
    });

    alert(`✅ ${finalName} का प्रोफ़ाइल सफलतापूर्वक अपडेट हो गया!\n\n🔑 4-अंकीय पिन: ${finalPin}\n📱 मोबाइल: ${finalPhone}`);
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
                  स्टाफ / ट्रेनर संपादित करें (Edit Staff)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                  {staffMember.staffCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {staffMember.name} - पद, वेतन, फोन, बायो, पता एवं दस्तावेज अपडेट करें
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Upload Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50/70 via-white to-amber-50/70 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Staff Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-7 h-7 mb-1 text-slate-400" />
                  <span className="text-[10px] font-bold">फ़ोटो</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-xs font-bold text-slate-800">स्टाफ / ट्रेनर की प्रोफ़ाइल फ़ोटो</div>
              <p className="text-[11px] text-slate-500">
                लाइव वेबकैम/कैमरा से फोटो लें या गैलरी से अपलोड करें
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

          {/* Category Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
              स्टाफ श्रेणी (Staff Category)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStaffType('instructor');
                  if (!designation) setDesignation('Gym Instructor & PT Coach');
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  staffType === 'instructor'
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 shadow-xs ring-1 ring-cyan-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                    staffType === 'instructor' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  🏋️
                </div>
                <div>
                  <div className="text-xs font-bold">जिम ट्रेनर / कोच</div>
                  <div className="text-[10px] text-slate-500">PT Clients & Workout Plans</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStaffType('regular');
                  if (!designation) setDesignation('Front Desk & Operations Executive');
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  staffType === 'regular'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs ring-1 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                    staffType === 'regular' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  💼
                </div>
                <div>
                  <div className="text-xs font-bold">फ्रंट डेस्क व मैनेजमेंट</div>
                  <div className="text-[10px] text-slate-500">Billing, Enquiry & Support</div>
                </div>
              </button>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                पूरा नाम (Full Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राहुल शर्मा"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* 4-digit PIN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  4-अंकीय लॉगिन/अटेंडेंस पिन *
                </span>
                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> नया पिन बनाएं
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm font-mono font-bold text-indigo-950 focus:outline-none focus:border-indigo-500 text-center tracking-widest"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                मोबाइल नंबर (WhatsApp) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="उदा. 98261XXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                ईमेल आईडी (Email Address)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा. staff@kaushikfitness.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Father's Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                पिता का नाम (Father's Name)
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="श्री ..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                जन्म तिथि (Date of Birth)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                पद / पदनाम (Designation)
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={staffType === 'instructor' ? 'Head Coach / Master Trainer' : 'Front Desk Executive'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Monthly Salary */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                मासिक वेतन (Monthly Salary ₹)
              </label>
              <input
                type="number"
                value={salaryMonthly}
                onChange={(e) => setSalaryMonthly(Number(e.target.value))}
                placeholder="25000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Status & Specializations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">स्थिति (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="on_leave">अवकाश पर (On Leave)</option>
                <option value="inactive">निष्क्रिय (Inactive)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">विशेषज्ञता (Specializations - अल्पविराम से अलग करें)</label>
              <input
                type="text"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="Hypertrophy, Fat Loss, Powerlifting"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              स्थायी पता (Residential Address)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="वार्ड क्र. / मोहल्ला, कांकेर (छ.ग.)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">बायो / अनुभव (Bio / Notes)</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="अनुभव व उपलब्धियां..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Document Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              दस्तावेज़ विवरण (KYC & Verification Document)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600">दस्तावेज़ प्रकार (Document Type)</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Aadhaar Card">आधार कार्ड (Aadhaar Card)</option>
                  <option value="PAN Card">पैन कार्ड (PAN Card)</option>
                  <option value="Driving License">ड्राइविंग लाइसेंस (Driving License)</option>
                  <option value="Fitness Trainer Certificate">ट्रेनर सर्टिफिकेशन (Trainer Certificate)</option>
                  <option value="Voter ID">मतदाता परिचय पत्र (Voter ID)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">दस्तावेज़ संख्या (Document Number)</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="file"
                id="edit-doc-upload"
                onChange={handleFileUpload}
                accept=".pdf,image/*"
                className="hidden"
              />
              <label
                htmlFor="edit-doc-upload"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
                <span>दस्तावेज़ फ़ाइल बदलें</span>
              </label>

              {docFileName && (
                <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {docFileName} {fileSizeStr && `(${fileSizeStr})`}
                </span>
              )}

              {docFileUrl && (
                <a
                  href={docFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> देखें
                </a>
              )}
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              <span>बदलाव सुरक्षित करें (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Webcam Modal */}
      {showCameraModal && (
        <LiveCameraModal
          isOpen={showCameraModal}
          title="स्टाफ / कोच की लाइव फोटो लें"
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
