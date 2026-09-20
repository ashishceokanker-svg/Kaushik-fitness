import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymDataProvider, useGymData } from './context/GymDataContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileAppSimulator } from './components/common/MobileAppSimulator';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TrainerDashboard } from './components/dashboard/TrainerDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { MemberList } from './components/members/MemberList';
import { StaffManagement } from './components/staff/StaffManagement';
import { StaffSalaryManagement } from './components/admin/StaffSalaryManagement';
import { StaffAttendanceCalendar } from './components/admin/StaffAttendanceCalendar';
import { StaffLoginReport } from './components/staff/StaffLoginReport';
import { SmartFitnessEngine } from './components/fitness/SmartFitnessEngine';
import { AttendanceScanner } from './components/attendance/AttendanceScanner';
import { FinancialReports } from './components/finance/FinancialReports';
import { PaymentReminders } from './components/finance/PaymentReminders';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { DatabaseInspector } from './components/admin/DatabaseInspector';
import { MemberRegisterModal } from './components/members/MemberRegisterModal';
import { InvoiceModal } from './components/common/InvoiceModal';
import { LoginPage } from './components/auth/LoginPage';
import { EnquiryManagement } from './components/enquiry/EnquiryManagement';
import { EnquiryModal } from './components/enquiry/EnquiryModal';
import { BodyIndexTracker } from './components/members/BodyIndexTracker';
import { SupplementManagement } from './components/supplements/SupplementManagement';
import { DeveloperPage } from './components/developer/DeveloperPage';
import { CloudDatabaseModal } from './components/admin/CloudDatabaseModal';
import { PlanManagement } from './components/plans/PlanManagement';
import { InstallPwaBanner } from './components/common/InstallPwaBanner';
import { AppInstallModal } from './components/common/AppInstallModal';
import { Member, FitnessGoal } from './types';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Shield,
  CodeXml,
  Dumbbell,
  TrendingUp,
  MessageSquare,
  Database,
  LogOut,
  ShoppingBag,
  Package,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const { members } = useGymData();
  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';
  const activeMember =
    members.find(
      (m) =>
        (currentUser?.memberId && m.id === currentUser.memberId) ||
        (currentUser?.id && m.userId === currentUser.id) ||
        (currentUser?.phone && m.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
        (currentUser?.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    ) || members[0];

  const [activeTab, setActiveTab] = useState<string>(() => {
    return isDeveloper ? 'developer' : 'dashboard';
  });

  useEffect(() => {
    if (isDeveloper) {
      setActiveTab('developer');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser?.id, isDeveloper]);

  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [isAppInstallOpen, setIsAppInstallOpen] = useState<boolean>(false);
  const [enquiryGoal, setEnquiryGoal] = useState<FitnessGoal | undefined>(undefined);
  const [newlyRegisteredMember, setNewlyRegisteredMember] = useState<Member | null>(null);

  // If user is not logged in, display the Light-Themed Login Portal
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen text-slate-900">
        <LoginPage
          onOpenEnquiry={() => setIsEnquiryModalOpen(true)}
          onOpenAppInstall={() => setIsAppInstallOpen(true)}
        />

        {/* Global Admission / Upgrade Enquiry Modal */}
        <EnquiryModal
          isOpen={isEnquiryModalOpen}
          prefillGoal={enquiryGoal}
          onClose={() => {
            setIsEnquiryModalOpen(false);
            setEnquiryGoal(undefined);
          }}
        />

        {/* Mobile App Install & Link Guide Modal */}
        <AppInstallModal
          isOpen={isAppInstallOpen}
          onClose={() => setIsAppInstallOpen(false)}
        />

        {/* Install App Banner for Mobile / PWA */}
        <InstallPwaBanner />
      </div>
    );
  }

  // Only show Member Mobile App Simulator:
  // 1. If the logged in user is a MEMBER on a mobile screen/PWA app
  // 2. OR if an Admin / Developer explicitly clicked "App Preview" on desktop
  const isRealMobileDevice =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches);

  const shouldShowMemberMobileApp =
    (role === 'member' && isRealMobileDevice) ||
    (isMobileSimulator && isDeveloper);

  if (shouldShowMemberMobileApp) {
    return <MobileAppSimulator onExitMobileView={() => setIsMobileSimulator(false)} />;
  }

  const getMobileNavItems = () => {
    if (isDeveloper) {
      return [
        { id: 'developer', label: 'Dev', icon: CodeXml },
        { id: 'plans', label: 'Plans', icon: Package },
        { id: 'database', label: 'Local DB', icon: Database },
        { id: 'dashboard', label: 'Admin', icon: LayoutDashboard },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'plans', label: 'Plans', icon: Package },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'supplements', label: 'Store', icon: ShoppingBag },
        { id: 'developer', label: 'Dev', icon: CodeXml },
        { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
      ];
    }
    if (role === 'trainer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'fitness', label: 'Fitness', icon: Dumbbell },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'developer', label: 'Dev', icon: CodeXml },
        { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
      ];
    }
    if (role === 'staff') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'plans', label: 'Plans', icon: Package },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'developer', label: 'Dev', icon: CodeXml },
        { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
      ];
    }
    return [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'fitness', label: 'Fitness', icon: Dumbbell },
      { id: 'developer', label: 'Dev', icon: CodeXml },
      { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
    ];
  };

  const mobileNavItems = getMobileNavItems();

  // Determine which view to render
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'admin') {
          return (
            <AdminDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenCloudDatabase={isDeveloper ? () => setIsCloudModalOpen(true) : undefined}
            />
          );
        }
        if (role === 'trainer') {
          return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        if (role === 'staff') {
          return <StaffDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return <MemberDashboard onNavigate={(tab) => setActiveTab(tab)} />;

      case 'salary':
        return <StaffSalaryManagement onBack={() => setActiveTab('dashboard')} />;

      case 'staff_calendar':
        return <StaffAttendanceCalendar onBack={() => setActiveTab('dashboard')} />;

      case 'fees':
        return <StaffDashboard onNavigate={(tab) => setActiveTab(tab)} />;

      case 'staff_logs':
        return <StaffLoginReport />;

      case 'clients':
        return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;

      case 'members':
        if (role === 'trainer') {
          return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return <MemberList />;

      case 'staff':
        if (role === 'trainer') {
          return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return <StaffManagement />;

      case 'fitness':
        return <SmartFitnessEngine />;

      case 'body_index':
        return <BodyIndexTracker member={activeMember} />;

      case 'attendance':
        return <AttendanceScanner />;

      case 'finance':
        return <FinancialReports />;

      case 'enquiries':
        if (role !== 'admin' && role !== 'staff') {
          if (role === 'trainer') return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
          if (role === 'member') return <MemberDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return <EnquiryManagement />;

      case 'supplements':
        return <SupplementManagement />;

      case 'reminders':
        return <PaymentReminders />;

      case 'progress':
        if (role === 'trainer') {
          return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return <ProgressTracker />;

      case 'database':
        if (!isDeveloper) {
          return (
            <AdminDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          );
        }
        return <DatabaseInspector />;

      case 'plans':
        if (role !== 'admin' && role !== 'staff' && !isDeveloper) {
          if (role === 'trainer') return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
          if (role === 'member') return <MemberDashboard onNavigate={(tab) => setActiveTab(tab)} />;
          return (
            <AdminDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          );
        }
        return <PlanManagement onBack={() => setActiveTab('dashboard')} />;

      case 'developer':
        return <DeveloperPage onBack={() => setActiveTab('dashboard')} />;

      default:
        if (role === 'staff') {
          return <StaffDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        if (role === 'trainer') {
          return <TrainerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        if (role === 'member') {
          return <MemberDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        }
        return (
          <AdminDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-900 max-w-full overflow-x-hidden">
      {/* Top Navigation Bar */}
      <Navbar
        isMobileView={isMobileSimulator}
        onToggleMobileView={isDeveloper ? () => setIsMobileSimulator(!isMobileSimulator) : undefined}
        onOpenNotifications={() => setActiveTab('reminders')}
        onOpenLogin={() => setActiveTab('dashboard')}
        onOpenDatabase={isDeveloper ? () => setActiveTab('database') : undefined}
        onOpenCloudDatabase={isDeveloper ? () => setIsCloudModalOpen(true) : undefined}
        onOpenEnquiry={role === 'admin' || role === 'staff' ? () => setIsEnquiryModalOpen(true) : undefined}
        onNavigateToStaffLogs={() => setActiveTab('staff_logs')}
        onOpenDeveloper={() => setActiveTab('developer')}
        onOpenAppInstall={() => setIsAppInstallOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-x-hidden overflow-y-auto max-w-full">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* Scrollable Center Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Global Registration Modal */}
      {isRegisterOpen && (
        <MemberRegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={(newMember) => {
            setIsRegisterOpen(false);
            setNewlyRegisteredMember(newMember);
          }}
        />
      )}

      {/* Auto-Open Invoice on New Registration */}
      {newlyRegisteredMember && (
        <InvoiceModal
          member={newlyRegisteredMember}
          onClose={() => setNewlyRegisteredMember(null)}
        />
      )}

      {/* Global Admission / Upgrade Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        prefillGoal={enquiryGoal}
        onClose={() => {
          setIsEnquiryModalOpen(false);
          setEnquiryGoal(undefined);
        }}
      />

      {/* Cloud Firestore Live Sync Modal - DEVELOPER ONLY */}
      {isDeveloper && (
        <CloudDatabaseModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
        />
      )}

      {/* Mobile App Install & Link Guide Modal */}
      <AppInstallModal
        isOpen={isAppInstallOpen}
        onClose={() => setIsAppInstallOpen(false)}
      />

      {/* Mobile Bottom Icon Navigation Bar (Rendered on mobile screens < 768px for non-member views) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg w-full max-w-full overflow-x-hidden">
        {mobileNavItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeTab === item.id;
          const isLogout = item.id === 'logout';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLogout) {
                  logout();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 rounded-xl transition-all cursor-pointer ${
                isLogout
                  ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 font-bold'
                  : isActive
                  ? 'text-amber-600 font-bold bg-amber-50/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <ItemIcon className={`w-4 h-4 shrink-0 ${isLogout ? 'text-rose-600' : isActive ? 'text-amber-600' : 'text-slate-500'}`} />
              <span className="text-[9.5px] truncate max-w-full leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Install App Banner */}
      <InstallPwaBanner />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <GymDataProvider>
        <MainAppContent />
      </GymDataProvider>
    </AuthProvider>
  );
};

export default App;
