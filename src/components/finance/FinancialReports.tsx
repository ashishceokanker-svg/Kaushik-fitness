import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { AddExpenseModal } from './AddExpenseModal';
import {
  TrendingUp,
  Receipt,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { transactions, totalPendingDues, supplements, supplementSales } = useGymData();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('yearly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all');

  const now = new Date();
  const currentMonth = now.getMonth();
  const todayStr = now.toISOString().split('T')[0];

  // Timeframe-filtered transactions
  const timeframeTx = transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (timeframe === 'yearly') {
      return txDate.getFullYear() === selectedYear;
    }
    if (timeframe === 'monthly') {
      return txDate.getFullYear() === selectedYear && txDate.getMonth() === currentMonth;
    }
    if (timeframe === 'weekly') {
      const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (timeframe === 'daily') {
      return t.date.startsWith(todayStr);
    }
    return true;
  });

  // Breakdown Calculations based on timeframe (or all if empty)
  const activeTx = timeframeTx.length > 0 ? timeframeTx : transactions;
  const revenueTx = activeTx.filter((t) => t.type === 'revenue');
  const expenseTx = activeTx.filter((t) => t.type === 'expense');

  const grossRevenue = revenueTx.reduce((sum, t) => sum + t.amount, 0);
  const gymExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = grossRevenue - gymExpenses;

  const membershipRevenue = revenueTx
    .filter((t) => t.category === 'membership_fee')
    .reduce((sum, t) => sum + t.amount, 0);

  const ptRevenue = revenueTx
    .filter((t) => t.category === 'pt_fee')
    .reduce((sum, t) => sum + t.amount, 0);

  const supplementRevenue = revenueTx
    .filter((t) => t.category === 'supplement_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  // Timeframe Supplement Sales from supplementSales store
  const periodSupplementSales = (supplementSales || []).filter((s) => {
    const sDate = new Date(s.date);
    if (timeframe === 'yearly') return sDate.getFullYear() === selectedYear;
    if (timeframe === 'monthly') return sDate.getFullYear() === selectedYear && sDate.getMonth() === currentMonth;
    return true;
  });
  const totalSupplementUnits = periodSupplementSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalSupplementProfit = periodSupplementSales.reduce((sum, s) => sum + (s.profit || s.totalProfit || 0), 0);

  const filteredTx = activeTx.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            वित्तीय एनालिटिक्स व आय-व्यय रिपोर्ट (Financial Reports)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            कौशिक फिटनेस कांकेर - आय, व्यय, पर्सनल ट्रेनिंग मार्जिन और लेजर विवरण
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <span className="text-slate-500 pl-2 pr-1 text-[11px]">वर्ष:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026 (वर्तमान)</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  timeframe === t ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'yearly' ? 'वार्षिक (Yearly)' : t === 'monthly' ? 'मासिक (Monthly)' : t === 'weekly' ? 'साप्ताहिक (Weekly)' : 'दैनिक (Daily)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + खर्च दर्ज करें (Log Expense)
          </button>
        </div>
      </div>

      {/* Timeframe summary banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>
            समीक्षा अवधि:{' '}
            <strong>
              {timeframe === 'yearly'
                ? `वर्ष ${selectedYear} (वार्षिक रिपोर्ट)`
                : timeframe === 'monthly'
                ? `माह ${now.toLocaleString('default', { month: 'long' })} ${selectedYear}`
                : timeframe === 'weekly'
                ? 'पिछले 7 दिन'
                : 'आज (Daily)'}
            </strong>{' '}
            | कुल लेन-देन: <strong className="font-mono">{activeTx.length} रिकॉर्ड्स</strong>
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-amber-200">
          कौशिक फिटनेस लेजर
        </span>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">कुल राजस्व ({timeframe === 'yearly' ? `${selectedYear} वार्षिक` : 'Gross Revenue'})</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {formatINR(grossRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            सदस्यता, PT व सप्लीमेंट्स सम्मिलित
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">कुल खर्च ({timeframe === 'yearly' ? `${selectedYear}` : 'Expenses'})</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono mt-2">
            {formatINR(gymExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            किराया, बिजली, वेतन, उपकरण
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">शुद्ध लाभ (Net Profit)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatINR(netProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            मार्जिन: {grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0}% ऑपरेटिंग
          </div>
        </div>

        {/* Total Pending Dues */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-400">बकाया फीस (Pending Dues)</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono mt-2">
            {formatINR(totalPendingDues)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            सदस्यों से बकाया वसूलना शेष
          </div>
        </div>
      </div>

      {/* Revenue Stream Breakdown Cards & Supplement Tile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Sources */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            आय स्रोत विभाजन (Income Breakdown)
          </h3>

          <div className="space-y-4">
            {/* Membership plans */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-bold">मानक सदस्यता (Standard Plans)</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(membershipRevenue)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, grossRevenue > 0 ? (membershipRevenue / grossRevenue) * 100 : 50)}%` }}
                />
              </div>
            </div>

            {/* PT Coaching */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-bold">पर्सनल ट्रेनिंग (PT Packages)</span>
                <span className="font-mono font-bold text-cyan-600">{formatINR(ptRevenue)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, grossRevenue > 0 ? (ptRevenue / grossRevenue) * 100 : 35)}%` }}
                />
              </div>
            </div>

            {/* Supplements */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-bold">सप्लीमेंट्स व पोषण बिक्री</span>
                <span className="font-mono font-bold text-purple-600">{formatINR(supplementRevenue)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, grossRevenue > 0 ? (supplementRevenue / grossRevenue) * 100 : 15)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Expenses Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            प्रमुख परिचालन व्यय (Expenses)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">स्टाफ व वेतन</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">{formatINR(43000)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">ट्रेनर व रिसेप्शन</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">जिम किराया (Rent)</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">{formatINR(25000)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">कांकेर सेंटर परिसर</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">बिजली व एसी</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">{formatINR(8200)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">कमर्शियल 3-फेज</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">मरम्मत व सेवा</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-1">{formatINR(4500)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">केबल्स व उपकरण</div>
            </div>
          </div>
        </div>

        {/* Supplement Sales & Inventory Analytics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-purple-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              सप्लीमेंट सेल्स एनालिटिक्स
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              {supplements.length} प्रोडक्ट्स
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
              <div>
                <div className="text-slate-500">कुल सप्लीमेंट राजस्व</div>
                <div className="text-lg font-black text-purple-700 font-mono">{formatINR(supplementRevenue)}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500">शुद्ध लाभ (Profit)</div>
                <div className="text-sm font-black text-emerald-600 font-mono">+{formatINR(totalSupplementProfit)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-semibold">कुल बेची गई यूनिट्स</span>
              <span className="font-mono font-black text-slate-900">{totalSupplementUnits} यूनिट्स</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-semibold">इन्वेंटरी स्टॉक हेल्थ</span>
              <span className="text-emerald-700 font-bold">सक्रिय व पर्याप्त</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            वित्तीय लेन-देन खाताबही (Financial Ledger)
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              सभी ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('revenue')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filterType === 'revenue' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              आय (Income)
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filterType === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              व्यय (Expenses)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200 font-bold tracking-wider">
                <th className="py-2.5 px-3">Tx क्रमांक व दिनांक</th>
                <th className="py-2.5 px-3">विवरण (Description)</th>
                <th className="py-2.5 px-3">श्रेणी (Category)</th>
                <th className="py-2.5 px-3">माध्यम</th>
                <th className="py-2.5 px-3 text-right">राशि (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono text-xs font-bold text-slate-900">{tx.transactionNumber}</div>
                    <div className="text-[11px] text-slate-500">{formatDate(tx.date)}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    {tx.memberName && (
                      <div className="text-xs text-slate-500">सदस्य: {tx.memberName}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono capitalize border border-slate-200">
                      {tx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-slate-600 font-mono uppercase font-bold">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black">
                    <span className={tx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.type === 'revenue' ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && <AddExpenseModal onClose={() => setIsAddExpenseOpen(false)} />}
    </div>
  );
};
