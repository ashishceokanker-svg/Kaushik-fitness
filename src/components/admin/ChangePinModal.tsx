import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { KeyRound, ShieldCheck, X, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ChangePinTarget {
  id: string;
  name: string;
  code?: string;
  role?: string;
  currentPin?: string;
}

interface ChangePinModalProps {
  targetUser: ChangePinTarget;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ targetUser, onClose, onSuccess }) => {
  const { changeUserPin } = useGymData();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerateRandom = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(randomPin);
    setConfirmPin(randomPin);
    setErrorMsg(null);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!/^\d{4}$/.test(newPin)) {
      setErrorMsg('कृपया ठीक 4 अंकों का संख्यात्मक पिन (4-digit number) दर्ज करें।');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('पुष्टि पिन (Confirm PIN) मेल नहीं खाता। कृपया पुनः जांचें।');
      return;
    }

    const success = changeUserPin(targetUser.id, newPin);
    if (success) {
      setSuccessMsg(`पिन सफलतापूर्वक बदलकर "${newPin}" कर दिया गया है!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1300);
    } else {
      setErrorMsg('पिन अपडेट करने में विफल। उपयोगकर्ता आईडी मान्य नहीं है।');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                पिन बदलें (Universal PIN Admin)
              </h3>
              <p className="text-[11px] text-slate-300">
                एडमिन मास्टर पिन मैनेजमेंट - कौशिक फिटनेस सेंटर
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSavePin} className="p-6 space-y-5">
          {/* Target User Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">उपयोगकर्ता (User)</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{targetUser.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {targetUser.code ? `${targetUser.code} • ` : ''}
                <span className="capitalize">{targetUser.role || 'Member'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">वर्तमान पिन:</div>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {showCurrentPin ? (targetUser.currentPin || '1234') : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title={showCurrentPin ? 'पिन छुपाएं' : 'पिन देखें'}
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* New PIN inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  नया 4-अंकीय पिन (New 4-Digit PIN) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  रैंडम बनाएं
                </button>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="उदा. 4589"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-black font-mono tracking-widest text-slate-900 bg-white"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                पिन की पुनः पुष्टि करें (Confirm New PIN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="वही 4 अंक पुनः दर्ज करें"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-black font-mono tracking-widest text-slate-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={newPin.length !== 4 || newPin !== confirmPin}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                newPin.length === 4 && newPin === confirmPin
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              पिन सहेजें (Update PIN)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
