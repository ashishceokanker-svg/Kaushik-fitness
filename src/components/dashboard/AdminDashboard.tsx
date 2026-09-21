import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { formatINR, formatDate, calculateCountdown, generateWhatsAppReminderUrl } from '../../utils/formatters';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import { localDb } from '../../db/localDatabase';
import { AdminProfileModal } from '../admin/AdminProfileModal';
import { LiveFloorRosterModal } from '../attendance/LiveFloorRosterModal';
import {
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  UserPlus,
  QrCode,
  Receipt,
  MessageSquare,
  ChevronRight,
  Database,
  Award,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Building,
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck,
  MapPin,
  ShoppingBag,
  Phone,
  Edit,
  CodeXml,
  Cloud,
  Package,
  LogOut,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenRegister: () => void;
  onOpenCloudDatabase?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenCloudDatabase,
}) => {
  const { currentUser } = useAuth();
  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLiveFloorModalOpen, setIsLiveFloorModalOpen] = useState(false);
  const [activeFloorTab, setActiveFloorTab] = useState<'on_floor' | 'all_today'>('on_floor');
  const {
    isCloudSynced,
    members,
    totalActiveMembers,
    liveGymCount,
    totalMonthlyRevenue,
    totalPendingDues,
    expiringSoonMembers,
    attendance,
    transactions,
    staff,
    checkOutPerson,
  } = useGymData();

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayDate);
  const recentTransactions = transactions.slice(-4).reverse();

  // Separate trainers and regular staff
  const trainers = staff.filter((s) => s.role === 'trainer' || s.staffType === 'instructor');
  const regularStaff = staff.filter((s) => s.role === 'staff' || s.staffType === 'regular');

  // Fetch staff login logs from DB
  const loginLogs = localDb.getStaffLoginLogs();
  const latestTrainerLog = loginLogs.find((l) => l.role === 'trainer' || l.staffType === 'instructor');
  const latestStaffLog = loginLogs.find((l) => l.role === 'staff' || l.staffType === 'regular');

  // Salary information for current month
  const currentMonthKey = '2026-09';
  const salaryPayments = localDb.getSalaryPayments().filter((p) => p.month === currentMonthKey);
  const totalSalaryLiability = staff.reduce((sum, s) => sum + (s.salaryMonthly || 0), 0);
  const totalSalaryPaid = salaryPayments.reduce((sum, p) => sum + (p.status === 'paid' ? p.totalPaid : 0), 0);
  const pendingSalary = Math.max(0, totalSalaryLiability - totalSalaryPaid);

  // Today's staff-collected fees
  const todayStaffIncome = transactions
    .filter((t) => t.type === 'revenue' && t.date.startsWith(todayDate))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Clean Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl font-black text-amber-900 shadow-sm shrink-0">
                {(currentUser?.name || 'Admin').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Chief Director & Admin Command Console
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentUser?.name || 'Vaibhav Kaushik'} (Admin Portal)
                </h1>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="एडमिन प्रोफ़ाइल संपादित करें (नाम, पता, फोटो, फोन)"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-700" />
                  <span>✏️ प्रोफाइल एडिट करें</span>
                </button>
              </div>

              {/* Admin Contact & Address Details */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                <span className="flex items-center gap-1 text-slate-700 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {currentUser?.phone || '9826189001'}
                </span>
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 truncate max-w-md">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  {currentUser?.address || 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isDeveloper && onOpenCloudDatabase && (
              <button
                onClick={onOpenCloudDatabase}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer border ${
                  isCloudSynced
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title="Firebase Firestore Cloud Live Sync"
              >
                <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{isCloudSynced ? '🟢 Firebase Live' : '☁️ Cloud Setup'}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('developer')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer border border-cyan-500/30"
            >
              <CodeXml className="w-3.5 h-3.5 text-cyan-300" />
              👨‍💻 Developer (Ashish Dey)
            </button>
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + New Member
            </button>
            <button
              onClick={() => onNavigate('staff_calendar')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              उपस्थिति कैलेंडर (P/A/L)
            </button>
            <button
              onClick={() => onNavigate('salary')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              वेतन भुगतान (Salary)
            </button>
            {isDeveloper && (
              <button
                onClick={() => onNavigate('database')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-cyan-600" />
                SQL Database
              </button>
            )}
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              PIN Kiosk
            </button>
            <button
              onClick={() => onNavigate('supplements')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
              सप्लीमेंट्स POS
            </button>
          </div>
        </div>
      </div>

      {/* Admin All Tools Hub - Clean 1-Tap Access to ALL Features */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                एडमिन कंट्रोल सेंटर • सभी विकल्प (Admin All Tools & Modules)
              </h3>
              <p className="text-[10.5px] text-slate-500">
                1-टैप में सीधे किसी भी विभाग या फीचर पर पहुँचें
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">
            11 Tools Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {/* 1. Members Directory */}
          <button
            onClick={() => onNavigate('members')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">
                {members.length}
              </span>
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">सदस्य डायरेक्टरी</div>
              <div className="text-[10px] text-slate-500">Members & Profiles</div>
            </div>
          </button>

          {/* 2. New Registration */}
          <button
            onClick={onOpenRegister}
            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-slate-950 text-amber-400 group-hover:scale-105 transition-transform w-fit">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-950">+ नया सदस्य</div>
              <div className="text-[10px] text-slate-900 font-bold">Register Member</div>
            </div>
          </button>

          {/* 3. PIN Attendance Kiosk */}
          <button
            onClick={() => onNavigate('attendance')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-900 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-950">
                {liveGymCount} live
              </span>
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">अटेंडेंस कियोस्क</div>
              <div className="text-[10px] text-slate-500">PIN Entry Floor</div>
            </div>
          </button>

          {/* 4. Supplements & POS */}
          <button
            onClick={() => onNavigate('supplements')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-purple-100 text-purple-900 group-hover:scale-105 transition-transform w-fit">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">Supplement Store</div>
              <div className="text-[10px] text-slate-500">Stock & Inventory POS</div>
            </div>
          </button>

          {/* 5. Financial Reports & Fees */}
          <button
            onClick={() => onNavigate('finance')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 group-hover:scale-105 transition-transform w-fit">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">वित्तीय रिपोर्ट</div>
              <div className="text-[10px] text-slate-500">Fees & Accounts</div>
            </div>
          </button>

          {/* 6. Gym Enquiries & Leads */}
          <button
            onClick={() => onNavigate('enquiries')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-900 group-hover:scale-105 transition-transform w-fit">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">जिम पूछताछ</div>
              <div className="text-[10px] text-slate-500">Admission Leads</div>
            </div>
          </button>

          {/* 7. Staff & PT Trainers */}
          <button
            onClick={() => onNavigate('staff')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-900 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-950">
                {staff.length}
              </span>
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">स्टाफ व ट्रेनर</div>
              <div className="text-[10px] text-slate-500">Staff Management</div>
            </div>
          </button>

          {/* 8. Staff Calendar P/A/L */}
          <button
            onClick={() => onNavigate('staff_calendar')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-900 group-hover:scale-105 transition-transform w-fit">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">हाजिरी कैलेंडर</div>
              <div className="text-[10px] text-slate-500">Staff P/A/L Calendar</div>
            </div>
          </button>

          {/* 9. Salary Payroll */}
          <button
            onClick={() => onNavigate('salary')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="p-2 rounded-lg bg-rose-100 text-rose-900 group-hover:scale-105 transition-transform w-fit">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">वेतन भुगतान</div>
              <div className="text-[10px] text-slate-500">Salary & Payroll</div>
            </div>
          </button>

          {/* 10. Payment Reminders */}
          <button
            onClick={() => onNavigate('reminders')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-900 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              {expiringSoonMembers.length > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white animate-pulse">
                  {expiringSoonMembers.length}
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">फीस रिमाइंडर्स</div>
              <div className="text-[10px] text-slate-500">Due Expirations</div>
            </div>
          </button>

          {/* 11. Membership & PT Plans Management */}
          <button
            onClick={() => onNavigate('plans')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">
                CRUD
              </span>
            </div>
            <div className="mt-2">
              <div className="font-black text-xs text-slate-900">Membership & PT Plans</div>
              <div className="text-[10px] text-slate-500">Packages & Rates</div>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Members */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white border border-slate-200 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">Total Active Members</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform border border-amber-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {totalActiveMembers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{members.length} पंजीकृत सदस्य</span>
            <ChevronRight className="w-3 h-3 text-amber-600" />
          </div>
        </div>

        {/* Live Gym Occupancy */}
        <div
          onClick={() => setIsLiveFloorModalOpen(true)}
          className="bg-white border border-slate-200 hover:border-cyan-400 p-5 rounded-2xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">Live Gym Floor</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform border border-cyan-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2 flex items-baseline gap-2">
            {liveGymCount}
            <span className="text-xs font-normal text-slate-500">वर्तमान में उपस्थित</span>
          </div>
          <div className="text-[11px] text-cyan-700 font-bold mt-1 flex items-center justify-between">
            <span>रोस्टर देखें व हटाएं &rarr;</span>
            <span className="text-slate-400 font-normal">({todayAttendance.length} आज कुल)</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          onClick={() => onNavigate('finance')}
          className="bg-white border border-slate-200 hover:border-emerald-400 p-5 rounded-2xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">Monthly Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {formatINR(totalMonthlyRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            सदस्यता व PT फीस सम्मिलित
          </div>
        </div>

        {/* Pending Dues */}
        <div
          onClick={() => onNavigate('reminders')}
          className="bg-white border border-slate-200 hover:border-rose-400 p-5 rounded-2xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">Pending Dues</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform border border-rose-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono mt-2">
            {formatINR(totalPendingDues)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{expiringSoonMembers.length} की फीस जल्द समाप्त</span>
            <ChevronRight className="w-3 h-3 text-rose-600" />
          </div>
        </div>
      </div>

      {/* DISTINCT SECTION: SEPARATE TRAINER & STAFF PANELS ON ADMIN DASHBOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            स्टाफ व ट्रेनर अलग-अलग स्थिति (Staff & Trainer Separate Status)
          </h2>
          <button
            onClick={() => onNavigate('staff_logs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            सभी ऑटो-लॉगिन रिपोर्ट देखें &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: TRAINER LOGIN & ROSTER PANEL */}
          <div className="bg-white border border-cyan-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-900 font-black">
                  <Award className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    ट्रेनर लॉगिन पैनल (Trainer Instructor)
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-0.5">
                    {trainers[0]?.name || 'Vikram Sahu'}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Active Trainer
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">असाइन किए गए PT सदस्य:</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {members.filter((m) => m.personalTraining).length} सदस्य
                </span>
                <span className="text-[10px] text-cyan-600 font-semibold">1, 3, 6 माह PT पैकेज</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">ट्रेनर मासिक वेतन:</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {formatINR(trainers[0]?.salaryMonthly || 25000)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">पेरोल सक्रिय</span>
              </div>
            </div>

            {/* Latest Trainer Login Activity */}
            <div className="bg-cyan-50/50 border border-cyan-200/60 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold flex items-center gap-1.5 text-cyan-900">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  अंतिम ट्रेनर लॉगिन रिपोर्ट:
                </span>
                <span className="text-[11px] font-mono text-cyan-800">
                  {latestTrainerLog ? formatDate(latestTrainerLog.loginTime) : 'आज 07:00 AM'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                लॉगिन विधि: {latestTrainerLog?.loginMethod.toUpperCase() || 'PIN (2002)'} • {latestTrainerLog?.deviceInfo || 'Duty Kiosk'}
              </div>
            </div>

            {/* Quick Button to Staff/Trainer Details */}
            <button
              onClick={() => onNavigate('staff')}
              className="w-full py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs rounded-xl border border-cyan-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ट्रेनर PT क्लाइंट्स व प्रोफाइल देखें &rarr;
            </button>
          </div>

          {/* Card 2: STAFF LOGIN & FEE COUNTER PANEL */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-black">
                  <CreditCard className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    स्टाफ लॉगिन पैनल (Front Desk Staff)
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-0.5">
                    {regularStaff[0]?.name || 'Ramesh Verma'}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                Front Desk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">आज की फीस वसूली:</span>
                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                  {formatINR(todayStaffIncome)}
                </span>
                <span className="text-[10px] text-slate-500">काउंटर एंट्रीज</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">स्टाफ मासिक वेतन:</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {formatINR(regularStaff[0]?.salaryMonthly || 18000)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">पेरोल सक्रिय</span>
              </div>
            </div>

            {/* Latest Staff Login Activity */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  अंतिम स्टाफ लॉगिन रिपोर्ट:
                </span>
                <span className="text-[11px] font-mono text-amber-800">
                  {latestStaffLog ? formatDate(latestStaffLog.loginTime) : 'आज 08:30 AM'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                लॉगिन विधि: {latestStaffLog?.loginMethod.toUpperCase() || 'PIN (3003)'} • {latestStaffLog?.deviceInfo || 'Front Desk Console'}
              </div>
            </div>

            {/* Quick Button to Staff Salary */}
            <button
              onClick={() => onNavigate('salary')}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              स्टाफ वेतन भुगतान व विवरण देखें &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* STAFF & TRAINER MONTHLY ATTENDANCE CALENDAR QUICK ACCESS */}
      <div className="bg-white border border-cyan-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 uppercase">
                स्टाफ व ट्रेनर उपस्थिति कैलेंडर (Attendance Calendar)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-600" />
                GPS Geofence: 150m परिधि सक्रिय
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-lg">
              मासिक कैलेंडर ग्रिड: Absent (A), Present (P) एवं Leave (L)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ट्रेनर विक्रम साहू व स्टाफ रमेश वर्मा का दैनिक GPS सत्यापन, लेट/समय पर चेक-इन, छुट्टी व साप्ताहिक अवकाश रिपोर्ट
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('staff_calendar')}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>उपस्थिति कैलेंडर देखें</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* MONTHLY SALARY & PAYROLL QUICK ACCESS CARD FOR ADMIN */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
              कर्मचारी मासिक वेतन व पेरोल (Staff Salary Management)
            </div>
            <h3 className="font-black text-slate-900 text-lg mt-0.5">
              सितंबर 2026 वेतन स्थिति: {formatINR(totalSalaryPaid)} भुगतान किया गया
            </h3>
            <p className="text-xs text-slate-500">
              कुल देय वेतन: {formatINR(totalSalaryLiability)} • बकाया: {formatINR(pendingSalary)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('salary')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>वेतन भुगतान व मासिक रिपोर्ट</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Expiry Alerts & WhatsApp Reminders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                जल्द समाप्त होने वाली सदस्यताएं (Memberships Expiring Soon &le; 7 Days)
              </h3>
              <p className="text-xs text-slate-500">काउंटडाउन और सीधा व्हाट्सएप नवीनीकरण रिमाइंडर</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reminders')}
            className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            सभी रिमाइंडर्स देखें &rarr;
          </button>
        </div>

        {expiringSoonMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            अगले 7 दिनों में किसी सदस्य की सदस्यता समाप्त नहीं हो रही है!
          </div>
        ) : (
          <div className="space-y-3">
            {expiringSoonMembers.slice(0, 3).map((member) => {
              const cd = calculateCountdown(member.expiryDate);
              return (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {member.name}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {member.memberCode}
                      </span>
                      {member.personalTraining && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 font-bold border border-cyan-200">
                          PT Client
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      फोन: {member.phone} • वैधता: {formatDate(member.expiryDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <ExpirationCountdown expiryDate={member.expiryDate} variant="badge" />

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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp Reminder
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions & Floor Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              हालिया वित्तीय लेन-देन (Recent Transactions)
            </h3>
            <button
              onClick={() => onNavigate('finance')}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
            >
              खाताबही देखें &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{tx.description}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(tx.date)} • {tx.paymentMethod.toUpperCase()}
                  </div>
                </div>
                <span
                  className={`font-mono font-bold ${
                    tx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'revenue' ? '+' : '-'} {formatINR(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attendance Activity & Floor Roster Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                लाइव फ्लोर उपस्थिति (Floor Attendance)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLiveFloorModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="पूरा लाइव फ्लोर रोस्टर देखें"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-600" />
                  <span>रोस्टर सूची ({liveGymCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
                >
                  कियोस्क लॉग &rarr;
                </button>
              </div>
            </div>

            {/* Tab switchers */}
            <div className="flex border-b border-slate-200 space-x-2 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveFloorTab('on_floor')}
                className={`pb-2 px-2 font-bold transition-all cursor-pointer border-b-2 ${
                  activeFloorTab === 'on_floor'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                🔴 फ्लोर पर उपस्थित ({todayAttendance.filter((a) => !a.checkOutTime).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFloorTab('all_today')}
                className={`pb-2 px-2 font-bold transition-all cursor-pointer border-b-2 ${
                  activeFloorTab === 'all_today'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                आज के सभी लॉग्स ({todayAttendance.length})
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activeFloorTab === 'on_floor' ? (
                todayAttendance.filter((a) => !a.checkOutTime).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    वर्तमान में कोई भी व्यक्ति जिम फ्लोर पर उपस्थित नहीं है।
                  </div>
                ) : (
                  todayAttendance
                    .filter((a) => !a.checkOutTime)
                    .map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-cyan-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                              att.userType === 'staff'
                                ? 'bg-amber-100 text-amber-900 border-amber-200'
                                : 'bg-cyan-100 text-cyan-900 border-cyan-200'
                            }`}
                          >
                            {att.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{att.userName}</span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                                {att.memberCode || att.staffCode || (att.userType === 'staff' ? 'STAFF' : 'MEM')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              In: <strong className="text-slate-700 font-mono">{att.checkInTime}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            On Floor
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`क्या आप ${att.userName} को लाइव जिम फ्लोर से चेक-आउट करना चाहते हैं?`)) {
                                checkOutPerson(att.id);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="फ्लोर से हटाएं / चेक-आउट"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-600" />
                            <span>हटाएं</span>
                          </button>
                        </div>
                      </div>
                    ))
                )
              ) : todayAttendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  आज अभी तक कोई चेक-इन नहीं हुआ है
                </div>
              ) : (
                todayAttendance.slice(0, 6).map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px] shrink-0">
                        {att.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{att.userName}</div>
                        <div className="text-[11px] text-slate-500">
                          In: {att.checkInTime} {att.checkOutTime && `• Out: ${att.checkOutTime}`}
                        </div>
                      </div>
                    </div>

                    {!att.checkOutTime ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`क्या आप ${att.userName} को लाइव जिम फ्लोर से चेक-आउट करना चाहते हैं?`)) {
                            checkOutPerson(att.id);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="फ्लोर से हटाएं"
                      >
                        <LogOut className="w-3 h-3 text-rose-600" />
                        <span>हटाएं</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Out: {att.checkOutTime}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Gym Floor Roster Modal */}
      {isLiveFloorModalOpen && (
        <LiveFloorRosterModal onClose={() => setIsLiveFloorModalOpen(false)} />
      )}

      {/* Admin Profile Edit Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
