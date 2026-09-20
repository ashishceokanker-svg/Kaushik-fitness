import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const appUrl = 'https://kaushik-fitness.vercel.app/';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTriggerInstall = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        (window as any).deferredPrompt = null;
      }
    } else {
      // Prompt not directly available (e.g. iOS or already installed or desktop browser)
      alert(
        'यदि आपके ब्राउज़र में ऑटो-पॉपअप नहीं आया है, तो कृपया नीचे दिए गए Android या iOS चरणों का पालन करके "Add to Home Screen" या "Install App" करें।'
      );
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/app-logo.png"
              alt="Kaushik Fitness App"
              className="w-10 h-10 rounded-2xl shadow-md border border-amber-400/60 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base leading-tight">
                  Kaushik Fitness Mobile App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 uppercase">
                  PWA WebAPK
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                मोबाइल ऐप स्थापना गाइड व सीधा लिंक (Install & Link)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Success Banner */}
          {installSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>ऐप सफलतापूर्वक आपके डिवाइस में स्थापित कर दिया गया है!</span>
            </div>
          )}

          {/* App Unified Link Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Web & Mobile App Unified URL (एक ही लिंक):
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/80 font-bold text-amber-900 font-mono">
                PWA Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 font-bold select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हुआ!' : 'लिंक कॉपी करें'}</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              💡 <strong>नोट:</strong> यही एक लिंक वेबसाइट और मोबाइल ऐप दोनों के लिए काम करता है। फोन में इस लिंक को खोलते ही "Install App" का विकल्प आ जाता है और यह फोन में एक अलग ऐप की तरह इंस्टॉल हो जाता है।
            </p>
          </div>

          {/* 1-Tap Install Action Button */}
          <div>
            <button
              type="button"
              onClick={handleTriggerInstall}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>📱 1-Tap Direct Install (ऐप अभी इंस्टॉल करें)</span>
            </button>
          </div>

          {/* QR Code + Mobile Scan Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  appUrl
                )}`}
                alt="App QR Code"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-900 font-bold text-xs">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>फोन कैमरा से QR कोड स्कैन करें</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                यदि आप लैपटॉप या कंप्यूटर पर हैं, तो अपने मोबाइल कैमरे से इस QR कोड को स्कैन करें। लिंक सीधे आपके मोबाइल में खुलेगी और ऐप इंस्टॉल हो जाएगी।
              </p>
            </div>
          </div>

          {/* Installation Instructions Tabs */}
          <div>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍎 iPhone (Safari)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pc')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === 'pc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💻 PC / Laptop
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
              {activeTab === 'android' && (
                <>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>मोबाइल क्रोम (Google Chrome) में <span className="font-mono font-bold text-slate-900">https://kaushik-fitness.vercel.app/</span> खोलें।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>स्क्रीन पर नीचे "Install Kaushik Fitness" का बैनर दिखेगा। यदि न दिखे, तो ऊपर दायें <strong>(⋮) 3 डॉट्स</strong> पर क्लिक करें।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p><strong>"Install app"</strong> या <strong>"Add to Home screen"</strong> पर टैप करें। ऐप तुरंत आपके फोन में डाउनलोड हो जाएगी।</p>
                  </div>
                </>
              )}

              {activeTab === 'ios' && (
                <>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>iPhone या iPad के <strong>Safari ब्राउज़र</strong> में लिंक खोलें।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>नीचे दिए गए <strong>Share बटन (⎋)</strong> पर टैप करें।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p>नीचे स्क्रॉल करके <strong>"Add to Home Screen (+)"</strong> चुनें और <strong>Add</strong> पर क्लिक करें।</p>
                  </div>
                </>
              )}

              {activeTab === 'pc' && (
                <>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>Google Chrome या Microsoft Edge ब्राउज़र में वेबसाइट खोलें।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>एड्रेस बार (URL बार) में दाईं ओर <strong>Install App (⤓)</strong> आइकन दिखेगा।</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p><strong>Install</strong> पर क्लिक करें। यह आपके कंप्यूटर पर एक अलग डेस्कटॉप ऐप की तरह खुल जाएगा।</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Kaushik Fitness PWA App</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
