import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Member, MembershipDuration } from '../../types';
import { formatINR, formatDate, calculateCountdown, generateWhatsAppReminderUrl, MEMBERSHIP_PRICING, calculateExpiryDate } from '../../utils/formatters';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import { InvoiceModal } from '../common/InvoiceModal';
import { MemberRegisterModal } from './MemberRegisterModal';
import { ChangePinModal } from '../admin/ChangePinModal';
import {
  Search,
  UserPlus,
  Receipt,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Trash2,
  CheckCircle2,
  Dumbbell,
  Clock,
  KeyRound,
  Lock,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ExcelImportModal } from '../common/ExcelImportModal';

interface MemberListProps {
  onSelectMember?: (member: Member) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ onSelectMember }) => {
  const { members, addMember, renewMember, deleteMember, activateMember } = useGymData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expiring_soon' | 'expired' | 'pt'>('all');
  const [selectedInvoiceMember, setSelectedInvoiceMember] = useState<Member | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [renewDuration, setRenewDuration] = useState<MembershipDuration>('3_months');
  const [renewDiscount, setRenewDiscount] = useState<number>(0);
  const [renewDiscountType, setRenewDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [pinTargetUser, setPinTargetUser] = useState<{ id: string; name: string; code?: string; role?: string; currentPin?: string } | null>(null);

  // Filter members
  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(query) ||
      m.memberCode.toLowerCase().includes(query) ||
      m.phone.includes(query);

    if (!matchesSearch) return false;

    const cd = calculateCountdown(m.expiryDate);

    if (filterType === 'active') return !cd.isExpired;
    if (filterType === 'expiring_soon') return !cd.isExpired && cd.isExpiringSoon;
    if (filterType === 'expired') return cd.isExpired;
    if (filterType === 'pt') return m.personalTraining;

    return true;
  });

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMember) return;
    renewMember(
      renewingMember.id,
      renewDuration,
      renewingMember.ptDuration || 'none',
      renewDiscount,
      0,
      renewDiscountType
    );
    setRenewingMember(null);
  };

  const handleBulkImportMembers = (importedRows: any[]) => {
    importedRows.forEach((row) => {
      const baseFee = MEMBERSHIP_PRICING[row.membershipDuration as MembershipDuration]?.price || 1200;
      const discountAmt =
        row.discountType === 'percentage'
          ? Math.round((baseFee * row.discountValue) / 100)
          : row.discountValue;
      const totalPayable = Math.max(0, baseFee - discountAmt);
      const paid = row.paidAmount > 0 ? row.paidAmount : totalPayable;
      const due = Math.max(0, totalPayable - paid);

      addMember({
        name: row.name,
        phone: row.phone,
        email: row.email,
        age: row.age,
        gender: row.gender,
        heightCm: row.heightCm,
        weightKg: row.weightKg,
        emergencyContact: 'Not Specified',
        joiningDate: new Date().toISOString().split('T')[0],
        membershipDuration: row.membershipDuration,
        expiryDate: calculateExpiryDate(new Date().toISOString().split('T')[0], row.membershipDuration),
        personalTraining: false,
        baseFee,
        ptFee: 0,
        discountType: row.discountType,
        discountValue: row.discountValue,
        totalPayable,
        paidAmount: paid,
        dueAmount: due,
        paymentStatus: due === 0 ? 'paid' : (paid > 0 ? 'partial' : 'due'),
        paymentMethod: 'cash',
        lastPaymentDate: new Date().toISOString().split('T')[0],
        fitnessGoal: 'general_fitness',
        activityLevel: 'moderate',
        workoutSlot: row.workoutSlot || '06:00 AM - 07:00 AM',
        active: true,
      });
    });
  };

  const handleExportMembersExcel = () => {
    if (!members || members.length === 0) {
      alert('एक्सपोर्ट के लिए कोई सदस्य उपलब्ध नहीं है।');
      return;
    }

    const exportRows = members.map((m, idx) => ({
      'क्र. (S.No.)': idx + 1,
      'सदस्य कोड (Member Code)': m.memberCode,
      'नाम (Member Name)': m.name,
      'मोबाइल नंबर (Phone)': m.phone,
      'लॉगिन पिन (PIN)': m.pin || '',
      'आयु (Age)': m.age,
      'लिंग (Gender)': m.gender === 'male' ? 'पुरुष (Male)' : m.gender === 'female' ? 'महिला (Female)' : 'अन्य',
      'योजना (Membership Plan)': MEMBERSHIP_PRICING[m.membershipDuration]?.label || m.membershipDuration,
      'पर्सनल ट्रेनिंग (PT)': m.personalTraining ? `हाँ (${m.assignedTrainerName || 'Trainer'})` : 'नहीं',
      'बैच समय (Slot)': m.workoutSlot || '06:00 AM - 07:00 AM',
      'जॉइनिंग तिथि (Join Date)': formatDate(m.joiningDate),
      'वैधता समाप्ति तिथि (Expiry Date)': formatDate(m.expiryDate),
      'कुल शुल्क (Total Fee)': m.totalPayable,
      'जमा शुल्क (Paid Amount)': m.paidAmount,
      'बकाया (Due Amount)': m.dueAmount,
      'भुगतान स्थिति (Status)': m.paymentStatus === 'paid' ? 'Paid' : m.paymentStatus === 'partial' ? 'Partial' : 'Pending',
      'भुगतान माध्यम (Mode)': m.paymentMethod?.toUpperCase() || 'CASH',
      'फिटनेस लक्ष्य (Goal)': m.fitnessGoal,
      'वजन (Weight kg)': m.weightKg,
      'ऊंचाई (Height cm)': m.heightCm,
      'बीएमआई (BMI)': m.bmi,
      'इमरजेंसी संपर्क (Emergency)': m.emergencyContact || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, `kaushik_fitness_members_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-amber-600" />
            सदस्य डायरेक्टरी (Member Directory & Profiles)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            कौशिक फिटनेस कांकेर में कुल {members.length} पंजीकृत सदस्य
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportMembersExcel}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95"
            title="सभी सदस्यों की सूची एक्सेल फाइल (.xlsx) में डाउनलोड करें"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📤 एक्सेल एक्सपोर्ट (Excel Export)</span>
          </button>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            + नया सदस्य जोड़ें (Register Member)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="नाम, मोबाइल नंबर या मेम्बर कोड (MEM-...) से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            सभी ({members.length})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            सक्रिय (Active)
          </button>
          <button
            onClick={() => setFilterType('expiring_soon')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'expiring_soon'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            जल्द समाप्ति (&le;7d)
          </button>
          <button
            onClick={() => setFilterType('expired')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'expired'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            समाप्त (Expired)
          </button>
          <button
            onClick={() => setFilterType('pt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'pt'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Personal Training (PT)
          </button>
        </div>
      </div>

      {/* Member Cards / Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200 font-bold tracking-wider">
                <th className="py-3 px-4">सदस्य विवरण (Member Info)</th>
                <th className="py-3 px-3">पैकेज व PT</th>
                <th className="py-3 px-3">वैधता काउंटडाउन</th>
                <th className="py-3 px-3">भुगतान स्थिति</th>
                <th className="py-3 px-4 text-right">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    कोई सदस्य नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const cd = calculateCountdown(member.expiryDate);
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-black text-amber-900 shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div
                              onClick={() => onSelectMember && onSelectMember(member)}
                              className="font-bold text-slate-900 hover:text-amber-600 cursor-pointer flex items-center gap-1.5"
                            >
                              {member.name}
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {member.memberCode}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{member.phone}</span>
                              <span>•</span>
                              <span>{member.gender.toUpperCase()}, {member.age} वर्ष</span>
                            </div>
                            {member.workoutSlot && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>बैच: {member.workoutSlot}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Plan & PT */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {MEMBERSHIP_PRICING[member.membershipDuration]?.label}
                        </div>
                        {member.personalTraining ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 mt-1 px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200">
                            <Sparkles className="w-3 h-3 text-cyan-600" />
                            PT: {member.assignedTrainerName || 'Instructor Assigned'}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 mt-0.5">Regular Access</div>
                        )}
                      </td>

                      {/* Validity Countdown */}
                      <td className="py-3.5 px-3">
                        <ExpirationCountdown expiryDate={member.expiryDate} variant="badge" />
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          वैधता: {formatDate(member.expiryDate)}
                        </div>
                        {(cd.isExpired || !member.active || member.status === 'expired') && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded w-fit">
                            <Lock className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>ऐप लॉक • पिन अक्षम</span>
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3">
                        {member.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Paid ({formatINR(member.totalPayable)})
                          </span>
                        ) : member.paymentStatus === 'partial' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Partial
                            </span>
                            <div className="text-[11px] text-rose-600 font-bold font-mono mt-0.5">
                              बकाया: {formatINR(member.dueAmount)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              बकाया: {formatINR(member.dueAmount)}
                            </span>
                          </div>
                        )}
                        {member.discountValue > 0 && (
                          <div className="mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-1.5 py-0.5 rounded w-fit">
                            छूट: {member.discountType === 'percentage' ? `${member.discountValue}% Off` : formatINR(member.discountValue)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                          {/* Active / Unlock Button for Expired Members */}
                          {(cd.isExpired || !member.active || member.status === 'expired') && (
                            <button
                              onClick={() => {
                                if (confirm(`${member.name} की सदस्यता सक्रिय करें? (वैधता 1 माह बढ़ेगी और ऐप लॉक व पिन तुरंत अनलॉक हो जाएगा)`)) {
                                  activateMember(member.id, '1_month');
                                }
                              }}
                              title="सदस्यता पुनः सक्रिय करें और ऐप/पिन अनलॉक करें"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>सक्रिय करें</span>
                            </button>
                          )}

                          {/* Universal PIN Change Button */}
                          <button
                            onClick={() =>
                              setPinTargetUser({
                                id: member.id,
                                name: member.name,
                                code: member.memberCode,
                                role: 'सदस्य (Member)',
                                currentPin: member.pin || '1234',
                              })
                            }
                            title="4-अंकीय पिन बदलें (Universal PIN Management)"
                            className="p-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Invoice Button */}
                          <button
                            onClick={() => setSelectedInvoiceMember(member)}
                            title="रसीद देखें / प्रिंट करें"
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Reminder Button */}
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
                            title="WhatsApp रिमाइंडर भेजें"
                            className="p-2 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Renew Button */}
                          <button
                            onClick={() => setRenewingMember(member)}
                            title="सदस्यता रिन्यू करें"
                            className="p-2 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove member record for ${member.name}?`)) {
                                deleteMember(member.id);
                              }
                            }}
                            title="हटाएं"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <MemberRegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={(newMember) => {
            setIsRegisterOpen(false);
            setSelectedInvoiceMember(newMember);
          }}
        />
      )}

      {/* Invoice Modal */}
      {selectedInvoiceMember && (
        <InvoiceModal
          member={selectedInvoiceMember}
          onClose={() => setSelectedInvoiceMember(null)}
        />
      )}

      {/* Quick Renewal Modal */}
      {renewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              सदस्यता नवीनीकरण (Renew): {renewingMember.name}
            </h3>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 font-bold mb-1">नवीनीकरण पैकेज चुनें</label>
                <select
                  value={renewDuration}
                  onChange={(e) => setRenewDuration(e.target.value as MembershipDuration)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="1_month">1 Month Standard ({formatINR(1200)})</option>
                  <option value="3_months">3 Months Quarter ({formatINR(3200)})</option>
                  <option value="6_months">6 Months Half-Year ({formatINR(5800)})</option>
                  <option value="1_year">1 Year Annual Gold ({formatINR(9999)})</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-700 font-bold">
                    छूट (Discount {renewDiscountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setRenewDiscountType('flat')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        renewDiscountType === 'flat' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Flat ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenewDiscountType('percentage');
                        if (renewDiscount > 100) setRenewDiscount(10);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        renewDiscountType === 'percentage' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      % Off
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max={renewDiscountType === 'percentage' ? 100 : undefined}
                  value={renewDiscount}
                  onChange={(e) => setRenewDiscount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600 font-bold">
                  कुल देय नवीनीकरण शुल्क:
                </span>
                <span className="text-base font-black text-amber-600 font-mono">
                  {formatINR(
                    Math.max(
                      0,
                      MEMBERSHIP_PRICING[renewDuration].price -
                        (renewDiscountType === 'percentage'
                          ? Math.round((MEMBERSHIP_PRICING[renewDuration].price * renewDiscount) / 100)
                          : renewDiscount)
                    )
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  नवीनीकरण कन्फर्म करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal PIN Change Modal */}
      {pinTargetUser && (
        <ChangePinModal
          targetUser={pinTargetUser}
          onClose={() => setPinTargetUser(null)}
        />
      )}

      {/* Excel / CSV Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="members"
        onImportMembers={handleBulkImportMembers}
      />
    </div>
  );
};
