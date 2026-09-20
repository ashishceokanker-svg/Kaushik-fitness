import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { calculateCountdown, formatDate, formatINR, generateWhatsAppReminderUrl } from '../../utils/formatters';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCheck,
  Send,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export const PaymentReminders: React.FC = () => {
  const { members } = useGymData();
  const [sentReminders, setSentReminders] = useState<Record<string, string>>({});

  // Members requiring reminder: expiring soon (<= 7 days), expired, or has pending dues
  const reminderMembers = members.filter((m) => {
    const cd = calculateCountdown(m.expiryDate);
    return cd.isExpired || cd.isExpiringSoon || (m.dueAmount && m.dueAmount > 0);
  });

  const handleSendSimulatedSMS = (memberId: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setSentReminders((prev) => ({
      ...prev,
      [memberId]: `SMS भेजा गया (${timeStr})`,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
            <Bell className="w-4 h-4 text-amber-600" />
            Automated Alert & WhatsApp Notification Dispatcher
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            सदस्यता समाप्ति व फीस बकाया अलर्ट (Payment Reminders)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            सदस्यता समाप्त होने से पहले 1-क्लिक सीधा व्हाट्सएप रिमाइंडर एवं एसएमएस नोटिफिकेशन भेजें।
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4">
          <div>
            <div className="text-xs text-amber-800 uppercase font-bold">ध्यान देने योग्य (Action Required)</div>
            <div className="text-2xl font-black text-amber-900 font-mono">
              {reminderMembers.length} <span className="text-xs font-normal text-amber-700">सदस्य</span>
            </div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* Reminder Cards Grid */}
      {reminderMembers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <CheckCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">सभी सदस्यताएं सक्रिय व अप-टू-डेट हैं!</h3>
          <p className="text-xs text-slate-500 mt-1">अगले 7 दिनों में किसी की सदस्यता समाप्त नहीं हो रही है और न ही कोई बकाया है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminderMembers.map((member) => {
            const cd = calculateCountdown(member.expiryDate);
            const isSent = !!sentReminders[member.id];

            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                  cd.isExpired
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : cd.isExpiringSoon
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-900 text-sm">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                        <span className="font-mono text-xs text-slate-500">{member.phone}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                        cd.isExpired
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                      }`}
                    >
                      {cd.isExpired ? 'समय समाप्त (Expired)' : `${cd.days} दिन शेष (Days Left)`}
                    </span>
                  </div>

                  {/* Countdown Box */}
                  <div className="my-3">
                    <ExpirationCountdown expiryDate={member.expiryDate} variant="card" />
                  </div>

                  {/* Payment Details */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 my-3">
                    <div className="flex justify-between text-slate-600">
                      <span>समाप्ति तिथि (Expiry Date):</span>
                      <strong className="text-slate-900">{formatDate(member.expiryDate)}</strong>
                    </div>
                    {member.dueAmount > 0 && (
                      <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
                        <span>बकाया फीस (Pending Due):</span>
                        <strong className="font-mono">{formatINR(member.dueAmount)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>UPI पेमेंट आईडी:</span>
                      <span className="font-mono text-cyan-800 font-bold">koushikfitness@upi</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isSent ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        {sentReminders[member.id]}
                      </span>
                    ) : (
                      'आज अलर्ट नहीं भेजा गया'
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Simulated SMS */}
                    <button
                      onClick={() => handleSendSimulatedSMS(member.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    >
                      <Send className="w-3.5 h-3.5" />
                      SMS भेजें
                    </button>

                    {/* WhatsApp 1-Click Trigger */}
                    <a
                      href={generateWhatsAppReminderUrl(
                        member.name,
                        member.phone,
                        cd.days,
                        member.expiryDate,
                        member.dueAmount
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp अलर्ट
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
