import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  Phone,
  Clock,
  TrendingUp,
  Download,
  Check,
} from 'lucide-react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { Member, Staff } from '../../types';
import { getEffectiveAvatar } from '../../utils/animatedAvatars';

interface TrainerGoswaraReportProps {
  onBack?: () => void;
}

export const TrainerGoswaraReport: React.FC<TrainerGoswaraReportProps> = ({ onBack }) => {
  const { members, attendance, staff } = useGymData();
  const { currentUser, role } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDuration, setFilterDuration] = useState<'all' | '1_month' | '2_months' | '3_months'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Identify current trainer
  const trainer =
    staff.find(
      (s) =>
        s.id === currentUser?.staffId ||
        s.id === currentUser?.id ||
        (s.userId && s.userId === currentUser?.id) ||
        (s.phone && s.phone === currentUser?.phone)
    ) ||
    staff.find((s) => s.role === 'trainer' && s.staffType === 'instructor') ||
    staff.find((s) => s.role === 'trainer') ||
    staff[0];

  // Strictly assigned clients for this trainer (or all if admin)
  const isMemberAssigned = (m: Member, t: Staff) => {
    if (!m || !t) return false;
    if (m.assignedTrainerId) {
      if (m.assignedTrainerId === t.id) return true;
      if (t.userId && m.assignedTrainerId === t.userId) return true;
    }
    if (m.assignedTrainerName && t.name) {
      if (m.assignedTrainerName.trim().toLowerCase() === t.name.trim().toLowerCase()) return true;
    }
    return false;
  };

  const assignedClients =
    role === 'admin'
      ? members.filter((m) => m.personalTraining)
      : members.filter((m) => isMemberAssigned(m, trainer));

  const todayDate = new Date().toISOString().split('T')[0];

  // Build complete Goswara data for each client
  const clientGoswaraList = assignedClients.map((client) => {
    // 1. Matched attendance records
    const clientAttLogs = attendance.filter((a) => {
      if (!a) return false;
      if (a.userId && (a.userId === client.id || a.userId === client.userId)) return true;
      const aNum = (a.userId || '').replace('mem-', '').replace('prof-', '').replace('usr-', '');
      const cNum = (client.id || '').replace('mem-', '').replace('prof-', '').replace('usr-', '');
      if (aNum && cNum && aNum === cNum) return true;
      if (a.memberCode && client.memberCode && a.memberCode.trim().toLowerCase() === client.memberCode.trim().toLowerCase()) return true;
      if (a.userName && client.name && a.userName.trim().toLowerCase() === client.name.trim().toLowerCase()) return true;
      if ((a as any).pin && client.pin && (a as any).pin === client.pin) return true;
      return false;
    });

    const attendedDatesMap = new Map<string, typeof clientAttLogs[0]>();
    clientAttLogs.forEach((l) => {
      if (l.date && !attendedDatesMap.has(l.date)) {
        attendedDatesMap.set(l.date, l);
      }
    });

    const attendedCount = attendedDatesMap.size;
    const ptMonthsTotal = client.ptDuration === '3_months' ? 3 : client.ptDuration === '2_months' ? 2 : 1;
    const ptMonthlyQuota = client.ptSessionsTotal ? Math.round(client.ptSessionsTotal / ptMonthsTotal) : 12;
    const totalSessions = client.ptSessionsTotal || ptMonthlyQuota * ptMonthsTotal;
    const remainingSessions = Math.max(0, totalSessions - attendedCount);
    const sessionPct = Math.min(100, Math.round((attendedCount / totalSessions) * 100));
    const isAttendedToday = attendedDatesMap.has(todayDate);

    // Calculate cycle start date
    const rawJoinDate = client.joiningDate || (client as any).joinDate || todayDate;
    const clientJoiningClean = (rawJoinDate ? rawJoinDate.split('T')[0] : todayDate) || todayDate;

    let [jY, jM, jD] = clientJoiningClean.split('-').map(Number);
    if (!jY || isNaN(jY)) jY = new Date().getFullYear();
    if (!jM || isNaN(jM)) jM = new Date().getMonth() + 1;
    if (!jD || isNaN(jD)) jD = new Date().getDate();

    let curCycleStart = new Date(jY, jM - 1, jD);
    const nowObj = new Date();
    const cycleEnd = new Date(jY, jM - 1 + ptMonthsTotal, jD);

    if (nowObj > cycleEnd) {
      while (new Date(curCycleStart.getFullYear(), curCycleStart.getMonth() + ptMonthsTotal, jD) < nowObj) {
        curCycleStart = new Date(curCycleStart.getFullYear(), curCycleStart.getMonth() + ptMonthsTotal, jD);
      }
    }

    // Generate Month 1, Month 2, Month 3 periods
    const periods = Array.from({ length: ptMonthsTotal }).map((_, idx) => {
      const pStart = new Date(curCycleStart.getFullYear(), curCycleStart.getMonth() + idx, curCycleStart.getDate());
      const pEnd = new Date(curCycleStart.getFullYear(), curCycleStart.getMonth() + idx + 1, curCycleStart.getDate());
      pEnd.setDate(pEnd.getDate() - 1);

      const sStr = `${pStart.getFullYear()}-${String(pStart.getMonth() + 1).padStart(2, '0')}-${String(pStart.getDate()).padStart(2, '0')}`;
      const eStr = `${pEnd.getFullYear()}-${String(pEnd.getMonth() + 1).padStart(2, '0')}-${String(pEnd.getDate()).padStart(2, '0')}`;

      const attendedInPeriod = Array.from(attendedDatesMap.keys()).filter((d) => d >= sStr && d <= eStr);
      const mCount = attendedInPeriod.length;

      return {
        monthNum: idx + 1,
        startDateStr: sStr,
        endDateStr: eStr,
        quota: ptMonthlyQuota,
        attended: mCount,
        remaining: Math.max(0, ptMonthlyQuota - mCount),
        pct: Math.min(100, Math.round((mCount / ptMonthlyQuota) * 100)),
        isCurrent: todayDate >= sStr && todayDate <= eStr,
      };
    });

    return {
      client,
      ptMonthsTotal,
      ptMonthlyQuota,
      totalSessions,
      attendedCount,
      remainingSessions,
      sessionPct,
      isAttendedToday,
      todayTime: attendedDatesMap.get(todayDate)?.checkInTime,
      periods,
      cycleStartStr: `${curCycleStart.getFullYear()}-${String(curCycleStart.getMonth() + 1).padStart(2, '0')}-${String(curCycleStart.getDate()).padStart(2, '0')}`,
      status: sessionPct >= 100 ? 'completed' : 'active',
    };
  });

  // Filter clients
  const filteredList = clientGoswaraList.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.client.name.toLowerCase().includes(q) ||
      (item.client.phone && item.client.phone.includes(q)) ||
      (item.client.memberCode && item.client.memberCode.toLowerCase().includes(q));

    const matchesDuration =
      filterDuration === 'all' ||
      (filterDuration === '1_month' && item.ptMonthsTotal === 1) ||
      (filterDuration === '2_months' && item.ptMonthsTotal === 2) ||
      (filterDuration === '3_months' && item.ptMonthsTotal === 3);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.status === 'active') ||
      (filterStatus === 'completed' && item.status === 'completed');

    return matchesSearch && matchesDuration && matchesStatus;
  });

  // Overall statistics
  const totalAssignedClients = clientGoswaraList.length;
  const totalAllocatedSessions = clientGoswaraList.reduce((acc, c) => acc + c.totalSessions, 0);
  const totalAttendedSessions = clientGoswaraList.reduce((acc, c) => acc + c.attendedCount, 0);
  const totalRemainingSessions = clientGoswaraList.reduce((acc, c) => acc + c.remainingSessions, 0);
  const overallAvgPct = totalAllocatedSessions > 0 ? Math.round((totalAttendedSessions / totalAllocatedSessions) * 100) : 0;
  const todayAttendedCount = clientGoswaraList.filter((c) => c.isAttendedToday).length;

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'क्र.सं. (Sr No)',
      'सदस्य का नाम (Member Name)',
      'सदस्य कोड (Member Code)',
      'मोबाइल नंबर (Mobile Phone)',
      'पीटी पैकेज (PT Package)',
      'साइकिल शुरुआत तिथि (Start Date)',
      'कुल सत्र कोटा (Total Sessions)',
      'उपस्थित सत्र (Attended)',
      'शेष सत्र (Remaining)',
      'उपस्थिति दर (Attendance %)',
      'माह 1 (Month 1 Attended/Quota)',
      'माह 2 (Month 2 Attended/Quota)',
      'माह 3 (Month 3 Attended/Quota)',
      'आज की उपस्थिति (Today Check-In)',
      'पैकेज स्थिति (Status)',
    ];

    const rows = filteredList.map((item, idx) => {
      const m1 = item.periods[0] ? `${item.periods[0].attended}/${item.periods[0].quota}` : 'N/A';
      const m2 = item.periods[1] ? `${item.periods[1].attended}/${item.periods[1].quota}` : 'N/A';
      const m3 = item.periods[2] ? `${item.periods[2].attended}/${item.periods[2].quota}` : 'N/A';
      const todayText = item.isAttendedToday ? `उपस्थित (${item.todayTime || 'In'})` : 'अनुपस्थित';
      const statusText = item.status === 'completed' ? 'पूर्ण (Completed)' : 'प्रगति पर (In Progress)';

      return [
        idx + 1,
        `"${item.client.name.replace(/"/g, '""')}"`,
        `"${item.client.memberCode}"`,
        `"${item.client.phone}"`,
        `"${item.ptMonthsTotal} Month PT (${item.totalSessions} Sessions)"`,
        `"${item.cycleStartStr}"`,
        item.totalSessions,
        item.attendedCount,
        item.remainingSessions,
        `"${item.sessionPct}%"`,
        `"${m1}"`,
        `"${m2}"`,
        `"${m3}"`,
        `"${todayText}"`,
        `"${statusText}"`,
      ].join(',');
    });

    // Grand total row
    const totalRow = [
      'कुल योग (Grand Total)',
      `"${totalAssignedClients} मेंबर्स"`,
      '""',
      '""',
      '""',
      '""',
      totalAllocatedSessions,
      totalAttendedSessions,
      totalRemainingSessions,
      `"${overallAvgPct}%"`,
      '""',
      '""',
      '""',
      `"${todayAttendedCount} आज उपस्थित"`,
      '""',
    ].join(',');

    const csvContent = '\uFEFF' + [headers.join(','), ...rows, totalRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTrainerName = (trainer?.name || 'Trainer').replace(/\s+/g, '_');
    link.setAttribute('download', `Kaushik_Fitness_PT_Goswara_${cleanTrainerName}_${todayDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('✅ पीटी गोशवारा एक्सेल (CSV) सफलतापूर्वक डाउनलोड हो गई!');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Export to PDF via clean browser print
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Styles for Crisp A4 Landscape Document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-goswara-report, #printable-goswara-report * {
            visibility: visible;
          }
          #printable-goswara-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 10px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Non-Printable) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                title="पीछे जाएं"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
                पीटी अटेंडेंस गोशवारा रिपोर्ट • PT Goswara Abstract
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{trainer?.name || 'कोच'} के मेंबर्स का पीटी गोशवारा</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                  {filteredList.length} क्लाइंट्स
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                सभी असाइन किए गए पर्सनल ट्रेनिंग सदस्यों का माह-वार सत्र विवरण, उपस्थिति दर एवं डिजिटल डाउनलोड।
              </p>
            </div>
          </div>

          {/* Action Buttons: Excel & PDF */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>एक्सेल (Excel/CSV) डाउनलोड</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>पीडीएफ़ / प्रिंट (PDF)</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {downloadSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Printable Report Wrapper */}
      <div id="printable-goswara-report" className="space-y-5">
        {/* Print Header (Visible in print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
                KAUSHIK FITNESS GYM & HEALTH CLUB
              </h1>
              <p className="text-xs text-slate-600">
                मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) • फोन: 9826189001
              </p>
              <h2 className="text-sm font-black text-cyan-900 mt-1 uppercase">
                व्यक्तिगत प्रशिक्षण (PT) अटेंडेंस व सत्र गोशवारा पत्रक
              </h2>
            </div>
            <div className="text-right text-xs">
              <div><strong>ट्रेनर/कोच:</strong> {trainer?.name} ({trainer?.designation})</div>
              <div><strong>दिनांक:</strong> {new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div><strong>कुल क्लाइंट्स:</strong> {assignedClients.length}</div>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">कुल पीटी मेंबर्स</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalAssignedClients}</div>
            <span className="text-[10px] text-slate-400 font-medium">Assigned Athletes</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 shadow-2xs">
            <span className="text-[10px] text-cyan-800 font-bold uppercase block">कुल आवंटित सत्र</span>
            <div className="text-2xl font-black text-cyan-900 font-mono mt-0.5">{totalAllocatedSessions}</div>
            <span className="text-[10px] text-cyan-700 font-medium">Total PT Sessions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">उपस्थित सत्र (Attended)</span>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{totalAttendedSessions}</div>
            <span className="text-[10px] text-emerald-700 font-medium">{overallAvgPct}% पूर्णता दर</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
            <span className="text-[10px] text-amber-800 font-bold uppercase block">शेष सत्र (Remaining)</span>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">{totalRemainingSessions}</div>
            <span className="text-[10px] text-amber-700 font-medium">Pending Sessions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-teal-800 font-bold uppercase block">आज उपस्थित (Today)</span>
            <div className="text-2xl font-black text-teal-900 font-mono mt-0.5">{todayAttendedCount} / {totalAssignedClients}</div>
            <span className="text-[10px] text-teal-700 font-medium">Check-In Today</span>
          </div>
        </div>

        {/* Filter & Search Bar (Non-Printable) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between no-print">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="मेंबर का नाम, मोबाइल नंबर या कोड खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">सभी पैकेज अवधि</option>
              <option value="1_month">1 माह पैकेज</option>
              <option value="2_months">2 माह पैकेज</option>
              <option value="3_months">3 माह पैकेज</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">सभी स्थिति</option>
              <option value="active">प्रगति पर (In Progress)</option>
              <option value="completed">पूर्ण (Completed)</option>
            </select>
          </div>
        </div>

        {/* Goswara Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black uppercase border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">सदस्य का नाम एवं विवरण</th>
                  <th className="py-3 px-3">पीटी पैकेज</th>
                  <th className="py-3 px-3 text-center">कुल सत्र</th>
                  <th className="py-3 px-3 text-center">उपस्थित</th>
                  <th className="py-3 px-3 text-center">शेष</th>
                  <th className="py-3 px-3 text-center">प्रगति %</th>
                  <th className="py-3 px-3 text-center">माह 1</th>
                  <th className="py-3 px-3 text-center">माह 2</th>
                  <th className="py-3 px-3 text-center">माह 3</th>
                  <th className="py-3 px-3 text-center">आज की स्थिति</th>
                  <th className="py-3 px-3 text-center">पैकेज स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-500 font-medium">
                      कोई पीटी मेंबर रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const avatar = getEffectiveAvatar(item.client.avatarUrl, item.client.gender, item.client.name);
                    const m1 = item.periods[0];
                    const m2 = item.periods[1];
                    const m3 = item.periods[2];

                    return (
                      <tr key={item.client.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={avatar}
                              alt={item.client.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{item.client.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="text-cyan-700 font-bold">{item.client.memberCode}</span>
                                <span>•</span>
                                <span>{item.client.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">
                            {item.ptMonthsTotal} Month PT
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            साइकिल: {item.cycleStartStr}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {item.totalSessions}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-black text-emerald-700">
                          {item.attendedCount}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                          {item.remainingSessions}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-cyan-800 text-xs">{item.sessionPct}%</span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-cyan-600 h-full rounded-full"
                                style={{ width: `${item.sessionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Month 1 */}
                        <td className="py-3 px-3 text-center font-mono">
                          {m1 ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              m1.attended >= m1.quota
                                ? 'bg-emerald-100 text-emerald-900'
                                : m1.isCurrent
                                ? 'bg-cyan-100 text-cyan-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m1.attended}/{m1.quota}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Month 2 */}
                        <td className="py-3 px-3 text-center font-mono">
                          {m2 ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              m2.attended >= m2.quota
                                ? 'bg-emerald-100 text-emerald-900'
                                : m2.isCurrent
                                ? 'bg-cyan-100 text-cyan-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m2.attended}/{m2.quota}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Month 3 */}
                        <td className="py-3 px-3 text-center font-mono">
                          {m3 ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              m3.attended >= m3.quota
                                ? 'bg-emerald-100 text-emerald-900'
                                : m3.isCurrent
                                ? 'bg-cyan-100 text-cyan-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m3.attended}/{m3.quota}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Today's Check-In Status */}
                        <td className="py-3 px-3 text-center">
                          {item.isAttendedToday ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{item.todayTime || 'In'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              <span>अनुपस्थित</span>
                            </span>
                          )}
                        </td>

                        {/* Package Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {item.status === 'completed' ? 'पूर्ण' : 'प्रगति पर'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Grand Total Row */}
                {filteredList.length > 0 && (
                  <tr className="bg-amber-100/70 font-black text-slate-950 border-t-2 border-amber-300">
                    <td className="py-3 px-3 text-center uppercase" colSpan={3}>
                      कुल योग (Grand Total Summary) • {filteredList.length} मेंबर्स
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black">
                      {totalAllocatedSessions} सत्र
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-emerald-800">
                      {totalAttendedSessions} सत्र
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-amber-800">
                      {totalRemainingSessions} सत्र
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-cyan-900">
                      {overallAvgPct}%
                    </td>
                    <td className="py-3 px-3 text-center" colSpan={3}>
                      <span className="text-[11px] font-bold text-slate-700">
                        {todayAttendedCount} आज जिम में उपस्थित
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center" colSpan={2}>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">
                        Active PT Roster
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Signatures Block (Visible only in print) */}
        <div className="hidden print:flex justify-between items-end pt-12 text-xs font-bold text-slate-900">
          <div className="text-center">
            <div className="w-48 border-t border-slate-900 pt-1">
              कोच / ट्रेनर हस्ताक्षर ({trainer?.name})
            </div>
          </div>
          <div className="text-center">
            <div className="w-48 border-t border-slate-900 pt-1">
              जिम संचालक / प्रबंधक (Kaushik Fitness)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
