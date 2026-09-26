import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localDb } from '../../db/localDatabase';
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
  SlidersHorizontal,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
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

  const [formMode, setFormModeState] = useState<'simple' | 'advanced'>(() => localDb.getFormMode());
  const [modeSavedToast, setModeSavedToast] = useState<string>('');

  const handleToggleMode = (newMode: 'simple' | 'advanced') => {
    localDb.setFormMode(newMode);
    setFormModeState(newMode);
    setModeSavedToast(
      newMode === 'simple'
        ? 'साधारण मोड (Simple Mode) सक्रिय हुआ — अतिरिक्त फ़ील्ड्स छुपाई गईं।'
        : 'विस्तृत मोड (Advanced Mode) सक्रिय हुआ — सभी फ़ील्ड्स एवं विकल्प अनलॉक हुए।'
    );
    setTimeout(() => {
      setModeSavedToast('');
    }, 4000);
  };

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

      {/* DEVELOPER SYSTEM & FORM MODE CONTROLS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs shrink-0">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  सिस्टम फ़ॉर्म मोड एवं डेटा नियंत्रण (System Form Mode Controls)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Dev Master
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ट्रेनर, सदस्य रजिस्ट्रेशन एवं पोर्टल में आवश्यक या विस्तृत फ़ील्ड्स प्रदर्शित करने हेतु 1-क्लिक स्विच
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">वर्तमान मोड:</span>
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                formMode === 'simple'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}
            >
              {formMode === 'simple' ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                  <span>साधारण मोड (Simple Mode)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>विस्तृत मोड (Advanced Mode)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {modeSavedToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{modeSavedToast}</span>
          </div>
        )}

        {/* 2 Big Mode Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Simple Mode */}
          <div
            onClick={() => handleToggleMode('simple')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              formMode === 'simple'
                ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${formMode === 'simple' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">साधारण मोड (Simple Mode)</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">अनुशंसित (Default)</span>
                  </div>
                </div>
                {formMode === 'simple' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                    सक्रिय (Active)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                अनावश्यक फ़ील्ड्स छुपाकर त्वरित एवं सुगम प्रविष्टि हेतु सुव्यवस्थित मोड:
              </p>

              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><b>ट्रेनर जोड़ना:</b> केवल 4 फ़ील्ड्स (पूरा नाम, 4-अंकीय पिन, मोबाइल नंबर, लाइव/गैलरी फ़ोटो)।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><b>सदस्य जोड़ना:</b> सदस्यता अवधि प्लान, PT कोच, फ़ीस/भुगतान विवरण, पेमेंट स्टेटस, कुल देय शुल्क व ईमेल छुपे रहेंगे।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><b>ट्रेनर लॉगिन:</b> मासिक बेस सैलरी और GPS क्लॉक-इन हाजिरी छुपी रहेगी।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><b>ट्रेनर सदस्य नियंत्रण:</b> ट्रेनर केवल अपने ही पंजीकृत सदस्यों को देख सकेंगे।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><b>स्व-पंजीकरण:</b> डिफ़ॉल्ट <b>PIN: 1111</b> से कोई भी सदस्य सीधे जुड़ सकता है।</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className={`w-full mt-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                formMode === 'simple'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {formMode === 'simple' ? '✓ वर्तमान में सक्रिय' : 'साधारण मोड में बदलें'}
            </button>
          </div>

          {/* Card 2: Advanced Mode */}
          <div
            onClick={() => handleToggleMode('advanced')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              formMode === 'advanced'
                ? 'border-indigo-500 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${formMode === 'advanced' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">विस्तृत मोड (Advanced Mode)</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">सम्पूर्ण कॉर्पोरेट नियंत्रण</span>
                  </div>
                </div>
                {formMode === 'advanced' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                    सक्रिय (Active)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                सभी छुपी हुई फ़ील्ड्स, विस्तृत शुल्क गणना और कर्मचारी प्रलेखन पुनः अनलॉक करें:
              </p>

              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <span><b>ट्रेनर सम्पूर्ण विवरण:</b> पिता का नाम, DOB, ईमेल, पता, बेस सैलरी, विशेषज्ञता, बायो व आधार/KYC अपलोड।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <span><b>सदस्य वित्तीय प्लान:</b> सदस्यता पैकेज (1/3/6/12 माह), PT कोच, फ़ीस ब्रेकअप, छूट, भुगतान स्थिति व ईमेल।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <span><b>ट्रेनर वेतन व GPS:</b> ट्रेनर पोर्टल में सैलरी कार्ड एवं GPS ड्यूटी क्लॉक-इन सिस्टम सक्रिय।</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className={`w-full mt-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                formMode === 'advanced'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {formMode === 'advanced' ? '✓ वर्तमान में सक्रिय' : 'विस्तृत मोड में बदलें'}
            </button>
          </div>
        </div>

        {/* Security Credentials Reference Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">सिस्टम सुरक्षा क्रेडेंशियल संदर्भ (Security Quick Reference)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">लॉगिन एवं डायरेक्ट एक्सेस पिन</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono">
              <span className="text-slate-400">Admin PIN: </span>
              <strong className="text-amber-400 font-black">2343</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono">
              <span className="text-slate-400">सेल्फ-रजिस्ट्रेशन: </span>
              <strong className="text-emerald-400 font-black">1111</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono">
              <span className="text-slate-400">डेवलपर PIN: </span>
              <strong className="text-cyan-400 font-black">9975</strong>
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
