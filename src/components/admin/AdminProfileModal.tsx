import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Save,
  Mail,
  Sparkles,
  Upload,
} from 'lucide-react';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || 'Vaibhav Kaushik');
  const [phone, setPhone] = useState(currentUser?.phone || '9826189001');
  const [address, setAddress] = useState(currentUser?.address || 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  if (!isOpen) return null;

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
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setAvatarUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      avatarUrl: avatarUrl || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-950/10 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                व्यवस्थापक प्रोफ़ाइल संपादन (Edit Admin Profile)
              </h3>
              <p className="text-xs font-semibold opacity-90">
                नाम, पता, मोबाइल नंबर एवं फोटो अपडेट करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 transition-colors cursor-pointer text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>व्यवस्थापक प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है!</span>
            </div>
          )}

          {/* Photo Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xl font-black text-amber-900 shadow-inner">
                  {(name || 'Admin').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="text-xs font-bold text-slate-900">
                एडमिन फोटो (Admin Profile Photo)
              </div>
              <p className="text-[11px] text-slate-500">
                फोटो अपलोड करने से यह डैशबोर्ड, नेवबार एवं रिपोर्ट में दिखाई देगी।
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
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
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>कैमरा से फोटो लें</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>गैलरी से चुनें</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                एडमिन का नाम (Full Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. Vaibhav Kaushik"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                मोबाइल नंबर (Mobile) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="उदा. 9826189001"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              ईमेल पता (Registered Email)
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || 'admin@kaushikfitness.com'}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-medium"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              पूरा पता / निवास स्थान (Address) *
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="उदा. मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>सेव करें (Save Profile)</span>
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
        title="व्यवस्थापक फोटो (Live Camera)"
        guideType="face"
      />
    </div>
  );
};
