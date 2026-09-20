import React, { useEffect } from 'react';
import { Member } from '../../types';
import { formatINR, formatDate, MEMBERSHIP_PRICING, PT_PRICING } from '../../utils/formatters';
import { X, Printer, ShieldCheck, Dumbbell } from 'lucide-react';

interface InvoiceModalProps {
  member: Member;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ member, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handlePrint = () => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'visible';
    window.print();
    document.body.style.overflow = prev;
  };

  const invoiceNumber = `INV-${member.memberCode}-${new Date().getFullYear()}`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 pb-16 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      {/* Floating Screen-level Close Button (Always visible on any screen size/scroll position) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 sm:top-5 right-3 sm:right-6 z-[60] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-rose-600 text-white font-bold text-xs shadow-xl border border-white/20 backdrop-blur-md transition-all cursor-pointer print:hidden hover:scale-105"
        title="रसीद बंद करें (Close)"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
        <span>बंद करें (Close)</span>
      </button>

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-4">
        {/* Modal Controls - Hidden during print */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Membership Fee Receipt & Invoice
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                सदस्यता शुल्क रसीद व बिल विवरण
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:bg-amber-600 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-2 ring-rose-300/60"
              title="रसीद बंद करें (Close)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>बंद करें (Close)</span>
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 bg-white text-slate-900 print:p-0 print:bg-white print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
                  KF
                </div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 print:text-black">
                  KOUSHIK FITNESS
                </h1>
              </div>
              <p className="text-xs text-slate-500 print:text-gray-600 mt-1">
                Main Road, Opp. Stadium Ground, Kanker, Chhattisgarh - 494334
              </p>
              <p className="text-xs text-slate-500 print:text-gray-600">
                Phone: +91 98261 89001 | Email: support@koushikfitness.com
              </p>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-xs uppercase print:border-black print:text-black">
                Official Receipt
              </span>
              <div className="text-sm font-semibold text-slate-700 print:text-black mt-1">
                {invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 print:text-gray-600">
                Date: {formatDate(member.lastPaymentDate || member.joiningDate)}
              </div>
            </div>
          </div>

          {/* Member & Plan Details */}
          <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 print:bg-transparent print:border-gray-300">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 print:text-gray-600 tracking-wider">
                Billed To (Member)
              </span>
              <div className="text-base font-bold text-slate-900 print:text-black mt-0.5">
                {member.name}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-700">
                Code: <span className="font-mono font-semibold text-cyan-800 print:text-black">{member.memberCode}</span>
              </div>
              <div className="text-xs text-slate-600 print:text-gray-700">
                Phone: {member.phone}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-700">
                Age / Gender: {member.age} yrs • {member.gender.toUpperCase()}
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 print:text-gray-600 tracking-wider">
                Membership Details
              </span>
              <div className="text-sm font-semibold text-slate-800 print:text-black mt-0.5">
                Plan: {MEMBERSHIP_PRICING[member.membershipDuration]?.label}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-700">
                Joining Date: {formatDate(member.joiningDate)}
              </div>
              <div className="text-xs text-slate-600 print:text-gray-700">
                Valid Until: <span className="font-semibold text-amber-700 print:text-black">{formatDate(member.expiryDate)}</span>
              </div>
              {member.personalTraining && (
                <div className="text-xs text-emerald-700 print:text-green-700 font-semibold mt-1">
                  ✓ Personal Training: {PT_PRICING[member.ptDuration || '1_month']?.label}
                  {member.assignedTrainerName ? ` (Trainer: ${member.assignedTrainerName})` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 print:border-black print:text-black text-xs uppercase">
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-center">Duration</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-gray-200">
              <tr>
                <td className="py-3 font-medium text-slate-900 print:text-black">
                  {MEMBERSHIP_PRICING[member.membershipDuration]?.label} Gym Access
                </td>
                <td className="py-3 text-center text-slate-600 print:text-gray-700">
                  {MEMBERSHIP_PRICING[member.membershipDuration]?.months} Month(s)
                </td>
                <td className="py-3 text-right font-mono font-semibold text-slate-900 print:text-black">
                  {formatINR(member.baseFee)}
                </td>
              </tr>
              {member.personalTraining && (
                <tr>
                  <td className="py-3 font-medium text-slate-900 print:text-black">
                    Personal Trainer Coaching ({member.assignedTrainerName || 'Assigned Instructor'})
                  </td>
                  <td className="py-3 text-center text-slate-600 print:text-gray-700">
                    {PT_PRICING[member.ptDuration || '1_month']?.months} Month(s)
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900 print:text-black">
                    {formatINR(member.ptFee)}
                  </td>
                </tr>
              )}
              {member.discountValue > 0 && (
                <tr className="text-emerald-700 print:text-green-800">
                  <td className="py-2.5 font-medium">
                    Special Membership Discount ({member.discountType === 'percentage' ? `${member.discountValue}% Off` : 'Flat Off'})
                  </td>
                  <td className="py-2.5 text-center">-</td>
                  <td className="py-2.5 text-right font-mono font-semibold">
                    - {member.discountType === 'percentage'
                      ? formatINR(Math.round(((member.baseFee + member.ptFee) * member.discountValue) / 100))
                      : formatINR(member.discountValue)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals & Payment Status */}
          <div className="mt-6 pt-4 border-t border-slate-200 print:border-black flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1 text-xs text-slate-500 print:text-gray-600">
              <div className="flex items-center gap-1.5 text-slate-700 print:text-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600 print:text-green-700" />
                <span>Payment Mode: <strong className="uppercase">{member.paymentMethod}</strong></span>
              </div>
              <div>Check-in PIN: <strong className="font-mono text-slate-900 print:text-black">{member.pin}</strong> (Keep confidential)</div>
              <div>Emergency Contact: {member.emergencyContact || 'Not Specified'}</div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-700 print:text-gray-800">
                <span>Total Payable:</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(member.totalPayable)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 print:text-green-700 font-semibold">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatINR(member.paidAmount)}</span>
              </div>
              {member.dueAmount > 0 ? (
                <div className="flex justify-between text-rose-600 print:text-red-600 font-bold border-t border-slate-200 print:border-gray-300 pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatINR(member.dueAmount)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-emerald-700 print:text-green-600 font-bold border-t border-slate-200 print:border-gray-300 pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹0 (Paid in Full)</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 print:border-gray-300 flex justify-between items-end text-xs text-slate-500 print:text-gray-500">
            <div>
              <p>• Membership is non-refundable and non-transferable.</p>
              <p>• Members must carry towel and clean workout shoes inside the gym.</p>
              <p className="font-semibold text-slate-700 print:text-black mt-1">Thank you for choosing Koushik Fitness Kanker!</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-300 print:border-black mb-1 pb-4">
                <span className="font-serif italic text-slate-800 print:text-black">Vaibhav Kaushik</span>
              </div>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls - Hidden during print */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>रसीद बंद करने के लिए दाएँ बटन या</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold border border-slate-300">
              Esc
            </kbd>
            <span>दबाएँ</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>रसीद बंद करें (Close)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
