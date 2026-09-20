import React, { useState } from 'react';
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

interface LoginPageProps {
  onOpenEnquiry?: () => void;
  onOpenAppInstall?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenEnquiry, onOpenAppInstall }) => {
  const { loginWithCredentials, error: authError } = useAuth();
  
  const [pin, setPin] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [geofenceFeedback, setGeofenceFeedback] = useState<{
    status: 'present' | 'absent';
    message: string;
    distance: string;
  } | null>(null);

  const geofenceSettings = localDb.getGeofenceSettings();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setLocalError('कृपया वैध 4-अंकीय पिन दर्ज करें (Please enter a valid 4-digit PIN)');
      return;
    }
    setLoading(true);
    setLocalError(null);
    setGeofenceFeedback(null);
    try {
      const res = loginWithCredentials(pin);
      if (!res.success) {
        setLocalError(res.message || 'गलत पिन दर्ज किया गया। कृपया सही 4-अंकीय सुरक्षा पिन का उपयोग करें।');
      } else if (res.geofenceResult) {
        setGeofenceFeedback({
          status: res.geofenceResult.status,
          message: res.geofenceResult.message,
          distance: res.geofenceResult.formattedDistance,
        });
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-amber-50/50 to-slate-200/70 flex flex-col justify-between text-slate-800 selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden">
      {/* Decorative Gym Vector Art & Light Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Soft Ambient Light Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-slate-300/35 blur-3xl" />

        {/* Subtle Gym Vector Graphics (Watermarked in subtle athletic tones) */}
        <svg
          className="absolute inset-0 w-full h-full text-slate-500/20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          {/* Top Left Heavy Dumbbell Vector */}
          <g transform="translate(60, 90) rotate(-25) scale(1.35)" stroke="currentColor" strokeWidth="1.5">
            <rect x="0" y="30" width="80" height="12" rx="4" fill="currentColor" fillOpacity="0.08" />
            <rect x="-14" y="10" width="14" height="52" rx="4" fill="currentColor" fillOpacity="0.12" />
            <rect x="-24" y="18" width="10" height="36" rx="3" fill="currentColor" fillOpacity="0.15" />
            <rect x="80" y="10" width="14" height="52" rx="4" fill="currentColor" fillOpacity="0.12" />
            <rect x="94" y="18" width="10" height="36" rx="3" fill="currentColor" fillOpacity="0.15" />
          </g>

          {/* Top Right Olympic Barbell Plates */}
          <g transform="translate(920, 80) rotate(15) scale(1.25)" stroke="currentColor" strokeWidth="1.5">
            <circle cx="60" cy="60" r="50" fill="currentColor" fillOpacity="0.06" />
            <circle cx="60" cy="60" r="36" strokeDasharray="6 4" />
            <circle cx="60" cy="60" r="14" fill="currentColor" fillOpacity="0.15" />
            <line x1="60" y1="0" x2="60" y2="120" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="2" />
          </g>

          {/* Bottom Left Cast Iron Kettlebell */}
          <g transform="translate(80, 500) rotate(10) scale(1.3)" stroke="currentColor" strokeWidth="1.5">
            <circle cx="45" cy="55" r="35" fill="currentColor" fillOpacity="0.08" />
            <path d="M25 25 C25 5, 65 5, 65 25" fill="none" strokeWidth="5" stroke="currentColor" />
            <circle cx="45" cy="55" r="12" fill="currentColor" fillOpacity="0.1" />
          </g>

          {/* Bottom Right Power Dumbbell */}
          <g transform="translate(880, 470) rotate(-35) scale(1.4)" stroke="currentColor" strokeWidth="1.5">
            <rect x="0" y="30" width="90" height="12" rx="4" fill="currentColor" fillOpacity="0.08" />
            <rect x="-16" y="8" width="16" height="56" rx="4" fill="currentColor" fillOpacity="0.12" />
            <rect x="-28" y="16" width="12" height="40" rx="3" fill="currentColor" fillOpacity="0.15" />
            <rect x="90" y="8" width="16" height="56" rx="4" fill="currentColor" fillOpacity="0.12" />
            <rect x="106" y="16" width="12" height="40" rx="3" fill="currentColor" fillOpacity="0.15" />
          </g>

          {/* Center Subtle Heartbeat / Pulse Cardio Wave */}
          <path
            d="M0 380 L350 380 L380 340 L400 420 L430 310 L460 450 L490 360 L520 400 L540 380 L1400 380"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.18"
            strokeDasharray="8 6"
            fill="none"
          />

          {/* Background Motivational Typography Watermark */}
          <text
            x="50%"
            y="260"
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.03"
            fontSize="80"
            fontWeight="900"
            letterSpacing="0.25em"
            className="font-black select-none uppercase tracking-widest"
          >
            KAUSHIK FITNESS
          </text>
          <text
            x="50%"
            y="650"
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.035"
            fontSize="44"
            fontWeight="900"
            letterSpacing="0.3em"
            className="font-black select-none uppercase tracking-widest"
          >
            STRENGTH • POWER • DISCIPLINE
          </text>
        </svg>

        {/* Diagonal Athletic Mesh Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#d97706 1.5px, transparent 1.5px), radial-gradient(#0f172a 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/app-logo.png"
              alt="Kaushik Fitness Logo"
              className="w-11 h-11 rounded-2xl shadow-md border border-amber-400/50 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-slate-900 uppercase">
                  KAUSHIK FITNESS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950">
                  Kanker
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Gym Management & Biometric Fitness Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAppInstall && (
              <button
                onClick={onOpenAppInstall}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">ऐप इंस्टॉल करें (Install App)</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {onOpenEnquiry && (
              <button
                onClick={onOpenEnquiry}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Admission / PT Enquiry (पूछताछ)</span>
                <span className="sm:hidden">Enquiry</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-amber-200/70 rounded-3xl shadow-2xl shadow-slate-300/60 overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Access
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Welcome to Kaushik Fitness
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              सुरक्षित 4-अंकीय व्यक्तिगत पिन दर्ज करें
            </p>
          </div>

          {/* Location & GPS Indicator */}
          <div className="bg-slate-900/95 text-slate-300 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">कांकेर जिम परिसर ({geofenceSettings.radiusMeters}m Geofence)</span>
            </div>
            <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS Active
            </span>
          </div>

          {/* GPS Geofence Feedback Toast */}
          {geofenceFeedback && (
            <div className={`mx-6 mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-3 font-semibold ${
              geofenceFeedback.status === 'present'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`p-1.5 rounded-xl ${geofenceFeedback.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {geofenceFeedback.status === 'present' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs">
                  {geofenceFeedback.status === 'present' ? 'GPS Verified: उपस्थिति दर्ज (Present)' : 'GPS Alert: परिधि से बाहर (Absent दर्ज)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">{geofenceFeedback.message}</div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {(localError || authError) && (
            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* 4-DIGIT PIN LOGIN FORM */}
          <div className="p-6 sm:p-7 space-y-5">
            <div className="text-center">
              <img
                src="/app-logo.png"
                alt="Kaushik Fitness Logo"
                className="w-14 h-14 rounded-2xl shadow-lg border-2 border-amber-400/60 mx-auto mb-2.5 object-cover"
              />
              <h3 className="font-black text-lg text-slate-900">4-Digit Security PIN</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Staff, Trainer & Member Check-In
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-[0.8em] text-3xl font-mono font-black py-3 px-4 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-amber-500 text-slate-900 shadow-inner"
                />
              </div>

              {/* On-Screen Touch Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') setPin((p) => p.slice(0, -1));
                      else if (pin.length < 4) setPin((p) => p + k);
                    }}
                    className={`py-3 font-mono font-bold text-lg rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      k === 'C'
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        : k === '⌫'
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-white hover:bg-slate-100 active:bg-amber-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all mt-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'सत्यापित हो रहा है...' : 'पिन सत्यापित करें व प्रवेश करें'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile App Install & Unified Link Guide */}
            {onOpenAppInstall && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenAppInstall}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-bold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>📱 मोबाइल में अलग से ऐप (APK) कैसे इंस्टॉल करें? यहाँ देखें</span>
                </button>
              </div>
            )}
          </div>

          {/* Card Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kaushik Fitness Kanker © 2026</span>
            <span>Secure SHA-256 PIN</span>
          </div>
        </div>
      </main>

      {/* Page Bottom Footer */}
      <footer className="relative z-10 text-center py-3.5 text-xs text-slate-600 border-t border-slate-200/80 bg-white/75 backdrop-blur-xs">
        Kaushik Fitness Kanker, Chhattisgarh • Built for Strength, Body Index Tracking & Management
      </footer>
    </div>
  );
};
