"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, Target, MessageCircle, Plus, Trash2, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Transaction, SavingGoal } from "@/types/finance";
import { getTransactions, getSavingGoals, getMonthlyChartData, addTransaction, deleteTransaction, addSavingGoal } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toLocaleString("id-ID")}</>;
}

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [chartData, setChartData] = useState<{ bulan: string; Pemasukan: number; Pengeluaran: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showTxModal, setShowTxModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Form states
  const [txForm, setTxForm] = useState({ date: '', amount: '', description: '', type: 'EXPENSE', category: '' });
  const [goalForm, setGoalForm] = useState({ name: '', target_amount: '', current_amount: '', color: '#C8975A' });

  const fetchData = async () => {
    setLoading(true);
    const [txs, g, chart] = await Promise.all([
      getTransactions(),
      getSavingGoals(),
      getMonthlyChartData()
    ]);
    // Sort transactions by date descending
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(txs);
    setGoals(g);
    setChartData(chart);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  // initial balance can be considered part of INCOME if properly logged as such
  const totalAset = totalIncome - totalExpense;

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      date: txForm.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(txForm.amount) || 0,
      description: txForm.description,
      type: txForm.type as 'INCOME' | 'EXPENSE',
      category: txForm.category,
      notes: ''
    });
    setShowTxModal(false);
    fetchData();
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSavingGoal({
      name: goalForm.name,
      target_amount: parseFloat(goalForm.target_amount) || 0,
      current_amount: parseFloat(goalForm.current_amount) || 0,
      color: goalForm.color,
      deadline: '',
      notes: ''
    });
    setShowGoalModal(false);
    fetchData();
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteTransaction(id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C2185B]" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Title */}
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">
            💰 Keuangan Keluarga
          </h1>
          <p className="text-[#212121]/60 mt-1">Dashboard keuangan rumah tangga</p>
        </div>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        variants={item}
        className="relative overflow-hidden bg-gradient-to-br from-[#C2185B] to-[#880E4F] rounded-2xl p-8 text-white shadow-xl shadow-[#C2185B]/20"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/70" />
            <span className="text-sm font-medium text-white/70">Total Aset Keluarga</span>
          </div>
          <p className="text-4xl md:text-5xl font-bold mb-2">
            Rp <AnimatedNumber value={totalAset} />
          </p>
          <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-full px-3 py-1 w-fit">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-sm text-white/80">
              {totalAset >= 0 ? "Surplus Keuangan" : "Defisit Keuangan"}
            </span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[60px] w-[120px] h-[120px] rounded-full bg-white/5" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]"
        >
          <h3 className="font-serif text-lg font-bold text-[#212121] mb-6">Income vs Expenses</h3>
          <div className="w-full h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#999" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#999" }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}JT`} />
                  <Tooltip
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, undefined]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  />
                  <Legend />
                  <Bar dataKey="Pemasukan" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#E91E63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Belum ada data transaksi</div>
            )}
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C2185B]" />
              <h3 className="font-serif text-lg font-bold text-[#212121]">Savings Goals</h3>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setShowGoalModal(true)} className="w-8 h-8 rounded-full bg-[#C2185B]/10 text-[#C2185B] hover:bg-[#C2185B]/20">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada goals.</p>
            ) : goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
              return (
                <div key={goal.goal_id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#212121]">{goal.name}</span>
                    <span className="text-xs text-[#212121]/50">
                      Rp {goal.current_amount.toLocaleString("id-ID")} / Rp {goal.target_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#FFF8E1] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color || '#C2185B' }}
                    />
                  </div>
                  <p className="text-right text-xs font-semibold mt-1" style={{ color: goal.color || '#C2185B' }}>
                    {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-lg font-bold text-[#212121]">Transaksi Terakhir</h3>
          <Button onClick={() => setShowTxModal(true)} className="rounded-full bg-[#C2185B] hover:bg-[#880E4F] text-white h-9 px-4">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.tx_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {tx.type === 'INCOME' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {tx.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}Rp {tx.amount.toLocaleString("id-ID")}
                </p>
                <button onClick={() => handleDeleteTx(tx.tx_id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-center text-sm text-gray-400 py-4">Belum ada transaksi</p>}
        </div>
      </motion.div>

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 font-serif text-[#C2185B]">Tambah Transaksi</h2>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tipe Transaksi</label>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => setTxForm({...txForm, type: 'INCOME'})} className={`flex-1 ${txForm.type === 'INCOME' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Pemasukan</Button>
                  <Button type="button" onClick={() => setTxForm({...txForm, type: 'EXPENSE'})} className={`flex-1 ${txForm.type === 'EXPENSE' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Pengeluaran</Button>
                </div>
              </div>
              <Input placeholder="Deskripsi (Mis: Gaji, Belanja)" required value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
              <Input type="number" placeholder="Nominal (Rp)" required value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
              <Input placeholder="Kategori (Mis: Food, Savings)" required value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} />
              <Input type="date" required value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setShowTxModal(false)} variant="outline" className="flex-1 rounded-full">Batal</Button>
                <Button type="submit" className="flex-1 rounded-full bg-[#C2185B] hover:bg-[#880E4F] text-white">Simpan</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 font-serif text-[#C2185B]">Tambah Savings Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <Input placeholder="Nama Goal (Mis: DP Rumah)" required value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} />
              <Input type="number" placeholder="Target Dana (Rp)" required value={goalForm.target_amount} onChange={e => setGoalForm({...goalForm, target_amount: e.target.value})} />
              <Input type="number" placeholder="Dana Terkumpul Saat Ini (Rp)" required value={goalForm.current_amount} onChange={e => setGoalForm({...goalForm, current_amount: e.target.value})} />
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Warna Label</label>
                <Input type="color" className="h-10 w-full" value={goalForm.color} onChange={e => setGoalForm({...goalForm, color: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setShowGoalModal(false)} variant="outline" className="flex-1 rounded-full">Batal</Button>
                <Button type="submit" className="flex-1 rounded-full bg-[#C2185B] hover:bg-[#880E4F] text-white">Simpan</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
