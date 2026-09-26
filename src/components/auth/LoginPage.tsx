import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localDb } from '../../db/localDatabase';
import {
  Dumbbell,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { MemberSelfRegisterModal } from './MemberSelfRegisterModal';

interface LoginPageProps {
  onOpenEnquiry?: () => void;
  onOpenAppInstall?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenEnquiry, onOpenAppInstall }) => {
  const { loginWithCredentials, error: authError } = useAuth();
  
  const [pin, setPin] = useState<string>('');
  const [showSelfRegisterModal, setShowSelfRegisterModal] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [geofenceFeedback, setGeofenceFeedback] = useState<{
    status: 'present' | 'absent';
    message: string;
    distance: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const geofenceSettings = localDb.getGeofenceSettings();

  useEffect(() => {
    // Only autofocus on laptop/desktop to avoid mobile virtual keyboard covering the screen
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setLocalError('कृपया वैध 4-अंकीय पिन दर्ज करें (Please enter a valid 4-digit PIN)');
      return;
    }

    // Default PIN 1111 for Member Self-Registration
    if (pin.trim() === '1111') {
      setShowSelfRegisterModal(true);
      setPin('');
      return;
    }

    setLoading(true);
    setLocalError(null);
    setGeofenceFeedback(null);
    try {
      const res = await loginWithCredentials(pin);
      if (!res.success) {
        // Strict Validation Message: Never expose or show demo PINs under any circumstances
        setLocalError(res.message || '❌ अमान्य पिन! कृपया अपना सही 4-अंकीय सुरक्षा पिन दर्ज करें। (Invalid PIN. Please try again.)');
        setPin('');
      } else if (res.geofenceResult) {
        setGeofenceFeedback({
          status: res.geofenceResult.status,
          message: res.geofenceResult.message,
          distance: res.geofenceResult.formattedDistance,
        });
      }
    } catch (err: any) {
      setLocalError('अमान्य पिन या नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen h-[100dvh] max-h-[100dvh] w-full bg-gradient-to-br from-slate-200 via-amber-100/50 to-slate-300/80 flex flex-col justify-between text-slate-800 selection:bg-amber-400 selection:text-slate-900 overflow-hidden">
      {/* Decorative Gym Vector Art & Light Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Soft Ambient Light Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-slate-400/25 blur-3xl" />

        {/* High-Definition Responsive Gym Vector Artwork */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          {/* Top-Left Olympic Barbell with Loaded Heavy Plates */}
          <g transform="translate(60, 60) rotate(-18)">
            {/* Barbell shaft */}
            <rect x="0" y="70" width="340" height="12" rx="6" fill="#475569" stroke="#1e293b" strokeWidth="2" opacity="0.6" />
            <rect x="60" y="68" width="50" height="16" fill="#f59e0b" opacity="0.35" />
            <rect x="230" y="68" width="50" height="16" fill="#f59e0b" opacity="0.35" />
            {/* Left Plates (45lb / 20kg) */}
            <rect x="10" y="10" width="16" height="132" rx="6" fill="#334155" stroke="#f59e0b" strokeWidth="2.5" opacity="0.55" />
            <rect x="30" y="22" width="14" height="108" rx="5" fill="#475569" stroke="#f59e0b" strokeWidth="2" opacity="0.55" />
            <rect x="48" y="34" width="10" height="84" rx="4" fill="#64748b" opacity="0.45" />
            {/* Right Plates */}
            <rect x="314" y="10" width="16" height="132" rx="6" fill="#334155" stroke="#f59e0b" strokeWidth="2.5" opacity="0.55" />
            <rect x="296" y="22" width="14" height="108" rx="5" fill="#475569" stroke="#f59e0b" strokeWidth="2" opacity="0.55" />
            <rect x="282" y="34" width="10" height="84" rx="4" fill="#64748b" opacity="0.45" />
          </g>

          {/* Top-Right Large Olympic Plate Disc */}
          <g transform="translate(1120, 60) rotate(22)">
            <circle cx="100" cy="100" r="90" fill="#f8fafc" stroke="#d97706" strokeWidth="4" opacity="0.6" />
            <circle cx="100" cy="100" r="72" fill="#e2e8f0" stroke="#b45309" strokeWidth="2.5" opacity="0.6" />
            <circle cx="100" cy="100" r="28" fill="#cbd5e1" stroke="#b45309" strokeWidth="2" opacity="0.6" />
            <circle cx="100" cy="100" r="16" fill="#334155" opacity="0.8" />
            {/* Plate text */}
            <text x="100" y="46" textAnchor="middle" fill="#92400e" fontSize="13" fontWeight="900" letterSpacing="2">KAUSHIK</text>
            <text x="100" y="170" textAnchor="middle" fill="#92400e" fontSize="13" fontWeight="900" letterSpacing="2">25 KG</text>
          </g>

          {/* Bottom-Left Kettlebell Silhouette */}
          <g transform="translate(140, 620) rotate(12)">
            {/* Handle */}
            <path d="M40 70 C40 10, 120 10, 120 70" stroke="#334155" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.4" />
            {/* Bell Ball */}
            <circle cx="80" cy="115" r="55" fill="#475569" stroke="#f59e0b" strokeWidth="2" opacity="0.5" />
            <circle cx="80" cy="115" r="42" fill="#334155" opacity="0.5" />
            <text x="80" y="122" textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="900" opacity="0.8">24</text>
          </g>

          {/* Bottom-Right Hex Dumbbell Duo */}
          <g transform="translate(1140, 580) rotate(-15)">
            {/* Dumbbell bar */}
            <rect x="25" y="64" width="160" height="12" rx="4" fill="#475569" stroke="#1e293b" strokeWidth="2" opacity="0.6" />
            {/* Left Hex head */}
            <path d="M-10 20 L-10 106 L15 125 L40 106 L40 20 L15 1 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="3.5" opacity="0.6" />
            {/* Right Hex head */}
            <path d="M170 20 L170 106 L195 125 L220 106 L220 20 L195 1 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="3.5" opacity="0.6" />
            <text x="15" y="70" textAnchor="middle" fill="#b45309" fontSize="14" fontWeight="900" opacity="0.7">30KG</text>
            <text x="195" y="70" textAnchor="middle" fill="#b45309" fontSize="14" fontWeight="900" opacity="0.7">30KG</text>
          </g>

          {/* Center Dynamic Heartbeat / ECG Athletic Pulse Wave */}
          <path
            d="M0 450 L380 450 L410 400 L430 500 L460 360 L490 530 L520 420 L550 470 L570 450 L1440 450"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="490" cy="530" r="5" fill="#d97706" opacity="0.6" />

          {/* Watermarked Big Typography */}
          <text
            x="50%"
            y="240"
            textAnchor="middle"
            fill="none"
            stroke="#d97706"
            strokeWidth="1.5"
            strokeOpacity="0.16"
            fontSize="84"
            fontWeight="900"
            letterSpacing="0.25em"
            className="font-black select-none uppercase tracking-widest"
          >
            KAUSHIK FITNESS
          </text>
          <text
            x="50%"
            y="700"
            textAnchor="middle"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            fontSize="44"
            fontWeight="900"
            letterSpacing="0.3em"
            className="font-black select-none uppercase tracking-widest"
          >
            STRENGTH • DISCIPLINE • TRANSFORMATION
          </text>
        </svg>

        {/* Crisp Sport Geometric Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(#d97706 2px, transparent 2px), radial-gradient(#334155 1.5px, transparent 1.5px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 bg-slate-100/90 backdrop-blur-md border-b border-slate-300/80 px-3 sm:px-6 py-2 sm:py-2.5 shadow-xs shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/app-logo.png"
              alt="Kaushik Fitness Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md border border-amber-400/50 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-wider text-slate-900 uppercase">
                  KAUSHIK FITNESS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-500 text-slate-950">
                  Kanker
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Gym Management & Biometric Fitness Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenAppInstall && (
              <button
                onClick={onOpenAppInstall}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ऐप इंस्टॉल करें</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {onOpenEnquiry && (
              <button
                onClick={onOpenEnquiry}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">पूछताछ (Enquiry)</span>
                <span className="sm:hidden">Enquiry</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center gap-6 px-3 py-2 sm:px-6 sm:py-3 min-h-0 overflow-y-auto sm:overflow-hidden">
        {/* Left Side Aesthetic Gym Showcase (Desktop) */}
        <div className="hidden xl:flex flex-col gap-3 max-w-[260px] p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-200/80 shadow-lg text-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono">
              Strength & Cardio Club
            </span>
            <h3 className="font-black text-base text-slate-900 mt-0.5">
              कौशिक फिटनेस कांकेर
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              आधुनिक हैवी वेट्स, डंबल्स, ट्रेडमिल व व्यक्तिगत प्रशिक्षण (PT) के साथ अपनी फिटनेस क्षमता को निखारें।
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px] font-bold text-amber-900">
            <span className="px-2 py-0.5 rounded-md bg-amber-100/80">💪 Heavy Weights</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100/80">🔥 Cardio Zone</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100/80">🏆 PT Training</span>
          </div>
        </div>

        {/* Center Main Login Card */}
        <div className="w-full max-w-[390px] sm:max-w-md bg-white/95 backdrop-blur-md border border-amber-200/70 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-300/50 overflow-hidden flex flex-col my-auto">
          {/* Card Top Banner with Integrated Geofence Info */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Portal Access
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS Active ({geofenceSettings.radiusMeters}m)</span>
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Welcome to Kaushik Fitness
                </h1>
                <p className="text-slate-300 text-[10px] sm:text-[11px]">
                  सुरक्षित 4-अंकीय व्यक्तिगत पिन दर्ज करें
                </p>
              </div>
              <span className="text-[10px] text-amber-400/90 font-bold hidden xs:inline">
                कांकेर परिसर
              </span>
            </div>
          </div>

          {/* GPS Geofence Feedback Toast */}
          {geofenceFeedback && (
            <div className={`mx-3 sm:mx-4 mt-2 p-2 rounded-xl border text-xs flex items-center gap-2.5 font-semibold ${
              geofenceFeedback.status === 'present'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`p-1 rounded-lg ${geofenceFeedback.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {geofenceFeedback.status === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[11px]">
                  {geofenceFeedback.status === 'present' ? 'GPS Verified: उपस्थिति दर्ज (Present)' : 'GPS Alert: परिधि से बाहर (Absent दर्ज)'}
                </div>
                <div className="text-[10px] opacity-85 truncate">{geofenceFeedback.message}</div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {(localError || authError) && (
            <div className="mx-3 sm:mx-4 mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span className="text-[11px] leading-tight">{localError || authError}</span>
            </div>
          )}

          {/* 4-DIGIT PIN LOGIN FORM */}
          <div className="p-3.5 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between text-xs px-1 text-slate-700 font-bold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                4-Digit Security PIN
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Member, Staff & Trainer
              </span>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-2 sm:space-y-2.5">
              <div>
                <input
                  ref={inputRef}
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.6em] sm:tracking-[0.8em] text-2xl sm:text-3xl font-mono font-black py-1.5 sm:py-2 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl sm:rounded-2xl focus:outline-none focus:border-amber-500 text-slate-900 shadow-inner"
                />
              </div>

              {/* On-Screen Touch Keypad */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') setPin((p) => p.slice(0, -1));
                      else if (pin.length < 4) setPin((p) => p + k);
                    }}
                    className={`h-9 sm:h-11 font-mono font-bold text-base sm:text-lg rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      k === 'C'
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 active:bg-rose-300'
                        : k === '⌫'
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 active:bg-slate-400'
                        : 'bg-white hover:bg-slate-100 active:bg-amber-100 text-slate-900 border border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer mt-1"
              >
                <span>{loading ? 'सत्यापित हो रहा है...' : 'पिन सत्यापित करें व प्रवेश करें'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            {/* Mobile App Install & Unified Link Guide */}
            {onOpenAppInstall && (
              <div className="pt-0.5 text-center">
                <button
                  type="button"
                  onClick={onOpenAppInstall}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-amber-700 hover:text-amber-800 font-bold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>📱 मोबाइल में अलग से ऐप (APK) कैसे इंस्टॉल करें? यहाँ देखें</span>
                </button>
              </div>
            )}

            {/* PIN 1111 Self-Registration Prompt */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSelfRegisterModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>नया सदस्य? <b>PIN: 1111</b> दर्ज करें या यहाँ क्लिक करें</span>
              </button>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 sm:py-2 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span>Kaushik Fitness Kanker © 2026</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Secure SHA-256 PIN
            </span>
          </div>
        </div>

        {/* Right Side Smart Features Badge (Desktop) */}
        <div className="hidden xl:flex flex-col gap-3 max-w-[260px] p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-200/80 shadow-lg text-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-amber-400 font-black shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Smart Geofence Active
            </span>
            <h3 className="font-black text-base text-slate-900 mt-0.5">
              डिजिटल उपस्थिति व ट्रैकिंग
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              जिम परिसर में पहुंचते ही पिन द्वारा स्वचालित उपस्थिति दर्ज, मासिक बॉडी इंडेक्स और डिजिटल रसीद सुविधा।
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px] font-bold text-slate-700">
            <span className="px-2 py-0.5 rounded-md bg-slate-100">📍 GPS Verify</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">📊 Body BMI</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">🧾 Instant Slip</span>
          </div>
        </div>
      </main>

      {/* Page Bottom Footer */}
      <footer className="relative z-10 text-center py-1 sm:py-1.5 text-[10px] sm:text-[11px] text-slate-600 border-t border-slate-300/80 bg-slate-100/80 backdrop-blur-xs shrink-0">
        Kaushik Fitness Kanker, Chhattisgarh • Built for Strength, Body Index Tracking & Management
      </footer>

      {/* Member Self-Registration Modal (PIN 1111) */}
      {showSelfRegisterModal && (
        <MemberSelfRegisterModal
          onClose={() => setShowSelfRegisterModal(false)}
        />
      )}
    </div>
  );
};
