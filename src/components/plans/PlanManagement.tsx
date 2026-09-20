import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { MembershipPlan, PTPlan } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  X,
  Layers,
  Calendar,
  IndianRupee,
  Check,
} from 'lucide-react';

interface PlanManagementProps {
  onBack?: () => void;
}

export const PlanManagement: React.FC<PlanManagementProps> = ({ onBack }) => {
  const { role, currentUser } = useAuth();
  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';
  const canManage = role === 'admin' || role === 'staff' || isDeveloper;

  const {
    membershipPlans,
    ptPlans,
    saveMembershipPlan,
    deleteMembershipPlan,
    savePTPlan,
    deletePTPlan,
    resetPlansToDefault,
  } = useGymData();

  const [activeTab, setActiveTab] = useState<'membership' | 'pt'>('membership');

  // Modals state
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [editingMembershipPlan, setEditingMembershipPlan] = useState<MembershipPlan | null>(null);

  const [isPTModalOpen, setIsPTModalOpen] = useState(false);
  const [editingPTPlan, setEditingPTPlan] = useState<PTPlan | null>(null);

  // Form states for Membership Plan
  const [mId, setMId] = useState('');
  const [mName, setMName] = useState('');
  const [mDuration, setMDuration] = useState<number>(1);
  const [mPrice, setMPrice] = useState<number>(1200);
  const [mBadge, setMBadge] = useState('');
  const [mDescription, setMDescription] = useState('');
  const [mFeatures, setMFeatures] = useState('');
  const [mIsActive, setMIsActive] = useState(true);

  // Form states for PT Plan
  const [ptId, setPtId] = useState('');
  const [ptName, setPtName] = useState('');
  const [ptDuration, setPtDuration] = useState<number>(1);
  const [ptPrice, setPtPrice] = useState<number>(2500);
  const [ptSessions, setPtSessions] = useState<number>(6);
  const [ptBadge, setPtBadge] = useState('');
  const [ptDescription, setPtDescription] = useState('');
  const [ptFeatures, setPtFeatures] = useState('');
  const [ptIsActive, setPtIsActive] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Membership Plan Modal
  const handleOpenAddMembership = () => {
    setEditingMembershipPlan(null);
    setMId(`plan_${Date.now()}`);
    setMName('');
    setMDuration(1);
    setMPrice(1200);
    setMBadge('New');
    setMDescription('पूर्ण जिम फ्लोर एक्सेस, कार्डियो एवं स्ट्रेंथ जोन');
    setMFeatures('फुल जिम फ्लोर एक्सेस, कार्डियो व स्ट्रेंथ इक्विपमेंट, लॉकर सुविधा');
    setMIsActive(true);
    setIsMembershipModalOpen(true);
  };

  const handleOpenEditMembership = (plan: MembershipPlan) => {
    setEditingMembershipPlan(plan);
    setMId(plan.id);
    setMName(plan.name);
    setMDuration(plan.durationMonths);
    setMPrice(plan.price);
    setMBadge(plan.badge || '');
    setMDescription(plan.description || '');
    setMFeatures(plan.features ? plan.features.join(', ') : '');
    setMIsActive(plan.isActive !== false);
    setIsMembershipModalOpen(true);
  };

  const handleSaveMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) {
      alert('कृपया प्लान का नाम दर्ज करें');
      return;
    }
    if (mPrice < 0) {
      alert('प्लान का मूल्य शून्य या उससे अधिक होना चाहिए');
      return;
    }

    const featureList = mFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const planData: MembershipPlan = {
      id: mId.trim() || `plan_${Date.now()}`,
      name: mName.trim(),
      durationMonths: Number(mDuration) || 1,
      price: Number(mPrice) || 0,
      badge: mBadge.trim() || undefined,
      description: mDescription.trim() || undefined,
      features: featureList.length > 0 ? featureList : undefined,
      isActive: mIsActive,
    };

    saveMembershipPlan(planData);
    setIsMembershipModalOpen(false);
    showToast(editingMembershipPlan ? 'सदस्यता प्लान सफलतापूर्वक अपडेट हुआ!' : 'नया सदस्यता प्लान सफलतापूर्वक जोड़ा गया!');
  };

  const handleDeleteMembership = (plan: MembershipPlan) => {
    if (confirm(`क्या आप वाकई "${plan.name}" को हटाना चाहते हैं?`)) {
      deleteMembershipPlan(plan.id);
      showToast('सदस्यता प्लान हटा दिया गया!');
    }
  };

  // Open PT Plan Modal
  const handleOpenAddPT = () => {
    setEditingPTPlan(null);
    setPtId(`pt_${Date.now()}`);
    setPtName('');
    setPtDuration(1);
    setPtPrice(2500);
    setPtSessions(6);
    setPtBadge('1-on-1');
    setPtDescription('प्रमाणित ट्रेनर के मार्गदर्शन में व्यक्तिगत वर्कआउट');
    setPtFeatures('प्रतिदिन 1-ऑन-1 ट्रेनर मार्गदर्शन, कस्टम डाइट चार्ट, फॉर्म सुधार');
    setPtIsActive(true);
    setIsPTModalOpen(true);
  };

  const handleOpenEditPT = (plan: PTPlan) => {
    setEditingPTPlan(plan);
    setPtId(plan.id);
    setPtName(plan.name);
    setPtDuration(plan.durationMonths);
    setPtPrice(plan.price);
    setPtSessions(plan.sessionsPerWeek || 6);
    setPtBadge(plan.badge || '');
    setPtDescription(plan.description || '');
    setPtFeatures(plan.features ? plan.features.join(', ') : '');
    setPtIsActive(plan.isActive !== false);
    setIsPTModalOpen(true);
  };

  const handleSavePT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptName.trim()) {
      alert('कृपया PT पैकेज का नाम दर्ज करें');
      return;
    }
    if (ptPrice < 0) {
      alert('पैकेज का मूल्य शून्य या उससे अधिक होना चाहिए');
      return;
    }

    const featureList = ptFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const planData: PTPlan = {
      id: ptId.trim() || `pt_${Date.now()}`,
      name: ptName.trim(),
      durationMonths: Number(ptDuration) || 1,
      price: Number(ptPrice) || 0,
      sessionsPerWeek: Number(ptSessions) || 6,
      badge: ptBadge.trim() || undefined,
      description: ptDescription.trim() || undefined,
      features: featureList.length > 0 ? featureList : undefined,
      isActive: ptIsActive,
    };

    savePTPlan(planData);
    setIsPTModalOpen(false);
    showToast(editingPTPlan ? 'PT पैकेज सफलतापूर्वक अपडेट हुआ!' : 'नया PT पैकेज सफलतापूर्वक जोड़ा गया!');
  };

  const handleDeletePT = (plan: PTPlan) => {
    if (plan.id === 'none') {
      alert('"No Personal Training" डिफ़ॉल्ट विकल्प को हटाया नहीं जा सकता');
      return;
    }
    if (confirm(`क्या आप वाकई "${plan.name}" को हटाना चाहते हैं?`)) {
      deletePTPlan(plan.id);
      showToast('PT पैकेज हटा दिया गया!');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('क्या आप सभी मेंबरशिप और PT प्लान्स को डिफ़ॉल्ट मानक दरों पर रीसेट करना चाहते हैं?')) {
      resetPlansToDefault();
      showToast('सभी प्लान्स डिफ़ॉल्ट दरों पर रीसेट हो गए!');
    }
  };

  if (!canManage) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-10">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-900">अनधिकृत प्रवेश (Unauthorized Access)</h2>
        <p className="text-slate-600 text-sm mt-2">
          प्लान्स व पैकेज प्रबंधन केवल एडमिन, डेवलपर और स्टाफ के लिए उपलब्ध है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-7xl mx-auto w-full">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-slate-950 transition-colors cursor-pointer"
                  title="वापस जाएं (Back)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="p-2 rounded-xl bg-slate-950 text-amber-400 font-black shadow-xs">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10.5px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full">
                  Admin • Staff • Developer Access
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  जिम सदस्यता एवं PT प्लान प्रबंधन (Plans & Packages)
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-900/90 max-w-2xl font-medium pt-1">
              कौशिक फिटनेस में सदस्यता योजनाएं और पर्सनल ट्रेनिंग (PT) शुल्क जोड़ें, संशोधित करें या हटाएं। सभी बदलाव सदस्य रजिस्ट्रेशन और फीस संग्रह में स्वतः लागू होंगे।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={activeTab === 'membership' ? handleOpenAddMembership : handleOpenAddPT}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-amber-300 hover:bg-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'membership' ? '+ नया मेंबरशिप प्लान' : '+ नया PT पैकेज'}</span>
            </button>
            <button
              onClick={handleResetDefaults}
              title="डिफ़ॉल्ट दरों पर रीसेट करें"
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/30 hover:bg-white/40 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">रीसेट</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('membership')}
          className={`py-3 px-5 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'membership'
              ? 'border-amber-500 text-amber-800 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-600" />
          <span>🏋️‍♂️ जिम सदस्यता योजनाएं (Membership Plans)</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[11px] font-mono font-bold">
            {membershipPlans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pt')}
          className={`py-3 px-5 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pt'
              ? 'border-cyan-500 text-cyan-800 bg-cyan-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-cyan-600" />
          <span>🥊 पर्सनल ट्रेनिंग योजनाएं (Personal Training Packages)</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-200 text-cyan-950 text-[11px] font-mono font-bold">
            {ptPlans.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MEMBERSHIP PLANS GRID */}
      {activeTab === 'membership' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span>सक्रिय जिम सदस्यता योजनाएं</span>
              <span className="text-xs text-slate-500 font-normal">({membershipPlans.filter((p) => p.isActive !== false).length} सक्रिय)</span>
            </h3>
            <button
              onClick={handleOpenAddMembership}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया प्लान जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-5 flex flex-col justify-between relative group hover:border-amber-400 hover:shadow-md ${
                  plan.isActive === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200'
                }`}
              >
                {/* Badge if available */}
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] shadow-xs uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between pr-1">
                    <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                      {plan.durationMonths} {plan.durationMonths === 1 ? 'माह (Month)' : 'माह (Months)'}
                    </span>
                    {plan.isActive === false && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        निष्क्रिय (Inactive)
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-base text-slate-900 mt-2 line-clamp-2">
                    {plan.name}
                  </h4>

                  <div className="mt-3 pb-3 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {formatINR(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {plan.durationMonths} माह
                    </span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditMembership(plan)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>संपादित करें (Edit)</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMembership(plan)}
                    title="प्लान हटाएं"
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL TRAINING (PT) PLANS GRID */}
      {activeTab === 'pt' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span>सक्रिय पर्सनल ट्रेनिंग (PT) पैकेज</span>
              <span className="text-xs text-slate-500 font-normal">({ptPlans.filter((p) => p.isActive !== false).length} सक्रिय)</span>
            </h3>
            <button
              onClick={handleOpenAddPT}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया PT पैकेज जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ptPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-5 flex flex-col justify-between relative group hover:border-cyan-400 hover:shadow-md ${
                  plan.isActive === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200'
                }`}
              >
                {/* Badge if available */}
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[10px] shadow-xs uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between pr-1">
                    <span className="text-[11px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/80">
                      {plan.durationMonths === 0 ? '0 माह' : `${plan.durationMonths} माह अवधि`}
                    </span>
                    {plan.sessionsPerWeek ? (
                      <span className="text-[10.5px] font-bold text-slate-500">
                        {plan.sessionsPerWeek} सत्र/सप्ताह
                      </span>
                    ) : null}
                  </div>

                  <h4 className="font-black text-base text-slate-900 mt-2 line-clamp-2">
                    {plan.name}
                  </h4>

                  <div className="mt-3 pb-3 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {formatINR(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {plan.durationMonths > 0 ? `/ ${plan.durationMonths} माह` : ''}
                    </span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditPT(plan)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-cyan-100 hover:text-cyan-900 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>संपादित करें (Edit)</span>
                  </button>
                  {plan.id !== 'none' && (
                    <button
                      onClick={() => handleDeletePT(plan)}
                      title="पैकेज हटाएं"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MEMBERSHIP PLAN */}
      {isMembershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingMembershipPlan ? 'सदस्यता प्लान संपादित करें' : '+ नया सदस्यता प्लान जोड़ें'}
                </h3>
              </div>
              <button
                onClick={() => setIsMembershipModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMembership} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्लान का नाम (Plan Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 3 Months Quarter (3 माह त्रैमासिक)"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    अवधि (महीनों में) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={mDuration}
                    onChange={(e) => setMDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शुल्क (Fee ₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mPrice}
                    onChange={(e) => setMPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black font-mono text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बैज / टैग (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Popular, Best Value, 20% Off"
                    value={mBadge}
                    onChange={(e) => setMBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    यूनिक आईडी / कोड
                  </label>
                  <input
                    type="text"
                    disabled={!!editingMembershipPlan}
                    placeholder="उदा. 3_months"
                    value={mId}
                    onChange={(e) => setMId(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none ${
                      editingMembershipPlan ? 'bg-slate-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संक्षिप्त विवरण (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="प्लान का संक्षिप्त परिचय..."
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सुविधाएं (Features - अल्पविराम (comma) से अलग करें)
                </label>
                <input
                  type="text"
                  placeholder="उदा. कार्डियो जोन, लॉकर सुविधा, डायट परामर्श"
                  value={mFeatures}
                  onChange={(e) => setMFeatures(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mIsActive"
                  checked={mIsActive}
                  onChange={(e) => setMIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="mIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  प्लान सक्रिय रखें (Show in registration & renewals)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMembershipModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {editingMembershipPlan ? 'प्लान अपडेट करें' : '+ प्लान सेव करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PT PLAN */}
      {isPTModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-900">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingPTPlan ? 'पर्सनल ट्रेनिंग पैकेज संपादित करें' : '+ नया PT पैकेज जोड़ें'}
                </h3>
              </div>
              <button
                onClick={() => setIsPTModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePT} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PT पैकेज का नाम (Package Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 3 Months Transformation PT"
                  value={ptName}
                  onChange={(e) => setPtName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    अवधि (महीने) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={ptDuration}
                    onChange={(e) => setPtDuration(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सत्र/सप्ताह
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={ptSessions}
                    onChange={(e) => setPtSessions(Math.max(1, parseInt(e.target.value) || 6))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शुल्क (Fee ₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ptPrice}
                    onChange={(e) => setPtPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बैज / टैग (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 1-on-1, Elite Pro"
                    value={ptBadge}
                    onChange={(e) => setPtBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    यूनिक आईडी / कोड
                  </label>
                  <input
                    type="text"
                    disabled={!!editingPTPlan}
                    placeholder="उदा. 3_months"
                    value={ptId}
                    onChange={(e) => setPtId(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none ${
                      editingPTPlan ? 'bg-slate-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संक्षिप्त विवरण (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="पैकेज का विवरण..."
                  value={ptDescription}
                  onChange={(e) => setPtDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सुविधाएं (Features - अल्पविराम से अलग करें)
                </label>
                <input
                  type="text"
                  placeholder="उदा. 1-ऑन-1 कोच, डायट चार्ट, फैट लॉस ट्रैकिंग"
                  value={ptFeatures}
                  onChange={(e) => setPtFeatures(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ptIsActive"
                  checked={ptIsActive}
                  onChange={(e) => setPtIsActive(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="ptIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  पैकेज सक्रिय रखें (Show in PT selection)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPTModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {editingPTPlan ? 'पैकेज अपडेट करें' : '+ पैकेज सेव करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
