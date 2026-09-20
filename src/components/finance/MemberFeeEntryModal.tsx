import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Member, MembershipDuration, PTPackageDuration, PaymentMethod } from '../../types';
import { MEMBERSHIP_PRICING, PT_PRICING, formatINR, formatDate, calculateExpiryDate } from '../../utils/formatters';
import {
  CreditCard,
  X,
  User,
  CheckCircle2,
  Receipt,
  Printer,
  Search,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface MemberFeeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMemberId?: string;
  onSuccess?: () => void;
}

export const MemberFeeEntryModal: React.FC<MemberFeeEntryModalProps> = ({
  isOpen,
  onClose,
  preselectedMemberId,
  onSuccess,
}) => {
  const { members, updateMember, addTransaction } = useGymData();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMemberId || members[0]?.id || '');
  const [feeType, setFeeType] = useState<'due_clearance' | 'renewal' | 'pt' | 'admission'>('renewal');
  const [duration, setDuration] = useState<MembershipDuration>('3_months');
  const [ptDuration, setPtDuration] = useState<PTPackageDuration>('none');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paidAmount, setPaidAmount] = useState<number>(MEMBERSHIP_PRICING['3_months'].price);
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [receiptRecord, setReceiptRecord] = useState<any | null>(null);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  // Auto calculate recommended payable
  const calculateTotalPayable = () => {
    let subtotal = 0;
    if (feeType === 'due_clearance') {
      subtotal = selectedMember?.dueAmount || 0;
    } else if (feeType === 'renewal') {
      const base = MEMBERSHIP_PRICING[duration].price;
      const pt = ptDuration !== 'none' ? PT_PRICING[ptDuration]?.price || 0 : 0;
      subtotal = base + pt;
    } else if (feeType === 'pt') {
      subtotal = PT_PRICING[ptDuration === 'none' ? '1_month' : ptDuration]?.price || 3000;
    } else {
      subtotal = 1500;
    }

    const discountAmt =
      discountType === 'percentage'
        ? Math.round((subtotal * discountValue) / 100)
        : Math.min(subtotal, discountValue);

    return Math.max(0, subtotal - discountAmt);
  };

  const totalPayable = calculateTotalPayable();

  const handleFeeTypeChange = (type: typeof feeType) => {
    setFeeType(type);
    if (type === 'due_clearance') {
      setPaidAmount(selectedMember?.dueAmount || 0);
    } else if (type === 'renewal') {
      setPaidAmount(MEMBERSHIP_PRICING[duration].price);
    } else if (type === 'pt') {
      setPaidAmount(PT_PRICING['1_month'].price);
      setPtDuration('1_month');
    } else {
      setPaidAmount(1500);
    }
  };

  const handleDurationChange = (d: MembershipDuration) => {
    setDuration(d);
    const base = MEMBERSHIP_PRICING[d].price;
    const pt = ptDuration !== 'none' ? PT_PRICING[ptDuration].price : 0;
    const subtotal = base + pt;
    const discountAmt =
      discountType === 'percentage'
        ? Math.round((subtotal * discountValue) / 100)
        : Math.min(subtotal, discountValue);
    setPaidAmount(Math.max(0, subtotal - discountAmt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const nowIso = new Date().toISOString();
    const finalPaid = Number(paidAmount);
    let newDue = 0;
    let newExpiry = selectedMember.expiryDate;

    if (feeType === 'due_clearance') {
      newDue = Math.max(0, selectedMember.dueAmount - finalPaid);
      updateMember(selectedMember.id, {
        dueAmount: newDue,
        paidAmount: selectedMember.paidAmount + finalPaid,
        paymentStatus: newDue === 0 ? 'paid' : 'partial',
        lastPaymentDate: nowIso,
      });
    } else if (feeType === 'renewal') {
      const baseDate = new Date(selectedMember.expiryDate) > new Date() ? selectedMember.expiryDate : nowIso;
      newExpiry = calculateExpiryDate(baseDate, duration);
      newDue = Math.max(0, totalPayable - finalPaid);

      updateMember(selectedMember.id, {
        membershipDuration: duration,
        expiryDate: newExpiry,
        personalTraining: ptDuration !== 'none' ? true : selectedMember.personalTraining,
        ptDuration: ptDuration !== 'none' ? ptDuration : selectedMember.ptDuration,
        discountType,
        discountValue,
        totalPayable,
        paidAmount: finalPaid,
        dueAmount: newDue,
        paymentStatus: newDue === 0 ? 'paid' : (finalPaid > 0 ? 'partial' : 'pending'),
        lastPaymentDate: nowIso,
        active: true,
      });
    } else if (feeType === 'pt') {
      updateMember(selectedMember.id, {
        personalTraining: true,
        ptDuration: ptDuration !== 'none' ? ptDuration : '1_month',
        lastPaymentDate: nowIso,
      });
    }

    // Record Financial Revenue Transaction
    const tx = addTransaction({
      type: 'revenue',
      category: feeType === 'pt' ? 'pt_fee' : 'membership_fee',
      amount: finalPaid,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      paymentMethod,
      paymentStatus: 'completed',
      description: `${feeType === 'renewal' ? 'Renewal (' + MEMBERSHIP_PRICING[duration].label + ')' : feeType === 'due_clearance' ? 'Dues Clearance' : 'PT Fee'} - Handled by Staff`,
    });

    const receipt = {
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      member: selectedMember,
      feeType,
      duration,
      ptDuration,
      amount: finalPaid,
      totalPayable,
      dueRemaining: newDue,
      newExpiry,
      paymentMethod,
      notes,
      date: new Date().toLocaleString('en-IN'),
    };

    setReceiptRecord(receipt);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fade-in">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <CreditCard className="w-3 h-3" />
              Staff & Billing Desk
            </div>
            <h2 className="text-lg font-black tracking-wide">
              सदस्य फीस प्रविष्टि (Member Fee Entry)
            </h2>
            <p className="text-xs text-slate-300">
              फीस जमा करें, बकाए की वसूली या प्लान नवीनीकरण करके रसीद जनरेट करें।
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Receipt is Ready, Show Printable Receipt View */}
        {receiptRecord ? (
          <div className="printable-content p-6 space-y-5 text-slate-800" id="printable-fee-receipt">
            <div className="p-5 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl space-y-4">
              {/* Gym Brand Header for Print */}
              <div className="text-center border-b border-emerald-200 pb-3">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  KOUSHIK FITNESS GYM
                </h3>
                <p className="text-[11px] text-slate-600">
                  Main Road, Opp. Stadium Ground, Kanker (C.G.) • Phone: +91 98261 89001
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 font-mono text-[10px] font-bold text-emerald-800">
                  OFFICIAL FEE PAYMENT RECEIPT
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>फीस सफलतापूर्वक जमा हुई (Payment Recorded)</span>
                </div>
                <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200">
                  {receiptRecord.receiptNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Member Name</span>
                  <span className="font-bold text-slate-900 text-sm">{receiptRecord.member.name}</span>
                  <span className="text-[11px] text-slate-500 block font-mono">{receiptRecord.member.memberCode}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                  <span className="font-black text-emerald-600 text-lg font-mono">₹{receiptRecord.amount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Via {receiptRecord.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Type:</span>
                  <span className="font-bold text-slate-800 uppercase">{receiptRecord.feeType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Validity Expiry:</span>
                  <span className="font-bold text-amber-700 font-mono">{formatDate(receiptRecord.newExpiry)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-bold text-slate-800 font-mono">₹{receiptRecord.dueRemaining}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => {
                  const prev = document.body.style.overflow;
                  document.body.style.overflow = 'visible';
                  window.print();
                  document.body.style.overflow = prev;
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt (रसीद प्रिंट करें)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReceiptRecord(null);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        ) : (
          /* Main Fee Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800">
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                सदस्य चुनें (Select Member)
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.memberCode}) • Due: ₹{m.dueAmount} • Plan: {m.membershipDuration}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Member Status Chip */}
            {selectedMember && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Current Plan</span>
                  <span className="font-bold text-slate-800">
                    {MEMBERSHIP_PRICING[selectedMember.membershipDuration]?.label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Valid Until</span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(selectedMember.expiryDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Pending Dues</span>
                  <span className={`font-mono font-black ${selectedMember.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{selectedMember.dueAmount}
                  </span>
                </div>
              </div>
            )}

            {/* Fee Category Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                फीस का प्रकार (Fee Category)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'renewal', label: 'Plan Renewal' },
                  { id: 'due_clearance', label: 'Clear Dues' },
                  { id: 'pt', label: 'PT Package' },
                  { id: 'admission', label: 'Admission Fee' },
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleFeeTypeChange(cat.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      feeType === cat.id
                        ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Renewal Plan Selectors if renewal */}
            {feeType === 'renewal' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Membership Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value as MembershipDuration)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {Object.entries(MEMBERSHIP_PRICING).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label} - ₹{val.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Personal Training (PT)
                  </label>
                  <select
                    value={ptDuration}
                    onChange={(e) => setPtDuration(e.target.value as PTPackageDuration)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="none">No PT (केवल जिम)</option>
                    <option value="1_month">1 Month PT (+₹3,000)</option>
                    <option value="3_months">3 Months PT (+₹8,000)</option>
                    <option value="6_months">6 Months PT (+₹15,000)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Payment Fields (Amount, Mode, Discount) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount to Pay (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-emerald-500 rounded-xl px-3 py-2 text-base font-black text-slate-900 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="cash">Cash (नकद)</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="netbanking">Bank Netbanking</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    छूट (Discount {discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('flat');
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        discountType === 'flat' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Flat ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        if (discountValue > 100) setDiscountValue(10);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        discountType === 'percentage' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      % Off
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDiscountValue(val);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks / Note (e.g. Received via GPay from Rahul Sharma)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>Submit Fee & Generate Receipt</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
