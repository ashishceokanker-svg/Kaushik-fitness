import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localDb } from '../../db/localDatabase';
import {
  getSimulationMode,
  setSimulationMode,
  SimulationMode,
} from '../../utils/geolocation';
import {
  Dumbbell,
  Shield,
  Award,
  User,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ClipboardList,
  MapPin,
  CheckCircle2,
  Navigation,
  CodeXml,
} from 'lucide-react';

interface LoginPageProps {
  onOpenEnquiry?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenEnquiry }) => {
  const { loginWithCredentials, error: authError } = useAuth();
  
  const [pin, setPin] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [simMode, setSimMode] = useState<SimulationMode>(getSimulationMode());
  const [geofenceFeedback, setGeofenceFeedback] = useState<{
    status: 'present' | 'absent';
    message: string;
    distance: string;
  } | null>(null);

  const geofenceSettings = localDb.getGeofenceSettings();

  const handleSimModeChange = (mode: SimulationMode) => {
    setSimulationMode(mode);
    setSimMode(mode);
    setGeofenceFeedback(null);
  };

  // 1-1 Demo accounts per role with 4-digit PINs
  const demoAccounts = [
    {
      role: 'admin' as const,
      title: 'Admin (संचालक)',
      name: 'Vaibhav Kaushik',
      desc: 'Full administrative access, staff salary payroll, reports & system finances',
      pin: '1001',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
      icon: Shield,
    },
    {
      role: 'trainer' as const,
      title: 'Trainer (प्रशिक्षक)',
      name: 'Vikram Sahu',
      desc: 'Assigned PT clients, client progress charts, add & modify workout & diet plans',
      pin: '2002',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      btnColor: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      icon: Award,
    },
    {
      role: 'staff' as const,
      title: 'Staff (कर्मचारी)',
      name: 'Ramesh Verma',
      desc: 'Member fee collection & entry, instant receipt generation, attendance, supplement POS',
      pin: '3003',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      icon: ClipboardList,
    },
    {
      role: 'member' as const,
      title: 'Member (सदस्य)',
      name: 'Rahul Sharma',
      desc: 'Visual progress charts, custom diet & workout routines, 4-digit PIN pass',
      pin: '1111',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: User,
    },
    {
      role: 'admin' as const,
      title: 'Developer (CEO)',
      name: 'Ashish Dey',
      desc: 'Chief Executive Officer (CEO) • Full web & mobile app access, master administrative controls',
      pin: '9975',
      badgeColor: 'bg-cyan-100 text-cyan-950 border-cyan-300',
      btnColor: 'bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 hover:brightness-110 text-white',
      icon: CodeXml,
    },
  ];

  const handleSelectDemoPin = (accPin: string) => {
    setPin(accPin);
    setLocalError(null);
    setGeofenceFeedback(null);
    setLoading(true);
    try {
      const res = loginWithCredentials(accPin);
      if (!res.success) {
        setLocalError(res.message || 'Login failed. Please check credentials.');
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
        setLocalError(res.message || 'गलत पिन दर्ज किया गया। कृपया 1001 (Admin), 2002 (Trainer), 3003 (Staff), या 1111 (Member) का उपयोग करें।');
      } else if (res.geofenceResult) {
        setGeofenceFeedback({
          status: res.geofenceResult.status,
          message: res.geofenceResult.message,
          distance: res.geofenceResult.formattedDistance,
        });
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 selection:bg-amber-400 selection:text-slate-900">
      {/* Top Brand Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Admission / PT Enquiry (पूछताछ)</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-8 py-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Staff, Trainer & Member Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome to Kaushik Fitness
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                लॉगिन करें और अपना डैशबोर्ड, उपस्थिति या वर्कआउट/डाइट प्लान देखें।
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Secure 4-Digit PIN / Password</span>
            </div>
          </div>

          {/* GPS Geofence Info & Simulator Bar */}
          <div className="bg-slate-900 text-slate-100 px-6 py-3 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wide text-slate-100 uppercase text-[11px]">
                    Gym GPS Geofence (कांकेर)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                    Radius: {geofenceSettings.radiusMeters}m
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {geofenceSettings.gymAddress} ({geofenceSettings.latitude.toFixed(4)}° N, {geofenceSettings.longitude.toFixed(4)}° E)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase px-1.5">GPS Test:</span>
              <button
                type="button"
                onClick={() => handleSimModeChange('inside')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  simMode === 'inside'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🟢 Inside (~45m &rarr; Present)
              </button>
              <button
                type="button"
                onClick={() => handleSimModeChange('outside')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  simMode === 'outside'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔴 Outside (~2.4km &rarr; Absent)
              </button>
              <button
                type="button"
                onClick={() => handleSimModeChange('real')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  simMode === 'real'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📡 Device GPS
              </button>
            </div>
          </div>

          {/* GPS Geofence Feedback Toast */}
          {geofenceFeedback && (
            <div className={`mx-6 mt-4 p-4 rounded-2xl border text-xs flex items-center gap-3 font-semibold ${
              geofenceFeedback.status === 'present'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`p-2 rounded-xl ${geofenceFeedback.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {geofenceFeedback.status === 'present' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-black text-sm">
                  {geofenceFeedback.status === 'present' ? 'GPS Geofence Verified: उपस्थिति दर्ज (Present)' : 'GPS Geofence Alert: परिधि से बाहर (Absent दर्ज)'}
                </div>
                <div className="text-xs mt-0.5">{geofenceFeedback.message}</div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {(localError || authError) && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* MAIN 4-DIGIT PIN LOGIN INTERFACE (EXCLUSIVE) */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: 4-Digit PIN Keypad & Form (5 cols on lg) */}
              <div className="lg:col-span-5 bg-slate-50/80 p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/20">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-xl text-slate-900">4-Digit Access PIN</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    अपना 4-अंकीय व्यक्तिगत सुरक्षा पिन दर्ज करें
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      Security Check-In PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      autoFocus
                      className="w-full text-center tracking-[1em] text-3xl font-mono font-black py-3 px-4 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-amber-500 text-slate-900 shadow-inner"
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

              {/* Right Side: Demo Accounts with Live PINs & Quick Fill (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>डेमो लॉगिन पिन कोड्स (Demo PIN Passwords)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      परीक्षण हेतु नीचे दिए गए किसी भी रोल के पिन पर क्लिक करके तुरंत लॉगिन करें:
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px] font-bold self-start sm:self-auto">
                    4 Demo PINs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {demoAccounts.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <div
                        key={acc.role}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-xl border ${acc.badgeColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {(acc.role === 'staff' || acc.role === 'trainer') && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5" title="GPS Attendance">
                                  <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                  <span>GPS</span>
                                </span>
                              )}
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                                {acc.role.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                            {acc.name}
                          </h4>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {acc.title}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                            {acc.desc}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">PIN:</span>
                            <span className="text-base font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 tracking-wider">
                              {acc.pin}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectDemoPin(acc.pin)}
                            disabled={loading}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95 ${acc.btnColor}`}
                          >
                            <span>लॉगिन</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>सुरक्षा टिप:</strong> सदस्य और कर्मचारी कियोस्क पर अपना 4-अंकीय पिन टाइप करके बिना पासवर्ड या ओटीपी के सीधे उपस्थित दर्ज कर सकते हैं व डैशबोर्ड देख सकते हैं।
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Kaushik Fitness Kanker © 2026 • Dedicated Physical Training System</span>
            <div className="flex items-center gap-4">
              <span>Security: SHA-256 / JWT PIN Session</span>
            </div>
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
