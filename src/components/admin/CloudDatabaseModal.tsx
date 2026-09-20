import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  Database,
  Key,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Radio,
} from 'lucide-react';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  removeFirebaseConfig,
  testFirebaseConnection,
  parseFirebaseConfigSnippet,
  isFirebaseConfigured,
  FirebaseConfig,
} from '../../services/firebase';
import {
  pushAllLocalDataToFirestore,
  pullAllFirestoreDataToLocal,
} from '../../services/firebaseSync';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed?: () => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({
  isOpen,
  onClose,
  onDataRefreshed,
}) => {
  const [configSnippet, setConfigSnippet] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'sync' | 'rules'>('status');

  const [isConfigured, setIsConfigured] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Push / Pull progress state
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ status: string; percent: number } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getFirebaseConfig();
      if (cfg) {
        setIsConfigured(true);
        setApiKey(cfg.apiKey || '');
        setProjectId(cfg.projectId || '');
        setAppId(cfg.appId || '');
        setAuthDomain(cfg.authDomain || '');
      } else {
        setIsConfigured(false);
      }
      setTestResult(null);
      setSyncResult(null);
      setSyncProgress(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSnippetPaste = (val: string) => {
    setConfigSnippet(val);
    const parsed = parseFirebaseConfigSnippet(val);
    if (parsed) {
      setApiKey(parsed.apiKey || '');
      setProjectId(parsed.projectId || '');
      setAppId(parsed.appId || '');
      setAuthDomain(parsed.authDomain || '');
    }
  };

  const handleSaveConfig = async () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setTestResult({ success: false, message: 'कृपया API Key और Project ID दर्ज करें।' });
      return;
    }

    const cfg: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      appId: appId.trim() || '1:123456789:web:koushik',
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
    };

    saveFirebaseConfig(cfg);
    setIsConfigured(true);

    // Test connection automatically
    setTestingConnection(true);
    setTestResult(null);
    const res = await testFirebaseConnection(cfg);
    setTestingConnection(false);
    setTestResult(res);

    if (res.success) {
      setActiveTab('sync');
    }
  };

  const handleTestOnly = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const currentCfg = getFirebaseConfig();
    const res = await testFirebaseConnection(currentCfg || undefined);
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleDisconnect = () => {
    if (confirm('क्या आप Firebase डिस्कनेक्ट करके वापस लोकल स्टोरेज मोड में जाना चाहते हैं?')) {
      removeFirebaseConfig();
      setIsConfigured(false);
      setApiKey('');
      setProjectId('');
      setAppId('');
      setAuthDomain('');
      setConfigSnippet('');
      setTestResult({ success: true, message: 'Firebase डिस्कनेक्ट हो गया। सिस्टम अब सुरक्षित लोकल मोड में है।' });
    }
  };

  const handlePushAll = async () => {
    setIsPushing(true);
    setSyncResult(null);
    const res = await pushAllLocalDataToFirestore((status, percent) => {
      setSyncProgress({ status, percent });
    });
    setIsPushing(false);

    if (res.success) {
      setSyncResult({
        success: true,
        message: `सफलतापूर्वक ${res.count} रिकॉर्ड्स Firebase Firestore में अपलोड हो गए! अब सभी मोबाइल्स पर लाइव डेटा दिखेगा।`,
      });
      if (onDataRefreshed) onDataRefreshed();
    } else {
      setSyncResult({ success: false, message: res.error || 'अपलोड में त्रुटि हुई।' });
    }
  };

  const handlePullAll = async () => {
    if (!confirm('क्या आप Firebase क्लाउड से सारा डेटा डाउनलोड करके लोकल डेटाबेस रिफ्रेश करना चाहते हैं?')) return;
    setIsPulling(true);
    setSyncResult(null);
    const res = await pullAllFirestoreDataToLocal((status, percent) => {
      setSyncProgress({ status, percent });
    });
    setIsPulling(false);

    if (res.success) {
      setSyncResult({
        success: true,
        message: `सफलतापूर्वक ${res.count} रिकॉर्ड्स Firebase से डाउनलोड हो गए!`,
      });
      if (onDataRefreshed) onDataRefreshed();
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setSyncResult({ success: false, message: res.error || 'डाउनलोड में त्रुटि हुई।' });
    }
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesCode);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-heading">Firebase Cloud Database Setup</h2>
                {isConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cloud Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Local Storage Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                लाइव डेटा सिंक — एडमिन, ट्रेनर व मेंबर्स के मोबाइल्स पर एक साथ अपडेट
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" /> स्टेटस व अवलोकन
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'setup'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" /> Firebase Keys जोड़ें
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> डेटा सिंक (Push / Pull)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> सुरक्षा रूल्स
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    isConfigured
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {isConfigured ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {isConfigured ? 'Firebase Firestore लाइव सक्रिय है' : 'वर्तमान में लोकल स्टोरेज मोड सक्रिय है'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isConfigured
                      ? `प्रोजेक्ट ID: "${projectId}" से जुड़ा हुआ है। जब भी आप या ट्रेनर कोई बदलाव करेंगे, यह डेटा Firestore क्लाउड पर सुरक्षित लाइव सिंक होगा।`
                      : 'अभी डेटा केवल आपके इसी ब्राउज़र में सुरक्षित है। मोबाइल ऐप और अन्य डिवाइसेस पर लाइव डेटा देखने के लिए Google Firebase से कनेक्ट करें।'}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleTestOnly}
                  disabled={testingConnection || !isConfigured}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-800 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  {testingConnection ? 'कनेक्शन जाँचा जा रहा है...' : 'कनेक्शन टेस्ट करें (Test Ping)'}
                </button>

                {!isConfigured ? (
                  <button
                    onClick={() => setActiveTab('setup')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-xs text-slate-950 flex items-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" /> Firebase Keys दर्ज करें
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('sync')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> लोकल डेटा क्लाउड में अपलोड करें
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> डिस्कनेक्ट
                    </button>
                  </>
                )}
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* 3 Step Quick Overview */}
              <div className="border-t border-slate-200 pt-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Firebase से जोड़ने के 3 सरल चरण:
                </h5>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong>
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline inline-flex items-center gap-1"
                      >
                        Firebase Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </strong>{' '}
                    पर फ्री में नया प्रोजेक्ट बनाएं।
                  </li>
                  <li>
                    <strong>Firestore Database</strong> बनाकर <strong>Test mode</strong> इनेबल करें।
                  </li>
                  <li>
                    <strong>Project Settings</strong> में Web App (`&lt;/&gt;`) बनाकर उसकी कॉन्फ़िग यहाँ पेस्ट करें।
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: SETUP KEYS */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firebase Code Snippet पेस्ट करें (Paste Complete Config)
                </label>
                <textarea
                  rows={4}
                  value={configSnippet}
                  onChange={(e) => handleSnippetPaste(e.target.value)}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "koushik-fitness-123",\n  appId: "1:12345:web:abcdef"\n};`}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Firebase Console से कॉपी किया गया पूरा कोड यहाँ पेस्ट करें, नीचे की फील्ड्स अपने आप भर जाएंगी।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSyB..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="koushik-fitness-xxxxx"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Auth Domain (वैकल्पिक)</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="koushik-fitness.firebaseapp.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={testingConnection}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {testingConnection ? 'जाँच और सहेज रहे हैं...' : 'सुरक्षित सहेजें और कनेक्ट करें (Save & Connect)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" /> 1-Click डेटाबेस सिंक टूल
                </h4>
                <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                  आपके कंप्यूटर/ब्राउज़र में मौजूद सभी 5 PT मेंबर्स, ट्रेनर, एडमिन, डाइट, वर्कआउट, अटेंडेंस और इन्वेंट्री डेटा को सीधे Firebase क्लाउड पर सुरक्षित अपलोड करें।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Push Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">लोकल डेटा को Firebase में भेजें (Push)</h5>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    ब्राउज़र का वर्तमान डेटाबेस Firestore में अपलोड करता है।
                  </p>
                  <button
                    onClick={handlePushAll}
                    disabled={isPushing || !isConfigured}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {isPushing ? 'क्लाउड में अपलोड हो रहा है...' : 'Upload All to Firebase Cloud'}
                  </button>
                </div>

                {/* Pull Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold mb-2">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">क्लाउड से डेटा डाउनलोड करें (Pull)</h5>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Firebase से नवीनतम डेटा डाउनलोड करके इस ब्राउज़र को सिंक करता है।
                  </p>
                  <button
                    onClick={handlePullAll}
                    disabled={isPulling || !isConfigured}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    {isPulling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                    {isPulling ? 'डाउनलोड हो रहा है...' : 'Download from Firebase'}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {syncProgress && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{syncProgress.status}</span>
                    <span>{syncProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${syncProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    syncResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {syncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{syncResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Firestore Security Rules:</strong> यदि Firebase Console में <em>"permission-denied"</em> की एरर आए, तो Firebase Console में जाकर <strong>Firestore Database &gt; Rules</strong> टैब में नीचे दिया गया कोड पेस्ट करके <strong>Publish</strong> कर दें:
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto border border-slate-800">
                  {firestoreRulesCode}
                </pre>
                <button
                  onClick={copyRules}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  {copiedRules ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedRules ? 'Copied!' : 'Copy Rules'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Koushik Fitness Kanker Cloud Synchronization</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
