import React, { useState, useMemo } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Staff, SalaryPayment, PaymentMethod } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { localDb } from '../../db/localDatabase';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  Download,
  Users,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
  Building,
  Plus,
  ShieldCheck,
  TrendingUp,
  Search,
} from 'lucide-react';

interface StaffSalaryManagementProps {
  onBack?: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const StaffSalaryManagement: React.FC<StaffSalaryManagementProps> = ({ onBack }) => {
  const { staff, addTransaction } = useGymData();

  // Current year & month state (defaults to September 2026 as per app demo date)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // 8 = September (0-indexed)

  // Current month string "2026-09"
  const currentMonthKey = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthLabel = `${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`;

  // Role filter: all | trainer | staff
  const [roleFilter, setRoleFilter] = useState<'all' | 'trainer' | 'staff'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [payModalStaff, setPayModalStaff] = useState<Staff | null>(null);
  const [viewSlip, setViewSlip] = useState<SalaryPayment | null>(null);

  // Pay Form fields
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Fetch all salary records from DB
  const [salaryRecords, setSalaryRecords] = useState<SalaryPayment[]>(() =>
    localDb.getSalaryPayments()
  );

  const refreshSalaryRecords = () => {
    setSalaryRecords(localDb.getSalaryPayments());
  };

  // Filter staff: exclude pure admin if admin does not draw employee salary
  const salariedStaff = useMemo(() => {
    return staff.filter((s) => s.role === 'trainer' || s.role === 'staff' || s.salaryMonthly > 0);
  }, [staff]);

  // Salary status map for current selected month: staffId -> SalaryPayment
  const currentMonthPaymentsMap = useMemo(() => {
    const map = new Map<string, SalaryPayment>();
    salaryRecords
      .filter((p) => p.month === currentMonthKey)
      .forEach((p) => {
        map.set(p.staffId, p);
      });
    return map;
  }, [salaryRecords, currentMonthKey]);

  // Statistics for selected month
  const totalMonthlyLiability = useMemo(() => {
    return salariedStaff.reduce((sum, s) => sum + (s.salaryMonthly || 0), 0);
  }, [salariedStaff]);

  const totalPaidThisMonth = useMemo(() => {
    let sum = 0;
    currentMonthPaymentsMap.forEach((p) => {
      if (p.status === 'paid') sum += p.totalPaid;
    });
    return sum;
  }, [currentMonthPaymentsMap]);

  const totalPendingThisMonth = Math.max(0, totalMonthlyLiability - totalPaidThisMonth);
  const paidCountThisMonth = Array.from(currentMonthPaymentsMap.values()).filter(
    (p) => p.status === 'paid'
  ).length;

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonthIndex((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(2026);
    setSelectedMonthIndex(8); // September 2026
  };

  // Filtered staff list
  const displayStaff = useMemo(() => {
    return salariedStaff.filter((s) => {
      if (roleFilter !== 'all' && s.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.staffCode.toLowerCase().includes(query) ||
          s.designation.toLowerCase().includes(query) ||
          s.phone.includes(query)
        );
      }
      return true;
    });
  }, [salariedStaff, roleFilter, searchQuery]);

  // Open Pay Modal
  const handleOpenPayModal = (employee: Staff) => {
    setPayModalStaff(employee);
    setBonusAmount(0);
    setDeductions(0);
    setPaymentMethod('upi');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setTransactionRef('');
    setPaymentNotes('');
  };

  // Submit Salary Payment
  const handleConfirmPaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalStaff) return;

    const base = payModalStaff.salaryMonthly || 0;
    const bonus = Number(bonusAmount) || 0;
    const ded = Number(deductions) || 0;
    const netPayable = Math.max(0, base + bonus - ded);

    const paymentData: Omit<SalaryPayment, 'id' | 'slipNumber'> = {
      staffId: payModalStaff.id,
      staffName: payModalStaff.name,
      staffRole: payModalStaff.role,
      staffType: payModalStaff.staffType,
      month: currentMonthKey,
      monthName: currentMonthLabel,
      baseSalary: base,
      bonusAmount: bonus,
      deductions: ded,
      totalPaid: netPayable,
      paymentDate: new Date(paymentDate).toISOString(),
      paymentMethod: paymentMethod as any,
      transactionRef: transactionRef || undefined,
      status: 'paid',
      notes: paymentNotes || `Salary paid for ${currentMonthLabel}`,
    };

    // 1. Save to local database
    const savedRecord = localDb.payStaffSalary(paymentData);

    // 2. Add expense transaction to financial records
    addTransaction({
      type: 'expense',
      category: 'staff_salary',
      amount: netPayable,
      description: `वेतन भुगतान: ${payModalStaff.name} (${currentMonthLabel})`,
      paymentMethod: paymentMethod,
      paymentStatus: 'completed',
    });

    // 3. Refresh and open slip
    refreshSalaryRecords();
    setPayModalStaff(null);
    setViewSlip(savedRecord);
  };

  // Historical Month Wise Summary Calculation
  const historicalReports = useMemo(() => {
    // Collect all distinct months from records or standard last 4 months
    const monthSet = new Set<string>();
    salaryRecords.forEach((r) => monthSet.add(r.month));
    monthSet.add('2026-09');
    monthSet.add('2026-08');
    monthSet.add('2026-07');

    const sortedMonths = Array.from(monthSet).sort().reverse();

    return sortedMonths.map((m) => {
      const records = salaryRecords.filter((r) => r.month === m && r.status === 'paid');
      const totalPaid = records.reduce((sum, r) => sum + r.totalPaid, 0);
      const paidStaffIds = new Set(records.map((r) => r.staffId));
      const paidCount = paidStaffIds.size;
      const totalStaffCount = salariedStaff.length;

      const [yearStr, monthNumStr] = m.split('-');
      const label = `${MONTH_NAMES[parseInt(monthNumStr, 10) - 1]} ${yearStr}`;

      return {
        monthKey: m,
        monthLabel: label,
        totalPaid,
        paidCount,
        totalStaffCount,
        status: paidCount >= totalStaffCount ? 'fully_paid' : paidCount > 0 ? 'partially_paid' : 'pending',
        records,
      };
    });
  }, [salaryRecords, salariedStaff]);

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Slip No,Staff ID,Staff Name,Role,Month,Base Salary,Bonus,Deductions,Total Paid,Payment Date,Payment Mode,Status\n';
    salaryRecords.forEach((r) => {
      csv += `"${r.slipNumber}","${r.staffId}","${r.staffName}","${r.staffRole}","${r.monthName}","${r.baseSalary}","${r.bonusAmount || 0}","${r.deductions || 0}","${r.totalPaid}","${r.paymentDate.split('T')[0]}","${r.paymentMethod}","${r.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Kaushik_Fitness_Payroll_${currentMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Admin Payroll & Staff Salary Portal
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              कर्मचारी व ट्रेनर वेतन प्रबंधन (Staff Salary Management)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              माह का चयन करें, ट्रेनर व फ्रंट डेस्क स्टाफ का वेतन भुगतान करें और मासिक वेतन रिपोर्ट देखें
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              title="पिछला महीना"
              className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 shadow-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-sm text-slate-900 min-w-[130px] text-center">
                {currentMonthLabel}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="अगला महीना"
              className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 shadow-sm transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="text-xs font-bold px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              चालू माह (Current)
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              title="वेतन रिपोर्ट CSV डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Selected Month Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              माह का कुल देय वेतन ({currentMonthLabel})
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatINR(totalMonthlyLiability)}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {salariedStaff.length} कर्मचारियों का वेतन
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Total Paid This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              भुगतान किया गया वेतन (Paid)
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatINR(totalPaidThisMonth)}
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
              {paidCountThisMonth} / {salariedStaff.length} स्टाफ को भुगतान पूर्ण
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending / Due Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              बकाया वेतन (Unpaid / Due)
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {formatINR(totalPendingThisMonth)}
            </div>
            <span className="text-xs text-amber-700 font-semibold mt-0.5 block">
              {salariedStaff.length - paidCountThisMonth} कर्मचारियों का वेतन बाकी
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Payroll Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              वेतन भुगतान स्थिति
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {salariedStaff.length > 0
                ? Math.round((paidCountThisMonth / salariedStaff.length) * 100)
                : 0}
              %
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    salariedStaff.length > 0
                      ? (paidCountThisMonth / salariedStaff.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Staff Salary Roster for Selected Month */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {currentMonthLabel} - स्टाफ व ट्रेनर वेतन तालिका (Payroll Roster)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक कर्मचारी का इस माह का वेतन विवरण, भुगतान बटन एवं रसीद
            </p>
          </div>

          {/* Role Filters & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="खोजें (नाम/पद)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                सभी ({salariedStaff.length})
              </button>
              <button
                onClick={() => setRoleFilter('trainer')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilter === 'trainer'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ट्रेनर ({salariedStaff.filter((s) => s.role === 'trainer').length})
              </button>
              <button
                onClick={() => setRoleFilter('staff')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilter === 'staff'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                स्टाफ ({salariedStaff.filter((s) => s.role === 'staff').length})
              </button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">कर्मचारी / पद</th>
                <th className="py-3 px-4">भूमिका (Role)</th>
                <th className="py-3 px-4 text-right">मासिक मूल वेतन</th>
                <th className="py-3 px-4 text-right">कुल भुगतान</th>
                <th className="py-3 px-4 text-center">स्थिति ({currentMonthLabel})</th>
                <th className="py-3 px-4 text-center">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    कोई कर्मचारी नहीं मिला
                  </td>
                </tr>
              ) : (
                displayStaff.map((employee) => {
                  const payment = currentMonthPaymentsMap.get(employee.id);
                  const isPaid = payment && payment.status === 'paid';
                  const isTrainer = employee.role === 'trainer';

                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Name & Designation */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                              isTrainer
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            {employee.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {employee.name}
                              <span className="text-[10px] font-mono text-slate-400 font-normal">
                                ({employee.staffCode})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {employee.designation} • {employee.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isTrainer ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Award className="w-3.5 h-3.5 text-cyan-600" />
                            ट्रेनर (Instructor)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                            स्टाफ (Front Desk)
                          </span>
                        )}
                      </td>

                      {/* Base Salary */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        {formatINR(employee.salaryMonthly || 0)}
                      </td>

                      {/* Net Paid */}
                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <div>
                            <div className="font-black text-emerald-600 text-sm">
                              {formatINR(payment.totalPaid)}
                            </div>
                            {(payment.bonusAmount || payment.deductions) && (
                              <div className="text-[10px] text-slate-400">
                                {payment.bonusAmount ? `+${payment.bonusAmount} बोनस` : ''}{' '}
                                {payment.deductions ? `-${payment.deductions} कटौती` : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Paid ({payment.slipNumber})
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {formatDate(payment.paymentDate)} via {payment.paymentMethod.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            देय / बाकी (Due)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <button
                            onClick={() => setViewSlip(payment)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            वेतन पर्ची (Slip)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(employee)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            वेतन दें (Pay Salary)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Month-wise Historical Reports Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              मासिक वेतन ऐतिहासिक रिपोर्ट (Month-wise Salary History & Reports)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              विगत महीनों के वेतन भुगतान की विस्तृत समरी और स्थिति
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">महीना व वर्ष</th>
                <th className="py-2.5 px-4">कुल कर्मचारी</th>
                <th className="py-2.5 px-4">भुगतान संख्या</th>
                <th className="py-2.5 px-4 text-right">कुल भुगतान राशि</th>
                <th className="py-2.5 px-4 text-center">समग्र स्थिति</th>
                <th className="py-2.5 px-4 text-center">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicalReports.map((h) => {
                const [yStr, mStr] = h.monthKey.split('-');
                const yNum = parseInt(yStr, 10);
                const mIdx = parseInt(mStr, 10) - 1;
                const isSelectedMonth = h.monthKey === currentMonthKey;

                return (
                  <tr
                    key={h.monthKey}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelectedMonth ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {h.monthLabel}
                        {isSelectedMonth && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            वर्तमान चुना हुआ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{h.totalStaffCount} कर्मचारी</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {h.paidCount} / {h.totalStaffCount} Paid
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatINR(h.totalPaid)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {h.status === 'fully_paid' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          पूर्ण भुगतान (Fully Paid)
                        </span>
                      )}
                      {h.status === 'partially_paid' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          आंशिक भुगतान (Partial)
                        </span>
                      )}
                      {h.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          लंबित (Pending)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedYear(yNum);
                          setSelectedMonthIndex(mIdx);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all cursor-pointer"
                      >
                        इस माह का विवरण देखें
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Salary Modal */}
      {payModalStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  वेतन भुगतान वाउचर • {currentMonthLabel}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  वेतन भुगतान करें: {payModalStaff.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {payModalStaff.staffCode} • {payModalStaff.designation}
                </p>
              </div>
              <button
                onClick={() => setPayModalStaff(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPaySalary} className="space-y-4">
              {/* Base Salary Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">वेतन का महीना:</span>
                  <div className="font-bold text-slate-900 text-sm">{currentMonthLabel}</div>
                </div>
                <div>
                  <span className="text-slate-500">मासिक मूल वेतन:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {formatINR(payModalStaff.salaryMonthly || 0)}
                  </div>
                </div>
              </div>

              {/* Bonus / Incentive & Deductions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    इंसेंटिव / PT बोनस (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कटौती / एडवांस / छुट्टी (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deductions}
                    onChange={(e) => setDeductions(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Net Calculated Payable */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    कुल देय वेतन (Net Payable):
                  </span>
                  <div className="text-xs text-slate-600 mt-0.5">
                    मूल वेतन ({formatINR(payModalStaff.salaryMonthly || 0)}) + बोनस (₹{bonusAmount}) - कटौती (₹{deductions})
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {formatINR(
                    Math.max(0, (payModalStaff.salaryMonthly || 0) + (Number(bonusAmount) || 0) - (Number(deductions) || 0))
                  )}
                </div>
              </div>

              {/* Payment Mode & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    भुगतान माध्यम (Mode):
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="netbanking">Bank Transfer / NEFT / IMPS</option>
                    <option value="cash">नकद (Cash)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    भुगतान दिनांक (Date):
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Transaction Ref / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ट्रांजेक्शन Ref / UTR No (ऐच्छिक):
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI-19827391823 या Cheque 0021"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टिप्पणी (Notes):
                </label>
                <input
                  type="text"
                  placeholder="उदा. अगस्त का 2 दिन का इंसेंटिव शामिल"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayModalStaff(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  वेतन भुगतान कन्फर्म करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal (Printable) */}
      {viewSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div id="printable-salary-slip" className="printable-content bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  वेतन पर्ची (Official Salary Slip)
                </span>
                <h3 className="text-xl font-black text-slate-900">कौशिक फिटनेस कांकेर</h3>
                <p className="text-xs text-slate-500">
                  बस स्टैंड रोड, राजापारा, कांकेर (छ.ग.) • फोन: +91 98261 00000
                </p>
              </div>
              <button
                onClick={() => setViewSlip(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer print:hidden"
              >
                ✕
              </button>
            </div>

            {/* Slip Meta */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">पर्ची क्रमांक:</span>
                <div className="font-mono font-bold text-slate-900">{viewSlip.slipNumber}</div>
              </div>
              <div>
                <span className="text-slate-400">वेतन माह:</span>
                <div className="font-bold text-slate-900">{viewSlip.monthName}</div>
              </div>
              <div>
                <span className="text-slate-400">कर्मचारी नाम:</span>
                <div className="font-bold text-slate-900">{viewSlip.staffName}</div>
              </div>
              <div>
                <span className="text-slate-400">भूमिका / पद:</span>
                <div className="font-semibold text-slate-700 capitalize">
                  {viewSlip.staffRole === 'trainer' ? 'Gym Instructor' : 'Front Desk Staff'}
                </div>
              </div>
              <div>
                <span className="text-slate-400">भुगतान दिनांक:</span>
                <div className="font-semibold text-slate-700">{formatDate(viewSlip.paymentDate)}</div>
              </div>
              <div>
                <span className="text-slate-400">भुगतान माध्यम:</span>
                <div className="font-bold text-slate-900 uppercase">{viewSlip.paymentMethod}</div>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 px-3">विवरण (Particulars)</th>
                    <th className="py-2 px-3 text-right">राशि (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-slate-700">मूल वेतन (Basic Salary)</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatINR(viewSlip.baseSalary)}
                    </td>
                  </tr>
                  {viewSlip.bonusAmount ? (
                    <tr>
                      <td className="py-2 px-3 text-emerald-700">
                        इंसेंटिव / PT बोनस (+ Incentive)
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">
                        +{formatINR(viewSlip.bonusAmount)}
                      </td>
                    </tr>
                  ) : null}
                  {viewSlip.deductions ? (
                    <tr>
                      <td className="py-2 px-3 text-rose-700">कटौती / एडवांस (- Deductions)</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">
                        -{formatINR(viewSlip.deductions)}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="bg-emerald-50/60 font-bold text-sm">
                    <td className="py-2.5 px-3 text-slate-900">कुल भुगतान (Net Salary Paid):</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                      {formatINR(viewSlip.totalPaid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {viewSlip.notes && (
              <div className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                टिप्पणी: {viewSlip.notes}
              </div>
            )}

            {/* Signature row */}
            <div className="pt-4 flex justify-between items-end text-[11px] text-slate-400 border-t border-slate-100">
              <div>
                <div className="font-bold text-slate-600">कौशिक फिटनेस मैनेजमेंट</div>
                <div>हस्ताक्षर / अधिकृत मुहर</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-600">{viewSlip.staffName}</div>
                <div>कर्मचारी हस्ताक्षर</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 print:hidden">
              <button
                onClick={() => {
                  const prev = document.body.style.overflow;
                  document.body.style.overflow = 'visible';
                  window.print();
                  document.body.style.overflow = prev;
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                पर्ची प्रिंट करें (Print Slip)
              </button>
              <button
                onClick={() => setViewSlip(null)}
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
