import React, { useState, useEffect } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { FitnessGoal, MembershipDuration } from '../../types';
import { MEMBERSHIP_PRICING } from '../../utils/formatters';
import { X, Send, CheckCircle2, MessageSquare, Phone, User, Calendar, Flame, Dumbbell } from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillGoal?: FitnessGoal;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  prefillGoal = 'general_fitness',
}) => {
  const { addEnquiry } = useGymData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(prefillGoal);
  const [interestedPackage, setInterestedPackage] = useState<MembershipDuration>('3_months');
  const [wantsPersonalTraining, setWantsPersonalTraining] = useState<boolean>(false);
  const [preferredTiming, setPreferredTiming] = useState<
    'Morning (6:00 AM - 9:00 AM)' | 'Afternoon (11:00 AM - 3:00 PM)' | 'Evening (5:00 PM - 9:30 PM)'
  >('Morning (6:00 AM - 9:00 AM)');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      fitnessGoal,
      interestedPackage,
      wantsPersonalTraining,
      preferredTiming,
      message: message.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-14 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto sm:my-0 text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                जिम पूछताछ व एडमिशन • Enquiry Form
              </h3>
              <p className="text-xs text-slate-500">
                कौशिक फिटनेस कांकेर - सदस्यता शुल्क व ट्रेनिंग जानकारी
              </p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">
                पूछताछ सफलतापूर्वक दर्ज हो गई!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                धन्यवाद <strong className="text-slate-900">{name}</strong>! कौशिक फिटनेस टीम आपके WhatsApp / फोन पर जल्द ही संपर्क करेगी।
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                📞 डायरेक्ट हेल्पडेस्क: +91 98261 89001 | मुख्य मार्ग, कांकेर (छ.ग.)
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आपका नाम (Full Name) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="उदा. अमित साहू"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मोबाइल नंबर (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="उदा. 98261XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  आपका फिटनेस लक्ष्य (Goal)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'muscle_building', label: 'Muscle Building', hindi: 'बॉडी / डोले' },
                    { id: 'weight_loss', label: 'Weight Loss', hindi: 'वजन / पेट कम' },
                    { id: 'general_fitness', label: 'General Fitness', hindi: 'फिटनेस / स्टैमिना' },
                    { id: 'strength', label: 'Strength Gain', hindi: 'स्ट्रेंथ / ताकत' },
                    { id: 'cardio_endurance', label: 'Cardio & Stamina', hindi: 'स्टैमिना' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        fitnessGoal === g.id
                          ? 'bg-amber-50 border-2 border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{g.label}</div>
                      <div className="text-[10px] text-slate-500">{g.hindi}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interested Membership Package */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  पसंदीदा पैकेज (Membership Plan)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['1_month', '3_months', '6_months', '1_year'] as MembershipDuration[]).map((pkg) => (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => setInterestedPackage(pkg)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        interestedPackage === pkg
                          ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{MEMBERSHIP_PRICING[pkg]?.label}</div>
                      <div className="text-[11px] text-cyan-800 font-mono font-bold">₹{MEMBERSHIP_PRICING[pkg]?.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Training Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">पर्सनल ट्रेनर (PT) चाहिए?</div>
                    <div className="text-[11px] text-slate-500">समर्पित 1-on-1 कोच मार्गदर्शन व डाइट</div>
                  </div>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setWantsPersonalTraining(false)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      !wantsPersonalTraining ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    नहीं
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantsPersonalTraining(true)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      wantsPersonalTraining ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    हाँ (PT)
                  </button>
                </div>
              </div>

              {/* Preferred Timing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                  आने का समय (Preferred Batch Timing)
                </label>
                <select
                  value={preferredTiming}
                  onChange={(e) => setPreferredTiming(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Morning (6:00 AM - 9:00 AM)">🌅 सुबह का बैच: 6:00 AM - 9:00 AM</option>
                  <option value="Afternoon (11:00 AM - 3:00 PM)">☀️ दोपहर का बैच: 11:00 AM - 3:00 PM</option>
                  <option value="Evening (5:00 PM - 9:30 PM)">🌆 शाम का बैच: 5:00 PM - 9:30 PM (सर्वाधिक लोकप्रिय)</option>
                </select>
              </div>

              {/* Message / Special Query */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कोई खास सवाल या संदेश? (वैकल्पिक)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. स्टूडेंट डिस्काउंट मिलेगा क्या? लेडीज टाइमिंग क्या है?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>जिम पूछताछ सबमिट करें (Submit Enquiry)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
