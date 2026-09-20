import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { UserRole } from '../../types';
import {
  Dumbbell,
  Smartphone,
  Monitor,
  Bell,
  ChevronDown,
  Shield,
  Award,
  User,
  Database,
  RefreshCw,
  MessageSquare,
  LogOut,
  CreditCard,
  CodeXml,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  isMobileView: boolean;
  onToggleMobileView?: () => void;
  onOpenNotifications: () => void;
  onOpenLogin: () => void;
  onOpenDatabase?: () => void;
  onOpenCloudDatabase?: () => void;
  onOpenEnquiry?: () => void;
  onNavigateToStaffLogs?: () => void;
  onOpenDeveloper?: () => void;
  onOpenAppInstall?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileView,
  onToggleMobileView,
  onOpenNotifications,
  onOpenLogin,
  onOpenDatabase,
  onOpenCloudDatabase,
  onOpenEnquiry,
  onNavigateToStaffLogs,
  onOpenDeveloper,
  onOpenAppInstall,
}) => {
  const { currentUser, role, logout } = useAuth();
  const { expiringSoonMembers, resetToDemoData, isCloudSynced } = useGymData();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isDeveloper = currentUser?.id === 'usr-dev' || currentUser?.phone === '9244249975';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleLabels: Record<UserRole, { label: string; color: string; icon: any }> = {
    admin: { label: 'Admin', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: Shield },
    trainer: { label: 'Trainer', color: 'bg-cyan-50 text-cyan-900 border-cyan-200', icon: Award },
    staff: { label: 'Staff', color: 'bg-orange-50 text-orange-900 border-orange-200', icon: CreditCard },
    member: { label: 'Member', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: User },
  };

  const currentRoleConfig = roleLabels[role] || roleLabels.member;
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-sm max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-full">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/app-logo.png"
            alt="Kaushik Fitness Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md border border-amber-400/50 object-cover shrink-0"
          />

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-sm sm:text-lg tracking-wider text-slate-900 uppercase truncate">
                KAUSHIK FITNESS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950">
                Kanker
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Light Portal • Strength, Body Index & Management System
            </p>
          </div>
        </div>

        {/* Center: Live Clock & Date */}
        <div className="hidden lg:flex flex-col items-center text-xs text-slate-500 font-mono">
          <span className="text-slate-800 font-bold">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-amber-600 text-xs font-semibold">
            {currentTime.toLocaleTimeString('en-IN')}
          </span>
        </div>

        {/* Right: Quick Tools & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Cloud Database Live Sync Button (DEVELOPER ONLY) */}
          {isDeveloper && onOpenCloudDatabase && (
            <button
              onClick={onOpenCloudDatabase}
              title={
                isCloudSynced
                  ? 'Firebase Firestore Live Connected - Click to manage'
                  : 'Local Storage Mode - Click to connect Firebase Cloud'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                isCloudSynced
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline">{isCloudSynced ? 'Cloud Live' : 'Connect Cloud'}</span>
            </button>
          )}

          {/* Database Inspector Quick Access (DEVELOPER ONLY) */}
          {role === 'admin' && isDeveloper && onOpenDatabase && (
            <button
              onClick={onOpenDatabase}
              title="Inspect Local Database Schema & Tables (Developer)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden md:inline">SQL Schema</span>
            </button>
          )}

          {/* Developer Page Quick Link - Strictly DEVELOPER ONLY */}
          {isDeveloper && onOpenDeveloper && (
            <button
              onClick={onOpenDeveloper}
              title="Developer Profile (Ashish Dey - CEO Janpad Panchayat Baderajpur)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-cyan-500/30"
            >
              <CodeXml className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Developer</span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-slate-950 font-black rounded">CEO</span>
            </button>
          )}

          {/* Mobile App Install & Link Guide Button */}
          {onOpenAppInstall && (
            <button
              onClick={onOpenAppInstall}
              title="Kaushik Fitness Mobile App (PWA WebAPK) Install & Link Guide"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">App</span>
              <span className="text-[9px] px-1 py-0.2 bg-slate-950 text-amber-400 font-bold rounded">APK</span>
            </button>
          )}

          {/* Admission / PT Enquiry Button - Strictly Admin & Staff Only */}
          {onOpenEnquiry && (role === 'admin' || role === 'staff') && (
            <button
              onClick={onOpenEnquiry}
              title="Gym Admission & PT Enquiry Form"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Enquiry (पूछताछ)</span>
            </button>
          )}

          {/* Mobile vs Desktop Viewport Switcher - Strictly DEVELOPER ONLY */}
          {isDeveloper && onToggleMobileView && (
            <button
              onClick={onToggleMobileView}
              title={isMobileView ? 'Switch to Full Desktop Portal' : 'Preview Simulated Mobile App View'}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMobileView
                  ? 'bg-cyan-100 border-cyan-300 text-cyan-900 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isMobileView ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                  <span>App Preview</span>
                </>
              )}
            </button>
          )}

          {/* Expiration Notification Bell (Admin/Staff only) */}
          {(role === 'admin' || role === 'staff') && (
            <button
              onClick={onOpenNotifications}
              title="Membership Expiration Alerts"
              className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {expiringSoonMembers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                  {expiringSoonMembers.length}
                </span>
              )}
            </button>
          )}

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${currentRoleConfig.color}`}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300 shadow-xs shrink-0"
                />
              ) : (
                <CurrentIcon className="w-3.5 h-3.5" />
              )}
              <span className="capitalize">{currentUser?.name?.split(' ')[0] || role}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-50 space-y-3">
                <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm border border-amber-200">
                      {(currentUser?.name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.name || 'Active User'}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{role} Account</div>
                    {currentUser?.phone && (
                      <div className="text-[10px] font-mono text-slate-400">{currentUser.phone}</div>
                    )}
                  </div>
                </div>

                {isDeveloper && (
                  <button
                    onClick={() => {
                      if (confirm('Reset local database back to blueprint defaults?')) {
                        resetToDemoData();
                        setIsRoleMenuOpen(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Blueprint Database
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout (लॉगआउट)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            title="लॉगआउट (Logout / Sign out)"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden xs:inline sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
