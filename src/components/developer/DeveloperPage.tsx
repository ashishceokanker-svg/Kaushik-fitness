import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CodeXml,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Camera,
  Trash2,
  Upload,
} from 'lucide-react';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface DeveloperPageProps {
  onBack?: () => void;
}

export const DeveloperPage: React.FC<DeveloperPageProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';

  const [developerPhoto, setDeveloperPhoto] = useState<string>(() => {
    return localStorage.getItem('kf_developer_photo') || '';
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 720,
        maxHeight: 720,
        quality: 0.75,
      });
      setDeveloperPhoto(compressed);
      localStorage.setItem('kf_developer_photo', compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setDeveloperPhoto(base64);
          localStorage.setItem('kf_developer_photo', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setDeveloperPhoto('');
    localStorage.removeItem('kf_developer_photo');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Bar with Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 text-cyan-700 text-xs font-bold uppercase tracking-wider">
              <CodeXml className="w-4 h-4 text-cyan-600" />
              Official Developer & System Architect Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Developer & Leadership Profile
            </h1>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        )}
      </div>

      {/* Hero Profile Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Container with Upload Badge */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              {developerPhoto ? (
                <img
                  src={developerPhoto}
                  alt="Ashish Dey - Chief Executive Officer, Janpad Panchayat Baderajpur"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-4 border-cyan-400/80 shadow-2xl"
                />
              ) : (
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-cyan-600 to-amber-500 p-1 shadow-2xl">
                  <div className="w-full h-full bg-slate-900 rounded-[22px] flex flex-col items-center justify-center text-center p-3">
                    <Building2 className="w-12 h-12 text-cyan-400 mb-2" />
                    <span className="text-sm font-black tracking-wider uppercase text-amber-300">
                      Ashish Dey
                    </span>
                    <span className="text-[10px] text-slate-300 text-center leading-tight mt-1">
                      Chief Executive Officer
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Photo Button - DEVELOPER ONLY */}
              {isDeveloper ? (
                <div className="relative">
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
                    onClick={() => setShowOptions(!showOptions)}
                    title="Upload or Change Profile Photo"
                    className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Options Menu */}
                  {showOptions && (
                    <div className="absolute bottom-10 right-0 w-44 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-20 space-y-1 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptions(false);
                          setShowCameraModal(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-white hover:bg-cyan-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>कैमरा से लाइव खींचें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptions(false);
                          photoInputRef.current?.click();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>गैलरी से चुनें</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  title="फोटो बदलने की अनुमति केवल डेवलपर लॉगिन (Ashish Dey) में है"
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 cursor-not-allowed opacity-75 flex items-center justify-center shadow"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}
            </div>

            {isDeveloper && developerPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer transition-colors pt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}

            {!isDeveloper && (
              <span className="text-[10px] text-slate-400 pt-0.5">
                (फोटो संपादन केवल डेवलपर के लिए उपलब्ध)
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Developer & Administrative Leadership
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ashish Dey
              </h2>
              <div className="text-base sm:text-lg font-bold text-amber-400 mt-1">
                Chief Executive Officer, Janpad Panchayat Baderajpur
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Panchayat & Rural Development Department (Govt. of Chhattisgarh)
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Dedicated administrative leadership driven by modern digital governance, technological innovation, and public service. Committed to empowering communities, enhancing operational transparency, and fostering an enduring culture of discipline and excellence.
            </p>

            {/* Direct Contact Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href="tel:9244249975"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call: 9244249975</span>
              </a>

              <a
                href="https://wa.me/919244249975?text=Hello%20Sir,%20contacting%20regarding%20the%20Kaushik%20Fitness%20application."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>

              <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-xs font-mono text-cyan-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Janpad Panchayat Baderajpur, District Kondagaon (C.G.)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LiveCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(compressed) => {
          setDeveloperPhoto(compressed);
          localStorage.setItem('kf_developer_photo', compressed);
          setShowCameraModal(false);
        }}
        title="डेवलपर प्रोफाइल फोटो (Live Camera)"
        guideType="face"
      />
    </div>
  );
};
