import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { localDb } from '../../db/localDatabase';
import { StaffDailyAttendance } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { MemberFeeEntryModal } from '../finance/MemberFeeEntryModal';
import {
  CreditCard,
  DollarSign,
  Users,
  AlertCircle,
  PlusCircle,
  Search,
  CheckCircle,
  CheckCircle2,
  Receipt,
  Printer,
  Clock,
  UserCheck,
  MapPin,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Package,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { staff, members, transactions, attendance, markAttendance, checkOutPerson, checkOutByUserId } = useGymData();

  // Find staff info
  const staffMember =
    staff.find((s) => s.id === currentUser?.staffId) ||
    staff.find((s) => s.role === 'staff') ||
    staff[2];

  // Fee entry modal state
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedMemberForFee, setSelectedMemberForFee] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dues' | 'active'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Today's Fee Collections
  const todayTransactions = transactions.filter(
    (t) => t.type === 'revenue' && t.date.startsWith(todayStr)
  );
  const todayTotalCollected = todayTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Month collections
  const currentMonthStr = todayStr.substring(0, 7); // e.g. "2026-09"
  const monthTransactions = transactions.filter(
    (t) => t.type === 'revenue' && t.date.startsWith(currentMonthStr)
  );
  const monthTotalCollected = monthTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Members with dues
  const membersWithDues = members.filter((m) => (m.dueAmount || 0) > 0);
  const totalPendingDues = membersWithDues.reduce((acc, m) => acc + (m.dueAmount || 0), 0);

  // Active members count
  const activeMembersCount = members.filter((m) => m.active).length;

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'dues') return (m.dueAmount || 0) > 0;
    if (statusFilter === 'active') return m.active;
    return true;
  });

  const handleOpenFeeModal = (memberId?: string) => {
    setSelectedMemberForFee(memberId);
    setIsFeeModalOpen(true);
  };

  const handlePrintSlip = (tx: any) => {
    setSelectedReceipt(tx);
  };

  // Staff Geofenced Attendance State
  const [staffAttendance, setStaffAttendance] = useState<StaffDailyAttendance | undefined>(() => {
    const today = new Date().toISOString().split('T')[0];
    const staffId = currentUser?.staffId || currentUser?.id || 'usr-3';
    return localDb.getStaffDailyAttendance().find((a) => (a.staffId === staffId || a.staffId === 'usr-3') && a.date === today);
  });
  const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null);

  // Find active live gym floor occupancy record for this staff
  const staffFloorRecord = attendance.find(
    (a) =>
      (a.userId === staffMember?.id ||
        a.userId === currentUser?.id ||
        (staffMember?.staffCode && a.staffCode === staffMember.staffCode) ||
        a.userName.trim().toLowerCase() === (staffMember?.name || '').trim().toLowerCase()) &&
      a.date === todayStr &&
      !a.checkOutTime
  );
  const isStaffOnLiveFloor = !!staffFloorRecord;

  const handleDutyAction = (action: 'login' | 'logout') => {
    const staffId = currentUser?.staffId || currentUser?.id || 'usr-3';
    const staffName = staffMember?.name || currentUser?.name || 'Ramesh Verma';
    const res = localDb.recordGeofencedAttendance(staffId, staffName, 'staff', action);
    const today = new Date().toISOString().split('T')[0];
    const updated = localDb.getStaffDailyAttendance().find((a) => (a.staffId === staffId || a.staffId === 'usr-3') && a.date === today);
    setStaffAttendance(updated);

    // Sync with Live Gym Floor Attendance
    if (action === 'logout') {
      if (staffFloorRecord) {
        checkOutPerson(staffFloorRecord.id);
      } else {
        checkOutByUserId(staffId);
        if (staffMember?.name) checkOutByUserId(staffMember.name);
      }
    } else {
      if (!staffFloorRecord) {
        markAttendance(staffMember?.pin || staffMember?.staffCode || staffId);
      }
    }

    setAttendanceMsg(res.message);
    setTimeout(() => setAttendanceMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Staff Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {staffMember?.avatarUrl ? (
              <img
                src={staffMember.avatarUrl}
                alt={staffMember.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl font-black text-amber-800 shadow-sm">
                {staffMember?.name ? staffMember.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Front Desk & Accounts Portal • Staff ID: {staffMember?.staffCode || 'STF-01'}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {staffMember?.name || 'Staff User'}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {staffMember?.designation || 'Front Desk & Accounts Executive'} • Kaushik Fitness Kanker
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenFeeModal()}
              className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + नई फीस जमा करें (Collect Fee)
            </button>
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  Attendance Kiosk
                </button>
                <button
                  onClick={() => onNavigate('enquiries')}
                  className="flex items-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Gym Enquiries / Leads
                </button>
                <button
                  onClick={() => onNavigate('supplements')}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  सप्लीमेंट्स सेल व स्टॉक (Supplements POS)
                </button>
                <button
                  onClick={() => onNavigate('plans')}
                  className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
                >
                  <Package className="w-4 h-4 text-slate-950" />
                  📦 प्लान्स व पैकेज (Plans)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* GPS Attendance Banner for Staff */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
            staffAttendance?.status === 'present'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                GPS Geofence Duty Attendance
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                staffAttendance?.status === 'present'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : staffAttendance?.status === 'absent'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {staffAttendance ? (staffAttendance.status === 'present' ? 'P - उपस्थित (Verified)' : `${staffAttendance.status.toUpperCase()} - परिधि से बाहर`) : 'Not Checked In'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
              <span>चेक-इन: <strong className="text-white font-mono">{staffAttendance?.checkInTime || 'लॉगिन नहीं हुआ'}</strong></span>
              {staffAttendance?.checkOutTime && (
                <>
                  <span>•</span>
                  <span>चेक-आउट: <strong className="text-amber-400 font-mono">{staffAttendance.checkOutTime}</strong></span>
                </>
              )}
              {staffAttendance?.distanceMeters !== undefined && (
                <>
                  <span>•</span>
                  <span>जिम से दूरी: <strong className="text-emerald-400 font-mono">{staffAttendance.distanceMeters}m</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Gym Floor status badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs ${
            isStaffOnLiveFloor
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isStaffOnLiveFloor ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`} />
            <span className="font-semibold text-[11px]">
              {isStaffOnLiveFloor ? 'फ्लोर पर उपस्थित' : 'फ्लोर से बाहर'}
            </span>
            {isStaffOnLiveFloor && (
              <button
                type="button"
                onClick={() => {
                  if (staffFloorRecord) checkOutPerson(staffFloorRecord.id);
                  else {
                    const staffId = currentUser?.staffId || currentUser?.id || 'usr-3';
                    checkOutByUserId(staffId);
                    if (staffMember?.name) checkOutByUserId(staffMember.name);
                  }
                }}
                className="ml-1 px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                title="लाइव फ्लोर से चेक-आउट करें"
              >
                फ्लोर हटाएं
              </button>
            )}
          </div>

          {staffAttendance?.checkInTime && !staffAttendance?.checkOutTime ? (
            <button
              onClick={() => handleDutyAction('logout')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ड्यूटी चेक-आउट (Clock Out)</span>
            </button>
          ) : (
            <button
              onClick={() => handleDutyAction('login')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{staffAttendance ? 'पुनः GPS चेक-इन' : 'GPS ड्यूटी चेक-इन (Clock In)'}</span>
            </button>
          )}
        </div>
      </div>

      {attendanceMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{attendanceMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">आज का कुल कलेक्शन</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatINR(todayTotalCollected)}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {todayTransactions.length} लेनदेन आज दर्ज
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* This Month's Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">इस माह की फीस प्राप्त</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatINR(monthTotalCollected)}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {monthTransactions.length} कुल भुगतान इस माह
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">बकाया फीस (Pending Dues)</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {formatINR(totalPendingDues)}
            </div>
            <span className="text-xs text-rose-600 font-semibold mt-0.5 block">
              {membersWithDues.length} सदस्यों का बकाया बाकी
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">सक्रिय सदस्य (Active)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {activeMembersCount} / {members.length}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              जिम में पंजीकृत कुल सदस्य
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area: Quick Member Fee Collection & Recent Payment Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Member Fee Entry & Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  सदस्य फीस एंट्री डेस्क (Quick Member Fee Register)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  सदस्य खोजें और 'फीस जमा करें' पर क्लिक कर रसीद जनरेट करें
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  सभी ({members.length})
                </button>
                <button
                  onClick={() => setStatusFilter('dues')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'dues'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  बकायादार ({membersWithDues.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'active'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  सक्रिय ({activeMembersCount})
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="नाम, मोबाइल नंबर या मेम्बर कोड (MEM-...) से खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Member List Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">सदस्य</th>
                    <th className="py-2.5 px-3">पैकेज / अवधि</th>
                    <th className="py-2.5 px-3">एक्सपायरी</th>
                    <th className="py-2.5 px-3 text-right">बकाया राशि</th>
                    <th className="py-2.5 px-3 text-center">एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        कोई सदस्य नहीं मिला
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const hasDue = (member.dueAmount || 0) > 0;
                      const isExpired = new Date(member.expiryDate) < new Date();

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{member.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {member.memberCode} • {member.phone}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {member.membershipDuration?.replace('_', ' ').toUpperCase()}
                            </span>
                            {member.personalTraining && (
                              <span className="ml-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                                PT
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-xs text-slate-600">{formatDate(member.expiryDate)}</div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                isExpired
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isExpired ? 'Expired' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {hasDue ? (
                              <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                                {formatINR(member.dueAmount || 0)}
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                कोई बकाया नहीं
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleOpenFeeModal(member.id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              फीस लें
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Payments & Print Slips */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                हालिया फीस भुगतान (Recent Payments)
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                आज / इस माह
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {monthTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  इस माह कोई फीस भुगतान दर्ज नहीं है
                </div>
              ) : (
                monthTransactions.slice(0, 8).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">
                        {tx.description}
                      </div>
                      <div className="font-black text-emerald-600 text-sm">
                        +{formatINR(tx.amount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] uppercase font-bold text-slate-600">
                          {tx.paymentMethod?.toUpperCase()}
                        </span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                      <button
                        onClick={() => handlePrintSlip(tx)}
                        className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer text-[11px]"
                      >
                        <Printer className="w-3 h-3" />
                        रसीद प्रिंट
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Staff Checklist / Info */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              स्टाफ गाइडलाइन (Staff Desk Rules)
            </div>
            <ul className="space-y-1 text-slate-700 list-disc list-inside">
              <li>हर फीस भुगतान के बाद रसीद अवश्य निकालें या UPI कन्फर्मेशन चेक करें।</li>
              <li>नए सदस्य के समय आधार कार्ड और फोन नंबर वेरिफाई करें।</li>
              <li>पर्सनल ट्रेनिंग फीस सीधे ट्रेनर को न देकर रिसेप्शन काउंटर पर जमा करें।</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Member Fee Entry Modal */}
      {isFeeModalOpen && (
        <MemberFeeEntryModal
          isOpen={isFeeModalOpen}
          onClose={() => {
            setIsFeeModalOpen(false);
            setSelectedMemberForFee(undefined);
          }}
          preselectedMemberId={selectedMemberForFee}
        />
      )}

      {/* Printable Receipt View Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="printable-fee-receipt" className="printable-content bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">फीस भुगतान रसीद</h3>
                <p className="text-xs text-slate-500 font-mono">Kaushik Fitness Kanker</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold print:hidden"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">विवरण:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">दिनांक:</span>
                <span>{formatDate(selectedReceipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">माध्यम:</span>
                <span className="uppercase font-bold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between text-sm">
                <span className="font-bold text-slate-900">कुल जमा राशि:</span>
                <span className="font-black text-emerald-600">{formatINR(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                रसीद प्रिंट करें (Print)
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
