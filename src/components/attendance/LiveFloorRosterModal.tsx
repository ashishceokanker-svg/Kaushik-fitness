import React, { useState, useEffect } from 'react';
import { useGymData } from '../../context/GymDataContext';
import {
  X,
  Users,
  Search,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Dumbbell,
  Briefcase,
  Phone,
  Filter,
} from 'lucide-react';
import { MEMBERSHIP_PRICING } from '../../utils/formatters';

interface LiveFloorRosterModalProps {
  onClose: () => void;
}

// Calculate elapsed time from check-in
const calculateElapsed = (checkInTimeStr: string, timestampIso?: string) => {
  let diffMs = 0;
  if (timestampIso) {
    diffMs = Math.max(0, Date.now() - new Date(timestampIso).getTime());
  } else if (checkInTimeStr) {
    const [time, modifier] = checkInTimeStr.split(' ');
    let [hours, minutes] = (time || '00:00').split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const checkInDate = new Date();
    checkInDate.setHours(hours, minutes, 0, 0);
    diffMs = Math.max(0, Date.now() - checkInDate.getTime());
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  let timeText = '';
  if (hours > 0) {
    timeText = `${hours} घंटा ${mins} मिनट`;
  } else {
    timeText = `${mins} मिनट`;
  }

  // If > 2 hours (120 mins), flag as overtime / potentially forgot to checkout
  const isOvertime = totalMinutes >= 120;

  return { totalMinutes, timeText, isOvertime };
};

export const LiveFloorRosterModal: React.FC<LiveFloorRosterModalProps> = ({ onClose }) => {
  const { attendance, members, staff, liveGymCount, checkOutPerson, checkOutAllActive } = useGymData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'members' | 'staff'>('all');

  const todayDate = new Date().toISOString().split('T')[0];

  // People currently on the floor
  const activeOccupants = attendance.filter((a) => a.date === todayDate && !a.checkOutTime);

  // Filtered list
  const filteredOccupants = activeOccupants.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.memberCode && a.memberCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.staffCode && a.staffCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'members') return a.userType === 'member';
    if (filterType === 'staff') return a.userType === 'staff';
    return true;
  });

  const memberCount = activeOccupants.filter((a) => a.userType === 'member').length;
  const staffCount = activeOccupants.filter((a) => a.userType === 'staff').length;

  // Escape key to close
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

  const handleSingleCheckOut = (recordId: string, personName: string) => {
    if (
      confirm(
        `क्या आप ${personName} को लाइव जिम फ्लोर से चेक-आउट / हटाना चाहते हैं?\n(वर्तमान समय पर चेक-आउट दर्ज हो जाएगा)`
      )
    ) {
      checkOutPerson(recordId);
    }
  };

  const handleBulkCheckOut = () => {
    if (
      confirm(
        `⚠️ क्या आप वर्तमान में उपस्थित सभी ${activeOccupants.length} व्यक्तियों को एक साथ चेक-आउट करना चाहते हैं?`
      )
    ) {
      checkOutAllActive();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 pb-12 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto sm:my-0 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  लाइव जिम फ्लोर रोस्टर (Live Gym Floor Roster)
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {liveGymCount} Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                कौशिक फिटनेस - वर्तमान में जिम के अंदर उपस्थित सदस्यों व स्टाफ की रीयल-टाइम सूची
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 shadow-xs transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>बंद करें</span>
          </button>
        </div>

        {/* Capacity Meter Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 px-6 py-3 border-b border-slate-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">फ्लोर क्षमता:</span>{' '}
              <strong className="font-mono text-cyan-300">40 व्यक्ति</strong>
            </div>
            <div>
              <span className="text-slate-400">वर्तमान ऑक्यूपेंसी:</span>{' '}
              <strong className="font-mono text-emerald-300">
                {liveGymCount} ({Math.round((liveGymCount / 40) * 100)}%)
              </strong>
            </div>
            <div>
              <span className="text-slate-400">खाली स्थान:</span>{' '}
              <strong className="font-mono text-amber-300">{Math.max(0, 40 - liveGymCount)}</strong>
            </div>
          </div>

          {activeOccupants.length > 0 && (
            <button
              type="button"
              onClick={handleBulkCheckOut}
              className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              title="सभी उपस्थित लोगों को एक साथ चेक-आउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>सभी को चेक-आउट करें ({activeOccupants.length})</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              सभी उपस्थित ({activeOccupants.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('members')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'members'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              सदस्य ({memberCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('staff')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'staff'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              स्टाफ व कोच ({staffCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, कोड या मोबाइल से खोजें..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>
        </div>

        {/* Occupant Roster Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredOccupants.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                {activeOccupants.length === 0
                  ? 'वर्तमान में कोई भी व्यक्ति जिम फ्लोर पर उपस्थित नहीं है।'
                  : 'खोज के अनुसार कोई व्यक्ति नहीं मिला।'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeOccupants.length === 0
                  ? 'जब भी कोई सदस्य या स्टाफ कियोस्क पर अपना 4-अंकीय पिन दर्ज करेगा, वह यहाँ लाइव दिखेगा।'
                  : 'कृपया कोई अन्य नाम या कोड टाइप करें।'}
              </p>
            </div>
          ) : (
            filteredOccupants.map((record) => {
              const member = members.find(
                (m) =>
                  m.id === record.userId ||
                  m.userId === record.userId ||
                  (record.memberCode && m.memberCode === record.memberCode)
              );

              const staffMember = staff.find(
                (s) =>
                  s.id === record.userId ||
                  s.userId === record.userId ||
                  (record.staffCode && s.staffCode === record.staffCode)
              );

              const avatarUrl = member?.avatarUrl || staffMember?.avatarUrl;
              const phone = member?.phone || staffMember?.phone;
              const { timeText, isOvertime } = calculateElapsed(record.checkInTime, record.timestamp);

              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                    isOvertime
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-white border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  {/* Left: Avatar & Person Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={record.userName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border shadow-xs ${
                          record.userType === 'staff'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-cyan-100 text-cyan-900 border-cyan-300'
                        }`}
                      >
                        {record.userName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm truncate">
                          {record.userName}
                        </h4>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                            record.userType === 'staff'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          }`}
                        >
                          {record.memberCode || record.staffCode || (record.userType === 'staff' ? 'STAFF' : 'MEMBER')}
                        </span>

                        {isOvertime && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>⚠️ लंबा समय (भूल गए?)</span>
                          </span>
                        )}
                      </div>

                      {/* Subtitle: Plan / Designation & Trainer */}
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        {record.userType === 'member' ? (
                          <>
                            <span className="text-cyan-800 font-semibold">
                              {member?.membershipDuration
                                ? MEMBERSHIP_PRICING[member.membershipDuration]?.label
                                : 'Gym Member'}
                            </span>
                            {member?.personalTraining && (
                              <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10.5px]">
                                PT: {member.assignedTrainerName || 'Coach Assigned'}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-800 font-semibold">
                            {staffMember?.designation || 'Gym Floor Staff'}
                          </span>
                        )}

                        {phone && (
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Check-in Time, Elapsed Duration & Check-out Action Button */}
                  <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-500 flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>चेक-इन: <strong className="text-slate-800 font-mono">{record.checkInTime}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        फ्लोर पर:{' '}
                        <strong className={`font-mono ${isOvertime ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                          {timeText}
                        </strong>
                      </div>
                    </div>

                    {/* Check Out / Remove from Floor Button */}
                    <button
                      type="button"
                      onClick={() => handleSingleCheckOut(record.id, record.userName)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                      title={`${record.userName} को फ्लोर से चेक-आउट करें`}
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>फ्लोर से हटाएं</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              लाइव अपडेट सक्रिय है • चेक-आउट करते ही व्यक्ति फ्लोर लिस्ट से हट जाएगा।
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
