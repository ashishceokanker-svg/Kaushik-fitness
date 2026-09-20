import React, { useState, useEffect } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { PaymentMethod } from '../../types';
import { X, Receipt, DollarSign, ShieldAlert } from 'lucide-react';

interface AddExpenseModalProps {
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose }) => {
  const { addTransaction } = useGymData();

  const [category, setCategory] = useState<any>('equipment_maintenance');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [description, setDescription] = useState('');

  // Escape key handler
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    addTransaction({
      type: 'expense',
      category,
      amount,
      paymentMethod,
      paymentStatus: 'completed',
      description,
    });

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 pb-16 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 my-auto sm:my-0 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">जिम व्यय दर्ज करें (Log Gym Expense)</h3>
              <p className="text-xs text-slate-500">कौशिक फिटनेस कांकेर - आय-व्यय लेजर</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">व्यय श्रेणी (Expense Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="equipment_maintenance">उपकरण रखरखाव व मरम्मत (Equipment Maintenance)</option>
              <option value="electricity">बिजली व एसी बिल (Commercial Electricity)</option>
              <option value="rent">जिम भवन किराया / लीज (Gym Rent)</option>
              <option value="staff_salary">स्टाफ व ट्रेनर वेतन (Staff Salaries)</option>
              <option value="other">सफाई, पानी व विविध खर्च (Sanitation & Misc)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">राशि (Amount ₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान का माध्यम (Payment Method)</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="upi">UPI / ऑनलाइन (Online)</option>
              <option value="cash">नकद काउंटर से (Cash)</option>
              <option value="netbanking">नेट बैंकिंग NEFT/RTGS</option>
              <option value="card">डेबिट कार्ड (Gym Card)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">विवरण / नोट (Description) *</label>
            <input
              type="text"
              required
              placeholder="उदा. डम्बल रैक वेल्डिंग, सैनिटाइजर आपूर्ति"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              व्यय दर्ज करें (Save Expense)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
