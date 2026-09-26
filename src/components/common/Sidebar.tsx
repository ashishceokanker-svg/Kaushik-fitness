import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { localDb } from '../../db/localDatabase';
import {
  LayoutDashboard,
  Users,
  Award,
  Sparkles,
  KeyRound,
  Activity,
  MessageSquare,
  TrendingUp,
  Bell,
  Trophy,
  Dumbbell,
  Database,
  CalendarCheck,
  LogOut,
  CreditCard,
  DollarSign,
  ShoppingBag,
  CodeXml,
  Package,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRegister?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  highlight?: boolean;
  alert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenRegister,
}) => {
  const { role, logout, currentUser } = useAuth();
  const { members, expiringSoonMembers, liveGymCount, enquiries } = useGymData();

  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  const [formMode, setFormMode] = React.useState<'simple' | 'advanced'>(() => localDb.getFormMode());

  React.useEffect(() => {
    const handleModeChange = () => {
      setFormMode(localDb.getFormMode());
    };
    window.addEventListener('kf_form_mode_change', handleModeChange);
    window.addEventListener('storage', handleModeChange);
    return () => {
      window.removeEventListener('kf_form_mode_change', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
    };
  }, []);

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
  };

  // Navigation items per role
  const getNavItems = (): NavItem[] => {
    if (role === 'admin') {
      const items: NavItem[] = [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'staff_calendar', label: 'Staff Attendance Calendar', icon: CalendarCheck, badge: 'P/A/L', highlight: true },
        { id: 'staff_logs', label: 'Staff & Trainer Login Logs', icon: KeyRound, badge: 'Auto Report', alert: true },
        { id: 'salary', label: 'Staff Salary & Payroll', icon: DollarSign, badge: 'Payroll' },
        { id: 'members', label: 'Members Directory', icon: Users, badge: members.length },
        { id: 'supplements', label: 'Supplement Store & Inventory', icon: ShoppingBag, badge: 'Stock/POS' },
        { id: 'plans', label: 'Membership & PT Plans', icon: Package, highlight: true },
        { id: 'enquiries', label: 'Enquiries / Leads', icon: MessageSquare, badge: newEnquiriesCount > 0 ? `${newEnquiriesCount} new` : undefined, alert: newEnquiriesCount > 0 },
        { id: 'staff', label: 'Staff & PT Trainers', icon: Award },
        { id: 'attendance', label: 'PIN Attendance Kiosk', icon: CalendarCheck, badge: `${liveGymCount} on floor` },
        { id: 'finance', label: 'Financial Reports', icon: TrendingUp },
        { id: 'reminders', label: 'Payment Reminders', icon: Bell, badge: expiringSoonMembers.length, alert: expiringSoonMembers.length > 0 },
      ];

      // ONLY DEVELOPER gets Database Schema & Tables
      if (isDeveloper) {
        items.push({ id: 'database', label: 'Database Schema & Tables', icon: Database });
      }

      // Developer profile is visible to all
      items.push({ id: 'developer', label: '👨‍💻 Developer (Ashish Dey)', icon: CodeXml, badge: 'CEO', highlight: true });

      return items;
    }

    // STAFF: Front desk, fee collection, enquiries & leads, supplement sale/stock, plans
    if (role === 'staff') {
      return [
        { id: 'dashboard', label: 'Staff Fee Desk', icon: LayoutDashboard },
        { id: 'fees', label: 'Member Fee Collection', icon: CreditCard, highlight: true },
        { id: 'plans', label: 'Membership & PT Plans', icon: Package, highlight: true },
        { id: 'supplements', label: 'Supplement Store & Inventory', icon: ShoppingBag, badge: 'Stock/POS', highlight: true },
        { id: 'enquiries', label: 'Gym Enquiries / Leads', icon: MessageSquare, badge: newEnquiriesCount > 0 ? `${newEnquiriesCount} new` : undefined, alert: newEnquiriesCount > 0 },
        { id: 'members', label: 'Members Directory', icon: Users, badge: members.length },
        { id: 'staff', label: 'Staff & PT Trainers', icon: Award },
        { id: 'attendance', label: 'PIN Attendance Kiosk', icon: CalendarCheck, badge: `${liveGymCount} on floor` },
        { id: 'reminders', label: 'Due Reminders', icon: Bell, badge: expiringSoonMembers.length, alert: expiringSoonMembers.length > 0 },
      ];
    }

    // TRAINER: Clients, progress tracking & diet plans
    if (role === 'trainer') {
      const isAdvanced = formMode === 'advanced';
      const trainerClients = members.filter((m) => {
        if (!currentUser) return false;
        if (m.assignedTrainerId && (m.assignedTrainerId === currentUser.id || m.assignedTrainerId === currentUser.staffId)) return true;
        if (m.assignedTrainerName && currentUser.name && m.assignedTrainerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
        return false;
      });

      const items: NavItem[] = [
        { id: 'dashboard', label: 'Trainer Dashboard (ट्रेनर पोर्टल)', icon: LayoutDashboard },
        { id: 'clients', label: 'मेरे मेंबर्स (Assigned PT Clients)', icon: Users, badge: trainerClients.length || undefined },
        { id: 'progress', label: 'मेंबर प्रोग्रेस व बदलाव चार्ट', icon: Trophy, highlight: true },
        { id: 'fitness', label: 'डाइट व वर्कआउट प्लानर', icon: Sparkles },
      ];

      if (isAdvanced) {
        items.push({ id: 'attendance', label: 'ड्यूटी हाजिरी (GPS Clock-In)', icon: CalendarCheck });
      }

      return items;
    }

    // MEMBER: Personal workout, diet, progress charts
    const isAdvanced = formMode === 'advanced';
    const memberItems: NavItem[] = [
      { id: 'dashboard', label: 'My Fitness Portal', icon: LayoutDashboard },
      { id: 'progress', label: 'My Progress & PRs Chart', icon: Trophy, highlight: true },
      { id: 'body_index', label: 'Body Index & Changes', icon: Activity },
      { id: 'fitness', label: 'Workout & Diet Routine', icon: Dumbbell },
    ];

    if (isAdvanced) {
      memberItems.push({ id: 'attendance', label: '4-Digit PIN Pass', icon: KeyRound });
    }

    return memberItems;
  };

  const navItems = getNavItems();

  const renderNavList = () => (
    <div className="p-3.5 space-y-1 overflow-y-auto flex-1">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 flex items-center justify-between">
        <span>Navigation Menu</span>
        <span className="capitalize font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
          {role}
        </span>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : item.highlight
                ? 'text-cyan-800 bg-cyan-50/70 hover:bg-cyan-100 hover:text-cyan-900 border border-cyan-200/50'
                : 'text-slate-700 hover:bg-slate-200/90 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : item.highlight ? 'text-cyan-700' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  isActive
                    ? 'bg-black/20 text-slate-950'
                    : item.alert
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderFooter = () => (
    <div className="p-3.5 border-t border-slate-300 space-y-2 bg-slate-200/60">
      {role === 'admin' && onOpenRegister && (
        <button
          onClick={onOpenRegister}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          + Register Member
        </button>
      )}

      {/* Quick Developer Profile Link - Visible to ALL (Admin, Developer, Staff, Member, Trainer) */}
      <button
        onClick={() => handleTabClick('developer')}
        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
          activeTab === 'developer'
            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
            : 'bg-gradient-to-r from-cyan-50 to-amber-50 text-slate-800 border-cyan-200/80 hover:border-cyan-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <CodeXml className="w-4 h-4 text-cyan-600" />
          <span>👨‍💻 Developer (Ashish Dey)</span>
        </div>
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
          CEO
        </span>
      </button>

      {/* User Badge & Logout */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-300 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xs font-black text-amber-900 shrink-0">
              {(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="truncate text-left">
            <div className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.name || 'Active User'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              Role: {role}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Logout & return to login screen"
          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-slate-100/95 border-r border-slate-300 flex flex-col justify-between shrink-0 hidden md:flex h-[calc(100vh-65px)] sticky top-[65px] shadow-xs">
      {renderNavList()}
      {renderFooter()}
    </aside>
  );
};
