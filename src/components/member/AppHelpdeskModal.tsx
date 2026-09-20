import React from 'react';
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
} from 'lucide-react';

interface AppHelpdeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'home' | 'pass' | 'photos' | 'body_index' | 'workout' | 'diet' | 'profile') => void;
}

export const AppHelpdeskModal: React.FC<AppHelpdeskModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

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
        'ऐप खोलते ही सबसे पहले यह स्क्रीन दिखती है। यहाँ आपकी आज की वर्कआउट प्रगति (कितने व्यायाम पूरे हुए), दिन का कैलोरी व जल सेवन का लक्ष्य, आपका जिम समय स्लॉट और आज का प्रेरणादायक फिटनेस विचार प्रदर्शित होता है।',
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
        'इसमें आपका फोटो, यूनिक मेंबर कोड, बारकोड/क्यूआर कोड, बैच समय और सदस्यता की अंतिम वैधता तिथि (Expiry Date) शामिल है। बिना किसी फिजिकल कार्ड के सिर्फ फोन दिखाकर उपस्थिति लगा सकते हैं।',
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
        'यहाँ आप फिटनेस जर्नी की तस्वीरें, बदलाव (Before/After) और कौशिक फिटनेस के आधुनिक उपकरणों व जिम की सुविधाओं की उच्च गुणवत्ता वाली तस्वीरें देख सकते हैं।',
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
        'यह आपकी लंबाई, वजन और बॉडी फैट प्रतिशत का वैज्ञानिक विश्लेषण करता है और बताता है कि आप अंडरवेट, नॉर्मल, ओवरवेट या फिट श्रेणी में हैं। साथ ही आपका लक्षित वजन भी ट्रैक करता है।',
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
        'प्रत्येक दिन की एक्सरसाइज (Chest, Back, Legs, Shoulders, Arms, Cardio), उनके सेट्स, रेप्स और रेस्ट टाइम यहाँ क्रमबद्ध हैं। जैसे ही आप कोई व्यायाम पूरा करें, उस पर टिक (Checkbox) कर दें।',
      bestUse: 'जिम में बिना किसी भ्रम के सही तकनीक और प्लान के साथ कसरत करने के लिए।',
    },
    {
      id: 'diet' as const,
      name: 'डाइट व पोषण (Diet)',
      englishName: 'Nutrition Chart & Calorie Counter',
      icon: Utensils,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      whatIsIt: 'दैनिक संतुलित आहार एवं न्यूट्रिशन प्लान।',
      howItWorks:
        'आपकी दैनिक कैलोरी आवश्यकता (जैसे 2600 kcal) और लक्ष्य (वजन कम करना/मसल्स गेन) के अनुसार 5 मील्स (प्री-वर्कआउट, नाश्ता, लंच, स्नैक्स, डिनर) का प्रोटीन, कार्ब्स और फैट्स के साथ विवरण।',
      bestUse: 'सही समय पर पौष्टिक भोजन लेकर फिटनेस लक्ष्य को तेजी से हासिल करने के लिए।',
    },
    {
      id: 'profile' as const,
      name: 'प्रोफ़ाइल एवं बिल (Profile)',
      englishName: 'Membership Account & Tax Invoices',
      icon: User,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
      whatIsIt: 'सदस्यता खाता, बिलिंग एवं ऐप सेटिंग्स।',
      howItWorks:
        'यहाँ आपकी सदस्यता की अंतिम तिथि, फीस भुगतान स्थिति (Paid/Pending), जीएसटी टैक्स रसीद (Tax Invoice/Bill) डाउनलोड बटन, यह सहायता केंद्र (Helpdesk) और सुरक्षित लॉगआउट बटन है।',
      bestUse: 'फीस रसीद डाउनलोड करने या अपनी सदस्यता नवीनीकरण तिथि जांचने के लिए।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-xs">
              <HelpCircle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base leading-tight">सहायता केंद्र एवं ऐप गाइड</h3>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded uppercase">
                  Guide
                </span>
              </div>
              <p className="text-[10.5px] text-amber-100 leading-tight">
                कौन सा टैब क्या है और कैसे काम करता है — पूरी जानकारी
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

        {/* Scrollable Content */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {/* Welcome Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  कौशिक फिटनेस ऐप में आपका स्वागत है!
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  इस ऐप को आपकी संपूर्ण फिटनेस यात्रा को आसान व 100% डिजिटल बनाने के लिए डिज़ाइन किया गया है। नीचे सभी 7 मुख्य टैब्स की विस्तृत जानकारी दी गई है:
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
                  {/* Top Bar of Card */}
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

                  {/* Details */}
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

          {/* Gym Direct Contact Support Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">सीधी सहायता व पूछताछ (Direct Support)</h5>
                <p className="text-[10px] text-slate-300">जिम संचालक एवं ट्रेनर सहायता</p>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-300 space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>कौशिक फिटनेस, बस स्टैंड के पास, कांकेर (छ.ग.)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>जिम समय: प्रातः 05:30 से 10:30 • सायं 04:30 से 09:30</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <a
                href="tel:919876543210"
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>कॉल करें</span>
              </a>
              <a
                href="https://wa.me/919876543210?text=नमस्ते,%20कौशिक%20फिटनेस%20ऐप%20के%20संबंध%20में%20सहायता%20चाहिए।"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Kaushik Fitness • डिजिटल गाइड</span>
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
