import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { Staff } from '../../types';
import { formatINR, formatDate, DEFAULT_PT_PLANS, DEFAULT_MEMBERSHIP_PLANS, PT_PRICING } from '../../utils/formatters';
import { AddStaffModal } from './AddStaffModal';
import { ExpirationCountdown } from '../common/ExpirationCountdown';
import { ChangePinModal } from '../admin/ChangePinModal';
import {
  Users,
  Award,
  UserPlus,
  Dumbbell,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  FileText,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Eye,
  X,
  Download,
  ExternalLink,
  KeyRound,
  Package,
  Sparkles,
  Settings,
} from 'lucide-react';

interface StaffManagementProps {
  onNavigateToPlans?: () => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ onNavigateToPlans }) => {
  const { role } = useAuth();
  const { staff, members, ptPlans, membershipPlans } = useGymData();
  const [activeTab, setActiveTab] = useState<'instructors' | 'regular'>('instructors');
  const [planViewTab, setPlanViewTab] = useState<'pt' | 'membership'>('pt');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>('staff-2');
  const [selectedDocStaff, setSelectedDocStaff] = useState<Staff | null>(null);
  const [pinTargetUser, setPinTargetUser] = useState<{ id: string; name: string; code?: string; role?: string; currentPin?: string } | null>(null);

  // Exclude Vaibhav Kaushik (Owner/Admin) and Ashish Dey (Developer/CEO) from staff & front desk
  const isExcludedStaff = (s: Staff) => {
    const nameLower = (s.name || '').toLowerCase();
    return (
      nameLower.includes('vaibhav') ||
      nameLower.includes('ashish') ||
      s.id === 'usr-1' ||
      s.id === 'staff-1' ||
      s.id === 'usr-dev' ||
      s.phone === '9826189001' ||
      s.phone === '9244249975' ||
      s.role === 'admin'
    );
  };

  const instructors = staff.filter((s) => (s.staffType === 'instructor' || s.role === 'trainer') && !isExcludedStaff(s));
  const regularStaff = staff.filter((s) => (s.staffType === 'regular' || s.role === 'staff') && !isExcludedStaff(s));

  // Dynamic Live PT and Membership Plans
  const activePtPlans = (ptPlans && ptPlans.length > 0 ? ptPlans : DEFAULT_PT_PLANS).filter(
    (p) => p.isActive !== false && p.id !== 'none'
  );
  const activeMembershipPlans = (membershipPlans && membershipPlans.length > 0 ? membershipPlans : DEFAULT_MEMBERSHIP_PLANS).filter(
    (p) => p.isActive !== false
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            स्टाफ व पर्सनल ट्रेनर डायरेक्टरी (Staff & PT Trainers)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            जिम इंस्ट्रक्टर्स, PT क्लाइंट्स रोस्टर, बायोडाटा, स्थायी पता एवं दस्तावेज़ प्रबंधन
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPlans && (
            <button
              onClick={onNavigateToPlans}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-600" />
              <span>प्लान्स प्रबंधित करें</span>
            </button>
          )}

          {(role === 'admin' || role === 'staff') && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + नया स्टाफ / ट्रेनर जोड़ें
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Membership & PT Plans Overview Banner */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                जिम सदस्यता व पर्सनल ट्रेनिंग (PT) प्लान्स दरें
              </h3>
              <p className="text-[11px] text-slate-500">
                वर्तमान में सक्रिय प्लान्स - कोई भी बदलाव यहाँ तुरंत अपडेट होगा
              </p>
            </div>
          </div>

          {/* Tab switcher between PT plans and Membership plans */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setPlanViewTab('pt')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planViewTab === 'pt'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>PT प्लान्स ({activePtPlans.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setPlanViewTab('membership')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planViewTab === 'membership'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>सदस्यता प्लान्स ({activeMembershipPlans.length})</span>
            </button>
          </div>
        </div>

        {/* PT Plans Grid */}
        {planViewTab === 'pt' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePtPlans.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-cyan-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{pkg.name}</span>
                      <span className="text-[10px] text-cyan-800 font-semibold">
                        {pkg.durationMonths} माह अवधि {pkg.sessionsPerWeek ? `• ${pkg.sessionsPerWeek} सेशंस/सप्ताह` : ''}
                      </span>
                    </div>
                    <span className="text-base font-black text-cyan-700 font-mono shrink-0">
                      {formatINR(pkg.price)}
                    </span>
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{pkg.description}</p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                  <span>1-on-1 कोचिंग</span>
                  <span className="text-emerald-700 font-bold">
                    {pkg.features?.[0] || 'डाइट व रूटीन शामिल'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Membership Plans Grid */}
        {planViewTab === 'membership' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeMembershipPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{plan.name}</span>
                      <span className="text-[10px] text-amber-800 font-semibold">
                        {plan.durationMonths} माह अवधि
                      </span>
                    </div>
                    {plan.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-amber-700 font-mono mt-2">
                    {formatINR(plan.price)}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                  <span>जिम फ्लोर एक्सेस</span>
                  <span className="text-emerald-700 font-bold">
                    {plan.features?.[0] || 'कार्डियो व स्ट्रेंथ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('instructors')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'instructors'
              ? 'border-cyan-600 text-cyan-800 bg-cyan-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-cyan-600" />
          जिम इंस्ट्रक्टर्स व कोचेस ({instructors.length})
        </button>
        <button
          onClick={() => setActiveTab('regular')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'regular'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-600" />
          फ्रंट डेस्क व मैनेजमेंट स्टाफ ({regularStaff.length})
        </button>
      </div>

      {/* TAB 1: INSTRUCTORS & PT CLIENTS */}
      {activeTab === 'instructors' && (
        <div className="space-y-4">
          {instructors.map((trainer) => {
            const assignedMembers = members.filter((m) => m.assignedTrainerId === trainer.id || m.personalTraining);
            const isExpanded = expandedTrainerId === trainer.id;

            return (
              <div
                key={trainer.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Trainer Header Summary Card */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {trainer.avatarUrl ? (
                      <img
                        src={trainer.avatarUrl}
                        alt={trainer.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-cyan-300 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-xl font-black text-cyan-900 shrink-0 shadow-sm">
                        {trainer.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{trainer.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                          {trainer.staffCode}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          Active Coach
                        </span>
                      </div>
                      <div className="text-xs text-cyan-700 font-semibold">{trainer.designation}</div>
                      {trainer.bio && (
                        <p className="text-xs text-slate-500 max-w-xl">{trainer.bio}</p>
                      )}

                      {/* Personal Details: Father, DOB, Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-600">
                        {trainer.fatherName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>पिता: <strong className="text-slate-800">{trainer.fatherName}</strong></span>
                          </div>
                        )}
                        {trainer.dob && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>जन्म तिथि: <strong className="text-slate-800">{formatDate(trainer.dob)}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>फोन: <strong className="text-slate-800 font-mono">{trainer.phone}</strong></span>
                        </div>
                      </div>

                      {trainer.address && (
                        <div className="flex items-start gap-1 text-xs text-slate-600 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>पता: <span className="text-slate-700">{trainer.address}</span></span>
                        </div>
                      )}

                      {/* Documents & Specializations Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {/* Document View Badge */}
                        <button
                          type="button"
                          onClick={() => setSelectedDocStaff(trainer)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            दस्तावेज़: {trainer.docType || 'Aadhaar Card'}
                          </span>
                          <Eye className="w-3 h-3 text-emerald-700 ml-0.5" />
                        </button>

                        {/* Specializations */}
                        {trainer.specialization && trainer.specialization.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Stats & Toggle */}
                  <div className="flex items-center gap-4 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-500">असाइन PT क्लाइंट्स</div>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {assignedMembers.length} <span className="text-xs font-normal text-slate-500">सदस्य</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        मासिक वेतन: {formatINR(trainer.salaryMonthly)}/माह
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {role === 'admin' && (
                        <button
                          type="button"
                          onClick={() =>
                            setPinTargetUser({
                              id: trainer.id,
                              name: trainer.name,
                              code: trainer.staffCode,
                              role: 'जिम ट्रेनर (Coach)',
                              currentPin: (trainer as any).pin || '1234',
                            })
                          }
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                          title="ट्रेनर का 4-अंकीय PIN बदलें"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                          <span>पिन बदलें</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedTrainerId(isExpanded ? null : trainer.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>सूची छुपाएं</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>PT सदस्य देखें ({assignedMembers.length})</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible PT Client Roster */}
                {isExpanded && (
                  <div className="bg-slate-50/75 border-t border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-cyan-600" />
                        {trainer.name} के पर्सनल ट्रेनिंग क्लाइंट्स
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        कुल {assignedMembers.length} सक्रिय क्लाइंट्स
                      </span>
                    </div>

                    {assignedMembers.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        वर्तमान में कोई सदस्य असाइन नहीं है।
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {assignedMembers.map((client) => (
                          <div
                            key={client.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-sm text-slate-900">{client.name}</div>
                                  <div className="text-xs text-slate-500 font-mono">{client.memberCode}</div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                  {client.ptDuration
                                    ? (ptPlans.find((p) => p.id === client.ptDuration)?.name || PT_PRICING[client.ptDuration]?.label || `${client.ptDuration.replace('_', ' ').toUpperCase()} PT`)
                                    : 'PT Client'}
                                </span>
                              </div>

                              <div className="mt-2 text-xs space-y-1 text-slate-600">
                                <div>लक्ष्य: <strong className="text-slate-900 capitalize">{client.fitnessGoal.replace('_', ' ')}</strong></div>
                                <div>फोन: {client.phone}</div>
                                <div>वजन: {client.weightKg} kg &rarr; लक्ष्य: {client.targetWeightKg || 'N/A'} kg</div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <ExpirationCountdown expiryDate={client.expiryDate} variant="compact" showSeconds={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: REGULAR STAFF */}
      {activeTab === 'regular' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularStaff.map((staffMember) => (
            <div
              key={staffMember.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3.5">
                {staffMember.avatarUrl ? (
                  <img
                    src={staffMember.avatarUrl}
                    alt={staffMember.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center font-black text-amber-900 text-sm shrink-0">
                    {staffMember.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{staffMember.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {staffMember.staffCode}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Active Staff
                    </span>
                  </div>

                  <div className="text-xs text-amber-800 font-bold">
                    {staffMember.designation}
                  </div>
                  {staffMember.bio && (
                    <p className="text-xs text-slate-500">{staffMember.bio}</p>
                  )}

                  {/* Personal Details */}
                  <div className="pt-2 space-y-1 text-xs text-slate-600">
                    {staffMember.fatherName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>पिता: <strong className="text-slate-800">{staffMember.fatherName}</strong></span>
                      </div>
                    )}
                    {staffMember.dob && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>जन्म तिथि: <strong className="text-slate-800">{formatDate(staffMember.dob)}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{staffMember.phone}</span>
                    </div>
                    {staffMember.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>पता: <span className="text-slate-700">{staffMember.address}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row with Document & Salary */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocStaff(staffMember)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>दस्तावेज़: {staffMember.docType || 'ID Verified'}</span>
                    <Eye className="w-3 h-3 text-emerald-700 ml-0.5" />
                  </button>

                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() =>
                        setPinTargetUser({
                          id: staffMember.id,
                          name: staffMember.name,
                          code: staffMember.staffCode,
                          role: 'स्टाफ (Staff)',
                          currentPin: (staffMember as any).pin || '1234',
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                      title="स्टाफ का 4-अंकीय PIN बदलें"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>पिन बदलें</span>
                    </button>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">मासिक वेतन: </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {formatINR(staffMember.salaryMonthly)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddStaffOpen && <AddStaffModal onClose={() => setIsAddStaffOpen(false)} />}

      {/* Staff Document Viewer Modal */}
      {selectedDocStaff && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDocStaff(null);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 pb-16 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
        >
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto sm:my-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    स्टाफ दस्तावेज़ व आईडी सत्यापन (Staff Document)
                  </h3>
                  <p className="text-xs text-slate-500">{selectedDocStaff.name} ({selectedDocStaff.staffCode})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocStaff(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Profile Bio Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">कर्मचारी / ट्रेनर:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedDocStaff.name}</span>
                </div>
                {selectedDocStaff.fatherName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">पिता का नाम:</span>
                    <span className="font-semibold text-slate-800">{selectedDocStaff.fatherName}</span>
                  </div>
                )}
                {selectedDocStaff.dob && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">जन्म तिथि:</span>
                    <span className="font-semibold text-slate-800">{formatDate(selectedDocStaff.dob)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">पद / श्रेणी:</span>
                  <span className="font-semibold text-cyan-800">{selectedDocStaff.designation}</span>
                </div>
                {selectedDocStaff.address && (
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-slate-500 shrink-0">स्थायी पता:</span>
                    <span className="font-medium text-slate-700 text-right pl-3">{selectedDocStaff.address}</span>
                  </div>
                )}
              </div>

              {/* Document Display / Preview */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>

                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                    {selectedDocStaff.docType || 'Official Aadhaar Card'}
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    ID No: {selectedDocStaff.docNumber || 'XXXX-XXXX-8902'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    फ़ाइल: {selectedDocStaff.docFileName || `${selectedDocStaff.name.toLowerCase().replace(/\s+/g, '_')}_document.pdf`}
                  </div>
                </div>

                {/* If File Data URL exists, show image or download */}
                {selectedDocStaff.docFileUrl ? (
                  <div className="pt-2">
                    {selectedDocStaff.docFileUrl.startsWith('data:image') ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 mx-auto">
                        <img
                          src={selectedDocStaff.docFileUrl}
                          alt="Uploaded Document"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">संलग्न दस्तावेज़ (PDF फ़ाइल)</span>
                        <a
                          href={selectedDocStaff.docFileUrl}
                          download={selectedDocStaff.docFileName || 'staff_document.pdf'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>डाउनलोड करें</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>कौशिक फिटनेस कांकेर द्वारा प्रमाणित दस्तावेज़</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      मूल प्रति जिम कार्यालय में सुरक्षित है। आईडी सत्यापन पूर्ण हो चुका है।
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDocStaff(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Change PIN Modal */}
      {pinTargetUser && (
        <ChangePinModal
          targetUser={pinTargetUser}
          onClose={() => setPinTargetUser(null)}
        />
      )}
    </div>
  );
};
