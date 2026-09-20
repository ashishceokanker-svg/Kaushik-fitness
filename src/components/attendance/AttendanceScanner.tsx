import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { KeyRound, CheckCircle, AlertCircle, Users, Clock, ShieldCheck, Delete, ArrowRight } from 'lucide-react';

export const AttendanceScanner: React.FC = () => {
  const { attendance, markAttendance, liveGymCount } = useGymData();
  const [pinVal, setPinVal] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; personName?: string } | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayDate);

  const handleDigitPress = (digit: string) => {
    if (pinVal.length < 4) {
      const next = pinVal + digit;
      setPinVal(next);
      if (next.length === 4) {
        submitPin(next);
      }
    }
  };

  const handleDelete = () => {
    setPinVal((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPinVal('');
  };

  const submitPin = (pinToSubmit: string) => {
    if (!pinToSubmit || pinToSubmit.length !== 4) return;
    const result = markAttendance(pinToSubmit, 'pin');
    setFeedback(result);
    setPinVal('');

    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Occupancy Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            फ्रंट डेस्क चेक-इन कियोस्क • PIN Entry Kiosk
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-amber-600" />
            4-Digit PIN Attendance Terminal
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            सदस्य और ट्रेनर अपना 4 अंकों का सुरक्षा पिन दर्ज करके उपस्थिति दर्ज कर सकते हैं।
            चेक-इन और चेक-आउट दोनों ऑटोमैटिक दर्ज होते हैं।
          </p>
        </div>

        {/* Live Gym Occupancy Meter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-600" />
              लाइव फ्लोर उपस्थिति
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="my-2">
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
              {liveGymCount}
              <span className="text-sm font-normal text-slate-500">अंदर उपस्थित</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (liveGymCount / 40) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>अधिकतम क्षमता: 40</span>
            <span className="text-emerald-600 font-bold">{Math.max(0, 40 - liveGymCount)} जगह खाली</span>
          </div>
        </div>
      </div>

      {/* PIN Terminal & Fast Taps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ATM-style Numeric PIN Pad Kiosk */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Enter Your 4-Digit Security PIN
              </span>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                (सदस्य या स्टाफ अपना 4 अंकों का पिन दर्ज करें)
              </p>
            </div>

            {/* Visual PIN Bubbles */}
            <div className="flex justify-center items-center gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = pinVal.length > index;
                return (
                  <div
                    key={index}
                    className={`w-14 h-16 rounded-2xl flex items-center justify-center text-2xl font-mono font-black transition-all duration-200 ${
                      filled
                        ? 'bg-amber-50 border-2 border-amber-500 text-amber-900 shadow-md scale-105'
                        : 'bg-slate-50 border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    {filled ? '●' : '—'}
                  </div>
                );
              })}
            </div>

            {/* Feedback Notification Alert */}
            {feedback && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 border transition-all animate-fade-in ${
                  feedback.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {feedback.success ? 'उपस्थिति दर्ज! ✓ (Verified)' : 'पिन सत्यापन विफल (Failed)'}
                  </div>
                  <div className="text-xs mt-0.5">{feedback.message}</div>
                </div>
              </div>
            )}

            {/* 0-9 Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitPress(digit)}
                  className="h-14 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-amber-100 border border-slate-200 text-slate-900 hover:text-amber-700 text-2xl font-mono font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Clear */}
              <button
                onClick={handleClear}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold uppercase transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>

              {/* Zero */}
              <button
                onClick={() => handleDigitPress('0')}
                className="h-14 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-amber-100 border border-slate-200 text-slate-900 hover:text-amber-700 text-2xl font-mono font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
              >
                0
              </button>

              {/* Backspace */}
              <button
                onClick={handleDelete}
                className="h-14 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                title="हटाएं (Backspace)"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            {/* Manual Keyboard Enter & Submit */}
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="या कीबोर्ड से 4-अंक दर्ज करें"
                value={pinVal}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPinVal(cleaned);
                  if (cleaned.length === 4) submitPin(cleaned);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitPin(pinVal);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm font-mono text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => submitPin(pinVal)}
                disabled={pinVal.length !== 4}
                className="px-5 py-2.5 rounded-xl bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-amber-500 text-white font-black text-xs uppercase transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Submit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Fast PIN Demo & Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              1-क्लिक डेमो चेक-इन टेस्ट (Demo PIN Taps)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              कांकेर जिम सदस्य, ट्रेनर और स्टाफ के पिन का परीक्षण करने के लिए क्लिक करें:
            </p>

            <div className="space-y-2.5">
              {/* Member: Rahul */}
              <button
                onClick={() => submitPin('1111')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900 group-hover:text-amber-600">Rahul Sharma (Member)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 ml-4">Code: KF-2024-001</span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  PIN: 1111
                </span>
              </button>

              {/* Trainer: Vikram */}
              <button
                onClick={() => submitPin('2002')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-400 hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="font-bold text-slate-900 group-hover:text-cyan-700">Coach Vikram Sahu (Trainer)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 ml-4">Staff Code: STF-001</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-1 rounded border border-cyan-200">
                  PIN: 2002
                </span>
              </button>

              {/* Staff: Ramesh */}
              <button
                onClick={() => submitPin('3003')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-900 group-hover:text-amber-700">Ramesh Verma (Front Desk Staff)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 ml-4">Staff Code: STF-2026-03</span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  PIN: 3003
                </span>
              </button>

              {/* Admin: Koushik */}
              <button
                onClick={() => submitPin('1001')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="font-bold text-slate-900">Vaibhav Kaushik (Admin)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 ml-4">Gym Director</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  PIN: 1001
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            आज का पिन चेक-इन लॉग (Today's PIN Entry Activity Log - {todayAttendance.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">दिनांक: {todayDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200 font-bold tracking-wider">
                <th className="py-2.5 px-3">नाम (Name)</th>
                <th className="py-2.5 px-3">प्रकार व कोड</th>
                <th className="py-2.5 px-3">चेक-इन समय</th>
                <th className="py-2.5 px-3">चेक-आउट समय</th>
                <th className="py-2.5 px-3">माध्यम</th>
                <th className="py-2.5 px-3 text-right">फ्लोर स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    आज कोई चेक-इन नहीं हुआ है
                  </td>
                </tr>
              ) : (
                todayAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {record.userName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          record.userType === 'staff'
                            ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {record.userType.toUpperCase()} • {record.memberCode || record.staffCode || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">
                      {record.checkInTime}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-500">
                      {record.checkOutTime || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 font-mono">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        4-DIGIT PIN
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!record.checkOutTime ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Inside Gym
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Left at {record.checkOutTime}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
