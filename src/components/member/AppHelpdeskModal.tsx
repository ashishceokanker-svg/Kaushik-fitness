import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Home,
  KeyRound,
  Camera,
  Activity,
  Dumbbell,
  Utensils,
  User,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Info,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface AppHelpdeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'home' | 'pass' | 'photos' | 'body_index' | 'workout' | 'diet' | 'profile') => void;
  memberName?: string;
}

export const AppHelpdeskModal: React.FC<AppHelpdeskModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  memberName = 'Athlete',
}) => {
  if (!isOpen) return null;

  const [activeHelpTab, setActiveHelpTab] = useState<'guide' | 'query'>('guide');
  const [queryCategory, setQueryCategory] = useState('डाइट या वर्कआउट में सहायता');
  const [queryMessage, setQueryMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryMessage.trim()) return;

    const formattedMsg = `🏋️ *कौशिक फिटनेस - सदस्य सहायता अनुरोध*\n\nसदस्य: ${memberName}\nविषय: ${queryCategory}\nसंदेश: ${queryMessage}\nदिनांक: ${new Date().toLocaleDateString('hi-IN')}`;
    const waUrl = `https://wa.me/919826189001?text=${encodeURIComponent(formattedMsg)}`;
    window.open(waUrl, '_blank');

    setTicketSuccess(true);
    setQueryMessage('');
    setTimeout(() => setTicketSuccess(false), 5000);
  };

  const tabGuides = [
    {
      id: 'home' as const,
      name: 'होम (Home)',
      englishName: 'Dashboard & Daily Overview',
      icon: Home,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      whatIsIt: 'आपका दैनिक मुख्य फिटनेस डैशबोर्ड।',
      howItWorks:
        'यहाँ आपकी दैनिक वर्कआउट प्रगति, दिन का कैलोरी व जल लक्ष्य, जिम समय स्लॉट और फिटनेस विचार प्रदर्शित होता है।',
      bestUse: 'प्रतिदिन सुबह वर्कआउट का समय और फिटनेस टास्क देखने के लिए उपयोग करें।',
    },
    {
      id: 'pass' as const,
      name: 'डिजिटल पास (Pass)',
      englishName: 'Digital Entry & Attendance Card',
      icon: KeyRound,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
      whatIsIt: 'जिम में प्रवेश व उपस्थिति दर्ज करने का आपका डिजिटल पहचान पत्र।',
      howItWorks:
        'इसमें आपका फोटो, यूनिक मेंबर कोड, बारकोड/क्यूआर कोड, बैच समय और 4-अंक पिन चेक-इन शामिल है।',
      bestUse: 'जिम के गेट पर रिसेप्शन स्कैनर को यह पास दिखाकर दैनिक हाजिरी दर्ज करें।',
    },
    {
      id: 'photos' as const,
      name: 'फोटो गैलरी (Photos)',
      englishName: 'Progress & Transformation Gallery',
      icon: Camera,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      whatIsIt: 'आपकी शारीरिक प्रगति (Transformation) और जिम का वातावरण।',
      howItWorks:
        'यहाँ आप फिटनेस जर्नी की तस्वीरें, बदलाव (Before/After) और आधुनिक उपकरणों की तस्वीरें देख सकते हैं।',
      bestUse: 'अपनी फिटनेस में महीने दर महीने आए बदलाव को देखने और प्रेरित रहने के लिए।',
    },
    {
      id: 'body_index' as const,
      name: 'बॉडी इंडेक्स (Index)',
      englishName: 'BMI & Body Metrics Tracker',
      icon: Activity,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      whatIsIt: 'आपका बॉडी मास इंडेक्स (BMI), वजन और शारीरिक अनुपात।',
      howItWorks:
        'यह आपकी लंबाई, वजन और बॉडी फैट प्रतिशत का वैज्ञानिक विश्लेषण करता है और शारीरिक बदलाव को ग्राफ में दिखाता है।',
      bestUse: 'हर 15 दिन में अपना वजन और बॉडी पैरामीटर्स की प्रगति मापने के लिए।',
    },
    {
      id: 'workout' as const,
      name: 'वर्कआउट रूटीन (Workout)',
      englishName: '6-Day Workout Plan & Sets Tracker',
      icon: Dumbbell,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      whatIsIt: 'सोमवार से शनिवार तक का आपका व्यक्तिगत व्यायाम चार्ट।',
      howItWorks:
        'प्रत्येक दिन की एक्सरसाइज, उनके सेट्स, रेप्स और रेस्ट टाइम यहाँ क्रमबद्ध हैं। पूरा होने पर टिक (Checkbox) करें।',
      bestUse: 'जिम में बिना किसी भ्रम के सही तकनीक और प्लान के साथ कसरत करने के लिए।',
    },
    {
      id: 'diet' as const,
      name: 'डाइट व पोषण (Diet)',
      englishName: 'Nutrition Chart & Calorie Counter',
      icon: Utensils,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      whatIsIt: 'दैनिक संतुलित आहार एवं न्यूट्रिशन प्लान (Veg / Non-Veg)।',
      howItWorks:
        'आपकी दैनिक कैलोरी आवश्यकता और प्राथमिकता के अनुसार 5 मील्स का प्रोटीन, कार्ब्स और फैट्स के साथ विवरण।',
      bestUse: 'सही समय पर पौष्टिक भोजन लेकर फिटनेस लक्ष्य को तेजी से हासिल करने के लिए।',
    },
    {
      id: 'profile' as const,
      name: 'प्रोफ़ाइल एवं सेटिंग्स (Profile)',
      englishName: 'Account Settings & PIN Security',
      icon: User,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
      whatIsIt: 'सदस्यता प्रोफ़ाइल, 4-अंकीय एंट्री पिन एवं फ़ोटो सेटिंग्स।',
      howItWorks:
        'यहाँ आप अपनी प्रोफ़ाइल फ़ोटो बदल सकते हैं, 4-अंकीय कियोस्क एंट्री पिन अपडेट कर सकते हैं और फिटनेस लक्ष्य देख सकते हैं।',
      bestUse: 'फ़ोटो बदलने, पिन अपडेट करने या अपनी व्यक्तिगत जानकारी जांचने के लिए।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-xs">
              <HelpCircle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg leading-tight">सदस्य सहायता केंद्र (Member Helpdesk)</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase">
                  Support
                </span>
              </div>
              <p className="text-[11px] text-amber-100 mt-0.5">
                कौशिक फिटनेस • 24x7 सहायता, संपर्क एवं संपूर्ण ऐप गाइड
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

        {/* Toggle Mode */}
        <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveHelpTab('guide')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeHelpTab === 'guide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>📱 ऐप फीचर्स गाइड</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHelpTab('query')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeHelpTab === 'query'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>💬 समस्या / पूछताछ टिकट</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {activeHelpTab === 'guide' ? (
            <>
              {/* Welcome Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      नमस्ते {memberName}, कौशिक फिटनेस ऐप में आपका स्वागत है!
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      इस ऐप को आपकी संपूर्ण फिटनेस यात्रा को आसान व 100% डिजिटल बनाने के लिए डिज़ाइन किया गया है। नीचे सभी मुख्य टैब्स की जानकारी दी गई है:
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Guides List */}
              <div className="space-y-2.5">
                {tabGuides.map((guide, idx) => {
                  const GuideIcon = guide.icon;
                  return (
                    <div
                      key={guide.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2 transition-all hover:border-amber-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border ${guide.color} shrink-0`}>
                            <GuideIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                              <h5 className="font-black text-xs text-slate-900">{guide.name}</h5>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block leading-none">
                              {guide.englishName}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onNavigateTab(guide.id);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
                          title={`${guide.name} खोलें`}
                        >
                          <span>खोलें</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800">📌 यह क्या है: </span>
                          <span className="text-slate-600">{guide.whatIsIt}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">⚙️ कैसे काम करता है: </span>
                          <span className="text-slate-600 leading-relaxed">{guide.howItWorks}</span>
                        </div>
                        <div className="pt-0.5 border-t border-slate-200/60 flex items-start gap-1 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[10.5px]">
                            <strong className="font-bold">सर्वोत्तम उपयोग: </strong>
                            {guide.bestUse}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* TAB 2: QUICK QUERY TICKET */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>जिम एडमिन व कोच को अपनी समस्या / सवाल भेजें</span>
                </h4>
                <p className="text-[11px] text-emerald-900">
                  डाइट, वर्कआउट, उपकरण, 4-अंकीय पिन या ऐप से संबंधित कोई भी सवाल आप सीधे कोच व एडमिन को भेज सकते हैं।
                </p>
              </div>

              {ticketSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आपका संदेश व्हाट्सएप पर प्रेषित हो गया है!</span>
                </div>
              )}

              <form onSubmit={handleSendQuery} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पूछताछ का विषय (Category) *
                  </label>
                  <select
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="डाइट या वर्कआउट में सहायता">🥗 डाइट या वर्कआउट में मार्गदर्शन</option>
                    <option value="4-अंकीय पिन या पास सहायता">🔑 4-अंकीय पिन या पास सहायता</option>
                    <option value="मशीन या उपकरण खराबी रिपोर्ट">🛠️ मशीन या जिम उपकरण खराबी</option>
                    <option value="शारीरिक माप व प्रोग्रेस ट्रैकर">📈 शारीरिक माप व प्रोग्रेस ट्रैकर</option>
                    <option value="लॉकर, पानी या अन्य सुविधा">🚰 लॉकर, पानी या जिम सुविधा</option>
                    <option value="अन्य सामान्य पूछताछ">💬 अन्य सामान्य पूछताछ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आपका संदेश / विवरण *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="कृपया अपनी समस्या या सवाल विस्तार से लिखें..."
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp पर भेजें (Send to Gym Admin)</span>
                </button>
              </form>
            </div>
          )}

          {/* Gym Direct Contact Support Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">कौशिक फिटनेस सीधी हेल्पलाइन</h5>
                <p className="text-[10px] text-slate-300">संचालक: वैभव कौशिक (Vaibhav Kaushik)</p>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-300 space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>जिम समय: प्रातः 05:30 से 10:30 • सायं 04:30 से 09:30</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <a
                href="tel:9826189001"
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>कॉल: 9826189001</span>
              </a>
              <a
                href="https://wa.me/919826189001?text=नमस्ते%20वैभव%20सर,%20मैं%20कौशिक%20फिटनेस%20का%20मेंबर%20बात%20कर%20रहा%20हूँ।%20मुझे%20सहायता%20चाहिए।"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp चैट</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Kaushik Fitness • डिजिटल सहायता केंद्र</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            समझ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
