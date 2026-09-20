import React, { useState, useEffect } from 'react';
import { calculateCountdown, CountdownResult } from '../../utils/formatters';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface ExpirationCountdownProps {
  expiryDate: string;
  variant?: 'compact' | 'card' | 'badge';
  showSeconds?: boolean;
}

export const ExpirationCountdown: React.FC<ExpirationCountdownProps> = ({
  expiryDate,
  variant = 'card',
  showSeconds = true,
}) => {
  const [countdown, setCountdown] = useState<CountdownResult>(() => calculateCountdown(expiryDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(expiryDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (variant === 'badge') {
    if (countdown.isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
          <AlertCircle className="w-3.5 h-3.5" />
          Expired (समाप्त)
        </span>
      );
    }
    if (countdown.isExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse shadow-sm shadow-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          {countdown.days} Din Baki (Expiring Soon)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        {countdown.days} Din Active (सक्रिय)
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs font-bold ${
        countdown.isExpired
          ? 'text-red-400'
          : countdown.isExpiringSoon
          ? 'text-amber-400'
          : 'text-emerald-400'
      }`}>
        <Clock className="w-3.5 h-3.5" />
        {countdown.isExpired ? (
          <span>Expired - Renewal Required</span>
        ) : (
          <span>
            {countdown.days} Din {countdown.hours} Ghante baki ({countdown.days}d {countdown.hours}h {countdown.minutes}m left)
          </span>
        )}
      </div>
    );
  }

  // Large Card variant with light attractive design matching Trainer Panel
  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
      countdown.isExpired
        ? 'bg-red-50/70 border-red-200'
        : countdown.isExpiringSoon
        ? 'bg-amber-50/70 border-amber-300 shadow-amber-500/5'
        : 'bg-white border-slate-200'
    }`}>
      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            countdown.isExpired 
              ? 'bg-red-100 text-red-700' 
              : countdown.isExpiringSoon 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-cyan-100 text-cyan-800'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              {countdown.isExpired
                ? 'Membership Expired (सदस्यता समाप्त)'
                : countdown.isExpiringSoon
                ? 'Attention: Expiring Soon (जल्द समाप्त हो रही है)'
                : 'Active Membership (सक्रिय सदस्यता)'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {countdown.isExpired
                ? 'Kripya reception se apna plan renew karwayein.'
                : `${countdown.days} Din abhi aapke pass baki hain.`}
            </span>
          </div>
        </div>

        {countdown.isExpired ? (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-600 text-white shadow-sm">
            Expired
          </span>
        ) : countdown.isExpiringSoon ? (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500 text-slate-950 shadow-sm animate-pulse">
            {countdown.days} Din Baki!
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Active ({countdown.days} Din)
          </span>
        )}
      </div>

      {countdown.isExpired ? (
        <div className="py-3 text-center bg-red-100/60 rounded-xl border border-red-200">
          <p className="text-sm font-bold text-red-800">Aapki gym membership expire ho chuki hai!</p>
          <p className="text-xs text-red-600 mt-1">Gym enter karne ke liye kripya front desk par renew karein ya WhatsApp karein.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* Days */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {countdown.days}
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-bold mt-1">
              Din <span className="text-[9px] text-slate-400 block">(Days)</span>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {countdown.hours}
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-bold mt-1">
              Ghante <span className="text-[9px] text-slate-400 block">(Hours)</span>
            </div>
          </div>

          {/* Minutes */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {countdown.minutes}
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-bold mt-1">
              Minat <span className="text-[9px] text-slate-400 block">(Mins)</span>
            </div>
          </div>

          {/* Seconds */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              countdown.isExpiringSoon ? 'text-amber-600' : 'text-cyan-700'
            }`}>
              {countdown.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-bold mt-1">
              Sec <span className="text-[9px] text-slate-400 block">(Secs)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
