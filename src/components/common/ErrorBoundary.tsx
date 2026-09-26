import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Kaushik Fitness App:', error, errorInfo);

    // Auto-recover from stale dynamic chunk imports on PWA updates
    const msg = error?.message || '';
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch')
    ) {
      const hasAutoReloaded = sessionStorage.getItem('kf_auto_reloaded_chunk');
      if (!hasAutoReloaded) {
        sessionStorage.setItem('kf_auto_reloaded_chunk', '1');
        window.location.reload();
      }
    }
  }

  private handleHardReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    sessionStorage.clear();
    window.location.reload();
  };

  private handleSoftReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                कौशिक फिटनेस • Kaushik Fitness
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                नया अपडेट उपलब्ध है
              </h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                ब्राउज़र में पुराना कैश होने के कारण स्क्रीन लोड नहीं हो सकी। कृपया नीचे दिए बटन से नया अपडेट लोड करें:
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleHardReload}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>कैश साफ़ कर पुनः लोड करें (Clean Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleSoftReload}
                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-98 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>सामान्य रीफ्रेश (Reload)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
              iPhone / iOS यूज़र्स: सफारी सेटिंग्स में जाकर <em>"Clear History and Website Data"</em> भी कर सकते हैं।
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
