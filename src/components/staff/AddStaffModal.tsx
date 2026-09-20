import React, { useState, useEffect, useRef } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { StaffType } from '../../types';
import {
  X,
  UserPlus,
  ShieldCheck,
  UploadCloud,
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
} from 'lucide-react';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface AddStaffModalProps {
  onClose: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose }) => {
  const { addStaff } = useGymData();

  // Photo
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Basic Information
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Staff Category & Role
  const [staffType, setStaffType] = useState<StaffType>('instructor');
  const [designation, setDesignation] = useState('Gym Instructor & PT Coach');
  const [salaryMonthly, setSalaryMonthly] = useState<number>(25000);
  const [specializations, setSpecializations] = useState('Hypertrophy, Fat Loss, Powerlifting');
  const [bio, setBio] = useState('');

  // Document Upload
  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docFileUrl, setDocFileUrl] = useState<string | undefined>(undefined);
  const [fileSizeStr, setFileSizeStr] = useState('');

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

    // File size check (e.g. limit to 5MB)
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

  const [showCameraModal, setShowCameraModal] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    if (!name.trim() || !phone.trim()) return;

    addStaff({
      name: name.trim(),
      fatherName: fatherName.trim() || undefined,
      dob: dob || undefined,
      phone: phone.trim(),
      email: email.trim() || `${phone.trim()}@koushikfitness.com`,
      address: address.trim() || undefined,
      role: staffType === 'instructor' ? 'trainer' : 'staff',
      staffType,
      designation: designation.trim(),
      joiningDate: new Date().toISOString().split('T')[0],
      salaryMonthly,
      specialization: specializations.split(',').map((s) => s.trim()).filter(Boolean),
      status: 'active',
      bio: bio.trim(),
      docType,
      docNumber: docNumber.trim() || undefined,
      docFileName: docFileName || undefined,
      docFileUrl,
      avatarUrl,
    });

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
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                नया स्टाफ / ट्रेनर जोड़ें (Add Staff & Trainer)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                कौशिक फिटनेस कांकेर - स्टाफ व ट्रेनर बायोडाटा, पता एवं दस्तावेज़ एंट्री
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-cyan-50/70 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Staff Preview"
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
                  ट्रेनर / स्टाफ का फ़ोटो (Photo Upload)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  वैकल्पिक (Optional)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                फ़ोटो अपलोड करें जो ट्रेनर/स्टाफ लॉगिन करने पर डैशबोर्ड, प्रोफाइल कार्ड व आईडी में दिखाई देगी।
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>कैमरा से फोटो लें</span>
                </button>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>गैलरी से चुनें</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl(undefined);
                      if (photoInputRef.current) photoInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer transition-all"
                  >
                    हटाएं
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Basic Identity */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200 inline-block mb-3">
              1. व्यक्तिगत विवरण (Personal Identity)
            </span>

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
                    placeholder="उदा. विक्रम साहू"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पिता का नाम (Father's Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री संतोष साहू"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  जन्म तिथि (Date of Birth / DOB) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मोबाइल नंबर (Phone Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="उदा. 98261XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ईमेल पता (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="उदा. trainer@kaushikfitness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  स्थायी पता / निवास (Residential Address) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    required
                    placeholder="मकान नं., मोहल्ला/वार्ड, पोस्ट, कांकेर (छ.ग.) पिनकोड"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role & Salary */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-3">
              2. पद व वेतन विवरण (Role & Salary)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  स्टाफ श्रेणी (Staff Category)
                </label>
                <select
                  value={staffType}
                  onChange={(e) => {
                    const val = e.target.value as StaffType;
                    setStaffType(val);
                    setDesignation(
                      val === 'instructor'
                        ? 'Gym Instructor & PT Coach'
                        : 'Front Desk & Operations Officer'
                    );
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="instructor">जिम इंस्ट्रक्टर / ट्रेनर (Gym Instructor / Trainer)</option>
                  <option value="regular">रेगुलर स्टाफ (Front Desk & Ops)</option>
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पदनाम (Designation Title)
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Salary Monthly */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मासिक वेतन (Monthly Salary ₹) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    min={1000}
                    value={salaryMonthly}
                    onChange={(e) => setSalaryMonthly(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विशेषज्ञता (Skills / Specialization)
                </label>
                <input
                  type="text"
                  placeholder="उदा. Hypertrophy, Diet Planning, Powerlifting"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संक्षिप्त परिचय / अनुभव (Bio / Credentials)
                </label>
                <textarea
                  rows={2}
                  placeholder="प्रमाणपत्र, पूर्व अनुभव एवं उपलब्धियां..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Verification & Upload */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mb-3">
              3. आईडी व दस्तावेज़ अपलोड (Document Upload & Verification)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दस्तावेज़ का प्रकार (Document Type)
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="Aadhaar Card">आधार कार्ड (Aadhaar Card)</option>
                  <option value="PAN Card">पैन कार्ड (PAN Card)</option>
                  <option value="Fitness Trainer Certificate">ट्रेनर सर्टिफिकेशन / डिप्लोमा (Certificate)</option>
                  <option value="Police Verification">पुलिस चरित्र सत्यापन (Police Verification)</option>
                  <option value="Address Proof">निवास प्रमाण पत्र (Address Proof)</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दस्तावेज़ / आईडी संख्या (Document ID / Number)
                </label>
                <input
                  type="text"
                  placeholder="उदा. 4821 XXXX XXXX या PAN"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              {/* File Upload Box */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दस्तावेज़ की फ़ाइल अपलोड करें (Upload Document File / Photo / PDF)
                </label>

                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-white transition-all text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {docFileName ? (
                    <div className="flex items-center justify-center gap-3 text-emerald-700">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-sm text-slate-900">{docFileName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          आकार: {fileSizeStr} • फ़ाइल सफलतापूर्वक लोड हुई
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full ml-auto">
                        बदलें
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-8 h-8 mx-auto text-amber-600" />
                      <div className="text-xs font-bold text-slate-800">
                        फ़ाइल चुनने के लिए यहाँ क्लिक करें (आधार / पैन / सर्टिफिकेट)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        समर्थित प्रारूप: JPG, PNG, PDF (अधिकतम 5MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>स्टाफ / ट्रेनर सुरक्षित करें (Save Profile)</span>
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
        title="स्टाफ / ट्रेनर फोटो (Live Camera)"
        guideType="face"
      />
    </div>
  );
};
