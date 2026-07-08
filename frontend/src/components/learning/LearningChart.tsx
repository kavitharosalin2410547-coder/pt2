import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../../types/learning';
import { DashboardCard } from '../common/DashboardCard';

const colors = ['#4f46e5', '#2563eb', '#10b981', '#0f172a', '#06b6d4', '#f59e0b'];

type LearningChartProps = {
  title: string;
  data: ChartPoint[];
  type?: 'bar' | 'line' | 'pie';
};

export function LearningChart({ title, data, type = 'bar' }: LearningChartProps) {
  return (
    <DashboardCard title={title}>
      <div className="h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={3}>
                  {data.map((point, index) => (
                    <Cell key={point.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1' }} />
              </PieChart>
            ) : type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1' }} />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
