import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import {
  X,
  Dumbbell,
  Shield,
  User,
  KeyRound,
  Phone,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { loginWithCredentials, switchRole, loginAsSpecificMember } = useAuth();
  const { members } = useGymData();

  const [portalType, setPortalType] = useState<'member' | 'staff'>('member');
  const [identifier, setIdentifier] = useState('9826112345');
  const [password, setPassword] = useState('1111');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Escape key handler
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginWithCredentials(identifier.trim(), password.trim());
    if (res.success) {
      setSuccessMsg(res.message || 'लॉगिन सफल!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.message || 'लॉगिन विफल। कृपया सही विवरण दर्ज करें।');
    }
  };

  const handleInstantMemberSelect = (profileId: string) => {
    loginAsSpecificMember(profileId);
    setSuccessMsg('Member Portal me successfully login ho gaye!');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 pb-16 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto sm:my-0 overflow-hidden text-slate-900">
        {/* Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500" />

        {/* Header */}
        <div className="flex justify-between items-start pt-1">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Dumbbell className="w-3 h-3 text-amber-600" /> Kaushik Fitness Kanker
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gym Login Portal (लॉगिन पोर्टल)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              अपना मोबाइल नंबर या 4-अंकों का पिन डालकर लॉगिन करें
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Member vs Staff */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => {
              setPortalType('member');
              setIdentifier('9826112345');
              setPassword('1111');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalType === 'member'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Member Login (सदस्य)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalType('staff');
              setIdentifier('koushik@koushikfitness.com');
              setPassword('admin123');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalType === 'staff'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Staff & Admin (मालिक)</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {portalType === 'member'
                ? 'मोबाइल नंबर या मेंबर कोड (Mobile No. or Code)'
                : 'ईमेल या मोबाइल नंबर'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={portalType === 'member' ? 'उदा. 9826112345 या KF-2024-001' : 'koushik@koushikfitness.com'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {portalType === 'member' ? '4-Digit Entry PIN (4-अंकों का पिन)' : 'पासवर्ड (Password)'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="• • • •"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-slate-900 tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            {portalType === 'member' && (
              <span className="text-[11px] text-slate-500 mt-1 block">
                💡 डेमो मेंबर राहुल का PIN <strong className="text-amber-800 font-mono">1111</strong> है
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>पोर्टल में लॉगिन करें &rarr;</span>
          </button>
        </form>

        {/* 1-CLICK INSTANT DEMO LOGIN LIST (Especially for Members) */}
        {portalType === 'member' ? (
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider block">
              ⚡ बिना टाइप किए 1-क्लिक फास्ट लॉगिन:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleInstantMemberSelect(m.id)}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between group hover:bg-emerald-50/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-xs font-black text-cyan-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {m.memberCode} • PIN: {m.pin}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              1-Click स्टाफ डेमो लॉगिन:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-bold text-amber-900">👑 Vaibhav Kaushik</div>
                <div className="text-[10px] text-slate-500">Gym Owner & Admin</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchRole('trainer');
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-bold text-cyan-900">🥊 Vikram Sahu</div>
                <div className="text-[10px] text-slate-500">Head Coach & Trainer</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
