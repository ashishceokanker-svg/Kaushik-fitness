import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Phone,
  MessageCircle,
  Wrench,
  Users,
  HeartPulse,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Dumbbell,
  Scale,
  Utensils,
  FileSpreadsheet,
  PlusCircle,
  Activity,
  Award,
  MapPin,
  Camera,
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

  const [activeTab, setActiveTab] = useState<'app_guide' | 'equipment' | 'support' | 'first_aid'>('app_guide');
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

  // Structured list of ONLY the features present in the Trainer App
  const trainerAppFeatures = [
    {
      id: 'dashboard',
      icon: Award,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      badge: 'Dashboard & Duty',
      title: '1. कोच प्रोफाइल, फ़ोटो व लाइव फ्लोर उपस्थिति',
      description:
        'अपनी प्रोफाइल फ़ोटो पर कैमरा आइकन दबाकर फ़ोटो तुरंत बदल सकते हैं। जिम फ्लोर पर अपनी लाइव उपस्थिति देखना और GPS से क्लॉक-इन व क्लॉक-आउट करना।',
      tips: 'सुबह व शाम फ्लोर पर आते ही GPS In अवश्य करें।',
    },
    {
      id: 'clients',
      icon: Users,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'Client Roster',
      title: '2. मेरे असाइन सदस्य व नया सदस्य जोड़ना',
      description:
        'आपको असाइन किए गए सभी पीटी सदस्यों की लाइव सूची। "+ नया सदस्य जोड़ें" बटन दबाकर कोच सीधे अपने तहत नया मेंबर रजिस्टर कर सकते हैं।',
      tips: 'क्लाइंट कार्ड पर क्लिक करके उसकी डाइट, वर्कआउट व शारीरिक माप खोलें।',
    },
    {
      id: 'auto_diet',
      icon: Utensils,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: 'Auto Diet Engine',
      title: '3. 1-क्लिक ऑटो डाइट इंजन (शाकाहारी / मांसाहारी)',
      description:
        'सदस्य के वजन, ऊंचाई और लक्ष्य के आधार पर BMR व TDEE का स्वतः कैल्क्युलेशन। "1-Click Pure Veg" या "1-Click Non-Veg" बटन दबाते ही पूर्ण 5-मील डाइट तैयार होकर सदस्य के ऐप में पहुंच जाती है।',
      tips: 'सदस्य का शाकाहारी/मांसाहारी चयन होने पर केवल वही डाइट बटन सक्रिय रहता है।',
    },
    {
      id: 'workout',
      icon: Dumbbell,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      badge: 'Workout Planner',
      title: '4. 6-दिवसीय कस्टमाइज़्ड वर्कआउट प्लानर',
      description:
        'सदस्य के लिए सोमवार से शनिवार का वर्कआउट स्प्लिट (चेस्ट, बैक, लेग्स, शोल्डर आदि)। एक्सरसाइज, सेट्स, रेप्स और रेस्ट टाइम कोच स्वयं एडिट कर सकते हैं।',
      tips: 'प्लान सेव करते ही सदस्य के मोबाइल ऐप के वर्कआउट सेक्शन में सिंक हो जाता है।',
    },
    {
      id: 'measurements',
      icon: Activity,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      badge: 'Body & PR Log',
      title: '5. शारीरिक माप व स्ट्रेंथ PR लॉग करना',
      description:
        '"नया माप दर्ज करें" बटन दबाकर सदस्य का सीना (Chest), कमर (Waist), डोले (Biceps), जांघ (Thighs) और बेंच प्रेस, स्क्वाट, डेडलिफ्ट का माप भरें।',
      tips: 'कोच द्वारा माप दर्ज करते ही सदस्य के डैशबोर्ड व प्रोग्रेस हॉल ऑफ फेम में तुरंत अपडेट हो जाता है।',
    },
    {
      id: 'goswara',
      icon: FileSpreadsheet,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      badge: 'Goswara & Export',
      title: '6. पीटी गोशवारा पत्रक व 1-क्लिक एक्सेल/पीडीएफ',
      description:
        'नेविगेशन में "📊 रिपोर्ट" पर जाकर अपने सभी पीटी मेंबर्स का संपूर्ण सत्र गोशवारा (कुल सत्र, उपस्थित सत्र, शेष सत्र, माह 1/2/3 विभाजन) देखें और एक्सेल (CSV) या प्रिंट/पीडीएफ में डाउनलोड करें।',
      tips: 'एक्सेल में हिंदी टेक्स्ट बिल्कुल साफ UTF-8 में खुलता है।',
    },
    {
      id: 'repair',
      icon: Wrench,
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      badge: 'Equipment Hotline',
      title: '7. जिम मशीन व उपकरण खराबी रिपोर्टिंग',
      description:
        'फ्लोर पर किसी भी मशीन की टूटी केबल, पुली, ढीले नट या ट्रेडमिल एरर की सूचना इस हेल्पडेस्क के माध्यम से सीधे एडमिन के व्हाट्सएप पर 1-क्लिक में भेजें।',
      tips: 'मरम्मत रिपोर्ट भेजने हेतु ऊपर "मशीन रिपेयर" टैब चुनें।',
    },
    {
      id: 'admin_support',
      icon: Phone,
      color: 'text-slate-800 bg-slate-100 border-slate-300',
      badge: 'Admin Hotline',
      title: '8. संचालक डायरेक्ट हेल्पलाइन व इमरजेंसी फर्स्ट-एड',
      description:
        'जिम व्यवस्थापक वैभव कौशिक (9826189001) से त्वरित संपर्क। जिम फ्लोर पर किसी सदस्य को चोट, चक्कर या मोच आने पर प्रमाणित फर्स्ट-एड प्रोटोकॉल उपलब्ध है।',
      tips: 'गंभीर स्थिति में तुरंत कॉल करें।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
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
                कोच {trainerName} • ट्रेनर ऐप फीचर्स गाइड, उपकरण मेंटेनेंस व एडमिन सपोर्ट
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
        <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('app_guide')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'app_guide'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>📱 ट्रेनर ऐप गाइड</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'equipment'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>🛠️ मशीन रिपेयर</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'support'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-cyan-600" />
            <span>📞 एडमिन हेल्पलाइन</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('first_aid')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'first_aid'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>❤️ फर्स्ट-एड</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {/* TAB 1: TRAINER APP FEATURES GUIDE (WHAT IS INSIDE TRAINER APP) */}
          {activeTab === 'app_guide' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-950">
                <div className="flex items-center gap-2 font-black text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-700" />
                  <span>ट्रेनर ऐप के मुख्य फीचर्स एवं कार्यप्रणाली</span>
                </div>
                <p className="text-[11px] text-cyan-900 mt-1 leading-relaxed">
                  यह विशेष रूप से कोच व ट्रेनर के लिए बनाया गया पोर्टल है। नीचे ट्रेनर ऐप के सभी 8 टूल्स की पूरी जानकारी दी गई है:
                </p>
              </div>

              <div className="space-y-3">
                {trainerAppFeatures.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-cyan-300 transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${item.color} border shrink-0`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                        {item.description}
                      </p>
                      <div className="text-[10px] text-cyan-800 font-semibold pl-9 flex items-center gap-1">
                        <span>💡 टिप:</span>
                        <span>{item.tips}</span>
                      </div>
                    </div>
                  );
                })}
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
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp पर एडमिन को भेजें</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADMIN & GYM OWNER HOTLINE */}
          {activeTab === 'support' && (
            <div className="space-y-4">
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
                    <Clock className="w-4 h-4" />
                    <span>शिफ्ट समय एवं अनुशासन</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    मॉर्निंग: प्रातः 05:30 से 10:30 AM | इवनिंग: सायं 04:30 से 09:30 PM। समय पर आगमन व प्रस्थान जीपीएस इन/आउट सुनिश्चित करें।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FIRST-AID PROTOCOLS */}
          {activeTab === 'first_aid' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>जिम फ्लोर इमरजेंसी एवं प्राथमिक उपचार गाइड</span>
                </h4>
                <p className="text-[11px] text-rose-900">
                  वर्कआउट के दौरान किसी सदस्य को समस्या होने पर तत्काल निम्नलिखित प्राथमिक उपचार करें:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-rose-700">
                    <span>1. चक्कर आना या बेहोशी (Dizziness / Fainting):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    तुरंत सदस्य को सपाट लिटाएं, पैर 12 इंच ऊपर उठाएं। कपड़े ढीले करें और ग्लूकोज/इलेक्ट्रोल पानी पिलाएं। सिर नीचे न झुकने दें।
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-amber-700">
                    <span>2. मांसपेशियों में ऐंठन (Muscle Cramps):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    प्रभावित हिस्से पर खिंचाव (stretching) दें, हल्के हाथों से मालिश करें। ओआरएस/नारियल पानी दें और थोड़ी देर आराम करने दें।
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-cyan-700">
                    <span>3. मोच या खिंचाव (Sprain / Strain - R.I.C.E):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>R</strong>est (आराम), <strong>I</strong>ce (बर्फ लगाएं), <strong>C</strong>ompression (क्रेप बैंडेज बांधें), <strong>E</strong>levation (ऊंचा रखें)। भारी वजन तुरंत हटवाएं।
                  </p>
                </div>

                <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-rose-900 font-bold text-[11px] flex items-center justify-between">
                  <span>सरकारी अस्पताल कांकेर इमरजेंसी: 108</span>
                  <a href="tel:108" className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px]">Call 108</a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>कौशिक फिटनेस • कोच सहायता पोर्टल</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
