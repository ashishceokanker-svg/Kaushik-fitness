import React, { useState } from 'react';
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
import { InstallPwaBanner } from './components/common/InstallPwaBanner';
import { AppInstallModal } from './components/common/AppInstallModal';
import { Member, FitnessGoal } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, role, isAuthenticated } = useAuth();
  const { members } = useGymData();
  const activeMember = members.find((m) => m.id === currentUser?.memberId) || members[0];
  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [isAppInstallOpen, setIsAppInstallOpen] = useState<boolean>(false);
  const [enquiryGoal, setEnquiryGoal] = useState<FitnessGoal | undefined>(undefined);
  const [newlyRegisteredMember, setNewlyRegisteredMember] = useState<Member | null>(null);

  // If user is not logged in, display the Light-Themed Login Portal
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
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

  // If mobile simulator mode is manually turned on via Desktop toggle
  if (isMobileSimulator && (role === 'admin' || isDeveloper)) {
    return <MobileAppSimulator onExitMobileView={() => setIsMobileSimulator(false)} />;
  }

  // Determine which view to render
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'admin') {
          return (
            <AdminDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenCloudDatabase={() => setIsCloudModalOpen(true)}
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      {/* Top Navigation Bar */}
      <Navbar
        isMobileView={isMobileSimulator}
        onToggleMobileView={() => setIsMobileSimulator(!isMobileSimulator)}
        onOpenNotifications={() => setActiveTab('reminders')}
        onOpenLogin={() => setActiveTab('dashboard')}
        onOpenDatabase={isDeveloper ? () => setActiveTab('database') : undefined}
        onOpenCloudDatabase={() => setIsCloudModalOpen(true)}
        onOpenEnquiry={role === 'admin' || role === 'staff' ? () => setIsEnquiryModalOpen(true) : undefined}
        onNavigateToStaffLogs={() => setActiveTab('staff_logs')}
        onOpenDeveloper={() => setActiveTab('developer')}
        onOpenAppInstall={() => setIsAppInstallOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar + Mobile Drawer Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onOpenRegister={() => setIsRegisterOpen(true)}
          isOpenOnMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Scrollable Center Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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

      {/* Cloud Firestore Live Sync Modal */}
      <CloudDatabaseModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      {/* Mobile App Install & Link Guide Modal */}
      <AppInstallModal
        isOpen={isAppInstallOpen}
        onClose={() => setIsAppInstallOpen(false)}
      />

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
