import React, { useState } from 'react';
import { localDb } from '../../db/localDatabase';
import { useGymData } from '../../context/GymDataContext';
import {
  Database,
  Table,
  FileCode,
  Download,
  Link2,
  Code,
} from 'lucide-react';

export const DatabaseInspector: React.FC = () => {
  const { exportSqlDump, exportJsonDump } = useGymData();
  const [activeTable, setActiveTable] = useState<'users' | 'member_profiles' | 'memberships' | 'fitness_plans'>('users');
  const [copiedSql, setCopiedSql] = useState(false);

  const users = localDb.getUsers();
  const profiles = localDb.getMemberProfiles();
  const memberships = localDb.getMemberships();
  const plans = localDb.getFitnessPlans();

  const handleDownloadSql = () => {
    const sql = exportSqlDump();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaushik_fitness_kanker_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = exportJsonDump();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaushik_fitness_database_dump.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(exportSqlDump());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              Local Relational Database Engine
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              डेटाबेस स्कीमा व टेबल व्यूअर (Database Inspector)
            </h2>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              कौशिक फिटनेस कांकेर - रिलेशनल डेटाबेस स्कीमा: <code className="text-amber-700 font-bold">users</code>, <code className="text-amber-700 font-bold">member_profiles</code>, <code className="text-amber-700 font-bold">memberships</code>, एवं <code className="text-amber-700 font-bold">fitness_plans</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              PostgreSQL DDL (.sql)
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              JSON Backup
            </button>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-cyan-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <Code className="w-4 h-4" />
              {copiedSql ? 'कॉपी हो गया!' : 'Copy SQL'}
            </button>
          </div>
        </div>
      </div>

      {/* Relational Schema Mapping Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-600" />
          Blueprint Foreign Key Relationships & Data Integrity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-amber-800 mb-1">A. users &rarr; B. member_profiles</div>
            <p className="text-slate-600 text-[11px]">
              <code className="text-slate-900 font-bold">member_profiles.user_id</code> references <code className="text-slate-900 font-bold">users.id</code> (1-to-1). Separates authentication credentials and role from biometric profile stats.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-cyan-800 mb-1">B. member_profiles &rarr; C. memberships</div>
            <p className="text-slate-600 text-[11px]">
              <code className="text-slate-900 font-bold">memberships.member_id</code> references <code className="text-slate-900 font-bold">member_profiles.id</code> (1-to-Many). Manages duration subscriptions, discounts, and real-time expiration countdowns.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-purple-800 mb-1">A. users (Trainer) &rarr; C. memberships</div>
            <p className="text-slate-600 text-[11px]">
              <code className="text-slate-900 font-bold">memberships.trainer_id</code> references <code className="text-slate-900 font-bold">users.id</code> (where role = 'trainer'). Allocates personal training athletes to instructors.
            </p>
          </div>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTable('users')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTable === 'users'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          A. users ({users.length})
        </button>

        <button
          onClick={() => setActiveTable('member_profiles')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTable === 'member_profiles'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          B. member_profiles ({profiles.length})
        </button>

        <button
          onClick={() => setActiveTable('memberships')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTable === 'memberships'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          C. memberships ({memberships.length})
        </button>

        <button
          onClick={() => setActiveTable('fitness_plans')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTable === 'fitness_plans'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          D. fitness_plans ({plans.length})
        </button>
      </div>

      {/* Table Data View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Table 1: USERS */}
        {activeTable === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-3">id (PK)</th>
                  <th className="py-3 px-3">name</th>
                  <th className="py-3 px-3">email (Unique)</th>
                  <th className="py-3 px-3">phone</th>
                  <th className="py-3 px-3">role</th>
                  <th className="py-3 px-3">password_hash</th>
                  <th className="py-3 px-3">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-700">{u.id}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3 text-slate-600">{u.phone}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          u.role === 'admin'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : u.role === 'trainer'
                            ? 'bg-cyan-50 text-cyan-900 border-cyan-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-[120px]">
                      {u.password_hash}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 2: MEMBER_PROFILES */}
        {activeTable === 'member_profiles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-3">id (PK)</th>
                  <th className="py-3 px-3">user_id (FK)</th>
                  <th className="py-3 px-3">member_code</th>
                  <th className="py-3 px-3">age / gender</th>
                  <th className="py-3 px-3">height / weight</th>
                  <th className="py-3 px-3">fitness_goal</th>
                  <th className="py-3 px-3">fitness_level (calc)</th>
                  <th className="py-3 px-3">bmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-700">{p.id}</td>
                    <td className="py-2.5 px-3 text-cyan-700">{p.user_id}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">{p.member_code}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">
                      {p.age}y • {p.gender.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">
                      {p.height}cm / {p.weight}kg
                    </td>
                    <td className="py-2.5 px-3 font-sans text-amber-800 font-semibold capitalize">
                      {p.fitness_goal.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {p.fitness_level} ({p.fitness_score})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-bold">{p.bmi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 3: MEMBERSHIPS */}
        {activeTable === 'memberships' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-3">id (PK)</th>
                  <th className="py-3 px-3">member_id (FK)</th>
                  <th className="py-3 px-3">package_type</th>
                  <th className="py-3 px-3">is_pt</th>
                  <th className="py-3 px-3">trainer_id (FK)</th>
                  <th className="py-3 px-3">total_fee</th>
                  <th className="py-3 px-3">discount</th>
                  <th className="py-3 px-3">paid_fee</th>
                  <th className="py-3 px-3">payment_status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {memberships.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-700">{m.id}</td>
                    <td className="py-2.5 px-3 text-cyan-700">{m.member_id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 capitalize">
                      {m.package_type.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {m.is_personal_training ? (
                        <span className="text-cyan-800 font-bold">True ({m.pt_duration})</span>
                      ) : (
                        <span className="text-slate-400">False</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-purple-700">{m.trainer_id || 'NULL'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">₹{m.total_fee}</td>
                    <td className="py-2.5 px-3 text-emerald-700">₹{m.discount_applied}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">₹{m.final_paid_fee}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          m.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : m.payment_status === 'partial'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {m.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 4: FITNESS_PLANS */}
        {activeTable === 'fitness_plans' && (
          <div className="p-4 space-y-3">
            {plans.map((fp) => (
              <div key={fp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold font-mono text-amber-700 mr-2">{fp.id}</span>
                    <strong className="text-sm text-slate-900 font-sans">{fp.title}</strong>
                    <div className="text-[11px] text-cyan-800 font-mono mt-0.5 font-semibold">
                      goal_type: {fp.goal_type}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                    JSON Structured
                  </span>
                </div>
                <p className="text-slate-600 text-xs font-sans">{fp.description}</p>
                <div className="flex gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span>workout_chart: {fp.workout_chart.length} day split</span>
                  <span>diet_chart: {fp.diet_chart.length} meal schedule</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
