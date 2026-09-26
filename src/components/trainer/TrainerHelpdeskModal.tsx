import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Phone,
  MessageCircle,
  Wrench,
  Users,
  DollarSign,
  HeartPulse,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface TrainerHelpdeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName?: string;
}

export const TrainerHelpdeskModal: React.FC<TrainerHelpdeskModalProps> = ({
  isOpen,
  onClose,
  trainerName = 'Coach',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'support' | 'equipment' | 'first_aid'>('support');
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentIssue, setEquipmentIssue] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSendEquipmentReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim() || !equipmentIssue.trim()) return;

    const message = `🛠️ *कौशिक फिटनेस - उपकरण मरम्मत रिपोर्ट*\n\nकोच: ${trainerName}\nउपकरण/मशीन: ${equipmentName}\nसमस्या विवरण: ${equipmentIssue}\nदिनांक: ${new Date().toLocaleDateString('hi-IN')}`;
    const whatsappUrl = `https://wa.me/919826189001?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setTicketSent(true);
    setEquipmentName('');
    setEquipmentIssue('');
    setTimeout(() => setTicketSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-600 via-cyan-700 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-xs">
              <HelpCircle className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg leading-tight">कोच एवं ट्रेनर सहायता केंद्र</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Trainer Desk
                </span>
              </div>
              <p className="text-[11px] text-cyan-100 mt-0.5">
                कोच {trainerName} • फ्लोर ऑपरेशन, एडमिन हेल्पलाइन व मेंटेनेंस सपोर्ट
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-cyan-600" />
            <span>एडमिन हेल्पलाइन</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'equipment'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>मशीन रिपेयर रिपोर्ट</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('first_aid')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'first_aid'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>इमरजेंसी फर्स्ट-एड</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {/* TAB 1: ADMIN & GYM OWNER HOTLINE */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {/* Gym Owner Direct Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-950 text-white shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      जिम संचालक डायरेक्ट हेल्पलाइन
                    </span>
                    <h4 className="text-sm font-black text-white">वैभव कौशिक (Vaibhav Kaushik)</h4>
                    <p className="text-[11px] text-slate-300">व्यवस्थापक एवं संचालक, कौशिक फिटनेस कांकेर</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:9826189001"
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>कॉल: 9826189001</span>
                  </a>

                  <a
                    href="https://wa.me/919826189001?text=नमस्ते%20वैभव%20सर,%20मैं%20कोच%20बात%20कर%20रहा%20हूँ।%20जिम%20फ्लोर%20के%20संबंध%20में%20चर्चा%20करनी%20है।"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp चैट</span>
                  </a>
                </div>
              </div>

              {/* Coach Operational Quick Guides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs">
                    <Users className="w-4 h-4" />
                    <span>पीटी क्लाइंट मिसिंग या विवाद</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    यदि कोई पीटी क्लाइंट लगातार 3 दिन से बिना सूचना अनुपस्थित है, तो तुरंत उनके व्हाट्सएप पर संपर्क करें या एडमिन से री-शेड्यूल कराएं।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <DollarSign className="w-4 h-4" />
                    <span>सप्लीमेंट इंसेंटिव व वेतन</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    मासिक वेतन 1 से 5 तारीख तक जारी होता है। सप्लीमेंट बिक्री पर 10% त्वरित इंसेंटिव प्राप्त होता है। पूछताछ हेतु एडमिन से संपर्क करें।
                  </p>
                </div>
              </div>

              {/* Shift Timings */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>जिम फ्लोर शिफ्ट एवं बायोमेट्रिक/पिन समय</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  • मॉर्निंग शिफ्ट: प्रातः 05:30 से 10:30 AM (जीपीएस परिधि 50m में उपस्थिति अनिवार्य)
                </p>
                <p className="text-[11px] text-slate-500">
                  • इवनिंग शिफ्ट: सायं 04:30 से 09:30 PM (सत्र समाप्ति पर चेक-आउट सुनिश्चित करें)
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: EQUIPMENT MAINTENANCE REPORT */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>जिम उपकरण / मशीन खराबी की तुरंत रिपोर्ट करें</span>
                </h4>
                <p className="text-[11px] text-amber-900">
                  जिम फ्लोर पर किसी भी मशीन की टूटी केबल, ढीले नट-बोल्ट, डंबल रैक या ट्रेडमिल एरर की सूचना तुरंत एडमिन को भेजें।
                </p>
              </div>

              {ticketSent && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>रिपोर्ट एडमिन व्हाट्सएप पर प्रेषित हो गई है!</span>
                </div>
              )}

              <form onSubmit={handleSendEquipmentReport} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    उपकरण / मशीन का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. केबल क्रॉसओवर पुली #2 / ट्रेडमिल #1"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    खराबी या समस्या का विवरण *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="समस्या विस्तार से लिखें (उदा. वायर कट रहा है, भारी वजन पर अटक रहा है, तत्काल मरम्मत की आवश्यकता है)..."
                    value={equipmentIssue}
                    onChange={(e) => setEquipmentIssue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>एडमिन को रिपेयर अलर्ट भेजें (Send to Admin)</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FIRST-AID & EMERGENCY PROTOCOL */}
          {activeTab === 'first_aid' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>आपातकालीन मेडिकल व फर्स्ट-एड प्रोटोकॉल</span>
                </h4>
                <p className="text-[11px] text-rose-900">
                  वर्कआउट के दौरान किसी सदस्य को चक्कर, बेहोशी या मांसपेशी खिंचाव आने पर शांत रहें और निम्नलिखित कदम उठाएं:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <strong className="text-rose-700 block">1. चक्कर आना या हाइपोग्लाइसीमिया (Dizziness / Fainting):</strong>
                  <p className="text-[11px] text-slate-600">
                    तुरंत सदस्य को समतल जमीन पर लिटाएं, पैर ऊपर उठाएं (ताकि मस्तिष्क तक रक्त पहुंचे)। ओआरएस (ORS) या ग्लूकोज पानी पिलाएं। पंखे या खुली हवा में रखें।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <strong className="text-amber-700 block">2. मसल क्रैम्प या मोच (Muscle Sprain - RICE):</strong>
                  <p className="text-[11px] text-slate-600">
                    <strong>R</strong>est (आराम), <strong>I</strong>ce (फ्रिज से बर्फ 15 मिनट लगाएं), <strong>C</strong>ompression (क्रेप बैंडेज बांधें), <strong>E</strong>levation (अंग को ऊपर रखें)।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <strong className="text-slate-900 block">3. फर्स्ट-एड किट स्थान (Gym Location):</strong>
                  <p className="text-[11px] text-slate-600">
                    फर्स्ट-एड बॉक्स रिसेप्शन डेस्क के नीचे बाएं दराज में उपलब्ध है जिसमें ग्लूकोज, बैंडेज, मूव/वोलिनी स्प्रे, पेन-रिलीफ और डिटॉल उपलब्ध है।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-white shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs">गंभीर स्थिति में सरकारी अस्पताल कांकेर:</div>
                    <div className="text-[11px] text-slate-400">दूरी: 1.2 किमी • एम्बुलेंस: 108</div>
                  </div>
                  <a
                    href="tel:108"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs"
                  >
                    108 डायल करें
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Kaushik Fitness • कोच सहायता केंद्र</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
