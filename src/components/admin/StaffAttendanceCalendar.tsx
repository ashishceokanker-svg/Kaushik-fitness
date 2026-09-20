import React, { useState, useMemo } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { localDb } from '../../db/localDatabase';
import { StaffDailyAttendance, StaffAttendanceStatus, GymGeofenceSettings } from '../../types';
import {
  checkGeofence,
  formatDistance,
  getSimulationMode,
  setSimulationMode,
  SimulationMode,
  DEFAULT_GYM_GEOFENCE,
} from '../../utils/geolocation';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  CreditCard,
  Settings,
  ShieldCheck,
  Navigation,
  Save,
  Check,
  X,
  Users,
  Info,
} from 'lucide-react';

interface StaffAttendanceCalendarProps {
  onBack?: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StaffAttendanceCalendar: React.FC<StaffAttendanceCalendarProps> = ({ onBack }) => {
  const { staff } = useGymData();

  // Selected staff (default to Vikram Sahu / Trainer or first staff member)
  const salariedStaff = useMemo(() => {
    return staff.filter((s) => s.role === 'trainer' || s.role === 'staff' || s.staffType === 'instructor' || s.staffType === 'regular');
  }, [staff]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    salariedStaff[0]?.id || 'staff-2'
  );

  // Month navigation (default September 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // 8 = September

  const currentMonthKey = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthLabel = `${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`;

  // Geofence settings state
  const [geofenceSettings, setGeofenceSettings] = useState<GymGeofenceSettings>(() =>
    localDb.getGeofenceSettings()
  );
  const [isGeofenceDrawerOpen, setIsGeofenceDrawerOpen] = useState<boolean>(false);
  const [geoSaveSuccess, setGeoSaveSuccess] = useState<boolean>(false);

  // Simulation mode
  const [simMode, setSimMode] = useState<SimulationMode>(getSimulationMode());

  // Attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<StaffDailyAttendance[]>(() =>
    localDb.getStaffDailyAttendance()
  );

  // Day status edit modal state
  const [editingDay, setEditingDay] = useState<{
    dateStr: string;
    dayNum: number;
    currentRecord?: StaffDailyAttendance;
  } | null>(null);

  const [editStatus, setEditStatus] = useState<StaffAttendanceStatus>('present');
  const [editReason, setEditReason] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const refreshAttendance = () => {
    setAttendanceRecords(localDb.getStaffDailyAttendance());
  };

  const selectedEmployee = salariedStaff.find((s) => s.id === selectedStaffId) || salariedStaff[0];

  // Month attendance map for selected staff: date -> StaffDailyAttendance
  const staffMonthRecordsMap = useMemo(() => {
    const map = new Map<string, StaffDailyAttendance>();
    attendanceRecords
      .filter((r) => r.staffId === selectedStaffId && r.date.startsWith(currentMonthKey))
      .forEach((r) => {
        map.set(r.date, r);
      });
    return map;
  }, [attendanceRecords, selectedStaffId, currentMonthKey]);

  // Calendar Day Grid Calculation
  const calendarGrid = useMemo(() => {
    // Days in month
    const totalDays = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
    // Weekday of 1st day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = new Date(selectedYear, selectedMonthIndex, 1).getDay();
    // Convert so Monday is 0, Sunday is 6
    const offset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

    const days = [];
    // Leading blanks
    for (let i = 0; i < offset; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    // Days 1 to totalDays
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${currentMonthKey}-${dayStr}`;
      const record = staffMonthRecordsMap.get(dateStr);
      const dayOfWeek = new Date(selectedYear, selectedMonthIndex, day).getDay();

      days.push({
        type: 'day',
        dayNum: day,
        dateStr,
        dayOfWeek,
        isSunday: dayOfWeek === 0,
        record,
      });
    }

    return days;
  }, [selectedYear, selectedMonthIndex, currentMonthKey, staffMonthRecordsMap]);

  // Attendance Stats for the selected month
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;

    staffMonthRecordsMap.forEach((r) => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'leave') leaveCount++;
      else if (r.status === 'holiday') holidayCount++;
    });

    const totalWorkingDays = Math.max(1, presentCount + absentCount + leaveCount);
    const compliancePercent = Math.round((presentCount / totalWorkingDays) * 100);

    return {
      presentCount,
      absentCount,
      leaveCount,
      holidayCount,
      totalWorkingDays,
      compliancePercent,
    };
  }, [staffMonthRecordsMap]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonthIndex((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(2026);
    setSelectedMonthIndex(8); // September 2026
  };

  // Open day edit modal
  const handleDayClick = (dayData: any) => {
    if (dayData.type !== 'day') return;
    setEditingDay({
      dateStr: dayData.dateStr,
      dayNum: dayData.dayNum,
      currentRecord: dayData.record,
    });
    setEditStatus(dayData.record?.status || (dayData.isSunday ? 'holiday' : 'present'));
    setEditReason(dayData.record?.leaveReason || '');
    setEditNotes(dayData.record?.notes || '');
  };

  // Save day attendance
  const handleSaveDayStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay || !selectedEmployee) return;

    localDb.setStaffAttendanceStatus(
      selectedEmployee.id,
      selectedEmployee.name,
      selectedEmployee.role,
      editingDay.dateStr,
      editStatus,
      editReason,
      editNotes
    );

    refreshAttendance();
    setEditingDay(null);
  };

  // Geofence settings save (strictly capped within 500m)
  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedSettings = {
      ...geofenceSettings,
      radiusMeters: Math.min(500, Math.max(20, geofenceSettings.radiusMeters)),
    };
    setGeofenceSettings(clampedSettings);
    localDb.saveGeofenceSettings(clampedSettings);
    setGeoSaveSuccess(true);
    setTimeout(() => setGeoSaveSuccess(false), 3000);
  };

  // Capture current browser location
  const handleCaptureCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('ब्राउज़र में GPS सपोर्ट नहीं मिला।');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeofenceSettings((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        alert('GPS लोकेशन प्राप्त नहीं हो सकी: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Simulation change
  const handleSimulationModeChange = (mode: SimulationMode) => {
    setSimMode(mode);
    setSimulationMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Admin Duty & Geofence Console
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              स्टाफ व ट्रेनर माहवार उपस्थिति कैलेंडर (Staff Attendance Calendar)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              महीने के प्रत्येक दिन उपस्थित (P), अनुपस्थित (A), अवकाश (L) का विवरण देखें और GPS परिधि (Geofence) प्रबंधित करें
            </p>
          </div>

          {/* Action Tools: Geofence Drawer & GPS Simulator */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsGeofenceDrawerOpen(!isGeofenceDrawerOpen)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>जिम GPS परिधि सेटिंग्स (Geofence)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geofence Configuration Drawer (Collapsible) */}
      {isGeofenceDrawerOpen && (
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-md animate-in fade-in space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                जिम GPS लोकेशन व उपस्थिति परिधि (Gym Geofence Radius Setup)
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                कौशिक फिटनेस कांकेर - GPS निर्देशांक व मान्य दूरी
              </h3>
              <p className="text-xs text-slate-500">
                जब कर्मचारी ऐप में लॉगिन/ड्यूटी क्लॉक-इन करेंगे, तो वे इस अक्षांश-देशांतर की परिधि में होने पर ही 'Present' दर्ज होंगे।
              </p>
            </div>
            <button
              onClick={() => setIsGeofenceDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveGeofence} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Latitude */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अक्षांश (Latitude):
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={geofenceSettings.latitude}
                  onChange={(e) =>
                    setGeofenceSettings((prev) => ({
                      ...prev,
                      latitude: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 font-bold"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  देशांतर (Longitude):
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={geofenceSettings.longitude}
                  onChange={(e) =>
                    setGeofenceSettings((prev) => ({
                      ...prev,
                      longitude: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 font-bold"
                />
              </div>

              {/* Radius in Meters (Capped at 500m) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    मान्य परिधि (Allowed Radius):
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    अधिकतम 500m तक मान्य
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={geofenceSettings.radiusMeters}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 50;
                      setGeofenceSettings((prev) => ({
                        ...prev,
                        radiusMeters: Math.min(500, Math.max(20, val)),
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">मीटर (m)</span>
                </div>
              </div>
            </div>

            {/* Quick Presets & Device Capture */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">त्वरित परिधि (Max 500m):</span>
                {[50, 100, 150, 250, 500].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setGeofenceSettings((prev) => ({ ...prev, radiusMeters: r }))}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      geofenceSettings.radiusMeters === r
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}m
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCaptureCurrentGps}
                  className="ml-2 px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="वर्तमान डिवाइस लोकेशन सेट करें"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                  डिवाइस का GPS लोकेशन लें
                </button>
              </div>

              <div className="flex items-center gap-3">
                {geoSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    सेटिंग्स सुरक्षित हुईं!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  सेव करें (Save Settings)
                </button>
              </div>
            </div>

            {/* Simulation Mode Toggle (For Easy Evaluation on Desktop) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-900 block">
                  🧪 GPS सिम्युलेटर मोड (Desktop Test Mode):
                </span>
                <span className="text-slate-500 text-[11px]">
                  कंप्यूटर/लैपटॉप पर बिना कांकेर जाए दोनों केस (Present व Absent) टेस्ट करने के लिए चुनें
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <button
                  type="button"
                  onClick={() => handleSimulationModeChange('inside')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    simMode === 'inside'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  ✓ इन-परिधि (~45m - Present)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulationModeChange('outside')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    simMode === 'outside'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  ✕ आउट-ऑफ-परिधि (~410m / 500m के अंदर - Absent)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulationModeChange('real')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    simMode === 'real'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  लाइव डिवाइस GPS
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Staff Selector & Month Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Staff Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              कर्मचारी चुनें:
            </span>
            {salariedStaff.map((employee) => {
              const isSelected = employee.id === selectedStaffId;
              const isTrainer = employee.role === 'trainer' || employee.staffType === 'instructor';

              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedStaffId(employee.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? isTrainer
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {isTrainer ? (
                    <Award className="w-3.5 h-3.5" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5" />
                  )}
                  <span>{employee.name}</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    ({isTrainer ? 'Trainer' : 'Staff'})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 shadow-sm cursor-pointer"
              title="पिछला माह"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-xs text-slate-900 min-w-[120px] text-center">
                {currentMonthLabel}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 shadow-sm cursor-pointer"
              title="अगला माह"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="text-xs font-bold px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              वर्तमान माह
            </button>
          </div>
        </div>
      </div>

      {/* Selected Month Attendance KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Present Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">उपस्थित (Present)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats.presentCount} दिन
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            ड्यूटी पूर्ण सत्यापित
          </span>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">अनुपस्थित (Absent)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {stats.absentCount} दिन
          </div>
          <span className="text-[10px] text-rose-700 font-semibold">
            बिना सूचना अनुपस्थिति
          </span>
        </div>

        {/* Leaves */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">स्वीकृत अवकाश (Leave)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {stats.leaveCount} दिन
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">
            स्वीकृत मेडिकल / कैजुअल
          </span>
        </div>

        {/* Holidays / Weekly Off */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">साप्ताहिक ऑफ (Sunday)</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {stats.holidayCount} दिन
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">
            साप्ताहिक अवकाश
          </span>
        </div>

        {/* Total Working Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">कुल कार्य दिवस</span>
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.totalWorkingDays} दिन
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">
            {currentMonthLabel} में
          </span>
        </div>

        {/* Compliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase">उपस्थिति दर %</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {stats.compliancePercent}%
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold">
            {stats.compliancePercent >= 90 ? 'उत्कृष्ट उपस्थिति' : 'संतोषजनक'}
          </span>
        </div>
      </div>

      {/* Main Interactive Monthly Attendance Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              {selectedEmployee?.name} - {currentMonthLabel} उपस्थिति कैलेंडर (Daily Grid)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              किसी भी तारीख पर क्लिक करके स्थिति (Present / Absent / Leave) बदलें व नोट जोड़ें
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              P = Present (उपस्थित)
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              A = Absent (अनुपस्थित)
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              L = Leave (अवकाश)
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              OFF = साप्ताहिक ऑफ
            </span>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Headers */}
          {WEEKDAY_NAMES.map((wd, idx) => (
            <div
              key={wd}
              className={`py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg ${
                idx === 6
                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                  : 'bg-slate-50 text-slate-600 border border-slate-100'
              }`}
            >
              {wd}
            </div>
          ))}

          {/* Calendar Cells */}
          {calendarGrid.map((item: any) => {
            if (item.type === 'empty') {
              return (
                <div
                  key={item.key}
                  className="min-h-[90px] rounded-xl bg-slate-50/40 border border-slate-100 p-2"
                />
              );
            }

            const record: StaffDailyAttendance | undefined = item.record;
            const isSunday = item.isSunday;

            let badgeClass = 'bg-slate-50 border-slate-200 text-slate-400';
            let badgeText = '—';
            let statusLabel = 'दर्ज नहीं';

            if (record) {
              if (record.status === 'present') {
                badgeClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                badgeText = 'P';
                statusLabel = 'उपस्थित';
              } else if (record.status === 'absent') {
                badgeClass = 'bg-rose-50 border-rose-300 text-rose-800 font-bold';
                badgeText = 'A';
                statusLabel = 'अनुपस्थित';
              } else if (record.status === 'leave') {
                badgeClass = 'bg-amber-50 border-amber-300 text-amber-800 font-bold';
                badgeText = 'L';
                statusLabel = record.leaveReason || 'अवकाश';
              } else if (record.status === 'holiday') {
                badgeClass = 'bg-slate-100 border-slate-300 text-slate-600 font-bold';
                badgeText = 'OFF';
                statusLabel = 'वीकली ऑफ';
              }
            } else if (isSunday) {
              badgeClass = 'bg-slate-100 border-slate-200 text-slate-500 font-bold';
              badgeText = 'OFF';
              statusLabel = 'रविवार ऑफ';
            }

            return (
              <div
                key={item.dateStr}
                onClick={() => handleDayClick(item)}
                className={`min-h-[95px] p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                  record?.status === 'present'
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400'
                    : record?.status === 'absent'
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400'
                    : record?.status === 'leave'
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                    : isSunday
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top: Day number & Badge */}
                <div className="flex justify-between items-start">
                  <span
                    className={`font-black text-sm ${
                      isSunday ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {item.dayNum}
                  </span>

                  <span
                    className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center border shadow-xs ${badgeClass}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Bottom: Info & Timing */}
                <div className="space-y-0.5 mt-1">
                  <div className="text-[11px] font-bold text-slate-700 truncate">
                    {statusLabel}
                  </div>

                  {record?.status === 'present' && record.checkInTime && (
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      <span>{record.checkInTime}</span>
                    </div>
                  )}

                  {record?.status === 'present' && record.distanceMeters !== undefined && (
                    <div className="text-[9px] text-emerald-700 font-mono truncate">
                      📍 {record.distanceMeters}m In-Radius
                    </div>
                  )}

                  {record?.status === 'leave' && record.leaveReason && (
                    <div className="text-[9px] text-amber-800 font-semibold truncate">
                      {record.leaveReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Day Attendance Modal */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  दैनिक उपस्थिति संशोधन • Daily Attendance
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  तारीख: {editingDay.dateStr}
                </h3>
                <p className="text-xs text-slate-500">
                  कर्मचारी: <strong className="text-slate-800">{selectedEmployee?.name}</strong> ({selectedEmployee?.designation})
                </p>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDayStatus} className="space-y-4">
              {/* Status Radio / Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  उपस्थिति स्थिति चुनें (Select Status):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('present')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Present (उपस्थित)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('absent')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editStatus === 'absent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Absent (अनुपस्थित)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('leave')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editStatus === 'leave'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Leave (अवकाश)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('holiday')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editStatus === 'holiday'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Weekly Off (ऑफ)
                  </button>
                </div>
              </div>

              {/* Leave Reason input (if leave selected) */}
              {editStatus === 'leave' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    अवकाश का कारण (Leave Reason):
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. बुखार, आकस्मिक कार्य, व्यक्तिगत अवकाश"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              )}

              {/* Notes input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  एडमिन टिप्पणी / नोट (Admin Note):
                </label>
                <input
                  type="text"
                  placeholder="उदा. एडमिन द्वारा सत्यापित"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  स्थिति सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
