"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { BudgetSummary } from '@/types/vendor.types';

interface Props {
  data: BudgetSummary['by_category'];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs">
        <p className="font-bold text-[#1A1A1A] mb-2">{label}</p>
        <p className="text-gray-500">
          Estimasi/Aktual: <span className="font-bold text-[#1A1A1A]">Rp {payload[0].value.toLocaleString('id-ID')}</span>
        </p>
        <p className="text-green-600 mt-1">
          Telah Dibayar: <span className="font-bold">Rp {payload[1].value.toLocaleString('id-ID')}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BudgetBreakdownChart({ data }: Props) {
  // Sort by highest total cost
  const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 10); // Show top 10 categories

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 10, fill: '#666' }}
            tickFormatter={(val) => val.length > 8 ? val.substring(0, 8) + '...' : val}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#666' }}
            tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}M`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9f9f9' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="total" name="Total Biaya" fill="#E5E7EB" radius={[4, 4, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#E5E7EB' : '#E5E7EB'} />
            ))}
          </Bar>
          <Bar dataKey="paid" name="Terbayar" fill="#16A34A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
