import React, { useState, useRef } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { Member, BodyPhotoLog } from '../../types';
import {
  Camera,
  Upload,
  Calendar,
  Scale,
  Sparkles,
  CheckCircle2,
  Trash2,
  Layers,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Eye,
  Columns,
} from 'lucide-react';

interface BodyPhotoTrackerProps {
  member: Member;
  canEdit?: boolean;
  isCompact?: boolean;
}

type PhotoSide = 'front' | 'back' | 'left' | 'right';

export const BodyPhotoTracker: React.FC<BodyPhotoTrackerProps> = ({ member, canEdit = true, isCompact = false }) => {
  const { getBodyPhotoLogs, saveBodyPhotoLog, deleteBodyPhotoLog } = useGymData();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'compare' | 'upload' | 'history'>('compare');

  // Comparison state
  const logs = getBodyPhotoLogs(member.id);
  const [beforeLogId, setBeforeLogId] = useState<string>(logs.length > 0 ? logs[0].id : '');
  const [afterLogId, setAfterLogId] = useState<string>(logs.length > 1 ? logs[logs.length - 1].id : logs[0]?.id || '');
  const [activeSide, setActiveSide] = useState<PhotoSide | 'all'>('front');
  const [compareMode, setCompareMode] = useState<'split' | 'slider'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage

  // Upload Form State
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploadWeight, setUploadWeight] = useState<number>(member.weightKg || 72);
  const [uploadNotes, setUploadNotes] = useState<string>('');
  const [frontImg, setFrontImg] = useState<string>('');
  const [backImg, setBackImg] = useState<string>('');
  const [leftImg, setLeftImg] = useState<string>('');
  const [rightImg, setRightImg] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  // File input refs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  // Before & After objects
  const beforeLog = logs.find((l) => l.id === beforeLogId) || logs[0];
  const afterLog = logs.find((l) => l.id === afterLogId) || logs[logs.length - 1] || logs[0];

  // Helper for reading file as Data URL
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('फोटो का साइज 10MB से कम होना चाहिए।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setter(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new photo log
  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImg && !backImg && !leftImg && !rightImg) {
      alert('कृपया कम से कम एक कोण (सामने, पीछे, बायां या दायां) की फोटो चुनें।');
      return;
    }

    const newLog = saveBodyPhotoLog({
      memberId: member.id,
      date: uploadDate,
      weightKg: Number(uploadWeight),
      notes: uploadNotes.trim() || '4-साइड बॉडी फोटो चेकपॉइंट।',
      frontPhotoUrl: frontImg || undefined,
      backPhotoUrl: backImg || undefined,
      leftPhotoUrl: leftImg || undefined,
      rightPhotoUrl: rightImg || undefined,
    });

    setSaveSuccess('4-साइड बॉडी फोटो चेकपॉइंट सफलतापूर्वक सुरक्षित हुआ! 🔥');
    setAfterLogId(newLog.id);
    setActiveTab('compare');
    setTimeout(() => setSaveSuccess(''), 4000);

    // Reset upload form
    setFrontImg('');
    setBackImg('');
    setLeftImg('');
    setRightImg('');
    setUploadNotes('');
  };

  // Calculate Days difference
  const getDaysDiff = (d1Str?: string, d2Str?: string): number => {
    if (!d1Str || !d2Str) return 0;
    const t1 = new Date(d1Str).getTime();
    const t2 = new Date(d2Str).getTime();
    return Math.max(0, Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24)));
  };

  // Calculate Weight difference
  const weightDiff =
    beforeLog?.weightKg && afterLog?.weightKg
      ? Math.round((afterLog.weightKg - beforeLog.weightKg) * 10) / 10
      : 0;

  const daysBetween = getDaysDiff(beforeLog?.date, afterLog?.date);

  // Get photo for side
  const getPhotoUrl = (log?: BodyPhotoLog, side?: PhotoSide): string => {
    if (!log || !side) return '';
    if (side === 'front') return log.frontPhotoUrl || '';
    if (side === 'back') return log.backPhotoUrl || '';
    if (side === 'left') return log.leftPhotoUrl || '';
    if (side === 'right') return log.rightPhotoUrl || '';
    return '';
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & View Tabs */}
      <div className={`bg-white border border-slate-200 rounded-2xl ${isCompact ? 'p-3.5' : 'p-4'} shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-1.5 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-0.5">
            <Camera className="w-4 h-4 text-cyan-600" />
            4-Side Body Photo & Progress Tracker
          </div>
          <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-black text-slate-900 uppercase tracking-wide`}>
            शारीरिक बदलाव: 4-साइड फोटो
          </h3>
          {!isCompact && (
            <p className="text-xs text-slate-500">
              सामने, पीछे, दाएं व बाएं 4 कोणों के फोटो अपलोड करें और विभिन्न तारीखों में अंतर देखें।
            </p>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-cyan-600" />
            तुलना (Compare)
          </button>

          {canEdit && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              + नई फोटो अपलोड
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            इतिहास ({logs.length})
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {saveSuccess}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 1: COMPARISON VIEW (तुलना) */}
      {/* =============================================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          {/* Controls Bar: Checkpoint Selectors & Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
              {/* Checkpoint 1 (Before) */}
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    पहले की तारीख (Before Date)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-800">
                    {beforeLog?.weightKg} kg
                  </span>
                </div>
                <select
                  value={beforeLogId}
                  onChange={(e) => setBeforeLogId(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {logs.map((log) => (
                    <option key={log.id} value={log.id}>
                      {log.date} • {log.weightKg ? `${log.weightKg} kg` : ''} • {log.notes?.slice(0, 30)}
                    </option>
                  ))}
                </select>
                {beforeLog?.notes && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">
                    "{beforeLog.notes}"
                  </p>
                )}
              </div>

              {/* Checkpoint 2 (After) */}
              <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-900 uppercase flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    बाद की / वर्तमान तारीख (After Date)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-cyan-800">
                    {afterLog?.weightKg} kg
                  </span>
                </div>
                <select
                  value={afterLogId}
                  onChange={(e) => setAfterLogId(e.target.value)}
                  className="w-full bg-white border border-cyan-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {logs.map((log) => (
                    <option key={log.id} value={log.id}>
                      {log.date} • {log.weightKg ? `${log.weightKg} kg` : ''} • {log.notes?.slice(0, 30)}
                    </option>
                  ))}
                </select>
                {afterLog?.notes && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">
                    "{afterLog.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Delta Summary Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                  समय अंतराल: <strong className="text-slate-900">{daysBetween} दिन (Days)</strong>
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    weightDiff < 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : weightDiff > 0
                      ? 'bg-cyan-100 text-cyan-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  वजन में बदलाव:{' '}
                  <strong>
                    {weightDiff < 0 ? `${weightDiff} kg (फैट लॉस)` : weightDiff > 0 ? `+${weightDiff} kg (मसल गेन)` : '0 kg'}
                  </strong>
                </span>
              </div>

              {/* View Mode Toggle: Split vs Slider */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setCompareMode('split')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    compareMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  बराबर में (Side-by-Side)
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('slider')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    compareMode === 'slider' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  स्लाइडर (Interactive)
                </button>
              </div>
            </div>

            {/* Angle Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'front' as PhotoSide, label: '🧍 सामने (Front)' },
                { id: 'back' as PhotoSide, label: '🔄 पीछे (Back)' },
                { id: 'left' as PhotoSide, label: '⬅️ बाईं तरफ (Left Side)' },
                { id: 'right' as PhotoSide, label: '➡️ दाईं तरफ (Right Side)' },
                { id: 'all' as const, label: '🔲 चारों कोण (All 4 Sides)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSide(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSide === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Visual Comparison Display */}
          {activeSide !== 'all' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              {compareMode === 'split' ? (
                /* SPLIT VIEW (Side-by-Side or Stacked on Mobile) */
                <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                  {/* Before Photo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-bold text-amber-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        BEFORE: {beforeLog?.date}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">{beforeLog?.weightKg} kg</span>
                    </div>
                    <div className="relative aspect-[3/4] max-h-[440px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                      {getPhotoUrl(beforeLog, activeSide as PhotoSide) ? (
                        <img
                          src={getPhotoUrl(beforeLog, activeSide as PhotoSide)}
                          alt="Before view"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-500 text-xs">
                          <Camera className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          इस तारीख के लिए फोटो उपलब्ध नहीं है
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-600/90 text-white font-black text-[11px] shadow-sm uppercase">
                        Before • {activeSide}
                      </span>
                    </div>
                  </div>

                  {/* After Photo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-bold text-cyan-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        AFTER: {afterLog?.date}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">{afterLog?.weightKg} kg</span>
                    </div>
                    <div className="relative aspect-[3/4] max-h-[440px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                      {getPhotoUrl(afterLog, activeSide as PhotoSide) ? (
                        <img
                          src={getPhotoUrl(afterLog, activeSide as PhotoSide)}
                          alt="After view"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-500 text-xs">
                          <Camera className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          इस तारीख के लिए फोटो उपलब्ध नहीं है
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white font-black text-[11px] shadow-sm uppercase">
                        After • {activeSide}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE SLIDER VIEW */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="font-bold text-amber-700">← Before ({beforeLog?.date})</span>
                    <span className="text-[11px] text-slate-500">स्लाइडर को बाएं-दाएं खींचकर अंतर देखें</span>
                    <span className="font-bold text-cyan-700">After ({afterLog?.date}) →</span>
                  </div>

                  <div className="relative aspect-[3/4] max-h-[480px] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-md select-none">
                    {/* After Image (Background Layer) */}
                    <img
                      src={getPhotoUrl(afterLog, activeSide as PhotoSide)}
                      alt="After view"
                      className="absolute inset-0 w-full h-full object-contain"
                    />

                    {/* Before Image (Clipped Overlay Layer) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={getPhotoUrl(beforeLog, activeSide as PhotoSide)}
                        alt="Before view"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ width: '100%', maxWidth: 'none' }}
                      />
                    </div>

                    {/* Divider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-300">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Range input for touching / dragging */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                    />

                    {/* Corner Labels */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-600/90 text-white font-bold text-[10px] pointer-events-none">
                      Before
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-600/90 text-white font-bold text-[10px] pointer-events-none">
                      After
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ALL 4 SIDES COMPARISON (4-GRID VIEW) */
            <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-3`}>
              {(['front', 'back', 'left', 'right'] as PhotoSide[]).map((side) => {
                let sideName = 'सामने (Front)';
                if (side === 'back') sideName = 'पीछे (Back)';
                if (side === 'left') sideName = 'बाएं (Left)';
                if (side === 'right') sideName = 'दाएं (Right)';

                return (
                  <div key={side} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{sideName}</span>
                      <button
                        type="button"
                        onClick={() => setActiveSide(side)}
                        className="text-[11px] text-cyan-600 hover:underline flex items-center gap-0.5"
                      >
                        बड़ा देखें <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                        <img
                          src={getPhotoUrl(beforeLog, side)}
                          alt={`${side} before`}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-600/90 text-white text-[9px] font-bold">
                          Day 1
                        </span>
                      </div>

                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                        <img
                          src={getPhotoUrl(afterLog, side)}
                          alt={`${side} after`}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold">
                          Now
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: UPLOAD 4-SIDE PHOTOS FORM */}
      {/* =============================================================== */}
      {activeTab === 'upload' && canEdit && (
        <form onSubmit={handleSaveUpload} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-600" />
                नई 4-साइड फोटो चेकपॉइंट अपलोड करें
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                मोबाइल कैमरे या गैलरी से 4 कोणों की फोटो अपलोड करें (Front, Back, Left, Right):
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-full">
              ID: {member.memberCode}
            </span>
          </div>

          {/* Checkpoint Meta Inputs */}
          <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-3`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                फोटो की तारीख (Date) *
              </label>
              <input
                type="date"
                required
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                वर्तमान वजन (Weight kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={uploadWeight}
                onChange={(e) => setUploadWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                नोट्स / स्थिति (Notes)
              </label>
              <input
                type="text"
                placeholder="उदा. 60 दिन बाद, कम फैट, चेस्ट कटिंग..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 4 Photo Upload Slots */}
          <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
            {/* 1. FRONT VIEW */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-between text-center gap-3">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">1. सामने (Front View)</span>
                {frontImg && (
                  <button
                    type="button"
                    onClick={() => setFrontImg('')}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full aspect-[3/4] max-h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                {frontImg ? (
                  <img src={frontImg} alt="Front Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-3 text-slate-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                    सामने खड़े होकर फोटो लें
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={frontInputRef}
                className="hidden"
                onChange={(e) => handleFileChange(e, setFrontImg)}
              />

              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {frontImg ? 'फोटो बदलें' : 'सामने की फोटो चुनें'}
              </button>
            </div>

            {/* 2. BACK VIEW */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-between text-center gap-3">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">2. पीछे (Back View)</span>
                {backImg && (
                  <button
                    type="button"
                    onClick={() => setBackImg('')}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full aspect-[3/4] max-h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                {backImg ? (
                  <img src={backImg} alt="Back Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-3 text-slate-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                    पीठ व लैट्स की फोटो लें
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={backInputRef}
                className="hidden"
                onChange={(e) => handleFileChange(e, setBackImg)}
              />

              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {backImg ? 'फोटो बदलें' : 'पीछे की फोटो चुनें'}
              </button>
            </div>

            {/* 3. LEFT SIDE VIEW */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-between text-center gap-3">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">3. बाईं तरफ (Left Side)</span>
                {leftImg && (
                  <button
                    type="button"
                    onClick={() => setLeftImg('')}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full aspect-[3/4] max-h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                {leftImg ? (
                  <img src={leftImg} alt="Left Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-3 text-slate-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                    बाएं प्रोफाइल का फोटो लें
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={leftInputRef}
                className="hidden"
                onChange={(e) => handleFileChange(e, setLeftImg)}
              />

              <button
                type="button"
                onClick={() => leftInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {leftImg ? 'फोटो बदलें' : 'बाईं तरफ की फोटो चुनें'}
              </button>
            </div>

            {/* 4. RIGHT SIDE VIEW */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-between text-center gap-3">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">4. दाईं तरफ (Right Side)</span>
                {rightImg && (
                  <button
                    type="button"
                    onClick={() => setRightImg('')}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full aspect-[3/4] max-h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                {rightImg ? (
                  <img src={rightImg} alt="Right Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-3 text-slate-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                    दाएं प्रोफाइल का फोटो लें
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={rightInputRef}
                className="hidden"
                onChange={(e) => handleFileChange(e, setRightImg)}
              />

              <button
                type="button"
                onClick={() => rightInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {rightImg ? 'फोटो बदलें' : 'दाईं तरफ की फोटो चुनें'}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              4-साइड फोटो सुरक्षित करें (Save Checkpoint)
            </button>
          </div>
        </form>
      )}

      {/* =============================================================== */}
      {/* TAB 3: TIMELINE HISTORY (इतिहास) */}
      {/* =============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              अभी कोई फोटो चेकपॉइंट रिकॉर्ड नहीं है। + नई फोटो अपलोड पर क्लिक करें।
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      चेकपॉइंट #{idx + 1}: {log.date}
                    </span>
                    {log.weightKg && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono text-[10px]">
                        {log.weightKg} kg
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{log.notes}</p>
                </div>

                {/* Thumbnails of 4 Sides */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'Front', url: log.frontPhotoUrl },
                    { label: 'Back', url: log.backPhotoUrl },
                    { label: 'Left', url: log.leftPhotoUrl },
                    { label: 'Right', url: log.rightPhotoUrl },
                  ].map((thumb, tIdx) => (
                    <div
                      key={tIdx}
                      className="w-12 h-16 rounded-lg bg-slate-950 overflow-hidden border border-slate-200 relative shrink-0"
                      title={`${thumb.label} View`}
                    >
                      {thumb.url ? (
                        <img src={thumb.url} alt={thumb.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                          -
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-bold">
                        {thumb.label[0]}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAfterLogId(log.id);
                        setActiveTab('compare');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-all"
                    >
                      तुलना करें
                    </button>

                    {canEdit && logs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('क्या आप इस फोटो चेकपॉइंट को हटाना चाहते हैं?')) {
                            deleteBodyPhotoLog(log.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
