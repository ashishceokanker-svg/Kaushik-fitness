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
} from 'lucide-react';

interface LoginPageProps {
  onOpenEnquiry?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenEnquiry }) => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 selection:bg-amber-400 selection:text-slate-900">
      {/* Top Brand Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 shadow-md shadow-amber-500/20 font-black">
              <Dumbbell className="w-6 h-6 text-slate-950" />
            </div>
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

          {onOpenEnquiry && (
            <button
              onClick={onOpenEnquiry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Admission / PT Enquiry (पूछताछ)</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-2 shadow-md shadow-amber-500/20">
                <KeyRound className="w-6 h-6" />
              </div>
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
          </div>

          {/* Card Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kaushik Fitness Kanker © 2026</span>
            <span>Secure SHA-256 PIN</span>
          </div>
        </div>
      </main>

      {/* Page Bottom Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200 bg-white">
        Kaushik Fitness Kanker, Chhattisgarh • Built for Strength, Body Index Tracking & Management
      </footer>
    </div>
  );
};
