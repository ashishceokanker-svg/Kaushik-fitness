import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { GymEnquiry, EnquiryStatus } from '../../types';
import { MEMBERSHIP_PRICING } from '../../utils/formatters';
import { 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  UserX, 
  Filter, 
  Calendar, 
  Sparkles,
  Search,
  Dumbbell
} from 'lucide-react';

export const EnquiryManagement: React.FC = () => {
  const { enquiries, updateEnquiryStatus } = useGymData();
  const [filterStatus, setFilterStatus] = useState<EnquiryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Stats
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === 'new').length;
  const contactedCount = enquiries.filter((e) => e.status === 'contacted').length;
  const trialCount = enquiries.filter((e) => e.status === 'trial_scheduled').length;
  const joinedCount = enquiries.filter((e) => e.status === 'joined').length;

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesFilter = filterStatus === 'all' || enq.status === filterStatus;
    const matchesSearch =
      enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.phone.includes(searchQuery) ||
      (enq.message && enq.message.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            NEW LEAD
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-700" />
            CONTACTED
          </span>
        );
      case 'trial_scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-700" />
            TRIAL BOOKED
          </span>
        );
      case 'joined':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-700" />
            CONVERTED / JOINED
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            CLOSED
          </span>
        );
    }
  };

  const handleStatusUpdate = (id: string, newStatus: EnquiryStatus) => {
    updateEnquiryStatus(id, newStatus, noteInput || undefined);
    setActiveEditingId(null);
    setNoteInput('');
  };

  const openWhatsApp = (enq: GymEnquiry) => {
    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `नमस्ते ${enq.name} जी! कौशिक फिटनेस कांकेर (Kaushik Fitness Kanker) की ओर से संदेश। आपने ${MEMBERSHIP_PRICING[enq.interestedPackage]?.label || enq.interestedPackage} पैकेज और ${enq.fitnessGoal} के बारे में पूछताछ की थी। क्या आप फ्री जिम विजिट व डेमो वर्कआउट के लिए आना चाहेंगे?`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Lead Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Gym Leads & Enquiries Management
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              जिम इन्क्वायरी एवं नए लीड्स (Enquiries & Leads)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              कौशिक फिटनेस कांकेर - एडमिशन इन्क्वायरी, डेमो वर्कआउट व व्हाट्सएप फॉलो-अप
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="नाम या फोन खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Lead Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className={`text-[10px] uppercase font-bold ${filterStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>कुल लीड्स</div>
            <div className="text-2xl font-black font-mono mt-1">{totalCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('new')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterStatus === 'new'
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              नई इन्क्वायरी
            </div>
            <div className="text-2xl font-black font-mono mt-1">{newCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('contacted')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterStatus === 'contacted'
                ? 'bg-cyan-600 border-cyan-700 text-white shadow-xs'
                : 'bg-cyan-50/60 border-cyan-200 text-cyan-900 hover:bg-cyan-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">संपर्क किया</div>
            <div className="text-2xl font-black font-mono mt-1">{contactedCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('trial_scheduled')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterStatus === 'trial_scheduled'
                ? 'bg-purple-600 border-purple-700 text-white shadow-xs'
                : 'bg-purple-50/60 border-purple-200 text-purple-900 hover:bg-purple-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">डेमो / ट्रायल</div>
            <div className="text-2xl font-black font-mono mt-1">{trialCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('joined')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterStatus === 'joined'
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">एडमिशन पूर्ण</div>
            <div className="text-2xl font-black font-mono mt-1">{joinedCount}</div>
          </button>
        </div>
      </div>

      {/* Leads List Feed */}
      <div className="space-y-3">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
            इस फिल्टर के तहत कोई इन्क्वायरी नहीं मिली।
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                {/* Left: Contact Info & Goal */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="text-base font-bold text-slate-900">{enq.name}</h4>
                    {getStatusBadge(enq.status)}
                    {enq.wantsPersonalTraining && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        PT REQUESTED
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-900 font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 text-cyan-600" />
                      {enq.phone}
                    </span>
                    <span>•</span>
                    <span className="capitalize text-amber-800 font-semibold">
                      लक्ष्य: {enq.fitnessGoal.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span>
                      पैकेज: <strong className="text-slate-800">{MEMBERSHIP_PRICING[enq.interestedPackage]?.label || enq.interestedPackage}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      बैच समय व संदेश:
                    </div>
                    <div>
                      ⏰ <span className="font-semibold text-cyan-800">{enq.preferredTiming}</span>
                      {enq.message && <span className="text-slate-600 ml-2">"{enq.message}"</span>}
                    </div>
                    {enq.followUpNote && (
                      <div className="mt-1 pt-1 border-t border-slate-200 text-[11px] text-amber-800 font-medium">
                        📝 फॉलो-अप नोट: {enq.followUpNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions & Status Change */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* WhatsApp Follow-up Button */}
                  <button
                    onClick={() => openWhatsApp(enq)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    title="Send WhatsApp Greeting"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp संपर्क
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusUpdate(enq.id, e.target.value as EnquiryStatus)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="trial_scheduled">Trial Scheduled</option>
                    <option value="joined">Joined Member</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
