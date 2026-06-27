/**
 * src/pages/Finance.jsx
 * Premium Monthly Salary + Expense Tracker with Chart.js Doughnut + curved Line trend charts.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Title, Filler
} from 'chart.js';
import {
  getSalaryRecords, getSalaryRecord, createSalaryRecord, updateSalaryRecord, deleteSalaryRecord,
  getExpenses, createExpense, deleteExpense,
} from '../api/finance';
import api from '../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const EXPENSE_CATEGORIES = [
  'RENT','FOOD','TRANSPORT','ENTERTAINMENT','SHOPPING',
  'HEALTH','INVESTMENT','EMI','UTILITIES','EDUCATION','OTHER'
];

const CHART_COLORS = [
  '#f97316','#22c55e','#3b82f6','#a855f7','#ec4899',
  '#14b8a6','#eab308','#ef4444','#06b6d4','#84cc16','#6366f1',
];

const MONTH_NAMES = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function fmt(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }

function SalaryForm({ record, latestRecord, onSave, onClose, isSaving }) {
  const [f, setF] = useState(() => {
    if (record) return record;

    if (latestRecord) {
      const getNextMonthStr = (monthStr) => {
        const [y, m, d] = monthStr.split('-').map(Number);
        let newYear = y;
        let newMonth = m + 1;
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
        return `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
      };

      return {
        month: getNextMonthStr(latestRecord.month),
        gross_salary: latestRecord.gross_salary || '',
        net_salary: latestRecord.net_salary || '',
        pf_deduction: latestRecord.pf_deduction || '',
        tax_deducted: latestRecord.tax_deducted || '',
        bonus: '',
        other_income: '',
        notes: '',
      };
    }

    return {
      month: new Date().toISOString().slice(0, 7) + '-01',
      gross_salary: '',
      net_salary: '',
      pf_deduction: '',
      tax_deducted: '',
      bonus: '',
      other_income: '',
      notes: '',
    };
  });

  const h = (e) => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-wealth via-tech to-perf" />
        
        <h2 className="text-xl font-extrabold text-primary mb-4 mt-2">
          {record ? '✏️ Edit Month Details' : '💰 Add Month Details'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <label className="label">Month</label>
            <input name="month" type="date" value={f.month}
              onChange={h} className="input w-full" />
          </div>
          {[
            ['gross_salary','Gross Salary (CTC)'],['net_salary','Net / Take-home'],
            ['pf_deduction','PF Deducted'],['tax_deducted','TDS / Tax'],
            ['bonus','Bonus'],['other_income','Other Income'],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="label">{label} (₹)</label>
              <input name={name} type="number" min="0" value={f[name]}
                onChange={h} className="input w-full" placeholder="0" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea name="notes" rows={2} value={f.notes}
              onChange={h} className="input w-full resize-none font-sans" />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => onSave(f)} disabled={isSaving || !f.net_salary || !f.month}
            className="btn-primary flex-1">
            {isSaving ? 'Saving…' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [yearFilter, setYearFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [expForm,    setExpForm]    = useState({
    date: new Date().toISOString().slice(0,10),
    category:'FOOD', amount:'', description:'', is_recurring:false,
  });

  const { data: records } = useQuery({
    queryKey: ['salary'],
    queryFn:  () => getSalaryRecords().then(r => r.data?.results ?? r.data ?? []),
  });

  const { data: detail } = useQuery({
    queryKey: ['salary-detail', selectedId],
    queryFn:  () => selectedId ? getSalaryRecord(selectedId).then(r => r.data) : null,
    enabled:  !!selectedId,
  });

  const inv = (keys) => keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));

  const saveSalary = useMutation({
    mutationFn: (d) => selectedId && showForm === 'edit'
      ? updateSalaryRecord(selectedId, d)
      : createSalaryRecord(d),
    onSuccess: (res) => {
      inv(['salary']);
      setSelectedId(res.data.id);
      setShowForm(false);
    },
  });

  const deleteRecord = useMutation({
    mutationFn: deleteSalaryRecord,
    onSuccess: () => {
      inv(['salary']);
      setSelectedId(null);
    }
  });

  const addExp = useMutation({
    mutationFn: (d) => createExpense({ ...d, salary_record: selectedId }),
    onSuccess: () => {
      inv(['salary-detail', 'salary']);
      setExpForm(f => ({ ...f, amount:'', description:'' }));
    },
  });

  const delExp = useMutation({
    mutationFn: deleteExpense,
    onSuccess:  () => inv(['salary-detail', 'salary']),
  });

  const list = Array.isArray(records) ? records : [];

  // Year filter options
  const availableYears = Array.from(new Set(list.map(r => r.month.slice(0, 4)))).sort((a,b) => b-a);

  // Filtered lists
  const filteredList = list.filter(r => {
    const recordYear = r.month.slice(0, 4);
    const recordMonth = r.month.slice(5, 7);
    const matchYear = yearFilter === 'ALL' || recordYear === yearFilter;
    const matchMonth = monthFilter === 'ALL' || recordMonth === monthFilter;
    return matchYear && matchMonth;
  });

  // Chart data using filtered records chronological trend
  const trendRecords = [...filteredList].reverse();
  const lineData = trendRecords.length ? {
    labels: trendRecords.map(t => t.month_display || t.month),
    datasets: [
      {
        label: 'Net Salary',
        data: trendRecords.map(t => t.net_salary),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: trendRecords.map(t => t.total_expenses),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Savings',
        data: trendRecords.map(t => t.savings),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { family: 'Inter', size: 11, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      y: {
        ticks: { 
          color: '#94a3b8', 
          font: { family: 'Inter', size: 10 },
          callback: (value) => '₹' + Number(value).toLocaleString('en-IN')
        },
        grid: { color: 'rgba(255, 255, 255, 0.02)' },
      },
    },
  };

  const doughnutData = detail?.expense_by_category && Object.keys(detail.expense_by_category).length ? {
    labels: Object.keys(detail.expense_by_category),
    datasets: [{
      data:            Object.values(detail.expense_by_category),
      backgroundColor: CHART_COLORS.slice(0, Object.keys(detail.expense_by_category).length),
      borderWidth: 0,
    }],
  } : null;

  const handleDeleteRecord = () => {
    if (confirm(`Delete the salary record for ${detail?.month_display}? This will also delete all associated expenses.`)) {
      deleteRecord.mutate(detail.id);
    }
  };

  const latestRecord = list.length > 0 ? list[0] : null;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <span>💰</span> Finance Tracker
          </h1>
          <p className="text-secondary text-sm mt-1">Monthly salary, expenses and savings.</p>
        </div>
        <button onClick={() => setShowForm('new')} className="btn-primary w-full sm:w-auto">+ Add Month</button>
      </div>

      {/* Salary Record Modal Form */}
      {showForm && (
        <SalaryForm
          record={showForm === 'edit' ? detail : null}
          latestRecord={showForm === 'new' ? latestRecord : null}
          onSave={(d) => saveSalary.mutate(d)}
          onClose={() => setShowForm(false)}
          isSaving={saveSalary.isPending}
        />
      )}

      {/* Year & Month Filters */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
          <span>🗓️</span> Filters
        </span>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input py-1.5 px-3 text-xs w-full sm:w-28"
            >
              <option value="ALL">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Month:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input py-1.5 px-3 text-xs w-full sm:w-28"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {(yearFilter !== 'ALL' || monthFilter !== 'ALL') && (
            <button
              onClick={() => { setYearFilter('ALL'); setMonthFilter('ALL'); }}
              className="px-2.5 py-1 text-xs text-tech hover:text-tech-light font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Month list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredList.map(r => (
          <button key={r.id} onClick={() => setSelectedId(r.id)}
            className={`glass-card p-4 text-left transition-all hover:-translate-y-0.5 border border-white/[0.05]
              ${selectedId === r.id ? 'ring-1 ring-wealth/50 bg-wealth/[0.02] border-transparent' : ''}`}>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wide">{r.month_display}</p>
            <p className="font-extrabold text-primary text-base mt-1.5">{fmt(r.net_salary)}</p>
            <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${Number(r.savings) >= 0 ? 'text-wealth' : 'text-red-400'}`}>
              <span>{Number(r.savings) >= 0 ? '↑' : '↓'}</span> {fmt(Math.abs(r.savings))} saved
            </p>
          </button>
        ))}
        {filteredList.length === 0 && (
          <div className="col-span-full glass-card text-center py-12 text-muted text-sm border border-dashed border-white/10">
            No salary records match the selected filters.
          </div>
        )}
      </div>

      {/* Detail view */}
      {detail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Summary cards */}
          <div className="space-y-4">
            <div className="glass-card card-wealth p-5 border border-white/[0.05] relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.05]">
                  <p className="font-extrabold text-primary text-base tracking-wide flex items-center gap-2">
                    <span>Summary</span> · <span className="text-wealth">{detail.month_display}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowForm('edit')} 
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-secondary hover:text-primary border border-white/[0.04] transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={handleDeleteRecord} 
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-bold border border-red-500/20 transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    ['Gross Salary', detail.gross_salary, 'text-primary'],
                    ['Net / Take-home', detail.net_salary, 'text-wealth'],
                    ['Total Expenses', detail.total_expenses, 'text-perf'],
                    ['Savings', detail.savings, detail.savings >= 0 ? 'text-wealth' : 'text-red-400'],
                    ['PF Deducted', detail.pf_deduction, 'text-muted'],
                    ['Tax (TDS)', detail.tax_deducted, 'text-muted'],
                    ['Bonus', detail.bonus, 'text-tech'],
                    ['Savings Rate', `${detail.savings_rate}%`, detail.savings_rate >= 20 ? 'text-wealth' : 'text-perf'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                      <p className="label">{label}</p>
                      <p className={`font-extrabold text-sm ${cls}`}>{typeof val === 'number' || !isNaN(val) ? fmt(val) : val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {detail.notes && (
                <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="label">Notes</p>
                  <p className="text-xs text-secondary whitespace-pre-wrap leading-relaxed">{detail.notes}</p>
                </div>
              )}
            </div>

            {/* Doughnut chart */}
            {doughnutData && (
              <div className="glass-card p-5 border border-white/[0.05]">
                <p className="label mb-4">Expense Breakdown</p>
                <div className="h-52">
                  <Doughnut data={doughnutData}
                    options={{ plugins:{ legend:{ position:'right', labels:{ color:'#9ca3af', font:{ family:'Inter', size:11, weight:'500' } } } }, maintainAspectRatio:false }} />
                </div>
              </div>
            )}
          </div>

          {/* Expense list + add form */}
          <div className="space-y-4">
            {/* Add expense form */}
            <div className="glass-card p-5 border border-white/[0.05]">
              <p className="label mb-4">Add Expense</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={expForm.date}
                    onChange={e => setExpForm(f=>({...f,date:e.target.value}))} className="input w-full" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={expForm.category}
                    onChange={e => setExpForm(f=>({...f,category:e.target.value}))} className="input w-full select-none">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input type="number" min="1" value={expForm.amount}
                    onChange={e => setExpForm(f=>({...f,amount:e.target.value}))} className="input w-full" placeholder="500" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input type="text" value={expForm.description}
                    onChange={e => setExpForm(f=>({...f,description:e.target.value}))} className="input w-full" placeholder="Zomato order" />
                </div>
              </div>
              <div className="flex items-center justify-between mb-4 p-2 bg-white/[0.01] rounded-lg border border-white/[0.02]">
                <span className="text-xs text-secondary">Recurring monthly expense</span>
                <button
                  type="button"
                  onClick={() => setExpForm(f=>({...f,is_recurring:!f.is_recurring}))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
                    ${expForm.is_recurring ? 'bg-tech' : 'bg-white/10'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200
                      ${expForm.is_recurring ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
              <button onClick={() => addExp.mutate(expForm)}
                disabled={addExp.isPending || !expForm.amount || !selectedId}
                className="btn-primary w-full">
                {addExp.isPending ? 'Adding…' : 'Add Expense'}
              </button>
            </div>

            {/* Expense list */}
            <div className="glass-card p-5 border border-white/[0.05] max-h-80 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.05]">
                <p className="label mb-0">Expenses</p>
                <span className="text-[10px] text-muted font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.05]">
                  {detail.expenses?.length ?? 0} LOGGED
                </span>
              </div>
              {(detail.expenses || []).length === 0 && (
                <p className="text-muted text-sm text-center py-8">No expenses logged yet.</p>
              )}
              <div className="space-y-2">
                {(detail.expenses || []).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between gap-3
                    py-2.5 border-b border-white/[0.03] group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-semibold truncate">
                        {exp.description || exp.category_display}
                        {exp.is_recurring && <span className="ml-1 text-[10px] text-tech font-bold" title="Recurring">↻</span>}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5 font-medium">{exp.category_display} · {exp.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-perf whitespace-nowrap">{fmt(exp.amount)}</span>
                      <button onClick={() => { if(confirm('Delete expense?')) delExp.mutate(exp.id); }}
                        className="text-red-400 hover:text-red-300 font-extrabold text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Trend curved Line Chart */}
      {lineData && (
        <div className="glass-card p-6 border border-white/[0.05]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.05]">
            <p className="label mb-0">Progression Trend</p>
            <span className="text-[10px] text-muted font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/[0.05]">
              {trendRecords.length} MONTHS DISPLAYED
            </span>
          </div>
          <div className="h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
