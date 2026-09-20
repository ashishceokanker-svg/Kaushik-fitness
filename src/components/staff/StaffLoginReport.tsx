import React, { useState, useEffect } from 'react';
import { localDb } from '../../db/localDatabase';
import { StaffLoginLog } from '../../types';
import {
  Shield,
  Award,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  KeyRound,
  Mail,
  UserCheck,
  Calendar,
  LogOut,
} from 'lucide-react';

export const StaffLoginReport: React.FC = () => {
  const [logs, setLogs] = useState<StaffLoginLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'trainer' | 'employee' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'logged_out'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadLogs = () => {
    const data = localDb.getStaffLoginLogs();
    setLogs(data);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const devInfo = log.deviceInfo || '';
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      devInfo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      log.role === roleFilter ||
      (roleFilter === 'trainer' && log.role === 'trainer') ||
      (roleFilter === 'admin' && log.role === 'admin');

    const matchesStatus =
      statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate quick stats
  const totalLogins = logs.length;
  const activeSessions = logs.filter((l) => l.status === 'active').length;
  const trainerLogins = logs.filter((l) => l.role === 'trainer').length;
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLogins = logs.filter((l) => l.loginTime.startsWith(todayDateStr)).length;

  const formatLogTime = (isoString?: string) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (startIso: string, endIso?: string) => {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    const diffMins = Math.floor((end - start) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }
    const headers = ['ID', 'Staff Name', 'Email', 'Role', 'Login Time', 'Logout Time', 'Duration', 'Method', 'Device', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.userName}"`,
      `"${l.userEmail}"`,
      l.staffType || l.role,
      `"${formatLogTime(l.loginTime)}"`,
      `"${formatLogTime(l.logoutTime)}"`,
      calculateDuration(l.loginTime, l.logoutTime),
      l.loginMethod,
      `"${l.deviceInfo}"`,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Login_Report_${todayDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual session termination
  const handleTerminateSession = (logId: string) => {
    const updated = logs.map((l) => {
      if (l.id === logId) {
        return {
          ...l,
          status: 'logged_out' as const,
          logoutTime: new Date().toISOString(),
        };
      }
      return l;
    });
    localStorage.setItem('kf_staff_login_logs', JSON.stringify(updated));
    setLogs(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Admin Security & Audit Control
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Staff & Trainer Auto Login Report
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              स्टाफ और ट्रेनर के ऑटो लॉगिन व लॉगआउट रिकॉर्ड्स, सक्रिय सेशन्स और डिवाइस जानकारी की लाइव रिपोर्ट।
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadLogs}
              title="Refresh Login Audit Logs"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Total Audit Logs</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">{totalLogins}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total recorded login events</div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Active Live Sessions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-2">{activeSessions}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Currently on duty / logged in</div>
        </div>

        {/* Trainer Logins */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Trainer Logins</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">{trainerLogins}</div>
          <div className="text-[11px] text-cyan-700 font-medium mt-1">Gym Instructors & PTs</div>
        </div>

        {/* Today's Logins */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-slate-500">Today's Logins</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">{todayLogins}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Since 00:00 midnight</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, email, device..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px] font-bold px-2">Role:</span>
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('trainer')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                roleFilter === 'trainer' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trainers
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                roleFilter === 'admin' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px] font-bold px-2">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('logged_out')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'logged_out' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logged Out
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role & Status</th>
                <th className="p-4">Login Time</th>
                <th className="p-4">Logout Time / Duration</th>
                <th className="p-4">Auth Method</th>
                <th className="p-4">Device / Browser</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No staff login logs match the filter criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">When staff or trainers log in, records will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isActive = log.status === 'active';
                  const isTrainer = log.role === 'trainer';
                  const isAdmin = log.role === 'admin';
                  const devInfo = log.deviceInfo || 'Desktop Browser';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{log.userName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{log.userEmail}</div>
                      </td>

                      {/* Role & Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isAdmin
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : isTrainer
                                ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {log.staffType || log.role}
                          </span>

                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Session
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                              Logged Out
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Login Time */}
                      <td className="p-4 font-mono text-slate-800">
                        <div className="font-semibold">{formatLogTime(log.loginTime)}</div>
                        <div className="text-[10px] text-slate-400">
                          {calculateDuration(log.loginTime)} ago
                        </div>
                      </td>

                      {/* Logout Time / Duration */}
                      <td className="p-4 font-mono text-slate-700">
                        {isActive ? (
                          <div className="text-emerald-700 font-bold">
                            Active ({calculateDuration(log.loginTime)})
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold">{formatLogTime(log.logoutTime)}</div>
                            <div className="text-[10px] text-slate-400">
                              Duration: {calculateDuration(log.loginTime, log.logoutTime)}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Auth Method */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {log.loginMethod === 'pin' ? (
                            <>
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              <span>4-Digit PIN</span>
                            </>
                          ) : log.loginMethod === 'password' ? (
                            <>
                              <Mail className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Email & Password</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Quick Switch</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Device / Browser */}
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs truncate max-w-[200px]" title={devInfo}>
                          {devInfo.toLowerCase().includes('mobile') ? (
                            <Smartphone className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{devInfo}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isActive ? (
                          <button
                            onClick={() => handleTerminateSession(log.id)}
                            title="Force terminate this active session"
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>End Session</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Showing {filteredLogs.length} of {logs.length} total auto-login records</span>
          <span>Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
